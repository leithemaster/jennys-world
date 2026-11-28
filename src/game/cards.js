// Every card in Kioku Tower. Each card in your deck appears on the board as a
// pair; matching two of the same card plays it.
//
// arch / arch2: card style(s). A hybrid card has two styles and counts
// toward both, so mixed decks keep finding cards for either half.
// Wording rule: this game has no "draw a card". Anything that would draw
// a card reveals cards instead.
// type: attack | skill | power | status
// rarity: starter | common | uncommon | rare | event | legendary | status
//   legendary: one per style, only from the Legendary Pull event; you can own just one
//   event: only given by events (see `gives` in events.js), never in rewards or shops
//   gift: only come with a guardian's charm (see `gives` in charms.js)
// fx(b, up) runs the effect inside a Battle (b); `up` is true when upgraded.
// requires(run, h): card stays out of rewards until true; needs: the same rule in plain words (catalog).

import { T } from './terms.js';

// Cards that count toward a style's conditions (which cards can show up).
// Starter cards count too, so Jenny's Zap opens the Exposed payoffs.
export const SLEEPY_CARDS = ['yawn', 'trip', 'lightsOut', 'countingSheep', 'pillowFight', 'bedtimeStory', 'deepSleep', 'napTime', 'dreamJournal', 'sandman', 'sleepMode', 'sandstorm', 'sleepwalk', 'feverDream'];
export const HEAL_CARDS = ['warmMilk', 'snack', 'hotCocoa', 'groupHug', 'feelBetter', 'secondHelping', 'sweetDreams', 'napTime', 'spoonful', 'selfCare', 'comboMeal', 'photoAlbum', 'hotPot', 'comfortZone', 'toughLove'];
export const EXPOSED_CARDS = ['zap', 'callOut', 'pileOn', 'snitch', 'roast', 'roastBattle', 'heckle', 'leak', 'screenshot', 'spillTea', 'wakeUpCall', 'leakedDMs', 'toughLove'];
export const GLITCH_CARDS = ['stinger', 'virusUpload', 'lagSpike', 'malware', 'leak', 'packetLoss', 'sleepMode', 'firewall', 'botnet', 'feverDream'];

