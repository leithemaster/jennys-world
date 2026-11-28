// Chibi vector art: flat colors, thick even outlines, one shiny highlight,
// big heads and tiny bodies. All characters here are original designs.

const INK = '#1a1420';
const SW = 3.6;
const o = (fill, sw = SW) => `fill="${fill}" stroke="${INK}" stroke-width="${sw}" stroke-linejoin="round" stroke-linecap="round"`;
const shine = (x, y, rx, ry, rot = 25) => `<ellipse cx="${x}" cy="${y}" rx="${rx}" ry="${ry}" transform="rotate(${rot} ${x} ${y})" fill="#fff" opacity=".9"/>`;
const shadow = (cx, cy, rx) => `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="5" fill="#000" opacity=".22"/>`;

// ---------------- Jenny & Toni ----------------
// Both are drawn from parts so they can wear matching couple outfits (see
// src/game/outfits.js for the sets and how they unlock). The art for each
// set lives here: JENNY_OUTFITS[id] and TONI_OUTFITS[id].

const J = {
  skin: '#fde6da', hair: '#2b2142', hairShine: '#5b4a85', tips: '#c9b3f0',
  shoe: '#1a1420', blush: '#f59ab0', string: '#e8e2f2',
};
const TONI = {
  skin: '#f6d6c0', hair: '#1c1922', hairShine: '#4a4458', frame: '#141218',
  jacket: '#c22f45', jacketDark: '#1f1d24', zip: '#d9d4e0', pants: '#2b2a33', shoe: '#1a1420', blush: '#f2a48a',
};
const CREAM = '#fff4e6';
const XMAS_RED = '#c8323c';
const XMAS_GREEN = '#2f7a4a';
const CAFE = { shirt: CREAM, stripe: '#9ec9ff', apron: '#6b4a35', logo: '#f49ab6', hat: '#4f8a6e' };
const SILVER = '#c9ced8', SILVER_LIGHT = '#eef1f6';
const HARU = { fur: '#2b2329', tan: '#c98a4a', collar: '#c8323c' };
const ISSEI = { fur: '#c9672c', cream: '#f8ecd8', bandana: '#5fa8e8' };

export const JENNY_OUTFITS = {
  // Date Night: her yellow knit from the photo, plus an artist's beret.
  date: { eyes: 'open', hat: 'beret', hatColor: '#8e2b3b', top: { kind: 'knit', color: '#e8b23a', dark: '#b9862a', skirt: '#4a3f63' } },
  // The original look: black cat-ear hoodie.
  cat: { eyes: 'open', hood: { ears: 'cat', color: '#262338', light: '#3c3758', earIn: '#f49ab6', pin: '#f49ab6' }, top: { kind: 'hoodie', color: '#262338', stripe: '#f06a95', pin: '#f49ab6' } },
  lilac: { eyes: 'wink', tips: '#ffc3e0', hood: { ears: 'cat', color: '#7a5fb0', light: '#9d84cc', earIn: '#f49ab6', pin: '#f49ab6' }, top: { kind: 'hoodie', color: '#7a5fb0', stripe: '#f06a95', pin: '#f49ab6' } },
  cafe: { eyes: 'closed', hat: 'bandana', hatColor: CAFE.hat, top: { kind: 'apron', ...CAFE } },
  xmas: { eyes: 'open', hat: 'santa', top: { kind: 'xmas', color: XMAS_RED, band: CREAM, accent: XMAS_GREEN } },
  // Park Stroll: straw sun hat and a mint sundress.
  park: { eyes: 'open', hat: 'sunhat', hatColor: '#f0d58a', top: { kind: 'dress', color: '#9fe0c8', collar: '#fff', dot: '#fff', belt: '#f49ab6' } },
  // Night Out: a velvet bow and a deep wine dress with sparkles and pearls.
  night: { eyes: 'wink', hat: 'bow', hatColor: '#1f1d24', top: { kind: 'gown', color: '#6d1f3d', sparkle: '#ffe9a8', pearl: '#fff' } },
  // New Year: a pink hanbok jeogori, red chima and a jobawi winter cap.
  newyear: { eyes: 'closed', hat: 'jobawi', hatColor: '#6b2140', top: { kind: 'hanbok', jacket: '#f7a8c4', skirt: '#d8344f', ribbon: '#8e1f3c', collar: '#fff', sleeve: '#ffd34d' } },
  // Rainy Day: a yellow raincoat with a frog hood.
  rainy: { eyes: 'open', hood: { ears: 'frog', color: '#ffd34d', light: '#fff09a', earIn: '#7ed957' }, top: { kind: 'raincoat', color: '#ffd34d', toggle: '#c98a4a' } },
  // Puppy Knights: Haru's armor. A silver helm with his black-and-tan ears and red plume.
  puppy: { eyes: 'open', hood: { ears: 'shiba', color: SILVER, light: SILVER_LIGHT, earOut: HARU.fur, earIn: HARU.tan }, hat: 'plume', hatColor: HARU.collar, top: { kind: 'armor', color: SILVER, emblem: HARU.fur, sash: HARU.collar } },
};
export const TONI_OUTFITS = {
  date: { top: { kind: 'jacket' } },
  cat: { hood: { ears: 'shiba', color: '#262338', light: '#3c3758', earOut: '#e8a04a', earIn: CREAM }, top: { kind: 'hoodie', color: '#262338', stripe: '#f06a95' } },
  lilac: { hood: { ears: 'cat', color: '#7a5fb0', light: '#9d84cc', earIn: '#f49ab6' }, top: { kind: 'hoodie', color: '#7a5fb0', stripe: '#f06a95' } },
  cafe: { hat: 'bandana', hatColor: CAFE.hat, top: { kind: 'apron', ...CAFE } },
  xmas: { hat: 'antlers', top: { kind: 'xmas', color: XMAS_RED, band: CREAM, accent: XMAS_GREEN } },
  park: { hat: 'bucket', hatColor: '#f0d58a', top: { kind: 'tee', color: '#fff', stripe: '#6ec3ff', pocket: '#9fe0c8' } },
  night: { top: { kind: 'suit', color: '#25233a', shirt: '#fff', tie: '#6d1f3d' } },
  newyear: { top: { kind: 'hanbok', jacket: '#7fb6e6', vest: '#2f4a7a', ribbon: '#d8344f', collar: '#fff', pants: '#e8e2f2' } },
  rainy: { hood: { ears: 'round', color: '#3f7cc0', light: '#7fb6e6', earIn: '#ffd34d' }, top: { kind: 'raincoat', color: '#3f7cc0', toggle: '#ffd34d' } },
  // Issei's armor: silver helm with his red shiba ears, a blue bandana cape.
  puppy: { hood: { ears: 'shiba', color: SILVER, light: SILVER_LIGHT, earOut: ISSEI.fur, earIn: ISSEI.cream }, hat: 'plume', hatColor: ISSEI.bandana, top: { kind: 'armor', color: SILVER, emblem: ISSEI.fur, sash: ISSEI.bandana } },
};

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

// Animal-ear hood around the face (shared by both, so couple hoodies match).
function hoodBack(h) {
  const ears = h.ears === 'frog'
    ? `<circle cx="50" cy="20" r="12" ${o(h.color)}/><circle cx="110" cy="20" r="12" ${o(h.color)}/>
       <circle cx="50" cy="19" r="7" fill="#fff" stroke="${INK}" stroke-width="2.4"/><circle cx="110" cy="19" r="7" fill="#fff" stroke="${INK}" stroke-width="2.4"/>
       <circle cx="51" cy="20" r="3.4" fill="${INK}"/><circle cx="109" cy="20" r="3.4" fill="${INK}"/>`
    : h.ears === 'round'
    ? `<circle cx="42" cy="22" r="13" ${o(h.color)}/><circle cx="118" cy="22" r="13" ${o(h.color)}/>
       <circle cx="43" cy="23" r="6.5" fill="${h.earIn}"/><circle cx="117" cy="23" r="6.5" fill="${h.earIn}"/>`
    : h.ears === 'shiba'
    ? `<path d="M36 38 C30 24 32 10 40 7 C49 9 58 17 62 24 Z" ${o(h.earOut)}/>
       <path d="M124 38 C130 24 128 10 120 7 C111 9 102 17 98 24 Z" ${o(h.earOut)}/>
       <path d="M41 28 C39 20 40 14 43 13 C48 15 52 19 54 23 Z" fill="${h.earIn}"/>
       <path d="M119 28 C121 20 120 14 117 13 C112 15 108 19 106 23 Z" fill="${h.earIn}"/>`
    : `<path d="M38 34 L32 6 L62 22 Z" ${o(h.color)}/>
       <path d="M122 34 L128 6 L98 22 Z" ${o(h.color)}/>
       <path d="M40 27 L37 14 L52 22 Z" fill="${h.earIn}"/>
       <path d="M120 27 L123 14 L108 22 Z" fill="${h.earIn}"/>`;
  return `${ears}
    <path d="M28 70 C26 36 50 15 80 15 C110 15 134 36 132 70 C132 80 128 86 122 88 C120 60 104 44 80 44 C56 44 40 60 38 88 C32 86 28 80 28 70 Z" ${o(h.color)}/>
    <path d="M42 46 C50 30 64 22 80 21" fill="none" stroke="${h.light}" stroke-width="5" stroke-linecap="round"/>
    ${shine(104, 28, 8, 4.4)}`;
}

