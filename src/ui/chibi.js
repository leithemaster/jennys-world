// Chibi vector art: flat colors, thick even outlines, one shiny highlight,
// big heads and tiny bodies. All characters here are original designs.

const INK = '#1a1420';
const SW = 3.6;
const o = (fill, sw = SW) => `fill="${fill}" stroke="${INK}" stroke-width="${sw}" stroke-linejoin="round" stroke-linecap="round"`;
const shine = (x, y, rx, ry, rot = 25) => `<ellipse cx="${x}" cy="${y}" rx="${rx}" ry="${ry}" transform="rotate(${rot} ${x} ${y})" fill="#fff" opacity=".9"/>`;
const shadow = (cx, cy, rx) => `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="5" fill="#000" opacity=".22"/>`;

// ---------------- Jenny ----------------
export const LOOKS = {
  sparkle: { name: 'Sparkle Eyes', eyes: 'open' },
  classic: { name: 'Happy Classic', eyes: 'closed' },
  lilac: { name: 'Lilac Wink', eyes: 'wink', hood: '#7a5fb0', hoodLight: '#9d84cc', hoodie: '#7a5fb0', tips: '#ffc3e0' },
};
const JBASE = {
  skin: '#fde6da', hair: '#2b2142', hairShine: '#5b4a85', tips: '#c9b3f0',
  hood: '#262338', hoodLight: '#3c3758', earIn: '#f49ab6', hoodie: '#262338', string: '#e8e2f2',
  stripe: '#f06a95', shoe: '#1a1420', pin: '#f49ab6', blush: '#f59ab0',
};

export function getLook() {
  const k = localStorage.getItem('sm.look');
  return LOOKS[k] ? k : 'sparkle';
}
export function setLook(k) { if (LOOKS[k]) localStorage.setItem('sm.look', k); }

function jennyEyes(kind) {
  const closed = (x) => `<path d="M${x - 8} 82 Q${x} 73 ${x + 8} 82" fill="none" stroke="${INK}" stroke-width="3.6" stroke-linecap="round"/>
    <path d="M${x + (x < 80 ? -8 : 8)} 82 l${x < 80 ? -3 : 3} -2.5 M${x + (x < 80 ? -6.5 : 6.5)} 79 l${x < 80 ? -3 : 3} -3" stroke="${INK}" stroke-width="2" stroke-linecap="round"/>`;
  const open = (x) => `<ellipse cx="${x}" cy="80" rx="6.4" ry="8.4" fill="${INK}"/>
    <ellipse cx="${x}" cy="83.5" rx="4.6" ry="3.6" fill="#7b5bb8"/>
    <circle cx="${x - 2.2}" cy="76.6" r="2.6" fill="#fff"/><circle cx="${x + 2.4}" cy="84" r="1.2" fill="#fff"/>
    <path d="M${x + (x < 80 ? -6 : 6)} 74 l${x < 80 ? -3 : 3} -2.4" stroke="${INK}" stroke-width="2" stroke-linecap="round"/>`;
  if (kind === 'closed') return closed(64) + closed(96);
  if (kind === 'open') return open(64) + open(96);
  return closed(64) + open(96);
}

