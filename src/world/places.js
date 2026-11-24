// Buildings, props and the list of places Jenny can visit.
// To add a new area later, replace one PLACEHOLDER entry in config.js.
import * as THREE from 'three';
import { PALETTE, mesh, toon, roundedBox, signTexture, signPlane } from '../toon.js';
import { placeAt, R } from './planet.js';

const box = (w, h, d, c, o = 0.05) => mesh(roundedBox(w, h, d, Math.min(0.12, w / 8, h / 8, d / 8)), c, { outline: o });

function windowGrid(group, w, h, z, rows, cols, y0, color = '#45606a') {
  const ww = (w * 0.7) / cols, wh = 0.7;
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const win = mesh(new THREE.BoxGeometry(ww * 0.8, wh, 0.06), color, { outline: 0.02 });
      win.position.set(-w * 0.35 + ww * (c + 0.5), y0 + r * 1.4, z);
      group.add(win);
      const sill = new THREE.Mesh(new THREE.BoxGeometry(ww * 0.85, 0.06, 0.12), toon(PALETTE.cream));
      sill.position.set(win.position.x, win.position.y - wh / 2 - 0.03, z + 0.03);
      group.add(sill);
    }
  }
}

// ---------- Original mascots for the kawaii store (designed for this site) ----------
function mochiBun(color = '#fbf6ee', accent = PALETTE.pink) {
  // round mochi bunny with one floppy ear and a star on its belly
  const g = new THREE.Group();
  const body = mesh(new THREE.SphereGeometry(0.4, 20, 14), color, { outline: 0.025 });
  body.scale.set(1.1, 0.85, 1);
  body.position.y = 0.34;
  g.add(body);
  const earL = mesh(new THREE.CapsuleGeometry(0.08, 0.28, 4, 8), color, { outline: 0.02 });
  earL.position.set(-0.15, 0.78, 0); earL.rotation.z = 0.2; g.add(earL);
  const earR = mesh(new THREE.CapsuleGeometry(0.08, 0.24, 4, 8), color, { outline: 0.02 });
  earR.position.set(0.22, 0.66, 0); earR.rotation.z = -1.1; g.add(earR);
  const star = mesh(new THREE.OctahedronGeometry(0.08), accent, { outline: 0.01 });
  star.position.set(0, 0.28, 0.42); g.add(star);
  for (const s of [-1, 1]) {
    const e = new THREE.Mesh(new THREE.SphereGeometry(0.035, 8, 6), toon(PALETTE.ink));
    e.position.set(0.12 * s, 0.42, 0.38); g.add(e);
  }
  return g;
}
function batPuff(color = PALETTE.lilac) {
  // little round bat-puff with tiny wings
  const g = new THREE.Group();
  const body = mesh(new THREE.SphereGeometry(0.32, 18, 12), color, { outline: 0.02 });
  body.position.y = 0.32; g.add(body);
  for (const s of [-1, 1]) {
    const wing = mesh(new THREE.ConeGeometry(0.16, 0.34, 3), '#7d68a8', { outline: 0.015 });
    wing.position.set(0.36 * s, 0.38, 0); wing.rotation.z = 1.3 * s; g.add(wing);
    const e = new THREE.Mesh(new THREE.SphereGeometry(0.03, 8, 6), toon(PALETTE.ink));
    e.position.set(0.1 * s, 0.38, 0.29); g.add(e);
  }
  const fang = mesh(new THREE.ConeGeometry(0.025, 0.06, 3), '#ffffff', { outline: 0 });
  fang.position.set(0.04, 0.27, 0.3); fang.rotation.x = Math.PI; g.add(fang);
  return g;
}

