// Playable characters. Every card style is open to every character: a
// character only changes the starting deck, max HP and one passive.
//
// passive.id is read by battle.js; passive.n is its number, so tuning a
// passive is a one-number change here.

export const CHARACTERS = {
  jenny: {
    name: 'Jenny',
    blurb: 'Artsy, loves anything cute. Sketches the board before she plays.',
    maxHp: 55,
    deck: ['slash', 'slash', 'slash', 'slash', 'guard', 'guard', 'guard', 'guard', 'zap', 'boba'],
    passive: { id: 'sketch', n: 1, name: 'Sketch the Board', desc: (n) => `At the start of each fight, reveal ${n} extra card${n === 1 ? "" : "s"}.` },
  },
  toni: {
    name: 'Toni',
    blurb: 'Always half asleep. Naps, snacks and somehow still wins.',
    maxHp: 50,
    deck: ['slash', 'slash', 'slash', 'slash', 'guard', 'guard', 'guard', 'guard', 'yawn', 'warmMilk'],
    passive: { id: 'comfy', n: 2, name: 'Comfy', desc: (n) => `Every heal restores ${n} more HP.` },
  },
};

export const passiveText = (ch) => `${ch.passive.name}: ${ch.passive.desc(ch.passive.n)}`;
