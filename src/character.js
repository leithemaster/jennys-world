// Jenny: an original chibi character in Tokyo/Seoul streetwear.
// Built from simple shapes so every piece of the outfit can be swapped.
import * as THREE from 'three';
import { PALETTE, mesh, toon, roundedBox } from './toon.js';

const SKIN = '#f6d9c6';
const HAIR = '#3a2c4a';

export const OUTFIT_SLOTS = {
  hat: [
    { id: 'catHood', label: 'Cat-ear hood' },
    { id: 'beanie', label: 'Lilac beanie' },
    { id: 'bucket', label: 'Bucket hat' },
    { id: 'clips', label: 'Star clips' },
  ],
  top: [
    { id: 'hoodieBlack', label: 'Oversized hoodie' },
    { id: 'varsity', label: 'Varsity jacket' },
    { id: 'cardigan', label: 'Pink cardigan' },
    { id: 'windbreaker', label: 'Windbreaker' },
  ],
  bottom: [
    { id: 'cargo', label: 'Cargo pants' },
    { id: 'pleated', label: 'Pleated skirt' },
    { id: 'wideJeans', label: 'Wide jeans' },
  ],
  shoes: [
    { id: 'chunkyWhite', label: 'Chunky sneakers' },
    { id: 'platform', label: 'Platform boots' },
    { id: 'pinkRunner', label: 'Pink runners' },
  ],
  bag: [
    { id: 'crossbody', label: 'Crossbody bag' },
    { id: 'miniBackpack', label: 'Mini backpack' },
    { id: 'none', label: 'No bag' },
  ],
};

export const DEFAULT_OUTFIT = { hat: 'catHood', top: 'hoodieBlack', bottom: 'pleated', shoes: 'platform', bag: 'crossbody' };

const sph = (r, ws = 20, hs = 16) => new THREE.SphereGeometry(r, ws, hs);
const cap = (r, l) => new THREE.CapsuleGeometry(r, l, 6, 12);

function moonPin(color = PALETTE.pink) {
  // Small crescent moon badge
  const shape = new THREE.Shape();
  shape.absarc(0, 0, 0.11, 0, Math.PI * 2, false);
  const hole = new THREE.Path();
  hole.absarc(0.05, 0.03, 0.09, 0, Math.PI * 2, true);
  shape.holes.push(hole);
  const g = new THREE.ExtrudeGeometry(shape, { depth: 0.03, bevelEnabled: false, curveSegments: 16 });
  return mesh(g, color, { outline: 0.008 });
}

function buildHat(id) {
  const g = new THREE.Group();
  if (id === 'catHood') {
    // Sphere with a wedge cut out at the front (+Z) so the face shows.
    const open = 1.05;
    const hoodGeo = new THREE.SphereGeometry(0.66, 28, 18, Math.PI / 2 + open, Math.PI * 2 - open * 2, 0, Math.PI * 0.78);
    const hood = mesh(hoodGeo, PALETTE.black, { outline: 0.03, side: THREE.DoubleSide });
    hood.scale.set(1.04, 1.0, 1.02);
    hood.position.set(0, 0.04, -0.04);
    g.add(hood);
    const rim = mesh(new THREE.TorusGeometry(0.5, 0.05, 8, 24, Math.PI * 1.3), '#3d3946', { outline: 0.012 });
    rim.position.set(0, -0.02, 0.36);
    rim.rotation.set(-0.35, 0, -Math.PI * 0.15 + Math.PI * 0.0);
    rim.rotation.z = -Math.PI * 0.15;
    g.add(rim);
    for (const s of [-1, 1]) {
      const ear = mesh(new THREE.ConeGeometry(0.17, 0.3, 4), PALETTE.black, { outline: 0.02 });
      ear.position.set(0.36 * s, 0.56, -0.02);
      ear.rotation.z = -0.35 * s;
      g.add(ear);
      const inner = mesh(new THREE.ConeGeometry(0.08, 0.16, 4), PALETTE.pink, { outline: 0 });
      inner.position.set(0.355 * s, 0.53, 0.06);
      inner.rotation.z = -0.35 * s;
      g.add(inner);
    }
    const pin = moonPin();
    pin.position.set(0.42, 0.36, 0.4);
    pin.rotation.y = 0.7;
    g.add(pin);
    g.userData.hidesHairTop = true;
  } else if (id === 'beanie') {
    const b = mesh(new THREE.SphereGeometry(0.62, 24, 12, 0, Math.PI * 2, 0, Math.PI / 2), PALETTE.lilac, { outline: 0.03 });
    b.position.y = 0.12;
    g.add(b);
    const cuff = mesh(new THREE.TorusGeometry(0.58, 0.08, 8, 24), '#a08cc6', { outline: 0.02 });
    cuff.rotation.x = Math.PI / 2;
    cuff.position.y = 0.14;
    g.add(cuff);
    const pom = mesh(sph(0.12), PALETTE.cream, { outline: 0.02 });
    pom.position.y = 0.76;
    g.add(pom);
  } else if (id === 'bucket') {
    const crown = mesh(new THREE.CylinderGeometry(0.5, 0.58, 0.38, 24), PALETTE.cream, { outline: 0.03 });
    crown.position.y = 0.46;
    g.add(crown);
    const brim = mesh(new THREE.CylinderGeometry(0.82, 0.86, 0.05, 28), PALETTE.cream, { outline: 0.02 });
    brim.position.y = 0.28;
    brim.rotation.x = 0.12;
    g.add(brim);
    const band = mesh(new THREE.CylinderGeometry(0.585, 0.585, 0.06, 24), PALETTE.ink, { outline: 0 });
    band.position.y = 0.3;
    g.add(band);
  } else if (id === 'clips') {
    for (const [x, y, c] of [[0.36, 0.38, PALETTE.yellow], [0.44, 0.22, PALETTE.pink], [-0.4, 0.34, PALETTE.lilac]]) {
      const star = mesh(new THREE.OctahedronGeometry(0.08), c, { outline: 0.01 });
      star.position.set(x, y, 0.34);
      g.add(star);
    }
  }
  return g;
}

