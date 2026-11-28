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
//   event:special                              special events (once each per run)
//   enemy:<act>:normal / enemy:<act>:elite     who you fight
//   snack:<rarity> / snack:<style>             snack drops, shop snacks, events

import { CARDS } from './cards.js';
import { CHARMS } from './charms.js';
import { EVENTS, SPECIAL_EVENTS, LEGENDARY_EVENT, SPECIAL_NEED } from './events.js';
import { ACTS } from './enemies.js';
import { SNACKS, SNACK_DROP } from './snacks.js';
import { climbOn, CLIMB_RULES as CR } from './climb.js';

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
  // climb level 6: normal fights show about 10% fewer rares (0.78 on the roll, since pity makes up part of the gap)
  const rare = ((kind === 'elite' ? 10 : 3) + loot.rarePity) * (kind !== 'elite' && climbOn(run, 6) ? CR.normalRare : 1);
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

// ---------- play styles ----------
// Your deck's style is whichever style tag (Glitch / Guard / Combo / Memory /
// Dreamy / Cozy / Exposed) you own the most cards of. Starter cards don't
// count, so a character's starting deck never picks the style for you. Once you have one, rewards and shops pull extra
// cards from that style's own deck, so a Glitch run keeps finding Glitch cards.
export function deckStyle(run) {
  const counts = {};
  for (const c of run.deck) {
    const d = CARDS[c.id];
    if (d.rarity === 'starter') continue;
    for (const a of [d.arch, d.arch2]) if (a) counts[a] = (counts[a] || 0) + 1;
  }
  const gift = run.charms.map((k) => CHARMS[k].style).find(Boolean);
  if (gift) counts[gift] = (counts[gift] || 0) + 1.5;
  const best = Object.entries(counts).sort((a, b) => b[1] - a[1])[0];
  return best && best[1] >= 1 ? { arch: best[0], count: Math.floor(best[1]) } : null;
}

export function drawStyleCard(run, arch, rarity, exclude = []) {
  const ok = (id) => !exclude.includes(id) && cardAllowed(run, id);
  const ids = (r) => Object.keys(CARDS).filter((id) => (CARDS[id].arch === arch || CARDS[id].arch2 === arch) && !['event', 'gift', 'legendary'].includes(CARDS[id].rarity) && (!r || CARDS[id].rarity === r));
  return drawFrom(run, `card:${arch}:${rarity}`, () => ids(rarity), ok) || drawFrom(run, `card:${arch}:any`, () => ids(), ok);
}

export function cardReward(run, kind, n = 3) {
  const out = [];
  const style = deckStyle(run);
  // 1 style card once you lean into a style, 2 once you're committed (4+ cards)
  const styleSlots = style ? (style.count >= 4 ? 2 : 1) : 0;
  for (let i = 0; i < n; i++) {
    const rarity = rollRarity(run, kind);
    const id = (i < styleSlots && drawStyleCard(run, style.arch, rarity, out)) || drawCard(run, rarity, out);
    if (id) out.push(id);
  }
  return out.map((id) => ({ id }));
}

// ---------- charms ----------
const charmIds = (pool) => Object.keys(CHARMS).filter((k) => CHARMS[k].pool === pool);

export function drawCharm(run, pool = 'drop', exclude = []) {
  return drawFrom(run, `charm:${pool}`, () => charmIds(pool), (k) => !exclude.includes(k) && charmAllowed(run, k));
}

// ---------- snacks ----------
// Once your deck has a style, half of all snacks come from that style's snacks.
export function drawSnack(run, rarity) {
  const style = deckStyle(run);
  if (!rarity) { const r = Math.random() * 100; rarity = r < 8 ? 'rare' : r < 38 ? 'uncommon' : 'common'; }
  if (style && Math.random() < 0.5) {
    const id = drawFrom(run, `snack:${style.arch}`, () => Object.keys(SNACKS).filter((k) => SNACKS[k].style === style.arch && SNACKS[k].rarity !== 'event'));
    if (id) return id;
  }
  return drawFrom(run, `snack:${rarity}`, () => Object.keys(SNACKS).filter((k) => SNACKS[k].rarity === rarity))
    || drawFrom(run, 'snack:common', () => Object.keys(SNACKS).filter((k) => SNACKS[k].rarity === 'common'));
}

