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

import { getProgress, isUnlocked, unlock, setCosmetic } from './progress.js';

export const OUTFITS = {
  date: { name: 'Date Night', desc: "Jenny's yellow knit and beret, Toni's red jacket.", unlock: null },
  cat: { name: 'Cat & Shiba', desc: 'Matching animal-ear hoodies: a black cat for Jenny, a shiba for Toni. The original look.', unlock: null },
  lilac: { name: 'Lilac Twins', desc: 'The same lilac cat-ear hoodie, one each.', unlock: { runs: 5, text: 'Finish 5 runs.' } },
  cafe: { name: 'Café Shift', desc: 'Matching striped shirts, aprons and bandanas for the late shift.', unlock: { bossFloor: 1, text: 'Beat the Floor 2 boss.' } },
  xmas: { name: 'Christmas Knits', desc: 'Matching Christmas sweaters, a Santa hat and reindeer antlers.', unlock: { december: true, text: 'Free all December. Beat the Floor 1 boss in December to keep it.' } },
};
export const DEFAULT_OUTFIT = 'date';
export const ROOMS_PER_FLOOR = 10; // 9 rows of rooms + the boss

const isDecember = (d = new Date()) => d.getMonth() === 11;

export function outfitOpen(id) {
  const u = OUTFITS[id]?.unlock;
  if (!OUTFITS[id]) return false;
  return !u || isUnlocked('outfits', id) || (!!u.december && isDecember());
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
  for (const [id, o] of Object.entries(OUTFITS)) {
    const u = o.unlock;
    if (!u) continue;
    if (u.runs && t.runs >= u.runs) unlock('outfits', id);
    if (u.bossFloor !== undefined && t.best_floor >= (u.bossFloor + 1) * ROOMS_PER_FLOOR) unlock('outfits', id);
  }
}

// Called when a boss is beaten. Returns the names of sets unlocked just now.
export function outfitsForBoss(floor, date = new Date()) {
  const got = [];
  for (const [id, o] of Object.entries(OUTFITS)) {
    const u = o.unlock;
    if (!u) continue;
    const hit = u.bossFloor === floor || (u.december && floor === 0 && isDecember(date));
    if (hit && unlock('outfits', id)) got.push(o.name);
  }
  return got;
}

// Called when a run ends (run totals have already been updated).
export function outfitsForRunEnd() {
  const t = getProgress().totals;
  const got = [];
  for (const [id, o] of Object.entries(OUTFITS)) {
    if (o.unlock?.runs && t.runs >= o.unlock.runs && unlock('outfits', id)) got.push(o.name);
  }
  return got;
}