// ---------- Buildings ----------
export function kawaiiStore() {
  const g = new THREE.Group();
  const W = 9, H = 6, D = 6;
  const shell = box(W, H, D, '#fbe3ea');
  shell.position.y = H / 2;
  g.add(shell);
  // second floor band + awning
  const band = box(W + 0.3, 0.5, D + 0.3, PALETTE.hotPink, 0.04);
  band.position.y = 3.1;
  g.add(band);
  const awning = new THREE.Group();
  for (let i = 0; i < 9; i++) {
    const strip = mesh(new THREE.BoxGeometry(1, 0.08, 1.6), i % 2 ? PALETTE.cream : PALETTE.pink, { outline: 0.02 });
    strip.position.set(-4 + i, 2.75, D / 2 + 0.75);
    strip.rotation.x = 0.35;
    awning.add(strip);
  }
  g.add(awning);
  // big shop window + door
  const glass = mesh(new THREE.BoxGeometry(5.2, 2.2, 0.08), '#bfe3e0', { outline: 0.03 });
  glass.position.set(-1.4, 1.3, D / 2 + 0.02);
  g.add(glass);
  const door = mesh(new THREE.BoxGeometry(1.6, 2.4, 0.1), '#ffffff', { outline: 0.03 });
  door.position.set(2.8, 1.2, D / 2 + 0.03);
  g.add(door);
  const knob = new THREE.Mesh(new THREE.SphereGeometry(0.08), toon(PALETTE.yellow));
  knob.position.set(2.3, 1.2, D / 2 + 0.12);
  g.add(knob);
  // mascots in the window
  const m1 = mochiBun(); m1.position.set(-2.6, 0.25, D / 2 - 0.4); g.add(m1);
  const m2 = batPuff(); m2.position.set(-1.3, 0.25, D / 2 - 0.4); g.add(m2);
  const m3 = mochiBun('#ffe1ec', PALETTE.yellow); m3.position.set(-0.1, 0.25, D / 2 - 0.4); m3.scale.setScalar(0.8); g.add(m3);
  // upper windows
  windowGrid(g, W, H, D / 2 + 0.02, 1, 4, 4.5, '#cfe7f0');
  // Sign
  const sign = signPlane(signTexture([{ text: 'MOCHI MOON', size: 64 }, { text: 'もちムーン ✦ 귀여운 가게', size: 30 }], { bg: '#fff6f8', fg: PALETTE.hotPink }), 6.4, 1.6);
  sign.position.set(0, 6.9, D / 2 - 0.3);
  const signBack = box(6.7, 1.9, 0.3, PALETTE.hotPink, 0.04);
  signBack.position.set(0, 6.9, D / 2 - 0.5);
  g.add(signBack, sign);
  // giant mascot on the roof
  const roofBun = mochiBun(); roofBun.scale.setScalar(2.6); roofBun.position.set(3, H, -0.5); g.add(roofBun);
  g.userData.bobbers = [roofBun];
  // vertical banner
  const vb = signPlane(signTexture([{ text: 'かわいい', size: 70 }], { w: 256, h: 512, bg: PALETTE.pink, fg: '#ffffff' }), 0.8, 1.6);
  vb.position.set(-W / 2 - 0.05, 4.5, D / 2 - 0.4);
  vb.rotation.y = -Math.PI / 2;
  g.add(vb);
  return g;
}

