// Climb levels: harder runs, unlocked one at a time per character.
// Win a run at your highest level to unlock the next one. Each level keeps
// every twist from the levels below it. Level 0 is the normal game.
export const CLIMB_MAX = 10;

export const CLIMB = [
  null,
  { name: 'Tough elites', text: 'Elites have 15% more HP.' },
  { name: 'Light sleeper', text: 'Naps at rest booths heal 20% of your max HP instead of 30%.' },
  { name: 'Sharper hits', text: 'Enemies deal 10% more damage.' },
  { name: 'Price hike', text: 'Shop prices are 10% higher.' },
  { name: 'Big bosses', text: 'Bosses have 15% more HP.' },
  { name: 'Slim pickings', text: 'Card rewards offer 2 cards instead of 3.' },
  { name: 'Foggy boards', text: '1 fewer free reveal on every board.' },
  { name: 'Tired start', text: 'Start with 10% less max HP.' },
  { name: 'Leftovers', text: 'Start with a Leftovers curse in your deck. Matching it exhausts it for the fight, but it comes back next fight.' },
  { name: 'Heart of the Tower', text: 'Elites and bosses start each fight with 1 Spirit.' },
];

// Is the twist from level n active in this run?
export const climbOn = (run, n) => (run?.climb || 0) >= n;

// Numbers the game reads (kept here so tuning a level is one edit).
export const CLIMB_RULES = {
  eliteHp: 1.15, bossHp: 1.15, enemyDamage: 1.1, shopPrice: 1.1,
  napHeal: 0.2, rewardChoices: 2, revealLoss: 1, maxHp: 0.9, curse: 'leftovers', bigSpirit: 1,
};