// Hats and headbands, drawn last.
function headwear(kind, color) {
  if (kind === 'sunhat') return `<ellipse cx="80" cy="45" rx="52" ry="11" ${o(color)}/>
    <path d="M55 44 C55 22 105 22 105 44 Z" ${o(color)}/>
    <path d="M55.6 38.5 C66 41 94 41 104.4 38.5" fill="none" stroke="${INK}" stroke-width="7" stroke-linecap="round"/><path d="M55.6 38.5 C66 41 94 41 104.4 38.5" fill="none" stroke="#7ed1b0" stroke-width="4" stroke-linecap="round"/>
    <circle cx="98" cy="37" r="4.6" ${o('#fff', 2.2)}/><circle cx="98" cy="37" r="1.8" fill="#ffd34d"/>
    <path d="M40 47 C52 52 70 54 80 54" fill="none" stroke="#c9a24a" stroke-width="1.6" opacity=".7"/>`;
  if (kind === 'bucket') return `<path d="M52 46 C50 24 110 24 108 46 Z" ${o(color)}/>
    <path d="M38 50 C48 41 112 41 122 50 C112 56 48 56 38 50 Z" ${o(color)}/>
    <path d="M53 40 H107" stroke="#6ec3ff" stroke-width="3.4"/>${shine(70, 31, 7, 3)}`;
  if (kind === 'bow') return `<path d="M104 34 C96 20 84 22 86 32 C88 40 98 38 104 34 Z" ${o(color, 2.8)}/>
    <path d="M104 34 C112 20 124 22 122 32 C120 40 110 38 104 34 Z" ${o(color, 2.8)}/>
    <circle cx="104" cy="34" r="4.6" ${o('#ffe9a8', 2.4)}/>
    <path d="M91 27 C93 25 96 25 98 27 M110 27 C112 25 115 25 117 27" fill="none" stroke="#fff" stroke-width="1.8" opacity=".5"/>`;
  if (kind === 'jobawi') return `<path d="M45 52 C48 32 64 25 80 25 C96 25 112 32 115 52 C103 45 92 43 80 43 C68 43 57 45 45 52 Z" ${o(color)}/>
    <path d="M47 46 C58 39 102 39 113 46" fill="none" stroke="#e8b23a" stroke-width="2.6"/>
    <path d="M68 30 C72 28 88 28 92 30" fill="none" stroke="#e8b23a" stroke-width="2.2"/>
    <circle cx="80" cy="34" r="4" ${o('#d8344f', 2.2)}/>
    <path d="M114 48 C120 54 122 62 120 70" fill="none" stroke="${INK}" stroke-width="5" stroke-linecap="round"/><path d="M114 48 C120 54 122 62 120 70" fill="none" stroke="#d8344f" stroke-width="2.6" stroke-linecap="round"/>
    <path d="M116 70 L124 70 L122 80 L118 80 Z" ${o('#d8344f', 2)}/>`;
  if (kind === 'plume') return `<path d="M80 20 C74 6 84 -4 96 2 C90 4 88 10 86 14 C92 10 98 12 100 16 C92 16 86 20 84 24 Z" ${o(color, 2.8)}/>
    <rect x="76" y="18" width="8" height="7" rx="2" ${o('#e8b23a', 2.2)}/>`;
  if (kind === 'beret') return `<ellipse cx="70" cy="36" rx="30" ry="11" transform="rotate(-14 70 36)" ${o(color)}/>
    <path d="M66 25 l1 -6" stroke="${INK}" stroke-width="3.4" stroke-linecap="round"/>
    <path d="M50 36 C58 28 72 24 84 24" fill="none" stroke="#fff" stroke-width="2.4" stroke-linecap="round" opacity=".45"/>`;
  if (kind === 'santa') return `<path d="M44 42 C46 22 66 10 90 12 C110 14 124 26 130 50 C124 42 116 38 108 40 L114 42 Z" ${o(XMAS_RED)}/>
    <rect x="38" y="35" width="84" height="12" rx="6" ${o(CREAM)}/>
    <circle cx="130" cy="52" r="7" ${o(CREAM)}/>
    ${shine(72, 22, 6, 3)}`;
  if (kind === 'bandana') return `<path d="M43 52 C48 36 62 29 80 29 C98 29 112 36 117 52 C105 45 93 43 80 43 C67 43 55 45 43 52 Z" ${o(color, 2.8)}/>
    <circle cx="66" cy="38" r="1.8" fill="#fff" opacity=".8"/><circle cx="82" cy="35" r="1.8" fill="#fff" opacity=".8"/><circle cx="97" cy="39" r="1.8" fill="#fff" opacity=".8"/>
    <path d="M115 46 L127 41 L124 51 Z M115 48 L125 56 L113 56 Z" ${o(color, 2.2)}/>`;
  if (kind === 'antlers') {
    const antler = (s) => `<path d="M${80 + s * 20} 32 L${80 + s * 30} 10 M${80 + s * 26} 19 L${80 + s * 38} 14 M${80 + s * 29} 12 L${80 + s * 26} 4" fill="none" stroke="${INK}" stroke-width="7" stroke-linecap="round"/>
      <path d="M${80 + s * 20} 32 L${80 + s * 30} 10 M${80 + s * 26} 19 L${80 + s * 38} 14 M${80 + s * 29} 12 L${80 + s * 26} 4" fill="none" stroke="#a8743f" stroke-width="3.6" stroke-linecap="round"/>`;
    return `${antler(-1)}${antler(1)}
      <path d="M46 46 C52 30 66 24 80 24 C94 24 108 30 114 46" fill="none" stroke="${INK}" stroke-width="6" stroke-linecap="round"/>
      <path d="M46 46 C52 30 66 24 80 24 C94 24 108 30 114 46" fill="none" stroke="${XMAS_RED}" stroke-width="3" stroke-linecap="round"/>
      <circle cx="80" cy="24" r="4.2" ${o(XMAS_RED, 2.2)}/>`;
  }
  return '';
}

// Stripes across a body between x0..x1 (a shape that widens by `flare` per unit of y).
const stripes = (ys, x0, x1, top, flare, color) => ys.map((y) => {
  const d = (y - top) * flare;
  return `<path d="M${x0 - d + 2} ${y} H${x1 + d - 2}" stroke="${color}" stroke-width="2.6"/>`;
}).join('');

