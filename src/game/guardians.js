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
    cheer: 'Haru does a victory spin and barks at the sky. He knew you could do it.',
    comfort: 'Haru rests his head on your knee. Big brother says: try again tomorrow.',
    name: 'Haru', floor: 0, kind: 'Shiba Inu', art: 'haru',
    blurb: 'The big brother shiba. Sees you off at the bottom of the tower.',
    line: 'Before the climb, Haru hands you a little bag. Pick one thing to take with you.',
    dog: true, pets: ['Woof!', '*happy tail wag*', 'Haru leans into your hand.', 'Haru does a proud little sit.'],
  },
  issei: {
    cheer: 'Issei does zoomies around the whole rooftop. Twice.',
    comfort: 'Issei brings you his favorite toy. You can borrow it for the next climb.',
    name: 'Issei', floor: 1, kind: 'Shiba Inu', art: 'issei',
    blurb: "Haru's little brother. Zoomies first, questions later.",
    line: 'Issei zooms down the hallway with something in his mouth and drops it at your feet. Pick one.',
    dog: true, small: true, pets: ['Yip yip!', '*zoomies*', 'Issei flops over for belly rubs.', 'Issei licks your hand.'],
  },
  hana: {
    cheer: 'Hana wakes up just long enough to wag at you, then naps on your feet.',
    comfort: 'Hana curls up next to you in a blanket. Everything is warmer now.',
    name: 'Hana', floor: 1, kind: 'Wiener dog', art: 'hana',
    blurb: 'A long, sleepy pup who knows where every warm blanket is.',
    line: 'Hana pokes her nose out of a blanket pile and nudges something toward you. Pick one.',
    dog: true, small: true, pets: ['Boof.', '*sleepy wag*', 'Hana snuggles into your hand.', 'Hana sighs happily.'],
  },
  kaiba: {
    cheer: 'Kaiba barks at the tower like he beat it himself. Good team.',
    comfort: 'Kaiba stands guard over you while you catch your breath.',
    name: 'Kaiba', floor: 1, kind: 'Wiener dog', art: 'kaiba',
    blurb: 'A small dog with a very big bark. Guards the stairs like a pro.',
    line: 'Kaiba barks at the stairs until they behave, then trots back with a gift. Pick one.',
    dog: true, small: true, pets: ['BARK!', '*proud wiggle*', 'Kaiba guards your hand now.', 'Kaiba rolls over. Just this once.'],
  },
  sushiQueen: {
    cheer: 'The Sushi Queen nods. "Worthy of the finest table at the Palace."',
    comfort: 'The Sushi Queen sets down a plate of tamago. "Eat. Then climb again."',
    name: 'The Sushi Queen', floor: 2, kind: 'Sushi Palace royalty', art: 'sushiQueen',
    blurb: 'She rules the Sushi Palace and only hands her sushi to climbers she believes in.',
    line: 'The Sushi Queen glides in on a conveyor belt. "Only the finest for the top floor." Pick one.',
    pets: ['"How bold. I approve."', '"Careful, the crown is real."', '"Pat pat. Very well."', '"You may have one extra ginger."'],
  },
  nyx: {
    cheer: 'Nyx throws pink confetti everywhere. "Told you mischief works!"',
    comfort: 'Nyx pokes your cheek. "That tower cheated. We get it next time, hehe."',
    name: 'Nyx', floor: 2, kind: 'Mischief imp', art: 'nyx',
    blurb: 'A cute little troublemaker in a black hood. Loves pranks, hexes and the color pink.',
    line: 'Nyx drops from the ceiling, giggling. "You look like you need some mischief." Pick one.',
    pets: ['"Hehe! Again!"', '"Don\'t tell anyone I liked that."', '"Mischief managed."', '"Okay, ONE more."'],
  },
  // The partner guardian: you meet whoever you're NOT playing as.
  toni: {
    cheer: 'Toni lifts you up in a big hug. "I\'m so proud of you!"',
    comfort: 'Toni hands you a warm drink. "You did great. Let\'s go again together."',
    name: 'Toni', floor: 2, kind: 'Husband', art: 'toni', only: 'jenny',
    blurb: "Jenny's husband. Shows up at the top floor with everything she might need.",
    line: 'Toni is waiting at the top of the stairs with a bag he packed just for you. Pick one.',
    pets: ['"Love you too."', 'Toni pats your head back.', '"You got this."', '"Snack first, then the boss."'],
  },
  jenny: {
    cheer: 'Jenny jumps into your arms. "You\'re my hero!"',
    comfort: 'Jenny hugs you tight. "That\'s okay! I made you a snack for next time."',
    name: 'Jenny', floor: 2, kind: 'Wife', art: 'jenny', only: 'toni',
    blurb: "Toni's wife. Brings cute little gifts she made for him.",
    line: 'Jenny runs up and hands you a tiny decorated box. "I made these for you!" Pick one.',
    pets: ['"Hehe, cutie!"', 'Jenny gives you a big hug.', '"Go get them!"', '"Don\'t forget to eat!"'],
  },
};

// only: the guardian shows up only when you play as that character.
// The last guardian you met this run (for the run-end cameo).
export const lastGuardian = (run) => [2, 1, 0].map((f) => run.guardianOf?.[f]).find((g) => GUARDIANS[g]) || null;

export const guardiansOn = (floor, character) => Object.keys(GUARDIANS).filter((id) => GUARDIANS[id].floor === floor && (!character || !GUARDIANS[id].only || GUARDIANS[id].only === character));

// The guardian waiting on a floor: picked once per run, then kept (like bosses).
export function guardianFor(run, floor = run.act) {
  run.guardianOf ||= {};
  const list = guardiansOn(floor, run.character);
  if (!list.length) return null;
  if (!list.includes(run.guardianOf[floor])) run.guardianOf[floor] = list[Math.floor(Math.random() * list.length)];
  return run.guardianOf[floor];
}
