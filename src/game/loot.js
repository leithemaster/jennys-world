// Loot decks: instead of rolling dice every time, each reward source draws
// from its own shuffled deck stored on the run. Nothing repeats until that
// deck is used up, then it reshuffles. Items with a `requires` condition stay
// in the deck but are skipped until the condition is true (e.g. Catalyst only
// shows up once you own a card that applies Glitch).
//
// Decks used:
//   card:common / card:uncommon / card:rare   card rewards, shop cards, events
//   charm:drop                                 treasure, elites, events
//   charm:shop                                 shop shelves only
//   charm:boss                                 boss rewards only
//   event                                      "?" rooms (no repeats per run)
//   enemy:<act>:normal / enemy:<act>:elite     who you fight

import { CARDS } from './cards.js';
import { CHARMS } from './charms.js';
import { EVENTS } from './events.js';
import { ACTS } from './enemies.js';

const shuffle = (a) => { a = [...a]; for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };

function ensure(run) {
  run.loot ||= { decks: {}, rarePity: -5 };
  run.loot.decks ||= {};
  return run.loot;
}

// Draw the top item that passes `ok`; refill the deck when it's empty.
export function drawFrom(run, name, full, ok = () => true) {
  const loot = ensure(run);
  for (let attempt = 0; attempt < 2; attempt++) {
    let d = loot.decks[name];
    if (!d || !d.length) d = loot.decks[name] = shuffle(full());
    for (let i = d.length - 1; i >= 0; i--) {
      if (ok(d[i])) return d.splice(i, 1)[0];
    }
    loot.decks[name] = null; // everything left is blocked: reshuffle the whole list once
  }
  return null;
}

// ---------- conditions ----------
const deckHas = (run, ids) => run.deck.some((c) => ids.includes(c.id));
const deckCount = (run, ids) => run.deck.filter((c) => ids.includes(c.id)).length;
export const BLOCK_CARDS = ['guard', 'hoodieUp', 'trip', 'peek', 'memoryLane'];
export const GLITCH_CARDS = ['stinger', 'catalyst'];

export function cardAllowed(run, id) {
  const req = CARDS[id].requires;
  return !req || req(run, { deckHas: (ids) => deckHas(run, ids), deckCount: (ids) => deckCount(run, ids) });
}
export function charmAllowed(run, id) {
  if (run.charms.includes(id)) return false;
  const req = CHARMS[id].requires;
  return !req || req(run, { deckHas: (ids) => deckHas(run, ids), deckCount: (ids) => deckCount(run, ids) });
}

// ---------- cards ----------
const cardIds = (rarity) => Object.keys(CARDS).filter((id) => CARDS[id].rarity === rarity);

// Rare chance rises a little every time you're shown a common, and resets
// when a rare shows up, so long dry streaks can't happen.
export function rollRarity(run, kind) {
  if (kind === 'boss') return 'rare';
  const loot = ensure(run);
  const rare = (kind === 'elite' ? 10 : 3) + loot.rarePity;
  const uncommon = kind === 'elite' ? 40 : 37;
  const r = Math.random() * 100;
  if (r < rare) { loot.rarePity = -5; return 'rare'; }
  if (r < rare + uncommon) return 'uncommon';
  loot.rarePity = Math.min(40, loot.rarePity + 1);
  return 'common';
}

export function drawCard(run, rarity, exclude = []) {
  return drawFrom(run, `card:${rarity}`, () => cardIds(rarity), (id) => !exclude.includes(id) && cardAllowed(run, id))
    || drawFrom(run, 'card:common', () => cardIds('common'), (id) => !exclude.includes(id));
}

export function cardReward(run, kind, n = 3) {
  const out = [];
  for (let i = 0; i < n; i++) {
    const id = drawCard(run, rollRarity(run, kind), out);
    if (id) out.push(id);
  }
  return out.map((id) => ({ id }));
}

// ---------- charms ----------
const charmIds = (pool) => Object.keys(CHARMS).filter((k) => CHARMS[k].pool === pool);

export function drawCharm(run, pool = 'drop', exclude = []) {
  return drawFrom(run, `charm:${pool}`, () => charmIds(pool), (k) => !exclude.includes(k) && charmAllowed(run, k));
}

// ---------- events & enemies ----------
export function drawEvent(run) {
  const ok = (id) => { const ev = EVENTS.find((e) => e.id === id); return !ev.requires || ev.requires(run); };
  const seenAll = () => EVENTS.map((e) => e.id);
  const id = drawFrom(run, 'event', seenAll, ok);
  return EVENTS.find((e) => e.id === id) || EVENTS[0];
}

export function drawEnemy(run, type) {
  const act = ACTS[run.act];
  if (type === 'boss') return act.boss;
  const list = type === 'elite' ? act.elites : act.normals;
  return drawFrom(run, `enemy:${run.act}:${type}`, () => list);
}
