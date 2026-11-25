import { jennyChibi, enemyChibi, getLook } from './chibi.js';
// Hand-drawn-ish SVG art: card icons, Jenny's portrait, enemies, map icons.
const INK = '#1f2126';

export const ICONS = {
  blade: '<path d="M6 26 L23 9 L27 5 L26 10 L9 28 Z" fill="currentColor"/><path d="M5 22 l5 5 M4 28 l3 -3" stroke="currentColor" stroke-width="2.6" stroke-linecap="round"/>',
  shield: '<path d="M16 4 L27 8 V16 C27 22 22 27 16 29 C10 27 5 22 5 16 V8 Z" fill="currentColor"/>',
  bolt: '<path d="M18 3 L7 18 H15 L13 29 L25 13 H17 Z" fill="currentColor"/>',
  cup: '<path d="M8 10 H24 L22 27 C22 28 21 29 20 29 H12 C11 29 10 28 10 27 Z" fill="currentColor"/><path d="M17 10 L20 3" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"/><circle cx="13" cy="24" r="1.6" fill="#fff"/><circle cx="17" cy="25" r="1.6" fill="#fff"/><circle cx="19" cy="21" r="1.6" fill="#fff"/>',
  twin: '<path d="M4 24 L18 10 L21 7 L20 11 L7 27 Z M11 24 L25 10 L28 7 L27 11 L14 27 Z" fill="currentColor"/>',
  hammer: '<rect x="6" y="5" width="18" height="10" rx="2" fill="currentColor"/><rect x="13" y="14" width="4" height="15" rx="1.5" fill="currentColor"/>',
  drop: '<path d="M16 3 C21 11 25 15 25 20 A9 9 0 0 1 7 20 C7 15 11 11 16 3 Z" fill="currentColor"/><path d="M12 19 l3 3 l5 -6" stroke="#fff" stroke-width="2" fill="none"/>',
  hood: '<path d="M6 28 C6 14 9 6 16 6 C23 6 26 14 26 28 Z" fill="currentColor"/><path d="M8 9 L7 3 L12 7 Z M24 9 L25 3 L20 7 Z" fill="currentColor"/><ellipse cx="16" cy="19" rx="6" ry="7" fill="#f6d9c6"/>',
  eye: '<path d="M2 16 C8 7 24 7 30 16 C24 25 8 25 2 16 Z" fill="currentColor"/><circle cx="16" cy="16" r="5" fill="#fff"/><circle cx="16" cy="16" r="2.4" fill="currentColor"/>',
  swirl: '<path d="M16 16 m0 -2 a2 2 0 1 1 -2 2 a4 4 0 0 1 4 -4 a6 6 0 0 1 6 6 a8 8 0 0 1 -8 8 a10 10 0 0 1 -10 -10 a12 12 0 0 1 12 -12" stroke="currentColor" stroke-width="2.8" fill="none" stroke-linecap="round"/>',
  star: '<path d="M16 3 L19.5 12 L29 12.5 L21.5 18.5 L24 28 L16 22.5 L8 28 L10.5 18.5 L3 12.5 L12.5 12 Z" fill="currentColor"/>',
  rice: '<path d="M16 4 L28 26 H4 Z" fill="#fff" stroke="currentColor" stroke-width="2.4" stroke-linejoin="round"/><rect x="10" y="18" width="12" height="8" fill="currentColor"/>',
  bounce: '<circle cx="8" cy="22" r="4" fill="currentColor"/><path d="M8 22 L16 8 L24 22" stroke="currentColor" stroke-width="2.4" fill="none" stroke-dasharray="3 3"/><circle cx="24" cy="22" r="4" fill="currentColor"/>',
  shieldHit: '<path d="M12 5 L22 8 V15 C22 20 18 24 12 26 C6 24 2 20 2 15 V8 Z" fill="currentColor"/><path d="M22 12 L30 8 M23 17 L31 17 M22 22 L29 26" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"/>',
  flask: '<path d="M12 3 H20 M13 3 V12 L5 26 C4 28 5 29 7 29 H25 C27 29 28 28 27 26 L19 12 V3" stroke="currentColor" stroke-width="2.4" fill="none"/><path d="M8 22 H24 L26 27 H6 Z" fill="currentColor"/>',
  film: '<rect x="4" y="6" width="24" height="20" rx="2" fill="currentColor"/><rect x="9" y="11" width="14" height="10" fill="#fff"/><g fill="#fff">' + [7, 12, 17, 22].map((x) => `<rect x="${x}" y="7.5" width="2" height="2"/><rect x="${x}" y="22.5" width="2" height="2"/>`).join('') + '</g>',
  arrow: '<path d="M4 20 H20 V26 L30 16 L20 6 V12 H4 Z" fill="currentColor"/>',
  spike: '<path d="M16 2 L19 10 L27 6 L23 14 L31 17 L23 20 L26 28 L18 24 L16 31 L13 24 L6 28 L9 20 L1 17 L9 14 L5 6 L13 10 Z" fill="currentColor"/>',
  can: '<rect x="9" y="4" width="14" height="25" rx="3" fill="currentColor"/><path d="M17 9 L13 17 H17 L15 24" stroke="#fff" stroke-width="2" fill="none"/>',
  fire: '<path d="M16 3 C18 10 26 12 26 20 A10 10 0 0 1 6 20 C6 15 9 13 11 10 C11 14 13 16 15 16 C14 11 14 7 16 3 Z" fill="currentColor"/>',
  crit: '<path d="M16 2 L19 12 L30 12 L21 18 L25 29 L16 22 L7 29 L11 18 L2 12 L13 12 Z" fill="currentColor"/><text x="16" y="20" text-anchor="middle" font-size="9" font-weight="900" fill="#fff" font-family="sans-serif">!</text>',
  keys: '<rect x="2" y="8" width="28" height="16" rx="3" fill="currentColor"/><g fill="#fff">' + [5, 10, 15, 20, 25].map((x) => `<rect x="${x}" y="11" width="3" height="3"/>`).join('') + '<rect x="8" y="18" width="16" height="3"/></g>',
  fort: '<path d="M3 28 V12 L8 8 L13 12 V8 H19 V12 L24 8 L29 12 V28 Z" fill="currentColor"/><path d="M13 28 V21 A3 3 0 0 1 19 21 V28" fill="#fff"/>',
  camera: '<rect x="3" y="9" width="26" height="18" rx="3" fill="currentColor"/><rect x="10" y="5" width="12" height="6" rx="1" fill="currentColor"/><circle cx="16" cy="18" r="6" fill="#fff"/><circle cx="16" cy="18" r="3" fill="currentColor"/>',
  chip: '<rect x="8" y="8" width="16" height="16" rx="2" fill="currentColor"/>' + [11, 16, 21].map((p) => `<path d="M${p} 3 V8 M${p} 24 V29 M3 ${p} H8 M24 ${p} H29" stroke="currentColor" stroke-width="2"/>`).join('') + '<rect x="12" y="12" width="8" height="8" fill="#fff"/>',
  bug: '<ellipse cx="16" cy="18" rx="7" ry="9" fill="currentColor"/><circle cx="16" cy="8" r="4" fill="currentColor"/><path d="M9 14 L3 11 M9 19 L2 19 M9 24 L3 28 M23 14 L29 11 M23 19 L30 19 M23 24 L29 28 M14 5 L11 1 M18 5 L21 1" stroke="currentColor" stroke-width="2"/>',
  hourglass: '<path d="M7 3 H25 M7 29 H25 M9 3 C9 12 16 13 16 16 C16 19 9 20 9 29 M23 3 C23 12 16 13 16 16 C16 19 23 20 23 29" stroke="currentColor" stroke-width="2.4" fill="none"/><path d="M11 27 C12 22 20 22 21 27 Z" fill="currentColor"/>',
  mail: '<rect x="3" y="7" width="26" height="18" rx="2" fill="currentColor"/><path d="M4 8 L16 18 L28 8" stroke="#fff" stroke-width="2" fill="none"/>',
  bubbles: '<rect x="3" y="6" width="26" height="20" rx="4" fill="currentColor"/><g fill="#fff"><circle cx="9" cy="12" r="3"/><circle cx="16" cy="12" r="3"/><circle cx="23" cy="12" r="3"/><circle cx="9" cy="20" r="3"/><circle cx="16" cy="20" r="3"/><circle cx="23" cy="20" r="3"/></g>',
  upload: '<path d="M8 25 A6 6 0 0 1 7.5 13 A8.5 8.5 0 0 1 23.5 11 A7 7 0 0 1 24.5 25 Z" fill="currentColor"/><path d="M16 26 V15 M11.5 19.5 L16 15 L20.5 19.5" stroke="#fff" stroke-width="2.6" fill="none" stroke-linecap="round" stroke-linejoin="round"/>',
  helmet: '<path d="M6 28 C6 14 9 5 16 5 C23 5 26 14 26 28 Z" fill="currentColor"/><rect x="10" y="12" width="12" height="13" rx="3" fill="#fff"/><path d="M10 16.5 H22 M10 20.5 H22" stroke="currentColor" stroke-width="2"/><circle cx="16" cy="8.5" r="1.4" fill="#fff"/>',
  paper: '<path d="M7 3 H20 L26 9 V29 H7 Z" fill="currentColor"/><path d="M20 3 V9 H26" fill="#fff" opacity=".55"/><path d="M11 14 H21 M11 19 H21 M11 24 H17" stroke="#fff" stroke-width="2" stroke-linecap="round"/>',
  mic: '<rect x="11" y="3" width="10" height="16" rx="5" fill="currentColor"/><path d="M7 14 A9 9 0 0 0 25 14" stroke="currentColor" stroke-width="2.6" fill="none" stroke-linecap="round"/><path d="M16 23 V28 M11 29 H21" stroke="currentColor" stroke-width="2.6" stroke-linecap="round"/><path d="M14 7 V11" stroke="#fff" stroke-width="1.8" stroke-linecap="round"/>',
  uturn: '<path d="M23 28 C30 20 28 7 15 7 H11 V2 L3 10 L11 18 V13 H15 C22 13 24 19 20 25 Z" fill="currentColor"/>',
  loop: '<path d="M25 13 A10 10 0 0 0 7 11 M7 19 A10 10 0 0 0 25 21" stroke="currentColor" stroke-width="3" fill="none" stroke-linecap="round"/><path d="M4 5 L7 12 L13 9 M28 27 L25 20 L19 23" stroke="currentColor" stroke-width="3" fill="none" stroke-linecap="round" stroke-linejoin="round"/>',
  notes: '<path d="M12 24 V8 L27 4 V21" stroke="currentColor" stroke-width="2.6" fill="none"/><path d="M12 8 L27 4 V9 L12 13 Z" fill="currentColor"/><ellipse cx="8.5" cy="24" rx="4.2" ry="3.4" fill="currentColor"/><ellipse cx="23.5" cy="21" rx="4.2" ry="3.4" fill="currentColor"/>',
  comet: '<circle cx="22" cy="10" r="7" fill="currentColor"/><path d="M16 16 L4 28 M13 10 L4 15 M22 18 L17 27" stroke="currentColor" stroke-width="3" stroke-linecap="round"/><circle cx="20" cy="8" r="2" fill="#fff"/>',
  spot: '<path d="M10 3 H22 L20 10 H12 Z" fill="currentColor"/><path d="M12 10 L4 27 H28 L20 10 Z" fill="currentColor" opacity=".45"/><ellipse cx="16" cy="27.5" rx="12" ry="2.5" fill="currentColor"/>',
  snail: '<rect x="3" y="23" width="25" height="5" rx="2.5" fill="currentColor"/><circle cx="14" cy="15" r="9" fill="currentColor"/><path d="M14 15 m0 -1.6 a1.6 1.6 0 1 1 -1.6 1.6 a3.6 3.6 0 0 1 3.6 -3.6 a5.6 5.6 0 0 1 5.6 5.6" stroke="#fff" stroke-width="2" fill="none" stroke-linecap="round"/><path d="M25 23 L24 15 M27 23 L29 15" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><circle cx="24" cy="14.5" r="1.7" fill="currentColor"/><circle cx="29" cy="14.5" r="1.7" fill="currentColor"/>',
  skull: '<path d="M16 3 C8 3 4 9 4 15 C4 19 7 21 9 22 V28 H23 V22 C25 21 28 19 28 15 C28 9 24 3 16 3 Z" fill="currentColor"/><circle cx="11" cy="15" r="3.6" fill="#fff"/><circle cx="21" cy="15" r="3.6" fill="#fff"/><path d="M14 28 V24 M18 28 V24" stroke="#fff" stroke-width="2"/>',
  worm: '<g fill="currentColor"><circle cx="6" cy="24" r="3.4"/><circle cx="11" cy="20.5" r="3.8"/><circle cx="16.5" cy="18.5" r="4.1"/><circle cx="22" cy="15" r="4.4"/></g><circle cx="25" cy="9" r="5.5" fill="currentColor"/><circle cx="23.3" cy="8.4" r="1.4" fill="#fff"/><circle cx="27.2" cy="8.4" r="1.4" fill="#fff"/><path d="M25 3.5 L23 0.5 M26.5 3.6 L29 1" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>',
  static: '<path d="M2 16 L6 8 L10 22 L14 6 L18 26 L22 10 L26 20 L30 14" stroke="currentColor" stroke-width="2.6" fill="none" stroke-linejoin="round"/>',
};

