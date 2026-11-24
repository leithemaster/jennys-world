import * as THREE from 'three';
import { buildWorld, R } from './world/world.js';
import { Character } from './character.js';
import { Player } from './player.js';
import { SPAWN } from './config.js';
import { Wardrobe, loadOutfit } from './ui/wardrobe.js';
import { SpireMatch } from './ui/spireMatch.js';

const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;

// ---------- renderer / scene ----------
const canvas = document.getElementById('scene');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
renderer.outputColorSpace = THREE.SRGBColorSpace;
const scene = new THREE.Scene();
scene.fog = new THREE.Fog('#9fd1c8', 70, 160);
const camera = new THREE.PerspectiveCamera(62, 1, 0.1, 1000);

scene.add(new THREE.HemisphereLight('#f4fff8', '#5d8a7a', 1.4));
const sun = new THREE.DirectionalLight('#fff6e6', 2.2);
scene.add(sun);
scene.add(sun.target);

// Wait for the display font so canvas signs render with it.
await Promise.race([document.fonts.load('64px "Dela Gothic One"'), new Promise((r) => setTimeout(r, 2500))]).catch(() => {});

const world = buildWorld(scene);
const jenny = new Character(loadOutfit());
const player = new Player(scene, jenny, SPAWN);

function resize() {
  const w = innerWidth, h = innerHeight;
  renderer.setSize(w, h, false);
  camera.aspect = w / h;
  camera.fov = w < h ? 75 : 62;
  camera.updateProjectionMatrix();
}
addEventListener('resize', resize);
resize();

// ---------- UI ----------
const $ = (id) => document.getElementById(id);
const titleEl = $('title'), hud = $('hud'), promptEl = $('prompt'), helpEl = $('help'), stickEl = $('stick');
let mode = 'title'; // title | walk | wardrobe | cards

const wardrobe = new Wardrobe($('wardrobe'), jenny, { onClose: () => setMode('walk') });
const cards = new SpireMatch($('cardgame'), { onClose: () => setMode('walk') });

function setMode(m) {
  mode = m;
  wardrobe.close();
  cards.close();
  hud.hidden = m === 'title';
  player.frozen = m !== 'walk';
  jenny.root.rotation.y = m === 'wardrobe' ? Math.PI : 0;
  if (m === 'wardrobe') wardrobe.open();
  if (m === 'cards') cards.open();
  if (m === 'walk') canvas.focus?.();
}

const enterBtn = $('enter');
enterBtn.disabled = false;
enterBtn.textContent = 'enter';
enterBtn.addEventListener('click', () => {
  titleEl.classList.add('leaving');
  setTimeout(() => (titleEl.hidden = true), 500);
  setMode('walk');
  if (!localStorage.getItem('jw.helped')) {
    helpEl.hidden = false;
    localStorage.setItem('jw.helped', '1');
    setTimeout(() => (helpEl.hidden = true), 7000);
  }
});
$('btn-wardrobe').addEventListener('click', () => setMode(mode === 'wardrobe' ? 'walk' : 'wardrobe'));
$('btn-help').addEventListener('click', () => (helpEl.hidden = !helpEl.hidden));