// Jenny's top. Her body flares a little (a long hoodie / sweater dress shape).
function jennyTop(t, p) {
  const body = (fill) => `<path d="M62 101 H98 L104 133 H56 Z" ${o(fill)}/>`;
  if (t.kind === 'hoodie') return `${body(t.color)}
    <path d="M57.3 126 H102.7 L103.6 130.6 H56.4 Z" fill="${t.stripe}"/>
    <path d="M80 104 C76 100 70 101 71 105 C72 108 77 107 80 104 C83 107 88 108 89 105 C90 101 84 100 80 104 Z" ${o(p.string, 2.4)}/>
    <path d="M79 105 L76 114 M81 105 L84 114" stroke="${INK}" stroke-width="2.2" stroke-linecap="round"/>
    <path d="M95 112 a4.6 4.6 0 1 0 4.1 6.9 a3.6 3.6 0 1 1 -4.1 -6.9z" fill="${t.pin}" stroke="${INK}" stroke-width="1.6"/>`;
  if (t.kind === 'knit') return `<path d="M57.5 128 H102.5 L106 139 H54 Z" ${o(t.skirt, 2.8)}/>
    <path d="M66 130 L64.5 139 M75 130 L74.5 139 M85 130 L85.5 139 M94 130 L95.5 139" stroke="${INK}" stroke-width="1.6" opacity=".55"/>
    <path d="M62 101 H98 L102 129 H58 Z" ${o(t.color)}/>
    <path d="M72 109 q-2.5 4 0 8 t0 8 M88 109 q2.5 4 0 8 t0 8" fill="none" stroke="${t.dark}" stroke-width="2.2" stroke-linecap="round"/>
    <path d="M59 124.5 H101" stroke="${t.dark}" stroke-width="2"/>
    <rect x="70" y="96" width="20" height="9" rx="3.5" ${o(t.color, 2.6)}/>
    <path d="M74 98 v5 M78 98 v5 M82 98 v5 M86 98 v5" stroke="${t.dark}" stroke-width="1.4"/>`;
  if (t.kind === 'apron') return `${body(t.shirt)}
    ${stripes([108, 114, 120, 126, 131], 62, 98, 101, 6 / 32, t.stripe)}
    <path d="M67 107 H93 L97 133 H63 Z" ${o(t.apron, 2.8)}/>
    <rect x="71" y="101" width="18" height="9" rx="2" ${o(t.apron, 2.4)}/>
    <path d="M71 102 L66 98 M89 102 L94 98" stroke="${INK}" stroke-width="2.2" stroke-linecap="round"/>
    <rect x="73.5" y="118" width="13" height="8" rx="2" fill="none" stroke="${CREAM}" stroke-width="1.6"/>
    <path d="M80 107.8 c-1.4 -2 -4 -1 -3 1 c0.6 1.2 3 2.6 3 2.6 c0 0 2.4 -1.4 3 -2.6 c1 -2 -1.6 -3 -3 -1 z" fill="${t.logo}"/>`;
  if (t.kind === 'xmas') return `${body(t.color)}
    <path d="M59.4 112 H100.6 L101.6 120 H58.4 Z" fill="${t.band}"/>
    <path d="M60 116 l4 -3 l4 3 l4 -3 l4 3 l4 -3 l4 3 l4 -3 l4 3 l4 -3 l4 3" fill="none" stroke="${t.accent}" stroke-width="2.2" stroke-linejoin="round"/>
    ${[66, 74, 82, 90].map((x) => `<circle cx="${x + 2}" cy="126" r="1.6" fill="${t.band}"/>`).join('')}
    <path d="M56.6 129 H103.4 L104 133 H56 Z" fill="${t.band}"/>
    <rect x="70" y="96" width="20" height="8" rx="3.5" ${o(t.band, 2.6)}/>`;
  if (t.kind === 'dress') return `${body(t.color)}
    ${[[66, 114], [76, 122], [90, 112], [84, 128], [70, 129], [95, 125]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="1.9" fill="${t.dot}"/>`).join('')}
    <path d="M59.5 116 H100.5 L101 119 H59 Z" fill="${t.belt}" stroke="${INK}" stroke-width="1.6"/>
    <path d="M80 117.5 L74 113 V122 Z M80 117.5 L86 113 V122 Z" fill="${t.belt}" stroke="${INK}" stroke-width="1.6" stroke-linejoin="round"/>
    <path d="M68 101 C70 107 76 108 80 104 C84 108 90 107 92 101 Z" ${o(t.collar, 2.4)}/>`;
  if (t.kind === 'gown') return `${body(t.color)}
    <path d="M80 120 L84 133" stroke="${INK}" stroke-width="1.6" opacity=".4"/>
    ${[[68, 112], [90, 118], [74, 126], [96, 128], [64, 122]].map(([x, y]) => `<path d="M${x} ${y - 2.6} L${x + 0.9} ${y - 0.9} L${x + 2.6} ${y} L${x + 0.9} ${y + 0.9} L${x} ${y + 2.6} L${x - 0.9} ${y + 0.9} L${x - 2.6} ${y} L${x - 0.9} ${y - 0.9} Z" fill="${t.sparkle}"/>`).join('')}
    ${[68, 72, 76, 80, 84, 88, 92].map((x, i) => `<circle cx="${x}" cy="${101 + Math.sin((i / 6) * Math.PI) * 5}" r="1.9" fill="${t.pearl}" stroke="${INK}" stroke-width="1"/>`).join('')}`;
  if (t.kind === 'hanbok') return `<path d="M58 112 H102 L107 137 H53 Z" ${o(t.skirt)}/>
    <path d="M66 116 L63 136 M80 116 V136 M94 116 L97 136" stroke="${INK}" stroke-width="1.4" opacity=".35"/>
    <path d="M62 101 H98 L99.5 114 H60.5 Z" ${o(t.jacket)}/>
    <path d="M70 101 L80 109 L90 101" fill="none" stroke="${t.collar}" stroke-width="3" stroke-linejoin="round"/>
    <path d="M80 109 C76 112 72 116 73 124 M80 109 C83 113 86 116 87 122" fill="none" stroke="${INK}" stroke-width="5.4" stroke-linecap="round"/>
    <path d="M80 109 C76 112 72 116 73 124 M80 109 C83 113 86 116 87 122" fill="none" stroke="${t.ribbon}" stroke-width="3" stroke-linecap="round"/>`;
  if (t.kind === 'raincoat') return `${body(t.color)}
    <path d="M80 102 V133" stroke="${INK}" stroke-width="2"/>
    ${[108, 117, 126].map((y) => `<rect x="76" y="${y}" width="8" height="3" rx="1.5" fill="${t.toggle}" stroke="${INK}" stroke-width="1.2"/>`).join('')}
    <path d="M63 121 H72 M88 121 H97" stroke="${INK}" stroke-width="1.8" opacity=".6"/>`;
  if (t.kind === 'armor') return `${body(t.color)}
    <path d="M64 104 C70 102 90 102 96 104 L98 118 C92 122 68 122 62 118 Z" ${o(SILVER_LIGHT, 2.4)}/>
    ${paw(80, 112, t.emblem)}
    <path d="M62 101 L98 128" stroke="${INK}" stroke-width="6"/><path d="M62 101 L98 128" stroke="${t.sash}" stroke-width="3.6"/>
    <path d="M57.5 127 H102.5 L103.6 133 H56.4 Z" fill="${t.sash}" stroke="${INK}" stroke-width="1.8"/>`;
  return body('#888');
}
// A little paw print (armor emblem).
const paw = (x, y, c) => `<ellipse cx="${x}" cy="${y + 2}" rx="4.4" ry="3.6" fill="${c}"/>${[[-4.6, -3], [-1.6, -5.4], [1.6, -5.4], [4.6, -3]].map(([dx, dy]) => `<circle cx="${x + dx}" cy="${y + dy}" r="1.6" fill="${c}"/>`).join('')}`;
const sleeveColor = (t) => t.sleeve || (t.kind === 'apron' ? t.shirt : t.kind === 'jacket' ? TONI.jacketDark : t.kind === 'tee' ? t.color : t.kind === 'suit' ? t.color : t.kind === 'hanbok' ? t.jacket : t.color);

// opts.crop: head-and-shoulders framing for small portraits
export function jennyChibi(outfit = 'date', opts = {}) {
  const f = JENNY_OUTFITS[outfit] || JENNY_OUTFITS.date;
  const p = { ...J, ...(f.tips ? { tips: f.tips } : {}) };
  const vb = opts.crop ? '26 2 108 108' : '0 0 160 160';
  const sleeve = sleeveColor(f.top);
  return `<svg viewBox="${vb}" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    ${opts.crop ? '' : shadow(80, 150, 32)}
    ${f.hood ? '' : `<path d="M38 98 C28 64 40 30 80 27 C120 30 132 64 122 98 C116 106 106 108 100 104 L60 104 C54 108 44 106 38 98 Z" ${o(p.hair)}/>`}
    <path d="M42 64 C38 84 40 100 46 110 C52 112 56 108 56 104 C52 94 52 78 54 66 Z" ${o(p.hair)}/>
    <path d="M118 64 C122 84 120 100 114 110 C108 112 104 108 104 104 C108 94 108 78 106 66 Z" ${o(p.hair)}/>
    <path d="M44 104 C46 110 52 112 56 104 C55 100 53 98 50 98 C47 98 45 100 44 104 Z" ${o(p.tips)}/>
    <path d="M116 104 C114 110 108 112 104 104 C105 100 107 98 110 98 C113 98 115 100 116 104 Z" ${o(p.tips)}/>
    <rect x="69" y="130" width="8" height="12" rx="2" ${o(p.skin)}/>
    <rect x="83" y="130" width="8" height="12" rx="2" ${o(p.skin)}/>
    <path d="M66 140 h12 a2.5 2.5 0 0 1 2.5 2.5 v1.5 h-14.5 z" ${o(p.shoe)}/>
    <path d="M81.5 140 h12 a2.5 2.5 0 0 1 2.5 2.5 v1.5 h-14.5 z" ${o(p.shoe)}/>
    ${jennyTop(f.top, p)}
    <rect x="52.5" y="103" width="10" height="20" rx="5" transform="rotate(9 57.5 103)" ${o(sleeve)}/>
    <rect x="97.5" y="103" width="10" height="20" rx="5" transform="rotate(-9 102.5 103)" ${o(sleeve)}/>
    <circle cx="54.4" cy="124" r="3.8" ${o(p.skin, 2.8)}/>
    <circle cx="105.6" cy="124" r="3.8" ${o(p.skin, 2.8)}/>
    ${f.hood ? hoodBack(f.hood) : ''}
    <path d="M42 74 C42 54 58 42 80 42 C102 42 118 54 118 74 C118 94 102 104 80 104 C58 104 42 94 42 74 Z" ${o(p.skin)}/>
    <path d="M42 72 C42 52 58 40 80 40 C102 40 118 52 118 72 L108 72 L104 60 L98 70 L84 70 L80 58 L74 70 L60 70 L57 62 L53 72 Z" ${o(p.hair)}/>
    <path d="M60 48 C66 44 74 43 80 43" fill="none" stroke="${p.hairShine}" stroke-width="3" stroke-linecap="round"/>
    ${f.hood ? (!f.hood.pin ? '' : `<path d="M116 26 a8 8 0 1 0 7 12 a6.2 6.2 0 1 1 -7 -12z" fill="${f.hood.pin}" stroke="${INK}" stroke-width="2.4" stroke-linejoin="round"/>`) : `<path d="M98 33 C108 36 116 42 120 52" fill="none" stroke="${p.hairShine}" stroke-width="3" stroke-linecap="round"/>`}
    ${jennyEyes(f.eyes)}
    <ellipse cx="55" cy="90" rx="6" ry="3.6" fill="${p.blush}"/>
    <ellipse cx="105" cy="90" rx="6" ry="3.6" fill="${p.blush}"/>
    <path d="M74 92 Q80 98 86 92" fill="none" stroke="${INK}" stroke-width="3" stroke-linecap="round"/>
    ${headwear(f.hat, f.hatColor)}
  </svg>`;
}

// Toni's top. His body is boxy, with trousers below.
function toniTop(t) {
  const p = TONI;
  const body = (fill) => `<path d="M61 101 H99 L100 124 H60 Z" ${o(fill)}/>`;
  if (t.kind === 'jacket') return `${body(p.jacket)}
    <path d="M60.4 120.5 H99.6 L100 124 H60 Z" fill="${p.jacketDark}" stroke="${INK}" stroke-width="2.2" stroke-linejoin="round"/>
    <path d="M61 101 H99 L99.4 108 H60.6 Z" fill="${p.jacketDark}" stroke="${INK}" stroke-width="2.6" stroke-linejoin="round"/>
    <path d="M80 104 V123" stroke="${p.zip}" stroke-width="2.2" stroke-linecap="round"/>
    <rect x="78.2" y="110" width="3.6" height="5" rx="1" fill="${p.zip}" stroke="${INK}" stroke-width="1.2"/>
    <path d="M67 98 L80 105 L93 98 L94 104 L80 111 L66 104 Z" ${o(p.jacketDark, 2.6)}/>`;
  if (t.kind === 'hoodie') return `${body(t.color)}
    <path d="M60.5 117.5 H99.5 L99.8 121.5 H60.2 Z" fill="${t.stripe}"/>
    <path d="M80 104 C76 100 70 101 71 105 C72 108 77 107 80 104 C83 107 88 108 89 105 C90 101 84 100 80 104 Z" ${o(J.string, 2.4)}/>
    <path d="M79 105 L76 114 M81 105 L84 114" stroke="${INK}" stroke-width="2.2" stroke-linecap="round"/>
    <rect x="70" y="112" width="20" height="5" rx="2" fill="none" stroke="${INK}" stroke-width="1.6" opacity=".5"/>`;
  if (t.kind === 'apron') return `${body(t.shirt)}
    ${stripes([108, 114, 120], 61, 99, 101, 1 / 23, t.stripe)}
    <path d="M66 107 H94 L96 124 H64 Z" ${o(t.apron, 2.8)}/>
    <rect x="71" y="101" width="18" height="9" rx="2" ${o(t.apron, 2.4)}/>
    <path d="M71 102 L66 98 M89 102 L94 98" stroke="${INK}" stroke-width="2.2" stroke-linecap="round"/>
    <rect x="73.5" y="114" width="13" height="7" rx="2" fill="none" stroke="${CREAM}" stroke-width="1.6"/>
    <path d="M80 107.8 c-1.4 -2 -4 -1 -3 1 c0.6 1.2 3 2.6 3 2.6 c0 0 2.4 -1.4 3 -2.6 c1 -2 -1.6 -3 -3 -1 z" fill="${t.logo}"/>`;
  if (t.kind === 'xmas') return `${body(t.color)}
    <path d="M60.5 108 H99.5 L99.8 115 H60.2 Z" fill="${t.band}"/>
    <path d="M61 112 l4 -3 l4 3 l4 -3 l4 3 l4 -3 l4 3 l4 -3 l4 3 l4 -3 l4 3" fill="none" stroke="${t.accent}" stroke-width="2.2" stroke-linejoin="round"/>
    ${[66, 74, 82, 90].map((x) => `<circle cx="${x + 2}" cy="119" r="1.6" fill="${t.band}"/>`).join('')}
    <path d="M60.2 121.5 H99.8 L100 124 H60 Z" fill="${t.band}"/>
    <rect x="70" y="96" width="20" height="8" rx="3.5" ${o(t.band, 2.6)}/>`;
  if (t.kind === 'tee') return `${body(t.color)}
    ${stripes([106, 111, 116, 121], 61, 99, 101, 1 / 23, t.stripe)}
    <rect x="86" y="104" width="8" height="7" rx="1.5" fill="${t.pocket}" stroke="${INK}" stroke-width="1.6"/>
    <path d="M72 101 Q80 106 88 101" fill="none" stroke="${INK}" stroke-width="2"/>`;
  if (t.kind === 'suit') return `${body(t.color)}
    <path d="M71 101 L80 116 L89 101 Z" fill="${t.shirt}" stroke="${INK}" stroke-width="2" stroke-linejoin="round"/>
    <path d="M70 101 L77 113 L72 112 Z M90 101 L83 113 L88 112 Z" fill="${t.color}" stroke="${INK}" stroke-width="1.8" stroke-linejoin="round"/>
    <path d="M80 105 L74 101.5 V108.5 Z M80 105 L86 101.5 V108.5 Z" fill="${t.tie}" stroke="${INK}" stroke-width="1.6" stroke-linejoin="round"/><circle cx="80" cy="105" r="1.8" fill="${t.tie}" stroke="${INK}" stroke-width="1.2"/>
    <circle cx="80" cy="119" r="1.4" fill="${t.shirt}"/>`;
  if (t.kind === 'hanbok') return `${body(t.jacket)}
    <path d="M64 103 H96 L97 124 H63 Z" ${o(t.vest, 2.6)}/>
    <path d="M72 101 L80 108 L88 101" fill="none" stroke="${t.collar}" stroke-width="3" stroke-linejoin="round"/>
    <path d="M80 108 V124" stroke="${INK}" stroke-width="1.6" opacity=".5"/>
    <circle cx="76" cy="114" r="1.8" fill="#e8b23a" stroke="${INK}" stroke-width="1"/><circle cx="76" cy="120" r="1.8" fill="#e8b23a" stroke="${INK}" stroke-width="1"/>
    <path d="M82 110 C86 112 88 116 87 120" fill="none" stroke="${INK}" stroke-width="5" stroke-linecap="round"/><path d="M82 110 C86 112 88 116 87 120" fill="none" stroke="${t.ribbon}" stroke-width="2.6" stroke-linecap="round"/>`;
  if (t.kind === 'raincoat') return `${body(t.color)}
    <path d="M80 102 V124" stroke="${INK}" stroke-width="2"/>
    ${[107, 114, 121].map((y) => `<rect x="76" y="${y - 1}" width="8" height="3" rx="1.5" fill="${t.toggle}" stroke="${INK}" stroke-width="1.2"/>`).join('')}`;
  if (t.kind === 'armor') return `${body(t.color)}
    <path d="M64 103 C70 101 90 101 96 103 L97 116 C91 120 69 120 63 116 Z" ${o(SILVER_LIGHT, 2.4)}/>
    ${paw(80, 110, t.emblem)}
    <path d="M60.4 119 H99.6 L100 124 H60 Z" fill="${t.sash}" stroke="${INK}" stroke-width="1.8"/>
    <path d="M66 98 L80 106 L94 98 L95 103 L80 111 L65 103 Z" ${o(t.sash, 2.4)}/>`;
  return body('#888');
}

export function toniChibi(outfit = 'date', opts = {}) {
  const f = TONI_OUTFITS[outfit] || TONI_OUTFITS.date;
  const p = TONI;
  const vb = opts.crop ? '26 2 108 108' : '0 0 160 160';
  const sleeve = sleeveColor(f.top);
  const lens = (x) => `<rect x="${x - 11}" y="71" width="22" height="17" rx="5" fill="#fff" fill-opacity=".22" stroke="${p.frame}" stroke-width="3.4"/>`;
  const eye = (x) => `<path d="M${x - 6} 82 Q${x} 75.5 ${x + 6} 82" fill="none" stroke="${INK}" stroke-width="3.4" stroke-linecap="round"/>`;
  const fullHair = `<path d="M40 72 C36 48 48 28 66 23 L68 11 L77 19 L85 8 L91 19 L101 12 L103 25 C118 32 126 50 120 72 L116 72 C116 63 113 58 109 55 L105 63 L97 56 L87 63 L79 54 L69 61 L61 55 C53 59 47 64 45 72 Z" ${o(p.hair)}/>
    <path d="M60 33 C68 26 78 24 88 25" fill="none" stroke="${p.hairShine}" stroke-width="3.4" stroke-linecap="round"/>`;
  const fringe = `<path d="M44 70 C44 54 60 42 80 42 C100 42 116 54 116 70 L113 64 L109 55 L105 63 L97 56 L87 63 L79 54 L69 61 L61 55 C53 59 48 64 46 70 Z" ${o(p.hair)}/>`;
  const zzz = opts.crop || f.hat === 'antlers' ? '' : `<text x="118" y="34" font-size="13" font-weight="900" fill="${INK}" font-family="sans-serif" opacity=".55">z</text><text x="128" y="22" font-size="10" font-weight="900" fill="${INK}" font-family="sans-serif" opacity=".4">z</text>`;
  return `<svg viewBox="${vb}" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    ${opts.crop ? '' : shadow(80, 150, 32)}
    ${f.hood ? '' : zzz}
    <path d="M63 116 H97 L96 141 H82.5 L80 127 L77.5 141 H64 Z" ${o(f.top.pants || p.pants)}/>
    <path d="M61 139 h17 a3 3 0 0 1 3 3 v2 h-20 z" ${o(p.shoe)}/>
    <path d="M82 139 h14 a3 3 0 0 1 3 3 v2 h-17 z" ${o(p.shoe)}/>
    ${toniTop(f.top)}
    <rect x="52.5" y="103" width="10" height="20" rx="5" transform="rotate(9 57.5 103)" ${o(sleeve)}/>
    <rect x="97.5" y="103" width="10" height="20" rx="5" transform="rotate(-9 102.5 103)" ${o(sleeve)}/>
    <circle cx="54.4" cy="124" r="3.8" ${o(p.skin, 2.8)}/>
    <circle cx="105.6" cy="124" r="3.8" ${o(p.skin, 2.8)}/>
    ${f.hood ? hoodBack(f.hood) : `<ellipse cx="42" cy="80" rx="5.5" ry="7.5" ${o(p.skin, 2.8)}/>
    <ellipse cx="118" cy="80" rx="5.5" ry="7.5" ${o(p.skin, 2.8)}/>
    <circle cx="40.5" cy="87" r="1.8" fill="${p.zip}" stroke="${INK}" stroke-width="1"/>`}
    <path d="M42 74 C42 54 58 42 80 42 C102 42 118 54 118 74 C118 94 102 104 80 104 C58 104 42 94 42 74 Z" ${o(p.skin)}/>
    ${f.hood || f.hat === 'bucket' ? fringe : fullHair}
    ${eye(64)}${eye(96)}
    ${lens(64)}${lens(96)}
    <path d="M75 78 Q80 75.5 85 78" fill="none" stroke="${p.frame}" stroke-width="3" stroke-linecap="round"/>
    <path d="M53 76 L44 74 M107 76 L116 74" stroke="${p.frame}" stroke-width="3" stroke-linecap="round"/>
    <ellipse cx="54" cy="93" rx="5.5" ry="3.2" fill="${p.blush}"/>
    <ellipse cx="106" cy="93" rx="5.5" ry="3.2" fill="${p.blush}"/>
    <path d="M70 92 Q80 104 90 92 Z" ${o('#8a2f3c', 2.8)}/>
    <path d="M72.5 92.6 H87.5 L86.3 95.4 H73.7 Z" fill="#fff"/>
    ${headwear(f.hat, f.hatColor)}
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

  // ----- Floor 4 -----
  // Flickering Neon: a heart-shaped neon tube on a black board.
  neon: (c) => `${shadow(60, 113, 40)}
    <path d="M40 14 L46 2 M80 14 L74 2" stroke="${INK}" stroke-width="2.6" stroke-linecap="round"/>
    <rect x="18" y="12" width="84" height="92" rx="14" ${o('#2a1626')}/>
    <path d="M60 92 C30 72 26 56 30 44 C34 30 52 28 60 42 C68 28 86 30 90 44 C94 56 90 72 60 92 Z" fill="${lighten(c, 0.6)}" stroke="${c}" stroke-width="14" stroke-linejoin="round" stroke-opacity=".3"/>
    <path d="M60 92 C30 72 26 56 30 44 C34 30 52 28 60 42 C68 28 86 30 90 44 C94 56 90 72 60 92 Z" fill="none" stroke="${INK}" stroke-width="9" stroke-linejoin="round"/>
    <path d="M60 92 C30 72 26 56 30 44 C34 30 52 28 60 42 C68 28 86 30 90 44 C94 56 90 72 60 92 Z" fill="none" stroke="${c}" stroke-width="5" stroke-linejoin="round"/>
    <path d="M36 46 C37 40 41 37 46 37" fill="none" stroke="#fff" stroke-width="2.2" stroke-linecap="round"/>
    ${face(60, 56, { eyes: 'angry', mouth: 'fang', gap: 11, size: 0.85 })}
    <path d="M96 20 L104 16 M98 30 L106 30" stroke="${c}" stroke-width="2.6" stroke-linecap="round"/>`,

  // Energy Can Fiend: a flexing energy drink can.
  can: (c) => `${shadow(60, 113, 38)}
    <circle cx="20" cy="60" r="9" ${o(c)}/><circle cx="100" cy="60" r="9" ${o(c)}/>
    <path d="M26 64 L34 70 M94 64 L86 70" stroke="${INK}" stroke-width="3"/>
    <rect x="32" y="18" width="56" height="90" rx="10" ${o(c)}/>
    <ellipse cx="60" cy="20" rx="26" ry="6" ${o('#d9d4e0', 3)}/>
    <path d="M56 18 h10 a3 3 0 0 1 0 6 h-10 z" fill="none" stroke="${INK}" stroke-width="2.4"/>
    <path d="M36 36 C38 30 42 28 46 28" fill="none" stroke="${lighten(c, 0.45)}" stroke-width="4" stroke-linecap="round"/>
    <path d="M64 74 L54 92 H62 L58 104 L72 84 H63 L68 74 Z" ${o('#ffd34d', 2.4)}/>
    ${face(60, 50, { eyes: 'angry', mouth: 'grin', gap: 12, size: 0.9 })}`,

  // Cable Kraken: a blob with tangled cable tentacles ending in plugs.
  kraken: (c) => `${shadow(60, 113, 46)}
    ${[['M34 70 C20 80 10 96 16 108', 10, 106], ['M48 80 C42 94 40 104 46 112', 44, 110], ['M72 80 C78 94 80 104 74 112', 76, 110], ['M86 70 C100 80 110 96 104 108', 104, 106]].map(([d, x, y]) => `<path d="${d}" fill="none" stroke="${INK}" stroke-width="10" stroke-linecap="round"/><path d="${d}" fill="none" stroke="${c}" stroke-width="6" stroke-linecap="round"/><rect x="${x - 6}" y="${y - 4}" width="12" height="9" rx="2" ${o('#d9d4e0', 2.4)}/>`).join('')}
    <path d="M18 64 C16 32 36 12 60 12 C84 12 104 32 102 64 C100 80 82 86 60 86 C38 86 20 80 18 64 Z" ${o(c)}/>
    ${shine(80, 28, 8, 4, 30)}
    ${face(60, 50, { eyes: 'sly', mouth: 'fang', gap: 15 })}`,

  // Last-Call Ghost: a sleepy ghost clutching a coin it took.
  ghost: (c) => `${shadow(60, 113, 34)}
    <path d="M24 104 V52 C24 28 40 12 60 12 C80 12 96 28 96 52 V104 L86 96 L76 104 L66 96 L56 104 L46 96 L36 104 Z" ${o(c)}/>
    ${shine(40, 28, 7, 3.6, -30)}
    ${face(60, 50, { eyes: 'sly', mouth: 'grin', gap: 13 })}
    <circle cx="86" cy="74" r="10" ${o('#ffc53d', 3)}/><path d="M86 68 V80" stroke="${INK}" stroke-width="2.4"/>
    <path d="M92 64 C96 66 98 70 98 74" fill="none" stroke="#fff" stroke-width="2" opacity=".8"/>`,

  // VIP Lounge Host: tuxedo, top hat, monocle, very exclusive.
  host: (c) => `${shadow(60, 113, 40)}
    <path d="M22 108 C22 76 36 62 60 62 C84 62 98 76 98 108 Z" ${o(c)}/>
    <path d="M50 62 L60 90 L70 62 Z" fill="#fff" stroke="${INK}" stroke-width="2.6" stroke-linejoin="round"/>
    <path d="M60 68 L50 63 V73 Z M60 68 L70 63 V73 Z" ${o('#c2417a', 2.2)}/>
    <circle cx="60" cy="80" r="1.8" fill="${INK}"/><circle cx="60" cy="88" r="1.8" fill="${INK}"/>
    <circle cx="60" cy="42" r="26" ${o('#f6d6c0')}/>
    <rect x="38" y="20" width="44" height="6" rx="3" ${o(c, 3)}/><rect x="44" y="0" width="32" height="22" rx="3" ${o(c, 3)}/>
    <path d="M44 16 H76" stroke="#c2417a" stroke-width="3"/>
    ${face(60, 44, { eyes: 'sly', mouth: 'smile', gap: 11, size: 0.9 })}
    <circle cx="71" cy="44" r="7" fill="none" stroke="#e8b23a" stroke-width="2.6"/><path d="M78 46 C82 52 82 58 78 62" fill="none" stroke="#e8b23a" stroke-width="1.6"/>`,

  // Haunted Arcade Cabinet: the screen is its face.
  arcade: (c) => `${shadow(60, 114, 42)}
    <path d="M24 108 V20 C24 14 28 10 34 10 H86 C92 10 96 14 96 20 V108 Z" ${o(c)}/>
    <rect x="30" y="14" width="60" height="14" rx="3" ${o('#2a1626', 2.6)}/>
    <text x="60" y="25.5" text-anchor="middle" font-size="10" font-weight="900" font-family="sans-serif" fill="#ffd34d" letter-spacing="1.5">GAME</text>
    <rect x="32" y="32" width="56" height="40" rx="5" ${o('#1d3b52', 3)}/>
    ${face(60, 48, { eyes: 'angry', mouth: 'grin', gap: 12, size: 0.8, blush: false }).replace(/fill="#1a1420"/g, 'fill="#7de0d3"')}
    <path d="M28 76 H92 L96 86 H24 Z" ${o(darken(c, 0.2), 2.8)}/>
    <path d="M44 80 V72" stroke="${INK}" stroke-width="3" stroke-linecap="round"/><circle cx="44" cy="70" r="4" ${o('#e0485f', 2.2)}/>
    <circle cx="66" cy="81" r="3" ${o('#ffd34d', 2)}/><circle cx="76" cy="81" r="3" ${o('#6ec3ff', 2)}/>
    <rect x="48" y="92" width="24" height="10" rx="2" ${o('#2a1626', 2.4)}/><path d="M56 97 H64" stroke="#ffd34d" stroke-width="2"/>`,

  // Security Eye: a dome camera on a bracket, one big lens.
  camera: (c) => `${shadow(60, 114, 34)}
    <rect x="52" y="4" width="16" height="20" rx="3" ${o('#9aa5a0', 3)}/>
    <path d="M14 34 C14 22 30 18 60 18 C90 18 106 22 106 34 Z" ${o('#9aa5a0', 3)}/>
    <path d="M14 34 H106 C106 74 86 100 60 100 C34 100 14 74 14 34 Z" ${o(c)}/>
    ${shine(30, 46, 7, 3.6, -30)}
    <circle cx="60" cy="62" r="24" ${o('#2a1626', 3)}/>
    <circle cx="60" cy="62" r="14" fill="#3f7cc0"/><circle cx="60" cy="62" r="7" fill="${INK}"/>
    <circle cx="54" cy="56" r="4" fill="#fff"/>
    <path d="M30 44 L46 50 M90 44 L74 50" stroke="${INK}" stroke-width="4" stroke-linecap="round"/>
    <circle cx="92" cy="40" r="4" fill="#e0485f" stroke="${INK}" stroke-width="2"/>`,

  // Closing-Time Janitor: a mop bucket with a mop for hair.
  janitor: (c) => `${shadow(60, 114, 42)}
    <path d="M86 6 L74 54" stroke="${INK}" stroke-width="8" stroke-linecap="round"/><path d="M86 6 L74 54" stroke="#c98b5e" stroke-width="4.4" stroke-linecap="round"/>
    <path d="M30 46 C24 30 34 20 44 26 C46 14 60 12 64 22 C70 12 86 16 84 30 C94 28 98 40 90 48 Z" ${o('#e8e2f2')}/>
    <path d="M38 34 L36 46 M50 30 L48 46 M62 30 L62 46 M74 32 L76 46" stroke="${INK}" stroke-width="1.8" opacity=".45"/>
    <path d="M22 46 H98 L90 108 H30 Z" ${o(c)}/>
    <path d="M22 46 H98" stroke="${INK}" stroke-width="4"/>
    <path d="M24 50 C34 48 44 54 56 50" fill="none" stroke="#6ec3ff" stroke-width="3" stroke-linecap="round"/>
    <path d="M14 58 C8 58 8 72 16 72 M106 58 C112 58 112 72 104 72" fill="none" stroke="${INK}" stroke-width="3.4"/>
    ${face(60, 72, { eyes: 'angry', mouth: 'frown', gap: 13 })}
    <rect x="44" y="94" width="32" height="8" rx="2" fill="#fff" stroke="${INK}" stroke-width="2"/><path d="M50 98 H70" stroke="${INK}" stroke-width="1.6"/>`,

  // ----- bosses -----
  // The Net Café: the whole building, awake. Glowing window eyes, a neon sign, the door for a mouth.
  netcafe: (c) => `${shadow(60, 115, 52)}
    <rect x="44" y="2" width="5" height="14" ${o('#9aa5a0', 2.4)}/><circle cx="46.5" cy="2" r="3" ${o('#ff5d8f', 2)}/>
    <path d="M14 22 L60 8 L106 22 Z" ${o(darken(c, 0.25))}/>
    <rect x="12" y="20" width="96" height="92" rx="6" ${o(c)}/>
    <path d="M18 28 C20 25 24 23 28 23" fill="none" stroke="${lighten(c, 0.35)}" stroke-width="4" stroke-linecap="round"/>
    <rect x="22" y="27" width="76" height="17" rx="4" ${o('#2a1626', 2.8)}/>
    <text x="60" y="40.5" text-anchor="middle" font-size="11.5" font-weight="900" font-family="sans-serif" fill="#ff8fd0" stroke="#ff5db0" stroke-width=".6" letter-spacing="1">NET CAFÉ</text>
    <rect x="22" y="52" width="26" height="22" rx="3" ${o('#fff3b0', 3)}/><rect x="72" y="52" width="26" height="22" rx="3" ${o('#fff3b0', 3)}/>
    <path d="M22 50 L48 56 M98 50 L72 56" stroke="${INK}" stroke-width="4.2" stroke-linecap="round"/>
    <ellipse cx="37" cy="65" rx="5.5" ry="6.5" fill="${INK}"/><ellipse cx="83" cy="65" rx="5.5" ry="6.5" fill="${INK}"/>
    <circle cx="35" cy="62.5" r="2" fill="#fff"/><circle cx="81" cy="62.5" r="2" fill="#fff"/>
    <path d="M35 52 V74 M22 63 H48 M85 52 V74 M72 63 H98" stroke="${INK}" stroke-width="1.4" opacity=".35"/>
    <path d="M42 112 V88 C42 80 50 78 60 78 C70 78 78 80 78 88 V112 Z" ${o('#3a1830', 3)}/>
    <path d="M47 86 L51 92 L55 86 L59 92 L63 86 L67 92 L71 86 L74 90" fill="#fff" stroke="${INK}" stroke-width="2" stroke-linejoin="round"/>
    <ellipse cx="60" cy="104" rx="9" ry="5" fill="#ff5d8f" opacity=".85"/>
    <rect x="16" y="82" width="20" height="16" rx="2" ${o('#6ec3ff', 2.6)}/><rect x="84" y="82" width="20" height="16" rx="2" ${o('#6ec3ff', 2.6)}/>
    <path d="M20 94 L26 86 M88 94 L94 86" stroke="#fff" stroke-width="2" stroke-linecap="round" opacity=".7"/>
    <ellipse cx="20" cy="76" rx="5" ry="3" fill="#f27a8f"/><ellipse cx="100" cy="76" rx="5" ry="3" fill="#f27a8f"/>`,

  // The Ramen Thief: beanie, bandit mask, a stolen bowl of ramen.
  ramen: (c) => `${shadow(60, 113, 42)}
    <path d="M20 108 C16 82 30 58 60 58 C90 58 104 82 100 108 Z" ${o(c)}/>
    <path d="M34 72 C40 66 48 64 56 64" fill="none" stroke="${lighten(c, 0.35)}" stroke-width="5" stroke-linecap="round"/>
    <circle cx="56" cy="42" r="26" ${o('#f6d6c0')}/>
    <path d="M30 36 C30 10 82 10 82 36 Z" ${o(darken(c, 0.15))}/>
    <path d="M28 34 H84" stroke="${INK}" stroke-width="7" stroke-linecap="round"/><path d="M28 34 H84" stroke="${lighten(c, 0.2)}" stroke-width="3.5" stroke-linecap="round"/>
    <circle cx="56" cy="10" r="6" ${o('#d2493f', 2.6)}/>
    <path d="M30 40 C40 36 72 36 82 40 L82 50 C72 46 40 46 30 50 Z" fill="${INK}"/>
    <ellipse cx="45" cy="44" rx="5.5" ry="3.2" fill="#fff"/><ellipse cx="67" cy="44" rx="5.5" ry="3.2" fill="#fff"/>
    <circle cx="46.5" cy="44" r="2.2" fill="${INK}"/><circle cx="68.5" cy="44" r="2.2" fill="${INK}"/>
    <path d="M48 58 Q56 63 64 57" fill="none" stroke="${INK}" stroke-width="3" stroke-linecap="round"/>
    <path d="M64 84 H112 C112 98 102 108 88 108 C74 108 64 98 64 84 Z" ${o('#ff6b6b')}/>
    <path d="M70 92 H106" stroke="#fff" stroke-width="3" stroke-dasharray="4 4"/>
    <path d="M68 84 q4 -8 8 0 q4 -8 8 0 q4 -8 8 0 q4 -8 8 0 q4 -8 8 0" fill="none" stroke="#f2c94c" stroke-width="4" stroke-linecap="round"/>
    <path d="M86 82 L104 56 M92 82 L112 60" stroke="${INK}" stroke-width="5.5" stroke-linecap="round"/><path d="M86 82 L104 56 M92 82 L112 60" stroke="#d6ab7b" stroke-width="2.6" stroke-linecap="round"/>
    <path d="M76 74 q-3 -6 0 -12 M100 72 q-3 -6 0 -12" fill="none" stroke="#fff" stroke-width="2.6" stroke-linecap="round" opacity=".85"/>`,

  // The Forever Regular: slumped in a café chair all day with one coffee.
  regular: (c) => `${shadow(60, 113, 48)}
    <rect x="14" y="40" width="92" height="66" rx="16" ${o('#6b4f9a')}/>
    <path d="M22 50 C24 46 28 44 32 44" fill="none" stroke="#9d84cc" stroke-width="4" stroke-linecap="round"/>
    <path d="M26 110 C24 84 38 68 60 68 C82 68 96 84 94 110 Z" ${o(c)}/>
    <path d="M60 70 V108" stroke="${INK}" stroke-width="2.4"/>
    <circle cx="60" cy="46" r="24" ${o('#f2c9a8')}/>
    <path d="M36 46 C30 22 50 14 60 20 C70 12 92 22 84 46 C80 36 74 32 68 36 C62 30 52 32 48 38 C44 34 40 40 36 46 Z" ${o('#3a2f2a')}/>
    ${face(60, 50, { eyes: 'sly', mouth: 'flat', gap: 10, blush: false })}
    <path d="M44 56 q6 3 12 0 M64 56 q6 3 12 0" fill="none" stroke="#b58a9a" stroke-width="2.2" stroke-linecap="round"/>
    <path d="M52 66 h2 M58 67 h2 M64 66 h2" stroke="#8a6a5a" stroke-width="2" stroke-linecap="round"/>
    <path d="M76 80 H98 L95 104 H79 Z" ${o('#fff4e6')}/><rect x="74" y="75" width="26" height="7" rx="3" ${o('#8a5a3c', 2.6)}/>
    <path d="M80 92 H94" stroke="#d2493f" stroke-width="3"/>
    <text x="96" y="30" font-size="14" font-weight="900" fill="#fff" stroke="${INK}" stroke-width="1" font-family="sans-serif">…</text>`,

  // The Data Miner: a hard drive in a mining helmet, pickaxe ready.
  dataminer: (c) => `${shadow(60, 113, 46)}
    <path d="M60 32 L104 4 L116 24 Z" fill="#fff4a8" opacity=".45"/>
    <rect x="18" y="46" width="78" height="62" rx="10" ${o(c)}/>
    <text x="26" y="102" font-size="10" font-family="monospace" font-weight="800" fill="${lighten(c, 0.6)}">0110 1011</text>
    <rect x="30" y="54" width="54" height="32" rx="8" ${o('#e8f6ff', 3)}/>
    ${face(57, 66, { eyes: 'angry', mouth: 'grin', gap: 12, size: 0.8, blush: false })}
    <path d="M22 48 C22 18 92 18 92 48 Z" ${o('#f2c94c')}/>
    <path d="M30 40 C32 30 38 26 44 24" fill="none" stroke="#fff4a8" stroke-width="4" stroke-linecap="round"/>
    <rect x="16" y="44" width="82" height="8" rx="4" ${o('#e0b23a', 2.8)}/>
    <circle cx="57" cy="32" r="7" ${o('#fff4a8', 3)}/>
    <path d="M110 106 L94 60" stroke="${INK}" stroke-width="8" stroke-linecap="round"/><path d="M110 106 L94 60" stroke="#a0724a" stroke-width="4" stroke-linecap="round"/>
    <path d="M78 64 Q94 50 112 58" fill="none" stroke="${INK}" stroke-width="9" stroke-linecap="round"/><path d="M78 64 Q94 50 112 58" fill="none" stroke="#b9bdb3" stroke-width="5" stroke-linecap="round"/>`,

  // The Server Admins: two monitors with headsets sharing one desk.
  admins: (c) => `${shadow(60, 113, 52)}
    <rect x="22" y="72" width="10" height="22" ${o('#9aa5a0', 2.6)}/><rect x="88" y="72" width="10" height="22" ${o('#9aa5a0', 2.6)}/>
    <rect x="4" y="92" width="112" height="14" rx="4" ${o('#8a5a3c')}/>
    <rect x="4" y="30" width="52" height="44" rx="7" ${o(c)}/><rect x="10" y="36" width="40" height="32" rx="4" fill="${lighten(c, 0.6)}"/>
    <rect x="64" y="26" width="52" height="48" rx="7" ${o(darken(c, 0.15))}/><rect x="70" y="32" width="40" height="36" rx="4" fill="${lighten(c, 0.6)}"/>
    ${face(30, 49, { eyes: 'angry', mouth: 'flat', gap: 8, size: 0.7, blush: false })}
    ${face(90, 47, { eyes: 'sly', mouth: 'grin', gap: 8, size: 0.7, blush: false })}
    <path d="M6 40 C6 14 54 14 54 40" fill="none" stroke="${INK}" stroke-width="4.5"/><path d="M66 36 C66 8 114 8 114 36" fill="none" stroke="${INK}" stroke-width="4.5"/>
    <rect x="0" y="36" width="9" height="15" rx="3" ${o('#2a2830', 2.2)}/><rect x="51" y="36" width="9" height="15" rx="3" ${o('#2a2830', 2.2)}/>
    <rect x="60" y="32" width="9" height="15" rx="3" ${o('#2a2830', 2.2)}/><rect x="111" y="32" width="9" height="15" rx="3" ${o('#2a2830', 2.2)}/>
    <path d="M8 50 Q14 60 22 58" fill="none" stroke="${INK}" stroke-width="2.4"/><circle cx="23" cy="58" r="2.6" fill="${INK}"/>
    <rect x="40" y="96" width="40" height="7" rx="2" fill="#fff" opacity=".85"/><text x="45" y="102" font-size="6.5" font-weight="900" fill="${INK}" font-family="sans-serif">ADMIN</text>`,

  // The Head Moderator: cap, badge and a big BAN hammer.
  moderator: (c) => `${shadow(60, 113, 44)}
    <path d="M18 108 C14 74 30 46 58 46 C86 46 102 74 98 108 Z" ${o(c)}/>
    <path d="M30 66 C32 56 40 50 50 48" fill="none" stroke="${lighten(c, 0.4)}" stroke-width="5" stroke-linecap="round"/>
    ${face(58, 64, { eyes: 'angry', mouth: 'frown', gap: 13 })}
    <path d="M58 82 L72 88 V96 C72 102 64 106 58 108 C52 106 44 102 44 96 V88 Z" ${o('#f2c94c', 3)}/>
    <text x="52.5" y="101" font-size="12" font-weight="900" fill="${INK}" font-family="sans-serif">M</text>
    <path d="M28 50 C28 24 88 24 88 50 Z" ${o('#2a2830')}/>
    <path d="M22 50 H94" stroke="${INK}" stroke-width="9" stroke-linecap="round"/><path d="M22 50 H94" stroke="#3d3a4a" stroke-width="5" stroke-linecap="round"/>
    <circle cx="58" cy="36" r="5.5" ${o('#f2c94c', 2.4)}/>
    <path d="M112 112 L98 66" stroke="${INK}" stroke-width="8" stroke-linecap="round"/><path d="M112 112 L98 66" stroke="#d6ab7b" stroke-width="4" stroke-linecap="round"/>
    <g transform="rotate(-16 98 56)"><rect x="80" y="44" width="38" height="22" rx="4" ${o('#d2493f')}/><text x="86" y="60" font-size="11" font-weight="900" fill="#fff" font-family="sans-serif">BAN</text></g>`,

  // The Hive Mind: a network of linked nodes thinking as one.
  hive: (c) => `${shadow(60, 113, 48)}
    <path d="M60 60 L20 28 M60 60 L100 28 M60 60 L18 94 M60 60 L102 94 M20 28 L100 28 M18 94 L102 94 M20 28 L18 94 M100 28 L102 94" stroke="${INK}" stroke-width="5" stroke-linecap="round"/>
    <path d="M60 60 L20 28 M60 60 L100 28 M60 60 L18 94 M60 60 L102 94 M20 28 L100 28 M18 94 L102 94 M20 28 L18 94 M100 28 L102 94" stroke="${lighten(c, 0.5)}" stroke-width="2" stroke-linecap="round"/>
    ${[[20, 28], [100, 28], [18, 94], [102, 94]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="13" ${o(lighten(c, 0.25))}/>${face(x, y - 2, { eyes: 'dot', mouth: 'flat', gap: 4.5, size: 0.5, blush: false })}`).join('')}
    <circle cx="60" cy="60" r="29" ${o(c)}/>
    ${shine(46, 44, 7, 4, -30)}
    ${face(60, 56, { eyes: 'sly', mouth: 'grin', gap: 11 })}
    <circle cx="60" cy="24" r="4" ${o('#f2c94c', 2.2)}/><path d="M60 28 V32" stroke="${INK}" stroke-width="3"/>`,
};

export function enemyChibi(art, color) {
  const draw = ART[art] || ART.slime;
  return `<svg viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">${draw(color)}</svg>`;
}

