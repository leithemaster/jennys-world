// Each boss gets its own look and sound for its fight:
//   bg     two colours for the room behind the fight (inner glow, outer edge)
//   fx     what floats around the room: { kind, glyphs?, color, dir } where kind is
//          'dot' (round sparks), 'puff' (soft clouds), 'glyph' (letters from glyphs),
//          'hex' (honeycomb cells); dir 'up' rises, 'down' falls, 'drift' wanders sideways
//   sting  the short tune that plays when the fight starts: notes are semitones from
//          A4 (0 = A4, 12 = A5, -12 = A3); an array inside the list is a chord
//   voice  a short sound each time the boss takes its turn
//   tag    the line under BOSS when the fight starts

export const BOSS_THEMES = {
  // ----- Floor 1 -----
  firewall: {
    tag: 'Hot hot hot', bg: ['#a3261c', '#3a0b0b'],
    fx: { kind: 'dot', color: '#ffb347', dir: 'up' },
    sting: { notes: [[-24, -17], [-24, -17], [-21, -14], [-17, -10]], type: 'sawtooth', step: 0.16, noise: true },
    voice: { notes: [-24], type: 'sawtooth' },
  },
  ramenThief: {
    tag: 'Hold on to your noodles', bg: ['#46406b', '#17142a'],
    fx: { kind: 'puff', color: '#ffffff', dir: 'up' },
    sting: { notes: [-12, -9, -8, -7, null, -12, 0], type: 'triangle', step: 0.1 },
    voice: { notes: [-8, -12], type: 'triangle' },
  },
  regular: {
    tag: 'Still here since opening', bg: ['#8a6a46', '#2e2216'],
    fx: { kind: 'glyph', glyphs: ['z', 'Z', '~'], color: '#f5deb3', dir: 'drift' },
    sting: { notes: [3, 7, 10, 14, [3, 7, 10, 14]], type: 'sine', step: 0.2 },
    voice: { notes: [10, 7], type: 'sine' },
  },
  // ----- Floor 2 -----
  hydra: {
    tag: 'Three heads, zero downtime', bg: ['#2f6e3a', '#0c1f10'],
    fx: { kind: 'glyph', glyphs: ['{', '}', '<', '>', '/'], color: '#8dff9c', dir: 'down' },
    sting: { notes: [[-9, -5, -2], [-7, -3, 0], [-5, -1, 2], null, [-17, -5]], type: 'square', step: 0.14 },
    voice: { notes: [[-9, -5]], type: 'square' },
  },
  dataMiner: {
    tag: 'Your data looks tasty', bg: ['#2d5c99', '#0b1730'],
    fx: { kind: 'glyph', glyphs: ['0', '1'], color: '#9cd0ff', dir: 'down' },
    sting: { notes: [12, 7, 12, 7, 0, 19], type: 'square', step: 0.07 },
    voice: { notes: [12, 7], type: 'square' },
  },
  serverAdmins: {
    tag: 'Your ticket has been closed', bg: ['#4b57b8', '#121638'],
    fx: { kind: 'glyph', glyphs: ['!', '?', '#'], color: '#ffd84d', dir: 'drift' },
    sting: { notes: [5, 0, 5, 0, [5, 12]], type: 'square', step: 0.12 },
    voice: { notes: [5, 0], type: 'square' },
  },
  // ----- Floor 3 -----
  moderator: {
    tag: 'Order in the chat', bg: ['#a3285f', '#2c0a1a'],
    fx: { kind: 'glyph', glyphs: ['X', 'x'], color: '#ff9cc4', dir: 'down' },
    sting: { notes: [[-26, -14], null, [-26, -14], [-21, -9], [-23, -11]], type: 'triangle', step: 0.17, noise: true },
    voice: { notes: [[-26, -14]], type: 'triangle' },
  },
  hivemind: {
    tag: 'We are many', bg: ['#3f7d45', '#0f2412'],
    fx: { kind: 'hex', color: '#c6f36b', dir: 'drift' },
    sting: { notes: [-12, -11, -12, -11, -7, [-12, -5]], type: 'sawtooth', step: 0.08 },
    voice: { notes: [-12, -11], type: 'sawtooth' },
  },
  // ----- Floor 4 -----
  netCafe: {
    tag: 'Closing time', bg: ['#6b3f8f', '#140a22'],
    fx: { kind: 'glyph', glyphs: ['★', 'Wi-Fi', '24/7', '♪'], color: '#ff8fd0', dir: 'drift' },
    sting: { notes: [-12, -5, 0, 3, 7, [0, 3, 7, 12], null, [-12, -5, 0]], type: 'square', step: 0.14, noise: true },
    voice: { notes: [-12, -5], type: 'square' },
  },
  bluescreen: {
    tag: 'A problem has occurred', bg: ['#2a6fd1', '#0a1c44'],
    fx: { kind: 'glyph', glyphs: [':(', '0x0', '?'], color: '#e8f1ff', dir: 'down' },
    sting: { notes: [7, 3, 0, -5, [-17, -12]], type: 'sine', step: 0.16 },
    voice: { notes: [0, -5], type: 'sine' },
  },
};

// A fixed layer behind the fight: the boss's colours plus its floating bits.
export function bossStage(id) {
  const th = BOSS_THEMES[id];
  if (!th) return '';
  const { kind, glyphs = [], color, dir } = th.fx;
  const bits = Array.from({ length: 16 }, (_, i) => {
    const g = kind === 'glyph' ? glyphs[i % glyphs.length] : '';
    const size = kind === 'glyph' ? 14 + ((i * 7) % 16) : 8 + ((i * 5) % 14);
    const style = `left:${(i * 61) % 100}%;--d:${7 + ((i * 3) % 7)}s;--delay:-${(i * 1.7) % 9}s;--s:${size}px;--sway:${(i % 2 ? 1 : -1) * (10 + (i % 4) * 8)}px;--y:${5 + ((i * 37) % 80)}%`;
    return `<i class="bit b-${kind} go-${dir}" style="${style}">${g}</i>`;
  }).join('');
  return `<div class="boss-stage" aria-hidden="true" style="--b1:${th.bg[0]};--b2:${th.bg[1]};--fx:${color}">${bits}</div>`;
}
