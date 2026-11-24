// Run state: deck, HP, coins, charms, map position. Saved to localStorage
// whenever you're on the map, so a run can be continued later.
import { STARTER_DECK, CARDS, pool } from './cards.js';
import { CHARMS, charmPool } from './charms.js';
import { ACTS } from './enemies.js';

const SAVE_KEY = 'sm.run.v2';
const STATS_KEY = 'sm.stats.v2';
const ROWS = 9; // rows of rooms before the boss
const COLS = 5;

const pick = (a) => a[Math.floor(Math.random() * a.length)];

export function newRun() {
  const run = {
    hp: 55, maxHp: 55, coins: 99,
    deck: STARTER_DECK.map((id) => ({ id })),
    charms: ['moonPin'],
    act: 0,
    map: null,
    pos: null, // { row, col } of the last room cleared
    removeCost: 75,
    floorsCleared: 0,
    kills: 0,
    seen: [],
  };
  run.map = generateMap(0);
  return run;
}

// A small branching map: rows of rooms, each linked to 1–2 rooms above it.
export function generateMap(act) {
  const rows = [];
  for (let r = 0; r < ROWS; r++) {
    const count = r === 0 ? 3 : 2 + Math.floor(Math.random() * 3); // 2–4
    const cols = [...Array(COLS).keys()].sort(() => Math.random() - 0.5).slice(0, count).sort((a, b) => a - b);
    rows.push(cols.map((col) => ({ row: r, col, type: roomType(r), next: [] })));
  }
  // connect each room to the nearest rooms in the next row; make sure every room has a parent
  for (let r = 0; r < ROWS - 1; r++) {
    const cur = rows[r], nxt = rows[r + 1];
    for (const n of cur) {
      const sorted = [...nxt].sort((a, b) => Math.abs(a.col - n.col) - Math.abs(b.col - n.col));
      n.next.push(sorted[0].col);
      if (sorted[1] && Math.abs(sorted[1].col - n.col) <= 1 && Math.random() < 0.5) n.next.push(sorted[1].col);
    }
    for (const m of nxt) {
      if (!cur.some((n) => n.next.includes(m.col))) {
        const nearest = [...cur].sort((a, b) => Math.abs(a.col - m.col) - Math.abs(b.col - m.col))[0];
        nearest.next.push(m.col);
      }
    }
  }
  rows.forEach((row) => row.forEach((n) => (n.next = [...new Set(n.next)].sort((a, b) => a - b))));
  return { act, rows, boss: ACTS[act].boss };
}

function roomType(r) {
  if (r === 0) return 'fight';
  if (r === ROWS - 1) return 'rest';
  if (r === 4) return 'treasure';
  const roll = Math.random();
  if (r >= 2 && roll < 0.14) return 'elite';
  if (r >= 2 && roll < 0.26) return 'shop';
  if (r >= 3 && roll < 0.36) return 'rest';
  if (roll < 0.6) return 'event';
  return 'fight';
}

export function availableRooms(run) {
  const rows = run.map.rows;
  if (!run.pos) return rows[0].map((n) => ({ row: 0, col: n.col }));
  if (run.pos.row === 'boss') return [];
  if (run.pos.row === rows.length - 1) return [{ row: 'boss' }];
  const cur = rows[run.pos.row].find((n) => n.col === run.pos.col);
  return cur.next.map((col) => ({ row: run.pos.row + 1, col }));
}

export function roomAt(run, row, col) {
  if (row === 'boss') return { type: 'boss', row };
  return run.map.rows[row].find((n) => n.col === col);
}

export function enemyFor(run, type) {
  const act = ACTS[run.act];
  if (type === 'boss') return act.boss;
  const list = type === 'elite' ? act.elites : act.normals;
  // early fights in act 1 use the gentler enemies
  const options = list.filter((id) => !run.seen.slice(-2).includes(id));
  const chosen = pick(options.length ? options : list);
  run.seen.push(chosen);
  return chosen;
}

// ---------- rewards ----------
export function rollCardRarity(kind) {
  const r = Math.random();
  if (kind === 'boss') return 'rare';
  if (kind === 'elite') return r < 0.12 ? 'rare' : r < 0.55 ? 'uncommon' : 'common';
  return r < 0.05 ? 'rare' : r < 0.38 ? 'uncommon' : 'common';
}

export function cardChoices(kind, n = 3) {
  const out = [];
  let guard = 0;
  while (out.length < n && guard++ < 50) {
    const id = pick(pool(rollCardRarity(kind)));
    if (!out.includes(id)) out.push(id);
  }
  return out.map((id) => ({ id }));
}

export function randomCharm(run, rarity) {
  const r = rarity || (Math.random() < 0.65 ? 'common' : 'uncommon');
  let options = charmPool(r).filter((k) => !run.charms.includes(k));
  if (!options.length) options = [...charmPool('common'), ...charmPool('uncommon')].filter((k) => !run.charms.includes(k));
  return options.length ? pick(options) : null;
}

export function gainCharm(run, id) {
  if (!id || run.charms.includes(id)) return;
  run.charms.push(id);
  if (id === 'kimbap') { run.maxHp += 10; run.hp += 10; }
  if (id === 'plush') { run.maxHp += 8; run.hp += 8; }
}

export function gainCoins(run, n) {
  const amt = Math.round(n * (run.charms.includes('purse') ? 1.5 : 1));
  run.coins += amt;
  return amt;
}

export function afterFightHealing(run) {
  let h = 0;
  if (run.charms.includes('bandage')) h += 5;
  if (run.charms.includes('plush')) h += 12;
  const before = run.hp;
  run.hp = Math.min(run.maxHp, run.hp + h);
  return run.hp - before;
}

export function shopStock(run) {
  const cards = [];
  for (const rar of ['common', 'common', 'uncommon', 'uncommon', 'rare']) {
    let id; let g = 0;
    do { id = pick(pool(rar)); } while (cards.some((c) => c.id === id) && g++ < 20);
    const base = { common: 50, uncommon: 75, rare: 145 }[rar];
    cards.push({ id, price: base + Math.floor(Math.random() * 15) - 5 });
  }
  const charms = [];
  for (const rar of ['common', 'common', 'uncommon']) {
    const id = randomCharm({ charms: [...run.charms, ...charms.map((c) => c.id)] }, rar);
    if (id) charms.push({ id, price: (rar === 'common' ? 140 : 190) + Math.floor(Math.random() * 20) });
  }
  return { cards, charms, removed: false };
}

// ---------- save / stats ----------
export function saveRun(run) { localStorage.setItem(SAVE_KEY, JSON.stringify(run)); }
export function loadRun() {
  try {
    const r = JSON.parse(localStorage.getItem(SAVE_KEY));
    if (r && r.deck && r.deck.every((c) => CARDS[c.id]) && r.charms.every((k) => CHARMS[k])) return r;
  } catch { /* ignore */ }
  return null;
}
export function clearRun() { localStorage.removeItem(SAVE_KEY); }

export function loadStats() {
  try { return { runs: 0, wins: 0, bestFloor: 0, kills: 0, ...JSON.parse(localStorage.getItem(STATS_KEY)) }; } catch { return { runs: 0, wins: 0, bestFloor: 0, kills: 0 }; }
}
export function recordRun(run, won) {
  const s = loadStats();
  s.runs += 1;
  if (won) s.wins += 1;
  s.bestFloor = Math.max(s.bestFloor, run.floorsCleared);
  s.kills += run.kills;
  localStorage.setItem(STATS_KEY, JSON.stringify(s));
  return s;
}

export const TOTAL_FLOORS = (ROWS + 1) * ACTS.length;
