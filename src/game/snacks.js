// Snacks: one-use items kept in the snack bar (like potions). A run starts
// with SNACK_SLOTS empty slots. Use one any time during your turn in a fight;
// snacks marked `anytime` can also be eaten on the map.
//
// rarity: common | uncommon | rare (drop and shop odds)
// style: the card style it helps (styled snacks drop more for that style)
// fx(b): effect inside a Battle; fxRun(run): effect outside a fight (anytime snacks only)
// icon: a card icon name from src/ui/art.js; color: the badge color

import { T } from './terms.js';

export const SNACK_SLOTS = 3;
// Drop chance after a fight, in %. It goes down 10 after a drop and up 10
// after a fight without one, so long dry streaks can't happen.
export const SNACK_DROP = { start: 30, step: 10, elite: 15, coupon: 20 };

const healRun = (run, n) => { const before = run.hp; run.hp = Math.min(run.maxHp, run.hp + n); return run.hp - before; };

export const SNACKS = {
  // ----- Dreamy -----
  chamomile: { name: 'Chamomile Tea', icon: 'mug', color: '#5b6fc9', rarity: 'common', style: 'dreamy',
    desc: `Apply 2 ${T.sleepy}.`, fx: (b) => b.applyEnemy('weak', 2) },
  lullaby: { name: 'Lullaby Gummies', icon: 'zzz', color: '#5b6fc9', rarity: 'rare', style: 'dreamy',
    desc: `The enemy falls ${T.asleep} right away (fills its ${T.sleepy}).`,
    fx: (b) => { const e = b.enemy; if (!e.asleep) b.applyEnemy('weak', Math.max(1, e.sleepAt - e.weak)); } },
  // ----- Cozy -----
  bananaMilk: { name: 'Banana Milk', icon: 'milk', color: '#ffd34d', rarity: 'common', style: 'cozy', anytime: true,
    desc: 'Heal 10. Can be eaten on the map.', fx: (b) => b.heal(10), fxRun: (run) => healRun(run, 10) },
  hotteok: { name: 'Hotteok', icon: 'bowl', color: '#d9822b', rarity: 'uncommon', style: 'cozy',
    desc: `Heal 12. ${T.cozy}.`, fx: (b) => b.heal(12, { cozy: true }) },
  // ----- Glitch -----
  popRocks: { name: 'Pop Rocks', icon: 'bubbles', color: '#4f8a55', rarity: 'common', style: 'glitch',
    desc: `Apply 5 ${T.glitch}.`, fx: (b) => b.applyEnemy('poison', 5) },
  mysteryJelly: { name: 'Mystery Jelly', icon: 'drop', color: '#4f8a55', rarity: 'uncommon', style: 'glitch',
    desc: `Apply 2 ${T.glitch}, then double the enemy's ${T.glitch}.`,
    fx: (b) => { b.applyEnemy('poison', 2); b.applyEnemy('poison', b.enemy.poison); } },
  // ----- Guard -----
  proteinBar: { name: 'Protein Bar', icon: 'shield', color: '#4a6fa5', rarity: 'common', style: 'guard',
    desc: `${T.block} 10.`, fx: (b) => b.gainBlock(10) },
  bigMochi: { name: 'Big Mochi', icon: 'rice', color: '#4a6fa5', rarity: 'uncommon', style: 'guard',
    desc: `Gain 3 ${T.block} at the start of each of your turns this fight.`, fx: (b) => { b.powers.armor += 3; b.gainBlock(3); } },
  // ----- Memory -----
  blueberry: { name: 'Blueberry Yogurt', icon: 'eye', color: '#7a5ab3', rarity: 'common', style: 'memory',
    desc: 'Reveal 6 hidden cards.', fx: (b) => b.reveal(6) },
  walnutCookies: { name: 'Walnut Cookies', icon: 'star', color: '#7a5ab3', rarity: 'uncommon', style: 'memory',
    desc: 'Reveal every card on this board.', fx: (b) => b.reveal(99, false, true) },
  // ----- Combo -----
  sugarRush: { name: 'Sugar Rush Candy', icon: 'comet', color: '#d2493f', rarity: 'common', style: 'combo',
    desc: `+3 ${T.combo}.`, fx: (b) => { b.combo += 3; } },
  chocoSticks: { name: 'Choco Sticks', icon: 'stack', color: '#d2493f', rarity: 'uncommon', style: 'combo',
    desc: `+1 ${T.combo}. This turn, missing doesn't reset your ${T.combo}.`, fx: (b) => { b.combo += 1; b.flags.comboLock = true; } },
  // ----- Exposed -----
  hotSauce: { name: 'Hot Sauce Packet', icon: 'chili', color: '#c2417a', rarity: 'common', style: 'exposed',
    desc: `Apply 3 ${T.exposed}.`, fx: (b) => b.applyEnemy('vuln', 3) },
  fireNoodles: { name: 'Fire Noodles', icon: 'fire', color: '#c2417a', rarity: 'uncommon', style: 'exposed',
    desc: `Apply 2 ${T.exposed}, then deal 8.`, fx: (b) => { b.applyEnemy('vuln', 2); b.attack(8); } },
  // ----- any style -----
  icedCoffee: { name: 'Iced Coffee', icon: 'cup', color: '#8a5a3c', rarity: 'common',
    desc: `+2 ${T.energy}.`, fx: (b) => b.gainEnergy(2) },
  friedChicken: { name: 'Fried Chicken', icon: 'crit', color: '#e8a04a', rarity: 'common',
    desc: 'Deal 10.', fx: (b) => b.attack(10, { raw: true }) },
  ginseng: { name: 'Ginseng Drink', icon: 'can', color: '#b9862a', rarity: 'uncommon',
    desc: `Gain 2 ${T.spirit} for this fight.`, fx: (b) => b.applyPlayer('strength', 2) },
  birthdayCake: { name: 'Birthday Cake', icon: 'crown', color: '#ff8fb0', rarity: 'rare', anytime: true,
    desc: `Heal 25% of your max ${T.hp} and gain 5 max ${T.hp}. Can be eaten on the map.`,
    fx: (b) => { b.run.maxHp += 5; b.heal(Math.round(b.run.maxHp * 0.25)); },
    fxRun: (run) => { run.maxHp += 5; return healRun(run, Math.round(run.maxHp * 0.25)); } },
};

