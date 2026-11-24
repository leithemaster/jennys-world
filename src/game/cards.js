// Every card in Spire Match. Each card in your deck appears on the board as a
// pair; matching two of the same card plays it.
//
// type: attack | skill | power | status
// rarity: starter | common | uncommon | rare | status
// fx(b, up) runs the effect inside a Battle (b); `up` is true when upgraded.

export const CARDS = {
  // ---------- starter ----------
  slash: {
    name: 'Slash', type: 'attack', rarity: 'starter', icon: 'blade',
    text: (u) => `Deal ${u ? 9 : 6}.`,
    fx: (b, u) => b.attack(u ? 9 : 6),
  },
  guard: {
    name: 'Guard', type: 'skill', rarity: 'starter', icon: 'shield',
    text: (u) => `Block ${u ? 8 : 5}.`,
    fx: (b, u) => b.gainBlock((u ? 8 : 5) + (b.has('fuzzySocks') ? 3 : 0)),
  },
  zap: {
    name: 'Zap', type: 'attack', rarity: 'starter', icon: 'bolt',
    text: (u) => `Deal ${u ? 10 : 7}. Apply ${u ? 2 : 1} Exposed.`,
    fx: (b, u) => { b.attack(u ? 10 : 7); b.applyEnemy('vuln', u ? 2 : 1); },
  },
  boba: {
    name: 'Boba', type: 'skill', rarity: 'starter', icon: 'cup',
    text: (u) => `+${u ? 3 : 2} energy.`,
    fx: (b, u) => b.gainEnergy(u ? 3 : 2),
  },

  // ---------- common ----------
  twinCut: {
    name: 'Twin Cut', type: 'attack', rarity: 'common', icon: 'twin',
    text: (u) => `Deal ${u ? 5 : 4} twice.`,
    fx: (b, u) => { b.attack(u ? 5 : 4); b.attack(u ? 5 : 4); },
  },
  bigSwing: {
    name: 'Big Swing', type: 'attack', rarity: 'common', icon: 'hammer',
    text: (u) => `Deal ${u ? 17 : 13}.`,
    fx: (b, u) => b.attack(u ? 17 : 13),
  },
  stinger: {
    arch: 'glitch',
    name: 'Stinger', type: 'attack', rarity: 'common', icon: 'drop',
    text: (u) => `Deal 3. Apply ${u ? 6 : 4} Glitch.`,
    fx: (b, u) => { b.attack(3); b.applyEnemy('poison', u ? 6 : 4); },
  },
  hoodieUp: {
    arch: 'guard',
    name: 'Hoodie Up', type: 'skill', rarity: 'common', icon: 'hood',
    text: (u) => `Block ${u ? 13 : 9}.`,
    fx: (b, u) => b.gainBlock((u ? 13 : 9) + (b.has('fuzzySocks') ? 3 : 0)),
  },
  peek: {
    arch: 'memory',
    name: 'Peek', type: 'skill', rarity: 'common', icon: 'eye',
    text: (u) => `Reveal ${u ? 4 : 2} hidden cards. Block 3.`,
    fx: (b, u) => { b.reveal(u ? 4 : 2); b.gainBlock(3); },
  },
  trip: {
    arch: 'guard',
    name: 'Trip', type: 'skill', rarity: 'common', icon: 'swirl',
    text: (u) => `Apply ${u ? 3 : 2} Sleepy. Block ${u ? 5 : 3}.`,
    fx: (b, u) => { b.applyEnemy('weak', u ? 3 : 2); b.gainBlock(u ? 5 : 3); },
  },
  comboKick: {
    arch: 'combo',
    name: 'Combo Kick', type: 'attack', rarity: 'common', icon: 'star',
    text: (u) => `Deal 4, +${u ? 5 : 3} for each combo.`,
    fx: (b, u) => b.attack(4 + (u ? 5 : 3) * b.combo),
  },
  snack: {
    name: 'Onigiri', type: 'skill', rarity: 'common', icon: 'rice',
    text: (u) => `Heal ${u ? 6 : 4}. Exhaust.`,
    exhaust: true,
    fx: (b, u) => b.heal(u ? 6 : 4),
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
    text: (u) => `Deal damage equal to your Block${u ? ' +5' : ''}.`,
    requires: (r, h) => h.deckCount(['guard', 'hoodieUp', 'trip', 'peek', 'memoryLane']) >= 3,
    fx: (b, u) => b.attack(b.player.block + (u ? 5 : 0), { raw: true }),
  },
  catalyst: {
    arch: 'glitch',
    name: 'Catalyst', type: 'skill', rarity: 'uncommon', icon: 'flask',
    text: (u) => `${u ? 'Triple' : 'Double'} the enemy's Glitch.`,
    requires: (r, h) => h.deckHas(['stinger', 'virusUpload', 'lagSpike', 'malware']),
    fx: (b, u) => b.applyEnemy('poison', b.enemy.poison * (u ? 2 : 1)),
  },
  memoryLane: {
    arch: 'memory',
    name: 'Memory Lane', type: 'skill', rarity: 'uncommon', icon: 'film',
    text: (u) => `Show every card for a moment. Block ${u ? 8 : 4}.`,
    fx: (b, u) => { b.flash(); b.gainBlock(u ? 8 : 4); },
  },
  momentum: {
    arch: 'combo',
    name: 'Momentum', type: 'skill', rarity: 'uncommon', icon: 'arrow',
    text: (u) => `+1 energy. Your next miss this turn keeps your combo.${u ? ' Block 4.' : ''}`,
    fx: (b, u) => { b.gainEnergy(1); b.flags.keepCombo = true; if (u) b.gainBlock(4); },
  },
  spikyJacket: {
    name: 'Spiky Jacket', type: 'power', rarity: 'uncommon', icon: 'spike',
    text: (u) => `Power: when hit, deal ${u ? 5 : 3} back.`,
    fx: (b, u) => b.applyPlayer('thorns', u ? 5 : 3),
  },
  energyDrink: {
    name: 'Energy Drink', type: 'power', rarity: 'uncommon', icon: 'can',
    text: (u) => `Power: +1 energy each turn.${u ? ' +1 now.' : ''}`,
    fx: (b, u) => { b.powers.energy += 1; if (u) b.gainEnergy(1); },
  },
  hype: {
    name: 'Hype', type: 'power', rarity: 'uncommon', icon: 'fire',
    text: (u) => `Power: gain ${u ? 3 : 2} Strength.`,
    fx: (b, u) => b.applyPlayer('strength', u ? 3 : 2),
  },

  // ---------- rare ----------
  finalBoss: {
    name: 'Critical Hit', type: 'attack', rarity: 'rare', icon: 'crit',
    text: (u) => `Deal ${u ? 40 : 30}. Exhaust.`,
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
    text: (u) => `Power: Block no longer resets.${u ? ' Block 10.' : ''}`,
    requires: (r, h) => h.deckCount(['guard', 'hoodieUp', 'trip', 'peek', 'memoryLane']) >= 3,
    fx: (b, u) => { b.powers.fortress = true; if (u) b.gainBlock(10); },
  },
  photographic: {
    arch: 'memory',
    name: 'Photo Memory', type: 'power', rarity: 'rare', icon: 'camera',
    text: (u) => `Power: your first miss each turn is free.${u ? ' Reveal 2.' : ''}`,
    fx: (b, u) => { b.powers.freeMiss = true; if (u) b.reveal(2); },
  },
  overclock: {
    name: 'Overclock', type: 'skill', rarity: 'rare', icon: 'chip',
    text: (u) => `+${u ? 4 : 3} energy. Take 3 damage.`,
    fx: (b, u) => { b.gainEnergy(u ? 4 : 3); b.selfDamage(3); },
  },

  // ---------- play-style cards ----------
  // Glitch
  virusUpload: {
    arch: 'glitch', name: 'Virus Upload', type: 'skill', rarity: 'common', icon: 'drop',
    text: (u) => `Apply ${u ? 9 : 6} Glitch.`,
    fx: (b, u) => b.applyEnemy('poison', u ? 9 : 6),
  },
  lagSpike: {
    arch: 'glitch', name: 'Lag Spike', type: 'skill', rarity: 'common', icon: 'hourglass',
    text: (u) => `Apply ${u ? 4 : 3} Glitch. Block ${u ? 6 : 4}.`,
    fx: (b, u) => { b.applyEnemy('poison', u ? 4 : 3); b.gainBlock(u ? 6 : 4); },
  },
  corrupt: {
    arch: 'glitch', name: 'Corrupt', type: 'attack', rarity: 'uncommon', icon: 'static',
    text: (u) => `Deal damage equal to the enemy's Glitch${u ? ' +6' : ''}.`,
    requires: (r, h) => h.deckCount(['stinger', 'virusUpload', 'lagSpike', 'catalyst', 'malware']) >= 1,
    fx: (b, u) => b.attack(b.enemy.poison + (u ? 6 : 0), { raw: true }),
  },
  malware: {
    arch: 'glitch', name: 'Malware', type: 'power', rarity: 'rare', icon: 'bug',
    text: (u) => `Power: apply ${u ? 4 : 3} Glitch at the start of each turn.`,
    fx: (b, u) => { b.powers.malware += u ? 4 : 3; },
  },
  // Guard
  bubbleWrap: {
    arch: 'guard', name: 'Bubble Wrap', type: 'skill', rarity: 'common', icon: 'shield',
    text: (u) => `Block ${u ? 8 : 6}. If you already have Block, +${u ? 5 : 4} more.`,
    fx: (b, u) => b.gainBlock((u ? 8 : 6) + (b.player.block > 0 ? (u ? 5 : 4) : 0)),
  },
  payback: {
    arch: 'guard', name: 'Payback', type: 'attack', rarity: 'uncommon', icon: 'shieldHit',
    text: (u) => `Block ${u ? 7 : 5}. Deal ${u ? 7 : 5}.`,
    fx: (b, u) => { b.gainBlock(u ? 7 : 5); b.attack(u ? 7 : 5); },
  },
  ironHoodie: {
    arch: 'guard', name: 'Iron Hoodie', type: 'power', rarity: 'rare', icon: 'hood',
    text: (u) => `Power: gain ${u ? 5 : 3} Block at the start of each turn.`,
    fx: (b, u) => { b.powers.armor += u ? 5 : 3; },
  },
  // Combo
  encore: {
    arch: 'combo', name: 'Encore', type: 'attack', rarity: 'common', icon: 'star',
    text: (u) => `Deal ${u ? 7 : 5}. +1 combo.`,
    fx: (b, u) => { b.attack(u ? 7 : 5); b.combo += 1; },
  },
  hotStreak: {
    arch: 'combo', name: 'Hot Streak', type: 'attack', rarity: 'uncommon', icon: 'fire',
    text: (u) => `Deal ${u ? 8 : 6}. If combo is 3+, +1 energy.`,
    fx: (b, u) => { b.attack(u ? 8 : 6); if (b.combo >= 3) b.gainEnergy(1); },
  },
  groove: {
    arch: 'combo', name: 'Groove', type: 'power', rarity: 'rare', icon: 'arrow',
    text: (u) => `Power: a miss only halves your combo.${u ? ' +1 energy.' : ''}`,
    fx: (b, u) => { b.powers.groove = true; if (u) b.gainEnergy(1); },
  },
  // Memory
  cheatSheet: {
    arch: 'memory', name: 'Cheat Sheet', type: 'skill', rarity: 'common', icon: 'eye',
    text: (u) => `Reveal ${u ? 5 : 3} hidden cards.`,
    fx: (b, u) => b.reveal(u ? 5 : 3),
  },
  spotlight: {
    arch: 'memory', name: 'Spotlight', type: 'power', rarity: 'uncommon', icon: 'camera',
    text: (u) => `Power: matching a revealed card deals ${u ? 6 : 4}.`,
    fx: (b, u) => { b.powers.spotlight += u ? 6 : 4; },
  },
  dejaVu: {
    arch: 'memory', name: 'Déjà Vu', type: 'skill', rarity: 'rare', icon: 'film',
    text: (u) => `Reveal every card on the board.${u ? ' +1 energy.' : ''} Exhaust.`,
    exhaust: true,
    fx: (b, u) => { b.reveal(99); if (u) b.gainEnergy(1); },
  },

  // ---------- status (added by enemies, gone after the fight) ----------
  bug: {
    name: 'Bug', type: 'status', rarity: 'status', icon: 'bug', exhaust: true,
    text: () => 'Matching this hurts you for 3.',
    fx: (b) => b.selfDamage(3),
  },
  lag: {
    name: 'Lag', type: 'status', rarity: 'status', icon: 'hourglass', exhaust: true,
    text: () => 'Matching this costs 1 energy.',
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
};

export const ARCHES = {
  glitch: { name: 'Glitch', color: '#4f8a55', desc: 'Stack Glitch and let it tick the enemy down.' },
  guard: { name: 'Guard', color: '#4a6fa5', desc: 'Pile up Block and hit back with it.' },
  combo: { name: 'Combo', color: '#d2493f', desc: 'Chain matches for big combo damage.' },
  memory: { name: 'Memory', color: '#7a5ab3', desc: 'Reveal cards and never miss.' },
};

export const STARTER_DECK = ['slash', 'slash', 'slash', 'slash', 'guard', 'guard', 'guard', 'guard', 'zap', 'boba'];

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