export function icon(name, cls = '') {
  return `<svg class="${cls}" viewBox="0 0 32 32" aria-hidden="true">${ICONS[name] || ''}</svg>`;
}

// Jenny + enemies are drawn in the chibi vector style (see chibi.js).
export function jennySVG(opts = {}) { return jennyChibi(opts.look || getLook(), opts); }
export function enemySVG(art, color) { return enemyChibi(art, color); }

export const ROOM_ICONS = {
  fight: '<path d="M8 24 L22 10 L25 7 L24 11 L11 26 Z M24 24 L10 10 L7 7 L8 11 L21 26 Z" fill="currentColor"/>',
  elite: '<path d="M4 24 L6 9 L12 15 L16 5 L20 15 L26 9 L28 24 Z" fill="currentColor"/><rect x="4" y="25" width="24" height="3" fill="currentColor"/>',
  event: '<text x="16" y="25" text-anchor="middle" font-size="24" font-weight="900" font-family="sans-serif" fill="currentColor">?</text>',
  rest: '<path d="M4 22 H28 V26 H4 Z M6 22 V14 C6 12 8 11 10 11 H22 C24 11 26 12 26 14 V22" fill="currentColor"/><text x="23" y="9" font-size="9" font-weight="900" fill="currentColor" font-family="sans-serif">z</text>',
  shop: '<path d="M6 12 H26 L24 27 H8 Z" fill="currentColor"/><path d="M11 12 C11 6 21 6 21 12" stroke="currentColor" stroke-width="2.6" fill="none"/>',
  treasure: '<rect x="4" y="12" width="24" height="15" rx="2" fill="currentColor"/><path d="M4 12 C4 6 28 6 28 12" fill="currentColor"/><rect x="14" y="14" width="4" height="6" fill="#fff"/>',
  boss: '<circle cx="16" cy="15" r="11" fill="currentColor"/><circle cx="12" cy="14" r="3" fill="#fff"/><circle cx="20" cy="14" r="3" fill="#fff"/><rect x="11" y="22" width="10" height="5" fill="currentColor"/>',
};
export function roomIcon(type) {
  return `<svg viewBox="0 0 32 32" aria-hidden="true">${ROOM_ICONS[type]}</svg>`;
}