export const SNACK_PRICE = { common: 45, uncommon: 65, rare: 90 };

// ---------- the snack bar (run.snacks: array of ids or null, one per slot) ----------
export function snackBar(run) {
  run.snacks ||= Array(SNACK_SLOTS).fill(null);
  return run.snacks;
}
export const snackRoom = (run) => snackBar(run).filter((s) => !s).length;
export const snackCount = (run) => snackBar(run).filter(Boolean).length;
export function addSnack(run, id) {
  const bar = snackBar(run);
  const i = bar.indexOf(null);
  if (!id || i < 0) return false;
  bar[i] = id;
  return true;
}
export function removeSnack(run, slot) {
  const bar = snackBar(run);
  const id = bar[slot];
  bar[slot] = null;
  return id;
}
export function addSnackSlots(run, n) { snackBar(run).push(...Array(n).fill(null)); }

// Eat a snack outside a fight (anytime snacks only). Returns a short result text.
export function eatOnMap(run, slot) {
  const id = snackBar(run)[slot];
  const s = SNACKS[id];
  if (!s || !s.anytime) return null;
  removeSnack(run, slot);
  const times = run.charms.includes('secretRecipe') ? 2 : 1;
  let healed = 0;
  for (let k = 0; k < times; k++) healed += s.fxRun(run) || 0;
  if (run.charms.includes('hamsterCheeks')) healed += healRun(run, 2);
  return `${s.name}: +${healed} ${T.hp}.`;
}
