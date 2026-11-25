// "?" rooms. Each option: label, (optional) note, can(run) -> bool, go(run, api) -> result text.
// api: { addCard(id), randomCard(rarity?), addCharm(id?), upgradeRandom(), removeCard(), pickRemove(), pickUpgrade() }

import { T } from './terms.js';
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
    title: 'Mysterious Gamer',
    text: '"Wanna trade?" A gamer in a mask offers to swap one of your cards for something rare.',
    options: [
      { label: 'Trade', note: 'Remove a card, gain a random rare card.', go: async (r, api) => { const out = await api.pickRemove(); if (out.startsWith('No')) return out; return `${out} You got ${api.addCard(api.randomCard('rare'))}.`; } },
      { label: 'No thanks', go: () => '"Suit yourself."' },
    ],
  },
];