export const CARDS = {
  // ---------- starter ----------
  slash: {
    name: 'Slash', type: 'attack', rarity: 'starter', icon: 'blade',
    text: (u) => `Deal ${u ? 9 : 6}.`,
    fx: (b, u) => b.attack(u ? 9 : 6),
  },
  guard: {
    name: 'Guard', type: 'skill', rarity: 'starter', icon: 'shield',
    text: (u) => `${T.block} ${u ? 8 : 5}.`,
    fx: (b, u) => b.gainBlock((u ? 8 : 5) + (b.has('fuzzySocks') ? 3 : 0)),
  },
  zap: {
    name: 'Zap', type: 'attack', rarity: 'starter', icon: 'bolt',
    text: (u) => `Deal ${u ? 10 : 7}. Apply ${u ? 2 : 1} ${T.exposed}.`,
    fx: (b, u) => { b.attack(u ? 10 : 7); b.applyEnemy('vuln', u ? 2 : 1); },
  },
  boba: {
    name: 'Boba', type: 'skill', rarity: 'starter', icon: 'cup',
    text: (u) => `+${u ? 3 : 2} ${T.energy}.`,
    fx: (b, u) => b.gainEnergy(u ? 3 : 2),
  },
  // Toni's starters. Tagged with their style for the card frame, but starter
  // cards never count toward your deck's style (see deckStyle in loot.js).
  yawn: {
    arch: 'dreamy',
    name: 'Yawn', type: 'skill', rarity: 'starter', icon: 'zzz',
    text: (u) => `Apply 2 ${T.sleepy}.${u ? ` ${T.block} 5.` : ''}`,
    fx: (b, u) => { b.applyEnemy('weak', 2); if (u) b.gainBlock(5); },
  },
  warmMilk: {
    arch: 'cozy',
    name: 'Warm Milk', type: 'skill', rarity: 'starter', icon: 'milk',
    text: (u) => `Heal ${u ? 5 : 3}. ${T.cozy}.`,
    fx: (b, u) => b.heal(u ? 5 : 3, { cozy: true }),
  },

  // ---------- common ----------
  twinCut: {
    name: 'Twin Cut', type: 'attack', rarity: 'common', icon: 'twin',
    text: (u) => `Deal ${u ? 5 : 4} twice.`,
    fx: (b, u) => { b.attack(u ? 5 : 4); b.attack(u ? 5 : 4); },
  },
  bigSwing: {
    name: 'Big Swing', type: 'attack', rarity: 'common', icon: 'bat',
    text: (u) => `Deal ${u ? 17 : 13}.`,
    fx: (b, u) => b.attack(u ? 17 : 13),
  },
  stinger: {
    arch: 'glitch',
    name: 'Stinger', type: 'attack', rarity: 'common', icon: 'bee',
    text: (u) => `Deal 3. Apply ${u ? 6 : 4} ${T.glitch}.`,
    fx: (b, u) => { b.attack(3); b.applyEnemy('poison', u ? 6 : 4); },
  },
  hoodieUp: {
    arch: 'guard',
    name: 'Hoodie Up', type: 'skill', rarity: 'common', icon: 'hood',
    text: (u) => `${T.block} ${u ? 13 : 9}.`,
    fx: (b, u) => b.gainBlock((u ? 13 : 9) + (b.has('fuzzySocks') ? 3 : 0)),
  },
  peek: {
    arch: 'memory',
    name: 'Peek', type: 'skill', rarity: 'common', icon: 'eye',
    text: (u) => `Reveal ${u ? 4 : 2} hidden cards. ${T.block} 3.`,
    fx: (b, u) => { b.reveal(u ? 4 : 2); b.gainBlock(3); },
  },
  trip: {
    arch: 'guard', arch2: 'dreamy',
    name: 'Trip', type: 'skill', rarity: 'common', icon: 'swirl',
    text: (u) => `Apply ${u ? 2 : 1} ${T.sleepy}. ${T.block} ${u ? 6 : 4}.`,
    fx: (b, u) => { b.applyEnemy('weak', u ? 2 : 1); b.gainBlock(u ? 6 : 4); },
  },
  comboKick: {
    arch: 'combo',
    name: 'Combo Kick', type: 'attack', rarity: 'common', icon: 'kick',
    text: (u) => `Deal 4, +${u ? 5 : 3} for each ${T.combo}.`,
    fx: (b, u) => b.attack(4 + (u ? 5 : 3) * b.combo),
  },
  snack: {
    arch: 'cozy',
    name: 'Onigiri', type: 'skill', rarity: 'common', icon: 'rice',
    text: (u) => `Heal ${u ? 7 : 5}. ${T.cozy}. ${T.exhaust}.`,
    exhaust: true,
    fx: (b, u) => b.heal(u ? 7 : 5, { cozy: true }),
  },

  // ---------- uncommon ----------
  ricochet: {
    arch: 'combo',
    name: 'Ricochet', type: 'attack', rarity: 'uncommon', icon: 'bounce',
    text: (u) => `Deal ${u ? 5 : 3} for each match this turn.`,
    fx: (b, u) => b.attack((u ? 5 : 3) * b.matchesThisTurn),
  },
  shieldBash: {
    arch: 'guard',
    name: 'Shield Bash', type: 'attack', rarity: 'uncommon', icon: 'shieldHit',
    text: (u) => `Deal damage equal to your ${T.block}${u ? ' +5' : ''}.`,
    requires: (r, h) => h.deckCount(['guard', 'hoodieUp', 'trip', 'peek', 'memoryLane']) >= 3,
    needs: '3+ Block cards (Guard, Hoodie Up, Trip, Peek, Memory Lane)',
    fx: (b, u) => b.attack(b.player.block + (u ? 5 : 0), { raw: true }),
  },
  catalyst: {
    arch: 'glitch',
    name: 'Catalyst', type: 'skill', rarity: 'uncommon', icon: 'flask',
    text: (u) => `${u ? 'Triple' : 'Double'} the enemy's ${T.glitch}.`,
    requires: (r, h) => h.deckHas(GLITCH_CARDS),
    needs: 'a Glitch card (Stinger, Virus Upload, Lag Spike, Malware, Data Leak)',
    fx: (b, u) => b.applyEnemy('poison', b.enemy.poison * (u ? 2 : 1)),
  },
  memoryLane: {
    arch: 'memory',
    name: 'Memory Lane', type: 'skill', rarity: 'uncommon', icon: 'film',
    text: (u) => `Show every card for a moment. ${T.block} ${u ? 8 : 4}.`,
    fx: (b, u) => { b.flash(); b.gainBlock(u ? 8 : 4); },
  },
  momentum: {
    arch: 'combo',
    name: 'Momentum', type: 'skill', rarity: 'uncommon', icon: 'arrow',
    text: (u) => `+1 ${T.energy}. Your next miss this turn keeps your ${T.combo}.${u ? ` ${T.block} 4.` : ''}`,
    fx: (b, u) => { b.gainEnergy(1); b.flags.keepCombo = true; if (u) b.gainBlock(4); },
  },
  spikyJacket: {
    name: 'Spiky Jacket', type: 'power', rarity: 'uncommon', icon: 'spike',
    text: (u) => `${T.power}: when hit, deal ${u ? 5 : 3} back.`,
    fx: (b, u) => b.applyPlayer('thorns', u ? 5 : 3),
  },
  energyDrink: {
    name: 'Energy Drink', type: 'power', rarity: 'uncommon', icon: 'can',
    text: (u) => `${T.power}: +1 ${T.energy} each turn.${u ? ' +1 now.' : ''}`,
    fx: (b, u) => { b.powers.energy += 1; if (u) b.gainEnergy(1); },
  },
  hype: {
    name: 'Hype', type: 'power', rarity: 'uncommon', icon: 'fire',
    text: (u) => `${T.power}: gain ${u ? 3 : 2} ${T.spirit}.`,
    fx: (b, u) => b.applyPlayer('strength', u ? 3 : 2),
  },

  // ---------- rare ----------
  finalBoss: {
    name: 'Critical Hit', type: 'attack', rarity: 'rare', icon: 'crit',
    text: (u) => `Deal ${u ? 40 : 30}. ${T.exhaust}.`,
    exhaust: true,
    fx: (b, u) => b.attack(u ? 40 : 30),
  },
  flurry: {
    arch: 'combo',
    name: 'Button Mash', type: 'attack', rarity: 'rare', icon: 'keys',
    text: (u) => `Deal 2, ${u ? 10 : 7} times.`,
    fx: (b, u) => { for (let i = 0; i < (u ? 10 : 7); i++) b.attack(2); },
  },
  fortress: {
    arch: 'guard',
    name: 'Blanket Fort', type: 'power', rarity: 'rare', icon: 'fort',
    text: (u) => `${T.power}: ${T.block} no longer resets.${u ? ` ${T.block} 10.` : ''}`,
    requires: (r, h) => h.deckCount(['guard', 'hoodieUp', 'trip', 'peek', 'memoryLane']) >= 3,
    needs: '3+ Block cards (Guard, Hoodie Up, Trip, Peek, Memory Lane)',
    fx: (b, u) => { b.powers.fortress = true; if (u) b.gainBlock(10); },
  },
  photographic: {
    arch: 'memory',
    name: 'Photo Memory', type: 'power', rarity: 'rare', icon: 'camera',
    text: (u) => `${T.power}: your first miss each turn is free.${u ? ' Reveal 2.' : ''}`,
    fx: (b, u) => { b.powers.freeMiss = true; if (u) b.reveal(2); },
  },
  overclock: {
    name: 'Overclock', type: 'skill', rarity: 'rare', icon: 'chip',
    text: (u) => `+${u ? 4 : 3} ${T.energy}. Take 3 damage.`,
    fx: (b, u) => { b.gainEnergy(u ? 4 : 3); b.selfDamage(3); },
  },

  // ---------- play-style cards ----------
  // Glitch
  virusUpload: {
    arch: 'glitch', name: 'Virus Upload', type: 'skill', rarity: 'common', icon: 'upload',
    text: (u) => `Apply ${u ? 9 : 6} ${T.glitch}.`,
    fx: (b, u) => b.applyEnemy('poison', u ? 9 : 6),
  },
  lagSpike: {
    arch: 'glitch', name: 'Lag Spike', type: 'skill', rarity: 'common', icon: 'snail',
    text: (u) => `Apply ${u ? 4 : 3} ${T.glitch}. ${T.block} ${u ? 6 : 4}.`,
    fx: (b, u) => { b.applyEnemy('poison', u ? 4 : 3); b.gainBlock(u ? 6 : 4); },
  },
  corrupt: {
    arch: 'glitch', name: 'Corrupt', type: 'attack', rarity: 'uncommon', icon: 'skull',
    text: (u) => `Deal damage equal to the enemy's ${T.glitch}${u ? ' +6' : ''}.`,
    requires: (r, h) => h.deckHas([...GLITCH_CARDS, 'catalyst']),
    needs: 'a Glitch card (Stinger, Virus Upload, Lag Spike, Catalyst, Malware, Data Leak)',
    fx: (b, u) => b.attack(b.enemy.poison + (u ? 6 : 0), { raw: true }),
  },
  malware: {
    arch: 'glitch', name: 'Malware', type: 'power', rarity: 'rare', icon: 'worm',
    text: (u) => `${T.power}: apply ${u ? 4 : 3} ${T.glitch} at the start of each turn.`,
    fx: (b, u) => { b.powers.malware += u ? 4 : 3; },
  },
  // Guard
  bubbleWrap: {
    arch: 'guard', name: 'Bubble Wrap', type: 'skill', rarity: 'common', icon: 'bubbles',
    text: (u) => `${T.block} ${u ? 8 : 6}. If you already have ${T.block}, +${u ? 5 : 4} more.`,
    fx: (b, u) => b.gainBlock((u ? 8 : 6) + (b.player.block > 0 ? (u ? 5 : 4) : 0)),
  },
  payback: {
    arch: 'guard', name: 'Payback', type: 'attack', rarity: 'uncommon', icon: 'uturn',
    text: (u) => `${T.block} ${u ? 7 : 5}. Deal ${u ? 7 : 5}.`,
    fx: (b, u) => { b.gainBlock(u ? 7 : 5); b.attack(u ? 7 : 5); },
  },
  ironHoodie: {
    arch: 'guard', name: 'Iron Hoodie', type: 'power', rarity: 'rare', icon: 'helmet',
    text: (u) => `${T.power}: gain ${u ? 5 : 3} ${T.block} at the start of each turn.`,
    fx: (b, u) => { b.powers.armor += u ? 5 : 3; },
  },
  // Combo
  encore: {
    arch: 'combo', name: 'Encore', type: 'attack', rarity: 'common', icon: 'mic',
    text: (u) => `Deal ${u ? 7 : 5}. +1 ${T.combo}.`,
    fx: (b, u) => { b.attack(u ? 7 : 5); b.combo += 1; },
  },
  hotStreak: {
    arch: 'combo', name: 'Hot Streak', type: 'attack', rarity: 'uncommon', icon: 'comet',
    text: (u) => `Deal ${u ? 8 : 6}. If ${T.combo} is 3+, +1 ${T.energy}.`,
    fx: (b, u) => { b.attack(u ? 8 : 6); if (b.combo >= 3) b.gainEnergy(1); },
  },
  groove: {
    arch: 'combo', name: 'Groove', type: 'power', rarity: 'rare', icon: 'notes',
    text: (u) => `${T.power}: a miss only halves your ${T.combo}.${u ? ` +1 ${T.energy}.` : ''}`,
    fx: (b, u) => { b.powers.groove = true; if (u) b.gainEnergy(1); },
  },
  // Memory
  cheatSheet: {
    arch: 'memory', name: 'Cheat Sheet', type: 'skill', rarity: 'common', icon: 'paper',
    text: (u) => `Reveal ${u ? 5 : 3} hidden cards.`,
    fx: (b, u) => b.reveal(u ? 5 : 3),
  },
  spotlight: {
    arch: 'memory', name: 'Spotlight', type: 'power', rarity: 'uncommon', icon: 'spot',
    text: (u) => `${T.power}: matching a revealed card deals ${u ? 6 : 4}.`,
    fx: (b, u) => { b.powers.spotlight += u ? 6 : 4; },
  },
  secondSight: {
    arch: 'memory', name: 'Second Sight', type: 'skill', rarity: 'rare', icon: 'crystal',
    text: (u) => `Reveal all cards, or the next board if none are left.${u ? ` +1 ${T.energy}.` : ''} ${T.exhaust}.`,
    exhaust: true,
    fx: (b, u) => {
      // Played as the last pair there's nothing left to reveal, so save it for the next board.
      if (b.board.some((s) => s.state === 'down')) b.reveal(99, false, true);
      else { b.pendingReveal = 16; b.log('Second Sight: the whole next board will be revealed.'); }
      if (u) b.gainEnergy(1);
    },
  },

  // Dreamy: build Sleepy until the enemy falls Asleep
  lightsOut: {
    arch: 'dreamy', name: 'Lights Out', type: 'skill', rarity: 'common', icon: 'moon',
    text: (u) => `Apply 2 ${T.sleepy}. ${T.block} ${u ? 8 : 4}.`,
    fx: (b, u) => { b.applyEnemy('weak', 2); b.gainBlock(u ? 8 : 4); },
  },
  countingSheep: {
    arch: 'dreamy', name: 'Counting Sheep', type: 'attack', rarity: 'common', icon: 'sheep',
    text: (u) => `Deal ${u ? 7 : 5}. Apply ${u ? 2 : 1} ${T.sleepy}.`,
    fx: (b, u) => { b.attack(u ? 7 : 5); b.applyEnemy('weak', u ? 2 : 1); },
  },
  pillowFight: {
    arch: 'dreamy', name: 'Pillow Fight', type: 'attack', rarity: 'uncommon', icon: 'pillow',
    text: (u) => `Deal ${u ? 10 : 7}. Double damage if the enemy is ${T.asleep}.`,
    requires: (r, h) => h.deckHas(SLEEPY_CARDS),
    needs: 'a Sleepy card',
    fx: (b, u) => b.attack((u ? 10 : 7) * (b.enemy.asleep ? 2 : 1)),
  },
  bedtimeStory: {
    arch: 'dreamy', name: 'Bedtime Story', type: 'power', rarity: 'uncommon', icon: 'book',
    text: (u) => `${T.power}: apply 1 ${T.sleepy} at the start of each turn.${u ? ` Apply 2 now.` : ''}`,
    fx: (b, u) => { b.powers.bedtime += 1; if (u) b.applyEnemy('weak', 2); },
  },
  deepSleep: {
    arch: 'dreamy', name: 'Deep Sleep', type: 'power', rarity: 'rare', icon: 'bed',
    text: (u) => `${T.power}: enemies stay ${T.asleep} 1 turn longer.${u ? ` Apply 2 ${T.sleepy}.` : ''}`,
    requires: (r, h) => h.deckCount(SLEEPY_CARDS) >= 2,
    needs: '2+ Sleepy cards',
    fx: (b, u) => { b.powers.deepSleep += 1; if (u) b.applyEnemy('weak', 2); },
  },
  // Cozy: heal, and turn extra healing into damage
  hotCocoa: {
    arch: 'cozy', name: 'Hot Cocoa', type: 'skill', rarity: 'common', icon: 'mug',
    text: (u) => `Heal ${u ? 3 : 2}. +1 ${T.energy}. ${T.cozy}.`,
    fx: (b, u) => { b.heal(u ? 3 : 2, { cozy: true }); b.gainEnergy(1); },
  },
  groupHug: {
    arch: 'cozy', arch2: 'guard', name: 'Group Hug', type: 'skill', rarity: 'common', icon: 'hug',
    text: (u) => `Heal ${u ? 4 : 3}. ${T.block} ${u ? 7 : 4}. ${T.cozy}.`,
    fx: (b, u) => { b.heal(u ? 4 : 3, { cozy: true }); b.gainBlock(u ? 7 : 4); },
  },
  feelBetter: {
    arch: 'cozy', name: 'Feel Better', type: 'attack', rarity: 'uncommon', icon: 'bandaid',
    text: (u) => `Deal ${u ? 11 : 8}. Heal ${u ? 4 : 3}. ${T.cozy}.`,
    fx: (b, u) => { b.attack(u ? 11 : 8); b.heal(u ? 4 : 3, { cozy: true }); },
  },
  secondHelping: {
    arch: 'cozy', name: 'Second Helping', type: 'attack', rarity: 'uncommon', icon: 'bowl',
    text: (u) => `Deal damage equal to the ${T.hp} you have healed this fight (max 30)${u ? ' +6' : ''}.`,
    requires: (r, h) => h.deckCount(HEAL_CARDS) >= 2,
    needs: '2+ healing cards',
    fx: (b, u) => b.attack(Math.min(30, b.healedThisFight) + (u ? 6 : 0), { raw: true }),
  },
  sweetDreams: {
    arch: 'cozy', name: 'Sweet Dreams', type: 'power', rarity: 'rare', icon: 'moonStar',
    text: (u) => `${T.power}: whenever you heal, deal that much damage.${u ? ' Heal 4.' : ''}`,
    requires: (r, h) => h.deckHas(HEAL_CARDS),
    needs: 'a healing card',
    fx: (b, u) => { b.powers.sweetDreams = true; if (u) b.heal(4); },
  },
  // Exposed: stack Exposed and hit hard
  callOut: {
    arch: 'exposed', name: 'Call Out', type: 'attack', rarity: 'common', icon: 'megaphone',
    text: (u) => `Apply ${u ? 3 : 2} ${T.exposed}, then deal ${u ? 6 : 4}.`,
    fx: (b, u) => { b.applyEnemy('vuln', u ? 3 : 2); b.attack(u ? 6 : 4); },
  },
  pileOn: {
    arch: 'exposed', name: 'Pile On', type: 'attack', rarity: 'common', icon: 'stack',
    text: (u) => `Deal ${u ? 8 : 6}. If the enemy is ${T.exposed}, deal it again.`,
    fx: (b, u) => { const ex = b.enemy.vuln > 0; b.attack(u ? 8 : 6); if (ex) b.attack(u ? 8 : 6); },
  },
  snitch: {
    arch: 'exposed', arch2: 'memory', name: 'Snitch', type: 'skill', rarity: 'uncommon', icon: 'whisper',
    text: (u) => `Apply ${u ? 2 : 1} ${T.exposed}. Reveal ${u ? 3 : 2} hidden cards. ${T.block} ${u ? 6 : 4}.`,
    fx: (b, u) => { b.applyEnemy('vuln', u ? 2 : 1); b.reveal(u ? 3 : 2); b.gainBlock(u ? 6 : 4); },
  },
  roast: {
    arch: 'exposed', name: 'Roast', type: 'attack', rarity: 'uncommon', icon: 'chili',
    text: (u) => `Deal ${u ? 7 : 5}, +${u ? 4 : 3} for each ${T.exposed} on the enemy.`,
    requires: (r, h) => h.deckHas(EXPOSED_CARDS),
    needs: 'an Exposed card (Zap counts)',
    fx: (b, u) => b.attack((u ? 7 : 5) + (u ? 4 : 3) * b.enemy.vuln),
  },
  roastBattle: {
    arch: 'exposed', name: 'Roast Battle', type: 'power', rarity: 'rare', icon: 'crown',
    text: (u) => `${T.power}: ${T.exposed} on enemies no longer wears off.${u ? ` Apply 2 ${T.exposed}.` : ''}`,
    requires: (r, h) => h.deckHas(EXPOSED_CARDS),
    needs: 'an Exposed card (Zap counts)',
    fx: (b, u) => { b.powers.roast = true; if (u) b.applyEnemy('vuln', 2); },
  },

  // Hybrids: count toward two styles
  napTime: {
    arch: 'dreamy', arch2: 'cozy', name: 'Nap Time', type: 'skill', rarity: 'uncommon', icon: 'nap',
    text: (u) => `Heal ${u ? 4 : 3}, or ${u ? 9 : 7} if the enemy is ${T.asleep}. ${T.cozy}.`,
    fx: (b, u) => b.heal(b.enemy.asleep ? (u ? 9 : 7) : (u ? 4 : 3), { cozy: true }),
  },
  dreamJournal: {
    arch: 'dreamy', arch2: 'memory', name: 'Dream Journal', type: 'skill', rarity: 'common', icon: 'journal',
    text: (u) => `Apply ${u ? 2 : 1} ${T.sleepy}. Reveal 2 hidden cards.`,
    fx: (b, u) => { b.applyEnemy('weak', u ? 2 : 1); b.reveal(2); },
  },
  heckle: {
    arch: 'exposed', arch2: 'combo', name: 'Heckle', type: 'attack', rarity: 'common', icon: 'tomato',
    text: (u) => `Deal ${u ? 7 : 5}. Apply 1 ${T.exposed}. +1 ${T.combo}.`,
    fx: (b, u) => { b.attack(u ? 7 : 5); b.applyEnemy('vuln', 1); b.combo += 1; },
  },
  leak: {
    arch: 'exposed', arch2: 'glitch', name: 'Data Leak', type: 'skill', rarity: 'uncommon', icon: 'leak',
    text: (u) => `Apply ${u ? 3 : 2} ${T.exposed} and ${u ? 4 : 3} ${T.glitch}. ${T.block} ${u ? 6 : 4}.`,
    fx: (b, u) => { b.applyEnemy('vuln', u ? 3 : 2); b.applyEnemy('poison', u ? 4 : 3); b.gainBlock(u ? 6 : 4); },
  },

  // ---------- more style support (2 per style) ----------
  packetLoss: {
    arch: 'glitch', name: 'Packet Loss', type: 'skill', rarity: 'common', icon: 'packetLoss',
    text: (u) => `Apply ${u ? 3 : 2} ${T.glitch}. If the enemy already has ${T.glitch}, apply ${u ? 4 : 3} more.`,
    fx: (b, u) => { const had = b.enemy.poison > 0; b.applyEnemy('poison', u ? 3 : 2); if (had) b.applyEnemy('poison', u ? 4 : 3); },
  },
  pingFlood: {
    arch: 'glitch', name: 'Ping Flood', type: 'skill', rarity: 'uncommon', icon: 'ping',
    text: (u) => `${u ? `Apply 3 ${T.glitch}. ` : ''}Deal damage equal to the enemy's ${T.glitch}.`,
    requires: (r, h) => h.deckHas(GLITCH_CARDS),
    needs: `a ${T.glitch} card`,
    fx: (b, u) => { if (u) b.applyEnemy('poison', 3); if (b.enemy.poison > 0) b.attack(b.enemy.poison, { raw: true }); },
  },
  holdTheLine: {
    arch: 'guard', name: 'Hold the Line', type: 'skill', rarity: 'common', icon: 'barricade',
    text: (u) => `${T.block} ${u ? 5 : 4}, +${u ? 3 : 2} for each match this turn.`,
    fx: (b, u) => b.gainBlock((u ? 5 : 4) + (u ? 3 : 2) * b.matchesThisTurn),
  },
  bodyguard: {
    arch: 'guard', name: 'Bodyguard', type: 'skill', rarity: 'uncommon', icon: 'bodyguard',
    text: (u) => `${T.block} ${u ? 9 : 6}. Gain ${u ? 3 : 2} ${T.spikes}.`,
    fx: (b, u) => { b.gainBlock(u ? 9 : 6); b.applyPlayer('thorns', u ? 3 : 2); },
  },
  warmUp: {
    arch: 'combo', name: 'Warm-Up', type: 'skill', rarity: 'common', icon: 'sneaker',
    text: (u) => `+${u ? 3 : 2} ${T.combo}. ${T.block} 3.`,
    fx: (b, u) => { b.combo += u ? 3 : 2; b.gainBlock(3); },
  },
  finisher: {
    arch: 'combo', name: 'Finisher', type: 'attack', rarity: 'uncommon', icon: 'burst',
    text: (u) => `Deal ${u ? 4 : 3} for each ${T.combo}, then your ${T.combo} goes back to 0.`,
    fx: (b, u) => { b.attack((u ? 4 : 3) * b.combo); b.combo = 0; },
  },
  flashcards: {
    arch: 'memory', name: 'Flashcards', type: 'attack', rarity: 'common', icon: 'flashcards',
    text: (u) => `Deal ${u ? 7 : 5}. Reveal ${u ? 2 : 1}.`,
    fx: (b, u) => { b.attack(u ? 7 : 5); b.reveal(u ? 2 : 1); },
  },
  totalRecall: {
    arch: 'memory', name: 'Total Recall', type: 'skill', rarity: 'uncommon', icon: 'bulb',
    text: (u) => `+1 ${T.energy} for every ${u ? 2 : 3} face-up cards on the board (max 3).`,
    fx: (b, u) => { const n = Math.min(3, Math.floor(b.board.filter((s) => s.state === 'revealed').length / (u ? 2 : 3))); if (n) b.gainEnergy(n); },
  },
  warmBlanket: {
    arch: 'dreamy', name: 'Warm Blanket', type: 'skill', rarity: 'common', icon: 'blanket',
    text: (u) => `${T.block} ${u ? 8 : 6}, or ${u ? 15 : 12} if the enemy is ${T.asleep}.`,
    fx: (b, u) => b.gainBlock(b.enemy.asleep ? (u ? 15 : 12) : (u ? 8 : 6)),
  },
  sandman: {
    arch: 'dreamy', name: 'Sandman', type: 'skill', rarity: 'uncommon', icon: 'sandbag',
    text: (u) => `Apply 1 ${T.sleepy} for each match this turn${u ? ', +1' : ''} (max ${u ? 5 : 4}).`,
    fx: (b, u) => b.applyEnemy('weak', Math.min(u ? 5 : 4, b.matchesThisTurn + (u ? 1 : 0))),
  },
  spoonful: {
    arch: 'cozy', name: 'Spoonful', type: 'attack', rarity: 'common', icon: 'spoon',
    text: (u) => `Deal ${u ? 7 : 5}. Heal ${u ? 3 : 2}. ${T.cozy}.`,
    fx: (b, u) => { b.attack(u ? 7 : 5); b.heal(u ? 3 : 2, { cozy: true }); },
  },
  selfCare: {
    arch: 'cozy', name: 'Self Care', type: 'power', rarity: 'uncommon', icon: 'candle',
    text: (u) => `${T.power}: heal ${u ? 3 : 2} at the start of each turn. ${T.cozy}.`,
    fx: (b, u) => { b.powers.selfCare += u ? 3 : 2; },
  },
  screenshot: {
    arch: 'exposed', name: 'Screenshot', type: 'skill', rarity: 'common', icon: 'screenshot',
    text: (u) => `Apply ${u ? 3 : 2} ${T.exposed}. ${T.block} ${u ? 5 : 4}.`,
    fx: (b, u) => { b.applyEnemy('vuln', u ? 3 : 2); b.gainBlock(u ? 5 : 4); },
  },
  spillTea: {
    arch: 'exposed', name: 'Spill the Tea', type: 'skill', rarity: 'uncommon', icon: 'spillTea',
    text: (u) => `Apply ${T.exposed} equal to your ${T.combo} (max ${u ? 6 : 4}).`,
    fx: (b, u) => b.applyEnemy('vuln', Math.min(u ? 6 : 4, b.combo)),
  },

  // ---------- more hybrids ----------
  sleepMode: {
    arch: 'glitch', arch2: 'dreamy', name: 'Sleep Mode', type: 'skill', rarity: 'common', icon: 'sleepMode',
    text: (u) => `Apply ${u ? 2 : 1} ${T.sleepy} and ${u ? 4 : 3} ${T.glitch}.`,
    fx: (b, u) => { b.applyEnemy('weak', u ? 2 : 1); b.applyEnemy('poison', u ? 4 : 3); },
  },
  comboMeal: {
    arch: 'combo', arch2: 'cozy', name: 'Combo Meal', type: 'attack', rarity: 'common', icon: 'bento',
    text: (u) => `Deal ${u ? 6 : 4}. Heal 1 for each ${T.combo} (max ${u ? 8 : 6}). ${T.cozy}.`,
    fx: (b, u) => { b.attack(u ? 6 : 4); b.heal(Math.min(u ? 8 : 6, b.combo), { cozy: true }); },
  },
  firewall: {
    arch: 'glitch', arch2: 'guard', name: 'Firewall', type: 'skill', rarity: 'common', icon: 'firewall',
    text: (u) => `${T.block} ${u ? 8 : 6}. Apply ${u ? 3 : 2} ${T.glitch}.`,
    fx: (b, u) => { b.gainBlock(u ? 8 : 6); b.applyEnemy('poison', u ? 3 : 2); },
  },
  wakeUpCall: {
    arch: 'dreamy', arch2: 'exposed', name: 'Wake-Up Call', type: 'attack', rarity: 'uncommon', icon: 'alarm',
    text: (u) => `If the enemy is ${T.asleep}, apply ${u ? 4 : 3} ${T.exposed} first. Deal ${u ? 11 : 8}.`,
    fx: (b, u) => { if (b.enemy.asleep) b.applyEnemy('vuln', u ? 4 : 3); b.attack(u ? 11 : 8); },
  },
  photoAlbum: {
    arch: 'memory', arch2: 'cozy', name: 'Photo Album', type: 'skill', rarity: 'common', icon: 'polaroid',
    text: (u) => `Heal ${u ? 4 : 3}. Reveal ${u ? 3 : 2}. ${T.cozy}.`,
    fx: (b, u) => { b.heal(u ? 4 : 3, { cozy: true }); b.reveal(u ? 3 : 2); },
  },
  speedReader: {
    arch: 'memory', arch2: 'combo', name: 'Speed Reader', type: 'skill', rarity: 'uncommon', icon: 'speedBook',
    text: (u) => `Reveal ${u ? 3 : 2}. +2 ${T.combo}.${u ? ` +1 ${T.energy}.` : ''}`,
    fx: (b, u) => { b.reveal(u ? 3 : 2); b.combo += 2; if (u) b.gainEnergy(1); },
  },

  // ---------- more rares (so every style has 3+, and boss rewards have room to lean in) ----------
  systemCrash: {
    arch: 'glitch', name: 'System Crash', type: 'attack', rarity: 'rare', icon: 'crash',
    text: (u) => `Deal ${u ? 'three times' : 'twice'} the enemy's ${T.glitch}.`,
    requires: (r, h) => h.deckHas(GLITCH_CARDS), needs: `a ${T.glitch} card`,
    fx: (b, u) => b.attack(b.enemy.poison * (u ? 3 : 2), { raw: true }),
  },
  botnet: {
    arch: 'glitch', name: 'Botnet', type: 'power', rarity: 'rare', icon: 'botnet',
    text: (u) => `${T.power}: every pair you match applies ${u ? 2 : 1} ${T.glitch}.`,
    fx: (b, u) => { b.powers.botnet += u ? 2 : 1; },
  },
  sleepwalk: {
    arch: 'dreamy', name: 'Sleepwalk', type: 'power', rarity: 'rare', icon: 'sleepwalk',
    text: (u) => `${T.power}: whenever an enemy falls ${T.asleep}, +2 ${T.energy}.${u ? ` Apply 2 ${T.sleepy}.` : ''}`,
    fx: (b, u) => { b.powers.sleepwalk = true; if (u) b.applyEnemy('weak', 2); },
  },
  sandstorm: {
    arch: 'dreamy', name: 'Sandstorm', type: 'skill', rarity: 'rare', icon: 'sandstorm', exhaust: true,
    text: (u) => `Apply ${u ? 7 : 5} ${T.sleepy}. ${T.exhaust}.`,
    fx: (b, u) => b.applyEnemy('weak', u ? 7 : 5),
  },
  hotPot: {
    arch: 'cozy', name: 'Hot Pot', type: 'attack', rarity: 'rare', icon: 'hotPot',
    text: (u) => `Deal ${u ? 14 : 10}. Heal ${u ? 12 : 8}. ${T.cozy}.`,
    fx: (b, u) => { b.attack(u ? 14 : 10); b.heal(u ? 12 : 8, { cozy: true }); },
  },
  comfortZone: {
    arch: 'cozy', name: 'Comfort Zone', type: 'power', rarity: 'rare', icon: 'comfort',
    text: (u) => `${T.power}: whenever you heal, gain that much ${T.block} (max ${u ? 10 : 6} each time).`,
    fx: (b, u) => { b.powers.comfort = Math.max(b.powers.comfort, u ? 10 : 6); },
  },
  leakedDMs: {
    arch: 'exposed', name: 'Leaked DMs', type: 'skill', rarity: 'rare', icon: 'dms',
    text: (u) => `Double the enemy's ${T.exposed}${u ? `, then apply 2 more` : ''}. ${T.block} 6.`,
    fx: (b, u) => { b.applyEnemy('vuln', b.enemy.vuln); if (u) b.applyEnemy('vuln', 2); b.gainBlock(6); },
  },
  hotTake: {
    arch: 'exposed', name: 'Hot Take', type: 'attack', rarity: 'rare', icon: 'hotTake',
    text: (u) => `Deal ${u ? 8 : 6} three times.`,
    fx: (b, u) => { for (let i = 0; i < 3; i++) b.attack(u ? 8 : 6); },
  },
  framePerfect: {
    arch: 'combo', name: 'Frame Perfect', type: 'skill', rarity: 'rare', icon: 'frame',
    text: (u) => `Double your ${T.combo}.${u ? ` +1 ${T.energy}.` : ''}`,
    fx: (b, u) => { b.combo *= 2; if (u) b.gainEnergy(1); },
  },
  panicRoom: {
    arch: 'guard', name: 'Panic Room', type: 'skill', rarity: 'rare', icon: 'panic', exhaust: true,
    text: (u) => `${T.block} ${u ? 28 : 20}. ${T.exhaust}.`,
    fx: (b, u) => b.gainBlock(u ? 28 : 20),
  },
  eidetic: {
    arch: 'memory', name: 'Eidetic Memory', type: 'power', rarity: 'rare', icon: 'eidetic',
    text: (u) => `${T.power}: whenever you reveal cards, gain ${u ? 2 : 1} ${T.block} per card.`,
    fx: (b, u) => { b.powers.eidetic += u ? 2 : 1; },
  },
  feverDream: {
    arch: 'glitch', arch2: 'dreamy', name: 'Fever Dream', type: 'skill', rarity: 'rare', icon: 'fever', exhaust: true,
    text: (u) => `Apply ${u ? 4 : 3} ${T.sleepy} and ${u ? 8 : 6} ${T.glitch}. ${T.exhaust}.`,
    fx: (b, u) => { b.applyEnemy('weak', u ? 4 : 3); b.applyEnemy('poison', u ? 8 : 6); },
  },
  toughLove: {
    arch: 'cozy', arch2: 'exposed', name: 'Tough Love', type: 'attack', rarity: 'rare', icon: 'toughLove',
    text: (u) => `Apply 2 ${T.exposed}. Deal ${u ? 13 : 10}. Heal ${u ? 6 : 4}. ${T.cozy}.`,
    fx: (b, u) => { b.applyEnemy('vuln', 2); b.attack(u ? 13 : 10); b.heal(u ? 6 : 4, { cozy: true }); },
  },

  // ---------- event only: never in card rewards or shops ----------
  sheepStampede: {
    arch: 'dreamy', name: 'Sheep Stampede', type: 'attack', rarity: 'event', icon: 'stampede',
    text: (u) => `Deal ${u ? 6 : 4} twice. Apply 2 ${T.sleepy}.`,
    fx: (b, u) => { b.attack(u ? 6 : 4); b.attack(u ? 6 : 4); b.applyEnemy('weak', 2); },
  },
  dumplings: {
    arch: 'cozy', name: "Grandma's Dumplings", type: 'skill', rarity: 'event', icon: 'dumpling', exhaust: true,
    text: (u) => `Heal ${u ? 12 : 8}. ${T.cozy}. ${T.exhaust}.`,
    fx: (b, u) => b.heal(u ? 12 : 8, { cozy: true }),
  },
  zeroDay: {
    arch: 'glitch', name: 'Zero Day', type: 'attack', rarity: 'event', icon: 'zeroDay',
    text: (u) => `Deal 5. Apply ${u ? 6 : 4} ${T.glitch}.`,
    fx: (b, u) => { b.attack(5); b.applyEnemy('poison', u ? 6 : 4); },
  },
  velvetRope: {
    arch: 'guard', name: 'Velvet Rope', type: 'skill', rarity: 'event', icon: 'rope',
    text: (u) => `${T.block} ${u ? 12 : 9}. Gain 2 ${T.spikes}.`,
    fx: (b, u) => { b.gainBlock(u ? 12 : 9); b.applyPlayer('thorns', 2); },
  },
  dejaVu: {
    arch: 'memory', name: 'Déjà Vu', type: 'skill', rarity: 'event', icon: 'loop',
    text: (u) => `Reveal ${u ? 6 : 4} hidden cards. +1 ${T.energy}.`,
    fx: (b, u) => { b.reveal(u ? 6 : 4); b.gainEnergy(1); },
  },
  perfectChain: {
    arch: 'combo', name: 'Perfect Chain', type: 'attack', rarity: 'event', icon: 'chain',
    text: (u) => `Deal ${u ? 8 : 5}. +2 ${T.combo}.`,
    fx: (b, u) => { b.attack(u ? 8 : 5); b.combo += 2; },
  },
  ratiod: {
    arch: 'exposed', name: "Ratio'd", type: 'attack', rarity: 'event', icon: 'ratio',
    text: (u) => `Apply 2 ${T.exposed}, then deal ${u ? 10 : 7}.`,
    fx: (b, u) => { b.applyEnemy('vuln', 2); b.attack(u ? 10 : 7); },
  },
  teamUp: {
    arch: 'combo', arch2: 'guard', name: 'Team-Up', type: 'attack', rarity: 'event', icon: 'team',
    text: (u) => `Deal ${u ? 8 : 6}. ${T.block} ${u ? 8 : 6}.`,
    fx: (b, u) => { b.attack(u ? 8 : 6); b.gainBlock(u ? 8 : 6); },
  },
  powerBallad: {
    name: 'Power Ballad', type: 'attack', rarity: 'event', icon: 'guitar', exhaust: true,
    text: (u) => `Deal ${u ? 20 : 14}. ${T.exhaust}.`,
    fx: (b, u) => b.attack(u ? 20 : 14),
  },

  // ---------- legendary: one per style, offered by the Legendary Pull event from Floor 2 ----------
  // You can only own one legendary card. See LEGENDARY in loot.js for the odds.
  hacked: {
    arch: 'glitch', name: 'Hacked', type: 'power', rarity: 'legendary', icon: 'lgHacked',
    text: (u) => `${T.power}: ${u ? `apply 5 ${T.glitch}, then ` : ''}double the enemy's ${T.glitch}. ${T.glitch} no longer goes down.`,
    fx: (b, u) => { if (u) b.applyEnemy('poison', 5); b.powers.hacked = true; b.applyEnemy('poison', b.enemy.poison); },
  },
  riotShield: {
    arch: 'guard', name: 'Riot Shield', type: 'power', rarity: 'legendary', icon: 'lgRiot',
    text: (u) => `${T.power}: ${T.block} no longer resets. Whenever you gain ${T.block}, deal half of it.${u ? ` ${T.block} 10.` : ''}`,
    fx: (b, u) => { b.powers.fortress = true; b.powers.riot = true; if (u) b.gainBlock(10); },
  },
  gameTime: {
    arch: 'combo', name: 'Game Time', type: 'power', rarity: 'legendary', icon: 'lgGameTime',
    text: (u) => `${T.power}: misses no longer reset your ${T.combo}. Every match adds 1 more ${T.combo}.${u ? ` +3 ${T.combo}.` : ''}`,
    fx: (b, u) => { b.powers.gameTime = true; if (u) b.combo += 3; },
  },
  mindCastle: {
    arch: 'memory', name: 'Mind Castle', type: 'power', rarity: 'legendary', icon: 'lgMindCastle',
    text: (u) => `${T.power}: every 2nd pair you match gives +1 ${T.energy}.${u ? ' Reveal 4.' : ''}`,
    fx: (b, u) => { b.powers.mindCastle = true; b.powers.castleCount = 0; if (u) b.reveal(4); },
  },
  nightmare: {
    arch: 'dreamy', name: 'Nightmare', type: 'attack', rarity: 'legendary', icon: 'lgNightmare',
    text: (u) => `Eat all the enemy's ${T.sleepy} (if ${T.asleep}: wake it, eat what put it to sleep). Per ${T.sleepy}: deal ${u ? 8 : 6}, heal ${u ? 4 : 3}.`,
    fx: (b, u) => b.nightmare(u ? 8 : 6, u ? 4 : 3),
  },
  healBurn: {
    arch: 'cozy', name: 'Heal Burn', type: 'power', rarity: 'legendary', icon: 'lgHealBurn',
    text: (u) => `${T.power}: whenever you heal, deal twice that much to the enemy. Heal ${u ? 18 : 12}.`,
    fx: (b, u) => { b.powers.healBurn = true; b.heal(u ? 18 : 12); },
  },
  cancelled: {
    arch: 'exposed', name: 'Cancelled', type: 'power', rarity: 'legendary', icon: 'lgCancelled',
    text: (u) => `${T.power}: apply ${u ? 6 : 4} ${T.exposed}. ${T.exposed} never wears off, and ${T.exposed} enemies take double damage.`,
    fx: (b, u) => { b.powers.roast = true; b.powers.cancelled = true; b.applyEnemy('vuln', u ? 6 : 4); },
  },

  // Neutral legendaries: no style. Offered by the Lost and Found event; you can own one
  // of these on top of your style legendary.
  infiniteBattery: {
    name: 'Infinite Battery', type: 'power', rarity: 'legendary', icon: 'infBattery', neutral: true,
    text: (u) => `${T.power}: +2 ${T.energy} at the start of each turn.${u ? ` +2 now.` : ''}`,
    fx: (b, u) => { b.powers.energy += 2; if (u) b.gainEnergy(2); },
  },
  plotArmor: {
    name: 'Plot Armor', type: 'power', rarity: 'legendary', icon: 'plotArmor', neutral: true,
    text: (u) => `${T.power}: enemies deal ${u ? 40 : 30}% less damage to you.`,
    fx: (b, u) => { b.powers.plotArmor = Math.max(b.powers.plotArmor, u ? 0.4 : 0.3); },
  },
  galaxyBrain: {
    name: 'Galaxy Brain', type: 'power', rarity: 'legendary', icon: 'galaxyBrain', neutral: true,
    text: (u) => `${T.power}: reveal ${u ? 4 : 3} hidden cards now and at the start of each turn.`,
    fx: (b, u) => { b.powers.galaxy += u ? 4 : 3; b.reveal(u ? 4 : 3, true, true); },
  },
  mainCharacter: {
    name: 'Main Character', type: 'power', rarity: 'legendary', icon: 'mainChar', neutral: true,
    text: (u) => `${T.power}: every pair you match also deals ${u ? 6 : 4} damage.`,
    fx: (b, u) => { b.powers.mainChar += u ? 6 : 4; },
  },

  // ---------- guardian gifts: only come with a guardian's charm (see `gives` in charms.js) ----------
  zoomie: {
    arch: 'combo', name: 'Zoomie', type: 'attack', rarity: 'gift', icon: 'zoom',
    text: (u) => `Deal ${u ? 6 : 4}. +1 ${T.combo}. Reveal ${u ? 2 : 1}.`,
    fx: (b, u) => { b.attack(u ? 6 : 4); b.combo += 1; b.reveal(u ? 2 : 1); },
  },
  snuggle: {
    arch: 'dreamy', name: 'Snuggle', type: 'skill', rarity: 'gift', icon: 'teddy',
    text: (u) => `${T.block} ${u ? 9 : 6}. Apply 2 ${T.sleepy}.`,
    fx: (b, u) => { b.gainBlock(u ? 9 : 6); b.applyEnemy('weak', 2); },
  },
  bark: {
    arch: 'exposed', name: 'Bark', type: 'skill', rarity: 'gift', icon: 'paw',
    text: (u) => `Apply ${u ? 3 : 2} ${T.exposed}. Reveal ${u ? 2 : 1}.`,
    fx: (b, u) => { b.applyEnemy('vuln', u ? 3 : 2); b.reveal(u ? 2 : 1); },
  },
  sushiRoll: {
    name: 'Sushi Roll', type: 'attack', rarity: 'gift', icon: 'sushi',
    text: (u) => `Deal ${u ? 10 : 7}. +1 ${T.energy}.`,
    fx: (b, u) => { b.attack(u ? 10 : 7); b.gainEnergy(1); },
  },

  prank: {
    arch: 'exposed', arch2: 'glitch', name: 'Prank', type: 'skill', rarity: 'gift', icon: 'prank',
    text: (u) => `Apply ${u ? 3 : 2} ${T.exposed} and ${u ? 4 : 3} ${T.glitch}.`,
    fx: (b, u) => { b.applyEnemy('vuln', u ? 3 : 2); b.applyEnemy('poison', u ? 4 : 3); },
  },
  loveNote: {
    arch: 'cozy', arch2: 'guard', name: 'Love Note', type: 'skill', rarity: 'gift', icon: 'loveNote',
    text: (u) => `Heal ${u ? 8 : 6}. ${T.block} ${u ? 8 : 6}. +1 ${T.energy}.`,
    fx: (b, u) => { b.heal(u ? 8 : 6); b.gainBlock(u ? 8 : 6); b.gainEnergy(1); },
  },
  heartSticker: {
    arch: 'cozy', name: 'Heart Sticker', type: 'attack', rarity: 'gift', icon: 'sticker',
    text: (u) => `Deal ${u ? 9 : 6}. Heal ${u ? 4 : 3}.`,
    fx: (b, u) => { b.attack(u ? 9 : 6); b.heal(u ? 4 : 3); },
  },

  // ---------- status (added by enemies, gone after the fight) ----------
  bug: {
    name: 'Bug', type: 'status', rarity: 'status', icon: 'bug', exhaust: true,
    text: () => 'Matching this hurts you for 3.',
    fx: (b) => b.selfDamage(3),
  },
  lag: {
    name: 'Lag', type: 'status', rarity: 'status', icon: 'hourglass', exhaust: true,
    text: () => `Matching this costs 1 ${T.energy}.`,
    fx: (b) => b.gainEnergy(-1),
  },
  spam: {
    name: 'Spam', type: 'status', rarity: 'status', icon: 'mail', exhaust: true,
    text: () => 'Does nothing. Just clutter.',
    fx: () => {},
  },
  // Curse: stays in your deck until removed at a shop.
  static: {
    name: 'Static', type: 'status', rarity: 'curse', icon: 'static',
    text: () => 'Curse. Does nothing. Remove it at a shop.',
    fx: () => {},
  },
  // Climb level 9: a curse you can clear out for the fight by matching it (it exhausts),
  // but it costs a pair's energy and comes back next fight.
  leftovers: {
    name: 'Leftovers', type: 'status', rarity: 'curse', icon: 'takeout', exhaust: true,
    text: () => 'Curse. Does nothing. Exhaust. Remove it at a shop.',
    fx: () => {},
  },
};

