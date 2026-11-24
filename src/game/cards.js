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
    fx: (b, u) => b.gainBlock(u ? 8 : 5),
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
    name: 'Stinger', type: 'attack', rarity: 'common', icon: 'drop',
    text: (u) => `Deal 3. Apply ${u ? 6 : 4} Glitch.`,
    fx: (b, u) => { b.attack(3); b.applyEnemy('poison', u ? 6 : 4); },
  },
  hoodieUp: {
    name: 'Hoodie Up', type: 'skill', rarity: 'common', icon: 'hood',
    text: (u) => `Block ${u ? 13 : 9}.`,
    fx: (b, u) => b.gainBlock(u ? 13 : 9),
  },
  peek: {
    name: 'Peek', type: 'skill', rarity: 'common', icon: 'eye',
    text: (u) => `Reveal ${u ? 4 : 2} hidden cards. Block 3.`,
    fx: (b, u) => { b.reveal(u ? 4 : 2); b.gainBlock(3); },
  },
  trip: {
    name: 'Trip', type: 'skill', rarity: 'common', icon: 'swirl',
    text: (u) => `Apply ${u ? 3 : 2} Sleepy. Block ${u ? 5 : 3}.`,
    fx: (b, u) => { b.applyEnemy('weak', u ? 3 : 2); b.gainBlock(u ? 5 : 3); },
  },
  comboKick: {
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
    name: 'Ricochet', type: 'attack', rarity: 'uncommon', icon: 'bounce',
    text: (u) => `Deal ${u ? 5 : 3} for each match this turn.`,
    fx: (b, u) => b.attack((u ? 5 : 3) * b.matchesThisTurn),
  },
  shieldBash: {
    name: 'Shield Bash', type: 'attack', rarity: 'uncommon', icon: 'shieldHit',
    text: (u) => `Deal damage equal to your Block${u ? ' +5' : ''}.`,
    fx: (b, u) => b.attack(b.player.block + (u ? 5 : 0), { raw: true }),
  },
  catalyst: {
    name: 'Catalyst', type: 'skill', rarity: 'uncommon', icon: 'flask',
    text: (u) => `${u ? 'Triple' : 'Double'} the enemy's Glitch.`,
    fx: (b, u) => b.applyEnemy('poison', b.enemy.poison * (u ? 2 : 1)),
  },
  memoryLane: {
    name: 'Memory Lane', type: 'skill', rarity: 'uncommon', icon: 'film',
    text: (u) => `Show every card for a moment. Block ${u ? 8 : 4}.`,
    fx: (b, u) => { b.flash(); b.gainBlock(u ? 8 : 4); },
  },
  momentum: {
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
    name: 'Button Mash', type: 'attack', rarity: 'rare', icon: 'keys',
    text: (u) => `Deal 2, ${u ? 10 : 7} times.`,
    fx: (b, u) => { for (let i = 0; i < (u ? 10 : 7); i++) b.attack(2); },
  },
  fortress: {
    name: 'Blanket Fort', type: 'power', rarity: 'rare', icon: 'fort',
    text: (u) => `Power: Block no longer resets.${u ? ' Block 10.' : ''}`,
    fx: (b, u) => { b.powers.fortress = true; if (u) b.gainBlock(10); },
  },
  photographic: {
    name: 'Photo Memory', type: 'power', rarity: 'rare', icon: 'camera',
    text: (u) => `Power: your first miss each turn is free.${u ? ' Reveal 2.' : ''}`,
    fx: (b, u) => { b.powers.freeMiss = true; if (u) b.reveal(2); },
  },
  overclock: {
    name: 'Overclock', type: 'skill', rarity: 'rare', icon: 'chip',
    text: (u) => `+${u ? 4 : 3} energy. Take 3 damage.`,
    fx: (b, u) => { b.gainEnergy(u ? 4 : 3); b.selfDamage(3); },
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

export const STARTER_DECK = ['slash', 'slash', 'slash', 'slash', 'guard', 'guard', 'guard', 'guard', 'zap', 'boba'];

export function cardName(c) {
  return CARDS[c.id].name + (c.up ? '+' : '');
}
export function cardText(c) {
  return CARDS[c.id].text(!!c.up);
}

export function pool(rarity) {
  return Object.keys(CARDS).filter((id) => CARDS[id].rarity === rarity);
}

export function canUpgrade(c) {
  const r = CARDS[c.id].rarity;
  return !c.up && r !== 'status' && r !== 'curse';
}
