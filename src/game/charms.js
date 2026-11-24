// Charms: passive items that stay for the whole run.
// pool: where it can come from
//   drop – treasure lockers, elites and events
//   shop – only sold at the Konbini Corner
//   boss – only offered after beating a boss
//   haru – Haru's Gift, pick 1 of 3 at the start of a run
// requires(run, h): optional; the charm stays hidden until this is true.

export const CHARMS = {
  // ----- Haru's Gift: pick 1 of 3 at the start of a run -----
  moonPin: { name: 'Moon Pin', icon: '🌙', pool: 'haru', style: 'memory', desc: 'At the start of each fight, reveal 2 cards.' },
  scarf: { name: 'Knitted Scarf', icon: '🧣', pool: 'haru', desc: '+12 max HP.' },
  luckyCoin: { name: 'Lucky Coin', icon: '🪙', pool: 'haru', desc: 'Start with 100 extra coins.' },
  glitchPen: { name: 'Glitch Pen', icon: '🖊️', pool: 'haru', style: 'glitch', desc: 'Start with 2 Stingers. Glitch cards show up more.' },
  puffyJacket: { name: 'Puffy Jacket', icon: '🧥', pool: 'haru', style: 'guard', desc: 'Start with Hoodie Up. Start each fight with 4 Block.' },
  rhythmBracelet: { name: 'Rhythm Bracelet', icon: '📿', pool: 'haru', style: 'combo', desc: 'Start with Combo Kick. Each combo step adds +3 damage instead of +2.' },
  thermos: { name: 'Warm Thermos', icon: '🍵', pool: 'haru', desc: 'Heal 7 after each fight.' },
  spareBattery: { name: 'Spare Battery', icon: '🪫', pool: 'haru', desc: 'The first time you run out of energy in each fight, gain 2.' },
  sketchbook: { name: 'Sketchbook', icon: '📓', pool: 'haru', desc: 'Upgrade 2 random cards in your starting deck.' },
  pillowPet: { name: 'Pillow Pet', icon: '🐑', pool: 'haru', desc: 'Naps at rest booths heal 15% more and give +2 max HP.' },
  shibaCharm: { name: 'Shiba Keychain', icon: '🐶', pool: 'haru', desc: 'Once per run, survive a knockout with 25% HP.' },
  giftCard: { name: 'Gift Card', icon: '🎁', pool: 'haru', desc: 'Your first purchase in each shop is half price.' },

  // ----- drops -----
  luckyCat: { name: 'Lucky Cat', icon: '🐱', pool: 'drop', desc: 'The first board of each fight is shown for a moment.' },
  americano: { name: 'Iced Americano', icon: '🧋', pool: 'drop', desc: '+1 energy on your first turn.' },
  bandage: { name: 'Plaster Pack', icon: '🩹', pool: 'drop', desc: 'Heal 5 after each fight.' },
  keychain: { name: 'Spiked Keychain', icon: '🔑', pool: 'drop', desc: 'Your first match each turn deals 3 damage.' },
  hairclip: { name: 'Hair Clip', icon: '🎀', pool: 'drop', desc: 'Start each fight with 6 Block.' },
  purse: { name: 'Coin Purse', icon: '👛', pool: 'drop', desc: 'Gain 50% more coins.' },
  stickers: { name: 'Sticker Sheet', icon: '⭐', pool: 'drop', desc: 'Start each turn with 1 combo.' },
  mint: { name: 'Mint Tin', icon: '🍬', pool: 'drop', desc: 'Your first miss each turn refunds its energy.' },
  strap: { name: 'Phone Strap', icon: '📱', pool: 'drop', desc: 'Clearing a board gives 6 Block.' },
  tamago: { name: 'Pocket Pet', icon: '🥚', pool: 'drop', desc: 'Every 3rd turn, +1 energy.' },
  glowstick: { name: 'Glow Stick', icon: '✨', pool: 'drop', desc: 'Start each fight with 1 Strength.' },
  lipTint: { name: 'Lip Tint', icon: '💄', pool: 'drop', desc: 'Clearing a board heals 3.' },
  venomVial: { name: 'Glitch Vial', icon: '🧪', pool: 'drop', desc: 'Whenever you apply Glitch, apply 2 more.',
    requires: (r, h) => h.deckHas(['stinger', 'catalyst']) },
  fuzzySocks: { name: 'Fuzzy Socks', icon: '🧦', pool: 'drop', desc: 'Guard and Hoodie Up give 3 more Block.',
    requires: (r, h) => h.deckCount(['guard', 'hoodieUp']) >= 3 },
  powerBank: { name: 'Power Bank', icon: '🔋', pool: 'drop', desc: 'Matching a Power card gives +1 energy.',
    requires: (r, h) => h.deckHas(['spikyJacket', 'energyDrink', 'hype', 'fortress', 'photographic']) },

  // ----- shop only -----
  memberCard: { name: 'Member Card', icon: '💳', pool: 'shop', desc: 'Everything in shops costs 20% less.' },
  stampCard: { name: 'Stamp Card', icon: '🎫', pool: 'shop', desc: 'Removing a card at shops always costs 50.' },
  kimbap: { name: 'Kimbap Roll', icon: '🍙', pool: 'shop', desc: '+10 max HP.' },
  neon: { name: 'Neon Sign', icon: '💡', pool: 'shop', desc: 'Enemies start each fight with 2 Exposed.' },
  snackBag: { name: 'Snack Bag', icon: '🍿', pool: 'shop', desc: 'Clearing a board heals 2.' },
  neckPillow: { name: 'Neck Pillow', icon: '💤', pool: 'shop', desc: 'Naps at rest booths heal 45% instead of 30%.' },
  shibaPlush: { name: 'Shiba Plush', icon: '🐕', pool: 'shop', desc: 'The first time you would be knocked out each fight, survive with 1 HP.' },

  // ----- boss rewards -----
  chair: { name: 'Gaming Chair', icon: '🪑', pool: 'boss', desc: '+1 energy every turn.' },
  keyboard: { name: 'Clicky Keyboard', icon: '⌨️', pool: 'boss', desc: 'Each match adds 2 combo instead of 1.' },
  headset: { name: 'Big Headphones', icon: '🎧', pool: 'boss', desc: 'At the start of each turn, reveal 1 card.' },
  plush: { name: 'Giant Plushie', icon: '🧸', pool: 'boss', desc: 'Heal 12 after each fight. +8 max HP.' },
};