// ---------- input ----------
const keys = new Set();
addEventListener('keydown', (e) => {
  if (e.target.closest && e.target.closest('input, textarea')) return;
  keys.add(e.code);
  if (e.code === 'Escape' && (mode === 'wardrobe' || mode === 'cards')) setMode('walk');
  if (e.code === 'KeyE' && mode === 'walk') interact();
  if (mode === 'walk' && ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space'].includes(e.code)) e.preventDefault();
});
addEventListener('keyup', (e) => keys.delete(e.code));
addEventListener('blur', () => keys.clear());

// Touch / mouse drag joystick on the canvas
const stick = { active: false, id: null, x0: 0, y0: 0, dx: 0, dy: 0 };
canvas.addEventListener('pointerdown', (e) => {
  if (mode !== 'walk') return;
  stick.active = true; stick.id = e.pointerId;
  stick.x0 = e.clientX; stick.y0 = e.clientY; stick.dx = stick.dy = 0;
  canvas.setPointerCapture(e.pointerId);
  if (e.pointerType === 'touch') {
    stickEl.hidden = false;
    stickEl.style.left = `${e.clientX}px`; stickEl.style.top = `${e.clientY}px`;
    stickEl.firstElementChild.style.transform = '';
  }
});
canvas.addEventListener('pointermove', (e) => {
  if (!stick.active || e.pointerId !== stick.id) return;
  const max = 50;
  let dx = e.clientX - stick.x0, dy = e.clientY - stick.y0;
  const len = Math.hypot(dx, dy);
  if (len > max) { dx = (dx / len) * max; dy = (dy / len) * max; }
  stick.dx = dx / max; stick.dy = dy / max;
  stickEl.firstElementChild.style.transform = `translate(${dx}px, ${dy}px)`;
});
const endStick = () => { stick.active = false; stick.dx = stick.dy = 0; stickEl.hidden = true; };
canvas.addEventListener('pointerup', endStick);
canvas.addEventListener('pointercancel', endStick);

function readInput() {
  let forward = 0, turn = 0;
  if (keys.has('KeyW') || keys.has('ArrowUp')) forward += 1;
  if (keys.has('KeyS') || keys.has('ArrowDown')) forward -= 1;
  if (keys.has('KeyA') || keys.has('ArrowLeft')) turn -= 1;
  if (keys.has('KeyD') || keys.has('ArrowRight')) turn += 1;
  if (stick.active) {
    const dz = (v) => (Math.abs(v) < 0.15 ? 0 : v);
    forward += -dz(stick.dy);
    turn += dz(stick.dx) * 0.9;
  }
  return { forward: THREE.MathUtils.clamp(forward, -1, 1) * (forward < 0 ? 0.6 : 1), turn: THREE.MathUtils.clamp(turn, -1, 1) };
}

// ---------- doors ----------
let nearDoor = null;
function interact() {
  if (!nearDoor) return;
  if (nearDoor.place.kind === 'store') setMode('wardrobe');
  if (nearDoor.place.kind === 'cafe') setMode('cards');
}
promptEl.addEventListener('click', interact);

function checkDoors() {
  const pos = player.worldPos;
  let best = null, bestD = 3.2;
  for (const d of world.doors) {
    const dist = d.point.distanceTo(pos);
    if (dist < bestD) { best = d; bestD = dist; }
  }
  if (best !== nearDoor) {
    nearDoor = best;
    promptEl.hidden = !best || mode !== 'walk';
    if (best) promptEl.querySelector('span').textContent = best.place.prompt;
  }
  if (mode !== 'walk') promptEl.hidden = true;
  else if (nearDoor) promptEl.hidden = false;
}

// ---------- camera ----------
const camPos = new THREE.Vector3();
const camUp = new THREE.Vector3(0, 1, 0);
const look = new THREE.Vector3();
const tmp = new THREE.Vector3();
let camInit = false;

function cameraTargets(t) {
  const q = player.pivot.quaternion;
  if (mode === 'title') {
    const a = t * 0.05;
    const p = new THREE.Vector3(Math.sin(a) * 105, 30, Math.cos(a) * 105);
    return { pos: p, look: new THREE.Vector3(0, -6, 0), up: new THREE.Vector3(0, 1, 0) };
  }
  if (mode === 'wardrobe') {
    return {
      // Jenny turns to face the camera's usual (clear) side behind her.
      pos: innerWidth < 560 ? new THREE.Vector3(0, R + 1.6, -6.4).applyQuaternion(q) : new THREE.Vector3(0.5, R + 2.1, -4.4).applyQuaternion(q),
      look: new THREE.Vector3(innerWidth < 560 ? 0 : 1.1, innerWidth < 560 ? R - 0.3 : R + 1.2, 0).applyQuaternion(q),
      up: new THREE.Vector3(0, 1, 0).applyQuaternion(q),
    };
  }
  // Low, close over-the-shoulder view; the curve of the planet shows on the horizon.
  return {
    pos: new THREE.Vector3(0, R + 3.6, -7.2).applyQuaternion(q),
    look: new THREE.Vector3(0, R + 1.8, 3).applyQuaternion(q),
    up: new THREE.Vector3(0, 1, 0).applyQuaternion(q),
  };
}

// ---------- loop ----------
const clock = new THREE.Clock();
function frame() {
  const dt = Math.min(clock.getDelta(), 0.05);
  const t = clock.elapsedTime;

  player.update(dt, mode === 'walk' ? readInput() : { forward: 0, turn: 0 }, world.obstacles);
  world.update(reduceMotion ? 0 : t);
  if (mode === 'walk' || mode === 'wardrobe') checkDoors();

  const target = cameraTargets(t);
  const k = camInit ? 1 - Math.pow(0.0015, dt) : 1;
  camInit = true;
  const kk = mode === 'title' ? 1 : k;
  camPos.lerp(target.pos, kk);
  look.lerp(target.look, kk);
  camUp.lerp(target.up, kk).normalize();
  camera.position.copy(camPos);
  camera.up.copy(camUp);
  camera.lookAt(look);

  // Sun follows the player so the lit side is always where she is.
  tmp.copy(player.up);
  sun.position.copy(tmp.clone().multiplyScalar(R + 60).add(new THREE.Vector3(30, 20, 25)));
  sun.target.position.copy(tmp.multiplyScalar(R));

  renderer.render(scene, camera);
  requestAnimationFrame(frame);
}
frame();

// Debug handle for testing in the console
window.__jw = { player, jenny, setMode, world, cards };