// ---------------- guardians ----------------
// Haru and Issei (shibas), Hana and Kaiba (wiener dogs), the Sushi Queen.
const eyes2 = (cx, cy, gap, r = 4.6) => [cx - gap, cx + gap].map((x) => `<ellipse cx="${x}" cy="${cy}" rx="${r}" ry="${r * 1.25}" fill="${INK}"/><circle cx="${x - 1.5}" cy="${cy - 2.2}" r="${r * 0.38}" fill="#fff"/>`).join('');
const blushes = (cx, cy, gap) => [cx - gap, cx + gap].map((x) => `<ellipse cx="${x}" cy="${cy}" rx="5" ry="3" fill="#f59ab0" opacity=".75"/>`).join('');

function shiba({ fur = '#e39a4c', cream = CREAM, points = '', chest = '', scale = 1, extra = '' } = {}) {
  return `<g transform="translate(60 60) scale(${scale}) translate(-60 -60)">${shadow(60, 112, 34)}
    <path d="M86 84 C102 78 104 60 92 58 C84 57 84 68 90 70" ${o(fur)}/>
    <path d="M38 80 C36 100 42 110 60 110 C78 110 84 100 82 80 Z" ${o(fur)}/>
    ${chest || `<path d="M50 92 C50 104 70 104 70 92 C66 84 54 84 50 92 Z" fill="${cream}"/>`}
    <path d="M44 108 v-8 M76 108 v-8" stroke="${INK}" stroke-width="${SW}" stroke-linecap="round"/>
    <path d="M30 40 L28 12 L52 28 Z" ${o(fur)}/><path d="M34 34 L33 20 L45 29 Z" fill="${cream}"/>
    <path d="M90 40 L92 12 L68 28 Z" ${o(fur)}/><path d="M86 34 L87 20 L75 29 Z" fill="${cream}"/>
    <ellipse cx="60" cy="54" rx="34" ry="29" ${o(fur)}/>
    <path d="M34 62 C40 82 80 82 86 62 C80 52 70 58 60 58 C50 58 40 52 34 62 Z" fill="${cream}"/>
    ${points ? `<ellipse cx="47" cy="41" rx="4" ry="2.6" fill="${points}"/><ellipse cx="73" cy="41" rx="4" ry="2.6" fill="${points}"/><path d="M36 60 C38 66 42 68 46 66 M84 60 C82 66 78 68 74 66" fill="none" stroke="${points}" stroke-width="4" stroke-linecap="round"/>` : ''}
    ${shine(78, 36, 6, 3.5)}
    ${eyes2(60, 52, 13)}${blushes(60, 64, 22)}
    <ellipse cx="60" cy="62" rx="4.5" ry="3.2" fill="${INK}"/>
    <path d="M54 68 Q57 72 60 68 Q63 72 66 68" fill="none" stroke="${INK}" stroke-width="2.6" stroke-linecap="round"/>
    ${extra}</g>`;
}