// After a fight: a snack drops with a chance that moves toward a drop each time one doesn't.
export function rollSnackDrop(run, kind) {
  const loot = ensure(run);
  loot.snackChance ??= SNACK_DROP.start;
  const chance = loot.snackChance + (kind === 'elite' ? SNACK_DROP.elite : 0) + (run.charms.includes('snackCoupon') ? SNACK_DROP.coupon : 0);
  if (Math.random() * 100 < chance) {
    loot.snackChance = Math.max(0, loot.snackChance - SNACK_DROP.step);
    return drawSnack(run);
  }
  loot.snackChance = Math.min(100, loot.snackChance + SNACK_DROP.step);
  return null;
}

// ---------- events & enemies ----------
// Special events come first: the first "?" room after your deck qualifies
// for one is that special event, from Floor 2 on, at most one per floor.
export const SPECIAL_FROM_ACT = 1;
export function drawSpecialEvent(run) {
  run.specialFloors ||= [];
  if (run.act < SPECIAL_FROM_ACT || run.specialFloors.includes(run.act)) return null;
  const ok = (id) => SPECIAL_EVENTS.find((e) => e.id === id).requires(run);
  const id = drawFrom(run, 'event:special', () => SPECIAL_EVENTS.map((e) => e.id).filter((k) => !(run.specialSeen || []).includes(k)), ok);
  if (!id) return null;
  run.specialFloors.push(run.act);
  (run.specialSeen ||= []).push(id);
  return SPECIAL_EVENTS.find((e) => e.id === id);
}

// Legendary Pull: from Floor 2 on, the first "?" room of each floor where your
// deck has a main style (3+ cards) rolls once. More style cards = better odds,
// capped so it comes up in at most about 1 run in 5 (two floors at ~10.5%).
// Never offered if you already own a legendary card.
export const LEGENDARY = { fromAct: 1, perCard: 0.015, maxPerFloor: 0.105 };
export function legendaryChance(run) {
  const style = deckStyle(run);
  if (!style || style.count < SPECIAL_NEED) return 0;
  return Math.min(LEGENDARY.maxPerFloor, LEGENDARY.perCard * style.count);
}
export function drawLegendaryEvent(run) {
  if (run.act < LEGENDARY.fromAct || run.legendaryOffered) return null;
  if (run.deck.some((c) => CARDS[c.id].rarity === 'legendary')) return null;
  run.legendaryFloors ||= [];
  if (run.legendaryFloors.includes(run.act)) return null;
  const p = legendaryChance(run);
  if (!p) return null; // no main style yet: this floor's roll waits
  run.legendaryFloors.push(run.act);
  if (Math.random() >= p) return null;
  run.legendaryOffered = true;
  run.legendaryStyle = deckStyle(run).arch;
  return LEGENDARY_EVENT;
}

export function drawEvent(run) {
  const lg = drawLegendaryEvent(run);
  if (lg) return lg;
  const sp = drawSpecialEvent(run);
  if (sp) return sp;
  const ok = (id) => { const ev = EVENTS.find((e) => e.id === id); return !ev.requires || ev.requires(run); };
  const seenAll = () => EVENTS.map((e) => e.id);
  const id = drawFrom(run, 'event', seenAll, ok);
  return EVENTS.find((e) => e.id === id) || EVENTS[0];
}

// Each floor's boss is picked once per run (so the map can show it ahead of time).
export function bossFor(run, act = run.act) {
  run.bossOf ||= {};
  if (!run.bossOf[act] || !ACTS[act].bosses.includes(run.bossOf[act])) {
    const list = ACTS[act].bosses;
    run.bossOf[act] = list[Math.floor(Math.random() * list.length)];
  }
  return run.bossOf[act];
}

export function drawEnemy(run, type) {
  const act = ACTS[run.act];
  if (type === 'boss') return bossFor(run);
  const list = type === 'elite' ? act.elites : act.normals;
  return drawFrom(run, `enemy:${run.act}:${type}`, () => list);
}
