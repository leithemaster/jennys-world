// Run state: deck, HP, coins, charms, map position. Saved to localStorage
// whenever you're on the map, so a run can be continued later.
import { STARTER_DECK, CARDS } from './cards.js';
import { CHARMS } from './charms.js';
import { cardReward, drawCard, drawCharm, drawEnemy } from './loot.js';

const SAVE_KEY = 'sm.run.v3';
const STATS_KEY = 'sm.stats.v2';
export const ROWS = 9; // rows of rooms before the boss
const COLS = 5;

const shuffle = (a) => { a = [...a]; for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };

export function newRun() {
  const run = {
    hp: 55, maxHp: 55, coins: 99,
    deck: STARTER_DECK.map((id) => ({ id })),
    charms: ['moonPin'],
    act: 0,
    map: null,
    pos: null, // { row, col } of the last room cleared
    path: [],
    removeCost: 75,
    floorsCleared: 0,
    kills: 0,
    loot: { decks: {}, rarePity: -5 },
  };
  run.map = generateMap(0);
  return run;
}

// ---------- map ----------
// Fixed rows: 0 = fights, 4 = treasure, 8 = rest (right before the boss).
// Other rows draw room types from a shuffled "room deck" sized to the map,
// then the map is repaired so EVERY path has:
//   • a rest booth somewhere in rows 3–6 (so 2 rests per floor at minimum)
//   • a shop somewhere in rows 2–7
//   • at most 2 elites
const FIXED = { 0: 'fight', 4: 'treasure', 8: 'rest' };
const MIX = { fight: 0.46, event: 0.28, elite: 0.12, shop: 0.06, rest: 0.08 };
const ALLOWED = {
  fight: () => true,
  event: () => true,
  elite: (r) => r >= 2,
  shop: (r) => r >= 2,
  rest: (r) => r >= 3 && r <= 6,
};

export function generateMap(act) {
  const rows = [];
  for (let r = 0; r < ROWS; r++) {
    const count = r === 0 ? 3 : 2 + Math.floor(Math.random() * 3); // 2–4 rooms
    const cols = shuffle([...Array(COLS).keys()]).slice(0, count).sort((a, b) => a - b);
    rows.push(cols.map((col) => ({ row: r, col, type: FIXED[r] || null, next: [] })));
  }
  // links: each room connects to the nearest 1–2 rooms above; every room gets a parent
  for (let r = 0; r < ROWS - 1; r++) {
    const cur = rows[r], nxt = rows[r + 1];
    for (const n of cur) {
      const sorted = [...nxt].sort((a, b) => Math.abs(a.col - n.col) - Math.abs(b.col - n.col));
      n.next.push(sorted[0].col);
      if (sorted[1] && Math.abs(sorted[1].col - n.col) <= 1 && Math.random() < 0.55) n.next.push(sorted[1].col);
    }
    for (const m of nxt) {
      if (!cur.some((n) => n.next.includes(m.col))) {
        const nearest = [...cur].sort((a, b) => Math.abs(a.col - m.col) - Math.abs(b.col - m.col))[0];
        nearest.next.push(m.col);
      }
    }
  }
  rows.forEach((row) => row.forEach((n) => (n.next = [...new Set(n.next)].sort((a, b) => a - b))));

  // room deck for the free rows
  const free = rows.flat().filter((n) => !n.type);
  const deck = [];
  for (const [type, share] of Object.entries(MIX)) for (let i = 0; i < Math.round(free.length * share); i++) deck.push(type);
  while (deck.length < free.length) deck.push('fight');
  let pile = shuffle(deck);
  for (const n of free.sort((a, b) => a.row - b.row)) {
    const idx = pile.findIndex((t) => ALLOWED[t](n.row));
    n.type = idx >= 0 ? pile.splice(idx, 1)[0] : 'fight';
  }
  // no back-to-back rests or elites on a link
  for (const n of rows.flat()) {
    for (const c of n.next) {
      const m = rows[n.row + 1]?.find((x) => x.col === c);
      if (m && !FIXED[m.row] && m.type === n.type && (m.type === 'rest' || m.type === 'elite' || m.type === 'shop')) m.type = 'event';
    }
  }
  repair(rows);
  return { act, rows };
}

