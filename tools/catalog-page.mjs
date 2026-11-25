// Builds tools/catalog-page/data.json for the published catalog page
// (tools/catalog-page/index.html), straight from the game files and the
// in-game art. After changing cards, charms, enemies, characters or outfits:
//   node tools/catalog-page.mjs
// then republish the page (index.html + data.json) to the same artifact.
import { writeFileSync } from 'node:fs';

globalThis.localStorage = { getItem: () => null, setItem: () => {}, removeItem: () => {} };
const { CARDS, ARCHES } = await import('../src/game/cards.js');
const { CHARMS } = await import('../src/game/charms.js');
const { ENEMIES, ACTS } = await import('../src/game/enemies.js');
const { EVENTS } = await import('../src/game/events.js');
const { CHARACTERS, passiveText } = await import('../src/game/characters.js');
const { OUTFITS } = await import('../src/game/outfits.js');
const { RULES, STATUS_NAMES, STATUS_HELP, STICKERS } = await import('../src/game/battle.js');
const { T } = await import('../src/game/terms.js');
const { icon, roomIcon, enemySVG } = await import('../src/ui/art.js');
const { charmIcon } = await import('../src/ui/charmIcons.js');
const { jennyChibi, toniChibi } = await import('../src/ui/chibi.js');

const styleName = (d) => [d.arch, d.arch2].filter(Boolean).map((a) => ARCHES[a].name).join(' / ');
const starterOf = (id) => Object.values(CHARACTERS).map((ch) => [ch.name, ch.deck.filter((c) => c === id).length]).filter(([, n]) => n).map(([n, k]) => `${n} ×${k}`).join(', ');

const cards = Object.entries(CARDS).map(([id, d]) => ({
  id, name: d.name, type: d.type === 'status' && d.rarity === 'curse' ? 'status' : d.type, rarity: d.rarity,
  style: styleName(d), text: d.text(false), up: d.text(true), exhaust: !!d.exhaust,
  starter: starterOf(id), requires: d.needs || '', art: icon(d.icon),
}));

const charms = Object.entries(CHARMS).map(([id, c]) => ({
  id, name: c.name, pool: c.pool, style: c.style ? ARCHES[c.style].name : '', desc: c.desc, requires: c.needs || '', art: charmIcon(id),
}));

const moveText = (m) => {
  switch (m.t) {
    case 'atk': return `Attack ${m.n}${m.times ? `×${m.times}` : ''}`;
    case 'atkBlock': return `Attack ${m.n} + Block ${m.b}`;
    case 'block': return `Block ${m.n}`;
    case 'buff': return `+${m.n} ${T.spirit}`;
    case 'heal': return `Heal ${m.n}`;
    case 'debuff': return [m.weak && `Apply ${m.weak} ${T.sleepy}`, m.vuln && `Apply ${m.vuln} ${T.exposed}`].filter(Boolean).join(' + ');
    case 'status': return `Add ${m.count} ${CARDS[m.card].name} to your deck`;
    case 'atkStatus': return `Attack ${m.n} + add ${m.count} ${CARDS[m.card].name}`;
    case 'scramble': return 'Scramble the board';
    default: return m.t;
  }
};
const floorOf = (id) => ACTS.find((a) => a.normals.includes(id) || a.elites.includes(id) || a.boss === id)?.name || '';
const enemies = Object.entries(ENEMIES).map(([id, e]) => ({
  id, name: e.name, kind: e.boss ? 'Boss' : e.elite ? 'Elite' : 'Normal', floor: floorOf(id),
  hp: e.hp[0] === e.hp[1] ? String(e.hp[0]) : `${e.hp[0]}–${e.hp[1]}`, hpMax: e.hp[1],
  ai: e.ai === 'cycle' ? 'In order' : 'Random', moves: e.moves.map(moveText),
  extra: e.boss ? `Can be put to sleep for ${RULES.bossSleepTurns} turn at a time.` : '', art: enemySVG(e.art, e.color),
}));

// Event option conditions are code; these are the same rules in plain words.
const coinCost = (label) => label.match(/\((\d+) /)?.[1];
const events = EVENTS.map((e) => ({
  id: e.id, title: e.title, text: e.text, requires: e.needs || '',
  options: e.options.map((o) => ({ label: o.label, note: o.note || '', cond: o.can && coinCost(o.label) ? `${coinCost(o.label)}+ ${T.coins}` : '' })),
}));

const statuses = ['weak', 'asleep', 'vuln', 'poison', 'strength', 'thorns'].map((id) => ({ id, name: STATUS_NAMES[id], help: STATUS_HELP[id].replace(/^[^:]+:\s*/, '') }));
statuses.push({ id: 'cozy', name: T.cozy, help: `Card keyword. Healing past your max ${T.hp} hits the enemy for the extra amount.` });

const styles = Object.entries(ARCHES).map(([id, a]) => ({
  id, name: a.name, color: a.color, desc: a.desc,
  cards: Object.values(CARDS).filter((c) => c.arch === id || c.arch2 === id).map((c) => c.name + (c.arch2 ? ' (hybrid)' : '')),
  charms: Object.values(CHARMS).filter((c) => c.style === id).map((c) => c.name),
}));

const characters = Object.entries(CHARACTERS).map(([id, ch]) => ({
  id, name: ch.name, blurb: ch.blurb, maxHp: ch.maxHp, passive: passiveText(ch),
  deck: [...new Set(ch.deck)].map((c) => { const n = ch.deck.filter((x) => x === c).length; return `${n > 1 ? `${n}× ` : ''}${CARDS[c].name}`; }).join(', '),
  unlock: ch.unlock ? ch.unlock.text : 'From the start',
  art: id === 'toni' ? toniChibi('date') : jennyChibi('date'),
}));
const stickers = Object.entries(STICKERS).map(([id, s]) => ({ id, name: s.name, text: s.text }));
const outfits = Object.entries(OUTFITS).map(([id, o]) => ({
  id, name: o.name, desc: o.desc, unlock: o.unlock ? o.unlock.text : 'From the start',
  jenny: jennyChibi(id), toni: toniChibi(id),
}));

const rooms = ['fight', 'elite', 'event', 'shop', 'rest', 'treasure', 'boss'].map((type) => ({ type, art: roomIcon(type) }));
const acts = ACTS.map((a) => ({ name: a.name, normals: a.normals.map((n) => ENEMIES[n].name), elites: a.elites.map((n) => ENEMIES[n].name), boss: ENEMIES[a.boss].name }));

const rules = {
  sleepAt: RULES.sleepAt, sleepTurns: RULES.sleepTurns, bossSleepTurns: RULES.bossSleepTurns, sleepGrow: RULES.sleepGrow,
  stickerEvery: CHARACTERS.jenny.passive.n,
};

const data = { cards, charms, enemies, events, statuses, styles, characters, stickers, outfits, rooms, acts, freeReveal: RULES.freeReveal, rules };
writeFileSync(new URL('./catalog-page/data.json', import.meta.url), JSON.stringify(data));
console.log(`catalog-page/data.json: ${cards.length} cards, ${charms.length} charms, ${enemies.length} enemies, ${events.length} events, ${characters.length} characters, ${outfits.length} outfit sets`);
