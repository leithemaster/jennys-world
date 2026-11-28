// Couple outfit sets. Each set has a look for Jenny and a matching one for
// Toni, and both unlock together. The art for each set is in src/ui/chibi.js
// (JENNY_OUTFITS / TONI_OUTFITS, same ids). Which set each character wears is
// saved in the progress save under `cosmetics`.
//
// unlock: null = from the start. Otherwise one rule:
//   runs: n        finish n runs (win or lose)
//   bossFloor: n   beat that floor's boss (0 = Floor 1)
//   december       free to wear all December; beating the Floor 1 boss in
//                  December keeps it for good
//   month: m       the same for another month (0 = January)

import { getProgress, isUnlocked, unlock, setCosmetic } from './progress.js';

export const OUTFITS = {
  date: { name: 'Date Night', desc: "Jenny's yellow knit and beret, Toni's red jacket.", unlock: null },
  cat: { name: 'Cat & Shiba', desc: 'Matching animal-ear hoodies: a black cat for Jenny, a shiba for Toni. The original look.', unlock: null },
  lilac: { name: 'Lilac Twins', desc: 'The same lilac cat-ear hoodie, one each.', unlock: { runs: 5, text: 'Finish 5 runs.' } },
  cafe: { name: 'Café Shift', desc: 'Matching striped shirts, aprons and bandanas for the late shift.', unlock: { bossFloor: 1, text: 'Beat the Floor 2 boss.' } },
  xmas: { name: 'Christmas Knits', desc: 'Matching Christmas sweaters, a Santa hat and reindeer antlers.', unlock: { december: true, text: 'Free all December. Beat the Floor 1 boss in December to keep it.' } },
  park: { name: 'Park Stroll', desc: "A straw sun hat and mint sundress for Jenny, a bucket hat and striped tee for Toni.", unlock: { runs: 3, text: 'Finish 3 runs.' } },
  rainy: { name: 'Rainy Day', desc: 'Raincoats: a yellow frog hood for Jenny, a blue bear hood for Toni.', unlock: { runs: 10, text: 'Finish 10 runs.' } },
  night: { name: 'Night Out', desc: 'A wine-red dress, pearls and a velvet bow for Jenny, a suit and bow tie for Toni.', unlock: { bossFloor: 2, text: 'Beat the Floor 3 boss.' } },
  newyear: { name: 'New Year Hanbok', desc: 'Seollal hanbok: a pink jeogori and jobawi cap for Jenny, a blue jeogori and vest for Toni.', unlock: { month: 0, text: 'Free all January. Beat the Floor 1 boss in January to keep it.' } },
  puppy: { name: 'Puppy Knights', desc: "Shiba armor: Jenny's helm and crest are Haru's black and tan, Toni's are Issei's red with a blue plume.", unlock: { bossFloor: 3, text: 'Beat the Net Café on Floor 4.' } },
};
export const DEFAULT_OUTFIT = 'date';

// Card backs: the face-down side of the cards on the board. One back for the
// whole game (both characters). Same unlock rules as outfits. Art: src/ui/cardBacks.js.
export const CARD_BACKS = {
  classic: { name: 'Lucky Star', desc: 'The original pink back with a yellow star.', unlock: null },
  sakura: { name: 'Sakura', desc: 'Soft pink with a cherry blossom.', unlock: { runs: 2, text: 'Finish 2 runs.' } },
  paws: { name: 'Paw Prints', desc: "Shiba orange with a big paw, for Haru and Issei.", unlock: { bossFloor: 0, text: 'Beat the Floor 1 boss.' } },
  boba: { name: 'Boba Break', desc: 'Lilac with tapioca pearls and a milk tea.', unlock: { runs: 6, text: 'Finish 6 runs.' } },
  pixel: { name: 'Pixel Heart', desc: 'A mint checkerboard with an 8-bit heart.', unlock: { bossFloor: 1, text: 'Beat the Floor 2 boss.' } },
  moon: { name: 'Midnight Moon', desc: 'Navy sky, little stars, a crescent moon.', unlock: { bossFloor: 2, text: 'Beat the Floor 3 boss.' } },
  snow: { name: 'First Snow', desc: 'Icy blue with a snowflake.', unlock: { december: true, text: 'Free all December. Beat the Floor 1 boss in December to keep it.' } },
  gold: { name: 'Gold Foil', desc: 'Shiny gold rays and a crown, like a legendary card.', unlock: { bossFloor: 3, text: 'Beat the Net Café on Floor 4.' } },
};
export const DEFAULT_BACK = 'classic';
// [unlock kind, list] for everything that unlocks by the same rules
const COSMETIC_SETS = () => [['outfits', OUTFITS], ['cardbacks', CARD_BACKS]];

export function backOpen(id) {
  const u = CARD_BACKS[id]?.unlock;
  if (!CARD_BACKS[id]) return false;
  return !u || isUnlocked('cardbacks', id) || inMonth(u);
}
export function wornBack() {
  const id = getProgress().cosmetics?.cardBack;
  return id && backOpen(id) ? id : DEFAULT_BACK;
}
export function useBack(id) {
  if (backOpen(id)) setCosmetic('cardBack', id);
}
export const ROOMS_PER_FLOOR = 10; // 9 rows of rooms + the boss

const isDecember = (d = new Date()) => d.getMonth() === 11;
const inMonth = (u, d = new Date()) => (u.december && d.getMonth() === 11) || (u.month !== undefined && d.getMonth() === u.month);

export function outfitOpen(id) {
  const u = OUTFITS[id]?.unlock;
  if (!OUTFITS[id]) return false;
  return !u || isUnlocked('outfits', id) || inMonth(u);
}

export function wornOutfit(character) {
  const id = getProgress().cosmetics?.[character];
  return id && outfitOpen(id) ? id : DEFAULT_OUTFIT;
}

export function wearOutfit(character, id) {
  if (outfitOpen(id)) setCosmetic(character, id);
}

// Unlocks that can be worked out from saved totals (run counts, best floor).
export function syncOutfitUnlocks() {
  const t = getProgress().totals;
  for (const [kind, list] of COSMETIC_SETS()) for (const [id, o] of Object.entries(list)) {
    const u = o.unlock;
    if (!u) continue;
    if (u.runs && t.runs >= u.runs) unlock(kind, id);
    if (u.bossFloor !== undefined && t.best_floor >= Math.min((u.bossFloor + 1) * ROOMS_PER_FLOOR, 39)) unlock(kind, id);
  }
}

// Called when a boss is beaten. Returns the names of sets unlocked just now.
export function outfitsForBoss(floor, date = new Date()) {
  const got = [];
  for (const [kind, list] of COSMETIC_SETS()) for (const [id, o] of Object.entries(list)) {
    const u = o.unlock;
    if (!u) continue;
    const hit = u.bossFloor === floor || (floor === 0 && inMonth(u, date));
    if (hit && unlock(kind, id)) got.push(kind === 'cardbacks' ? `back:${id}` : o.name);
  }
  return got;
}

// Called when a run ends (run totals have already been updated).
export function outfitsForRunEnd() {
  const t = getProgress().totals;
  const got = [];
  for (const [kind, list] of COSMETIC_SETS()) for (const [id, o] of Object.entries(list)) {
    if (o.unlock?.runs && t.runs >= o.unlock.runs && unlock(kind, id)) got.push(kind === 'cardbacks' ? `back:${id}` : o.name);
  }
  return got;
}
