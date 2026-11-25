// Every name a player reads, in one place. Rename something here and it
// changes everywhere: card text, charms, events, battle log, tooltips, help.
//
// Code keeps using the stable internal ids (e.g. the `strength` status), so
// renaming here never breaks saved runs.

// The game and its places.
export const GAME = {
  name: 'Kioku Tower',
  tagline: 'A memory card battler',
  tower: 'Net Café Tower', // the building you climb
  shop: 'Konbini Corner',
  gift: "Haru's Gift", // starter charm pick
};

// Keywords used in card, charm and event text.
export const T = {
  // resources
  hp: 'HP',
  energy: 'energy',
  coins: 'coins',
  block: 'Block',
  combo: 'combo',
  // card keywords
  exhaust: 'Exhaust',
  power: 'Power',
  // statuses (internal ids: strength, weak, vuln, poison, thorns)
  spirit: 'Fighting Spirit',
  sleepy: 'Sleepy',
  exposed: 'Exposed',
  glitch: 'Glitch',
  spikes: 'Spikes',
  // rooms
  rest: 'rest booth',
  // card types (internal ids: attack, skill, power, status)
  types: { attack: 'Attack', skill: 'Skill', power: 'Power', status: 'Status' },
};

// "energy" -> "Energy" for the start of a sentence.
export const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1);