// opts.crop: head-and-shoulders framing for small portraits
export function jennyChibi(lookKey = getLook(), opts = {}) {
  const p = { ...JBASE, ...LOOKS[lookKey] };
  const vb = opts.crop ? '26 2 108 108' : '0 0 160 160';
  return `<svg viewBox="${vb}" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    ${opts.crop ? '' : shadow(80, 150, 32)}
    <path d="M42 64 C38 84 40 100 46 110 C52 112 56 108 56 104 C52 94 52 78 54 66 Z" ${o(p.hair)}/>
    <path d="M118 64 C122 84 120 100 114 110 C108 112 104 108 104 104 C108 94 108 78 106 66 Z" ${o(p.hair)}/>
    <path d="M44 104 C46 110 52 112 56 104 C55 100 53 98 50 98 C47 98 45 100 44 104 Z" ${o(p.tips)}/>
    <path d="M116 104 C114 110 108 112 104 104 C105 100 107 98 110 98 C113 98 115 100 116 104 Z" ${o(p.tips)}/>
    <rect x="69" y="130" width="8" height="12" rx="2" ${o(p.skin)}/>
    <rect x="83" y="130" width="8" height="12" rx="2" ${o(p.skin)}/>
    <path d="M66 140 h12 a2.5 2.5 0 0 1 2.5 2.5 v1.5 h-14.5 z" ${o(p.shoe)}/>
    <path d="M81.5 140 h12 a2.5 2.5 0 0 1 2.5 2.5 v1.5 h-14.5 z" ${o(p.shoe)}/>
    <path d="M62 101 H98 L104 133 H56 Z" ${o(p.hoodie)}/>
    <path d="M57.3 126 H102.7 L103.6 130.6 H56.4 Z" fill="${p.stripe}"/>
    <path d="M80 104 C76 100 70 101 71 105 C72 108 77 107 80 104 C83 107 88 108 89 105 C90 101 84 100 80 104 Z" ${o(p.string, 2.4)}/>
    <path d="M79 105 L76 114 M81 105 L84 114" stroke="${INK}" stroke-width="2.2" stroke-linecap="round"/>
    <path d="M95 112 a4.6 4.6 0 1 0 4.1 6.9 a3.6 3.6 0 1 1 -4.1 -6.9z" fill="${p.pin}" stroke="${INK}" stroke-width="1.6"/>
    <rect x="52.5" y="103" width="10" height="20" rx="5" transform="rotate(9 57.5 103)" ${o(p.hoodie)}/>
    <rect x="97.5" y="103" width="10" height="20" rx="5" transform="rotate(-9 102.5 103)" ${o(p.hoodie)}/>
    <circle cx="54.4" cy="124" r="3.8" ${o(p.skin, 2.8)}/>
    <circle cx="105.6" cy="124" r="3.8" ${o(p.skin, 2.8)}/>
    <path d="M38 34 L32 6 L62 22 Z" ${o(p.hood)}/>
    <path d="M122 34 L128 6 L98 22 Z" ${o(p.hood)}/>
    <path d="M40 27 L37 14 L52 22 Z" fill="${p.earIn}"/>
    <path d="M120 27 L123 14 L108 22 Z" fill="${p.earIn}"/>
    <path d="M28 70 C26 36 50 15 80 15 C110 15 134 36 132 70 C132 80 128 86 122 88 C120 60 104 44 80 44 C56 44 40 60 38 88 C32 86 28 80 28 70 Z" ${o(p.hood)}/>
    <path d="M42 46 C50 30 64 22 80 21" fill="none" stroke="${p.hoodLight}" stroke-width="5" stroke-linecap="round"/>
    ${shine(104, 28, 8, 4.4)}
    <path d="M42 74 C42 54 58 42 80 42 C102 42 118 54 118 74 C118 94 102 104 80 104 C58 104 42 94 42 74 Z" ${o(p.skin)}/>
    <path d="M42 72 C42 52 58 40 80 40 C102 40 118 52 118 72 L108 72 L104 60 L98 70 L84 70 L80 58 L74 70 L60 70 L57 62 L53 72 Z" ${o(p.hair)}/>
    <path d="M60 48 C66 44 74 43 80 43" fill="none" stroke="${p.hairShine}" stroke-width="3" stroke-linecap="round"/>
    <path d="M116 26 a8 8 0 1 0 7 12 a6.2 6.2 0 1 1 -7 -12z" fill="${p.pin}" stroke="${INK}" stroke-width="2.4" stroke-linejoin="round"/>
    ${jennyEyes(p.eyes)}
    <ellipse cx="55" cy="90" rx="6" ry="3.6" fill="${p.blush}"/>
    <ellipse cx="105" cy="90" rx="6" ry="3.6" fill="${p.blush}"/>
    <path d="M74 92 Q80 98 86 92" fill="none" stroke="${INK}" stroke-width="3" stroke-linecap="round"/>
  </svg>`;
}

// ---------------- Toni ----------------
// Short black hair swept up, black rectangle glasses, a red jacket with a
// black yoke and sleeves, and a big sleepy grin.
const TONI = {
  skin: '#f6d6c0', hair: '#1c1922', hairShine: '#4a4458', frame: '#141218',
  jacket: '#c22f45', jacketDark: '#1f1d24', zip: '#d9d4e0', pants: '#2b2a33', shoe: '#1a1420', blush: '#f2a48a',
};

