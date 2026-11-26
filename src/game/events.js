// "?" rooms. Each option: label, (optional) note, can(run) -> bool, go(run, api) -> result text.
// api: { addCard(id), randomCard(rarity?), styleCard(arch, rarity?), addCharm(id?), upgradeAll(pred),
//        pickRemove(), pickUpgrade(), pickCopy(), addSnack(id?, paid?), pickSnack(title) -> name or null }
//   addSnack is async: with a full bar it offers a swap, and leaving the snack refunds `paid`.
//
// requires(run): the event stays in the deck but is skipped until true; needs: the same rule in plain words.
// gives: { cards, charms, snacks } – the event-only cards/charms/snacks it can hand out (the catalog lists where they come from).
//
// SPECIAL_EVENTS are conditional: each one waits for a deck that leans into
// its style. From Floor 2 on, the first "?" room after you qualify is a
// special event, at most one per floor, and each shows up once per run. Their boons (charms with
// pool 'special') only come from here.

import { T } from './terms.js';
import { CARDS, ARCHES } from './cards.js';
import { snackRoom, snackCount, SNACKS } from './snacks.js';

// Non-starter cards in the deck tagged with this style (hybrids count for both).
export function styleCount(run, arch) {
  return run.deck.filter((c) => { const d = CARDS[c.id]; return d.rarity !== 'starter' && (d.arch === arch || d.arch2 === arch); }).length;
}
const hybridCount = (run) => run.deck.filter((c) => CARDS[c.id].arch2).length;
export const SPECIAL_NEED = 3; // style cards needed to open a style's special event
const ofStyle = (arch) => (d) => d.arch === arch || d.arch2 === arch;
const upgradeText = (n, what) => (n ? `${n} ${what} card${n > 1 ? 's' : ''} upgraded!` : `No ${what} cards left to upgrade.`);

const rareSnack = () => { const r = Object.keys(SNACKS).filter((k) => SNACKS[k].rarity === 'rare'); return r[Math.floor(Math.random() * r.length)]; };
const queenIsGuardian = (r) => r.guardianOf?.[2] === 'sushiQueen';