function torsoColors(id) {
  switch (id) {
    case 'varsity': return { body: '#7a2f3b', sleeve: PALETTE.cream, trim: PALETTE.cream };
    case 'cardigan': return { body: PALETTE.pink, sleeve: PALETTE.pink, trim: PALETTE.cream };
    case 'windbreaker': return { body: '#4a6fa5', sleeve: '#e9e4d6', trim: PALETTE.yellow };
    default: return { body: PALETTE.black, sleeve: PALETTE.black, trim: '#4a4652' };
  }
}

function buildTop(id) {
  const c = torsoColors(id);
  const g = new THREE.Group();
  const body = mesh(roundedBox(0.78, 0.7, 0.52, 0.2, 3), c.body, { outline: 0.03 });
  body.position.y = 0.92;
  g.add(body);
  const hem = mesh(roundedBox(0.8, 0.1, 0.54, 0.05), c.trim, { outline: 0.015 });
  hem.position.y = 0.6;
  g.add(hem);
  if (id === 'hoodieBlack') {
    const pocket = mesh(roundedBox(0.4, 0.14, 0.04, 0.03), '#3a3742', { outline: 0.01 });
    pocket.position.set(0, 0.78, 0.27);
    g.add(pocket);
    const pin = moonPin();
    pin.position.set(-0.2, 1.1, 0.27);
    pin.scale.setScalar(0.7);
    g.add(pin);
  }
  if (id === 'varsity') {
    const letter = mesh(new THREE.BoxGeometry(0.16, 0.2, 0.02), PALETTE.cream, { outline: 0.008 });
    letter.position.set(-0.18, 1.05, 0.27);
    g.add(letter);
  }
  if (id === 'cardigan') {
    for (let i = 0; i < 3; i++) {
      const b = mesh(sph(0.03, 8, 6), PALETTE.cream, { outline: 0 });
      b.position.set(0, 1.12 - i * 0.16, 0.27);
      g.add(b);
    }
  }
  if (id === 'windbreaker') {
    const stripe = mesh(new THREE.BoxGeometry(0.8, 0.08, 0.54), PALETTE.yellow, { outline: 0 });
    stripe.position.y = 1.0;
    g.add(stripe);
  }
  g.userData.sleeve = c.sleeve;
  return g;
}

function buildBottom(id) {
  const g = new THREE.Group();
  if (id === 'pleated') {
    const skirt = mesh(new THREE.CylinderGeometry(0.36, 0.5, 0.36, 12, 1), '#2d2b36', { outline: 0.025 });
    skirt.position.y = 0.46;
    g.add(skirt);
    const stripe = mesh(new THREE.CylinderGeometry(0.505, 0.505, 0.04, 12, 1, true), PALETTE.hotPink, { outline: 0 });
    stripe.position.y = 0.31;
    g.add(stripe);
    g.userData.leg = SKIN;
    g.userData.sock = PALETTE.cream;
  } else {
    const color = id === 'cargo' ? '#8a8a6a' : '#5b7db1';
    const hips = mesh(roundedBox(0.66, 0.24, 0.46, 0.1), color, { outline: 0.025 });
    hips.position.y = 0.52;
    g.add(hips);
    g.userData.leg = color;
    g.userData.wide = true;
    if (id === 'cargo') g.userData.pocket = '#76765a';
  }
  return g;
}

