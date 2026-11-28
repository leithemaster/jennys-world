// Card back art. Each back is a face colour, a lip (the darker bottom edge), a
// background pattern and a small 32x32 emblem in the middle. The list of backs
// and how they unlock is in src/game/outfits.js (CARD_BACKS, same ids).
const K = '#2a1626';
const st = `stroke="${K}" stroke-width="2.2" stroke-linejoin="round" stroke-linecap="round"`;

const dots = (c, size = 14, r = 2) => `radial-gradient(circle, ${c} ${r}px, transparent ${r + 0.5}px) 0 0 / ${size}px ${size}px`;

export const BACK_ART = {
  classic: {
    bg: 'var(--pink)', lip: 'var(--pink-lip)', dash: 'rgba(255, 246, 236, .6)', pattern: 'none',
    emblem: `<path d="M16 3 L19.5 12 L29 12.5 L21.5 18.5 L24 28 L16 22.5 L8 28 L10.5 18.5 L3 12.5 L12.5 12 Z" fill="#ffd23f" ${st}/>`,
  },
  moon: {
    bg: '#2f3a7a', lip: '#1d2554', dash: 'rgba(255, 236, 170, .45)',
    pattern: `${dots('rgba(255, 240, 190, .55)', 16, 1.2)}, ${dots('rgba(255, 240, 190, .3)', 23, 1)}`,
    emblem: `<path d="M20 4 A12 12 0 1 0 28 22 A10 10 0 0 1 20 4 Z" fill="#ffe28a" ${st}/><path d="M24 7 l1 2 2 1 -2 1 -1 2 -1 -2 -2 -1 2 -1 Z" fill="#fff" stroke="${K}" stroke-width="1.2"/>`,
  },
  paws: {
    bg: '#e8964a', lip: '#b96a2a', dash: 'rgba(255, 246, 236, .55)',
    pattern: `${dots('rgba(255, 238, 214, .35)', 18, 3)}`,
    emblem: `<ellipse cx="16" cy="21" rx="7" ry="6" fill="#fff4e6" ${st}/><circle cx="8" cy="13" r="3" fill="#fff4e6" ${st}/><circle cx="13" cy="8.5" r="3" fill="#fff4e6" ${st}/><circle cx="19" cy="8.5" r="3" fill="#fff4e6" ${st}/><circle cx="24" cy="13" r="3" fill="#fff4e6" ${st}/>`,
  },
  sakura: {
    bg: '#ffc2d6', lip: '#e88aa8', dash: 'rgba(255, 255, 255, .7)',
    pattern: `${dots('rgba(255, 255, 255, .6)', 15, 2.2)}`,
    emblem: [0, 72, 144, 216, 288].map((a) => `<path transform="rotate(${a} 16 16)" d="M16 16 C11 12 11 5 14.5 3.5 L16 6 L17.5 3.5 C21 5 21 12 16 16 Z" fill="#fff0f5" ${st}/>`).join('') + `<circle cx="16" cy="16" r="3" fill="#ffd23f" stroke="${K}" stroke-width="1.6"/>`,
  },
  pixel: {
    bg: '#5fd3b0', lip: '#2f9c80', dash: 'rgba(255, 255, 255, .55)',
    pattern: 'repeating-conic-gradient(rgba(255, 255, 255, .16) 0 25%, transparent 0 50%) 0 0 / 14px 14px',
    emblem: `<path d="M6 8 h6 v2 h2 v2 h4 v-2 h2 v-2 h6 v2 h2 v8 h-2 v2 h-2 v2 h-2 v2 h-2 v2 h-2 v2 h-4 v-2 h-2 v-2 h-2 v-2 h-2 v-2 h-2 v-2 h-2 v-8 h2 Z" fill="#ff5d8f" stroke="${K}" stroke-width="2" stroke-linejoin="miter"/><rect x="8" y="11" width="3" height="3" fill="#fff"/>`,
  },
  boba: {
    bg: '#b79be0', lip: '#8a6cc0', dash: 'rgba(255, 246, 236, .6)',
    pattern: `${dots('rgba(58, 30, 48, .22)', 13, 2.6)}`,
    emblem: `<path d="M19 2 L16.5 11" ${st} fill="none" stroke-width="2.6"/><path d="M8 11 H24 L22 28 C22 29 21 30 20 30 H12 C11 30 10 29 10 28 Z" fill="#f2d9b8" ${st}/><path d="M7 9 H25 V12 H7 Z" fill="#fff4e6" ${st}/><circle cx="13" cy="25" r="1.8" fill="${K}"/><circle cx="17" cy="26" r="1.8" fill="${K}"/><circle cx="19.5" cy="23" r="1.8" fill="${K}"/><circle cx="14.5" cy="21.5" r="1.8" fill="${K}"/>`,
  },
  gold: {
    bg: '#f2b705', lip: '#b98500', dash: 'rgba(255, 250, 220, .75)',
    pattern: 'repeating-conic-gradient(from 0deg at 50% 50%, rgba(255, 243, 176, .5) 0 9deg, transparent 9deg 18deg)',
    emblem: `<path d="M5 24 L4 10 L10 15 L16 6 L22 15 L28 10 L27 24 Z" fill="#fff3b0" ${st}/><path d="M5 24 H27 V28 H5 Z" fill="#ffd23f" ${st}/><circle cx="16" cy="19" r="2.2" fill="#ff5d8f" stroke="${K}" stroke-width="1.5"/>`,
  },
  snow: {
    bg: '#8fd0f2', lip: '#4f9cc8', dash: 'rgba(255, 255, 255, .7)',
    pattern: `${dots('rgba(255, 255, 255, .7)', 17, 1.8)}, ${dots('rgba(255, 255, 255, .45)', 11, 1.1)}`,
    emblem: [0, 60, 120].map((a) => `<g transform="rotate(${a} 16 16)"><path d="M16 3 V29 M12 6 L16 9 L20 6 M12 26 L16 23 L20 26" fill="none" stroke="${K}" stroke-width="4.4" stroke-linecap="round" stroke-linejoin="round"/><path d="M16 3 V29 M12 6 L16 9 L20 6 M12 26 L16 23 L20 26" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></g>`).join(''),
  },
};

// Inline style for a .back element, so the same back works on the board and in the picker.
export function backStyle(id) {
  const b = BACK_ART[id] || BACK_ART.classic;
  return `--cb-bg: ${b.bg}; --cb-lip: ${b.lip}; --cb-dash: ${b.dash}; --cb-pat: ${b.pattern};`;
}

export const backEmblem = (id) => `<svg class="cb-emblem" viewBox="0 0 32 32" aria-hidden="true">${(BACK_ART[id] || BACK_ART.classic).emblem}</svg>`;