export function netCafe() {
  const g = new THREE.Group();
  const W = 8, H = 9, D = 6;
  const shell = box(W, H, D, '#b9bdb3');
  shell.position.y = H / 2;
  g.add(shell);
  windowGrid(g, W, H, D / 2 + 0.02, 3, 3, 3.8);
  // ground floor glowing front
  const front = mesh(new THREE.BoxGeometry(6, 2.4, 0.08), '#2f3d4a', { outline: 0.03 });
  front.position.set(-0.6, 1.3, D / 2 + 0.03);
  g.add(front);
  for (let i = 0; i < 4; i++) {
    const screen = new THREE.Mesh(new THREE.PlaneGeometry(0.9, 0.6), new THREE.MeshBasicMaterial({ color: i % 2 ? '#7de0d3' : '#c7a6ff' }));
    screen.position.set(-2.6 + i * 1.35, 1.3, D / 2 + 0.08);
    g.add(screen);
  }
  const door = mesh(new THREE.BoxGeometry(1.4, 2.4, 0.1), '#d7dfe0', { outline: 0.03 });
  door.position.set(3, 1.2, D / 2 + 0.03);
  g.add(door);
  // Signs: Japanese + Korean internet cafe
  const sign = signPlane(signTexture([{ text: 'NET CAFÉ 24', size: 66 }, { text: 'ネットカフェ ・ PC방', size: 34 }], { bg: '#1f2a33', fg: '#7de0d3' }), 6, 1.5);
  sign.position.set(-0.4, 3.0, D / 2 + 0.2);
  g.add(sign);
  const side = signPlane(signTexture([{ text: 'PC', size: 150 }], { w: 256, h: 512, bg: PALETTE.yellow, fg: PALETTE.ink }), 0.9, 1.8);
  side.position.set(W / 2 + 0.6, 6, D / 2 - 0.5);
  side.rotation.y = Math.PI / 2;
  const sideBox = box(0.3, 2, 1, PALETTE.yellow, 0.03);
  sideBox.position.set(W / 2 + 0.5, 6, D / 2 - 0.5);
  g.add(sideBox, side);
  // Rooftop water tower
  const tank = mesh(new THREE.CylinderGeometry(1, 1, 1.4, 16), '#8fbf7a', { outline: 0.04 });
  tank.position.set(-2, H + 1.6, -1);
  const tankTop = mesh(new THREE.ConeGeometry(1.05, 0.5, 16), '#7aa86a', { outline: 0.03 });
  tankTop.position.set(-2, H + 2.55, -1);
  g.add(tank, tankTop);
  for (const [x, z] of [[-2.6, -1.6], [-1.4, -1.6], [-2.6, -0.4], [-1.4, -0.4]]) {
    const leg = mesh(new THREE.CylinderGeometry(0.06, 0.06, 1, 6), PALETTE.ink, { outline: 0 });
    leg.position.set(x, H + 0.5, z);
    g.add(leg);
  }
  // AC units
  for (let i = 0; i < 2; i++) {
    const ac = box(0.9, 0.6, 0.5, '#e6e3d8', 0.03);
    ac.position.set(W / 2 + 0.25, 4.2 + i * 1.4, 1.5);
    g.add(ac);
  }
  return g;
}

export function placeholderLot(label) {
  const g = new THREE.Group();
  const pad = mesh(new THREE.CylinderGeometry(4.2, 4.2, 0.15, 24), PALETTE.sidewalk, { outline: 0.04 });
  pad.position.y = 0.07;
  g.add(pad);
  // construction fence + stacked crates
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2 + 0.3;
    const post = mesh(new THREE.BoxGeometry(1.8, 0.9, 0.12), i % 2 ? PALETTE.yellow : PALETTE.ink, { outline: 0.02 });
    post.position.set(Math.sin(a) * 3.6, 0.6, Math.cos(a) * 3.6);
    post.rotation.y = a + Math.PI / 2;
    if (i !== 0) g.add(post);
  }
  const crate1 = box(1.6, 1.6, 1.6, '#c79a68', 0.04); crate1.position.set(-0.8, 0.95, -0.4); g.add(crate1);
  const crate2 = box(1.2, 1.2, 1.2, '#b8875a', 0.04); crate2.position.set(0.9, 0.75, 0.2); crate2.rotation.y = 0.5; g.add(crate2);
  const crate3 = box(1, 1, 1, '#d6ab7b', 0.04); crate3.position.set(-0.6, 2.25, -0.4); crate3.rotation.y = 0.3; g.add(crate3);
  const cone = mesh(new THREE.ConeGeometry(0.25, 0.7, 10), PALETTE.orange, { outline: 0.02 });
  cone.position.set(1.8, 0.5, 1.6); g.add(cone);
  const sign = signPlane(signTexture([{ text: 'COMING SOON', size: 56 }, { text: label, size: 34 }], { bg: PALETTE.cream, fg: PALETTE.ink }), 3.2, 1);
  sign.position.set(0, 3.4, 1.1);
  const board = box(3.4, 1.2, 0.15, PALETTE.ink, 0.02); board.position.set(0, 3.4, 1.0);
  const stick = mesh(new THREE.CylinderGeometry(0.07, 0.07, 3, 6), PALETTE.wood, { outline: 0.02 }); stick.position.set(0, 1.5, 0.9);
  g.add(stick, board, sign);
  return g;
}