function buildShoe(id) {
  const color = { chunkyWhite: '#f4f2ec', platform: PALETTE.black, pinkRunner: PALETTE.pink }[id];
  const sole = { chunkyWhite: '#d8d4ca', platform: '#4a4652', pinkRunner: PALETTE.cream }[id];
  const g = new THREE.Group();
  const top = mesh(roundedBox(0.24, 0.16, 0.36, 0.07), color, { outline: 0.02 });
  top.position.set(0, 0.12, 0.04);
  g.add(top);
  const s = mesh(roundedBox(0.26, id === 'platform' ? 0.12 : 0.07, 0.4, 0.03), sole, { outline: 0.015 });
  s.position.set(0, id === 'platform' ? 0.04 : 0.03, 0.05);
  g.add(s);
  return g;
}

function buildBag(id) {
  const g = new THREE.Group();
  if (id === 'crossbody') {
    const strap = mesh(new THREE.TorusGeometry(0.5, 0.025, 6, 32), PALETTE.ink, { outline: 0 });
    strap.position.set(0, 0.95, 0);
    strap.rotation.set(0, Math.PI / 2, 0.7);
    strap.scale.set(1, 1.05, 0.62);
    g.add(strap);
    const pouch = mesh(roundedBox(0.26, 0.2, 0.1, 0.05), PALETTE.hotPink, { outline: 0.015 });
    pouch.position.set(0.34, 0.66, 0.2);
    g.add(pouch);
  } else if (id === 'miniBackpack') {
    const bp = mesh(roundedBox(0.44, 0.48, 0.2, 0.12), PALETTE.lilac, { outline: 0.02 });
    bp.position.set(0, 0.98, -0.36);
    g.add(bp);
    const flap = mesh(roundedBox(0.4, 0.16, 0.06, 0.05), '#a08cc6', { outline: 0.01 });
    flap.position.set(0, 1.12, -0.46);
    g.add(flap);
  }
  return g;
}

export class Character {
  constructor(outfit = DEFAULT_OUTFIT) {
    this.root = new THREE.Group();
    this.rig = new THREE.Group(); // bobs while walking
    this.root.add(this.rig);
    this.outfit = { ...DEFAULT_OUTFIT, ...outfit };
    this.walk = 0;
    this.speed = 0;
    this._buildBase();
    this.setOutfit(this.outfit);
  }

  _buildBase() {
    const rig = this.rig;
    // Head
    this.head = new THREE.Group();
    this.head.position.y = 1.75;
    rig.add(this.head);
    const skull = mesh(sph(0.56, 28, 20), SKIN, { outline: 0.03 });
    skull.scale.set(1, 0.95, 0.94);
    this.head.add(skull);

    // Hair: back volume + bangs + side locks
    this.hairTop = mesh(sph(0.6, 24, 16), HAIR, { outline: 0.03 });
    this.hairTop.scale.set(1.02, 0.98, 0.98);
    this.hairTop.position.set(0, 0.06, -0.06);
    this.head.add(this.hairTop);
    const bangs = mesh(new THREE.SphereGeometry(0.6, 24, 12, -Math.PI * 0.45, Math.PI * 0.9, 0.2, 0.95), HAIR, { outline: 0.02, side: THREE.DoubleSide });
    bangs.position.set(0, 0.05, 0.02);
    this.head.add(bangs);
    for (const s of [-1, 1]) {
      const lock = mesh(cap(0.12, 0.42), HAIR, { outline: 0.02 });
      lock.position.set(0.46 * s, -0.22, 0.06);
      lock.rotation.z = 0.12 * s;
      this.head.add(lock);
      const tip = mesh(sph(0.1), PALETTE.lilac, { outline: 0.015 });
      tip.position.set(0.47 * s, -0.5, 0.06);
      this.head.add(tip);
    }

    // Face
    const eyeMat = toon(PALETTE.ink);
    for (const s of [-1, 1]) {
      const eye = new THREE.Mesh(sph(0.085, 14, 10), eyeMat);
      eye.scale.set(0.8, 1.25, 0.4);
      eye.position.set(0.19 * s, -0.04, 0.5);
      this.head.add(eye);
      const hl = new THREE.Mesh(sph(0.025, 8, 6), new THREE.MeshBasicMaterial({ color: '#ffffff' }));
      hl.position.set(0.19 * s + 0.025, 0.0, 0.53);
      this.head.add(hl);
      const blush = new THREE.Mesh(new THREE.CircleGeometry(0.07, 14), new THREE.MeshBasicMaterial({ color: '#f2a7a7', transparent: true, opacity: 0.6 }));
      blush.position.set(0.3 * s, -0.16, 0.47);
      blush.rotation.y = 0.5 * s;
      this.head.add(blush);
    }
    const mouth = new THREE.Mesh(new THREE.TorusGeometry(0.04, 0.012, 6, 12, Math.PI), eyeMat);
    mouth.rotation.z = Math.PI;
    mouth.position.set(0, -0.2, 0.52);
    this.head.add(mouth);

    // Neck
    const neck = mesh(new THREE.CylinderGeometry(0.1, 0.1, 0.2, 10), SKIN, { outline: 0.015 });
    neck.position.y = 1.3;
    rig.add(neck);

    // Slots
    this.slots = { hat: new THREE.Group(), top: new THREE.Group(), bottom: new THREE.Group(), bag: new THREE.Group() };
    this.head.add(this.slots.hat);
    rig.add(this.slots.top, this.slots.bottom, this.slots.bag);

    // Limbs with pivots at shoulder/hip
    this.arms = [-1, 1].map((s) => {
      const p = new THREE.Group();
      p.position.set(0.46 * s, 1.18, 0);
      rig.add(p);
      return p;
    });
    this.legs = [-1, 1].map((s) => {
      const p = new THREE.Group();
      p.position.set(0.17 * s, 0.5, 0);
      rig.add(p);
      return p;
    });

    // Blob shadow
    const shadow = new THREE.Mesh(new THREE.CircleGeometry(0.6, 20), new THREE.MeshBasicMaterial({ color: '#000', transparent: true, opacity: 0.22, depthWrite: false }));
    shadow.rotation.x = -Math.PI / 2;
    shadow.position.y = 0.02;
    this.root.add(shadow);
  }

