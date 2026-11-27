// The Kioku Catalog: every character, outfit, card, charm, enemy (bosses
// included), guardian and event, with the in-game art. Built from buildCatalog() (catalogData.js), so
// anything added to the game files shows up here on its own. Things the
// player hasn't found or unlocked yet are greyed out and their names hidden,
// using the progress save's collection.

import { buildCatalog } from './catalogData.js';
import { isFound, isUnlocked, climbUnlocked } from '../game/progress.js';
import { CLIMB } from '../game/climb.js';
import { CHARACTERS } from '../game/characters.js';
import { outfitOpen } from '../game/outfits.js';

const esc = (s) => String(s ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const cap = (s) => (s ? s[0].toUpperCase() + s.slice(1) : '');
const POOL = { haru: "Haru's Gift", guardian: 'Guardian gift', drop: 'Drop', shop: 'Shop only', boss: 'Boss reward', event: 'Event only', special: 'Special event' };
const RAR_ORDER = { starter: 0, common: 1, uncommon: 2, rare: 3, event: 4, gift: 5, status: 6, curse: 7 };
const KIND_ORDER = { Normal: 0, Elite: 1, Boss: 2 };
const HIDDEN = '???';

const TABS = [
  { id: 'characters', label: 'Jenny & Toni' },
  { id: 'outfits', label: 'Outfits' },
  { id: 'cards', label: 'Cards' },
  { id: 'charms', label: 'Charms' },
  { id: 'snacks', label: 'Snacks' },
  { id: 'enemies', label: 'Enemies' },
  { id: 'guardians', label: 'Guardians' },
  { id: 'events', label: 'Events' },
  { id: 'styles', label: 'Styles & statuses' },
  { id: 'rules', label: 'Rooms & floors' },
];

// ---------- what the player has found ----------
function withFound(D) {
  const heroOpen = (id) => !CHARACTERS[id].unlock || isUnlocked('characters', id);
  const starterOpen = (id) => Object.entries(CHARACTERS).some(([cid, ch]) => heroOpen(cid) && ch.deck.includes(id));
  const mark = (list, test) => list.map((r) => ({ ...r, found: !!test(r) }));
  return {
    ...D,
    characters: mark(D.characters, (r) => heroOpen(r.id)),
    outfits: mark(D.outfits, (r) => outfitOpen(r.id)),
    cards: mark(D.cards, (r) => r.rarity === 'status' || r.rarity === 'curse' || starterOpen(r.id) || isFound('cards', r.id)),
    charms: mark(D.charms, (r) => isFound('charms', r.id)),
    snacks: mark(D.snacks, (r) => isFound('snacks', r.id)),
    enemies: mark(D.enemies, (r) => isFound('enemies', r.id)),
    events: mark(D.events, (r) => isFound('events', r.id)),
    guardians: mark(D.guardians, (r) => isFound('guardians', r.id)),
  };
}
// A locked row keeps only what's safe to show; search can't reveal it.
const hide = (r, keep) => (r.found ? r : { id: r.id, found: false, ...Object.fromEntries(keep.map((k) => [k, r[k]])) });
const artBox = (cls, r, art) => `<div class="art ${cls}${r.found ? '' : ' unseen'}">${art}</div>`;
const nameCell = (r, name = r.name) => (r.found ? `<span class="name">${esc(name)}</span>` : `<span class="name muted">${HIDDEN}</span>`);
const notYet = '<span class="small">Not found yet</span>';

export function catalogScreen(app, { onBack }) {
  // One container that lives as long as this screen; listeners go away with it.
  app.innerHTML = '<div class="cat-root"></div>';
  const root = app.firstElementChild;
  const D = withFound(buildCatalog());
  const state = { tab: 'characters', q: '', filter: 'all', sort: null, closed: new Set() }; // closed: collapsed guardian tables

  function table(rows, cols, filters, filterKey, note) {
    const q = state.q.toLowerCase();
    const strip = (r) => JSON.stringify(Object.fromEntries(Object.entries(r).filter(([k]) => k !== 'art'))).toLowerCase();
    let list = rows.filter((r) => (state.filter === 'all' || r[filterKey] === state.filter) && (!q || strip(r).includes(q)));
    // Found entries always come first; the chosen column sorts within each group.
    const c = state.sort && cols.find((x) => x.key === state.sort.key);
    const v = c && (c.sortVal || ((r) => r[c.key] ?? ''));
    list = [...list].sort((a, b) => {
      if (a.found !== b.found) return a.found ? -1 : 1;
      if (!v) return 0;
      const x = v(a), y = v(b);
      return (typeof x === 'number' ? x - y : String(x).localeCompare(String(y))) * state.sort.dir;
    });
    const found = rows.filter((r) => r.found).length;
    return `<section class="sheet">
      ${note ? `<p class="note">${note}</p>` : ''}
      <div class="tools">
        <input data-search type="search" placeholder="Search…" aria-label="Search" value="${esc(state.q)}">
        ${filters.map(([v, l]) => `<button class="chip" data-filter="${v}" aria-pressed="${state.filter === v}">${esc(l)}</button>`).join('')}
        <span class="shown">Found ${found} of ${rows.length}</span>
      </div>
      <div class="scroll"><table><thead><tr>${cols.map((c) => (c.key ? `<th aria-sort="${state.sort?.key === c.key ? (state.sort.dir > 0 ? 'ascending' : 'descending') : 'none'}"><button data-sort="${c.key}">${c.label}</button></th>` : `<th>${c.label}</th>`)).join('')}</tr></thead>
      <tbody>${list.map((r) => `<tr class="${r.found ? '' : 'locked'}">${cols.map((c) => `<td${c.num ? ' class="num"' : ''}>${c.cell(r)}</td>`).join('')}</tr>`).join('') || `<tr><td colspan="${cols.length}">Nothing matches.</td></tr>`}</tbody></table></div>
    </section>`;
  }

  const VIEWS = {
    characters: () => `<section class="sheet"><p class="note">Both can play every style. They differ in HP, starting deck and one passive.</p>
      <div class="grid">${D.characters.map((c) => (c.found ? `<article class="tile look"><div class="art">${c.art}</div><h3>${esc(c.name)}</h3><p>${esc(c.blurb)}</p>
        <ul class="opts"><li><b>${c.maxHp} max HP</b></li><li>${esc(c.passive)}</li><li><b>Starts with:</b> ${esc(c.deck)}</li></ul></article>`
        : `<article class="tile look locked"><div class="art unseen">${c.art}</div><h3>${HIDDEN}</h3><p class="small">${esc(c.unlock)}</p></article>`)).join('')}</div></section>
      <section class="sheet"><h3>Jenny's Sticker Book</h3>
      <p class="note">Every ${D.rules.stickerEvery}th match peels off a sticker. No repeats until she's used all ${D.stickers.length}.</p>
      <div class="scroll"><table class="slim"><thead><tr><th>Sticker</th><th>Effect</th></tr></thead><tbody>${D.stickers.map((s) => `<tr><td><span class="name">${esc(s.name)}</span></td><td>${esc(cap(s.text))}</td></tr>`).join('')}</tbody></table></div></section>`,

    outfits: () => `<section class="sheet"><p class="note">Matching sets for Jenny and Toni. Wear them from Outfits on the main menu. <b>Found ${D.outfits.filter((o) => o.found).length} of ${D.outfits.length}</b></p>
      <div class="grid">${D.outfits.map((o) => `<article class="tile look${o.found ? '' : ' locked'}"><div class="pair"><div class="art${o.found ? '' : ' unseen'}">${o.jenny}</div><div class="art${o.found ? '' : ' unseen'}">${o.toni}</div></div><h3>${o.found ? esc(o.name) : HIDDEN}</h3>${o.found ? `<p>${esc(o.desc)}</p>` : ''}<span class="tag ct-${o.found ? 'common' : 'rare'}">${o.found ? 'Unlocked' : esc(o.unlock)}</span></article>`).join('')}</div></section>`,

    cards: () => table(D.cards.map((r) => hide(r, ['type', 'rarity', 'art'])), [
      { label: 'Art', cell: (r) => artBox(`cardart t-${r.type}`, r, r.art) },
      { label: 'Name', key: 'name', cell: (r) => nameCell(r) },
      { label: 'Type', key: 'type', cell: (r) => `<span class="tag ct-${r.type}">${cap(r.type)}</span>` },
      { label: 'Rarity', key: 'rarity', sortVal: (r) => RAR_ORDER[r.rarity], cell: (r) => `<span class="tag ct-${r.rarity}">${cap(r.rarity)}</span>` },
      { label: 'Style', key: 'style', cell: (r) => (!r.found ? notYet : r.style ? `<span class="style">${esc(r.style)}</span>` : '<span class="small">—</span>') },
      { label: 'Effect', cell: (r) => (r.found ? esc(r.text) : '') },
      { label: 'Upgraded (+)', cell: (r) => (!r.found ? '' : r.rarity === 'status' || r.rarity === 'curse' ? '<span class="small">Can’t upgrade</span>' : r.up === r.text ? '<span class="small">Same</span>' : `<span class="up">${esc(r.up)}</span>`) },
      { label: 'Shows up when', cell: (r) => (!r.found ? '' : r.starter ? `<span class="small">Starter deck: ${esc(r.starter)}</span>` : r.from ? `<span class="small">${esc(r.from)}</span>` : r.requires ? `<span class="small">Needs ${esc(r.requires)}</span>` : r.rarity === 'status' ? '<span class="small">Added by enemies</span>' : r.rarity === 'curse' ? '<span class="small">From events</span>' : '<span class="small">Always</span>') },
    ], [['all', 'All'], ['attack', 'Attack'], ['skill', 'Skill'], ['power', 'Power'], ['status', 'Status']], 'type',
    'Match a card’s pair on the board to play it.'),

    charms: () => table(D.charms.map((r) => hide(r, ['pool', 'art'])), [
      { label: 'Art', cell: (r) => artBox('charm', r, r.art) },
      { label: 'Name', key: 'name', cell: (r) => nameCell(r) },
      { label: 'Where from', key: 'pool', cell: (r) => `<span class="tag ct-${r.pool}">${POOL[r.pool]}</span>` },
      { label: 'Style', key: 'style', cell: (r) => (!r.found ? notYet : r.style ? `<span class="style">${esc(r.style)}</span>` : '<span class="small">—</span>') },
      { label: 'Effect', cell: (r) => (r.found ? esc(r.desc) : '') },
      { label: 'Only shows up if', cell: (r) => (!r.found ? '' : r.requires ? `<span class="small">${esc(r.requires)}</span>` : '<span class="small">—</span>') },
    ], [['all', 'All'], ['haru', "Haru's Gift"], ['guardian', 'Guardian gift'], ['drop', 'Drop'], ['shop', 'Shop only'], ['boss', 'Boss reward'], ['event', 'Event only'], ['special', 'Special event']], 'pool',
    'Passive. They last the whole run.'),

    snacks: () => table(D.snacks.map((r) => hide(r, ['rarity', 'art'])), [
      { label: 'Art', cell: (r) => artBox('charm', r, r.art) },
      { label: 'Name', key: 'name', cell: (r) => nameCell(r) },
      { label: 'Rarity', key: 'rarity', sortVal: (r) => RAR_ORDER[r.rarity], cell: (r) => `<span class="tag ct-${r.rarity}">${cap(r.rarity)}</span>` },
      { label: 'Style', key: 'style', cell: (r) => (!r.found ? notYet : r.style ? `<span class="style">${esc(r.style)}</span>` : '<span class="small">Any</span>') },
      { label: 'Effect', cell: (r) => (r.found ? esc(r.desc) : '') },
      { label: 'Eat it in', key: 'when', cell: (r) => (r.found ? `<span class="small">${esc(r.when)}</span>` : '') },
      { label: 'Where from', cell: (r) => (r.found ? `<span class="small">${esc(r.from || 'Drops and shops')}</span>` : '') },
    ], [['all', 'All'], ['common', 'Common'], ['uncommon', 'Uncommon'], ['rare', 'Rare'], ['event', 'Event only'], ['gift', 'Guardian gift']], 'rarity',
    `One use each, and eating one doesn’t end your turn. You start with ${D.snackRules.slots} slots.`),

    enemies: () => table(D.enemies.map((r) => hide(r, ['kind', 'floor', 'art'])), [
      { label: 'Art', cell: (r) => artBox(`enemy${r.kind === 'Boss' ? ' boss' : ''}`, r, r.art) },
      { label: 'Name', key: 'name', cell: (r) => nameCell(r) },
      { label: 'Kind', key: 'kind', sortVal: (r) => KIND_ORDER[r.kind], cell: (r) => `<span class="tag ct-${r.kind}">${r.kind}</span>` },
      { label: 'Floor', key: 'floor', cell: (r) => esc(r.floor) },
      { label: 'HP', key: 'hpMax', num: true, cell: (r) => (r.found ? esc(r.hp) : '?') },
      { label: 'Moves', cell: (r) => (!r.found ? (r.kind === 'Boss' ? '<span class="small">Reach the end of this floor to meet it.</span>' : notYet)
        : `<ul class="moves${r.bag ? ' bag-moves' : ''}">${r.moves.map((m, i) => `<li>${r.bag ? `<span class="marbles" aria-label="${r.bag[i]} marbles">${`<i class="mb-${r.bagKinds[i]}"></i>`.repeat(r.bag[i])}</span>` : ''}${esc(m)}</li>`).join('')}</ul>${r.combos?.length ? `<p class="small"><b>Combos:</b> ${esc(r.combos.join('. '))}.</p>` : ''}${r.extra ? `<p class="small">${esc(r.extra)}</p>` : ''}`) },
      { label: 'Move order', key: 'ai', cell: (r) => (r.found ? `<span class="small">${esc(r.ai)}</span>` : '') },
    ], [['all', 'All'], ['Normal', 'Normal'], ['Elite', 'Elite'], ['Boss', 'Boss']], 'kind',
    `Bosses pull moves from a bag of marbles, so more marbles means a likelier move. The map shows which boss is waiting.`),

    guardians: () => {
      const charm = Object.fromEntries(D.charms.map((c) => [c.id, c]));
      return `<section class="sheet"><p class="note">Haru meets you every run. On Floors 2 and 3 another guardian is waiting. Each offers 3 charms; you keep 1. <b>Found ${D.guardians.filter((g) => g.found).length} of ${D.guardians.length}</b></p>
      ${D.guardians.map((g) => (g.found ? `<div class="tile boss-row guardian-row"><div class="art">${g.art}</div>
        <div class="boss-info"><h3>${esc(g.name)}</h3><p><span class="tag ct-guardian">${esc(g.kind)}</span> ${esc(g.floor)}${g.only ? ` · only when you play as ${esc(g.only)}` : g.floorNo ? ' · one of the floor guardians' : ' · every run'}</p><p>${esc(g.blurb)}</p>
        </div>
        <details class="guardian-charms" data-guardian="${g.id}"${state.closed.has(g.id) ? '' : ' open'}><summary>Charms <span class="small">(${g.charms.filter((k) => charm[k].found).length} of ${g.charms.length} found)</span></summary><div class="scroll"><table class="slim"><thead><tr><th>Art</th><th>Charm</th><th>Style</th><th>Effect</th><th>Comes with</th></tr></thead><tbody>${g.charms.map((k) => { const c = charm[k]; return c.found
          ? `<tr><td>${artBox('charm', c, c.art)}</td><td><span class="name">${esc(c.name)}</span></td><td>${c.style ? `<span class="style">${esc(c.style)}</span>` : '<span class="small">Any</span>'}</td><td>${esc(c.desc)}</td><td>${c.gives ? `<span class="small">${esc(c.gives)}</span>` : '<span class="small">—</span>'}</td></tr>`
          : `<tr class="locked"><td>${artBox('charm', c, c.art)}</td><td><span class="name muted">${HIDDEN}</span></td><td colspan="3"><span class="small">Not offered yet</span></td></tr>`; }).join('')}</tbody></table></div></details></div>`
        : `<div class="tile boss-row guardian-row locked"><div class="art unseen">${g.art}</div><div class="boss-info"><h3>${HIDDEN}</h3><p><span class="tag ct-guardian">Guardian</span> ${esc(g.floor)}</p><p class="small">Reach ${esc(g.floor)} to meet them.</p></div></div>`)).join('')}</section>`;
    },

    events: () => `<section class="sheet"><p class="note">"?" rooms. No repeats in a run. <b>Found ${D.events.filter((e) => e.found).length} of ${D.events.length}</b></p>
      <p class="note"><b>Special events</b> show up once you own ${D.rules.specialNeed}+ cards of one style.</p>
      <div class="grid">${D.events.map((e) => (e.found ? `<article class="tile${e.special ? ' special' : ''}">${e.special ? `<span class="tag ct-special">Special${e.style ? ` · ${esc(e.style)}` : ''}</span>` : ''}<h3>${esc(e.title)}</h3>${e.requires ? `<span class="small">Only if you have ${esc(e.requires)}</span>` : ''}<p>${esc(e.text)}</p>
        <ul class="opts">${e.options.map((o) => `<li><b>${esc(o.label)}</b>${o.note ? ` · ${esc(o.note)}` : ''}${o.cond ? ` <span class="small">(needs ${esc(o.cond)})</span>` : ''}</li>`).join('')}</ul></article>`
        : `<article class="tile locked${e.special ? ' special' : ''}">${e.special ? '<span class="tag ct-special">Special</span>' : ''}<h3>${HIDDEN}</h3><p class="small">${e.special ? `Needs ${esc(e.requires)}.` : "An event you haven't walked into yet."}</p></article>`)).join('')}</div></section>`,

    styles: () => {
      const cardFound = Object.fromEntries(D.cards.map((c) => [c.name, c.found]));
      const nm = (n) => (cardFound[n.replace(' (hybrid)', '').replace(' (event)', '')] === false ? HIDDEN : n);
      return `<section class="sheet"><p class="note">Lean into a style and you’ll be offered more of it.</p>
      <ul class="opts"><li><b>Sleepy → Asleep:</b> at ${D.rules.sleepAt} Sleepy an enemy skips ${D.rules.sleepTurns} turns (bosses ${D.rules.bossSleepTurns}). Each time it wakes, it takes ${D.rules.sleepGrow} more.</li><li><b>Cozy:</b> on a Cozy card, healing past your max HP hits the enemy.</li></ul>
      <div class="grid">${D.styles.map((s) => `<article class="tile" style="border-top:10px solid ${s.color}"><h3>${esc(s.name)}</h3><p>${esc(s.desc)}</p>
        <p class="small"><b>Cards:</b> ${esc(s.cards.map(nm).join(', '))}</p><p class="small"><b>Charms:</b> ${esc(s.charms.join(', ') || '—')}</p></article>`).join('')}</div></section>
      <section class="sheet"><h3>Statuses</h3>
      <div class="scroll"><table class="slim"><thead><tr><th>Name</th><th>What it does</th></tr></thead><tbody>${D.statuses.map((s) => `<tr><td><span class="name">${esc(s.name)}</span></td><td>${esc(cap(s.help))}</td></tr>`).join('')}</tbody></table></div></section>`;
    },

    rules: () => {
      const seen = Object.fromEntries(D.enemies.map((e) => [e.name, e.found]));
      const nm = (n) => (seen[n] ? n : HIDDEN);
      return `<section class="sheet"><h3>Floors</h3>
      <div class="scroll"><table class="slim"><thead><tr><th>Floor</th><th>Normal enemies</th><th>Elites</th><th>Bosses</th></tr></thead><tbody>${D.acts.map((a) => `<tr><td><span class="name">${esc(a.name)}</span></td><td>${esc(a.normals.map(nm).join(', '))}</td><td>${esc(a.elites.map(nm).join(', '))}</td><td><b>${esc(a.bosses.map(nm).join(', '))}</b></td></tr>`).join('')}</tbody></table></div>
</section>
      <section class="sheet"><h3>Levels</h3>
      <div class="scroll"><table class="slim"><thead><tr><th>Level</th><th>Twist</th><th>What changes</th></tr></thead><tbody>${CLIMB.slice(1).map((c, i) => `<tr><td>${i + 1}</td><td><span class="name">${esc(c.name)}</span></td><td>${esc(c.text)}</td></tr>`).join('')}</tbody></table></div></section>`;
    },
  };

  const totalFound = () => {
    const lists = [D.cards, D.charms, D.snacks, D.enemies, D.events, D.outfits, D.characters, D.guardians];
    return { found: lists.reduce((n, l) => n + l.filter((r) => r.found).length, 0), all: lists.reduce((n, l) => n + l.length, 0) };
  };

  function render() {
    const focused = document.activeElement?.matches?.('[data-search]');
    const pos = focused ? document.activeElement.selectionStart : 0;
    const t = totalFound();
    root.innerHTML = `<main class="cat">
      <header class="cat-head">
        <div><h1>Kioku <span>Catalog</span></h1><p class="sub">Everything you’ve found in the ${esc('Net Café Tower')}.</p></div>
        <div class="cat-side"><span class="count"><b>${t.found}</b> of ${t.all} found</span><button class="btn yellow" data-back>Back</button></div>
      </header>
      <nav class="cat-tabs" aria-label="Sections">${TABS.map((x) => `<button data-tab="${x.id}" aria-current="${state.tab === x.id ? 'page' : 'false'}">${x.label}</button>`).join('')}</nav>
      <div class="cat-view">${VIEWS[state.tab]()}</div>
    </main>`;
    root.querySelector('[data-back]').addEventListener('click', onBack);
    if (focused) { const s = root.querySelector('[data-search]'); s?.focus(); s?.setSelectionRange(pos, pos); }
  }

  // remember which guardian charm tables are collapsed (toggle doesn't bubble, so listen while capturing)
  root.addEventListener('toggle', (e) => { const g = e.target.dataset?.guardian; if (g) state.closed[e.target.open ? 'delete' : 'add'](g); }, true);
  root.addEventListener('input', (e) => { if (e.target.matches('[data-search]')) { state.q = e.target.value; render(); } });
  root.addEventListener('click', (e) => {
    const tab = e.target.closest('[data-tab]');
    if (tab) { Object.assign(state, { tab: tab.dataset.tab, q: '', filter: 'all', sort: null }); render(); root.querySelector('.cat')?.scrollIntoView(); return; }
    const f = e.target.closest('[data-filter]'); if (f) { state.filter = f.dataset.filter; render(); return; }
    const s = e.target.closest('[data-sort]');
    if (s) { const k = s.dataset.sort; state.sort = state.sort?.key === k ? (state.sort.dir > 0 ? { key: k, dir: -1 } : null) : { key: k, dir: 1 }; render(); }
  });
  render();
}