export const EVENTS = [
  {
    id: 'claw',
    title: 'Claw Machine',
    text: `A claw machine full of tiny charms blinks at you. One try costs 25 ${T.coins}.`,
    options: [
      { label: `Play (25 ${T.coins})`, can: (r) => r.coins >= 25, go: (r, api) => {
        r.coins -= 25;
        if (Math.random() < 0.55) { const c = api.addCharm(); return `The claw holds! You win ${c}.`; }
        return 'So close… the charm slips out of the claw.';
      } },
      { label: 'Walk away', go: () => `You keep your ${T.coins}.` },
    ],
  },
  {
    id: 'lostfound',
    title: 'Lost & Found',
    text: 'A box behind the counter is labelled "LOST & FOUND". Something shiny is inside, but the box crackles with static.',
    options: [
      { label: 'Take the shiny thing', note: 'Gain a charm. Add a Static curse.', go: (r, api) => { const c = api.addCharm(); api.addCard('static'); return `You got ${c}. Your deck feels a little fuzzy.`; } },
      { label: 'Leave it', go: () => 'Not yours to take.' },
    ],
  },
  {
    id: 'vending',
    title: 'Vending Machine',
    text: 'A vending machine hums in the corner. The coin slot is taped over, but the snacks look great.',
    options: [
      { label: `Buy a snack (20 ${T.coins})`, note: 'Gain a random snack.', can: (r) => r.coins >= 20, go: async (r, api) => { r.coins -= 20; return `Clunk! Out drops ${await api.addSnack(null, 20)}.`; } },
      { label: 'Give it a kick', note: `Take 5 damage. Maybe ${T.coins} fall out.`, go: (r) => {
        r.hp = Math.max(1, r.hp - 5);
        if (Math.random() < 0.6) { r.coins += 35; return `Ouch! …but 35 ${T.coins} rattle out.`; }
        return 'Ouch. Nothing happens.';
      } },
      { label: 'Leave', go: () => 'You move on.' },
    ],
  },
  {
    id: 'booth',
    requires: (r) => r.deck.length >= 6,
    needs: 'a deck of 6+ cards',
    title: 'Photo Booth',
    text: 'A sticker photo booth. Strike a pose and change something about yourself.',
    options: [
      { label: 'Cute pose', note: 'Upgrade a card.', go: async (r, api) => (await api.pickUpgrade()) },
      { label: 'Cool pose', note: `Remove a card. Lose 6 ${T.hp}.`, go: async (r, api) => { r.hp = Math.max(1, r.hp - 6); return api.pickRemove(); } },
      { label: 'Skip', go: () => 'Maybe next time.' },
    ],
  },
  {
    id: 'gacha',
    title: 'Gacha Capsule',
    text: `A capsule toy machine with card capsules inside. 20 ${T.coins} per spin.`,
    options: [
      { label: `Spin (20 ${T.coins})`, can: (r) => r.coins >= 20, go: (r, api) => {
        r.coins -= 20;
        const roll = Math.random();
        const rar = roll < 0.12 ? 'rare' : roll < 0.5 ? 'uncommon' : 'common';
        const name = api.addCard(api.randomCard(rar));
        return `Pop! ${rar === 'uncommon' ? 'An' : 'A'} ${rar} card: ${name}.`;
      } },
      { label: 'Leave', go: () => 'You resist the gacha.' },
    ],
  },
  {
    id: 'forum',
    title: 'Forum Thread',
    text: `Someone left a forum open on a PC. The thread title: "best ${T.combo} builds??"`,
    options: [
      { label: 'Read the guide', note: 'Gain a random uncommon card.', go: (r, api) => `You learned ${api.addCard(api.randomCard('uncommon'))}.` },
      { label: 'Read the comments', note: `Lose 4 ${T.hp}. Gain 50 ${T.coins}.`, go: (r) => { r.hp = Math.max(1, r.hp - 4); r.coins += 50; return `The comments hurt… but someone tipped you 50 ${T.coins}.`; } },
    ],
  },
  {
    id: 'nap',
    title: 'Comfy Booth',
    text: 'An empty booth with a blanket and a reclining chair.',
    options: [
      { label: 'Short nap', note: `Heal 25% of max ${T.hp}.`, go: (r) => { const h = Math.round(r.maxHp * 0.25); r.hp = Math.min(r.maxHp, r.hp + h); return `You wake up refreshed. +${h} ${T.hp}.`; } },
      { label: 'Stretch', note: `+5 max ${T.hp}.`, go: (r) => { r.maxHp += 5; r.hp += 5; return `Stretch break. +5 max ${T.hp}.`; } },
    ],
  },
  {
    id: 'stranger',
    requires: (r) => r.deck.length >= 8,
    needs: 'a deck of 8+ cards',
    title: 'Mysterious Gamer',
    text: '"Wanna trade?" A gamer in a mask offers to swap one of your cards for something rare.',
    options: [
      { label: 'Trade', note: 'Remove a card, gain a random rare card.', go: async (r, api) => { const out = await api.pickRemove(); if (out.startsWith('No')) return out; return `${out} You got ${api.addCard(api.randomCard('rare'))}.`; } },
      { label: 'No thanks', go: () => '"Suit yourself."' },
    ],
  },
  {
    id: 'karaoke', gives: { cards: ['powerBallad'], charms: ['goldenMic'] },
    title: 'Karaoke Room',
    text: 'Room 4 has a free mic and a song list as thick as a phone book. Someone left the volume on max.',
    options: [
      { label: 'Belt out a ballad', note: `Lose 6 ${T.hp}. Gain Power Ballad (event card).`, go: (r, api) => { r.hp = Math.max(1, r.hp - 6); return `Your voice cracks, but the crowd loves it. You learned ${api.addCard('powerBallad')}.`; } },
      { label: 'Pocket the golden mic', note: 'Gain Golden Mic (event charm). Add a Static curse.', go: (r, api) => { api.addCard('static'); return `Nobody saw that. You got ${api.addCharm('goldenMic')}, and your deck feels a little fuzzy.`; } },
      { label: 'Sing a duet', note: 'Heal 10.', go: (r) => { r.hp = Math.min(r.maxHp, r.hp + 10); return `A stranger joins in. You feel great. +10 ${T.hp}.`; } },
      { label: 'Close the door', go: () => 'Peace and quiet.' },
    ],
  },
  {
    id: 'copier',
    requires: (r) => r.deck.length >= 6,
    needs: 'a deck of 6+ cards',
    title: 'Broken Photocopier',
    text: 'The photocopier is blinking "PAPER JAM", but it still prints if you hold the lid down.',
    options: [
      { label: 'Copy a card', note: 'Copy a card in your deck. Add a Static curse.', go: async (r, api) => { const out = await api.pickCopy(); if (out.startsWith('No')) return out; api.addCard('static'); return `${out} The copier spits out a fuzzy page too.`; } },
      { label: 'Leave it jammed', go: () => 'Someone else can deal with it.' },
    ],
  },
  {
    id: 'ramen', gives: { charms: ['luckyChopsticks'] },
    title: 'Cup Ramen Station',
    text: 'A hot water tap and a shelf of cup ramen. One says "EXTREME FIRE NOODLE" in big red letters.',
    options: [
      { label: `Regular cup (10 ${T.coins})`, note: 'Heal 15.', can: (r) => r.coins >= 10, go: (r) => { r.coins -= 10; r.hp = Math.min(r.maxHp, r.hp + 15); return `Slurp. +15 ${T.hp}.`; } },
      { label: 'Extreme Fire Noodle', note: `Lose 5 ${T.hp}. +2 ${T.spirit} in your next fight.`, go: (r) => { r.hp = Math.max(1, r.hp - 5); r.nextFight = { strength: 2 }; return 'SO SPICY. You are fired up for the next fight.'; } },
      { label: `Lucky chopsticks (25 ${T.coins})`, note: 'Gain Lucky Chopsticks (event charm).', can: (r) => r.coins >= 25, go: (r, api) => { r.coins -= 25; return `They say these never drop a noodle. You got ${api.addCharm('luckyChopsticks')}.`; } },
      { label: 'Not hungry', go: () => 'You move on.' },
    ],
  },
  {
    id: 'kitten', gives: { charms: ['kittenBell'] },
    title: 'Lost Kitten',
    text: 'A tiny kitten is hiding under a desk, meowing at everyone who walks by.',
    options: [
      { label: 'Walk it home', note: 'Remove a card.', go: async (r, api) => `The owner hugs you. ${await api.pickRemove()}` },
      { label: 'Follow it', note: `Lose 4 ${T.hp}. Gain Kitten Bell (event charm).`, go: (r, api) => { r.hp = Math.max(1, r.hp - 4); return `It leads you through a nest of cables, then drops its bell at your feet. You got ${api.addCharm('kittenBell')}.`; } },
      { label: 'Give it pets', note: `Heal 6. +3 max ${T.hp}.`, go: (r) => { r.maxHp += 3; r.hp = Math.min(r.maxHp, r.hp + 9); return `Purrrr. +3 max ${T.hp} and +6 ${T.hp}.`; } },
    ],
  },
  {
    id: 'wifi', gives: { charms: ['vpnDongle'] },
    title: 'Free Wi-Fi?',
    text: 'A network called "FREE_WIFI_NOT_A_SCAM" pops up. The signal is very strong.',
    options: [
      { label: 'Connect', note: `Gain 45 ${T.coins}. Add a Spam card to your deck.`, go: (r, api) => { r.coins += 45; api.addCard('spam'); return `A pop-up hands you 45 ${T.coins}… and something else.`; } },
      { label: `Buy a VPN (30 ${T.coins})`, note: 'Gain VPN Dongle (event charm).', can: (r) => r.coins >= 30, go: (r, api) => { r.coins -= 30; return `Safe and sound. You got ${api.addCharm('vpnDongle')}.`; } },
      { label: 'Stay offline', go: () => 'Smart choice.' },
    ],
  },
  {
    id: 'samples', gives: { charms: ['hamsterCheeks'] },
    title: 'Free Samples',
    text: 'A worker with a tray of tiny cups calls out: "Free samples! Try one, try two, nobody is counting!"',
    options: [
      { label: 'Take a sample', note: 'Gain a random snack.', go: async (r, api) => `Tasty. You keep ${await api.addSnack()} for later.` },
      { label: 'Stuff your cheeks', note: `Lose 5 ${T.hp}. Gain Hamster Cheeks (event charm): +1 snack slot.`, go: (r, api) => { r.hp = Math.max(1, r.hp - 5); return `Brain freeze! But you got ${api.addCharm('hamsterCheeks')}.`; } },
      { label: 'Eat them all right here', note: 'Heal 12.', go: (r) => { r.hp = Math.min(r.maxHp, r.hp + 12); return `The worker looks impressed. +12 ${T.hp}.`; } },
    ],
  },
  {
    id: 'snackswap',
    requires: (r) => snackCount(r) >= 1,
    needs: 'a snack in your snack bar',
    title: 'Snack Swap',
    text: 'A kid at the counter has a binder full of rare cards and very empty pockets. "I\'ll trade you. Snacks only."',
    options: [
      { label: 'Trade a snack for a card', note: 'Give a snack. Gain a random uncommon card.', go: async (r, api) => { const s = await api.pickSnack('Trade which snack?'); if (!s) return 'You keep your snacks.'; return `${s} for ${api.addCard(api.randomCard('uncommon'))}. Deal!`; } },
      { label: 'Trade 2 snacks for a charm', note: 'Give 2 snacks. Gain a random charm.', can: (r) => snackCount(r) >= 2, go: async (r, api) => {
        const a = await api.pickSnack('Trade which snack? (1 of 2)'); if (!a) return 'You keep your snacks.';
        const b = await api.pickSnack('Trade which snack? (2 of 2)'); if (!b) { return `The kid takes ${a} and runs. Rude.`; }
        return `The kid unzips a pouch and hands over ${api.addCharm()}.`;
      } },
      { label: 'Sell a snack', note: `Give a snack. Gain 40 ${T.coins}.`, go: async (r, api) => { const s = await api.pickSnack('Sell which snack?'); if (!s) return 'You keep your snacks.'; r.coins += 40; return `${s} sold for 40 ${T.coins}.`; } },
      { label: 'No deal', go: () => '"Your loss."' },
    ],
  },
  {
    id: 'konbini', gives: { charms: ['pocketFridge'] },
    title: 'Midnight Konbini Run',
    text: 'The konbini downstairs is open all night. The fridges hum, and the onigiri are half price.',
    options: [
      { label: `Stock up (35 ${T.coins})`, note: 'Fill all your empty snack slots.', can: (r) => r.coins >= 35 && snackRoom(r) > 0, go: async (r, api) => { r.coins -= 35; const got = []; while (snackRoom(r)) got.push(await api.addSnack()); return `Your bag is full: ${got.join(', ')}.`; } },
      { label: `Buy a pocket fridge (60 ${T.coins})`, note: 'Gain Pocket Fridge (event charm): fill empty snack slots on each new floor.', can: (r) => r.coins >= 60, go: (r, api) => { r.coins -= 60; return `It even has a tiny light inside. You got ${api.addCharm('pocketFridge')}.`; } },
      { label: 'Go back to bed', note: 'Heal 8.', go: (r) => { r.hp = Math.min(r.maxHp, r.hp + 8); return `Sleep is free. +8 ${T.hp}.`; } },
    ],
  },
  {
    id: 'cottoncandy', gives: { snacks: ['cottonCandy', 'rainbowCotton'] },
    title: 'The Cotton Candy Lady',
    text: 'A lady with a squeaky cart spins sugar into fluffy clouds. "Pink or rainbow, sweetie?"',
    options: [
      { label: `Pink cotton candy (15 ${T.coins})`, note: 'Gain Cotton Candy (event snack).', can: (r) => r.coins >= 15, go: async (r, api) => { r.coins -= 15; return `So fluffy. You got ${await api.addSnack('cottonCandy', 15)}.`; } },
      { label: `Rainbow cotton candy (30 ${T.coins})`, note: 'Gain Rainbow Cotton Candy (event snack).', can: (r) => r.coins >= 30, go: async (r, api) => { r.coins -= 30; return `It's bigger than your head. You got ${await api.addSnack('rainbowCotton', 30)}.`; } },
      { label: 'Help her spin', note: 'Upgrade a card.', go: async (r, api) => `"You're a natural!" ${await api.pickUpgrade()}` },
    ],
  },
  {
    id: 'sweetpotato', gives: { snacks: ['sweetPotato'] },
    title: 'Sweet Potato Cart',
    text: 'A grandpa roasts sweet potatoes in an old drum by the door. The whole floor smells amazing.',
    options: [
      { label: `Buy one for later (10 ${T.coins})`, note: 'Gain Roasted Sweet Potato (event snack).', can: (r) => r.coins >= 10, go: async (r, api) => { r.coins -= 10; return `Wrapped in newspaper, still warm. You got ${await api.addSnack('sweetPotato', 10)}.`; } },
      { label: 'Share one with him', note: 'Heal 8.', go: (r) => { r.hp = Math.min(r.maxHp, r.hp + 8); return `He tells you about the café in the old days. +8 ${T.hp}.`; } },
    ],
  },
  {
    id: 'dalgona', gives: { snacks: ['dalgona'] },
    title: 'Dalgona Challenge',
    text: 'A booth with a sign: "Carve out the shape without breaking it and win a prize!" A needle and a honeycomb candy wait on the table.',
    options: [
      { label: 'Try the star (easy)', note: `70%: gain Dalgona Candy (event snack). Fail: lose 3 ${T.hp}.`, go: async (r, api) => {
        if (Math.random() < 0.7) return `Perfect star! You got ${await api.addSnack('dalgona')}.`;
        r.hp = Math.max(1, r.hp - 3); return `Crack. You poke your finger trying to fix it. -3 ${T.hp}.`;
      } },
      { label: 'Try the heart (hard)', note: `35%: gain Dalgona Candy and 60 ${T.coins}. Fail: lose 6 ${T.hp}.`, go: async (r, api) => {
        if (Math.random() < 0.35) { r.coins += 60; return `Flawless heart! The booth pays 60 ${T.coins} and you keep ${await api.addSnack('dalgona')}.`; }
        r.hp = Math.max(1, r.hp - 6); return `It snaps right through the middle. -6 ${T.hp}.`;
      } },
      { label: 'Walk away', go: () => 'Not today, sugar.' },
    ],
  },
  {
    // The Sushi Queen's own restaurant. Floor 3 only. If she was your floor 3 guardian, she has a treat for you.
    id: 'sushiPalace', art: 'sushiQueen', gives: { cards: ['sushiRoll'] },
    requires: (r) => r.act === 2,
    needs: 'Floor 3',
    title: 'The Sushi Palace',
    text: 'A paper lantern glows over a tiny counter that should not fit in a net café. The Sushi Queen looks up from her knife. "Ah. A customer."',
    options: [
      { label: `Chef's choice (50 ${T.coins})`, note: 'Gain a random rare snack.', can: (r) => r.coins >= 50, go: async (r, api) => { r.coins -= 50; return `She slides a lacquered box across the counter: ${await api.addSnack(rareSnack(), 50)}.`; } },
      { label: `Sushi Roll platter (60 ${T.coins})`, note: `Add 2 Sushi Roll cards (deal 7, +1 ${T.energy}).`, can: (r) => r.coins >= 60, go: (r, api) => { r.coins -= 60; api.addCard('sushiRoll'); return `"Eat them hot." You got 2 × ${api.addCard('sushiRoll')}.`; } },
      { label: 'Bow to the Queen', note: `Only if she was your guardian: heal 15 and a free rare snack.`, can: queenIsGuardian, go: async (r, api) => { r.hp = Math.min(r.maxHp, r.hp + 15); return `"For my favorite climber." +15 ${T.hp} and ${await api.addSnack(rareSnack())}, on the house.`; } },
      { label: 'Just looking', go: () => '"Hmph. Come back when you are hungry."' },
    ],
  },
];

