// Music + sound effects. The music is an MP3 that loops; every sound effect
// is synthesised on the fly with the Web Audio API (no sound files needed).
// Defaults: music 25%, effects 40%. Settings persist in localStorage.

const KEY = 'sm.audio';
const DEFAULTS = { music: 0.25, sfx: 0.4, musicOn: true, sfxOn: true, fast: false };
export const settings = { ...DEFAULTS, ...safeLoad() };

function safeLoad() {
  try { return JSON.parse(localStorage.getItem(KEY)) || {}; } catch { return {}; }
}
export function saveSettings() {
  localStorage.setItem(KEY, JSON.stringify(settings));
  applyMusicVolume();
}

// ---------- music ----------
export const music = new Audio(`${import.meta.env.BASE_URL}audio/her-shiba-are-her-knights.mp3`);
music.loop = true;
music.preload = 'auto';
let started = false;

function applyMusicVolume() {
  music.volume = settings.musicOn ? settings.music : 0;
  if (started) {
    if (settings.musicOn && settings.music > 0 && music.paused && !document.hidden) music.play().catch(() => {});
    if ((!settings.musicOn || settings.music === 0) && !music.paused) music.pause();
  }
}

// Browsers only allow audio after the first tap/click/key.
function unlock() {
  if (started) return;
  started = true;
  ctx();
  applyMusicVolume();
  if (settings.musicOn && settings.music > 0) music.play().catch(() => {});
}
['pointerdown', 'keydown'].forEach((e) => window.addEventListener(e, unlock, { once: false, passive: true }));
document.addEventListener('visibilitychange', () => {
  if (!started) return;
  if (document.hidden) music.pause();
  else applyMusicVolume();
});

// ---------- sound effects ----------
// Effects are scaled well below the music so 50% on the slider sits under it.
const SFX_HEADROOM = 0.35;
let ac = null;
let master = null;
function ctx() {
  if (!ac) {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;
    ac = new AC();
    master = ac.createGain();
    // Limiter so overlapping effects (hit + block + float) don't spike.
    const limiter = ac.createDynamicsCompressor();
    limiter.threshold.value = -24;
    limiter.knee.value = 12;
    limiter.ratio.value = 8;
    limiter.attack.value = 0.003;
    limiter.release.value = 0.15;
    master.connect(limiter);
    limiter.connect(ac.destination);
  }
  if (ac.state === 'suspended') ac.resume();
  return ac;
}

function tone({ freq = 440, to, type = 'sine', dur = 0.12, vol = 0.5, delay = 0, attack = 0.005 }) {
  const a = ctx(); if (!a) return;
  const t = a.currentTime + delay;
  const o = a.createOscillator();
  const g = a.createGain();
  o.type = type;
  o.frequency.setValueAtTime(freq, t);
  if (to) o.frequency.exponentialRampToValueAtTime(to, t + dur);
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(vol, t + attack);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  o.connect(g); g.connect(master);
  o.start(t); o.stop(t + dur + 0.02);
}

function noise({ dur = 0.15, vol = 0.4, delay = 0, filter = 1200, q = 0.8, type = 'lowpass', sweepTo, attack = 0 }) {
  const a = ctx(); if (!a) return;
  const t = a.currentTime + delay;
  const len = Math.floor(a.sampleRate * dur);
  const buf = a.createBuffer(1, len, a.sampleRate);
  const d = buf.getChannelData(0);
  for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
  const src = a.createBufferSource();
  src.buffer = buf;
  const f = a.createBiquadFilter();
  f.type = type; f.Q.value = q;
  f.frequency.setValueAtTime(filter, t);
  if (sweepTo) f.frequency.exponentialRampToValueAtTime(sweepTo, t + dur);
  const g = a.createGain();
  if (attack) { g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + attack); } else g.gain.setValueAtTime(vol, t);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  src.connect(f); f.connect(g); g.connect(master);
  src.start(t);
}

