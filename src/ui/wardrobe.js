// Outfit picker: one row per slot with left/right arrow tiles.
import { OUTFIT_SLOTS } from '../character.js';

const SLOT_NAMES = { hat: 'Head', top: 'Top', bottom: 'Bottom', shoes: 'Shoes', bag: 'Bag' };
const KEY = 'jw.outfit';

export function loadOutfit() {
  try { return JSON.parse(localStorage.getItem(KEY)) || {}; } catch { return {}; }
}

export class Wardrobe {
  constructor(root, character, { onClose }) {
    this.root = root;
    this.character = character;
    root.innerHTML = `
      <div class="wd-panel" role="dialog" aria-label="Outfit picker">
        <h2 class="wd-title">Mochi Moon <small>fitting room</small></h2>
        <div class="wd-rows"></div>
        <button class="tile-btn wide yellow" data-done>Done</button>
      </div>`;
    const rows = root.querySelector('.wd-rows');
    this.labels = {};
    for (const slot of Object.keys(OUTFIT_SLOTS)) {
      const row = document.createElement('div');
      row.className = 'wd-row';
      row.innerHTML = `
        <button class="tile-btn arrow" data-dir="-1" aria-label="Previous ${SLOT_NAMES[slot]}">◀</button>
        <div class="wd-label"><small>${SLOT_NAMES[slot]}</small><b></b></div>
        <button class="tile-btn arrow" data-dir="1" aria-label="Next ${SLOT_NAMES[slot]}">▶</button>`;
      row.querySelectorAll('[data-dir]').forEach((b) => b.addEventListener('click', () => this.cycle(slot, Number(b.dataset.dir))));
      this.labels[slot] = row.querySelector('b');
      rows.appendChild(row);
    }
    root.querySelector('[data-done]').addEventListener('click', () => onClose());
    this.refresh();
  }

  cycle(slot, dir) {
    const opts = OUTFIT_SLOTS[slot];
    const i = opts.findIndex((o) => o.id === this.character.outfit[slot]);
    const next = opts[(i + dir + opts.length) % opts.length];
    this.character.setOutfit({ [slot]: next.id });
    localStorage.setItem(KEY, JSON.stringify(this.character.outfit));
    this.refresh();
  }

  refresh() {
    for (const slot of Object.keys(OUTFIT_SLOTS)) {
      const o = OUTFIT_SLOTS[slot].find((x) => x.id === this.character.outfit[slot]);
      this.labels[slot].textContent = o ? o.label : '';
    }
  }

  open() { this.root.hidden = false; this.root.querySelector('[data-dir]').focus(); }
  close() { this.root.hidden = true; }
}
