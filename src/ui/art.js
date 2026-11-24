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
  static: '<path d="M2 16 L6 8 L10 22 L14 6 L18 26 L22 10 L26 20 L30 14" stroke="currentColor" stroke-width="2.6" fill="none" stroke-linejoin="round"/>',
};

export function icon(name, cls = '') {
  return `<svg class="${cls}" viewBox="0 0 32 32" aria-hidden="true">${ICONS[name] || ''}</svg>`;
}

// Jenny: original chibi portrait with a cat-ear hood and crescent-moon pin.
export function jennySVG() {
  return `<svg viewBox="0 0 120 120" aria-hidden="true">
    <path d="M18 118 C18 88 34 78 60 78 C86 78 102 88 102 118 Z" fill="#2a2830" stroke="${INK}" stroke-width="3"/>
    <path d="M60 84 V118" stroke="#4a4652" stroke-width="2"/>
    <path d="M22 62 C20 28 36 12 60 12 C84 12 100 28 98 62 C98 82 84 92 60 92 C36 92 22 82 22 62 Z" fill="#2a2830" stroke="${INK}" stroke-width="3"/>
    <path d="M28 30 L24 6 L44 20 Z M92 30 L96 6 L76 20 Z" fill="#2a2830" stroke="${INK}" stroke-width="3" stroke-linejoin="round"/>
    <path d="M30 24 L28 12 L38 20 Z M90 24 L92 12 L82 20 Z" fill="#f3a6bd"/>
    <ellipse cx="60" cy="60" rx="29" ry="27" fill="#f6d9c6" stroke="${INK}" stroke-width="2.5"/>
    <path d="M31 54 C34 36 48 30 62 32 C76 33 88 40 89 54 C80 46 72 44 66 38 C62 46 46 50 31 54 Z" fill="#3a2c4a"/>
    <path d="M32 54 C30 66 30 74 34 82 L40 78 C36 70 36 62 37 56 Z M88 54 C90 66 90 74 86 82 L80 78 C84 70 84 62 83 56 Z" fill="#3a2c4a"/>
    <circle cx="35" cy="82" r="4" fill="#b8a3d9"/><circle cx="85" cy="82" r="4" fill="#b8a3d9"/>
    <ellipse cx="49" cy="62" rx="4.5" ry="6.5" fill="${INK}"/><ellipse cx="71" cy="62" rx="4.5" ry="6.5" fill="${INK}"/>
    <circle cx="50.5" cy="59.5" r="1.6" fill="#fff"/><circle cx="72.5" cy="59.5" r="1.6" fill="#fff"/>
    <ellipse cx="42" cy="72" rx="5" ry="3" fill="#f2a7a7" opacity=".7"/><ellipse cx="78" cy="72" rx="5" ry="3" fill="#f2a7a7" opacity=".7"/>
    <path d="M56 74 Q60 78 64 74" stroke="${INK}" stroke-width="2.2" fill="none" stroke-linecap="round"/>
    <path d="M86 26 a7 7 0 1 0 6 11 a5.5 5.5 0 1 1 -6 -11z" fill="#f3a6bd" stroke="${INK}" stroke-width="1.5"/>
  </svg>`;
}

const eyes = (y = 52, dx = 10, cx = 52) => `<circle cx="${cx - dx}" cy="${y}" r="5" fill="${INK}"/><circle cx="${cx + dx}" cy="${y}" r="5" fill="${INK}"/><circle cx="${cx - dx + 1.6}" cy="${y - 1.8}" r="1.7" fill="#fff"/><circle cx="${cx + dx + 1.6}" cy="${y - 1.8}" r="1.7" fill="#fff"/>`;
const angry = (y = 50, cx = 52) => `<path d="M${cx - 18} ${y - 12} L${cx - 5} ${y - 7} M${cx + 18} ${y - 12} L${cx + 5} ${y - 7}" stroke="${INK}" stroke-width="3.5" stroke-linecap="round"/>`;
const S = `stroke="${INK}" stroke-width="4" stroke-linejoin="round"`;

