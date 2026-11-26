// Progress save: everything the game remembers between runs.
// Wins, unlocks, run history, and every card / charm / enemy / event /
// guardian Jenny has come across (the collection book reads this).
//
// Portability rules (so the Godot port can load the same file):
//   • Plain JSON only: objects, arrays, strings, numbers, booleans. No Sets,
//     Maps, Dates, undefined or functions.
//   • Every id is the game's stable internal id string (CARDS keys, etc.).
//   • Numbers are whole numbers. (Godot's JSON parser reads all numbers as
//     floats; the port should int() them on load.)
//   • Timestamps are Unix seconds.
//   • `version` goes up whenever the shape changes, with a step in MIGRATIONS.
// The full format is written down in docs/save-format.md.

import { readDoc, writeDoc, readLegacy } from '../platform/storage.js';

export const PROGRESS_VERSION = 1;
const DOC = 'progress';
const HISTORY_MAX = 30;

const now = () => Math.floor(Date.now() / 1000);

export function blankProgress() {
  return {
    version: PROGRESS_VERSION,
    created_at: now(),
    totals: { runs: 0, wins: 0, best_floor: 0, defeated: 0 },
    characters: { jenny: blankCharacter() },
    unlocks: { characters: ['jenny'], outfits: [] },
    cosmetics: { jenny: 'date', toni: 'date' }, // outfit set each character wears (see outfits.js)
    collection: {
      cards: {},     // id -> { seen, taken }
      charms: {},    // id -> { seen, taken }
      enemies: {},   // id -> { met, defeated }
      events: {},    // id -> { met }
      snacks: {},    // id -> { seen, taken }
      guardians: {}, // id -> { met }
    },
    history: [],     // newest first, at most HISTORY_MAX entries
  };
}

function blankCharacter() {
  return { runs: 0, wins: 0, best_floor: 0 };
}

// Each step takes a save at version N-1 and returns it at version N.
// Step 1 builds the first progress save from the old "sm.stats.v2" record.
const MIGRATIONS = {
  1: () => {
    const p = blankProgress();
    const old = readLegacy('sm.stats.v2');
    if (old) {
      p.totals.runs = old.runs | 0;
      p.totals.wins = old.wins | 0;
      p.totals.best_floor = old.bestFloor | 0;
      p.totals.defeated = old.kills | 0;
      Object.assign(p.characters.jenny, { runs: p.totals.runs, wins: p.totals.wins, best_floor: p.totals.best_floor });
    }
    delete p.cosmetics; // filled from the old look setting in fillDefaults
    return p;
  },
};

// Fill any fields a save is missing (e.g. a newly added collection page),
// so older saves never crash newer code.
function fillDefaults(p) {
  const base = blankProgress();
  if (!p.cosmetics) {
    // Saves from before outfits: keep the look the player already had.
    // Old looks: sparkle / classic = the cat hoodie, lilac = Lilac Twins.
    const old = globalThis.localStorage?.getItem?.('sm.look');
    const had = old === 'lilac' ? 'lilac' : (old || p.totals?.runs > 0) ? 'cat' : 'date';
    p.cosmetics = { jenny: had, toni: 'date' };
    if (had === 'lilac') { p.unlocks ||= {}; p.unlocks.outfits = [...(p.unlocks.outfits || []), 'lilac']; }
  }
  for (const k of Object.keys(base)) if (p[k] === undefined) p[k] = base[k];
  for (const k of Object.keys(base.totals)) if (p.totals[k] === undefined) p.totals[k] = 0;
  for (const k of Object.keys(base.collection)) p.collection[k] ||= {};
  p.unlocks.characters ||= ['jenny'];
  p.unlocks.outfits ||= [];
  for (const c of p.unlocks.characters) p.characters[c] ||= blankCharacter();
  return p;
}

let cache = null;
let dirty = false;

export function getProgress() {
  if (cache) return cache;
  let p = readDoc(DOC);
  let v = p?.version | 0;
  if (v > PROGRESS_VERSION) {
    // Saved by a newer build. Use it read-only rather than wiping it.
    console.warn('Progress save is from a newer version; not saving over it.');
    cache = fillDefaults(p);
    cache.readOnly = true;
    return cache;
  }
  while (v < PROGRESS_VERSION) { v += 1; p = MIGRATIONS[v](p); p.version = v; }
  cache = fillDefaults(p);
  if ((readDoc(DOC)?.version | 0) !== PROGRESS_VERSION) save();
  return cache;
}

function save() {
  if (!cache || cache.readOnly) return;
  const { readOnly, ...data } = cache;
  writeDoc(DOC, data);
}

// Batch many notes from one screen into one write.
function touch() {
  if (dirty) return;
  dirty = true;
  queueMicrotask(() => { dirty = false; save(); });
}

// ---------- collection ----------
function bump(page, id, field) {
  if (!id) return;
  const book = getProgress().collection[page];
  const entry = (book[id] ||= {});
  entry[field] = (entry[field] | 0) + 1;
  touch();
}

export const noteCardSeen = (id) => bump('cards', id, 'seen');
export const noteCardTaken = (id) => { bump('cards', id, 'seen'); bump('cards', id, 'taken'); };
export const noteCharmSeen = (id) => bump('charms', id, 'seen');
export const noteCharmTaken = (id) => { bump('charms', id, 'seen'); bump('charms', id, 'taken'); };
export const noteSnackSeen = (id) => bump('snacks', id, 'seen');
export const noteSnackTaken = (id) => { bump('snacks', id, 'seen'); bump('snacks', id, 'taken'); };
export const noteEnemyMet = (id) => bump('enemies', id, 'met');
export const noteEnemyDefeated = (id) => bump('enemies', id, 'defeated');
export const noteEventMet = (id) => bump('events', id, 'met');
export const noteGuardianMet = (id) => bump('guardians', id, 'met');

export function isFound(page, id) {
  const e = getProgress().collection[page]?.[id];
  return !!e && ((e.taken | 0) > 0 || (e.met | 0) > 0 || (e.defeated | 0) > 0 || (e.seen | 0) > 0);
}

// ---------- unlocks ----------
export const isUnlocked = (kind, id) => getProgress().unlocks[kind]?.includes(id) ?? false;
export function unlock(kind, id) {
  const u = getProgress().unlocks;
  u[kind] ||= [];
  if (u[kind].includes(id)) return false;
  u[kind].push(id);
  if (kind === 'characters') getProgress().characters[id] ||= blankCharacter();
  save();
  return true;
}

// ---------- cosmetics ----------
export function setCosmetic(character, id) {
  getProgress().cosmetics[character] = id;
  save();
}

// ---------- end of a run ----------
// `summary` is a plain object built by the caller from the finished run.
export function recordRunEnd(summary) {
  const p = getProgress();
  const ch = (p.characters[summary.character] ||= blankCharacter());
  p.totals.runs += 1;
  ch.runs += 1;
  if (summary.won) { p.totals.wins += 1; ch.wins += 1; }
  p.totals.best_floor = Math.max(p.totals.best_floor, summary.floors);
  ch.best_floor = Math.max(ch.best_floor, summary.floors);
  p.totals.defeated += summary.defeated;
  p.history.unshift({ ended_at: now(), ...summary });
  p.history.length = Math.min(p.history.length, HISTORY_MAX);
  save();
  return p;
}