export function toniChibi(opts = {}) {
  const p = TONI;
  const vb = opts.crop ? '26 2 108 108' : '0 0 160 160';
  const lens = (x) => `<rect x="${x - 11}" y="71" width="22" height="17" rx="5" fill="#fff" fill-opacity=".22" stroke="${p.frame}" stroke-width="3.4"/>`;
  const eye = (x) => `<path d="M${x - 6} 82 Q${x} 75.5 ${x + 6} 82" fill="none" stroke="${INK}" stroke-width="3.4" stroke-linecap="round"/>`;
  return `<svg viewBox="${vb}" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    ${opts.crop ? '' : shadow(80, 150, 32)}
    ${opts.crop ? '' : `<text x="118" y="34" font-size="13" font-weight="900" fill="${INK}" font-family="sans-serif" opacity=".55">z</text><text x="128" y="22" font-size="10" font-weight="900" fill="${INK}" font-family="sans-serif" opacity=".4">z</text>`}
    <rect x="69" y="130" width="8" height="12" rx="2" ${o(p.pants)}/>
    <rect x="83" y="130" width="8" height="12" rx="2" ${o(p.pants)}/>
    <path d="M66 140 h12 a2.5 2.5 0 0 1 2.5 2.5 v1.5 h-14.5 z" ${o(p.shoe)}/>
    <path d="M81.5 140 h12 a2.5 2.5 0 0 1 2.5 2.5 v1.5 h-14.5 z" ${o(p.shoe)}/>
    <path d="M62 101 H98 L104 133 H56 Z" ${o(p.jacket)}/>
    <path d="M62 101 H98 L100.2 113 H59.8 Z" fill="${p.jacketDark}" stroke="${INK}" stroke-width="${SW}" stroke-linejoin="round"/>
    <path d="M80 104 V132" stroke="${p.zip}" stroke-width="2.2" stroke-linecap="round"/>
    <rect x="78.2" y="112" width="3.6" height="5" rx="1" fill="${p.zip}" stroke="${INK}" stroke-width="1.2"/>
    <path d="M67 98 L80 105 L93 98 L94 104 L80 111 L66 104 Z" ${o(p.jacketDark, 2.6)}/>
    <rect x="52.5" y="103" width="10" height="20" rx="5" transform="rotate(9 57.5 103)" ${o(p.jacketDark)}/>
    <rect x="97.5" y="103" width="10" height="20" rx="5" transform="rotate(-9 102.5 103)" ${o(p.jacketDark)}/>
    <circle cx="54.4" cy="124" r="3.8" ${o(p.skin, 2.8)}/>
    <circle cx="105.6" cy="124" r="3.8" ${o(p.skin, 2.8)}/>
    <ellipse cx="42" cy="80" rx="5.5" ry="7.5" ${o(p.skin, 2.8)}/>
    <ellipse cx="118" cy="80" rx="5.5" ry="7.5" ${o(p.skin, 2.8)}/>
    <circle cx="40.5" cy="87" r="1.8" fill="${p.zip}" stroke="${INK}" stroke-width="1"/>
    <path d="M42 74 C42 54 58 42 80 42 C102 42 118 54 118 74 C118 94 102 104 80 104 C58 104 42 94 42 74 Z" ${o(p.skin)}/>
    <path d="M40 72 C36 48 48 28 66 23 L68 11 L77 19 L85 8 L91 19 L101 12 L103 25 C118 32 126 50 120 72 L116 72 C116 63 113 58 109 55 L105 63 L97 56 L87 63 L79 54 L69 61 L61 55 C53 59 47 64 45 72 Z" ${o(p.hair)}/>
    <path d="M60 33 C68 26 78 24 88 25" fill="none" stroke="${p.hairShine}" stroke-width="3.4" stroke-linecap="round"/>
    ${eye(64)}${eye(96)}
    ${lens(64)}${lens(96)}
    <path d="M75 78 Q80 75.5 85 78" fill="none" stroke="${p.frame}" stroke-width="3" stroke-linecap="round"/>
    <path d="M53 76 L44 74 M107 76 L116 74" stroke="${p.frame}" stroke-width="3" stroke-linecap="round"/>
    <ellipse cx="54" cy="93" rx="5.5" ry="3.2" fill="${p.blush}"/>
    <ellipse cx="106" cy="93" rx="5.5" ry="3.2" fill="${p.blush}"/>
    <path d="M70 92 Q80 104 90 92 Z" ${o('#8a2f3c', 2.8)}/>
    <path d="M72.5 92.6 H87.5 L86.3 95.4 H73.7 Z" fill="#fff"/>
  </svg>`;
}

export function blobBackdrop(a = '#e0485f', b = '#ff8fb0') {
  return `<svg class="backdrop" viewBox="0 0 160 160" aria-hidden="true">
    <path d="M30 70 C24 40 50 22 76 28 C92 14 128 20 134 48 C150 60 146 94 128 104 C126 128 98 140 78 130 C58 142 26 130 28 106 C14 96 16 78 30 70 Z" fill="${a}"/>
    <circle cx="36" cy="34" r="7" fill="none" stroke="${b}" stroke-width="3"/>
    <circle cx="134" cy="124" r="5" fill="none" stroke="${b}" stroke-width="2.5"/>
    <path d="M128 24 q1.4 7.6 9 9 q-7.6 1.4 -9 9 q-1.4 -7.6 -9 -9 q7.6 -1.4 9 -9 z" fill="${b}"/>
    <path d="M24 112 q1 5 6 6 q-5 1 -6 6 q-1 -5 -6 -6 q5 -1 6 -6 z" fill="${b}"/>
  </svg>`;
}

