// Snacks: one-use items kept in the snack bar (like potions). A run starts
// with SNACK_SLOTS empty slots. Use one any time during your turn in a fight;
// snacks marked `anytime` can also be eaten on the map.
//
// rarity: common | uncommon | rare (drop and shop odds) | event (only from events, see `gives` in events.js)
// style / style2: the card style(s) it helps (styled snacks drop more for that style; style2 = hybrid)
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
    desc: 'Heal 6. Can be eaten on the map.', fx: (b) => b.heal(6), fxRun: (run) => healRun(run, 6) },
  hotteok: { name: 'Hotteok', icon: 'bowl', color: '#d9822b', rarity: 'uncommon', style: 'cozy',
    desc: `Heal 12. ${T.cozy}.`, fx: (b) => b.heal(12, { cozy: true }) },
  // ----- Glitch -----
  popRocks: { name: 'Pop Rocks', icon: 'bubbles', color: '#4f8a55', rarity: 'common', style: 'glitch',
    desc: `Apply 4 ${T.glitch}.`, fx: (b) => b.applyEnemy('poison', 4) },
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
    desc: 'Reveal 5 hidden cards.', fx: (b) => b.reveal(5) },
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
  // ----- more style snacks -----
  lavenderMacaron: { name: 'Lavender Macaron', icon: 'moon', color: '#5b6fc9', rarity: 'uncommon', style: 'dreamy',
    desc: `Apply 3 ${T.sleepy}. ${T.block} 5.`, fx: (b) => { b.applyEnemy('weak', 3); b.gainBlock(5); } },
  samgyetang: { name: 'Samgyetang', icon: 'bowl', color: '#d9822b', rarity: 'rare', style: 'cozy',
    desc: `Heal 25. ${T.cozy}.`, fx: (b) => b.heal(25, { cozy: true }) },
  glitchGum: { name: 'Glitch Gum', icon: 'bubbles', color: '#4f8a55', rarity: 'rare', style: 'glitch',
    desc: `Apply 10 ${T.glitch}.`, fx: (b) => b.applyEnemy('poison', 10) },
  riceCakeTower: { name: 'Rice Cake Tower', icon: 'rice', color: '#4a6fa5', rarity: 'rare', style: 'guard',
    desc: `${T.block} 25.`, fx: (b) => b.gainBlock(25) },
  almondBrittle: { name: 'Almond Brittle', icon: 'star', color: '#7a5ab3', rarity: 'rare', style: 'memory',
    desc: `Reveal every card on this board. +1 ${T.energy}.`, fx: (b) => { b.reveal(99, false, true); b.gainEnergy(1); } },
  shavedIce: { name: 'Rainbow Shaved Ice', icon: 'star', color: '#d2493f', rarity: 'rare', style: 'combo',
    desc: `+5 ${T.combo}. This turn, missing doesn't reset your ${T.combo}.`, fx: (b) => { b.combo += 5; b.flags.comboLock = true; } },
  ghostPepper: { name: 'Ghost Pepper', icon: 'chili', color: '#c2417a', rarity: 'rare', style: 'exposed',
    desc: `Apply 6 ${T.exposed}.`, fx: (b) => b.applyEnemy('vuln', 6) },
  // ----- hybrid snacks: count for both styles -----
  milkTea: { name: 'Warm Milk Tea', icon: 'mug', color: '#5b6fc9', rarity: 'uncommon', style: 'dreamy', style2: 'cozy',
    desc: `Heal 5. Apply 2 ${T.sleepy}. ${T.cozy}.`, fx: (b) => { b.heal(5, { cozy: true }); b.applyEnemy('weak', 2); } },
  kimchi: { name: 'Kimchi', icon: 'chili', color: '#4f8a55', rarity: 'uncommon', style: 'glitch', style2: 'exposed',
    desc: `Apply 3 ${T.glitch} and 2 ${T.exposed}.`, fx: (b) => { b.applyEnemy('poison', 3); b.applyEnemy('vuln', 2); } },
  energyMochi: { name: 'Energy Mochi', icon: 'rice', color: '#d2493f', rarity: 'common', style: 'combo', style2: 'guard',
    desc: `+2 ${T.combo}. ${T.block} 6.`, fx: (b) => { b.combo += 2; b.gainBlock(6); } },
  fishCake: { name: 'Fish Cake Skewer', icon: 'stack', color: '#7a5ab3', rarity: 'common', style: 'memory', style2: 'combo',
    desc: `Reveal 3 hidden cards. +2 ${T.combo}.`, fx: (b) => { b.reveal(3); b.combo += 2; } },
  honeyToast: { name: 'Honey Toast', icon: 'bowl', color: '#d9822b', rarity: 'common', style: 'cozy', style2: 'guard',
    desc: `Heal 4. ${T.block} 6.`, fx: (b) => { b.heal(4); b.gainBlock(6); } },
  sourWorms: { name: 'Sour Gummy Worms', icon: 'worm', color: '#4f8a55', rarity: 'common', style: 'glitch', style2: 'dreamy',
    desc: `Apply 1 ${T.sleepy} and 4 ${T.glitch}.`, fx: (b) => { b.applyEnemy('weak', 1); b.applyEnemy('poison', 4); } },
  // ----- any style -----
  onigiri: { name: 'Onigiri', icon: 'rice', color: '#8a8f99', rarity: 'common',
    desc: `Heal 4. ${T.block} 4.`, fx: (b) => { b.heal(4); b.gainBlock(4); } },
  yogurtDrink: { name: 'Yogurt Drink', icon: 'can', color: '#e65c7a', rarity: 'uncommon',
    desc: `+1 ${T.energy}. Heal 4.`, fx: (b) => { b.gainEnergy(1); b.heal(4); } },

  // ----- any style (originals) -----
  icedCoffee: { name: 'Iced Coffee', icon: 'cup', color: '#8a5a3c', rarity: 'uncommon',
    desc: `+2 ${T.energy}.`, fx: (b) => b.gainEnergy(2) },
  friedChicken: { name: 'Fried Chicken', icon: 'crit', color: '#e8a04a', rarity: 'common',
    desc: 'Deal 8.', fx: (b) => b.attack(8, { raw: true }) },
  ginseng: { name: 'Ginseng Drink', icon: 'can', color: '#b9862a', rarity: 'uncommon',
    desc: `Gain 2 ${T.spirit} for this fight.`, fx: (b) => b.applyPlayer('strength', 2) },
  birthdayCake: { name: 'Birthday Cake', icon: 'crown', color: '#ff8fb0', rarity: 'rare', anytime: true,
    desc: `Heal 25% of your max ${T.hp} and gain 5 max ${T.hp}. Can be eaten on the map.`,
    fx: (b) => { b.run.maxHp += 5; b.heal(Math.round(b.run.maxHp * 0.25)); },
    fxRun: (run) => { run.maxHp += 5; return healRun(run, Math.round(run.maxHp * 0.25)); } },

  // ----- event only: never dropped or sold -----
  cottonCandy: { name: 'Cotton Candy', icon: 'bubbles', color: '#ffb3d9', rarity: 'event',
    desc: `Heal 6 and gain 6 ${T.block}.`, fx: (b) => { b.heal(6); b.gainBlock(6); } },
  rainbowCotton: { name: 'Rainbow Cotton Candy', icon: 'star', color: '#c7a6ff', rarity: 'event',
    desc: `+1 ${T.energy}, +2 ${T.combo} and reveal 2 hidden cards.`, fx: (b) => { b.gainEnergy(1); b.combo += 2; b.reveal(2); } },
  sweetPotato: { name: 'Roasted Sweet Potato', icon: 'rice', color: '#b5651d', rarity: 'event', anytime: true,
    desc: `Heal 12. In a fight, also clear your ${T.sleepy}, ${T.exposed} and ${T.glitch}. Can be eaten on the map.`,
    fx: (b) => { b.heal(12); b.player.weak = 0; b.player.vuln = 0; b.player.poison = 0; },
    fxRun: (run) => healRun(run, 12) },
  dalgona: { name: 'Dalgona Candy', icon: 'crown', color: '#e8a04a', rarity: 'event',
    desc: `Double your ${T.combo}, then +1 ${T.energy}.`, fx: (b) => { b.combo *= 2; b.gainEnergy(1); } },
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
