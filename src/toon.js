// Shared look: banded toon shading + inked outlines, in the spirit of a
// hand-painted anime background. Every mesh in the world goes through here.
import * as THREE from 'three';

export const PALETTE = {
  sky: '#81bfbc',
  skyDeep: '#5fa8a6',
  cloud: '#a9d6cf',
  sage: '#c9d5c3',
  grass: '#7fae6a',
  grassDark: '#55834f',
  tree: '#4f8a55',
  treeLight: '#79b06b',
  asphalt: '#6f7a7c',
  sidewalk: '#c7c4b8',
  concrete: '#bdbcb2',
  cream: '#f2eee1',
  ink: '#1f2126',
  pink: '#f3a6bd',
  hotPink: '#e5658f',
  lilac: '#b8a3d9',
  purple: '#6b4f9a',
  red: '#d2493f',
  orange: '#ec8a3b',
  yellow: '#f2c94c',
  wood: '#9a6b45',
  black: '#2a2830',
};

// 3-band gradient map shared by all toon materials.
let gradientMap = null;
function getGradientMap() {
  if (gradientMap) return gradientMap;
  const data = new Uint8Array([90, 90, 90, 255, 175, 175, 175, 255, 255, 255, 255, 255]);
  gradientMap = new THREE.DataTexture(data, 3, 1, THREE.RGBAFormat);
  gradientMap.minFilter = THREE.NearestFilter;
  gradientMap.magFilter = THREE.NearestFilter;
  gradientMap.needsUpdate = true;
  return gradientMap;
}

const matCache = new Map();
export function toon(color, opts = {}) {
  const key = `${color}|${opts.map ? opts.map.uuid : ''}|${opts.emissive || ''}|${opts.side || ''}`;
  if (!opts.unique && matCache.has(key)) return matCache.get(key);
  const m = new THREE.MeshToonMaterial({
    color: new THREE.Color(color),
    gradientMap: getGradientMap(),
    map: opts.map || null,
    emissive: opts.emissive ? new THREE.Color(opts.emissive) : new THREE.Color(0x000000),
    side: opts.side || THREE.FrontSide,
    transparent: !!opts.transparent,
  });
  if (!opts.unique) matCache.set(key, m);
  return m;
}

// Inverted-hull outline: pushes vertices out along their normal and draws back faces in ink.
const outlineMats = new Map();
function outlineMaterial(thickness) {
  const k = thickness.toFixed(3);
  if (outlineMats.has(k)) return outlineMats.get(k);
  const m = new THREE.ShaderMaterial({
    uniforms: { thickness: { value: thickness }, color: { value: new THREE.Color(PALETTE.ink) } },
    vertexShader: /* glsl */ `
      uniform float thickness;
      void main() {
        vec3 p = position + normal * thickness;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
      }`,
    fragmentShader: /* glsl */ `
      uniform vec3 color;
      void main() { gl_FragColor = vec4(color, 1.0); }`,
    side: THREE.BackSide,
  });
  outlineMats.set(k, m);
  return m;
}

// Build a toon mesh with an outline child. Returns the main mesh.
export function mesh(geometry, color, opts = {}) {
  const m = new THREE.Mesh(geometry, opts.material || toon(color, opts));
  const t = opts.outline === undefined ? 0.04 : opts.outline;
  if (t > 0) {
    const o = new THREE.Mesh(geometry, outlineMaterial(t));
    o.name = 'outline';
    o.raycast = () => {};
    m.add(o);
  }
  return m;
}

// Rounded box helps the outline read as a single clean shape.
export function roundedBox(w, h, d, r = 0.08, seg = 2) {
  const g = new THREE.BoxGeometry(w, h, d, seg, seg, seg);
  const pos = g.attributes.position;
  const v = new THREE.Vector3();
  const hw = w / 2 - r, hh = h / 2 - r, hd = d / 2 - r;
  for (let i = 0; i < pos.count; i++) {
    v.fromBufferAttribute(pos, i);
    const c = new THREE.Vector3(
      THREE.MathUtils.clamp(v.x, -hw, hw),
      THREE.MathUtils.clamp(v.y, -hh, hh),
      THREE.MathUtils.clamp(v.z, -hd, hd),
    );
    const n = v.clone().sub(c);
    if (n.lengthSq() > 0) n.normalize().multiplyScalar(r);
    pos.setXYZ(i, c.x + n.x, c.y + n.y, c.z + n.z);
  }
  g.computeVertexNormals();
  return g;
}

// Canvas text texture for shop signs.
export function signTexture(lines, { bg = PALETTE.cream, fg = PALETTE.ink, w = 512, h = 160, font = 'Dela Gothic One', border = true } = {}) {
  const c = document.createElement('canvas');
  c.width = w; c.height = h;
  const ctx = c.getContext('2d');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, w, h);
  if (border) {
    ctx.strokeStyle = fg; ctx.lineWidth = 8;
    ctx.strokeRect(8, 8, w - 16, h - 16);
  }
  ctx.fillStyle = fg;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  const arr = Array.isArray(lines) ? lines : [lines];
  arr.forEach((line, i) => {
    const size = typeof line === 'object' ? line.size : (i === 0 ? h * 0.42 : h * 0.2);
    const text = typeof line === 'object' ? line.text : line;
    ctx.font = `${size}px "${font}", "Hiragino Sans", "Malgun Gothic", sans-serif`;
    const y = arr.length === 1 ? h / 2 : h * (0.38 + i * 0.36);
    ctx.fillText(text, w / 2, y, w - 40);
  });
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 4;
  return tex;
}

export function signPlane(tex, w, h) {
  const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ map: tex, toneMapped: false }));
  return m;
}
