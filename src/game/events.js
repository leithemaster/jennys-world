// "?" rooms. Each option: label, (optional) note, can(run) -> bool, go(run, api) -> result text.
// api: { addCard(id), randomCard(rarity?), styleCard(arch, rarity?), addCharm(id?), upgradeAll(pred),
//        pickRemove(), pickUpgrade(), pickCopy() }
//
// requires(run): the event stays in the deck but is skipped until true; needs: the same rule in plain words.
// gives: { cards, charms } – the event-only cards/charms it can hand out (the catalog lists where they come from).
//
// SPECIAL_EVENTS are conditional: each one waits for a deck that leans into
// its style. From Floor 2 on, the first "?" room after you qualify is a
// special event, at most one per floor, and each shows up once per run. Their boons (charms with
// pool 'special') only come from here.

import { T } from './terms.js';
import { CARDS, ARCHES } from './cards.js';

// Non-starter cards in the deck tagged with this style (hybrids count for both).
export function styleCount(run, arch) {
  return run.deck.filter((c) => { const d = CARDS[c.id]; return d.rarity !== 'starter' && (d.arch === arch || d.arch2 === arch); }).length;
}
const hybridCount = (run) => run.deck.filter((c) => CARDS[c.id].arch2).length;
export const SPECIAL_NEED = 3; // style cards needed to open a style's special event
const ofStyle = (arch) => (d) => d.arch === arch || d.arch2 === arch;
const upgradeText = (n, what) => (n ? `${n} ${what} card${n > 1 ? 's' : ''} upgraded!` : `No ${what} cards left to upgrade.`);

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
      { label: `Buy a snack (15 ${T.coins})`, note: 'Heal 12.', can: (r) => r.coins >= 15, go: (r) => { r.coins -= 15; r.hp = Math.min(r.maxHp, r.hp + 12); return `Crunchy. +12 ${T.hp}.`; } },
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
