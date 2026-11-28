import { ACTS } from './enemies.js';
// Run state: deck, HP, coins, charms, map position. Saved whenever you're on
// the map, so a run can be continued later.
import { CARDS } from './cards.js';
import { CHARACTERS } from './characters.js';
import { CHARMS } from './charms.js';
import { cardReward, drawCard, drawCharm, drawEnemy, deckStyle, drawStyleCard, drawSnack } from './loot.js';
import { climbOn, CLIMB_RULES as CR, CLIMB_MAX } from './climb.js';
import { guardiansMet } from './guardians.js';
import { SNACKS, SNACK_SLOTS, SNACK_PRICE, addSnackSlots, addSnack, snackRoom } from './snacks.js';

import { readDoc, writeDoc, removeDoc, readLegacy } from '../platform/storage.js';

const RUN_DOC = 'run';
const RUN_VERSION = 1;
const LEGACY_RUN_KEY = 'sm.run.v3';
export const ROWS = 9; // rows of rooms before the boss
const COLS = 5;

const shuffle = (a) => { a = [...a]; for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };

export function newRun(character = 'jenny', climb = 0) {
  const ch = CHARACTERS[character] || CHARACTERS.jenny;
  const run = {
    climb: Math.max(0, Math.min(CLIMB_MAX, climb | 0)), // climb level (see climb.js)
    character: CHARACTERS[character] ? character : 'jenny',
    hp: ch.maxHp, maxHp: ch.maxHp, coins: 99,
    deck: ch.deck.map((id) => ({ id })),
    charms: [],
    snacks: Array(SNACK_SLOTS).fill(null), // the snack bar (see snacks.js)
    giftPending: true,
    act: 0,
    map: null,
    pos: null, // { row, col } of the last room cleared
    path: [],
    removeCost: 75,
    floorsCleared: 0,
    kills: 0,
    plays: {}, // card id -> times played this run (for the run-end story)
    bestHit: 0, // biggest single hit on an enemy
    loot: { decks: {}, rarePity: -5 },
  };
  if (climbOn(run, 8)) run.hp = run.maxHp = Math.round(run.maxHp * CR.maxHp);
  if (climbOn(run, 9)) run.deck.push({ id: CR.curse });
  run.map = generateMap(0, run.climb);
  return run;
}

// ---------- map ----------
// Fixed rows: 0 = fights, 4 = treasure, 8 = rest (right before the boss).
// The map starts with 3 rooms in the middle lanes and fans out to all 5.
// Other rows draw room types from a shuffled "room deck" sized to the map,
// then the map is repaired so EVERY path has:
//   • a rest booth somewhere in rows 3–6 (so 2 rests per floor at minimum)
//   • no more than 2 shops (a path can have none)
//   • no more elites than the climb level allows (see ELITES)
const FIXED = { 0: 'fight', 4: 'treasure', 8: 'rest' };
const START_LANES = [1, 2, 3];
const MIX = { fight: 0.40, event: 0.23, elite: 0.12, shop: 0.17, rest: 0.08 };
// Elites by climb level: their share of the room deck, whether two can sit
// back to back, and the most one path may hold (Infinity = no cap).
// Level 10 is the full-on version; low levels keep elites rare.
export function eliteRules(climb = 0) {
  const c = Math.max(0, Math.min(10, climb | 0));
  return {
    share: 0.10 + 0.008 * c, // 10% at level 0 → 18% at level 10
    stack: c >= 5,
    cap: c <= 2 ? 2 : c <= 6 ? 3 : Infinity,
  };
}
const ALLOWED = {
  fight: () => true,
  event: () => true,
  elite: (r) => r >= 2,
  shop: (r) => r >= 2,
  rest: (r) => r >= 3 && r <= 6,
};