export const ARCHES = {
  glitch: { name: 'Glitch', color: '#4f8a55', desc: `Stack ${T.glitch} and let it tick the enemy down.` },
  guard: { name: 'Guard', color: '#4a6fa5', desc: `Pile up ${T.block} and hit back with it.` },
  combo: { name: 'Combo', color: '#d2493f', desc: `Chain matches for big ${T.combo} damage.` },
  memory: { name: 'Memory', color: '#7a5ab3', desc: 'Reveal cards and never miss.' },
  dreamy: { name: 'Dreamy', color: '#5b6fc9', desc: `Build ${T.sleepy} until the enemy falls ${T.asleep}.` },
  cozy: { name: 'Cozy', color: '#d9822b', desc: 'Heal up, and turn extra healing into damage.' },
  exposed: { name: 'Exposed', color: '#c2417a', desc: `Stack ${T.exposed} and hit where it hurts.` },
};


export function cardName(c) {
  return CARDS[c.id].name + (c.up ? '+' : '');
}
export function cardText(c) {
  return CARDS[c.id].text(!!c.up);
}


export function canUpgrade(c) {
  const r = CARDS[c.id].rarity;
  return !c.up && r !== 'status' && r !== 'curse';
}

export const NEUTRAL_LEGENDARIES = Object.keys(CARDS).filter((id) => CARDS[id].rarity === 'legendary' && CARDS[id].neutral);
export const LEGENDARY_OF = Object.fromEntries(Object.entries(CARDS).filter(([, d]) => d.rarity === 'legendary' && d.arch).map(([id, d]) => [d.arch, id]));