export function enemySVG(art, color) {
  const c = color;
  let body = '';
  switch (art) {
    case 'slime':
      body = `<path d="M10 92 C8 58 26 26 52 26 C78 26 96 58 94 92 Z" fill="${c}" ${S}/><rect x="66" y="36" width="10" height="6" fill="#c7a6ff"/><rect x="22" y="64" width="9" height="6" fill="#f3a6bd"/>${eyes(56)}<path d="M44 70 q8 7 16 0" stroke="${INK}" stroke-width="3" fill="none"/>`;
      break;
    case 'gremlin':
      body = `<path d="M22 38 L10 10 L38 28 Z M82 38 L94 10 L66 28 Z" fill="${c}" ${S}/><ellipse cx="52" cy="60" rx="38" ry="32" fill="${c}" ${S}/>${eyes(56)}${angry(54)}<path d="M38 74 l7 -6 l7 6 l7 -6 l7 6" stroke="${INK}" stroke-width="3" fill="none"/>`;
      break;
    case 'wraith':
      body = `<path d="M18 96 V38 C18 18 32 8 52 8 C72 8 86 18 86 38 V96 L76 86 L66 96 L56 86 L46 96 L36 86 L26 96 Z" fill="${c}" ${S}/><rect x="24" y="20" width="56" height="11" fill="#4a6fa5" stroke="${INK}" stroke-width="2.5"/><path d="M71 23 l5 5 m0 -5 l-5 5" stroke="#fff" stroke-width="2"/>${eyes(54)}<ellipse cx="52" cy="72" rx="6" ry="8" fill="${INK}"/>`;
      break;
    case 'bot':
      body = `<path d="M52 6 V18" stroke="${INK}" stroke-width="4"/><circle cx="52" cy="6" r="5" fill="#f2c94c" stroke="${INK}" stroke-width="3"/><rect x="16" y="18" width="72" height="56" rx="12" fill="${c}" ${S}/><rect x="26" y="30" width="52" height="30" rx="6" fill="#2a2830"/><rect x="34" y="38" width="10" height="10" fill="#7de0d3"/><rect x="60" y="38" width="10" height="10" fill="#7de0d3"/><rect x="30" y="74" width="44" height="22" fill="#fff" ${S}/><path d="M30 74 L52 88 L74 74" stroke="${INK}" stroke-width="3" fill="none"/>`;
      break;
    case 'cookie':
      body = `<circle cx="52" cy="54" r="40" fill="${c}" ${S}/><path d="M80 20 a12 12 0 0 0 12 18" fill="#9fd1c8" stroke="${INK}" stroke-width="4"/>${[[30, 34], [70, 64], [36, 76], [64, 30], [22, 58]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="5" fill="#5b3a29"/>`).join('')}${eyes(52)}<path d="M42 66 h20" stroke="${INK}" stroke-width="3.5" stroke-linecap="round"/>`;
      break;
    case 'golem':
      body = `<rect x="12" y="24" width="80" height="70" rx="8" fill="${c}" ${S}/><rect x="24" y="34" width="56" height="22" fill="#fff" stroke="${INK}" stroke-width="3"/><path d="M28 50 C34 38 40 52 46 42 S58 50 62 40 S72 48 76 40" stroke="${INK}" stroke-width="2.5" fill="none"/><rect x="0" y="50" width="14" height="30" rx="4" fill="${c}" ${S}/><rect x="90" y="50" width="14" height="30" rx="4" fill="${c}" ${S}/>${eyes(72, 14)}${angry(70)}`;
      break;
    case 'swarm':
      body = [[30, 34], [72, 30], [52, 62], [22, 72], [82, 70]].map(([x, y], i) => `<g transform="translate(${x} ${y}) rotate(${i * 13 - 20})"><rect x="-18" y="-13" width="36" height="26" rx="4" fill="${c}" ${S}/><rect x="-18" y="-13" width="36" height="7" fill="${INK}"/><circle cx="-6" cy="3" r="2.6" fill="${INK}"/><circle cx="6" cy="3" r="2.6" fill="${INK}"/></g>`).join('');
      break;
    case 'wall':
      body = `<rect x="6" y="18" width="92" height="78" fill="${c}" ${S}/>${[0, 1, 2, 3].map((r) => `<line x1="6" x2="98" y1="${38 + r * 18}" y2="${38 + r * 18}" stroke="${INK}" stroke-width="3"/>`).join('')}${[0, 1, 2, 3, 4].map((k) => `<line x1="${20 + k * 18 + (k % 2) * 6}" x2="${20 + k * 18 + (k % 2) * 6}" y1="18" y2="38" stroke="${INK}" stroke-width="3"/>`).join('')}<path d="M26 4 L32 18 M52 0 V18 M78 4 L72 18" stroke="#f2c94c" stroke-width="5" stroke-linecap="round"/>${eyes(60, 14)}${angry(58)}<path d="M36 80 h32" stroke="${INK}" stroke-width="4"/>`;
      break;
    case 'moth':
      body = `<path d="M52 50 C30 10 4 20 8 46 C10 62 30 64 52 56 Z M52 50 C74 10 100 20 96 46 C94 62 74 64 52 56 Z" fill="${c}" ${S}/><path d="M52 56 C34 70 20 90 34 94 C44 96 50 80 52 68 C54 80 60 96 70 94 C84 90 70 70 52 56Z" fill="${c}" ${S}/><ellipse cx="52" cy="56" rx="9" ry="26" fill="#3a2c4a" ${S}/><circle cx="48" cy="44" r="2.6" fill="#fff"/><circle cx="56" cy="44" r="2.6" fill="#fff"/><path d="M48 30 C44 20 40 16 36 16 M56 30 C60 20 64 16 68 16" stroke="${INK}" stroke-width="3" fill="none"/>`;
      break;
    case 'hook':
      body = `<path d="M60 4 V58 C60 80 40 92 26 82 C14 74 18 56 30 56" stroke="${c}" stroke-width="14" fill="none" stroke-linecap="round"/><path d="M60 4 V58 C60 80 40 92 26 82 C14 74 18 56 30 56" stroke="${INK}" stroke-width="3" fill="none" stroke-linecap="round" stroke-dasharray="0"/><path d="M24 50 L30 56 L22 62" stroke="${INK}" stroke-width="4" fill="none"/><rect x="66" y="22" width="32" height="22" rx="3" fill="#fff" ${S}/><path d="M66 22 L82 34 L98 22" stroke="${INK}" stroke-width="3" fill="none"/>${eyes(66, 7, 48)}`;
      break;
    case 'wheel':
      body = `<circle cx="52" cy="52" r="42" fill="#fff" ${S}/>${[...Array(8)].map((_, k) => { const a = (k / 8) * Math.PI * 2; return `<circle cx="${52 + Math.cos(a) * 30}" cy="${52 + Math.sin(a) * 30}" r="${4 + k}" fill="${c}" stroke="${INK}" stroke-width="2"/>`; }).join('')}${eyes(50, 9)}<path d="M46 64 q6 -4 12 0" stroke="${INK}" stroke-width="3" fill="none"/>`;
      break;
    case 'crab':
      body = `<ellipse cx="52" cy="64" rx="34" ry="24" fill="${c}" ${S}/><path d="M18 52 C2 44 6 22 20 26 L22 38 L30 30 C34 40 30 50 18 52Z M86 52 C102 44 98 22 84 26 L82 38 L74 30 C70 40 74 50 86 52Z" fill="${c}" ${S}/><path d="M24 80 l-12 12 M34 86 l-6 12 M80 80 l12 12 M70 86 l6 12" stroke="${INK}" stroke-width="4"/><rect x="34" y="12" width="36" height="18" rx="3" fill="#f2c94c" ${S}/><text x="52" y="25" font-size="10" text-anchor="middle" font-weight="900" font-family="sans-serif" fill="${INK}">WOW!</text>${eyes(60, 10)}`;
      break;
    case 'knight':
      body = `<path d="M20 96 V46 C20 22 34 10 52 10 C70 10 84 22 84 46 V96 Z" fill="${c}" ${S}/><rect x="26" y="40" width="52" height="12" fill="${INK}"/><circle cx="40" cy="46" r="3" fill="#f2c94c"/><circle cx="64" cy="46" r="3" fill="#f2c94c"/><path d="M52 10 V0" stroke="${INK}" stroke-width="4"/><rect x="34" y="62" width="36" height="28" rx="4" fill="#f2c94c" ${S}/><path d="M44 62 V54 a8 8 0 0 1 16 0 V62" stroke="${INK}" stroke-width="4" fill="none"/><circle cx="52" cy="74" r="4" fill="${INK}"/>`;
      break;
    case 'hydra':
      body = `<path d="M30 96 C30 70 40 60 52 60 C64 60 74 70 74 96 Z" fill="${c}" ${S}/>${[[20, 22, -20], [52, 10, 0], [84, 22, 20]].map(([x, y, r]) => `<path d="M52 66 Q${x} ${y + 40} ${x} ${y + 10}" stroke="${c}" stroke-width="12" fill="none"/><path d="M52 66 Q${x} ${y + 40} ${x} ${y + 10}" stroke="${INK}" stroke-width="2" fill="none"/><g transform="translate(${x} ${y}) rotate(${r})"><rect x="-14" y="-10" width="28" height="22" rx="5" fill="${c}" ${S}/><circle cx="-5" cy="0" r="3" fill="#f2c94c"/><circle cx="5" cy="0" r="3" fill="#f2c94c"/><rect x="-9" y="6" width="18" height="3" fill="${INK}"/></g>`).join('')}`;
      break;
    case 'mimic':
      body = `<path d="M18 118 C18 88 34 78 52 78 C70 78 86 88 86 118" fill="${c}" ${S} transform="translate(0 -22)"/><circle cx="52" cy="44" r="28" fill="${c}" ${S}/><path d="M28 34 L22 12 L40 24 Z M76 34 L82 12 L64 24 Z" fill="${c}" ${S}/>${eyes(44)}<path d="M38 56 q14 10 28 0" stroke="${INK}" stroke-width="3" fill="none"/><path d="M24 30 L80 58 M80 30 L24 58" stroke="#fff" stroke-width="2" opacity=".6"/>`;
      break;
    case 'fiend':
      body = `<path d="M26 30 C20 14 28 4 34 2 C32 12 36 18 40 22 M78 30 C84 14 76 4 70 2 C72 12 68 18 64 22" fill="none" stroke="${INK}" stroke-width="4"/><rect x="18" y="20" width="68" height="72" rx="18" fill="${c}" ${S}/><path d="M30 30 H74 M30 82 H74" stroke="#f2c94c" stroke-width="3"/>${eyes(52, 12)}${angry(50)}<path d="M36 70 l6 -6 l6 6 l6 -6 l6 6 l6 -6 l4 4" stroke="${INK}" stroke-width="3" fill="none"/>`;
      break;
    case 'null':
      body = `<circle cx="52" cy="52" r="42" fill="${c}" ${S}/><circle cx="52" cy="52" r="30" fill="none" stroke="#7de0d3" stroke-width="3" stroke-dasharray="6 6"/><path d="M30 74 L74 30" stroke="#d2493f" stroke-width="6" stroke-linecap="round"/><circle cx="40" cy="46" r="5" fill="#fff"/><circle cx="64" cy="46" r="5" fill="#fff"/>`;
      break;
    case 'screen':
      body = `<rect x="4" y="10" width="96" height="70" rx="6" fill="${c}" ${S}/><rect x="40" y="80" width="24" height="12" fill="#9aa5a0" ${S}/><rect x="26" y="92" width="52" height="6" rx="2" fill="#9aa5a0" ${S}/><text x="22" y="46" font-size="26" fill="#fff" font-family="sans-serif" font-weight="700">:(</text><rect x="22" y="56" width="60" height="4" fill="#fff" opacity=".8"/><rect x="22" y="64" width="40" height="4" fill="#fff" opacity=".8"/><rect x="66" y="22" width="20" height="20" fill="#fff"/><rect x="70" y="26" width="5" height="5" fill="${c}"/><rect x="77" y="33" width="5" height="5" fill="${c}"/>`;
      break;
    default:
      body = `<circle cx="52" cy="52" r="40" fill="${c}" ${S}/>${eyes()}`;
  }
  return `<svg viewBox="0 0 104 104" aria-hidden="true">${body}</svg>`;
}

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