// Floor 4: two separate lanes (4 rooms each) that merge at a rest, then three boss rooms
// (a Floor 1, 2 and 3 boss you didn't fight this run, each scaled up), then the Net Café.
// GAUNTLET: HP each rematch is set to (climbing toward the Net Café's 330) and the
// Fighting Spirit it starts with, so older bosses still hit hard enough up here.
export const GAUNTLET = [{ floor: 0, hp: 240, spirit: 4 }, { floor: 1, hp: 270, spirit: 3 }, { floor: 2, hp: 300, spirit: 2 }];
export function generateFinalMap(act, run) {
  const used = Object.values(run?.bossOf || {});
  const pick = (floor) => { const list = ACTS[floor].bosses.filter((b) => !used.includes(b)); const pool = list.length ? list : ACTS[floor].bosses; return pool[Math.floor(Math.random() * pool.length)]; };
  const laneA = ['fight', ...shuffle(['event', 'elite', 'shop'])];
  const laneB = ['fight', ...shuffle(['event', 'elite', 'treasure'])];
  const rows = [];
  for (let r = 0; r < 4; r++) rows.push([{ row: r, col: 1, type: laneA[r], next: [r < 3 ? 1 : 2] }, { row: r, col: 3, type: laneB[r], next: [r < 3 ? 3 : 2] }]);
  rows.push([{ row: 4, col: 2, type: 'rest', next: [2] }]);
  GAUNTLET.forEach((g, i) => rows.push([{ row: 5 + i, col: 2, type: 'boss', enemy: pick(g.floor), hp: g.hp, spirit: g.spirit, next: [2] }]));
  return { act, rows, final: true };
}