function allPaths(rows) {
  const out = [];
  const walk = (node, acc) => {
    const path = [...acc, node];
    if (node.row === ROWS - 1) { out.push(path); return; }
    for (const c of node.next) walk(rows[node.row + 1].find((x) => x.col === c), path);
  };
  rows[0].forEach((n) => walk(n, []));
  return out;
}

function repair(rows) {
  const need = [
    { type: 'rest', rows: [5, 3, 6], ok: (p) => p.some((n) => n.type === 'rest' && n.row >= 3 && n.row <= 6) },
    { type: 'shop', rows: [6, 3, 5, 7, 2], ok: (p) => p.some((n) => n.type === 'shop' && n.row >= 2 && n.row <= 7) },
  ];
  // Greedy fix: convert the single room that sits on the MOST failing paths,
  // repeat until every path passes. This changes as few rooms as possible.
  for (const rule of need) {
    for (let guard = 0; guard < 30; guard++) {
      const failing = allPaths(rows).filter((p) => !rule.ok(p));
      if (!failing.length) break;
      const score = new Map();
      for (const p of failing) {
        for (const n of p) {
          if (!rule.rows.includes(n.row) || FIXED[n.row]) continue;
          if (n.type === 'rest' || n.type === 'shop') continue;
          const pref = n.type === 'fight' || n.type === 'event' ? 1 : 0.5; // keep elites if we can
          score.set(n, (score.get(n) || 0) + pref);
        }
      }
      const best = [...score.entries()].sort((a, b) => b[1] - a[1])[0];
      if (!best) break;
      best[0].type = rule.type;
    }
  }
  // cap elites at 2 per path
  for (const p of allPaths(rows)) {
    const elites = p.filter((n) => n.type === 'elite');
    if (elites.length > 2) elites.slice(2).forEach((n) => (n.type = 'fight'));
  }
}

export function mapGuarantees(map) {
  const paths = allPaths(map.rows);
  const count = (p, t) => p.filter((n) => n.type === t).length;
  return {
    paths: paths.length,
    minRests: Math.min(...paths.map((p) => count(p, 'rest'))),
    minShops: Math.min(...paths.map((p) => count(p, 'shop'))),
    maxElites: Math.max(...paths.map((p) => count(p, 'elite'))),
  };
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

export const enemyFor = (run, type) => drawEnemy(run, type);

// ---------- rewards ----------
export const cardChoices = (run, kind) => cardReward(run, kind);
export const randomCharm = (run, pool = 'drop') => drawCharm(run, pool);

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

export function removeCost(run) {
  return run.charms.includes('stampCard') ? 50 : run.removeCost;
}

// Shop shelves: 5 cards from the card decks, 2 shop-only charms + 1 regular charm.
export function shopStock(run) {
  const off = run.charms.includes('memberCard') ? 0.8 : 1;
  const price = (n) => Math.round(n * off);
  const cards = [];
  for (const rar of ['common', 'common', 'uncommon', 'uncommon', 'rare']) {
    const id = drawCard(run, rar, cards.map((c) => c.id));
    if (id) cards.push({ id, price: price({ common: 50, uncommon: 75, rare: 145 }[rar] + Math.floor(Math.random() * 15) - 5) });
  }
  const charms = [];
  for (const pool of ['shop', 'shop', 'drop']) {
    const id = drawCharm(run, pool, charms.map((c) => c.id));
    if (id) charms.push({ id, price: price((pool === 'shop' ? 150 : 175) + Math.floor(Math.random() * 20)), shopOnly: pool === 'shop' });
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

export const TOTAL_FLOORS = (ROWS + 1) * 3;
