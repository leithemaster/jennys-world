// Playable characters. Every card style is open to every character: a
// character only changes the starting deck, max HP and one passive.
//
// passive.id is read by battle.js; passive.n is its number, so tuning a
// passive is a one-number change here.

export const CHARACTERS = {
  jenny: {
    name: 'Jenny',
    blurb: 'Artsy, loves anything cute. Decorates every fight with stickers.',
    maxHp: 55,
    deck: ['slash', 'slash', 'slash', 'slash', 'guard', 'guard', 'guard', 'guard', 'zap', 'boba'],
    // Every n-th match in a fight peels the next sticker off her sticker book
    // (a shuffled deck of 5, see STICKERS in battle.js; no repeats until all 5 are used).
    passive: { id: 'stickerBook', n: 8, name: 'Sticker Book', desc: (n) => `Every ${n}${n === 2 ? "nd" : n === 3 ? "rd" : "th"} match in a fight gives a cute sticker: Star (deal 4), Bow (4 Block), Heart (heal 3), Bunny (reveal 2) or Bolt (+1 energy). You can see which one is next.` },
  },
  toni: {
    name: 'Toni',
    blurb: 'Always half asleep. Naps, snacks and somehow still wins.',
    maxHp: 50,
    deck: ['slash', 'slash', 'slash', 'slash', 'guard', 'guard', 'guard', 'guard', 'yawn', 'warmMilk'],
    // Unlocked by beating this floor's boss (0 = Floor 1). Saved in the progress save.
    unlock: { bossFloor: 0, text: 'Beat the Floor 1 boss to unlock.' },
    passive: { id: 'comfy', n: 2, name: 'Comfy', desc: (n) => `Every heal restores ${n} more HP.` },
  },
};

export const passiveText = (ch) => `${ch.passive.name}: ${ch.passive.desc(ch.passive.n)}`;
