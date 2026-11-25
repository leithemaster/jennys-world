// Charms: passive items that stay for the whole run.
// pool: where it can come from
//   drop – treasure lockers, elites and events
//   shop – only sold at the Konbini Corner
//   boss – only offered after beating a boss
//   haru – Haru's Gift, pick 1 of 3 at the start of a run
// requires(run, h): optional; the charm stays hidden until this is true.

import { T } from './terms.js';
export const CHARMS = {
  // ----- Haru's Gift: pick 1 of 3 at the start of a run -----
  moonPin: { name: 'Moon Pin', icon: '🌙', pool: 'haru', style: 'memory', desc: 'Reveal 2 cards on every new board.' },
  scarf: { name: 'Knitted Scarf', icon: '🧣', pool: 'haru', desc: `+12 max ${T.hp}.` },
  luckyCoin: { name: 'Lucky Coin', icon: '🪙', pool: 'haru', desc: `Start with 100 extra ${T.coins}.` },
  glitchPen: { name: 'Glitch Pen', icon: '🖊️', pool: 'haru', style: 'glitch', desc: 'Start with 2 Stingers. Glitch cards show up more.' },
  puffyJacket: { name: 'Puffy Jacket', icon: '🧥', pool: 'haru', style: 'guard', desc: `Start with Hoodie Up. Start each fight with 4 ${T.block}.` },
  rhythmBracelet: { name: 'Rhythm Bracelet', icon: '📿', pool: 'haru', style: 'combo', desc: `Start with Combo Kick. Each ${T.combo} step adds +3 damage instead of +2.` },
  thermos: { name: 'Warm Thermos', icon: '🍵', pool: 'haru', desc: 'Heal 7 after each fight.' },
  spareBattery: { name: 'Spare Battery', icon: '🪫', pool: 'haru', desc: `The first time you run out of ${T.energy} in each fight, gain 2.` },
  sketchbook: { name: 'Sketchbook', icon: '📓', pool: 'haru', desc: 'Upgrade 2 random cards in your starting deck.' },
  pillowPet: { name: 'Pillow Pet', icon: '🐑', pool: 'haru', desc: `Naps at ${T.rest}s heal 15% more and give +2 max ${T.hp}.` },
  shibaCharm: { name: 'Shiba Keychain', icon: '🐶', pool: 'haru', desc: `Once per run, survive a knockout with 25% ${T.hp}.` },
  giftCard: { name: 'Gift Card', icon: '🎁', pool: 'haru', desc: 'Your first purchase in each shop is half price.' },
  sleepMask: { name: 'Sleep Mask', icon: '😴', pool: 'haru', style: 'dreamy', desc: `Start with Lights Out. Enemies start each fight with 1 ${T.sleepy}.` },
  hotWaterBottle: { name: 'Hot Water Bottle', icon: '♨️', pool: 'haru', style: 'cozy', desc: 'Start with Group Hug. Heal 4 after each fight.' },
  gossipPhone: { name: 'Gossip Phone', icon: '📞', pool: 'haru', style: 'exposed', desc: `Start with Call Out. Enemies start each fight with 1 ${T.exposed}.` },

  // ----- drops -----
  luckyCat: { name: 'Lucky Cat', icon: '🐱', pool: 'drop', desc: 'Every new board is shown for a moment.' },
  americano: { name: 'Iced Americano', icon: '🧋', pool: 'drop', desc: `+1 ${T.energy} on your first turn.` },
  bandage: { name: 'Plaster Pack', icon: '🩹', pool: 'drop', desc: 'Heal 5 after each fight.' },
  keychain: { name: 'Spiked Keychain', icon: '🔑', pool: 'drop', desc: 'Your first match each turn deals 3 damage.' },
  hairclip: { name: 'Hair Clip', icon: '🎀', pool: 'drop', desc: `Start each fight with 6 ${T.block}.` },
  purse: { name: 'Coin Purse', icon: '👛', pool: 'drop', desc: `Gain 50% more ${T.coins}.` },
  stickers: { name: 'Sticker Sheet', icon: '⭐', pool: 'drop', desc: `Start each turn with 1 ${T.combo}.` },
  mint: { name: 'Mint Tin', icon: '🍬', pool: 'drop', desc: `Your first miss each turn refunds its ${T.energy}.` },
  strap: { name: 'Phone Strap', icon: '📱', pool: 'drop', desc: `Clearing a board gives 6 ${T.block}.` },
  tamago: { name: 'Pocket Pet', icon: '🥚', pool: 'drop', desc: `Every 3rd turn, +1 ${T.energy}.` },
  glowstick: { name: 'Glow Stick', icon: '✨', pool: 'drop', desc: `Start each fight with 1 ${T.spirit}.` },
  lipTint: { name: 'Lip Tint', icon: '💄', pool: 'drop', desc: 'Clearing a board heals 3.' },
  venomVial: { name: 'Glitch Vial', icon: '🧪', pool: 'drop', desc: `Whenever you apply ${T.glitch}, apply 2 more.`,
    requires: (r, h) => h.deckHas(['stinger', 'catalyst', 'virusUpload', 'lagSpike', 'leak']), needs: 'a Glitch card' },
  fuzzySocks: { name: 'Fuzzy Socks', icon: '🧦', pool: 'drop', desc: `Guard and Hoodie Up give 3 more ${T.block}.`,
    requires: (r, h) => h.deckCount(['guard', 'hoodieUp']) >= 3, needs: '3+ Guard / Hoodie Up' },
  powerBank: { name: 'Power Bank', icon: '🔋', pool: 'drop', desc: `Matching a ${T.types.power} card gives +1 ${T.energy}.`,
    requires: (r, h) => h.deckHas(['spikyJacket', 'energyDrink', 'hype', 'fortress', 'photographic']), needs: 'a Power card (Spiky Jacket, Energy Drink, Hype, Blanket Fort, Photo Memory)' },

  // ----- shop only -----
  memberCard: { name: 'Member Card', icon: '💳', pool: 'shop', desc: 'Everything in shops costs 20% less.' },
  stampCard: { name: 'Stamp Card', icon: '🎫', pool: 'shop', desc: 'Removing a card at shops always costs 50.' },
  kimbap: { name: 'Kimbap Roll', icon: '🍙', pool: 'shop', desc: `+10 max ${T.hp}.` },
  neon: { name: 'Neon Sign', icon: '💡', pool: 'shop', desc: `Enemies start each fight with 2 ${T.exposed}.` },
  snackBag: { name: 'Snack Bag', icon: '🍿', pool: 'shop', desc: 'Clearing a board heals 2.' },
  neckPillow: { name: 'Neck Pillow', icon: '💤', pool: 'shop', desc: `Naps at ${T.rest}s heal 45% instead of 30%.` },
  shibaPlush: { name: 'Shiba Plush', icon: '🐕', pool: 'shop', desc: `The first time you would be knocked out each fight, survive with 1 ${T.hp}.` },

  // ----- boss rewards -----
  chair: { name: 'Gaming Chair', icon: '🪑', pool: 'boss', desc: `+1 ${T.energy} every turn.` },
  keyboard: { name: 'Clicky Keyboard', icon: '⌨️', pool: 'boss', desc: `Each match adds 2 ${T.combo} instead of 1.` },
  headset: { name: 'Big Headphones', icon: '🎧', pool: 'boss', desc: 'At the start of each turn, reveal 1 card.' },
  plush: { name: 'Giant Plushie', icon: '🧸', pool: 'boss', desc: `Heal 12 after each fight. +8 max ${T.hp}.` },
};