export function generateMap(act, climb = 0, run = null) {
  if (ACTS[act]?.final) return generateFinalMap(act, run);
  const er = eliteRules(climb);
  const mix = { ...MIX, elite: er.share, fight: MIX.fight - (er.share - MIX.elite) };
  const rows = [];
  for (let r = 0; r < ROWS; r++) {
    // 3 starting rooms in the middle, then 3–5 rooms per column so paths fan out and keep branching
    const count = 3 + Math.floor(Math.random() * 3);
    const cols = r === 0 ? START_LANES : shuffle([...Array(COLS).keys()]).slice(0, count).sort((a, b) => a - b);
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
  for (const [type, share] of Object.entries(mix)) for (let i = 0; i < Math.round(free.length * share); i++) deck.push(type);
  while (deck.length < free.length) deck.push('fight');
  let pile = shuffle(deck);
  for (const n of free.sort((a, b) => a.row - b.row)) {
    const idx = pile.findIndex((t) => ALLOWED[t](n.row));
    n.type = idx >= 0 ? pile.splice(idx, 1)[0] : 'fight';
  }
  // no back-to-back rests or shops on a link; elites only stack at higher climb levels
  for (const n of rows.flat()) {
    for (const c of n.next) {
      const m = rows[n.row + 1]?.find((x) => x.col === c);
      if (m && !FIXED[m.row] && m.type === n.type && (m.type === 'rest' || m.type === 'shop' || (m.type === 'elite' && !er.stack))) m.type = 'event';
    }
  }
  repair(rows, er);
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

function repair(rows, er) {
  const need = [
    { type: 'rest', rows: [5, 3, 6], ok: (p) => p.some((n) => n.type === 'rest' && n.row >= 3 && n.row <= 6) },
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
  // caps per path: shops (2) and elites (by climb level). Extra shops become
  // events, extra elites become fights; the room on the most over-cap paths goes first.
  const caps = [['shop', 2, 'event'], ['elite', er.cap, 'fight']];
  for (const [type, cap, into] of caps) {
    if (cap === Infinity) continue;
    for (let guard = 0; guard < 40; guard++) {
      const over = allPaths(rows).filter((p) => p.filter((n) => n.type === type).length > cap);
      if (!over.length) break;
      const score = new Map();
      for (const p of over) for (const n of p) if (n.type === type) score.set(n, (score.get(n) || 0) + 1);
      [...score.entries()].sort((a, b) => b[1] - a[1])[0][0].type = into;
    }
  }
}

export function mapGuarantees(map) {
  const paths = allPaths(map.rows);
  const count = (p, t) => p.filter((n) => n.type === t).length;
  return {
    paths: paths.length,
    minRests: Math.min(...paths.map((p) => count(p, 'rest'))),
    minShops: Math.min(...paths.map((p) => count(p, 'shop'))),
    maxShops: Math.max(...paths.map((p) => count(p, 'shop'))),
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
export const cardChoices = (run, kind) => cardReward(run, kind, run.charms.includes('luckyDice') ? 4 : 3);
export const randomCharm = (run, pool = 'drop') => drawCharm(run, pool);

export function gainCharm(run, id) {
  if (!id || run.charms.includes(id)) return;
  run.charms.push(id);
  if (id === 'kimbap') { run.maxHp += 10; run.hp += 10; }
  if (id === 'plush') { run.maxHp += 8; run.hp += 8; }
  if (id === 'scarf') { run.maxHp += 12; run.hp += 12; }
  if (id === 'luckyCoin') run.coins += 100;
  if (id === 'chewToy') run.coins += 75;
  if (id === 'hisHoodie') { run.maxHp += 15; run.hp += 15; }
  if (id === 'cuddlePlush') { run.maxHp += 12; run.hp += 12; }
  if (id === 'packedLunch') { addSnackSlots(run, 1); while (snackRoom(run)) { const k = drawSnack(run); if (!k || !addSnack(run, k)) break; } }
  if (id === 'doodleOfYou') {
    const ups = run.deck.filter((c) => !c.up && !['status', 'curse'].includes(CARDS[c.id].rarity));
    for (let i = 0; i < 3 && ups.length; i++) ups.splice(Math.floor(Math.random() * ups.length), 1)[0].up = true;
  }
  if (id === 'greenTea') { run.maxHp += 10; run.hp += 10; }
  if (id === 'comfySlippers') { run.maxHp += 6; run.hp += 6; }
  if (id === 'treatPouch') { addSnackSlots(run, 1); addSnack(run, drawSnack(run)); }
  for (const card of CHARMS[id]?.gives || []) run.deck.push({ id: card });
  if (id === 'lunchbox') addSnackSlots(run, 2);
  if (id === 'hamsterCheeks') addSnackSlots(run, 1);
  if (id === 'glitchPen') run.deck.push({ id: 'stinger' }, { id: 'stinger' });
  if (id === 'puffyJacket') run.deck.push({ id: 'hoodieUp' });
  if (id === 'rhythmBracelet') run.deck.push({ id: 'comboKick' });
  if (id === 'sleepMask') run.deck.push({ id: 'lightsOut' });
  if (id === 'hotWaterBottle') run.deck.push({ id: 'groupHug' });
  if (id === 'gossipPhone') run.deck.push({ id: 'callOut' });
  if (id === 'sketchbook') {
    const ups = run.deck.filter((c) => !c.up && CARDS[c.id].rarity !== 'status' && CARDS[c.id].rarity !== 'curse');
    for (let i = 0; i < 2 && ups.length; i++) ups.splice(Math.floor(Math.random() * ups.length), 1)[0].up = true;
  }
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
  if (run.charms.includes('thermos')) h += 7;
  if (run.charms.includes('hotWaterBottle')) h += 4;
  if (run.charms.includes('warmLap')) h += 6;
  if (run.charms.includes('cuddlePlush')) h += 10;
  if (run.charms.includes('greenTea')) h += 15;
  if (run.charms.includes('comfySlippers')) h += 3;
  if (run.charms.includes('fortuneCookie')) h += 3;
  const before = run.hp;
  run.hp = Math.min(run.maxHp, run.hp + h);
  return run.hp - before;
}

export function removeCost(run) {
  return run.charms.includes('stampCard') ? 50 : run.removeCost;
}

// Shop shelves: 5 cards from the card decks, 2 shop-only charms + 1 regular charm.
// Card sales: each card on the shelf (rares too) has a small chance to be
// marked down. Charms and snacks never go on sale. Chances are in %.
export const CARD_SALE = { 25: 6, 50: 2 };
function rollSale() {
  const r = Math.random() * 100;
  return r < CARD_SALE[50] ? 50 : r < CARD_SALE[50] + CARD_SALE[25] ? 25 : 0;
}

const shopOff = (run) => (run.charms.includes('memberCard') ? 0.8 : 1) * (run.charms.includes('chewToy') ? 0.9 : 1) * (climbOn(run, 4) ? CR.shopPrice : 1);

// Restocking the card shelf: 25 coins, then 15 more each time in the same shop.
export const RESTOCK = { base: 25, step: 15 };
export const restockCost = (n) => RESTOCK.base + RESTOCK.step * n;

// The 5 cards on the shelf (2 lean into your deck's style once you have one).
export function shopCards(run) {
  const price = (n) => Math.round(n * shopOff(run));
  const cards = [];
  const style = deckStyle(run);
  for (const [i, rar] of ['common', 'common', 'uncommon', 'uncommon', 'rare'].entries()) {
    const ex = cards.map((c) => c.id);
    const id = (style && (i === 1 || i === 3) && drawStyleCard(run, style.arch, rar, ex)) || drawCard(run, rar, ex);
    if (!id) continue;
    const full = price({ common: 50, uncommon: 75, rare: 145 }[rar] + Math.floor(Math.random() * 15) - 5);
    const sale = rollSale();
    cards.push(sale ? { id, price: Math.round(full * (1 - sale / 100)), was: full, sale } : { id, price: full });
  }
  return cards;
}

export function shopStock(run) {
  const price = (n) => Math.round(n * shopOff(run));
  const cards = shopCards(run);
  const charms = [];
  for (const pool of ['shop', 'shop', 'drop']) {
    const id = drawCharm(run, pool, charms.map((c) => c.id));
    if (id) charms.push({ id, price: price((pool === 'shop' ? 150 : 175) + Math.floor(Math.random() * 20)), shopOnly: pool === 'shop' });
  }
  const snacks = [];
  for (const rar of ['common', 'uncommon', null]) {
    for (let tries = 0; tries < 6; tries++) {
      const id = drawSnack(run, rar || undefined);
      if (id && !snacks.some((x) => x.id === id)) { snacks.push({ id, price: price(SNACK_PRICE[SNACKS[id].rarity] + Math.floor(Math.random() * 10) - 5) }); break; }
    }
  }
  return { cards, charms, snacks, removed: false };
}

// ---------- save ----------
// The run in progress is its own save document, separate from progress
// (see progress.js). Same JSON rules: plain data, stable string ids.
export function saveRun(run) { writeDoc(RUN_DOC, { version: RUN_VERSION, ...run }); }
export function loadRun() {
  const r = readDoc(RUN_DOC) || readLegacy(LEGACY_RUN_KEY);
  if (r && r.deck && r.deck.every((c) => CARDS[c.id]) && r.charms.every((k) => CHARMS[k])) {
    delete r.version;
    r.character ||= 'jenny';
    r.snacks = (r.snacks || Array(SNACK_SLOTS).fill(null)).map((s) => (s && SNACKS[s] ? s : null));
    return r;
  }
  return null;
}
export function clearRun() { removeDoc(RUN_DOC); try { localStorage.removeItem(LEGACY_RUN_KEY); } catch { /* ignore */ } }

// The card played the most this run (statuses and curses don't count).
export function topCard(run) {
  let best = null;
  for (const [id, n] of Object.entries(run.plays || {})) {
    const def = CARDS[id];
    if (!def || def.rarity === 'status' || def.rarity === 'curse' || def.type === 'status') continue;
    if (!best || n > best.n) best = { id, n };
  }
  return best;
}

// What the progress save keeps about a finished run.
export function runSummary(run, won, { killedBy, abandoned } = {}) {
  return {
    character: run.character || 'jenny',
    won: !!won,
    climb: run.climb || 0,
    floors: run.floorsCleared,
    act: run.act,
    defeated: run.kills,
    deck: run.deck.map((c) => (c.up ? `${c.id}+` : c.id)),
    charms: [...run.charms],
    snacks: run.snacks.filter(Boolean),
    // for the Run history page (runs saved before these were added don't have them)
    guardians: guardiansMet(run),
    bosses: [0, 1, 2].map((f) => run.bossOf?.[f]).filter(Boolean),
    ...(topCard(run) ? { top_card: topCard(run).id, top_plays: topCard(run).n } : {}),
    ...(run.bestHit ? { best_hit: run.bestHit } : {}),
    ...(killedBy ? { killed_by: killedBy } : {}),
    ...(abandoned ? { abandoned: true } : {}),
  };
}

// Pocket Fridge: fill the empty snack slots when you reach a new floor.
export function fillSnacksForFloor(run) {
  if (!run.charms.includes('pocketFridge') && !run.charms.includes('packedLunch')) return [];
  const got = [];
  while (snackRoom(run)) { const id = drawSnack(run); if (!id || !addSnack(run, id)) break; got.push(id); }
  return got;
}

// rooms in a full climb: Floors 1-3 have 9 rows + a boss, Floor 4 has 8 rows + the Net Café
export const TOTAL_FLOORS = (ROWS + 1) * 3 + 9;