// ---------------- enemies ----------------
// face helpers: eyes 'cute' | 'angry' | 'sly' | 'dot' | 'x'; mouth 'smile' | 'frown' | 'fang' | 'flat' | 'o' | 'grin'
function face(cx, cy, { eyes = 'cute', mouth = 'smile', gap = 12, blush = true, size = 1 } = {}) {
  const s = size;
  const ex = [cx - gap, cx + gap];
  let e = '';
  if (eyes === 'cute' || eyes === 'angry') {
    e = ex.map((x) => `<ellipse cx="${x}" cy="${cy}" rx="${5 * s}" ry="${6.5 * s}" fill="${INK}"/><circle cx="${x - 1.8 * s}" cy="${cy - 2.6 * s}" r="${2 * s}" fill="#fff"/>`).join('');
    if (eyes === 'angry') e += `<path d="M${ex[0] - 8 * s} ${cy - 11 * s} L${ex[0] + 5 * s} ${cy - 7 * s} M${ex[1] + 8 * s} ${cy - 11 * s} L${ex[1] - 5 * s} ${cy - 7 * s}" stroke="${INK}" stroke-width="${3.6 * s}" stroke-linecap="round"/>`;
  } else if (eyes === 'sly') {
    e = ex.map((x) => `<path d="M${x - 6 * s} ${cy} Q${x} ${cy - 5 * s} ${x + 6 * s} ${cy}" fill="none" stroke="${INK}" stroke-width="${3.4 * s}" stroke-linecap="round"/>`).join('');
  } else if (eyes === 'dot') {
    e = ex.map((x) => `<circle cx="${x}" cy="${cy}" r="${3.6 * s}" fill="${INK}"/>`).join('');
  } else if (eyes === 'x') {
    e = ex.map((x) => `<path d="M${x - 4 * s} ${cy - 4 * s} L${x + 4 * s} ${cy + 4 * s} M${x + 4 * s} ${cy - 4 * s} L${x - 4 * s} ${cy + 4 * s}" stroke="${INK}" stroke-width="${3.2 * s}" stroke-linecap="round"/>`).join('');
  }
  const my = cy + 13 * s;
  const m = {
    smile: `<path d="M${cx - 6 * s} ${my} Q${cx} ${my + 6 * s} ${cx + 6 * s} ${my}" fill="none" stroke="${INK}" stroke-width="${3 * s}" stroke-linecap="round"/>`,
    frown: `<path d="M${cx - 7 * s} ${my + 4 * s} Q${cx} ${my - 3 * s} ${cx + 7 * s} ${my + 4 * s}" fill="none" stroke="${INK}" stroke-width="${3.2 * s}" stroke-linecap="round"/>`,
    fang: `<path d="M${cx - 7 * s} ${my} Q${cx} ${my + 6 * s} ${cx + 7 * s} ${my}" fill="none" stroke="${INK}" stroke-width="${3 * s}" stroke-linecap="round"/><path d="M${cx + 2 * s} ${my + 2.4 * s} l${2 * s} ${4 * s} l${2 * s} ${-4.6 * s}" fill="#fff" stroke="${INK}" stroke-width="${1.6 * s}" stroke-linejoin="round"/>`,
    flat: `<path d="M${cx - 7 * s} ${my + 1} h${14 * s}" stroke="${INK}" stroke-width="${3.2 * s}" stroke-linecap="round"/>`,
    o: `<ellipse cx="${cx}" cy="${my + 1}" rx="${3.6 * s}" ry="${4.6 * s}" fill="${INK}"/>`,
    grin: `<path d="M${cx - 9 * s} ${my - 1} Q${cx} ${my + 9 * s} ${cx + 9 * s} ${my - 1} Z" fill="#fff" stroke="${INK}" stroke-width="${2.8 * s}" stroke-linejoin="round"/><path d="M${cx - 4 * s} ${my + 1} v${4 * s} M${cx + 4 * s} ${my + 1} v${4 * s}" stroke="${INK}" stroke-width="${1.6 * s}"/>`,
  }[mouth];
  const b = blush ? `<ellipse cx="${ex[0] - 7 * s}" cy="${cy + 10 * s}" rx="${5 * s}" ry="${3 * s}" fill="#ff9fb4" opacity=".85"/><ellipse cx="${ex[1] + 7 * s}" cy="${cy + 10 * s}" rx="${5 * s}" ry="${3 * s}" fill="#ff9fb4" opacity=".85"/>` : '';
  return b + e + m;
}

const lighten = (hex, amt = 0.35) => {
  const n = parseInt(hex.slice(1), 16);
  const r = (n >> 16) & 255, g = (n >> 8) & 255, b = n & 255;
  const mix = (c) => Math.round(c + (255 - c) * amt);
  return `#${((1 << 24) | (mix(r) << 16) | (mix(g) << 8) | mix(b)).toString(16).slice(1)}`;
};
const darken = (hex, amt = 0.3) => {
  const n = parseInt(hex.slice(1), 16);
  const r = (n >> 16) & 255, g = (n >> 8) & 255, b = n & 255;
  const mix = (c) => Math.round(c * (1 - amt));
  return `#${((1 << 24) | (mix(r) << 16) | (mix(g) << 8) | mix(b)).toString(16).slice(1)}`;
};

