// Guardians: family members who meet you at the start of a floor and hand
// you a charm (pick 1 of 3 from their own set; see pool 'haru' and
// pool 'guardian' + `from` in charms.js).
//   Floor 1: Haru, always.
//   Floor 2: one of the floor's guardians, picked when you get there. Their charms are solid.
//   Floor 3: same, and their charms are the strongest, made to help a build snowball.
// floor: 0-based floor index. Add a guardian by adding a row here and 6 charms
// with pool: 'guardian', from: '<id>'.

export const GUARDIANS = {
  haru: {
    name: 'Haru', floor: 0, kind: 'Shiba Inu', art: 'haru',
    blurb: 'The big brother shiba. Sees you off at the bottom of the tower.',
    line: 'Before the climb, Haru hands you a little bag. Pick one thing to take with you.',
  },
  issei: {
    name: 'Issei', floor: 1, kind: 'Shiba Inu', art: 'issei',
    blurb: "Haru's little brother. Zoomies first, questions later.",
    line: 'Issei zooms down the hallway with something in his mouth and drops it at your feet. Pick one.',
  },
  hana: {
    name: 'Hana', floor: 1, kind: 'Wiener dog', art: 'hana',
    blurb: 'A long, sleepy pup who knows where every warm blanket is.',
    line: 'Hana pokes her nose out of a blanket pile and nudges something toward you. Pick one.',
  },
  kaiba: {
    name: 'Kaiba', floor: 1, kind: 'Wiener dog', art: 'kaiba',
    blurb: 'A small dog with a very big bark. Guards the stairs like a pro.',
    line: 'Kaiba barks at the stairs until they behave, then trots back with a gift. Pick one.',
  },
  sushiQueen: {
    name: 'The Sushi Queen', floor: 2, kind: 'Sushi Palace royalty', art: 'sushiQueen',
    blurb: 'She rules the Sushi Palace and only hands her sushi to climbers she believes in.',
    line: 'The Sushi Queen glides in on a conveyor belt. "Only the finest for the top floor." Pick one.',
  },
};

export const guardiansOn = (floor) => Object.keys(GUARDIANS).filter((id) => GUARDIANS[id].floor === floor);

// The guardian waiting on a floor: picked once per run, then kept (like bosses).
export function guardianFor(run, floor = run.act) {
  run.guardianOf ||= {};
  const list = guardiansOn(floor);
  if (!list.length) return null;
  if (!list.includes(run.guardianOf[floor])) run.guardianOf[floor] = list[Math.floor(Math.random() * list.length)];
  return run.guardianOf[floor];
}