  _rebuildLimbs() {
    const sleeve = this.slots.top.children[0]?.userData.sleeve || PALETTE.black;
    const bottom = this.slots.bottom.children[0]?.userData || {};
    this.arms.forEach((p, i) => {
      p.clear();
      const s = i === 0 ? -1 : 1;
      const arm = mesh(cap(0.12, 0.42), sleeve, { outline: 0.02 });
      arm.position.set(0.04 * s, -0.3, 0);
      arm.rotation.z = 0.12 * s;
      p.add(arm);
      const hand = mesh(sph(0.09), SKIN, { outline: 0.015 });
      hand.position.set(0.08 * s, -0.62, 0);
      p.add(hand);
    });
    this.legs.forEach((p) => {
      p.clear();
      const leg = mesh(cap(bottom.wide ? 0.15 : 0.085, bottom.wide ? 0.3 : 0.32), bottom.leg || SKIN, { outline: 0.02 });
      leg.position.y = -0.24;
      p.add(leg);
      if (bottom.sock) {
        const sock = mesh(new THREE.CylinderGeometry(0.1, 0.1, 0.16, 10), bottom.sock, { outline: 0.012 });
        sock.position.y = -0.36;
        p.add(sock);
      }
      if (bottom.pocket) {
        const pk = mesh(roundedBox(0.08, 0.14, 0.18, 0.02), bottom.pocket, { outline: 0.01 });
        pk.position.set(0, -0.18, 0);
        pk.position.x = p.position.x > 0 ? 0.15 : -0.15;
        p.add(pk);
      }
      const shoe = buildShoe(this.outfit.shoes);
      shoe.position.y = -0.52;
      p.add(shoe);
    });
  }

  setOutfit(outfit) {
    this.outfit = { ...this.outfit, ...outfit };
    const swap = (slot, built) => { this.slots[slot].clear(); this.slots[slot].add(built); };
    const hat = buildHat(this.outfit.hat);
    swap('hat', hat);
    this.hairTop.visible = !hat.userData.hidesHairTop;
    swap('top', buildTop(this.outfit.top));
    swap('bottom', buildBottom(this.outfit.bottom));
    swap('bag', buildBag(this.outfit.bag));
    this._rebuildLimbs();
  }

  // speed: 0..1 movement amount this frame
  update(dt, speed) {
    this.speed += (speed - this.speed) * Math.min(1, dt * 10);
    this.walk += dt * 9 * this.speed;
    const sw = Math.sin(this.walk) * 0.7 * this.speed;
    this.legs[0].rotation.x = sw;
    this.legs[1].rotation.x = -sw;
    this.arms[0].rotation.x = -sw * 0.8;
    this.arms[1].rotation.x = sw * 0.8;
    const idle = Math.sin(performance.now() / 600) * 0.02;
    this.rig.position.y = Math.abs(Math.cos(this.walk)) * 0.08 * this.speed + idle;
    this.head.rotation.z = Math.sin(this.walk) * 0.04 * this.speed;
  }
}