// ---------- Street props ----------
export function tree(scale = 1) {
  const g = new THREE.Group();
  const trunk = mesh(new THREE.CylinderGeometry(0.18, 0.26, 1.6, 7), PALETTE.wood, { outline: 0.03 });
  trunk.position.y = 0.8;
  g.add(trunk);
  const blobs = [[0, 2.2, 0, 1.2, PALETTE.tree], [0.7, 2.6, 0.2, 0.85, PALETTE.treeLight], [-0.6, 2.7, -0.2, 0.9, PALETTE.tree], [0.1, 3.2, 0, 0.8, PALETTE.treeLight]];
  for (const [x, y, z, r, c] of blobs) {
    const b = mesh(new THREE.IcosahedronGeometry(r, 1), c, { outline: 0.05 });
    b.position.set(x, y, z);
    g.add(b);
  }
  g.scale.setScalar(scale);
  return g;
}

export function utilityPole() {
  const g = new THREE.Group();
  const p = mesh(new THREE.CylinderGeometry(0.14, 0.18, 7, 8), '#8b8f86', { outline: 0.03 });
  p.position.y = 3.5;
  g.add(p);
  for (const y of [6.2, 5.6]) {
    const bar = mesh(new THREE.BoxGeometry(2, 0.12, 0.12), '#6c6f68', { outline: 0.02 });
    bar.position.y = y;
    g.add(bar);
  }
  const transformer = mesh(new THREE.CylinderGeometry(0.3, 0.3, 0.7, 10), '#9ea39a', { outline: 0.02 });
  transformer.position.set(0.35, 4.8, 0);
  g.add(transformer);
  g.userData.wireTop = new THREE.Vector3(0, 6.2, 0);
  return g;
}

export function vendingMachine(color = PALETTE.red) {
  const g = new THREE.Group();
  const b = box(1.1, 2, 0.8, color, 0.04);
  b.position.y = 1;
  g.add(b);
  const glass = mesh(new THREE.BoxGeometry(0.85, 0.9, 0.04), '#dfeeee', { outline: 0.015 });
  glass.position.set(0, 1.35, 0.41);
  g.add(glass);
  const cols = ['#f2c94c', '#7de0d3', '#f3a6bd', '#ffffff'];
  for (let r = 0; r < 2; r++) for (let c = 0; c < 4; c++) {
    const can = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.07, 0.22, 8), toon(cols[(r + c) % 4]));
    can.position.set(-0.3 + c * 0.2, 1.15 + r * 0.38, 0.38);
    g.add(can);
  }
  return g;
}

export function lantern() {
  const g = new THREE.Group();
  const l = mesh(new THREE.SphereGeometry(0.3, 12, 10), PALETTE.red, { outline: 0.02 });
  l.scale.y = 1.3;
  g.add(l);
  return g;
}

export function bench() {
  const g = new THREE.Group();
  const seat = box(2, 0.15, 0.6, PALETTE.wood, 0.03);
  seat.position.y = 0.55;
  g.add(seat);
  for (const x of [-0.8, 0.8]) {
    const leg = mesh(new THREE.BoxGeometry(0.1, 0.55, 0.5), PALETTE.ink, { outline: 0 });
    leg.position.set(x, 0.27, 0);
    g.add(leg);
  }
  return g;
}

// Draw sagging wires between utility poles (in world space).
export function wiresBetween(scene, poles) {
  const mat = new THREE.LineBasicMaterial({ color: PALETTE.ink });
  for (let i = 0; i < poles.length; i++) {
    const a = poles[i], b = poles[(i + 1) % poles.length];
    for (const off of [-0.8, 0.8]) {
      const pa = a.localToWorld(new THREE.Vector3(off, 6.2, 0));
      const pb = b.localToWorld(new THREE.Vector3(off, 6.2, 0));
      if (pa.distanceTo(pb) > 30) continue;
      const pts = [];
      for (let t = 0; t <= 1.0001; t += 0.1) {
        const p = pa.clone().lerp(pb, t);
        const len = p.length();
        const sag = Math.sin(t * Math.PI) * 0.8;
        p.setLength(Math.max(len, R + 5.6) - sag);
        pts.push(p);
      }
      scene.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), mat));
    }
  }
}

export { placeAt };
