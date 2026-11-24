// Charms: passive items that stay for the whole run.
// Hooks are read by the Battle and the run screens.

export const CHARMS = {
  moonPin: { name: 'Moon Pin', icon: '🌙', rarity: 'starter', desc: 'At the start of each fight, reveal 2 cards.' },

  luckyCat: { name: 'Lucky Cat', icon: '🐱', rarity: 'common', desc: 'The first board of each fight is shown for a moment.' },
  americano: { name: 'Iced Americano', icon: '🧋', rarity: 'common', desc: '+1 energy on your first turn.' },
  bandage: { name: 'Plaster Pack', icon: '🩹', rarity: 'common', desc: 'Heal 5 after each fight.' },
  keychain: { name: 'Spiked Keychain', icon: '🔑', rarity: 'common', desc: 'Your first match each turn deals 3 damage.' },
  hairclip: { name: 'Hair Clip', icon: '🎀', rarity: 'common', desc: 'Start each fight with 6 Block.' },
  purse: { name: 'Coin Purse', icon: '👛', rarity: 'common', desc: 'Gain 50% more coins.' },
  kimbap: { name: 'Kimbap Roll', icon: '🍙', rarity: 'common', desc: '+10 max HP when picked up.' },

  stickers: { name: 'Sticker Sheet', icon: '⭐', rarity: 'uncommon', desc: 'Start each turn with 1 combo.' },
  mint: { name: 'Mint Tin', icon: '🍬', rarity: 'uncommon', desc: 'Your first miss each turn refunds its energy.' },
  strap: { name: 'Phone Strap', icon: '📱', rarity: 'uncommon', desc: 'Clearing a board gives 6 Block.' },
  tamago: { name: 'Pocket Pet', icon: '🥚', rarity: 'uncommon', desc: 'Every 3rd turn, +1 energy.' },
  glowstick: { name: 'Glow Stick', icon: '✨', rarity: 'uncommon', desc: 'Start each fight with 1 Strength.' },
  neon: { name: 'Neon Sign', icon: '💡', rarity: 'uncommon', desc: 'Enemies start each fight with 2 Exposed.' },
  lipTint: { name: 'Lip Tint', icon: '💄', rarity: 'uncommon', desc: 'Clearing a board heals 3.' },

  chair: { name: 'Gaming Chair', icon: '🪑', rarity: 'boss', desc: '+1 energy every turn.' },
  keyboard: { name: 'Clicky Keyboard', icon: '⌨️', rarity: 'boss', desc: 'Each match adds 2 combo instead of 1.' },
  headset: { name: 'Big Headphones', icon: '🎧', rarity: 'boss', desc: 'At the start of each turn, reveal 1 card.' },
  plush: { name: 'Giant Plushie', icon: '🧸', rarity: 'boss', desc: 'Heal 12 after each fight. +8 max HP.' },
};

export function charmPool(rarity) {
  return Object.keys(CHARMS).filter((k) => CHARMS[k].rarity === rarity);
}