// ---------- special events ----------
const special = (arch, ev) => ({
  ...ev, special: true, style: arch,
  requires: ev.requires || ((r) => styleCount(r, arch) >= SPECIAL_NEED),
  needs: ev.needs || `${SPECIAL_NEED}+ ${ARCHES[arch].name} cards`,
});
// The middle option of most special events: upgrade every card of that style.
const upgradeStyle = (arch, label) => ({
  label, note: `Upgrade all your ${ARCHES[arch].name} cards.`,
  go: (r, api) => upgradeText(api.upgradeAll(ofStyle(arch)), ARCHES[arch].name),
});

export const SPECIAL_EVENTS = [
  special('dreamy', {
    id: 'dreamworld', boon: 'lucidDream', gives: { cards: ['sheepStampede'] },
    title: 'Dreamworld',
    text: 'You nod off at a PC and wake up somewhere soft and purple. Sheep float past. A sign says "Stay as long as you like."',
    options: [
      { label: 'Drift deeper', note: `Gain Lucid Dream: the first Dreamy card you match each turn applies 1 more ${T.sleepy}.`, go: (r, api) => `You learn to steer your dreams. ${api.addCharm('lucidDream')}!` },
      upgradeStyle('dreamy', 'Count the stars'),
      { label: 'Chase the sheep', note: 'Gain Sheep Stampede (event card).', go: (r, api) => `The sheep follow you home. You got ${api.addCard('sheepStampede')}.` },
    ],
  }),
  special('cozy', {
    id: 'grandma', boon: 'grandmaSoup', gives: { cards: ['dumplings'] },
    title: "Grandma's Kitchen",
    text: 'Behind a noren curtain there is a tiny kitchen. A grandma waves you in: "You look hungry. Sit, sit!"',
    options: [
      { label: 'Eat the soup', note: `Gain Grandma's Soup: all your healing is ${T.cozy}.`, go: (r, api) => `Warm all the way down. ${api.addCharm('grandmaSoup')}!` },
      upgradeStyle('cozy', 'Help with the dishes'),
      { label: 'Take leftovers', note: "Gain Grandma's Dumplings (event card).", go: (r, api) => `"Eat well!" You got ${api.addCard('dumplings')}.` },
    ],
  }),
  special('glitch', {
    id: 'backroom', boon: 'rootAccess', gives: { cards: ['zeroDay'] },
    title: 'The Back Room',
    text: 'A locked server closet, but the admin password is on a sticky note on the door. The screen inside glows green.',
    options: [
      { label: 'Log in as admin', note: `Gain Root Access: your Glitch cards apply 2 more ${T.glitch}.`, go: (r, api) => `Access granted. ${api.addCharm('rootAccess')}!` },
      upgradeStyle('glitch', 'Install updates'),
      { label: 'Copy the exploit', note: 'Gain Zero Day (event card).', go: (r, api) => `You save it to a USB stick. You got ${api.addCard('zeroDay')}.` },
    ],
  }),
  special('guard', {
    id: 'bouncerclass', boon: 'bouncerStance', gives: { cards: ['velvetRope'] },
    title: 'Bouncer Lessons',
    text: 'The café bouncer is on break. "You block like a pro. Want to learn the real stance?"',
    options: [
      { label: 'Learn the stance', note: `Gain Bouncer's Stance: your Guard cards give 2 more ${T.block}.`, go: (r, api) => `"Feet wide. Chin down." ${api.addCharm('bouncerStance')}!` },
      upgradeStyle('guard', 'Run drills'),
      { label: 'Borrow the rope', note: 'Gain Velvet Rope (event card).', go: (r, api) => `"Bring it back." You got ${api.addCard('velvetRope')}.` },
    ],
  }),
  special('memory', {
    id: 'palace', boon: 'palaceKey', gives: { cards: ['dejaVu'] },
    title: 'Memory Palace',
    text: 'A door you have never noticed opens into a hall of photos: every card you have ever matched, hung in neat rows.',
    options: [
      { label: 'Take the key', note: 'Gain Palace Key: the first Memory card you match each turn reveals 1 more card.', go: (r, api) => `You will never forget a face. ${api.addCharm('palaceKey')}!` },
      upgradeStyle('memory', 'Study the photos'),
      { label: 'Take a photo', note: 'Gain Déjà Vu (event card).', go: (r, api) => `Wait, haven't you been here before? You got ${api.addCard('dejaVu')}.` },
    ],
  }),
  special('combo', {
    id: 'rhythm', boon: 'encore', gives: { cards: ['perfectChain'] },
    title: 'Rhythm Tournament',
    text: 'The rhythm game corner is hosting a tournament, and your combos have the crowd chanting your name.',
    options: [
      { label: 'Play the final', note: `Gain Encore: the first Combo card you match each turn adds 1 more ${T.combo}.`, go: (r, api) => `Full combo! The crowd wants more. ${api.addCharm('encore')}!` },
      upgradeStyle('combo', 'Practice the hard chart'),
      { label: 'Take the trophy', note: 'Gain Perfect Chain (event card).', go: (r, api) => `Engraved and everything. You got ${api.addCard('perfectChain')}.` },
    ],
  }),
  special('exposed', {
    id: 'viral', boon: 'trending', gives: { cards: ['ratiod'] },
    title: 'Viral Thread',
    text: 'Your call-outs went viral. Everyone in the café is reading the thread, and they all want the next post.',
    options: [
      { label: 'Post the sequel', note: `Gain Trending: ${T.exposed} enemies take 75% more damage instead of 50%.`, go: (r, api) => `#1 trending. ${api.addCharm('trending')}!` },
      upgradeStyle('exposed', 'Edit for clarity'),
      { label: 'Quote-tweet a hater', note: "Gain Ratio'd (event card).", go: (r, api) => `Brutal. You got ${api.addCard('ratiod')}.` },
    ],
  }),
  {
    id: 'crossover', boon: 'crossover', gives: { cards: ['teamUp'] }, special: true, style: null,
    requires: (r) => hybridCount(r) >= 2,
    needs: '2+ hybrid cards',
    title: 'Crossover Episode',
    text: 'Two anime are playing on the big screen at once, and somehow the characters are fighting side by side.',
    options: [
      { label: 'Watch the whole thing', note: `Gain Crossover: the first hybrid card you match in each fight gives +2 ${T.energy}.`, go: (r, api) => `Best episode ever. ${api.addCharm('crossover')}!` },
      { label: 'Read the fan wiki', note: 'Upgrade all your hybrid cards.', go: (r, api) => upgradeText(api.upgradeAll((d) => !!d.arch2), 'hybrid') },
      { label: 'Buy the merch', note: 'Gain Team-Up (event card).', go: (r, api) => `Limited edition. You got ${api.addCard('teamUp')}.` },
    ],
  },
];

export const ALL_EVENTS = [...EVENTS, ...SPECIAL_EVENTS];