const SFX = {
  // buttons: a round little bubble pop
  click: () => { tone({ freq: 420, to: 880, type: 'sine', dur: 0.07, vol: 0.32, attack: 0.003 }); tone({ freq: 1760, type: 'sine', dur: 0.03, vol: 0.05, delay: 0.02 }); },
  // card flip: a gentle wooden-tile tok
  flip: () => { tone({ freq: 1150, to: 980, type: 'triangle', dur: 0.045, vol: 0.22, attack: 0.002 }); tone({ freq: 310, to: 240, type: 'sine', dur: 0.06, vol: 0.3, attack: 0.002 }); noise({ dur: 0.02, vol: 0.12, filter: 2500, type: 'bandpass', q: 3 }); },
  // petting: a little bark for the pups (small = higher yip), a soft heart chime for everyone else
  bark: (small) => { const k = small ? 1.35 : 1; tone({ freq: 560 * k, to: 330 * k, type: 'sawtooth', dur: 0.09, vol: 0.14, attack: 0.004 }); tone({ freq: 760 * k, to: 420 * k, type: 'square', dur: 0.07, vol: 0.06 }); noise({ dur: 0.05, vol: 0.12, filter: 1300, type: 'bandpass', q: 2 }); },
  pet: () => { [880, 1175, 1568].forEach((f, i) => tone({ freq: f, type: 'sine', dur: 0.14, vol: 0.12, delay: i * 0.05 })); },
  match: (combo = 1) => {
    const base = 523 * Math.pow(2, Math.min(combo - 1, 7) / 12 * 2);
    tone({ freq: base, type: 'triangle', dur: 0.12, vol: 0.32 });
    tone({ freq: base * 1.26, type: 'triangle', dur: 0.12, vol: 0.28, delay: 0.07 });
    tone({ freq: base * 1.5, type: 'triangle', dur: 0.22, vol: 0.26, delay: 0.14 });
  },
  miss: () => { tone({ freq: 330, to: 220, type: 'square', dur: 0.16, vol: 0.12 }); tone({ freq: 247, to: 165, type: 'square', dur: 0.2, vol: 0.1, delay: 0.1 }); },
  hit: () => { noise({ dur: 0.14, vol: 0.5, filter: 1800, sweepTo: 300 }); tone({ freq: 180, to: 70, type: 'sine', dur: 0.16, vol: 0.5 }); },
  hurt: () => { noise({ dur: 0.22, vol: 0.45, filter: 900, sweepTo: 200 }); tone({ freq: 140, to: 55, type: 'sawtooth', dur: 0.22, vol: 0.18 }); },
  block: () => { tone({ freq: 880, to: 840, type: 'square', dur: 0.05, vol: 0.12 }); noise({ dur: 0.12, vol: 0.25, filter: 4000, type: 'highpass' }); },
  shield: () => { tone({ freq: 392, to: 523, type: 'triangle', dur: 0.18, vol: 0.25 }); },
  heal: () => { [523, 659, 784, 1046].forEach((f, i) => tone({ freq: f, type: 'sine', dur: 0.2, vol: 0.18, delay: i * 0.06 })); },
  energy: () => { tone({ freq: 440, to: 1320, type: 'sawtooth', dur: 0.16, vol: 0.1 }); tone({ freq: 880, type: 'sine', dur: 0.14, vol: 0.12, delay: 0.1 }); },
  debuff: () => { tone({ freq: 600, to: 300, type: 'sine', dur: 0.3, vol: 0.18 }); tone({ freq: 610, to: 290, type: 'sine', dur: 0.3, vol: 0.12 }); },
  buff: () => { tone({ freq: 220, to: 440, type: 'sawtooth', dur: 0.25, vol: 0.12 }); },
  scramble: () => { for (let i = 0; i < 6; i++) noise({ dur: 0.06, vol: 0.25, filter: 1500 + i * 400, type: 'bandpass', q: 2, delay: i * 0.05 }); },
  junk: () => { tone({ freq: 200, type: 'square', dur: 0.08, vol: 0.12 }); tone({ freq: 150, type: 'square', dur: 0.1, vol: 0.12, delay: 0.09 }); },
  clear: () => { [523, 659, 784, 1046, 1318].forEach((f, i) => tone({ freq: f, type: 'triangle', dur: 0.16, vol: 0.2, delay: i * 0.05 })); },
  coin: () => { tone({ freq: 988, type: 'square', dur: 0.07, vol: 0.1 }); tone({ freq: 1318, type: 'square', dur: 0.18, vol: 0.1, delay: 0.07 }); },
  pick: () => { tone({ freq: 659, type: 'triangle', dur: 0.1, vol: 0.25 }); tone({ freq: 988, type: 'triangle', dur: 0.18, vol: 0.22, delay: 0.08 }); },
  turn: () => tone({ freq: 392, to: 494, type: 'triangle', dur: 0.12, vol: 0.18 }),
  win: () => { [523, 659, 784, 659, 784, 1046].forEach((f, i) => tone({ freq: f, type: 'triangle', dur: 0.2, vol: 0.25, delay: i * 0.1 })); },
  lose: () => { [392, 349, 311, 262].forEach((f, i) => tone({ freq: f, type: 'triangle', dur: 0.35, vol: 0.22, delay: i * 0.2 })); },
  // boss fights: a tune from src/ui/bossThemes.js (notes in semitones from A4; an array is a chord)
  motif: ({ notes, type = 'triangle', step = 0.12, noise: crackle } = {}, quiet = false) => {
    const v = quiet ? 0.5 : 1;
    const hz = (n) => 440 * Math.pow(2, n / 12);
    notes.forEach((n, i) => {
      if (n === null) return; // a rest
      const last = i === notes.length - 1;
      const chord = Array.isArray(n) ? n : [n];
      const vol = (type === 'sine' || type === 'triangle' ? 0.24 : 0.09) * v / Math.sqrt(chord.length);
      chord.forEach((m) => tone({ freq: hz(m), type, dur: last ? step * 3 : step * 0.9, vol, delay: i * step }));
    });
    if (crackle && !quiet) noise({ dur: 0.5, vol: 0.18, filter: 2400, type: 'bandpass', q: 0.7, sweepTo: 600 });
  },
  // the final blow on a boss: a deep boom, then a sparkle
  ko: () => {
    tone({ freq: 150, to: 38, type: 'sine', dur: 0.9, vol: 0.6 });
    tone({ freq: 90, to: 30, type: 'triangle', dur: 0.8, vol: 0.3 });
    noise({ dur: 0.6, vol: 0.5, filter: 2200, sweepTo: 120 });
    [1046, 1318, 1568, 2093].forEach((f, i) => tone({ freq: f, type: 'triangle', dur: 0.3, vol: 0.12, delay: 0.55 + i * 0.07 }));
  },
  enter: () => { tone({ freq: 330, type: 'triangle', dur: 0.1, vol: 0.2 }); tone({ freq: 494, type: 'triangle', dur: 0.16, vol: 0.2, delay: 0.08 }); },
};

export function sfx(name, ...args) {
  if (!settings.sfxOn || settings.sfx <= 0) return;
  const a = ctx(); if (!a) return;
  master.gain.value = settings.sfx * SFX_HEADROOM;
  SFX[name]?.(...args);
}

// Slow-mo: the music drops in pitch and speed for a moment, then comes back.
let slowTimer = null;
export function musicSlowMo(holdMs = 900) {
  if (music.paused) return;
  music.preservesPitch = false; music.webkitPreservesPitch = false; music.mozPreservesPitch = false;
  clearInterval(slowTimer);
  const ramp = (from, to, ms, then) => {
    const t0 = performance.now();
    slowTimer = setInterval(() => {
      const k = Math.min(1, (performance.now() - t0) / ms);
      music.playbackRate = from + (to - from) * k;
      if (k >= 1) { clearInterval(slowTimer); then?.(); }
    }, 30);
  };
  ramp(music.playbackRate, 0.55, 250, () => { slowTimer = setTimeout(() => ramp(0.55, 1, 900), holdMs); });
}