function wiener({ fur = '#7a4528', dark = fur, ear = dark, belly = fur, patches = '', extra = '', face = '' } = {}) {
  return `${shadow(60, 104, 50)}
    <path d="M104 74 C114 68 116 60 112 56" fill="none" stroke="${INK}" stroke-width="9" stroke-linecap="round"/>
    <path d="M104 74 C114 68 116 60 112 56" fill="none" stroke="${dark}" stroke-width="4.5" stroke-linecap="round"/>
    <rect x="20" y="64" width="88" height="30" rx="15" ${o(fur)}/>
    ${patches}
    <path d="M30 88 C50 96 80 96 100 88" fill="none" stroke="${belly}" stroke-width="5" stroke-linecap="round" opacity=".9"/>
    <path d="M24 92 l-3 6 M108 80 l5 4" stroke="${INK}" stroke-width="2.4" stroke-linecap="round"/>
    ${[30, 42, 88, 100].map((x) => `<rect x="${x - 5}" y="88" width="10" height="16" rx="5" ${o(dark)}/>`).join('')}
    <path d="M18 70 C10 50 18 30 38 30 C54 30 60 42 58 58 C56 70 44 76 32 76" ${o(fur)}/>
    <path d="M10 58 C4 58 2 64 6 68 C12 72 22 70 26 64" ${o(fur)}/>
    <ellipse cx="6" cy="61" rx="4" ry="3.2" fill="${INK}"/>
    <path d="M40 32 C52 28 60 40 58 54 C60 60 56 64 57 68 C53 70 51 66 49 70 C46 68 46 64 43 64 C44 58 42 50 44 44 Z" ${o(ear)}/>
    ${shine(30, 38, 5, 3)}
    <ellipse cx="28" cy="50" rx="4" ry="5" fill="${INK}"/><circle cx="26.6" cy="48" r="1.6" fill="#fff"/>
    <ellipse cx="24" cy="60" rx="4.5" ry="2.6" fill="#f59ab0" opacity=".75"/>
    ${face}${extra}`;
}

