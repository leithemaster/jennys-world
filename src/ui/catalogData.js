// Everything the Memory Catalog shows, built from the game files and the
// in-game art. Used by the in-game Memory Catalog (src/ui/catalog.js) and by
// tools/catalog-page.mjs, which writes the same data for the published page.
// Add a card, charm, enemy, event, character or outfit to the game files and
// it shows up in both automatically.
import { CARDS, ARCHES } from '../game/cards.js';
import { CHARMS } from '../game/charms.js';
import { ENEMIES, ACTS } from '../game/enemies.js';
import { ALL_EVENTS, SPECIAL_NEED } from '../game/events.js';
import { CHARACTERS, passiveText } from '../game/characters.js';
import { OUTFITS } from '../game/outfits.js';
import { RULES, STATUS_NAMES, STATUS_HELP, STICKERS } from '../game/battle.js';
import { T } from '../game/terms.js';
import { icon, roomIcon, enemySVG, snackIcon } from './art.js';
import { SNACKS, SNACK_SLOTS, SNACK_DROP } from '../game/snacks.js';
import { charmIcon } from './charmIcons.js';
import { jennyChibi, toniChibi } from './chibi.js';

export function buildCatalog() {
  // Which events hand out each event-only card / charm (and each boon).
  const fromEvents = { cards: {}, charms: {} };
  fromEvents.snacks = {};
  for (const e of ALL_EVENTS) {
    for (const k of ['cards', 'charms', 'snacks']) for (const id of e.gives?.[k] || []) (fromEvents[k][id] ||= []).push(e.title);
    if (e.boon) (fromEvents.charms[e.boon] ||= []).push(e.title);
  }
  const fromText = (k, id) => (fromEvents[k][id] ? `Only from: ${fromEvents[k][id].join(', ')}` : '');

  const styleName = (d) => [d.arch, d.arch2].filter(Boolean).map((a) => ARCHES[a].name).join(' / ');
  const starterOf = (id) => Object.values(CHARACTERS).map((ch) => [ch.name, ch.deck.filter((c) => c === id).length]).filter(([, n]) => n).map(([n, k]) => `${n} ×${k}`).join(', ');

  const cards = Object.entries(CARDS).map(([id, d]) => ({
    id, name: d.name, type: d.type === 'status' && d.rarity === 'curse' ? 'status' : d.type, rarity: d.rarity,
    style: styleName(d), text: d.text(false), up: d.text(true), exhaust: !!d.exhaust,
    starter: starterOf(id), requires: d.needs || '', from: fromText('cards', id), art: icon(d.icon),
  }));

  const charms = Object.entries(CHARMS).map(([id, c]) => ({
    id, name: c.name, pool: c.pool, style: c.style ? ARCHES[c.style].name : '', desc: c.desc, requires: c.needs || fromText('charms', id), art: charmIcon(id),
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
      case 'steal': return `Attack ${m.n} + steal ${m.coins} ${T.coins} (back if you win)`;
      case 'drain': return `Attack ${m.n}, heal what gets through`;
      case 'ban': return `${m.n ? `Attack ${m.n} + ban` : 'Ban'} a card for this fight`;
      default: return m.t;
    }
  };
  const floorOf = (id) => ACTS.find((a) => a.normals.includes(id) || a.elites.includes(id) || a.bosses.includes(id))?.name || '';
  const enemies = Object.entries(ENEMIES).map(([id, e]) => ({
    id, name: e.name, kind: e.boss ? 'Boss' : e.elite ? 'Elite' : 'Normal', floor: floorOf(id),
    hp: e.hp[0] === e.hp[1] ? String(e.hp[0]) : `${e.hp[0]}–${e.hp[1]}`, hpMax: e.hp[1],
    ai: e.ai === 'cycle' ? 'In order' : 'Random', moves: e.moves.map(moveText),
    extra: e.boss ? `Can be put to sleep for ${RULES.bossSleepTurns} turn at a time.` : '', art: enemySVG(e.art, e.color),
  }));

  // Event option conditions are code; these are the same rules in plain words.
  const coinCost = (label) => label.match(/\((\d+) /)?.[1];
  const events = ALL_EVENTS.map((e) => ({
    id: e.id, title: e.title, text: e.text, requires: e.needs || '',
    special: !!e.special, style: e.style ? ARCHES[e.style].name : '', boon: e.boon ? CHARMS[e.boon].name : '',
    gives: [...(e.gives?.cards || []).map((k) => CARDS[k].name), ...(e.gives?.charms || []).map((k) => CHARMS[k].name), ...(e.gives?.snacks || []).map((k) => SNACKS[k].name)],
    options: e.options.map((o) => ({ label: o.label, note: o.note || '', cond: o.can && coinCost(o.label) ? `${coinCost(o.label)}+ ${T.coins}` : '' })),
  }));

  const statuses = ['weak', 'asleep', 'vuln', 'poison', 'strength', 'thorns'].map((id) => ({ id, name: STATUS_NAMES[id], help: STATUS_HELP[id].replace(/^[^:]+:\s*/, '') }));
  statuses.push({ id: 'cozy', name: T.cozy, help: `Card keyword. Healing past your max ${T.hp} hits the enemy for the extra amount.` });

  const styles = Object.entries(ARCHES).map(([id, a]) => ({
    id, name: a.name, color: a.color, desc: a.desc,
    cards: Object.values(CARDS).filter((c) => c.arch === id || c.arch2 === id).map((c) => c.name + (c.arch2 ? ' (hybrid)' : '') + (c.rarity === 'event' ? ' (event)' : '')),
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

  const snacks = Object.entries(SNACKS).map(([id, s]) => ({
    id, name: s.name, rarity: s.rarity, style: s.style ? ARCHES[s.style].name : '', desc: s.desc,
    when: s.anytime ? 'Fights or map' : 'Fights', from: fromText('snacks', id), art: snackIcon(id),
  }));
  const snackRules = { slots: SNACK_SLOTS, start: SNACK_DROP.start, step: SNACK_DROP.step, elite: SNACK_DROP.elite, coupon: SNACK_DROP.coupon,
    charms: Object.entries(CHARMS).filter(([k]) => ['lunchbox', 'snackCoupon', 'secretRecipe', 'hamsterCheeks', 'pocketFridge'].includes(k)).map(([, c]) => `${c.name}: ${c.desc}`),
    events: ALL_EVENTS.filter((e) => ['vending', 'samples', 'snackswap', 'konbini'].includes(e.id)).map((e) => e.title) };

  const rooms = ['fight', 'elite', 'event', 'shop', 'rest', 'treasure', 'boss'].map((type) => ({ type, art: roomIcon(type) }));
  const acts = ACTS.map((a) => ({ name: a.name, normals: a.normals.map((n) => ENEMIES[n].name), elites: a.elites.map((n) => ENEMIES[n].name), bosses: a.bosses.map((n) => ENEMIES[n].name) }));

  const rules = {
    sleepAt: RULES.sleepAt, sleepTurns: RULES.sleepTurns, bossSleepTurns: RULES.bossSleepTurns, sleepGrow: RULES.sleepGrow,
    stickerEvery: CHARACTERS.jenny.passive.n, specialNeed: SPECIAL_NEED,
  };

  return { snacks, snackRules, cards, charms, enemies, events, statuses, styles, characters, stickers, outfits, rooms, acts, freeReveal: RULES.freeReveal, rules };
}
