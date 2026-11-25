// Charm icons: tiny flat vector stickers (ink outline, flat fill, one shine).
const K = '#1a1420';
const s = (fill, w = 1.8) => `fill="${fill}" stroke="${K}" stroke-width="${w}" stroke-linejoin="round" stroke-linecap="round"`;
const shine = (x, y, r = 1.6) => `<circle cx="${x}" cy="${y}" r="${r}" fill="#fff" opacity=".9"/>`;
const line = (d, w = 1.8) => `<path d="${d}" fill="none" stroke="${K}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round"/>`;

const I = {
  // Haru's Gift
  moonPin: `<path d="M18 5 a11 11 0 1 0 9 17 a9 9 0 1 1 -9 -17z" ${s('#f49ab6')}/>${shine(10, 11)}`,
  scarf: `<path d="M6 10 C12 6 20 6 26 10 L24 15 C18 12 14 12 8 15 Z" ${s('#ff6b6b')}/><path d="M18 13 L22 27 L17 27 L14 14 Z" ${s('#ff6b6b')}/>${line('M17 27 v2 M19.5 27 v2')}`,
  luckyCoin: `<circle cx="16" cy="16" r="11" ${s('#ffc53d')}/><circle cx="16" cy="16" r="6.5" fill="none" stroke="${K}" stroke-width="1.6"/>${line('M16 12.5 v7')}${shine(10, 10)}`,
  glitchPen: `<path d="M8 24 L22 6 L26 10 L12 28 L6 29 Z" ${s('#4fd1b9')}/>${line('M8 24 L12 28')}<rect x="23" y="20" width="4" height="4" ${s('#a98bf0', 1.4)}/><rect x="25" y="26" width="3" height="3" ${s('#f49ab6', 1.2)}/>`,
  puffyJacket: `<path d="M10 7 L16 10 L22 7 L28 13 L25 17 L23 15 V27 H9 V15 L7 17 L4 13 Z" ${s('#6ec3ff')}/>${line('M16 10 V27 M9 19 H23')}`,
  rhythmBracelet: `<ellipse cx="16" cy="16" rx="11" ry="8" fill="none" stroke="${K}" stroke-width="5"/><ellipse cx="16" cy="16" rx="11" ry="8" fill="none" stroke="#a98bf0" stroke-width="2.4"/>${[[5, 16], [16, 8], [27, 16], [16, 24]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="2.6" ${s('#ffc53d', 1.4)}/>`).join('')}`,
  thermos: `<rect x="10" y="7" width="12" height="21" rx="3" ${s('#4fd1b9')}/><rect x="11.5" y="4" width="9" height="4" rx="1" ${s('#f49ab6', 1.6)}/>${line('M10 13 H22')}${shine(13, 17)}`,
  spareBattery: `<rect x="5" y="10" width="20" height="12" rx="2.5" ${s('#fff4e6')}/><rect x="25" y="13.5" width="3" height="5" rx="1" ${s(K, 1.2)}/><rect x="7.5" y="12.5" width="6" height="7" rx="1" fill="#ff5d8f"/>`,
  sketchbook: `<rect x="7" y="5" width="18" height="23" rx="2" ${s('#ffc53d')}/>${line('M11 5 v23')}<path d="M14 18 L18 11 L21 15 L23 13" fill="none" stroke="${K}" stroke-width="1.6" stroke-linecap="round"/>`,
  pillowPet: `<path d="M6 18 C4 10 10 7 16 9 C22 7 28 10 26 18 C28 24 22 27 16 25 C10 27 4 24 6 18 Z" ${s('#fff4e6')}/><circle cx="13" cy="17" r="1.3" fill="${K}"/><circle cx="19" cy="17" r="1.3" fill="${K}"/>${line('M15 20.5 q1 1 2 0', 1.4)}`,
  shibaCharm: `<path d="M7 12 L9 4 L14 9 M25 12 L23 4 L18 9" ${s('#f0a04b')}/><circle cx="16" cy="17" r="10" ${s('#f0a04b')}/><ellipse cx="16" cy="21" rx="6" ry="4.5" fill="#fff4e6"/><circle cx="12" cy="15" r="1.3" fill="${K}"/><circle cx="20" cy="15" r="1.3" fill="${K}"/><circle cx="16" cy="19" r="1.4" fill="${K}"/>`,
  giftCard: `<rect x="5" y="12" width="22" height="15" rx="2" ${s('#ff5d8f')}/><rect x="4" y="9" width="24" height="5" rx="1.5" ${s('#ff5d8f')}/>${line('M16 9 V27')}<path d="M16 9 C12 3 8 6 11 9 M16 9 C20 3 24 6 21 9" fill="none" stroke="${K}" stroke-width="1.8" stroke-linecap="round"/>`,

  sleepMask: `<path d="M4 13 C4 9 10 8 16 10 C22 8 28 9 28 13 C28 19 22 21 16 18 C10 21 4 19 4 13 Z" ${s('#a98bf0')}/>${line('M8 14 q3 2 6 0 M18 14 q3 2 6 0', 1.5)}${line('M4 13 L1 11 M28 13 L31 11')}<text x="24" y="8" font-size="7" font-weight="900" fill="${K}" font-family="sans-serif">z</text>`,
  hotWaterBottle: `<path d="M9 10 H23 C26 10 27 13 27 16 V24 C27 27 25 28 22 28 H10 C7 28 5 27 5 24 V16 C5 13 6 10 9 10 Z" ${s('#ff8f6b')}/><rect x="13" y="5" width="6" height="5" rx="1" ${s('#fff4e6', 1.6)}/>${line('M10 17 q2 -2 4 0 t4 0 t4 0 M10 22 q2 -2 4 0 t4 0 t4 0', 1.4)}`,
  gossipPhone: `<rect x="9" y="3" width="14" height="26" rx="3" ${s('#ff5d8f')}/><rect x="11.5" y="6.5" width="9" height="15" rx="1" fill="#fff4e6"/>${line('M13 11 h6 M13 14 h4', 1.4)}<circle cx="16" cy="25" r="1.4" fill="${K}"/>`,

  // drops
  luckyCat: `<path d="M8 12 L9 4 L14 9 M24 12 L23 4 L18 9" ${s('#fff4e6')}/><circle cx="16" cy="17" r="10" ${s('#fff4e6')}/>${line('M11 15 q1.5 -1.5 3 0 M18 15 q1.5 -1.5 3 0', 1.5)}<circle cx="16" cy="19" r="1.2" fill="#ff5d8f"/><path d="M24 20 L29 15" stroke="${K}" stroke-width="3" stroke-linecap="round"/>`,
  americano: `<path d="M9 9 H23 L21 28 H11 Z" ${s('#8a5a3c')}/><rect x="8" y="6" width="16" height="4" rx="1.5" ${s('#fff4e6', 1.6)}/>${line('M18 6 L21 1')}${[[13, 16], [18, 19], [14, 23]].map(([x, y]) => `<rect x="${x}" y="${y}" width="3.4" height="3.4" fill="#cfefff" stroke="${K}" stroke-width="1"/>`).join('')}`,
  bandage: `<rect x="3" y="11" width="26" height="10" rx="5" transform="rotate(-35 16 16)" ${s('#ffd2b0')}/><rect x="11" y="12" width="10" height="8" transform="rotate(-35 16 16)" fill="#f5b78f"/>${line('M14 15 h0.1 M17 17 h0.1 M15 18 h0.1', 1.6)}`,
  keychain: `<circle cx="11" cy="11" r="6" fill="none" stroke="${K}" stroke-width="2.4"/><path d="M15 15 L26 26 M22 22 L19 25 M25 25 L22 28" stroke="${K}" stroke-width="2.4" stroke-linecap="round"/><path d="M5 5 l2 2 M17 5 l-2 2 M5 17 l2 -2" stroke="#ffc53d" stroke-width="2" stroke-linecap="round"/>`,
  hairclip: `<path d="M16 16 C10 8 3 10 5 16 C3 22 10 24 16 16 Z" ${s('#ff5d8f')}/><path d="M16 16 C22 8 29 10 27 16 C29 22 22 24 16 16 Z" ${s('#ff5d8f')}/><circle cx="16" cy="16" r="3" ${s('#ffc53d', 1.6)}/>`,
  purse: `<path d="M6 13 H26 L24 27 H8 Z" ${s('#a98bf0')}/>${line('M11 13 C11 6 21 6 21 13')}<circle cx="16" cy="19" r="2.4" ${s('#ffc53d', 1.4)}/>`,
  stickers: `<path d="M16 4 L19.5 12 L28 12.6 L21.4 18.2 L23.6 27 L16 22.4 L8.4 27 L10.6 18.2 L4 12.6 L12.5 12 Z" ${s('#ffc53d')}/>${shine(13, 12, 1.4)}`,
  mint: `<rect x="5" y="9" width="22" height="15" rx="4" ${s('#4fd1b9')}/><rect x="8" y="12" width="16" height="9" rx="2" fill="#c4f5ee"/>${line('M12 16.5 h8', 1.6)}`,
  strap: `<rect x="10" y="4" width="12" height="20" rx="3" ${s('#2b2142')}/><rect x="12" y="7" width="8" height="12" rx="1" fill="#6ec3ff"/><path d="M14 24 C10 30 22 30 18 24" fill="none" stroke="#ff5d8f" stroke-width="2.4" stroke-linecap="round"/>`,
  tamago: `<ellipse cx="16" cy="17" rx="10" ry="12" ${s('#fff4e6')}/><path d="M7 19 l3 -2.5 l3 2.5 l3 -2.5 l3 2.5 l3 -2.5 l3 2.5" fill="none" stroke="${K}" stroke-width="1.6" stroke-linejoin="round"/><circle cx="12" cy="12" r="1.1" fill="${K}"/><circle cx="19" cy="12" r="1.1" fill="${K}"/>`,
  glowstick: `<rect x="13" y="3" width="6" height="26" rx="3" transform="rotate(30 16 16)" ${s('#9cff8a')}/>${shine(11, 9, 1.3)}<path d="M25 6 l2 -2 M27 11 h3 M5 25 l-2 2" stroke="#9cff8a" stroke-width="2" stroke-linecap="round"/>`,
  lipTint: `<rect x="10" y="15" width="12" height="13" rx="2" ${s('#2b2142')}/><path d="M12 15 V8 C12 5 20 3 20 6 V15 Z" ${s('#ff5d8f')}/>${shine(14, 9, 1.2)}`,
  venomVial: `<path d="M12 4 H20 M13 4 V12 L7 25 C6 28 8 29 10 29 H22 C24 29 26 28 25 25 L19 12 V4" ${s('#9cff8a')}/>${line('M9 20 H23', 1.6)}<circle cx="14" cy="24" r="1.4" fill="${K}"/><circle cx="19" cy="22" r="1" fill="${K}"/>`,
  fuzzySocks: `<path d="M10 4 H19 V17 L25 21 C28 23 26 28 22 27 L12 24 C9 23 10 20 10 18 Z" ${s('#ff9ec0')}/><rect x="9.5" y="4" width="10" height="5" rx="1.5" ${s('#fff4e6', 1.6)}/>`,
  powerBank: `<rect x="8" y="5" width="16" height="23" rx="3" ${s('#6ec3ff')}/><path d="M17 9 L12 17 H16 L14 24 L20 15 H16 Z" ${s('#ffc53d', 1.4)}/>`,

  // shop only
  memberCard: `<rect x="3" y="8" width="26" height="17" rx="3" ${s('#a98bf0')}/><rect x="3" y="12" width="26" height="4" fill="${K}"/>${line('M7 21 h8', 1.6)}<path d="M23 5 l1.2 2.4 2.6 .4 -1.9 1.8 .5 2.6 -2.4 -1.3 -2.4 1.3 .5 -2.6 -1.9 -1.8 2.6 -.4z" ${s('#ffc53d', 1)}/>`,
  stampCard: `<rect x="4" y="7" width="24" height="18" rx="2.5" ${s('#fff4e6')}/>${[[9, 13], [16, 13], [23, 13], [9, 20], [16, 20]].map(([x, y], i) => `<circle cx="${x}" cy="${y}" r="2.6" fill="${i < 3 ? '#ff5d8f' : 'none'}" stroke="${K}" stroke-width="1.3"/>`).join('')}`,
  kimbap: `<circle cx="16" cy="16" r="11" ${s('#2b2142')}/><circle cx="16" cy="16" r="7.5" fill="#fff4e6"/><circle cx="16" cy="16" r="2.4" fill="#ffc53d"/><circle cx="12.5" cy="14" r="1.6" fill="#4fd1b9"/><circle cx="19" cy="18.5" r="1.6" fill="#ff6b6b"/>`,
  neon: `<rect x="4" y="7" width="24" height="18" rx="4" ${s('#2b2142')}/><path d="M9 20 V12 L15 20 V12 M19 12 V20 M19 12 h4 M19 16 h3" fill="none" stroke="#ff5d8f" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>`,
  snackBag: `<path d="M8 6 H24 L26 28 H6 Z" ${s('#ffc53d')}/>${line('M8 6 L10 9 L12 6 L14 9 L16 6 L18 9 L20 6 L22 9 L24 6', 1.4)}<circle cx="16" cy="18" r="4" ${s('#ff6b6b', 1.4)}/>`,
  neckPillow: `<path d="M16 6 C5 6 3 20 9 25 C12 27 14 24 12 21 C10 17 12 12 16 12 C20 12 22 17 20 21 C18 24 20 27 23 25 C29 20 27 6 16 6 Z" ${s('#a98bf0')}/>${shine(10, 11)}`,
  shibaPlush: `<path d="M7 11 L8 3 L13 8 M25 11 L24 3 L19 8" ${s('#fff4e6')}/><circle cx="16" cy="17" r="10" ${s('#fff4e6')}/><circle cx="12" cy="15" r="1.3" fill="${K}"/><circle cx="20" cy="15" r="1.3" fill="${K}"/><circle cx="16" cy="19" r="1.4" fill="${K}"/><ellipse cx="10" cy="20" rx="2" ry="1.2" fill="#ff9ec0"/><ellipse cx="22" cy="20" rx="2" ry="1.2" fill="#ff9ec0"/>`,

  // boss
  chair: `<path d="M10 4 H22 C24 4 24 6 24 8 V17 H8 V8 C8 6 8 4 10 4 Z" ${s('#ff5d8f')}/><rect x="7" y="16" width="18" height="5" rx="2" ${s('#2b2142')}/>${line('M16 21 V27 M10 28 H22')}`,
  keyboard: `<rect x="3" y="9" width="26" height="15" rx="3" ${s('#fff4e6')}/>${[7, 11, 15, 19, 23].map((x) => `<rect x="${x}" y="12" width="3" height="3" rx=".6" fill="#a98bf0"/>`).join('')}<rect x="9" y="18" width="14" height="3" rx="1" fill="#ff5d8f"/>`,
  headset: `<path d="M6 18 C6 8 26 8 26 18" fill="none" stroke="${K}" stroke-width="3.2" stroke-linecap="round"/><rect x="3.5" y="16" width="6" height="10" rx="2.5" ${s('#4fd1b9')}/><rect x="22.5" y="16" width="6" height="10" rx="2.5" ${s('#4fd1b9')}/>`,
  plush: `<circle cx="9" cy="9" r="4" ${s('#c98b5e')}/><circle cx="23" cy="9" r="4" ${s('#c98b5e')}/><circle cx="16" cy="17" r="11" ${s('#c98b5e')}/><ellipse cx="16" cy="21" rx="5" ry="3.6" fill="#f2d2b4"/><circle cx="12" cy="15" r="1.4" fill="${K}"/><circle cx="20" cy="15" r="1.4" fill="${K}"/><circle cx="16" cy="19.5" r="1.4" fill="${K}"/>`,
};

export function charmIcon(id, cls = '') {
  return `<svg class="ci ${cls}" viewBox="0 0 32 32" aria-hidden="true">${I[id] || I.stickers}</svg>`;
}

// small UI icons (replace unicode glyphs)
export const UI_ICONS = {
  heart: `<path d="M16 28 C6 21 3 16 3 11 C3 7 6 4 9.5 4 C12.5 4 14.5 6 16 8.5 C17.5 6 19.5 4 22.5 4 C26 4 29 7 29 11 C29 16 26 21 16 28 Z" ${s('#ff5d6e', 2.2)}/>${shine(9, 10, 2)}`,
  coin: `<circle cx="16" cy="16" r="12" ${s('#ffc53d', 2.2)}/><circle cx="16" cy="16" r="7" fill="none" stroke="${K}" stroke-width="1.8"/>${shine(10, 10, 2)}`,
  gear: `<path d="M14 3 H18 L19 7 L22.5 8.5 L26 6.5 L28.5 9.5 L26.5 13 L28 16 L29 19 L25.5 20 L24 23.5 L26 27 L23 29 L19.5 27 L16 28 L13 29 L12 25.5 L8.5 24 L5 26 L3 23 L5.5 19.5 L4 16 L3 13 L6.5 12 L8 8.5 L6 5 L9 3 L12.5 5 Z" ${s('#fff4e6', 2)}/><circle cx="16" cy="16" r="4.5" ${s('#a98bf0', 1.8)}/>`,
  menu: `<rect x="5" y="7" width="22" height="4" rx="2" fill="${K}"/><rect x="5" y="14" width="22" height="4" rx="2" fill="${K}"/><rect x="5" y="21" width="22" height="4" rx="2" fill="${K}"/>`,
  eye: `<path d="M2 16 C8 7 24 7 30 16 C24 25 8 25 2 16 Z" ${s('#fff4e6', 2)}/><circle cx="16" cy="16" r="5" ${s('#4fd1b9', 1.8)}/><circle cx="16" cy="16" r="2" fill="${K}"/>`,
  shield: `<path d="M16 3 L27 7 V15 C27 22 22 27 16 29 C10 27 5 22 5 15 V7 Z" ${s('#6ec3ff', 2.2)}/>${shine(11, 10, 1.8)}`,
};
export function uiIcon(name, cls = '') {
  return `<svg class="ui-i ${cls}" viewBox="0 0 32 32" aria-hidden="true">${UI_ICONS[name]}</svg>`;
}