function sushiQueen() {
  const skin = '#fde6da', hair = '#3a2230', robe = '#d6334a', trim = '#ffd34d';
  return `${shadow(60, 113, 36)}
    <path d="M30 112 C30 86 40 74 60 74 C80 74 90 86 90 112 Z" ${o(robe)}/>
    <path d="M60 74 L50 112 M60 74 L70 112" stroke="${trim}" stroke-width="4"/>
    <path d="M24 46 C20 74 30 92 40 90 L80 90 C90 92 100 74 96 46 Z" ${o(hair)}/>
    <ellipse cx="60" cy="50" rx="28" ry="26" ${o(skin)}/>
    <path d="M32 46 C36 26 84 26 88 46 C78 38 70 36 60 40 C50 36 42 38 32 46 Z" ${o(hair)}/>
    <path d="M40 24 L44 8 L52 18 L60 4 L68 18 L76 8 L80 24 Z" ${o(trim)}/>
    <circle cx="60" cy="13" r="3" fill="#ff5d6e" stroke="${INK}" stroke-width="2"/>
    ${eyes2(60, 52, 11, 4.2)}${blushes(60, 62, 19)}
    <path d="M54 64 Q60 69 66 64" fill="none" stroke="${INK}" stroke-width="2.8" stroke-linecap="round"/>
    <g transform="translate(78 84) rotate(-12)">
      <rect x="-6" y="0" width="36" height="12" rx="6" ${o('#fff8ee', 3)}/>
      <path d="M-4 0 C4 -10 22 -10 28 0 Z" ${o('#ff8a5c', 3)}/>
      <path d="M4 -4 L8 0 M12 -5 L16 0 M20 -4 L23 0" stroke="#fff" stroke-width="2"/>
    </g>
    <ellipse cx="80" cy="96" rx="7" ry="6" ${o(skin, 3)}/>
    ${shine(74, 34, 6, 3.5)}`;
}

