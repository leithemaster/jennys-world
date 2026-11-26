// Charms: passive items that stay for the whole run.
// pool: where it can come from
//   drop – treasure lockers, elites and events
//   shop – only sold at the Konbini Corner
//   boss – only offered after beating a boss
//   haru – Haru's Gift, pick 1 of 3 at the start of a run
//   guardian – a floor 2 or 3 guardian's gift (from: guardian id; see guardians.js)
//   gives: cards added to your deck when you take it (gift cards, see cards.js)
//   special – boons from special events only (see events.js); they power up one style
//   event – only given by regular "?" events
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

  // ----- guardian gifts (see guardians.js): 6 each, pick 1 of 3 when you meet them -----
  // Floor 2 guardians: solid picks.
  zoomies: { name: 'Zoomies', icon: '💨', pool: 'guardian', from: 'issei', style: 'combo', gives: ['zoomie', 'zoomie'], desc: `Start with 2 Zoomie cards (deal 4, +1 ${T.combo}, reveal 1).` },
  chewedCable: { name: 'Chewed Cable', icon: '🔌', pool: 'guardian', from: 'issei', style: 'glitch', desc: `Enemies start each fight with 3 ${T.glitch}.` },
  tennisBall: { name: 'Tennis Ball', icon: '🎾', pool: 'guardian', from: 'issei', style: 'combo', desc: `Your first miss each turn doesn't reset your ${T.combo}.` },
  puppyEyes: { name: 'Puppy Eyes', icon: '🥺', pool: 'guardian', from: 'issei', desc: `Start each fight with 7 ${T.block}.` },
  treatPouch: { name: 'Treat Pouch', icon: '🦴', pool: 'guardian', from: 'issei', desc: '+1 snack slot, and a random snack to fill it.' },
  bandana: { name: 'Little Bandana', icon: '🧣', pool: 'guardian', from: 'issei', desc: `+1 ${T.energy} on your first turn. Every new board reveals 1 more card.` },

  burrow: { name: 'Blanket Burrow', icon: '🛏️', pool: 'guardian', from: 'hana', style: 'dreamy', gives: ['snuggle', 'snuggle'], desc: `Start with 2 Snuggle cards (${T.block} 6, apply 2 ${T.sleepy}).` },
  bellyRubs: { name: 'Belly Rubs', icon: '🐾', pool: 'guardian', from: 'hana', style: 'cozy', desc: `Whenever you heal in a fight, gain 2 ${T.block}.` },
  napBuddy: { name: 'Nap Buddy', icon: '💤', pool: 'guardian', from: 'hana', style: 'dreamy', desc: `${T.asleep} enemies take 30% more damage.` },
  warmLap: { name: 'Warm Lap', icon: '🧶', pool: 'guardian', from: 'hana', desc: 'Heal 6 after each fight.' },
  doggyBed: { name: 'Doggy Bed', icon: '🛋️', pool: 'guardian', from: 'hana', desc: `Naps at ${T.rest}s also upgrade a random card.` },
  hanaSigh: { name: 'Happy Sigh', icon: '😌', pool: 'guardian', from: 'hana', style: 'cozy', desc: 'Heal 2 at the start of each of your turns.' },

  bigBark: { name: 'Big Bark', icon: '📣', pool: 'guardian', from: 'kaiba', style: 'exposed', gives: ['bark', 'bark', 'bark'], desc: `Start with 3 Bark cards (apply 2 ${T.exposed}, reveal 1).` },
  guardDog: { name: 'Guard Dog', icon: '🛡️', pool: 'guardian', from: 'kaiba', style: 'guard', desc: `Every card that gives ${T.block} gives 2 more.` },
  sharpTeeth: { name: 'Sharp Teeth', icon: '🦷', pool: 'guardian', from: 'kaiba', style: 'guard', desc: `Start each fight with 2 ${T.spikes}.` },
  growl: { name: 'Low Growl', icon: '😤', pool: 'guardian', from: 'kaiba', style: 'exposed', desc: `${T.exposed} enemies deal 25% less damage.` },
  spikedCollar: { name: 'Spiked Collar', icon: '⛓️', pool: 'guardian', from: 'kaiba', desc: `Your first match each turn gives 3 ${T.block}.` },
  chewToy: { name: 'Squeaky Chew Toy', icon: '🧸', pool: 'guardian', from: 'kaiba', desc: `Gain 75 ${T.coins}. Shops cost 10% less.` },

  // Floor 3 guardians: strong picks that help a build snowball.
  sushiBoat: { name: 'Sushi Boat', icon: '🚢', pool: 'guardian', from: 'sushiQueen', gives: ['sushiRoll', 'sushiRoll', 'sushiRoll'], desc: `Start with 3 Sushi Roll cards (deal 7, +1 ${T.energy}).` },
  rainbowRoll: { name: 'Rainbow Roll', icon: '🌈', pool: 'guardian', from: 'sushiQueen', style: 'combo', desc: `Start each turn with 2 ${T.combo}.` },
  toroCrown: { name: 'Toro Crown', icon: '👑', pool: 'guardian', from: 'sushiQueen', style: 'exposed', desc: `Enemies start each fight with 3 ${T.exposed} and 4 ${T.glitch}.` },
  greenTea: { name: 'Bottomless Green Tea', icon: '🍵', pool: 'guardian', from: 'sushiQueen', style: 'cozy', desc: `+10 max ${T.hp}. Heal 15 after each fight.` },
  conveyorBelt: { name: 'Conveyor Belt', icon: '🍣', pool: 'guardian', from: 'sushiQueen', style: 'memory', desc: 'At the start of each turn, reveal 2 cards.' },
  bambooMat: { name: 'Bamboo Mat', icon: '🎋', pool: 'guardian', from: 'sushiQueen', style: 'guard', desc: `Half your ${T.block} stays at the start of your turn instead of all of it going away.` },

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

  snackCoupon: { name: 'Snack Coupon', icon: '🎟️', pool: 'drop', desc: 'Snacks drop 20% more often after fights.' },

  // ----- shop only -----
  lunchbox: { name: 'Lunchbox', icon: '🍱', pool: 'shop', desc: '+2 snack slots.' },
  memberCard: { name: 'Member Card', icon: '💳', pool: 'shop', desc: 'Everything in shops costs 20% less.' },
  stampCard: { name: 'Stamp Card', icon: '🎫', pool: 'shop', desc: 'Removing a card at shops always costs 50.' },
  kimbap: { name: 'Kimbap Roll', icon: '🍙', pool: 'shop', desc: `+10 max ${T.hp}.` },
  neon: { name: 'Neon Sign', icon: '💡', pool: 'shop', desc: `Enemies start each fight with 2 ${T.exposed}.` },
  snackBag: { name: 'Popcorn Bucket', icon: '🍿', pool: 'shop', desc: 'Clearing a board heals 2.' },
  neckPillow: { name: 'Neck Pillow', icon: '💤', pool: 'shop', desc: `Naps at ${T.rest}s heal 45% instead of 30%.` },
  shibaPlush: { name: 'Shiba Plush', icon: '🐕', pool: 'shop', desc: `The first time you would be knocked out each fight, survive with 1 ${T.hp}.` },

  // ----- boss rewards -----
  chair: { name: 'Gaming Chair', icon: '🪑', pool: 'boss', desc: `+1 ${T.energy} every turn.` },
  keyboard: { name: 'Clicky Keyboard', icon: '⌨️', pool: 'boss', desc: `Each match adds 2 ${T.combo} instead of 1.` },
  headset: { name: 'Big Headphones', icon: '🎧', pool: 'boss', desc: 'At the start of each turn, reveal 1 card.' },
  secretRecipe: { name: 'Secret Recipe', icon: '📜', pool: 'boss', desc: 'Your snacks work twice.' },
  plush: { name: 'Giant Plushie', icon: '🧸', pool: 'boss', desc: `Heal 12 after each fight. +8 max ${T.hp}.` },

  // ----- event only (regular "?" events) -----
  kittenBell: { name: 'Kitten Bell', icon: '🔔', pool: 'event', desc: `Your first miss in each fight doesn't reset your ${T.combo}.` },
  goldenMic: { name: 'Golden Mic', icon: '🎙️', pool: 'event', desc: 'Clearing a board deals 5 damage.' },
  luckyChopsticks: { name: 'Lucky Chopsticks', icon: '🥢', pool: 'event', desc: `+1 ${T.energy} on your first turn against elites and bosses.` },
  vpnDongle: { name: 'VPN Dongle', icon: '🔌', pool: 'event', desc: `Matching a Spam, Lag or Bug card gives 4 ${T.block}.` },

  hamsterCheeks: { name: 'Hamster Cheeks', icon: '🐹', pool: 'event', desc: `+1 snack slot. Eating a snack heals 2.` },
  pocketFridge: { name: 'Pocket Fridge', icon: '🧊', pool: 'event', desc: 'When you reach a new floor, fill your empty snack slots.' },

  // ----- special event boons (only from special events) -----
  lucidDream: { name: 'Lucid Dream', icon: '🌌', pool: 'special', style: 'dreamy', desc: `The first Dreamy card you match each turn applies 1 more ${T.sleepy}.` },
  grandmaSoup: { name: "Grandma's Soup", icon: '🍲', pool: 'special', style: 'cozy', desc: `All your healing is ${T.cozy}: extra healing past max ${T.hp} hits the enemy.` },
  rootAccess: { name: 'Root Access', icon: '💾', pool: 'special', style: 'glitch', desc: `Your Glitch cards apply 2 more ${T.glitch}.` },
  bouncerStance: { name: "Bouncer's Stance", icon: '🥋', pool: 'special', style: 'guard', desc: `Your Guard cards give 2 more ${T.block}.` },
  palaceKey: { name: 'Palace Key', icon: '🗝️', pool: 'special', style: 'memory', desc: 'The first Memory card you match each turn reveals 1 more card.' },
  encore: { name: 'Encore', icon: '🎤', pool: 'special', style: 'combo', desc: `The first Combo card you match each turn adds 1 more ${T.combo}.` },
  trending: { name: 'Trending', icon: '📈', pool: 'special', style: 'exposed', desc: `${T.exposed} enemies take 75% more damage instead of 50%.` },
  crossover: { name: 'Crossover', icon: '🔀', pool: 'special', desc: `The first hybrid card you match in each fight gives +2 ${T.energy}.` },
};