const ART = {
  slime: (c) => `${shadow(60, 112, 42)}
    <rect x="84" y="14" width="9" height="9" rx="1.5" ${o('#c7a6ff', 2.6)}/>
    <rect x="97" y="24" width="6" height="6" rx="1" ${o('#f49ab6', 2.2)}/>
    <rect x="76" y="4" width="5" height="5" rx="1" ${o('#7de0d3', 2)}/>
    <path d="M12 102 C8 70 26 36 60 36 C94 36 112 70 108 102 C108 108 102 110 96 108 C90 106 86 110 80 110 H40 C34 110 30 106 24 108 C18 110 12 108 12 102 Z" ${o(c)}/>
    <path d="M92 106 C92 112 94 116 97 116 C100 116 101 112 99 107" ${o(c, 3)}/>
    <path d="M26 74 C28 58 38 46 52 42" fill="none" stroke="${lighten(c, 0.5)}" stroke-width="6" stroke-linecap="round"/>
    ${shine(82, 50, 8, 4.5, 28)}${face(60, 76, { eyes: 'cute', mouth: 'smile', gap: 14 })}`,

  gremlin: (c) => `${shadow(60, 112, 38)}
    <path d="M24 46 L6 18 L40 32 Z" ${o(c)}/><path d="M96 46 L114 18 L80 32 Z" ${o(c)}/>
    <path d="M14 26 L30 36 L22 40 Z" fill="${lighten(c, 0.4)}"/>
    <rect x="40" y="96" width="12" height="14" rx="5" ${o(darken(c, 0.15))}/><rect x="68" y="96" width="12" height="14" rx="5" ${o(darken(c, 0.15))}/>
    <ellipse cx="60" cy="68" rx="40" ry="34" ${o(c)}/>
    <path d="M30 56 C32 46 40 38 50 36" fill="none" stroke="${lighten(c, 0.45)}" stroke-width="5" stroke-linecap="round"/>
    ${shine(84, 46, 7, 4)}
    <circle cx="98" cy="22" r="8" fill="none" stroke="${INK}" stroke-width="3" stroke-dasharray="5 4"/>
    ${face(60, 68, { eyes: 'angry', mouth: 'fang', gap: 13 })}`,

  wraith: (c) => `${shadow(60, 113, 34)}
    <path d="M20 106 V46 C20 22 36 10 60 10 C84 10 100 22 100 46 V106 L90 98 L80 106 L70 98 L60 106 L50 98 L40 106 L30 98 Z" ${o(c)}/>
    <rect x="26" y="24" width="68" height="13" rx="3" ${o('#4a6fa5', 3)}/>
    <path d="M83 27 l6 6 m0 -6 l-6 6" stroke="#fff" stroke-width="2.4" stroke-linecap="round"/>
    <circle cx="32" cy="30.5" r="2.2" fill="#ffd6dc"/><circle cx="39" cy="30.5" r="2.2" fill="#ffe9a8"/>
    ${shine(36, 50, 6, 3.5, -20)}
    ${face(60, 62, { eyes: 'cute', mouth: 'o', gap: 13 })}`,

  bot: (c) => `${shadow(60, 113, 36)}
    <path d="M60 8 V20" stroke="${INK}" stroke-width="4"/><circle cx="60" cy="8" r="6" ${o('#f2c94c', 3)}/>
    <rect x="16" y="20" width="88" height="62" rx="16" ${o(c)}/>
    <rect x="26" y="32" width="68" height="36" rx="9" ${o('#2a2830', 3)}/>
    <rect x="38" y="42" width="11" height="12" rx="2" fill="#7de0d3"/><rect x="71" y="42" width="11" height="12" rx="2" fill="#7de0d3"/>
    <path d="M52 61 h16" stroke="#7de0d3" stroke-width="3" stroke-linecap="round"/>
    ${shine(28, 26, 7, 3.5, -15)}
    <rect x="30" y="82" width="60" height="28" rx="4" ${o('#ffffff')}/>
    <path d="M30 84 L60 100 L90 84" fill="none" stroke="${INK}" stroke-width="3.2" stroke-linejoin="round"/>
    <circle cx="84" cy="88" r="6" ${o('#e0485f', 2.4)}/><text x="84" y="91.5" font-size="9" text-anchor="middle" font-weight="900" fill="#fff" font-family="sans-serif">9</text>`,

  cookie: (c) => `${shadow(60, 113, 40)}
    <path d="M60 14 C86 14 106 34 106 60 C106 86 86 106 60 106 C34 106 14 86 14 60 C14 40 26 24 44 17 C44 26 52 32 60 30 C66 30 72 24 72 18" ${o(c)}/>
    ${[[34, 40], [80, 78], [32, 82], [86, 44], [56, 96]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="5" fill="#5b3a29"/>`).join('')}
    <circle cx="96" cy="16" r="4" ${o(c, 2.4)}/><circle cx="104" cy="26" r="2.6" ${o(c, 2)}/>
    ${shine(30, 30, 7, 3.6, -30)}
    ${face(60, 58, { eyes: 'cute', mouth: 'grin', gap: 13 })}`,

  golem: (c) => `${shadow(60, 113, 42)}
    <rect x="6" y="60" width="18" height="34" rx="8" ${o(darken(c, 0.08))}/><rect x="96" y="60" width="18" height="34" rx="8" ${o(darken(c, 0.08))}/>
    <rect x="20" y="24" width="80" height="84" rx="16" ${o(c)}/>
    <path d="M30 36 C30 32 33 30 38 30" fill="none" stroke="${lighten(c, 0.6)}" stroke-width="5" stroke-linecap="round"/>
    <rect x="32" y="38" width="56" height="24" rx="4" ${o('#ffffff', 3)}/>
    <path d="M38 54 C44 40 50 58 56 46 S68 56 72 44 S80 52 84 46" fill="none" stroke="${INK}" stroke-width="2.6" stroke-linecap="round"/>
    ${face(60, 84, { eyes: 'angry', mouth: 'flat', gap: 14, blush: false, size: 0.9 })}`,

  swarm: (c) => `${shadow(60, 113, 44)}
    ${[[32, 34, -14], [84, 30, 12], [60, 64, -4], [26, 80, 10], [90, 78, -10]].map(([x, y, r], i) => `<g transform="translate(${x} ${y}) rotate(${r})">
      <rect x="-20" y="-15" width="40" height="30" rx="5" ${o(i % 2 ? lighten(c, 0.25) : c, 3)}/>
      <rect x="-20" y="-15" width="40" height="8" rx="3" fill="${INK}"/>
      <circle cx="13" cy="-11" r="1.6" fill="#ff8a9b"/>
      <circle cx="-6" cy="3" r="2.8" fill="${INK}"/><circle cx="6" cy="3" r="2.8" fill="${INK}"/>
      <path d="M-3 9 q3 2.5 6 0" fill="none" stroke="${INK}" stroke-width="2" stroke-linecap="round"/></g>`).join('')}`,

  wall: (c) => `${shadow(60, 113, 48)}
    <path d="M30 22 C26 10 34 4 36 2 C36 10 42 12 42 20 Z M60 18 C56 6 64 0 66 -2 C66 6 72 8 72 16 Z M88 22 C84 10 92 4 94 2 C94 10 100 12 100 20 Z" ${o('#f2c94c', 2.6)}/>
    <rect x="10" y="20" width="100" height="88" rx="12" ${o(c)}/>
    <path d="M10 42 H24 M96 42 H110 M10 64 H24 M96 64 H110 M10 86 H24 M96 86 H110 M36 20 V30 M60 20 V30 M84 20 V30 M40 100 V108 M60 100 V108 M80 100 V108" stroke="${INK}" stroke-width="2.8"/>
    <path d="M20 30 C22 26 26 24 30 24" fill="none" stroke="${lighten(c, 0.35)}" stroke-width="4" stroke-linecap="round"/>
    <rect x="24" y="30" width="72" height="70" rx="14" ${o('#ffd9d2', 3)}/>
    <path d="M32 46 L48 52 M88 46 L72 52" stroke="${INK}" stroke-width="4.2" stroke-linecap="round"/>
    <ellipse cx="45" cy="64" rx="7.5" ry="9" fill="#fff" stroke="${INK}" stroke-width="3.2"/><ellipse cx="75" cy="64" rx="7.5" ry="9" fill="#fff" stroke="${INK}" stroke-width="3.2"/>
    <circle cx="46.5" cy="66" r="4" fill="${INK}"/><circle cx="73.5" cy="66" r="4" fill="${INK}"/>
    <circle cx="45" cy="64" r="1.4" fill="#fff"/><circle cx="72" cy="64" r="1.4" fill="#fff"/>
    <ellipse cx="34" cy="80" rx="5" ry="3" fill="#f27a8f"/><ellipse cx="86" cy="80" rx="5" ry="3" fill="#f27a8f"/>
    <path d="M47 90 Q60 82 73 90" fill="none" stroke="${INK}" stroke-width="3.8" stroke-linecap="round"/>`,

  moth: (c) => `${shadow(60, 113, 34)}
    <path d="M60 58 C40 18 8 22 10 48 C12 66 36 68 60 62 Z" ${o(c)}/><path d="M60 58 C80 18 112 22 110 48 C108 66 84 68 60 62 Z" ${o(c)}/>
    <path d="M60 64 C42 76 30 98 44 102 C54 104 58 88 60 76 C62 88 66 104 76 102 C90 98 78 76 60 64 Z" ${o(lighten(c, 0.25))}/>
    <circle cx="30" cy="44" r="6" fill="${lighten(c, 0.5)}"/><circle cx="90" cy="44" r="6" fill="${lighten(c, 0.5)}"/>
    <ellipse cx="60" cy="60" rx="15" ry="22" ${o('#3a2c4a')}/>
    <path d="M54 40 C50 28 44 22 38 22 M66 40 C70 28 76 22 82 22" fill="none" stroke="${INK}" stroke-width="3" stroke-linecap="round"/>
    <circle cx="38" cy="22" r="3.4" fill="${INK}"/><circle cx="82" cy="22" r="3.4" fill="${INK}"/>
    ${face(60, 56, { eyes: 'sly', mouth: 'fang', gap: 6, blush: false, size: 0.7 })}
    <path d="M54 50 l-1 -1 M66 50 l1 -1" stroke="#fff" stroke-width="0"/>`,

  hook: (c) => `${shadow(60, 113, 30)}
    <path d="M70 6 V64 C70 92 44 104 28 92 C16 84 18 64 32 62" fill="none" stroke="${INK}" stroke-width="16" stroke-linecap="round"/>
    <path d="M70 6 V64 C70 92 44 104 28 92 C16 84 18 64 32 62" fill="none" stroke="${c}" stroke-width="9" stroke-linecap="round"/>
    <path d="M24 56 L34 62 L24 70" fill="none" stroke="${INK}" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
    <rect x="76" y="26" width="34" height="24" rx="4" ${o('#ffffff')}/>
    <path d="M76 28 L93 40 L110 28" fill="none" stroke="${INK}" stroke-width="3" stroke-linejoin="round"/>
    <rect x="38" y="56" width="30" height="26" rx="9" ${o(lighten(c, 0.3), 3)}/>
    ${face(53, 66, { eyes: 'sly', mouth: 'grin', gap: 6.5, blush: false, size: 0.62 })}`,

  wheel: (c) => `${shadow(60, 113, 40)}
    <circle cx="60" cy="58" r="46" ${o('#ffffff')}/>
    ${[...Array(8)].map((_, k) => { const a = (k / 8) * Math.PI * 2 - Math.PI / 2; return `<circle cx="${60 + Math.cos(a) * 34}" cy="${58 + Math.sin(a) * 34}" r="${3.5 + k * 0.9}" fill="${c}" stroke="${INK}" stroke-width="2.2" opacity="${0.35 + k * 0.08}"/>`; }).join('')}
    ${shine(40, 26, 7, 3.5, -30)}
    ${face(60, 54, { eyes: 'dot', mouth: 'flat', gap: 10 })}`,

  crab: (c) => `${shadow(60, 113, 42)}
    <path d="M28 88 l-14 14 M38 94 l-8 14 M92 88 l14 14 M82 94 l8 14" stroke="${INK}" stroke-width="5" stroke-linecap="round"/>
    <path d="M20 58 C2 50 6 24 22 28 L24 42 L34 32 C38 44 34 56 20 58 Z" ${o(c)}/>
    <path d="M100 58 C118 50 114 24 98 28 L96 42 L86 32 C82 44 86 56 100 58 Z" ${o(c)}/>
    <ellipse cx="60" cy="74" rx="38" ry="28" ${o(c)}/>
    <path d="M30 66 C34 56 44 50 54 48" fill="none" stroke="${lighten(c, 0.4)}" stroke-width="5" stroke-linecap="round"/>
    <rect x="38" y="12" width="44" height="20" rx="4" ${o('#f2c94c', 3)}/>
    <text x="60" y="27" font-size="11" text-anchor="middle" font-weight="900" font-family="sans-serif" fill="${INK}">WOW!</text>
    ${face(60, 72, { eyes: 'cute', mouth: 'o', gap: 12 })}`,

  knight: (c) => `${shadow(60, 113, 36)}
    <path d="M60 4 C66 10 66 16 60 18 C54 16 54 10 60 4 Z" ${o('#e0485f', 2.6)}/>
    <path d="M22 106 V52 C22 28 38 16 60 16 C82 16 98 28 98 52 V106 Z" ${o(c)}/>
    <path d="M32 44 C34 32 42 26 52 24" fill="none" stroke="${lighten(c, 0.35)}" stroke-width="5" stroke-linecap="round"/>
    <rect x="30" y="46" width="60" height="16" rx="5" fill="${INK}"/>
    <circle cx="46" cy="54" r="3.6" fill="#f2c94c"/><circle cx="74" cy="54" r="3.6" fill="#f2c94c"/>
    <rect x="40" y="72" width="40" height="30" rx="6" ${o('#f2c94c')}/>
    <path d="M50 72 V64 a10 10 0 0 1 20 0 V72" fill="none" stroke="${INK}" stroke-width="4"/>
    <circle cx="60" cy="85" r="4" fill="${INK}"/><path d="M60 87 v6" stroke="${INK}" stroke-width="3" stroke-linecap="round"/>`,

  hydra: (c) => `${shadow(60, 113, 40)}
    ${[[24, 30, -18], [60, 16, 0], [96, 30, 18]].map(([x, y]) => `<path d="M60 80 Q${x} ${y + 44} ${x} ${y + 12}" fill="none" stroke="${INK}" stroke-width="15" stroke-linecap="round"/><path d="M60 80 Q${x} ${y + 44} ${x} ${y + 12}" fill="none" stroke="${c}" stroke-width="8" stroke-linecap="round"/>`).join('')}
    <path d="M30 108 C30 82 42 70 60 70 C78 70 90 82 90 108 Z" ${o(c)}/>
    <rect x="44" y="84" width="32" height="18" rx="3" ${o('#2a2830', 2.6)}/>
    ${[0, 1, 2].map((i) => `<circle cx="${50 + i * 10}" cy="93" r="2.2" fill="${i === 1 ? '#f2c94c' : '#7de0d3'}"/>`).join('')}
    ${[[24, 30, -18], [60, 16, 0], [96, 30, 18]].map(([x, y, r]) => `<g transform="translate(${x} ${y}) rotate(${r})">
      <rect x="-17" y="-13" width="34" height="27" rx="8" ${o(lighten(c, 0.15), 3)}/>
      <circle cx="-6" cy="-1" r="3.4" fill="#f2c94c" stroke="${INK}" stroke-width="1.6"/><circle cx="6" cy="-1" r="3.4" fill="#f2c94c" stroke="${INK}" stroke-width="1.6"/>
      <path d="M-8 7 h16" stroke="${INK}" stroke-width="2.6" stroke-linecap="round"/></g>`).join('')}`,

  mimic: (c) => `${shadow(60, 113, 34)}
    <path d="M26 108 C26 86 40 76 60 76 C80 76 94 86 94 108 Z" ${o(c)}/>
    <path d="M30 46 L22 14 L46 30 Z" ${o(c)}/><path d="M90 46 L98 14 L74 30 Z" ${o(c)}/>
    <circle cx="60" cy="50" r="32" ${o(c)}/>
    <path d="M28 40 L92 64" stroke="#fff" stroke-width="3" opacity=".55"/><path d="M30 60 L88 36" stroke="#fff" stroke-width="2" opacity=".4"/>
    ${shine(80, 30, 7, 3.6)}
    ${face(60, 50, { eyes: 'sly', mouth: 'grin', gap: 12 })}`,

  fiend: (c) => `${shadow(60, 113, 38)}
    <path d="M28 34 C20 16 28 4 36 2 C34 12 38 18 44 24 Z" ${o('#f2c94c', 3)}/><path d="M92 34 C100 16 92 4 84 2 C86 12 82 18 76 24 Z" ${o('#f2c94c', 3)}/>
    <rect x="18" y="22" width="84" height="84" rx="24" ${o(c)}/>
    <path d="M30 40 C32 32 38 28 46 27" fill="none" stroke="${lighten(c, 0.35)}" stroke-width="5" stroke-linecap="round"/>
    <path d="M28 96 H92" stroke="#f2c94c" stroke-width="4" stroke-linecap="round"/>
    ${face(60, 60, { eyes: 'angry', mouth: 'grin', gap: 14 })}`,

  null: (c) => `${shadow(60, 113, 40)}
    <circle cx="60" cy="58" r="46" ${o(c)}/>
    <circle cx="60" cy="58" r="33" fill="none" stroke="#7de0d3" stroke-width="3" stroke-dasharray="7 6"/>
    <path d="M34 84 L86 32" stroke="#e0485f" stroke-width="7" stroke-linecap="round"/>
    ${shine(40, 26, 7, 3.4, -30)}
    <ellipse cx="46" cy="54" rx="6" ry="7.5" fill="#fff"/><ellipse cx="74" cy="54" rx="6" ry="7.5" fill="#fff"/>
    <circle cx="47" cy="56" r="3" fill="${INK}"/><circle cx="75" cy="56" r="3" fill="${INK}"/>`,

  screen: (c) => `${shadow(60, 114, 44)}
    <rect x="48" y="88" width="24" height="14" ${o('#9aa5a0')}/>
    <rect x="30" y="100" width="60" height="8" rx="3" ${o('#9aa5a0')}/>
    <rect x="6" y="12" width="108" height="78" rx="10" ${o(c)}/>
    <rect x="14" y="20" width="92" height="62" rx="5" fill="${lighten(c, 0.12)}"/>
    ${shine(22, 24, 6, 3, -20)}
    <text x="24" y="52" font-size="26" fill="#fff" font-family="sans-serif" font-weight="800">:(</text>
    <rect x="24" y="62" width="58" height="4" rx="2" fill="#fff" opacity=".85"/><rect x="24" y="70" width="38" height="4" rx="2" fill="#fff" opacity=".85"/>
    <rect x="80" y="26" width="20" height="20" rx="2" fill="#fff"/><rect x="84" y="30" width="5" height="5" fill="${c}"/><rect x="91" y="37" width="5" height="5" fill="${c}"/>`,
};

export function enemyChibi(art, color) {
  const draw = ART[art] || ART.slime;
  return `<svg viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">${draw(color)}</svg>`;
}