// Colors follow the real dogs: Haru is a black-and-tan shiba, Issei a red
// shiba; Hana a long-haired red wiener dog, Kaiba a long-haired blue merle.

// Mina, the net café's night manager. Runs the Konbini Corner and the flash sales.
function manager() {
  const skin = '#fde6da', hair = '#5a3a2e', shirt = '#fff8ee', apron = '#3fa47a', cap = '#3fa47a';
  return `${shadow(60, 113, 34)}
    <path d="M32 112 C32 88 42 78 60 78 C78 78 88 88 88 112 Z" ${o(shirt)}/>
    <path d="M44 86 H76 L80 112 H40 Z" ${o(apron)}/>
    <rect x="52" y="94" width="16" height="10" rx="3" ${o('#fff', 2.5)}/>
    <path d="M28 52 C24 72 30 86 40 84 L80 84 C90 86 96 72 92 52 Z" ${o(hair)}/>
    <ellipse cx="60" cy="54" rx="27" ry="25" ${o(skin)}/>
    <path d="M33 50 C34 32 50 26 60 26 C72 26 86 32 87 50 C78 42 70 40 62 44 C54 40 42 42 33 50 Z" ${o(hair)}/>
    <path d="M30 36 C36 18 84 18 90 36 Z" ${o(cap)}/>
    <path d="M78 34 C90 34 98 36 100 40 C92 42 84 40 76 38 Z" ${o(cap)}/>
    <path d="M34 52 C26 52 26 66 34 66" fill="none" stroke="${INK}" stroke-width="3.5" stroke-linecap="round"/>
    <path d="M34 62 C40 70 46 72 52 70" fill="none" stroke="${INK}" stroke-width="2.6" stroke-linecap="round"/>
    <circle cx="53" cy="70" r="2.6" fill="${INK}"/>
    ${eyes2(60, 56, 10, 4)}${blushes(60, 66, 18)}
    <path d="M55 67 Q60 71 65 67" fill="none" stroke="${INK}" stroke-width="2.6" stroke-linecap="round"/>
    ${shine(72, 28, 5, 3)}`;
}

