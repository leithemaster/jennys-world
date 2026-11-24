// The tiny planet: ground sphere, roads, sky dome, painted clouds,
// and helpers to stand things up on the curved surface.
import * as THREE from 'three';
import { PALETTE, mesh, toon } from '../toon.js';

export const R = 34; // planet radius

const UP = new THREE.Vector3(0, 1, 0);

// Unit direction from latitude/longitude in degrees (lat 0 = equator).
export function dirFrom(lat, lon) {
  const la = THREE.MathUtils.degToRad(lat);
  const lo = THREE.MathUtils.degToRad(lon);
  return new THREE.Vector3(Math.cos(la) * Math.sin(lo), Math.sin(la), Math.cos(la) * Math.cos(lo)).normalize();
}

// Orientation whose local +Y is the surface normal at (lat, lon),
// local +X points east and local +Z points south; then yawed about +Y.
export function frameQuat(lat, lon, yawDeg = 0) {
  const lo = THREE.MathUtils.degToRad(lon);
  const up = dirFrom(lat, lon);
  const east = new THREE.Vector3(Math.cos(lo), 0, -Math.sin(lo)).normalize();
  const south = new THREE.Vector3().crossVectors(east, up).normalize();
  const m = new THREE.Matrix4().makeBasis(east, up, south);
  const q = new THREE.Quaternion().setFromRotationMatrix(m);
  q.multiply(new THREE.Quaternion().setFromAxisAngle(UP, THREE.MathUtils.degToRad(yawDeg)));
  return q;
}

// Returns a pivot (at planet centre) and an anchor group standing on the
// surface at (lat, lon). Yaw 0 faces south (+Z), 180 faces north.
export function placeAt(parent, lat, lon, yawDeg = 0, lift = 0) {
  const pivot = new THREE.Object3D();
  pivot.quaternion.copy(frameQuat(lat, lon, yawDeg));
  const anchor = new THREE.Group();
  anchor.position.y = R + lift;
  pivot.add(anchor);
  parent.add(pivot);
  return { pivot, anchor, dir: dirFrom(lat, lon) };
}

function skyDome() {
  const geo = new THREE.SphereGeometry(400, 32, 16);
  const mat = new THREE.ShaderMaterial({
    side: THREE.BackSide,
    depthWrite: false,
    uniforms: {
      top: { value: new THREE.Color(PALETTE.sky) },
      bottom: { value: new THREE.Color('#9fd1c8') },
    },
    vertexShader: `varying vec3 vP; void main(){ vP = normalize(position); gl_Position = projectionMatrix*modelViewMatrix*vec4(position,1.0);} `,
    fragmentShader: `uniform vec3 top; uniform vec3 bottom; varying vec3 vP;
      void main(){ float t = smoothstep(-0.4, 0.8, vP.y); gl_FragColor = vec4(mix(bottom, top, t), 1.0);} `,
  });
  const m = new THREE.Mesh(geo, mat);
  m.renderOrder = -10;
  return m;
}

// Irregular, painted-looking cloud blob drawn on a canvas.
function cloudTexture(seed) {
  const c = document.createElement('canvas');
  c.width = 256; c.height = 128;
  const ctx = c.getContext('2d');
  let s = seed;
  const rnd = () => (s = (s * 9301 + 49297) % 233280) / 233280;
  ctx.fillStyle = 'rgba(214, 240, 233, 0.9)';
  for (let i = 0; i < 9; i++) {
    ctx.beginPath();
    const x = 40 + rnd() * 176, y = 50 + rnd() * 40, r = 18 + rnd() * 26;
    ctx.ellipse(x, y, r * 1.5, r, 0, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.fillStyle = 'rgba(160, 205, 198, 0.9)';
  ctx.globalCompositeOperation = 'source-atop';
  ctx.fillRect(0, 88, 256, 40);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

function ring(radius, latCenterDeg, widthDeg, color, segments = 128) {
  const half = THREE.MathUtils.degToRad(widthDeg / 2);
  const center = Math.PI / 2 - THREE.MathUtils.degToRad(latCenterDeg);
  const g = new THREE.SphereGeometry(radius, segments, 2, 0, Math.PI * 2, center - half, half * 2);
  return new THREE.Mesh(g, toon(color));
}

export function buildPlanet(scene) {
  const world = new THREE.Group();
  scene.add(world);
  scene.add(skyDome());

  // Ground
  const ground = mesh(new THREE.IcosahedronGeometry(R, 24), PALETTE.grass, { outline: 0.15 });
  world.add(ground);

  // Main street around the equator + a cross street over the poles.
  const roads = new THREE.Group();
  roads.add(ring(R + 0.03, 0, 9, PALETTE.asphalt));
  roads.add(ring(R + 0.05, 5.6, 2.2, PALETTE.sidewalk));
  roads.add(ring(R + 0.05, -5.6, 2.2, PALETTE.sidewalk));
  const cross = new THREE.Group();
  cross.add(ring(R + 0.025, 0, 7, PALETTE.asphalt));
  cross.rotation.z = Math.PI / 2;
  roads.add(cross);
  world.add(roads);

  // Dashed centre line on the main street
  const dashMat = toon(PALETTE.cream);
  for (let lon = 0; lon < 360; lon += 6) {
    if (Math.abs(((lon + 90) % 180) - 90) < 6) continue; // skip crossings
    const { anchor } = placeAt(world, 0, lon, 0, 0.06);
    const d = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.02, 0.18), dashMat);
    anchor.add(d);
  }

  // Grass patches in a darker tone for painterly variation
  for (let i = 0; i < 60; i++) {
    const lat = (Math.random() * 2 - 1) * 80;
    if (Math.abs(lat) < 8) continue;
    const { anchor } = placeAt(world, lat, Math.random() * 360, Math.random() * 360, 0.02);
    const p = new THREE.Mesh(new THREE.CircleGeometry(1 + Math.random() * 2.5, 7), toon(PALETTE.grassDark));
    p.rotation.x = -Math.PI / 2;
    p.scale.y = 0.6 + Math.random() * 0.6;
    anchor.add(p);
  }

  // Painted clouds floating around the planet
  const clouds = new THREE.Group();
  for (let i = 0; i < 26; i++) {
    const mat = new THREE.SpriteMaterial({ map: cloudTexture(i * 77 + 13), transparent: true, depthWrite: false, opacity: 0.85 });
    const s = new THREE.Sprite(mat);
    const d = dirFrom((Math.random() * 2 - 1) * 70, Math.random() * 360);
    s.position.copy(d.multiplyScalar(R + 22 + Math.random() * 30));
    const sc = 14 + Math.random() * 18;
    s.scale.set(sc, sc * 0.5, 1);
    clouds.add(s);
  }
  scene.add(clouds);

  // Floating specks (like dust in the air)
  const specks = new THREE.BufferGeometry();
  const pts = [];
  for (let i = 0; i < 300; i++) {
    const d = dirFrom((Math.random() * 2 - 1) * 90, Math.random() * 360).multiplyScalar(R + 4 + Math.random() * 60);
    pts.push(d.x, d.y, d.z);
  }
  specks.setAttribute('position', new THREE.Float32BufferAttribute(pts, 3));
  const speckPts = new THREE.Points(specks, new THREE.PointsMaterial({ color: '#d9f1ea', size: 0.35, transparent: true, opacity: 0.7 }));
  scene.add(speckPts);

  return {
    world,
    update(t) {
      clouds.rotation.y = t * 0.004;
      speckPts.rotation.y = -t * 0.006;
    },
  };
}