function nyx() {
  const hood = '#2a2233', pink = '#ff8fb8', skin = '#fff1f4';
  return `${shadow(60, 113, 34)}
    <path d="M30 70 C14 60 10 44 18 38 C22 50 28 52 34 56 Z M90 70 C106 60 110 44 102 38 C98 50 92 52 86 56 Z" ${o(pink)}/>
    <path d="M86 98 C100 100 104 90 98 84" fill="none" stroke="${INK}" stroke-width="5.5" stroke-linecap="round"/>
    <path d="M86 98 C100 100 104 90 98 84" fill="none" stroke="${hood}" stroke-width="2.5" stroke-linecap="round"/>
    <path d="M98 84 C94 78 102 74 104 80 C106 74 114 78 110 84 L104 90 Z" ${o(pink, 3)}/>
    <path d="M40 110 C38 90 46 80 60 80 C74 80 82 90 80 110 Z" ${o(hood)}/>
    <path d="M50 110 V100 M70 110 V100" stroke="${INK}" stroke-width="${SW}" stroke-linecap="round"/>
    <path d="M26 56 C22 30 40 14 60 14 C80 14 98 30 94 56 C96 74 82 84 60 84 C38 84 24 74 26 56 Z" ${o(hood)}/>
    <path d="M38 20 L32 4 L46 14 Z M82 20 L88 4 L74 14 Z" ${o(hood)}/>
    <ellipse cx="60" cy="56" rx="24" ry="21" ${o(skin)}/>
    <path d="M40 44 C46 36 54 40 60 44 C66 40 74 36 80 44" fill="none" stroke="${hood}" stroke-width="5" stroke-linecap="round"/>
    <path d="M56 26 C56 22 60 20 60 24 C60 20 64 22 64 26 L60 31 Z" fill="${pink}" stroke="${INK}" stroke-width="2"/>
    ${eyes2(60, 56, 10, 4.2)}${blushes(60, 66, 17)}
    <path d="M55 67 Q60 71 65 67" fill="none" stroke="${INK}" stroke-width="2.6" stroke-linecap="round"/>
    <path d="M64 68 L66 72 L68 68" fill="#fff" stroke="${INK}" stroke-width="1.6" stroke-linejoin="round"/>
    ${shine(76, 28, 6, 3.5)}`;
}

const GUARDIAN_ART = {
  manager, // not a guardian: Mina hosts the shop and flash sales
  haru: () => shiba({ fur: '#2b2329', cream: '#f3ead8', points: '#c98a4a',
    // Haru's white chest fur is shaped like a T
    chest: `<path d="M42 89 C50 86 70 86 78 89 C77 94 71 96 65.5 96 C64.5 101 65.5 105 63.5 109 L56.5 109 C54.5 105 55.5 101 54.5 96 C49 96 43 94 42 89 Z" fill="#f3ead8"/>`,
    extra: `<path d="M40 81 Q60 89 80 81" fill="none" stroke="#c8323c" stroke-width="4.5" stroke-linecap="round"/>` }),
  issei: () => shiba({ fur: '#c9672c', cream: '#f8ecd8', scale: 0.86, extra: `<path d="M38 80 L82 80 L60 96 Z" fill="#5fa8e8" stroke="${INK}" stroke-width="3" stroke-linejoin="round"/><circle cx="54" cy="85" r="2" fill="#fff"/><circle cx="66" cy="85" r="2" fill="#fff"/>` }),
  hana: () => wiener({ fur: '#b8622a', dark: '#9c4f20', ear: '#8e451b', belly: '#d58a4c', extra: `<path d="M50 62 C52 72 46 78 40 78" fill="none" stroke="#ff8fb0" stroke-width="5" stroke-linecap="round"/><circle cx="44" cy="80" r="3.2" fill="#ff5d8f" stroke="${INK}" stroke-width="2"/>` }),
  kaiba: () => wiener({ fur: '#e9e7ec', dark: '#e9e7ec', ear: '#4a4552', belly: '#ffffff',
    patches: `<path d="M58 66 C66 62 76 66 74 74 C70 80 60 78 58 72 Z M80 70 C88 66 98 70 96 78 C92 84 84 82 80 78 Z M66 82 C70 80 76 82 74 86 C70 88 66 86 66 82 Z" fill="#4a4552"/><path d="M86 66 C92 64 96 66 98 70" fill="none" stroke="#8a8fa3" stroke-width="4" stroke-linecap="round"/>`,
    face: `<path d="M22 34 C30 30 38 34 40 44 C34 42 26 44 22 40 Z" fill="#4a4552"/><ellipse cx="31" cy="55" rx="3.2" ry="2" fill="#c98a4a"/><path d="M8 64 C14 68 20 68 24 64" fill="none" stroke="#c98a4a" stroke-width="3"/>`,
    extra: `<path d="M50 62 C52 72 46 78 40 78" fill="none" stroke="#b9a27a" stroke-width="5" stroke-linecap="round"/><circle cx="44" cy="80" r="3.2" fill="#ffd34d" stroke="${INK}" stroke-width="2"/>` }),
  sushiQueen,
  nyx,
};

export const managerChibi = () => `<svg viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">${manager()}</svg>`;

export function guardianChibi(art) {
  // the partner guardian is the other playable character, in their date outfit
  if (art === 'jenny') return jennyChibi('date');
  if (art === 'toni') return toniChibi('date');
  return `<svg viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">${(GUARDIAN_ART[art] || GUARDIAN_ART.haru)()}</svg>`;
}
