import { CARDS, ARCHES, cardName, cardText, canUpgrade } from '../game/cards.js';
import { CHARMS } from '../game/charms.js';
import { ENEMIES, ACTS } from '../game/enemies.js';
import { Battle, STATUS_NAMES, STATUS_HELP, PACE, RULES, STICKERS } from '../game/battle.js';
import {
  newRun, generateMap, ROWS, availableRooms, roomAt, enemyFor, cardChoices, randomCharm, gainCharm, gainCoins,
  afterFightHealing, shopStock, shopCards, restockCost, saveRun, loadRun, clearRun, runSummary, TOTAL_FLOORS, removeCost, fillSnacksForFloor, topCard,
} from '../game/run.js';
import { SNACKS, snackBar, snackRoom, addSnack, removeSnack, eatOnMap } from '../game/snacks.js';
import { drawCard, drawCharm, drawEvent, deckStyle, drawStyleCard, drawSnack, rollSnackDrop, bossFor } from '../game/loot.js';
import { ALL_EVENTS } from '../game/events.js';
import { sfx, settings, saveSettings, music, musicSlowMo, TRACKS, setTrack } from '../audio.js';
import { BOSS_THEMES, bossStage } from './bossThemes.js';
import { icon, jennySVG, heroSVG, enemySVG, roomIcon, snackIcon } from './art.js';
import { CHARACTERS, passiveText } from '../game/characters.js';
import { catalogScreen } from './catalog.js';
import { blobBackdrop, guardianChibi, managerChibi } from './chibi.js';
import { GUARDIANS, guardianFor, guardiansOn, lastGuardian } from '../game/guardians.js';
import { OUTFITS, outfitOpen, wornOutfit, wearOutfit, syncOutfitUnlocks, outfitsForBoss, outfitsForRunEnd, CARD_BACKS, backOpen, wornBack, useBack } from '../game/outfits.js';
import { backStyle, backEmblem } from './cardBacks.js';
import { charmIcon, uiIcon } from './charmIcons.js';
import { GAME, T } from '../game/terms.js';
import {
  getProgress, recordRunEnd, isUnlocked, isFound, unlock, noteCardSeen, noteCardTaken, noteCharmSeen, noteCharmTaken,
  noteEnemyMet, noteEnemyDefeated, noteEventMet, noteGuardianMet, noteSnackSeen, noteSnackTaken, climbUnlocked, setClimb, addTips, TIP_STEP,
} from '../game/progress.js';
import { CLIMB, CLIMB_MAX, CLIMB_RULES, climbOn } from '../game/climb.js';

const app = document.getElementById('app');
let run = null;
let battle = null;

const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const TYPE_LABEL = T.types;

// ---------- shared pieces ----------
// Every card or charm the player gets goes through these, so the progress
// save (and later the collection book) sees it.
function takeCard(card) { run.deck.push(card); noteCardTaken(card.id); }
function takeSnack(id) { if (!addSnack(run, id)) return false; noteSnackTaken(id); return true; }
function takeCharm(id) {
  if (!id || run.charms.includes(id)) return;
  gainCharm(run, id);
  noteCharmTaken(id);
}
function startNewRun() { pickCharacter(); }
// Characters whose unlock floor has already been passed. Also fixes up saves
// from before unlocks existed: reaching past a floor's boss room counts.
function syncUnlocks() {
  // Testing switch: open the game with ?unlockall to unlock every character
  // and outfit and fill in the whole Kioku Catalog.
  if (new URLSearchParams(location.search).has('unlockall')) {
    Object.keys(CHARACTERS).forEach((id) => unlock('characters', id));
    Object.keys(OUTFITS).forEach((id) => unlock('outfits', id));
    Object.keys(CARD_BACKS).forEach((id) => unlock('cardbacks', id));
    Object.keys(CARDS).filter((id) => !isFound('cards', id)).forEach(noteCardSeen);
    Object.keys(CHARMS).filter((id) => !isFound('charms', id)).forEach(noteCharmSeen);
    Object.keys(ENEMIES).filter((id) => !isFound('enemies', id)).forEach(noteEnemyMet);
    ALL_EVENTS.filter((e) => !isFound('events', e.id)).forEach((e) => noteEventMet(e.id));
    Object.keys(SNACKS).filter((id) => !isFound('snacks', id)).forEach(noteSnackSeen);
    Object.keys(GUARDIANS).filter((id) => !isFound('guardians', id)).forEach(noteGuardianMet);
    Object.keys(CHARACTERS).forEach((id) => setClimb(id, CLIMB_MAX));
    history.replaceState(null, '', location.pathname);
  }
  syncOutfitUnlocks();
  const best = getProgress().totals.best_floor;
  for (const [id, ch] of Object.entries(CHARACTERS)) {
    if (ch.unlock && best >= (ch.unlock.bossFloor + 1) * (ROWS + 1)) unlock('characters', id);
  }
}
function unlockAfterBoss(floor) {
  return Object.entries(CHARACTERS).filter(([id, ch]) => ch.unlock?.bossFloor === floor && unlock('characters', id)).map(([, ch]) => ch.name);
}
const heroOpen = (id) => !CHARACTERS[id].unlock || isUnlocked('characters', id);
function beginRun(character, climb = 0) {
  run = newRun(character, climb);
  run.deck.forEach((c) => noteCardTaken(c.id));
  saveRun(run);
  guardianGift();
}
const hero = () => CHARACTERS[run?.character] || CHARACTERS.jenny;

export function cardHTML(c, extra = '') {
  const def = CARDS[c.id];
  const text = cardText(c);
  // long rules text gets a smaller font and a smaller picture so it never clips
  const len = text.length > 58 ? 'xlong' : text.length > 40 ? 'long' : '';
  return `<div class="card t-${def.type} r-${def.rarity}${c.up ? ' up' : ''}${len ? ` text-${len}` : ''} ${extra}">
    <div class="card-art">${icon(def.icon)}</div>
    <div class="card-name">${esc(cardName(c))}</div>
    <div class="card-text${len ? ` ${len}` : ''}">${esc(text)}</div>
    <div class="card-type">${TYPE_LABEL[def.type]}${def.arch ? ` · <span class="arch a-${def.arch}">${ARCHES[def.arch].name}</span>` : ''}${def.arch2 ? `/<span class="arch a-${def.arch2}">${ARCHES[def.arch2].name}</span>` : ''}${def.rarity === 'curse' ? ' · Curse' : ''}</div>
  </div>`;
}

// ---------- card peek: hover an event option to see the cards it talks about ----------
// Card names are found in the option's text; "Upgrade all your X cards" shows which
// cards in your deck that would upgrade, already upgraded.
const PEEK_NAMES = Object.entries(CARDS).filter(([, d]) => d.name && !['status'].includes(d.rarity))
  .map(([id, d]) => [d.name, id]).sort((a, b) => b[0].length - a[0].length);
const reEsc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
function peekFor(text) {
  const cards = [];
  let rest = text;
  for (const [name, id] of PEEK_NAMES) {
    const re = new RegExp(`(^|[^A-Za-z])${reEsc(name)}(?![A-Za-z])`);
    if (re.test(rest)) { cards.push(id); rest = rest.replace(re, '$1#'); }
  }
  const html = cards.map((id) => `<div class="peek-pair">${cardHTML({ id })}${canUpgrade({ id }) ? cardHTML({ id, up: true }, 'alt-view') : ''}</div>`);
  const m = text.match(/Upgrade all your (\w+) cards/i);
  if (m && run) {
    const key = m[1].toLowerCase();
    const arch = Object.keys(ARCHES).find((a) => ARCHES[a].name.toLowerCase() === key);
    const hit = run.deck.filter((c) => canUpgrade(c) && (key === 'hybrid' ? !!CARDS[c.id].arch2 : arch && (CARDS[c.id].arch === arch || CARDS[c.id].arch2 === arch)));
    if (hit.length) {
      const seen = new Set();
      const uniq = hit.filter((c) => !seen.has(c.id) && seen.add(c.id));
      html.push(`<p class="peek-note">${hit.length} card${hit.length > 1 ? 's' : ''} in your deck would upgrade:</p><div class="peek-row">${uniq.slice(0, 8).map((c) => cardHTML({ ...c, up: true }, 'alt-view')).join('')}${uniq.length > 8 ? `<span class="peek-more">+${uniq.length - 8} more</span>` : ''}</div>`);
    } else html.push('<p class="peek-note">None of your cards would upgrade right now.</p>');
  }
  return html.join('');
}
const peek = document.createElement('div');
peek.className = 'card-peek';
peek.hidden = true;
document.body.appendChild(peek);
function bindPeek(root) {
  root.querySelectorAll('[data-peek]').forEach((el) => {
    const html = peekFor(el.dataset.peek);
    if (!html) return;
    el.classList.add('has-peek');
    const show = () => {
      peek.innerHTML = html; peek.hidden = false;
      const r = el.getBoundingClientRect(), pr = peek.getBoundingClientRect();
      let x = r.right + 14;
      if (x + pr.width > innerWidth - 8) x = Math.max(8, r.left - pr.width - 14);
      const y = Math.max(8, Math.min(innerHeight - pr.height - 8, r.top + r.height / 2 - pr.height / 2));
      peek.style.left = `${x}px`; peek.style.top = `${y}px`;
    };
    const hide = () => { peek.hidden = true; };
    el.addEventListener('pointerenter', (e) => { if (e.pointerType === 'mouse') show(); });
    el.addEventListener('pointerleave', hide);
    el.addEventListener('focus', show);
    el.addEventListener('blur', hide);
    el.addEventListener('click', hide);
  });
}

function charmBadge(id, cls = '') {
  const c = CHARMS[id];
  return `<button class="charm ${cls}" data-tip="${esc(`${c.name}: ${c.desc}`)}" aria-label="${esc(`${c.name}: ${c.desc}`)}">${charmIcon(id)}</button>`;
}

function header() {
  const floorRooms = run.map ? run.map.rows.length + 1 : 10;
  const roomNo = run.pos ? (run.pos.row === 'boss' ? floorRooms : run.pos.row + 1) : 0;
  return `<header class="bar">
    <div class="bar-left">
      <span class="pill hp" aria-label="Health">${uiIcon('heart')}<b>${run.hp}</b>/${run.maxHp}</span>
      <span class="pill coins" aria-label="Coins">${uiIcon('coin')}<b>${run.coins}</b></span>
      <span class="pill floor">${esc(ACTS[run.act].name)} <small>room ${roomNo}/${floorRooms}</small></span>
      ${run.climb ? `<span class="pill climb" data-tip="${esc(climbTip(run.climb))}" aria-label="Level ${run.climb}">${uiIcon('flag')}<b>${run.climb}</b></span>` : ''}
    </div>
    <div class="bar-snacks" aria-label="Snack bar">${snackBar(run).map((id, i) => (id ? `<button class="snack" data-snack="${i}" data-tip="${esc(`${SNACKS[id].name}: ${SNACKS[id].desc}`)}" aria-label="${esc(`${SNACKS[id].name}: ${SNACKS[id].desc}`)}">${snackIcon(id)}</button>` : '<span class="snack empty" title="Empty snack slot"></span>')).join('')}</div>
    <div class="bar-charms">${run.charms.map((k) => charmBadge(k)).join('')}</div>
    <div class="bar-right">
      <button class="btn small icon-only" data-sound aria-label="Settings" title="Settings">${uiIcon('gear')}</button>
      ${run.map ? '<button class="btn small" data-showmap title="See the floor map (M)">Map</button>' : ''}
      <button class="btn small" data-deck>Deck <b>${run.deck.length}</b></button>
      <button class="btn small icon-only" data-menu aria-label="Menu" title="Menu">${uiIcon('menu')}</button>
    </div>
  </header>`;
}

function bindHeader(root) {
  root.querySelector('[data-deck]')?.addEventListener('click', () => { const s = deckStyle(run); showDeck(run.deck, 'Your deck', s ? `Play style: <b class="arch a-${s.arch}">${ARCHES[s.arch].name}</b> · ${esc(ARCHES[s.arch].desc)} Rewards will offer more ${ARCHES[s.arch].name} cards.` : 'No play style yet. Pick up cards from any style (Glitch, Guard, Combo, Memory, Dreamy, Cozy, Exposed) and rewards will start offering more of it.'); });
  root.querySelector('[data-menu]')?.addEventListener('click', menu);
  const mapBtn = root.querySelector('[data-showmap]');
  if (mapBtn && root.querySelector('.map-screen')) mapBtn.remove(); // already looking at it
  mapBtn?.addEventListener('click', showMap);
  root.querySelector('[data-sound]')?.addEventListener('click', soundSettings);
  root.querySelectorAll('[data-snack]').forEach((b) => b.addEventListener('click', () => snackMenu(Number(b.dataset.snack))));
}
let barChanged = null; // the shop re-renders its shelves when the snack bar changes
function refreshHeader() {
  if (barChanged) { barChanged(); return; }
  const bar = app.querySelector('.bar');
  if (!bar) return;
  bar.outerHTML = header();
  bindHeader(app);
}

// Click a snack in the bar: eat it (in a fight, or on the map for "anytime" snacks) or toss it.
function snackMenu(slot) {
  const id = snackBar(run)[slot];
  const s = SNACKS[id];
  if (!s) return;
  const inFight = !!battle && !battle.over;
  const canEat = inFight ? !battle.busy : !!s.anytime;
  const why = inFight ? (canEat ? '' : 'Wait for the cards to settle.') : s.anytime ? '' : 'Eat this one during a fight.';
  const m = modal(`<div class="snack-pop"><span class="big-icon">${snackIcon(id)}</span><h2>${esc(s.name)}</h2><p>${esc(s.desc)}</p>
    ${why ? `<p class="deck-note">${esc(why)}</p>` : ''}
    <div class="row3"><button class="btn yellow" data-eat ${canEat ? '' : 'disabled'}>Eat</button><button class="btn" data-toss>Toss</button><button class="btn ghost" data-close>Cancel</button></div></div>`);
  m.el.querySelector('[data-eat]').addEventListener('click', () => {
    if (inFight) { if (battle.useSnack(id)) removeSnack(run, slot); }
    else { const out = eatOnMap(run, slot); if (out) sfx('coin'); }
    m.close();
    refreshHeader();
  });
  m.el.querySelector('[data-toss]').addEventListener('click', () => { removeSnack(run, slot); m.close(); refreshHeader(); });
}

// Pick a snack from the bar (for trades and swaps). Resolves to the slot index or null.
function pickSnackSlot(title) {
  return new Promise((resolve) => {
    let done = false;
    const bar = snackBar(run);
    const m = modal(`<h2>${esc(title)}</h2><div class="snack-pick">${bar.map((id, i) => (id ? `<button class="charm-card" data-slot="${i}"><span class="big-icon">${snackIcon(id)}</span><b>${esc(SNACKS[id].name)}</b><small>${esc(SNACKS[id].desc)}</small></button>` : '')).join('')}</div><button class="btn ghost" data-close>Cancel</button>`,
      { onClose: () => { if (!done) resolve(null); } });
    m.el.querySelectorAll('[data-slot]').forEach((b) => b.addEventListener('click', () => { done = true; m.close(); resolve(Number(b.dataset.slot)); }));
  });
}

// Fast mode: shortens battle timers (via PACE) and CSS animations (via html.fast).
function applyPace() {
  PACE.scale = settings.fast ? 0.45 : 1;
  document.documentElement.classList.toggle('fast', !!settings.fast);
}
applyPace();

function soundSettings() {
  const pct = (v) => Math.round(v * 100);
  const m = modal(`<h2>Settings</h2>
    <label class="slider"><span>Music <b data-mv>${pct(settings.music)}%</b></span>
      <input type="range" min="0" max="100" step="5" value="${pct(settings.music)}" data-music aria-label="Music volume"></label>
    <label class="slider"><span>Effects <b data-sv>${pct(settings.sfx)}%</b></span>
      <input type="range" min="0" max="100" step="5" value="${pct(settings.sfx)}" data-sfx aria-label="Sound effects volume"></label>
    <div class="row2">
      <button class="btn ghost" data-mute-music>${settings.musicOn ? 'Mute music' : 'Unmute music'}</button>
      <button class="btn ghost" data-mute-sfx>${settings.sfxOn ? 'Mute effects' : 'Unmute effects'}</button>
    </div>
    <label class="toggle"><input type="checkbox" data-fast ${settings.fast ? 'checked' : ''}><span><b>Fast mode</b><small>Quicker card flips, enemy turns and animations.</small></span></label>
    <label class="slider"><span>Background music</span>
      <select data-track aria-label="Background music">${Object.entries(TRACKS).map(([id, t]) => `<option value="${id}" ${settings.track === id ? 'selected' : ''}>${esc(t.name)}${t.by ? ` (${esc(t.by)})` : ''}</option>`).join('')}</select></label>
    <button class="btn" data-close>Done</button>`);
  const el = m.el;
  el.querySelector('[data-music]').addEventListener('input', (e) => { settings.music = e.target.value / 100; settings.musicOn = true; el.querySelector('[data-mv]').textContent = `${e.target.value}%`; el.querySelector('[data-mute-music]').textContent = 'Mute music'; saveSettings(); });
  el.querySelector('[data-sfx]').addEventListener('input', (e) => { settings.sfx = e.target.value / 100; settings.sfxOn = true; el.querySelector('[data-sv]').textContent = `${e.target.value}%`; el.querySelector('[data-mute-sfx]').textContent = 'Mute effects'; saveSettings(); });
  el.querySelector('[data-sfx]').addEventListener('change', () => sfx('match', 2));
  el.querySelector('[data-track]').addEventListener('change', (e) => setTrack(e.target.value));
  el.querySelector('[data-fast]').addEventListener('change', (e) => { settings.fast = e.target.checked; saveSettings(); applyPace(); });
  el.querySelector('[data-mute-music]').addEventListener('click', (e) => { settings.musicOn = !settings.musicOn; e.target.textContent = settings.musicOn ? 'Mute music' : 'Unmute music'; saveSettings(); });
  el.querySelector('[data-mute-sfx]').addEventListener('click', (e) => { settings.sfxOn = !settings.sfxOn; e.target.textContent = settings.sfxOn ? 'Mute effects' : 'Unmute effects'; saveSettings(); sfx('click'); });
}

// UI click sounds
document.addEventListener('click', (e) => {
  const t = e.target.closest?.('button, .node.avail');
  if (!t || t.disabled) return;
  if (t.matches('.slot, [data-mute-sfx]')) return;
  if (t.matches('.card-btn, .charm-card, [data-pick], [data-boss]')) sfx('pick');
  else if (t.matches('.node')) sfx('enter');
  else sfx('click');
}, true);


// tooltips for anything with data-tip (hover on desktop, tap on phone)
const tip = document.createElement('div');
tip.className = 'tip';
tip.hidden = true;
document.body.appendChild(tip);
function showTip(el) {
  tip.textContent = el.dataset.tip;
  tip.hidden = false;
  const r = el.getBoundingClientRect();
  const w = Math.min(260, innerWidth - 16);
  tip.style.maxWidth = `${w}px`;
  const tr = tip.getBoundingClientRect();
  let x = r.left + r.width / 2 - tr.width / 2;
  x = Math.max(8, Math.min(innerWidth - tr.width - 8, x));
  let y = r.bottom + 8;
  if (y + tr.height > innerHeight - 8) y = r.top - tr.height - 8;
  tip.style.left = `${x}px`; tip.style.top = `${y}px`;
}
document.addEventListener('pointerover', (e) => { const el = e.target.closest?.('[data-tip]'); if (el && e.pointerType === 'mouse') showTip(el); });
document.addEventListener('pointerout', (e) => { if (e.target.closest?.('[data-tip]') && e.pointerType === 'mouse') tip.hidden = true; });
// (isConnected: a click that re-rendered its own element leaves nothing to point at)
document.addEventListener('click', (e) => { const el = e.target.closest?.('[data-tip]'); if (el?.isConnected) { showTip(el); clearTimeout(showTip.t); showTip.t = setTimeout(() => (tip.hidden = true), 2600); } else tip.hidden = true; });
document.addEventListener('focusin', (e) => { const el = e.target.closest?.('[data-tip]'); if (el) showTip(el); });
document.addEventListener('focusout', () => (tip.hidden = true));

// ---------- modal ----------
function modal(html, { onClose, wide } = {}) {
  const wrap = document.createElement('div');
  wrap.className = 'modal-wrap';
  wrap.innerHTML = `<div class="modal${wide ? ' wide' : ''}" role="dialog" aria-modal="true">${html}</div>`;
  document.body.appendChild(wrap);
  const close = () => { wrap.remove(); document.removeEventListener('keydown', onKey); onClose?.(); };
  const onKey = (e) => { if (e.key === 'Escape') close(); };
  document.addEventListener('keydown', onKey);
  wrap.addEventListener('click', (e) => { if (e.target === wrap) close(); });
  wrap.querySelectorAll('[data-close]').forEach((b) => b.addEventListener('click', close));
  setTimeout(() => wrap.querySelector('button')?.focus(), 30);
  return { el: wrap, close };
}

function showDeck(cards, title, note = '') {
  const sorted = [...cards].sort((a, b) => (CARDS[a.id].type + a.id).localeCompare(CARDS[b.id].type + b.id));
  const hint = sorted.some(hasUpgradeView) ? `<div class="deck-tools"><button class="btn small" data-show-ups aria-pressed="false">Show upgrades</button><span class="deck-note">or click one card to flip it.</span></div>` : '';
  const m = modal(`<h2>${esc(title)}</h2>${note ? `<p class="deck-note">${note}</p>` : ''}${hint}<div class="card-grid">${sorted.map((c, i) => hasUpgradeView(c)
    ? `<button class="card-btn flip" data-flip="${i}" aria-label="${esc(cardName(c))}: show other version">${cardHTML(c)}</button>`
    : cardHTML(c)).join('') || '<p>Empty.</p>'}</div><button class="btn" data-close>Close</button>`, { wide: true });
  // Toggle each card between its normal and upgraded version.
  m.el.querySelectorAll('[data-flip]').forEach((b) => {
    const c = sorted[Number(b.dataset.flip)];
    let other = false;
    const draw = () => { b.innerHTML = cardHTML({ ...c, up: other ? !c.up : c.up }, other ? 'alt-view' : ''); };
    b.addEventListener('click', () => { other = !other; draw(); });
    b.setOther = (v) => { other = v && !c.up; draw(); };
  });
  // Show every card that isn't upgraded yet as its upgraded version (handy for planning).
  const all = m.el.querySelector('[data-show-ups]');
  all?.addEventListener('click', () => {
    const on = all.getAttribute('aria-pressed') !== 'true';
    all.setAttribute('aria-pressed', String(on));
    all.textContent = on ? 'Show current' : 'Show upgrades';
    m.el.querySelectorAll('[data-flip]').forEach((b) => b.setOther(on));
  });
}

// Cards that have an upgraded version worth showing (not statuses or curses).
function hasUpgradeView(c) {
  const r = CARDS[c.id].rarity;
  return r !== 'status' && r !== 'curse';
}

// While choosing a card to upgrade, resting on a card (or focusing it) shows the upgraded version.
// Both versions are drawn once and only toggled: swapping the card's HTML while
// it's being pressed made the browser drop the click, so you had to wait for
// the preview before you could pick a card.
function upgradePreview(btn, c) {
  let t;
  btn.innerHTML = `<span class="pv-base">${cardHTML(c)}</span><span class="pv-up">${cardHTML({ ...c, up: true }, 'alt-view')}</span>`;
  const show = () => btn.classList.add('show-up');
  const hide = () => { clearTimeout(t); btn.classList.remove('show-up'); };
  btn.addEventListener('pointerenter', (e) => { if (e.pointerType === 'mouse') { clearTimeout(t); t = setTimeout(show, 450); } });
  btn.addEventListener('pointerleave', hide);
  btn.addEventListener('focus', () => { if (btn.matches(':focus-visible')) show(); }); // keyboard only; a click picks right away
  btn.addEventListener('blur', hide);
}

// Pick a card from the deck; resolves to deck index or null.
function pickFromDeck(title, filter = () => true, confirmLabel) {
  return new Promise((resolve) => {
    const items = run.deck.map((c, i) => ({ c, i })).filter(({ c }) => filter(c));
    if (!items.length) { resolve(null); return; }
    let done = false;
    const preview = filter === canUpgrade;
    const m = modal(`<h2>${esc(title)}</h2>${preview ? '<p class="deck-note">Hover a card to see what the upgrade does.</p>' : ''}<div class="card-grid">${items.map(({ c, i }) => `<button class="card-btn" data-i="${i}" aria-label="${esc(cardName(c))}">${cardHTML(c)}</button>`).join('')}</div><button class="btn ghost" data-close>Cancel</button>`, {
      wide: true, onClose: () => { if (!done) resolve(null); },
    });
    m.el.querySelectorAll('[data-i]').forEach((b) => {
      if (preview) upgradePreview(b, run.deck[Number(b.dataset.i)]);
      b.addEventListener('click', () => { done = true; m.close(); resolve(Number(b.dataset.i)); });
    });
    void confirmLabel;
  });
}

function menu() {
  const m = modal(`<h2>Paused</h2><div class="stack">
    <button class="btn" data-close>Keep playing</button>
    <button class="btn ghost" data-help>How to play</button>
    <button class="btn ghost" data-home>Save &amp; go to title</button>
    <button class="btn danger" data-abandon>Give up this run</button></div>`);
  m.el.querySelector('[data-help]').addEventListener('click', () => { m.close(); help(); });
  m.el.querySelector('[data-home]').addEventListener('click', () => { m.close(); if (!battle) saveRun(run); battle = null; title(); });
  m.el.querySelector('[data-abandon]').addEventListener('click', () => { m.close(); battle = null; gameOver(false, true); });
}

function help() {
  modal(`<h2>How to play</h2><div class="help-text">
    <p><b>Climb the ${GAME.tower}.</b> Three floors, a boss at the top of each.</p>
    <p><b>Match pairs to play cards.</b> Each card in your deck is a face-down pair on the board.</p>
    <p><b>Flipping a pair costs 1 ${T.energy}.</b> You get 3 a turn, then the enemy acts.</p>
    <p><b>Cards stay where they are</b> between turns, so remember them. Clear the board for +1 ${T.energy}.</p>
    <p><b>Combo:</b> matches in a row hit harder. A miss resets it.</p>
    <p><b>${T.sleepy}:</b> enough of it and the enemy falls ${T.asleep} and skips turns.</p>
    <p><b>${T.cozy}:</b> healing past max ${T.hp} hits the enemy.</p>
    <p><b>Styles:</b> pick up cards of one style and you'll be offered more of it.</p>
    <p class="muted">Keys: arrows move · Enter flips · E ends turn · D deck · M map · Esc menu</p>
  </div><button class="btn" data-close>Got it</button>`, { wide: true });
}

// ---------- title ----------
// ---------- title secret ----------
// Click the KIOKU TOWER logo 20 times and her shibas, Haru and Issei, come
// running onto the main menu (and stay there until the page is reloaded).
const SECRET_CLICKS = 20;
let logoClicks = 0, shibasHere = false;
const shibaHTML = (running) => ['haru', 'issei'].map((id) => `<span class="title-shiba ${id}${running ? ' run-in' : ''} pettable" role="button" tabindex="0" aria-label="Pet ${GUARDIANS[id].name}" data-shiba="${id}">${guardianChibi(id)}</span>`).join('');
function bindShibas() {
  app.querySelectorAll('[data-shiba]').forEach((el) => bindPet(el, GUARDIANS[el.dataset.shiba]));
}
function bindLogoSecret() {
  const logo = app.querySelector('.logo');
  if (!logo) return;
  logo.classList.add('secret');
  logo.addEventListener('click', () => {
    logo.classList.remove('boing'); void logo.offsetWidth; logo.classList.add('boing');
    if (shibasHere) { sfx('bark', Math.random() < 0.5); return; }
    logoClicks += 1;
    sfx('click');
    if (logoClicks === 10) sfx('bark', true); // a faint yip from somewhere...
    if (logoClicks < SECRET_CLICKS) return;
    shibasHere = true;
    app.querySelector('.home-art').insertAdjacentHTML('beforeend', shibaHTML(true));
    bindShibas();
    sfx('bark'); setTimeout(() => sfx('bark', true), 260); setTimeout(() => sfx('win'), 700);
    setTimeout(() => app.querySelectorAll('[data-shiba]').forEach((el) => petFx(el, GUARDIANS[el.dataset.shiba])), 1300);
  });
  bindShibas();
}

// ---------- run history ----------
// The progress save keeps the last runs (newest first). Older entries may be
// missing the guardians / bosses / knocked-out-by fields.
function historyScreen(filter = 'all') {
  battle = null;
  const p = getProgress();
  const all = p.history || [];
  const keep = { all: () => true, won: (h) => h.won, ...Object.fromEntries(Object.keys(CHARACTERS).map((c) => [c, (h) => h.character === c])) };
  const list = all.filter(keep[filter] || keep.all);
  const deckOf = (h) => (h.deck || []).map((s) => ({ id: s.replace(/\+$/, ''), ...(s.endsWith('+') ? { up: true } : {}) })).filter((c) => CARDS[c.id]);
  const when = (t) => { const d = new Date(t * 1000); return `${d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}, ${d.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' })}`; };
  const floorName = (h) => esc(ACTS[h.act]?.name || `Floor ${(h.act || 0) + 1}`);
  const result = (h) => h.won ? `<b>Cleared the tower!</b>${h.bosses?.[2] ? `<small>Beat ${esc(ENEMIES[h.bosses[2]]?.name || 'the final boss')}</small>` : ''}`
    : h.abandoned ? `<b>Gave up</b><small>on ${floorName(h)}</small>`
    : `<b>${h.killed_by && ENEMIES[h.killed_by] ? `Knocked out by ${esc(ENEMIES[h.killed_by].name)}` : 'Knocked out'}</b><small>on ${floorName(h)}</small>`;
  const chars = Object.keys(CHARACTERS).filter((c) => heroOpen(c));
  const tabs = [['all', 'All'], ['won', 'Wins'], ...chars.map((c) => [c, CHARACTERS[c].name])];
  app.innerHTML = `<main class="room history">
    <h1>Run history</h1>
    <p class="room-text">Your last ${all.length === 1 ? 'run' : `${all.length} runs`}, newest first. The game keeps up to 30.</p>
    <div class="hist-summary">${chars.map((c) => { const s = p.characters[c] || {}; return `<div class="hist-hero"><span class="hero-art">${heroSVG(c, { crop: true })}</span><p><b>${esc(CHARACTERS[c].name)}</b><small>${s.runs || 0} runs · ${s.wins || 0} wins · best ${s.best_floor || 0}/${TOTAL_FLOORS} rooms${climbUnlocked(c) ? ` · level ${climbUnlocked(c)} unlocked` : ''}</small></p></div>`; }).join('')}</div>
    <div class="hist-tabs" role="tablist">${tabs.map(([k, n]) => `<button class="btn small${k === filter ? ' yellow' : ' ghost'}" role="tab" aria-selected="${k === filter}" data-hfilter="${k}">${esc(n)}</button>`).join('')}</div>
    <div class="hist-list">${list.map((h) => {
      const i = all.indexOf(h);
      const deck = deckOf(h);
      const met = (h.guardians || []).map((g) => GUARDIANS[g]?.name).filter(Boolean);
      return `<article class="run-row ${h.won ? 'won' : 'lost'}">
        <span class="hero-art">${heroSVG(CHARACTERS[h.character] ? h.character : 'jenny', { crop: true })}</span>
        <div class="run-main">
          <p class="run-result">${result(h)}</p>
          <p class="run-meta"><span>${esc(when(h.ended_at))}</span><span>${esc(CHARACTERS[h.character]?.name || 'Jenny')}</span>${h.climb ? `<span class="pill climb" data-tip="${esc(climbTip(h.climb))}">${uiIcon('flag')}<b>${h.climb}</b></span>` : ''}<span>${h.floors || 0} rooms</span><span>${h.defeated || 0} defeated</span></p>
          ${met.length ? `<p class="run-meta"><span>Guardians: ${esc(met.join(', '))}</span></p>` : ''}
          ${h.top_card && CARDS[h.top_card] ? `<p class="run-meta"><span>Most played: ${esc(CARDS[h.top_card].name)} ×${h.top_plays || 0}</span>${h.best_hit ? `<span>Biggest hit: ${h.best_hit}</span>` : ''}</p>` : ''}
          <div class="run-charms">${(h.charms || []).filter((k) => CHARMS[k]).map((k) => charmBadge(k)).join('') || '<small>No charms</small>'}</div>
        </div>
        <button class="btn small" data-hdeck="${i}" ${deck.length ? '' : 'disabled'}>Deck <b>${deck.length}</b></button>
      </article>`;
    }).join('') || `<p class="room-text">${all.length ? 'No runs match.' : 'No runs yet. Finish a run and it shows up here.'}</p>`}</div>
    <button class="btn big ghost" data-back>Back</button>
  </main>`;
  app.querySelectorAll('[data-hfilter]').forEach((b) => b.addEventListener('click', () => historyScreen(b.dataset.hfilter)));
  app.querySelectorAll('[data-hdeck]').forEach((b) => b.addEventListener('click', () => {
    const h = all[Number(b.dataset.hdeck)];
    showDeck(deckOf(h), `${CHARACTERS[h.character]?.name || 'Jenny'}'s deck`, esc(when(h.ended_at)));
  }));
  app.querySelector('[data-back]').addEventListener('click', title);
  app.querySelector(`[data-hfilter="${filter}"]`)?.focus();
}

export function title() {
  battle = null;
  document.title = `${GAME.name} · Jenny's World`;
  syncUnlocks();
  const saved = loadRun();
  const stats = getProgress().totals;
  // Main menu: title on top, the couple on the left, a column of big
  // buttons in the middle, lifetime stats in the bottom-left corner.
  const couple = heroOpen('toni') ? ['jenny', 'toni'] : ['jenny'];
  app.innerHTML = `<main class="title home">
    <div class="home-logo">
      <h1 class="logo">${GAME.name.split(' ').map((w) => `<span>${esc(w.toUpperCase())}</span>`).join('')}</h1>
      <p class="tagline">${GAME.tagline} · climb the ${GAME.tower}</p>
    </div>
    <div class="home-art${couple.length > 1 ? ' couple' : ''}">${blobBackdrop()}${couple.map((c) => `<span class="home-hero" data-hero-art="${c}">${heroSVG(c)}</span>`).join('')}${shibasHere ? shibaHTML(false) : ''}</div>
    <div class="home-menu">
      ${saved ? `<button class="btn big yellow" data-continue>Continue <small>${esc(ACTS[saved.act].name)} · ${uiIcon('heart')} ${saved.hp}</small></button>` : ''}
      <button class="btn big ${saved ? '' : 'yellow'}" data-new>${saved ? 'New run' : 'Start a run'}</button>
      <button class="btn big ghost" data-help>How to play</button>
      <button class="btn big ghost" data-outfits>Outfits</button>
      <button class="btn big ghost" data-catalog>Kioku Catalog</button>
      <button class="btn big ghost" data-history>Run history</button>
      <button class="btn big ghost" data-sound>Settings</button>
    </div>
    <div class="home-stats"><dl class="stats">
      <div><dt>Runs</dt><dd>${stats.runs}</dd></div>
      <div><dt>Wins</dt><dd>${stats.wins}</dd></div>
      <div><dt>Best</dt><dd>${stats.best_floor}/${TOTAL_FLOORS}</dd></div>
      <div><dt>Defeated</dt><dd>${stats.defeated}</dd></div>
    </dl>
    <p class="footnote">Jenny's World</p></div>
  </main>`;
  app.querySelector('[data-catalog]').addEventListener('click', () => catalogScreen(app, { onBack: title }));
  app.querySelector('[data-help]').addEventListener('click', help);
  app.querySelector('[data-history]').addEventListener('click', () => historyScreen());
  bindLogoSecret();
  app.querySelector('[data-sound]').addEventListener('click', soundSettings);
  app.querySelector('[data-outfits]').addEventListener('click', outfitScreen);
  app.querySelector('[data-continue]')?.addEventListener('click', () => { run = saved; if (run.giftPending) guardianGift(); else mapScreen(); });
  app.querySelector('[data-new]').addEventListener('click', () => {
    if (saved && !confirm('Start over? Your current run will be lost.')) return;
    startNewRun();
  });
}

// ---------- couple outfits ----------
const backFace = (id) => `<span class="face back cb" style="${backStyle(id)}">${backEmblem(id)}</span>`;
const outfitNote = (name) => {
  if (name.startsWith('back:')) {
    const b = name.slice(5);
    return `<div class="unlock-note"><span class="back-thumb">${backFace(b)}</span><p><b>New card back: ${esc(CARD_BACKS[b].name)}!</b> Pick it from Outfits on the title screen.</p></div>`;
  }
  const id = Object.keys(OUTFITS).find((k) => OUTFITS[k].name === name);
  return `<div class="unlock-note"><span class="hero-art">${jennySVG({ outfit: id, crop: true })}</span><span class="hero-art">${heroSVG('toni', { outfit: id, crop: true })}</span><p><b>New outfits: ${esc(name)}!</b> Put them on from Outfits on the title screen.</p></div>`;
};

function refreshHeroArt() {
  document.querySelectorAll('[data-hero-art]').forEach((n) => {
    const back = n.querySelector('.backdrop') ? blobBackdrop() : '';
    n.innerHTML = back + heroSVG(n.dataset.heroArt, 'crop' in n.dataset ? { crop: true } : {});
  });
}

function outfitScreen() {
  const toniOpen = heroOpen('toni');
  const body = () => `<h2>Couple outfits</h2>
    <p class="small-note">Every set has a matching look for Jenny and Toni.${toniOpen ? '' : ' Toni joins after the Floor 1 boss.'}</p>
    <div class="outfit-list"><div class="outfit-sets">${Object.entries(OUTFITS).map(([id, o]) => {
      const open = outfitOpen(id);
      const jOn = wornOutfit('jenny') === id, tOn = wornOutfit('toni') === id;
      return `<div class="outfit${open ? '' : ' locked'}">
        <div class="outfit-art"><span class="hero-art${jOn ? ' on' : ''}">${jennySVG({ outfit: id, crop: true })}</span><span class="hero-art${tOn && toniOpen ? ' on' : ''}${toniOpen ? '' : ' hidden-hero'}">${heroSVG('toni', { outfit: id, crop: true })}</span></div>
        <div class="outfit-info"><b>${esc(o.name)}</b><small>${esc(open ? o.desc : o.unlock.text)}</small>
        ${open ? `<div class="outfit-btns">
          ${toniOpen ? `<button class="btn small yellow" data-wear="both" data-set="${id}" ${jOn && tOn ? 'disabled' : ''}>${jOn && tOn ? 'Both wearing' : 'Wear as a couple'}</button>` : ''}
          <button class="btn small ghost" data-wear="jenny" data-set="${id}" ${jOn ? 'disabled' : ''}>${jOn ? 'Jenny ✓' : 'Jenny'}</button>
          ${toniOpen ? `<button class="btn small ghost" data-wear="toni" data-set="${id}" ${tOn ? 'disabled' : ''}>${tOn ? 'Toni ✓' : 'Toni'}</button>` : ''}
        </div>` : `<em class="lock-tag">Locked</em>`}</div>
      </div>`;
    }).join('')}</div>
    <h2 class="outfit-head">Card backs</h2>
    <p class="small-note">The face-down side of the cards on the board.</p>
    <div class="back-list">${Object.entries(CARD_BACKS).map(([id, b]) => {
      const open = backOpen(id), on = wornBack() === id;
      return `<button class="back-pick${on ? ' on' : ''}${open ? '' : ' locked'}" data-back="${id}" ${open ? '' : 'disabled'} aria-pressed="${on}">
        <span class="back-thumb">${backFace(id)}</span>
        <b>${esc(b.name)}</b><small>${esc(open ? b.desc : b.unlock.text)}</small>${on ? '<em class="tag">Using</em>' : open ? '' : '<em class="lock-tag">Locked</em>'}
      </button>`;
    }).join('')}</div></div>
    <button class="btn" data-close>Done</button>`;
  const m = modal(body(), { wide: true });
  const redraw = () => {
    const box = m.el.querySelector('.outfit-list');
    const scroll = box.scrollTop;
    box.outerHTML = new DOMParser().parseFromString(`<div>${body()}</div>`, 'text/html').querySelector('.outfit-list').outerHTML;
    m.el.querySelector('.outfit-list').scrollTop = scroll;
    bind();
  };
  const bind = () => {
    m.el.querySelectorAll('[data-back]').forEach((b) => b.addEventListener('click', () => { useBack(b.dataset.back); sfx('click'); redraw(); }));
    bindWear();
  };
  const bindWear = () => m.el.querySelectorAll('[data-wear]').forEach((b) => b.addEventListener('click', () => {
    const who = b.dataset.wear, id = b.dataset.set;
    if (who !== 'toni') wearOutfit('jenny', id);
    if (who !== 'jenny') wearOutfit('toni', id);
    sfx('click');
    const box = m.el.querySelector('.outfit-list');
    const scroll = box.scrollTop;
    m.el.querySelector('.outfit-list').outerHTML = new DOMParser().parseFromString(`<div>${body()}</div>`, 'text/html').querySelector('.outfit-list').outerHTML;
    m.el.querySelector('.outfit-list').scrollTop = scroll;
    bind();
    refreshHeroArt();
  }));
  bind();
}

// ---------- character pick ----------
// ---------- climb levels ----------
// Everything active at climb level n (each level keeps the ones below it).
const climbTip = (n) => [`Level ${n}:`, ...CLIMB.slice(1, n + 1).map((c, i) => `${i + 1}. ${c.name}: ${c.text}`)].join('\n');
let climbSel = {}; // level picked per character on the climber screen (starts at the highest unlocked each time the screen opens)
function climbPicker(id) {
  const max = heroOpen(id) ? climbUnlocked(id) : 0;
  if (!max) return '</div>';
  const n = climbSel[id] ?? (climbSel[id] = max);
  return `<div class="climb-pick"${n ? ` data-tip="${esc(climbTip(n))}"` : ''}>
    <button class="btn small" data-climb="${id}" data-step="-1" ${n <= 0 ? 'disabled' : ''} aria-label="Lower level">−</button>
    <span><b>Level ${n}</b><small>${n ? esc(CLIMB[n].name) : `Normal · up to level ${max} unlocked`}</small></span>
    <button class="btn small" data-climb="${id}" data-step="1" ${n >= max ? 'disabled' : ''} aria-label="Raise level">+</button>
  </div></div>`;
}

function pickCharacter(keepPick) {
  battle = null;
  if (keepPick !== true) climbSel = {}; // a fresh visit starts every climber on their highest level
  app.innerHTML = `<main class="room pick-hero">
    <h1>Who's climbing?</h1>
    <p class="room-text">Every card style is open to everyone. Each climber starts a little differently.</p>
    <div class="hero-choices">${Object.entries(CHARACTERS).map(([id, ch]) => !heroOpen(id) ? `<div class="hero-slot"><button class="hero-card locked" disabled>
      <span class="hero-art">${heroSVG(id, { crop: true })}</span>
      <b>???</b>
      <small>${esc(ch.unlock.text)}</small>
    </button>` : `<div class="hero-slot"><button class="hero-card" data-hero="${id}">
      <span class="hero-art">${heroSVG(id, { crop: true })}</span>
      <b>${esc(ch.name)}</b>
      <small>${esc(ch.blurb)}</small>
      <span class="hero-stats">${uiIcon('heart')} ${ch.maxHp} max ${T.hp}</span>
      <em class="hero-passive">${esc(passiveText(ch))}</em>
      <span class="hero-deck">Starts with ${esc([...new Set(ch.deck)].map((c) => { const n = ch.deck.filter((x) => x === c).length; return `${n > 1 ? `${n} ` : ''}${CARDS[c].name}`; }).join(', '))}</span>
    </button>${climbPicker(id)}`).join('')}</div>
    <button class="btn ghost" data-back>Back</button>
  </main>`;
  app.querySelectorAll('[data-hero]').forEach((b) => b.addEventListener('click', () => beginRun(b.dataset.hero, climbSel[b.dataset.hero] || 0)));
  app.querySelectorAll('[data-climb]').forEach((b) => b.addEventListener('click', () => {
    const id = b.dataset.climb, max = climbUnlocked(id);
    climbSel[id] = Math.max(0, Math.min(max, (climbSel[id] ?? max) + Number(b.dataset.step)));
    pickCharacter(true);
    app.querySelector(`[data-climb="${id}"][data-step="${b.dataset.step}"]:not(:disabled)`)?.focus();
  }));
  app.querySelector('[data-back]').addEventListener('click', title);
  app.querySelector('[data-hero]').focus();
}

// ---------- petting ----------
// Click (or Enter/Space on) a guardian: a wiggle, floating hearts, a line and a bark or chime.
function petFx(el, g) {
  if (!el) return;
  el.classList.remove('petted'); void el.offsetWidth; el.classList.add('petted');
  el.petN = (el.petN || 0) + 1;
  sfx(g.dog ? 'bark' : 'pet', g.small);
  for (let i = 0; i < 3; i++) {
    const h = document.createElement('span');
    h.className = 'pet-heart'; h.textContent = '♥';
    h.style.left = `${30 + Math.random() * 40}%`; h.style.animationDelay = `${i * 0.12}s`;
    el.appendChild(h); setTimeout(() => h.remove(), 1600);
  }
  const lines = g.pets || ['♥'];
  let b = el.querySelector('.pet-bubble');
  if (!b) { b = document.createElement('span'); b.className = 'pet-bubble'; el.appendChild(b); }
  b.textContent = lines[(el.petN - 1) % lines.length];
  b.classList.remove('show'); void b.offsetWidth; b.classList.add('show');
}
function bindPet(el, g) {
  el?.addEventListener('click', () => petFx(el, g));
  el?.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); petFx(el, g); } });
}

// ---------- guardian gifts ----------
// A guardian's gift: Haru at the start of a run, then the guardian waiting on
// floors 2 and 3 (see guardians.js). Pick 1 of 3 charms from their set.
function guardianGift() {
  battle = null;
  const gid = guardianFor(run, run.act);
  if (!gid) { run.giftPending = false; saveRun(run); mapScreen(); return; }
  const g = GUARDIANS[gid];
  const mine = (k) => (gid === 'haru' ? CHARMS[k].pool === 'haru' : CHARMS[k].pool === 'guardian' && CHARMS[k].from === gid);
  // the offer is saved, so reloading the page doesn't reroll it
  if (!run.giftOffer?.length) run.giftOffer = Object.keys(CHARMS).filter((k) => mine(k) && !run.charms.includes(k)).sort(() => Math.random() - 0.5).slice(0, 3);
  const ids = run.giftOffer;
  saveRun(run);
  noteGuardianMet(gid);
  ids.forEach(noteCharmSeen);
  const tags = (k) => `${CHARMS[k].style ? `<em class="tag style-${CHARMS[k].style}">${ARCHES[CHARMS[k].style].name} style</em>` : ''}${CHARMS[k].gives ? `<em class="tag gift-cards">+${CHARMS[k].gives.length} ${esc(CARDS[CHARMS[k].gives[0]].name)} cards</em>` : ''}`;
  app.innerHTML = `${gid === 'haru' ? '' : header()}<main class="room gift">
    <div class="gift-art guardian-art pettable" role="button" tabindex="0" aria-label="Pet ${esc(g.name)}" data-pet>${blobBackdrop('#f6b74a', '#ffe08a')}${guardianChibi(g.art)}</div>
    ${gid === 'haru' ? '' : `<span class="special-tag">${esc(ACTS[run.act].name)} guardian</span>`}
    <h1>${gid === 'haru' ? GAME.gift : `${esc(g.name)}'s Gift`}</h1>
    <p class="room-text">${esc(g.line)}</p>
    <p class="pet-hint">Click ${esc(g.name)} to say hi.</p>
    <div class="charm-choices">${ids.map((k) => `<button class="charm-card" data-gift="${k}"><span class="big-icon">${charmIcon(k)}</span><b>${esc(CHARMS[k].name)}</b><small>${esc(CHARMS[k].desc)}</small>${tags(k)}</button>`).join('')}</div>
    ${ids.length ? '' : `<p class="room-text">${esc(g.name)} has nothing left to give you.</p><button class="btn big yellow" data-skip-gift>Keep climbing</button>`}
  </main>`;
  if (gid !== 'haru') bindHeader(app);
  bindPet(app.querySelector('[data-pet]'), g);
  const done = () => {
    run.giftPending = false; run.giftOffer = null;
    saveRun(run);
    if (gid === 'haru' && !localStorage.getItem('sm.helped')) { localStorage.setItem('sm.helped', '1'); help(); }
    mapScreen();
  };
  app.querySelectorAll('[data-gift]').forEach((b) => b.addEventListener('click', () => { takeCharm(b.dataset.gift); done(); }));
  app.querySelector('[data-skip-gift]')?.addEventListener('click', done);
  app.querySelector('[data-gift], [data-skip-gift]')?.focus();
}

// ---------- map ----------
// The floor map as an SVG. `here` marks the room you are in right now (seen from inside a room).
function mapSVG(here = null) {
  run.path ||= [];
  const rows = run.map.rows;
  // Landscape map: the climb runs left → right, the 5 lanes stack top → bottom, boss on the far right.
  const colW = 104, laneH = 84, padX = 56, padY = 52;
  const W = padX * 2 + colW * rows.length + 40;
  const H = padY * 2 + laneH * 4;
  const xOf = (row) => (row === 'boss' ? W - padX : padX + row * colW);
  const yOf = (lane) => padY + lane * laneH;
  const avail = availableRooms(run);
  const isAvail = (r, c) => avail.some((a) => a.row === r && (r === 'boss' || a.col === c));
  const visited = (r, c) => run.path.some((p) => p.row === r && p.col === c);
  // the room you just left, if it can be opened again (a shop, or a card reward you skipped)
  const isBack = (r, c) => !here && !!run.revisit && run.pos?.row === r && run.pos?.col === c;
  // rooms you can still reach from where you are; everything else is greyed out
  const reach = new Set();
  const walk = (r, c) => {
    const key = `${r},${c}`;
    if (reach.has(key)) return;
    reach.add(key);
    if (r < rows.length - 1) rows[r].find((n) => n.col === c).next.forEach((nc) => walk(r + 1, nc));
  };
  const from = here || run.pos;
  if (!from) rows[0].forEach((n) => walk(0, n.col));
  else if (from.row !== 'boss') walk(from.row, from.col);
  const live = (r, c) => reach.has(`${r},${c}`);

  let lines = '';
  rows.forEach((row, r) => row.forEach((n) => {
    const targets = r === rows.length - 1 ? [{ x: xOf('boss'), y: H / 2 }] : n.next.map((c) => ({ x: xOf(r + 1), y: yOf(c), c }));
    targets.forEach((t) => {
      const on = visited(r, n.col) && (t.c === undefined ? run.pos?.row === 'boss' : visited(r + 1, t.c));
      const open = live(r, n.col) && (t.c === undefined || live(r + 1, t.c));
      lines += `<line x1="${xOf(r)}" y1="${yOf(n.col)}" x2="${t.x}" y2="${t.y}" class="${on ? 'on' : open ? '' : 'skip'}"/>`;
    });
  }));
  let nodes = '';
  rows.forEach((row, r) => row.forEach((n) => {
    const h = here && here.row === r && here.col === n.col;
    const a = !here && (isAvail(r, n.col) || isBack(r, n.col)), v = visited(r, n.col), gone = !v && !h && !live(r, n.col);
    nodes += `<g class="node t-${n.type}${a ? ' avail' : ''}${v ? ' done' : ''}${gone ? ' skipped' : ''}${h ? ' here' : ''}${isBack(r, n.col) ? ' back' : ''}" transform="translate(${xOf(r)} ${yOf(n.col)})" ${a ? `tabindex="0" role="button" data-room="${r},${n.col}" aria-label="${n.type} room"` : ''}>
      <circle r="19"/><g transform="translate(-12 -12) scale(.75)">${roomIcon(n.type).replace('<svg viewBox="0 0 32 32" aria-hidden="true">', '').replace('</svg>', '')}</g></g>`;
  }));
  const bossA = !here && isAvail('boss');
  nodes += `<g class="node t-boss${bossA ? ' avail' : ''}" transform="translate(${xOf('boss')} ${H / 2})" ${bossA ? 'tabindex="0" role="button" data-room="boss" aria-label="Boss room"' : ''}>
    <circle r="30"/><g transform="translate(-18 -18) scale(1.125)">${roomIcon('boss').replace('<svg viewBox="0 0 32 32" aria-hidden="true">', '').replace('</svg>', '')}</g></g>`;

  return { W, H, svg: `<svg class="map" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}">${lines}${nodes}</svg>` };
}

// The map from inside a room (fight, shop, event...): look only, no picking.
function showMap() {
  if (!run?.map || document.querySelector('.map-modal')) return;
  const { svg } = mapSVG(run.pending || run.pos);
  const m = modal(`<div class="map-modal"><h2>${esc(ACTS[run.act].name)}</h2><p class="muted">Boss: <b>${esc(ENEMIES[bossFor(run)].name)}</b>${run.pending ? ' · the glowing ring is the room you are in' : ''}</p>
    <div class="map-scroll">${svg}</div>
    <ul class="legend">${['fight', 'elite', 'event', 'shop', 'rest', 'treasure'].map((t) => `<li class="t-${t}">${roomIcon(t)}<span>${T.rooms[t][0]}</span></li>`).join('')}</ul>
    <button class="btn yellow" data-close>Back <kbd>M</kbd></button></div>`, { wide: true, onClose: () => document.removeEventListener('keydown', onKey) });
  const onKey = (e) => { if (e.key.toLowerCase() === 'm' && !e.ctrlKey && !e.metaKey && !e.altKey) { e.preventDefault(); m.close(); } };
  document.addEventListener('keydown', onKey);
}

// Back into the room you just left: a shop (same shelves) or the cards you skipped.
function reopenRoom() {
  if (run.revisit?.type === 'shop') shopScreen(run.revisit.stock);
  else if (run.revisit?.type === 'cards') skippedCardsScreen();
}

function skippedCardsScreen() {
  const { choices } = run.revisit;
  app.innerHTML = `${header()}<main class="reward">
    <h1>Cards you skipped</h1><p class="muted">Still on the table. Take one, or head back to the map.</p>
    <div class="choices">${choices.map((c, i) => `<button class="card-btn" data-pick="${i}" aria-label="${esc(cardName(c))}: ${esc(cardText(c))}">${cardHTML(c)}</button>`).join('')}</div>
    <button class="btn yellow" data-go>Back to the map</button>
  </main>`;
  bindHeader(app);
  app.querySelectorAll('[data-pick]').forEach((b) => b.addEventListener('click', () => { takeCard({ ...choices[Number(b.dataset.pick)] }); run.revisit = null; mapScreen(); }));
  app.querySelector('[data-go]').addEventListener('click', mapScreen);
  app.querySelector('main button')?.focus();
}

function mapScreen() {
  barChanged = null;
  battle = null;
  saveRun(run);
  const rows = run.map.rows;
  const { W, svg } = mapSVG();
  const boss = ENEMIES[bossFor(run)];
  const upstairs = run.act < ACTS.length - 1 ? guardianFor(run, run.act + 1) : null; // picked once, like the boss
  app.innerHTML = `${header()}<main class="map-screen">
    <div class="map-head"><h2>${esc(ACTS[run.act].name)}</h2><p>Boss: <b>${esc(boss.name)}</b> · pick a glowing room</p>${upstairs ? `<p class="map-guardian" data-tip="${esc(`${GUARDIANS[upstairs].name} is waiting at the top of ${ACTS[run.act + 1].name} with a gift.`)}"><span class="mini-guardian">${guardianChibi(GUARDIANS[upstairs].art)}</span>Waiting upstairs: <b>${esc(GUARDIANS[upstairs].name)}</b></p>` : ''}<p class="map-note">${run.map.final ? `Two paths meet at a ${T.rest}. Then three bosses you skipped, stronger than before, and the Net Café itself.` : `Every path has at least two ${T.rest}s. Shops aren't on every path.`}</p></div>
    <div class="map-scroll">${svg}</div>
    <div class="map-pick" data-pick aria-live="polite"></div>
    <ul class="legend">${['fight', 'elite', 'event', 'shop', 'rest', 'treasure'].map((t) => `<li class="t-${t}">${roomIcon(t)}<span>${T.rooms[t][0]}</span></li>`).join('')}</ul>
  </main>`;
  bindHeader(app);
  const scroller = app.querySelector('.map-scroll');
  const target = app.querySelector('.node.avail');
  if (target) {
    // on narrow windows the map scrolls sideways; keep the next rooms in view
    const tx = Number(target.getAttribute('transform').match(/\(([\d.]+) /)[1]);
    scroller.scrollLeft = Math.max(0, (tx / W) * scroller.scrollWidth - scroller.clientWidth / 2);
  }
  // Two-step pick: the first click selects a room and says what it is,
  // a second click (or the Enter button / Enter key) goes in.
  const rooms = [...app.querySelectorAll('[data-room]')].sort((a, b) => a.getBoundingClientRect().top - b.getBoundingClientRect().top);
  const pickEl = app.querySelector('[data-pick]');
  let sel = null;
  const typeOf = (g) => [...g.classList].find((c) => c.startsWith('t-')).slice(2);
  const enter = () => {
    if (!sel) return;
    if (sel.classList.contains('back')) { reopenRoom(); return; }
    const v = sel.dataset.room;
    if (v === 'boss') enterRoom({ row: 'boss' });
    else { const [r, c] = v.split(',').map(Number); enterRoom({ row: r, col: c }); }
  };
  const select = (g) => {
    sel = g;
    rooms.forEach((x) => x.classList.toggle('sel', x === g));
    const [name, what] = g.classList.contains('back')
      ? ['Go back', run.revisit.type === 'shop' ? 'Back into the shop you just left. Same shelves, nothing restocks.' : 'See the cards you skipped again.']
      : T.rooms[typeOf(g)];
    pickEl.innerHTML = `<div class="pick-room t-${typeOf(g)}">${roomIcon(typeOf(g))}<div><b>${esc(name)}</b><span>${esc(what)}</span></div></div><button class="btn yellow" data-go>Go <kbd>Enter</kbd></button>`;
    pickEl.querySelector('[data-go]').addEventListener('click', enter);
    g.focus({ preventScroll: true });
  };
  pickEl.innerHTML = `<p class="pick-hint">${rooms.length > 1 ? 'Click a glowing room to see what it is.' : 'Click the glowing room to see what it is.'} <span class="keys">Or use <kbd>←</kbd><kbd>→</kbd> and <kbd>Enter</kbd>.</span></p>`;
  rooms.forEach((g) => {
    g.addEventListener('click', () => (sel === g ? enter() : select(g)));
    g.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); e.stopPropagation(); sel === g ? enter() : select(g); } });
  });
  app.querySelector('.map-screen').pick = {
    step: (d) => { if (!rooms.length) return; const i = rooms.indexOf(sel); select(rooms[i < 0 ? 0 : (i + d + rooms.length) % rooms.length]); },
    enter: () => (sel ? enter() : rooms[0] && select(rooms[0])),
  };
}

function enterRoom(pos) {
  run.revisit = null; // moving on: the last room can't be reopened any more
  const room = roomAt(run, pos.row, pos.col);
  run.pending = pos;
  const type = room.type;
  if (type === 'fight' || type === 'elite' || type === 'boss') battleScreen(room.enemy || enemyFor(run, type), type);
  else if (type === 'event') eventScreen();
  else if (type === 'rest') restScreen();
  else if (type === 'shop') shopScreen();
  else if (type === 'treasure') treasureScreen();
}

function completeRoom() {
  barChanged = null;
  run.pos = run.pending;
  run.path.push(run.pending);
  run.pending = null;
  run.floorsCleared += 1;
  mapScreen();
}

// ---------- battle ----------
// Plain-words description of an enemy move. `dmg` is the real damage after
// statuses; without it the base number is used (for "next turn" previews).
function describeMove(it, dmg = null) {
  const hit = dmg ?? it.n;
  const base = dmg !== null && dmg !== it.n ? ` (${it.n} before statuses)` : '';
  const atk = it.times ? `attack ${it.times} times for ${hit} each (${hit * it.times} total)${base}` : `attack for ${hit}${base}`;
  const junk = (c) => `shuffle ${c.count} ${CARDS[c.card].name} into your draw pile (${CARDS[c.card].name}: ${cardText({ id: c.card })})`;
  switch (it.t) {
    case 'atk': return `Will ${atk}.`;
    case 'atkBlock': return `Will ${atk} and gain ${it.b} ${T.block}.`;
    case 'block': return `Will gain ${it.n} ${T.block}.`;
    case 'buff': return `Will gain ${it.n} ${T.spirit}: +${it.n} damage on every hit.`;
    case 'heal': return `Will heal ${it.n} ${T.hp}.`;
    case 'debuff': return `Will give you ${[it.weak && `${it.weak} ${T.sleepy} (you deal 25% less damage)`, it.vuln && `${it.vuln} ${T.exposed} (you take 50% more damage)`].filter(Boolean).join(' and ')}.`;
    case 'status': return `Will ${junk(it)}.`;
    case 'atkStatus': return `Will ${atk}, then ${junk(it)}.`;
    case 'scramble': return 'Will shuffle every card left on the board and turn them face down.';
    case 'steal': return `Will ${atk} and steal up to ${it.coins} ${T.coins}. Win the fight to get them back.`;
    case 'drain': return `Will ${atk} and heal as much as gets through your ${T.block}.`;
    case 'ban': return `Will ${it.n ? `${atk} and ` : ''}ban a random card in your draw pile: it sits out the rest of this fight.`;
    default: return '';
  }
}

function battleScreen(enemyId, kind) {
  barChanged = null;
  const def = ENEMIES[enemyId];
  noteEnemyMet(enemyId);
  const theme = kind === 'boss' ? BOSS_THEMES[enemyId] : null;
  run.plays ||= {}; // how many times each card was played this run (for the run-end story)
  app.innerHTML = `${header()}<main class="battle${theme ? ` boss-fight bf-${enemyId}` : ''}">
    ${theme ? `${bossStage(enemyId)}<div class="boss-intro" aria-hidden="true"><b>${esc(def.name)}</b><small>${esc(theme.tag)}</small></div>` : ''}
    <section class="arena">
      <div class="fighter you" data-who="player">
        <div class="portrait" data-hero-art="${run.character}" data-crop>${heroSVG(run.character, { crop: true })}</div>
        <div class="f-name">${esc(hero().name)}</div>
        <div class="hpbar"><i data-hpbar></i><span data-hptext></span><em class="blk" data-blk hidden></em></div>
        <div class="statuses" data-pstat></div>
      </div>
      <div class="vs">${kind === 'boss' ? 'BOSS' : kind === 'elite' ? 'ELITE' : 'VS'}</div>
      <div class="fighter enemy" data-who="enemy">
        <div class="intent" data-intent></div>
        <div class="portrait">${enemySVG(def.art, def.color)}</div>
        <div class="f-name">${esc(def.name)}</div>
        <div class="hpbar enemy"><i data-ehpbar></i><span data-ehptext></span><em class="blk" data-eblk hidden></em></div>
        <div class="statuses" data-estat></div>
      </div>
    </section>
    <section class="energy-bar" data-energy aria-live="polite"></section>
    <section class="board" data-board aria-label="Card board"></section>
    <footer class="controls">
      <div class="mid">
        <div class="mid-now">
          <div class="combo" data-combo></div>
          <div class="log" data-log aria-live="polite"></div>
          <div class="keys-hint" aria-hidden="true"><kbd>←↑→↓</kbd> move · <kbd>Enter</kbd> flip · <kbd>E</kbd> end turn · <kbd>D</kbd> deck · <kbd>M</kbd> map · <kbd>Esc</kbd> menu</div>
        </div>
        <div class="hist" aria-label="Combat history">
          <div class="hist-sum" data-histsum></div>
          <ol class="hist-list" data-hist></ol>
        </div>
      </div>
      <div class="piles">
        <button class="pile" data-pile="draw" aria-label="Draw pile" data-tip="Draw pile: cards that will come up on the next boards.">${icon('pileDraw')}<b data-draw></b><small>Draw</small></button>
        <button class="pile" data-pile="discard" aria-label="Discard pile" data-tip="Discard pile: cards you have played. They shuffle back into the draw pile when it runs out.">${icon('pileDiscard')}<b data-discard></b><small>Discard</small></button>
      </div>
      <button class="btn yellow end" data-end title="End turn (E)">End turn <kbd>E</kbd></button>
    </footer>
  </main>`;
  bindHeader(app);
  const $ = (s) => app.querySelector(s);
  const boardEl = $('[data-board]');

  const float = (who, text, kind2) => {
    const host = app.querySelector(`[data-who="${who}"] .portrait`);
    if (!host) return;
    const f = document.createElement('span');
    f.className = `float k-${kind2}`;
    f.textContent = text;
    f.style.left = `${30 + Math.random() * 40}%`;
    host.appendChild(f);
    setTimeout(() => f.remove(), 1100);
  };
  const shake = (who) => {
    const el = app.querySelector(`[data-who="${who}"]`);
    el.classList.remove('hit'); void el.offsetWidth; el.classList.add('hit');
  };

  const renderBoard = () => {
    const b = battle;
    const hadFocus = boardEl.contains(document.activeElement);
    boardEl.style.setProperty('--cols', gridCols(b.board.length));
    boardEl.innerHTML = b.board.map((s, i) => `<button class="slot" data-i="${i}">
        ${backFace(wornBack())}
        <span class="face front">${cardHTML(s.card)}</span>
      </button>`).join('');
    boardEl.querySelectorAll('.slot').forEach((el) => el.addEventListener('click', () => battle.flip(Number(el.dataset.i))));
    boardEl.classList.remove('deal'); void boardEl.offsetWidth; boardEl.classList.add('deal');
    updateSlots();
    if (hadFocus) boardEl.querySelector('.slot')?.focus();
    fitBoard();
  };
  const updateSlots = () => {
    battle.board.forEach((s, i) => {
      const el = boardEl.children[i];
      if (!el) return;
      // the card in a slot can change after a scramble
      const key = s.card.id + (s.card.up ? '+' : '');
      if (el.dataset.key !== key) { el.dataset.key = key; el.querySelector('.front').innerHTML = cardHTML(s.card); fitCards(el); }
      el.className = `slot s-${s.state}`;
      el.disabled = s.state === 'gone';
      el.setAttribute('aria-label', s.state === 'down' ? `Hidden card ${i + 1}` : `${cardName(s.card)}: ${cardText(s.card)}`);
    });
  };

  const statusHTML = (o) => ['asleep', 'strength', 'weak', 'vuln', 'poison', 'thorns']
    .filter((k) => o[k] > 0)
    .map((k) => {
      const sleepy = k === 'weak' && o.sleepAt;
      const val = sleepy ? `${o[k]}/${o.sleepAt}` : o[k];
      const tip = sleepy ? `${STATUS_HELP[k]} This one falls ${T.asleep} at ${o.sleepAt}.` : STATUS_HELP[k];
      return `<button class="status s-${k}" data-tip="${esc(tip)}">${esc(STATUS_NAMES[k])} <b>${val}</b></button>`;
    }).join('');

  const intentHTML = () => {
    const it = battle.intent; if (!it || battle.enemy.hp <= 0) return '';
    if (battle.enemy.asleep) {
      const n = battle.enemy.asleep;
      return `<div class="bubble" data-tip="${esc(`${T.asleep}: skips its next ${n} turn${n > 1 ? 's' : ''}. When it wakes up it will ${describeMove(it)}.`)}"><span class="i-debuff">${icon('zzz')}${T.asleep} ×${n}</span></div>`;
    }
    const dmg = battle.intentDamage();
    const parts = [];
    if (it.t === 'atk' || it.t === 'atkBlock' || it.t === 'atkStatus' || it.t === 'steal' || it.t === 'drain' || (it.t === 'ban' && it.n)) parts.push(`<span class="i-atk">${icon('blade')}${dmg}${it.times ? `×${it.times}` : ''}</span>`);
    if (it.t === 'block' || it.t === 'atkBlock') parts.push(`<span class="i-def">${icon('shield')}${it.b || it.n}</span>`);
    if (it.t === 'buff') parts.push(`<span class="i-buff">${icon('fire')}Power up</span>`);
    if (it.t === 'heal') parts.push(`<span class="i-buff">${uiIcon('heart')}Heal ${it.n}</span>`);
    if (it.t === 'debuff') parts.push(`<span class="i-debuff">${icon('swirl')}Hex</span>`);
    if (it.t === 'status' || it.t === 'atkStatus') parts.push(`<span class="i-debuff">${icon(CARDS[it.card].icon)}+${it.count} ${esc(CARDS[it.card].name)}</span>`);
    if (it.t === 'scramble') parts.push(`<span class="i-debuff">${icon('bounce')}Scramble</span>`);
    if (it.t === 'steal') parts.push(`<span class="i-debuff">${uiIcon('coin')}Steal ${it.coins}</span>`);
    if (it.t === 'drain') parts.push(`<span class="i-buff">${icon('drop')}Drain</span>`);
    if (it.t === 'ban') parts.push(`<span class="i-debuff">${icon('hammer')}Ban a card</span>`);
    const next = battle.def.ai === 'cycle' ? `Next turn: ${describeMove(battle.def.moves[battle.enemy.step % battle.def.moves.length])}` : battle.def.ai === 'bag' ? 'Draws its next move from a bag of moves (see the Kioku Catalog).' : 'Picks its moves at random.';
    return `<div class="bubble" data-tip="${esc(`${describeMove(it, dmg)} ${next}`)}">${parts.join('')}</div>`;
  };

  const update = () => {
    const b = battle, e = b.enemy;
    $('[data-hpbar]').style.width = `${(run.hp / run.maxHp) * 100}%`;
    $('[data-hptext]').textContent = `${run.hp}/${run.maxHp}`;
    $('[data-ehpbar]').style.width = `${(e.hp / e.maxHp) * 100}%`;
    $('[data-ehptext]').textContent = `${e.hp}/${e.maxHp}`;
    const blk = $('[data-blk]'); blk.hidden = !b.player.block; blk.textContent = b.player.block;
    const eblk = $('[data-eblk]'); eblk.hidden = !e.block; eblk.textContent = e.block;
    const pas = b.character.passive;
    const pasLabel = pas.id === 'stickerBook' ? `${esc(STICKERS[b.nextSticker()].name)} in ${b.stickersIn()}` : esc(pas.name);
    const pasTip = pas.id === 'stickerBook' ? `${passiveText(b.character)} Next: ${STICKERS[b.nextSticker()].name} sticker (${STICKERS[b.nextSticker()].text}) in ${b.stickersIn()} match${b.stickersIn() > 1 ? 'es' : ''}.` : passiveText(b.character);
    $('[data-pstat]').innerHTML = `<span class="status s-power" data-tip="${esc(pasTip)}">${pasLabel}</span>` + statusHTML(b.player) + (b.powers.bedtime ? `<span class="status s-power" data-tip="Bedtime Story: apply ${b.powers.bedtime} ${T.sleepy} each turn.">Story ${b.powers.bedtime}</span>` : '') + (b.powers.deepSleep ? `<span class="status s-power" data-tip="Deep Sleep: enemies stay ${T.asleep} ${b.powers.deepSleep} turn longer.">Deep Sleep</span>` : '') + (b.powers.sweetDreams ? '<span class="status s-power" data-tip="Sweet Dreams: whenever you heal, deal that much damage.">Sweet Dreams</span>' : '') + (b.powers.roast ? `<span class="status s-power" data-tip="Roast Battle: ${T.exposed} on enemies no longer wears off.">Roast</span>` : '') + (b.powers.energy ? `<span class="status s-power" data-tip="Energy Drink: +${b.powers.energy} ${T.energy} each turn.">+${b.powers.energy} ${T.energy}</span>` : '') + (b.powers.fortress ? '<span class="status s-power" data-tip="Blanket Fort: Block stays between turns.">Fort</span>' : '') + (b.powers.freeMiss ? '<span class="status s-power" data-tip="Photo Memory: first miss each turn is free.">Memory</span>' : '') + (b.powers.malware ? `<span class="status s-power" data-tip="Malware: apply ${b.powers.malware} ${T.glitch} each turn.">Malware ${b.powers.malware}</span>` : '') + (b.powers.armor ? `<span class="status s-power" data-tip="Iron Hoodie: gain ${b.powers.armor} ${T.block} each turn.">Armor ${b.powers.armor}</span>` : '') + (b.powers.groove ? '<span class="status s-power" data-tip="Groove: a miss only halves your combo.">Groove</span>' : '') + (b.powers.spotlight ? `<span class="status s-power" data-tip="Spotlight: matching a revealed card deals ${b.powers.spotlight}.">Spotlight</span>` : '');
    if (b.pendingReveal) $('[data-pstat]').insertAdjacentHTML('beforeend', `<span class="status s-reveal" data-tip="Saved reveals: these cards will be revealed as soon as the next board is dealt.">${uiIcon('eye')} ${b.pendingReveal} saved</span>`);
    $('[data-estat]').innerHTML = statusHTML(e);
    $('[data-intent]').innerHTML = intentHTML();
    const en = $('[data-energy]');
    // While the first card of a pair is face up, its energy is "in use", not spent:
    // the pip glows and nothing says "out of energy" until the pair is finished.
    const pending = b.first ? 1 : 0;
    const shown = b.energy + pending;
    const slots = Math.max(b.turnEnergy, shown);
    const pips = slots <= 8 ? Array.from({ length: slots }, (_, i) => `<i class="pip${i < b.energy ? ' on' : i < shown ? ' using' : ''}">${icon('bolt')}</i>`).join('') : '';
    const out = shown === 0 && !b.over;
    const label = out ? `<span class="en-empty">Out of ${T.energy} · enemy turn</span>`
      : pending ? `<span><b>${b.energy}</b> ${T.energy} left · pick a second card</span>`
      : `<span><b>${b.energy}</b> ${T.energy} left · each pair costs 1</span>`;
    if (en.dataset.last !== String(shown)) {
      const up = Number(en.dataset.last || 0) < shown;
      en.classList.remove('gain', 'spend'); void en.offsetWidth; en.classList.add(up ? 'gain' : 'spend');
      en.dataset.last = shown;
    }
    en.innerHTML = `<div class="pips">${pips}${slots > 8 ? `<i class="pip on">${icon('bolt')}</i><b class="pip-count">×${b.energy}</b>` : ''}</div>${label}`;
    en.classList.toggle('empty', out);
    $('[data-combo]').innerHTML = b.combo > 1 ? `Combo ×${b.combo} <small>+${(b.combo - 1) * b.comboStep()} dmg</small>` : b.combo === 1 ? 'Combo ×1' : '';
    $('[data-draw]').textContent = b.draw.length;
    $('[data-discard]').textContent = b.discard.length;
    $('[data-end]').disabled = b.busy || b.over;
    app.querySelector('.hp b').textContent = run.hp;
    updateSlots();
  };

  // Combat history: newest first. A card's line adds up every hit it lands on the enemy;
  // the enemy's hits on its turn share one line. The top line totals the current turn.
  const hist = [];
  let cur = null, turnNo = 1, dealt = 0, taken = 0, fightDealt = 0, enemyPhase = false;
  const histLine = (h) => h.kind === 'turn' ? `<li class="h-turn">Turn ${h.n}</li>`
    : h.kind === 'play' ? `<li class="h-play"><span>${esc(h.name)}</span>${h.dmg ? `<b>${h.dmg}</b>` : h.blocked ? '' : '<i>no damage</i>'}${h.blocked ? `<small>${h.blocked} blocked</small>` : ''}</li>`
    : h.kind === 'dot' ? `<li class="h-play"><span>${esc(h.name)}</span><b>${h.dmg}</b></li>`
    : `<li class="h-taken"><span>${esc(h.name)}</span><b>${h.dmg ? `-${h.dmg}` : 0}</b>${h.blocked ? `<small>${h.blocked} blocked</small>` : ''}</li>`;
  const renderHist = () => {
    const el = $('[data-hist]'), sum = $('[data-histsum]');
    if (!el) return;
    sum.innerHTML = `This turn: <b>${dealt}</b> dealt · <b class="t">${taken}</b> taken <small>Fight: ${fightDealt}</small>`;
    el.innerHTML = hist.slice(-40).reverse().map(histLine).join('');
  };
  const pushHist = (h) => { hist.push(h); renderHist(); return h; };

  battle = new Battle(run, enemyId, {
    log: (m) => { const l = $('[data-log]'); if (l) l.textContent = m; },
    sfx: (n, a) => sfx(n, a),
    board: () => renderBoard(),
    update: () => update(),
    float: (who, text, k) => {
      float(who, text, k);
      const map = { block: 'shield', heal: 'heal', energy: 'energy', weak: 'debuff', vuln: 'debuff', poison: 'debuff', strength: 'buff', thorns: 'buff' };
      if (map[k] && !(k === 'energy' && text.startsWith('-'))) sfx(map[k]);
    },
    hit: (who, dmg, blocked, why) => {
      if (who === 'enemy') {
        dealt += dmg; fightDealt += dmg;
        if (why === 'poison' || why === 'thorns') pushHist({ kind: 'dot', name: why === 'poison' ? T.glitch : 'Thorns', dmg });
        else if (cur && cur.kind === 'play') { cur.dmg += dmg; cur.blocked += blocked; renderHist(); }
        else pushHist({ kind: 'dot', name: 'Bonus hit', dmg });
      } else {
        taken += dmg;
        const last = hist[hist.length - 1], mine = why === 'self' || !enemyPhase;
        if (!mine && last?.kind === 'taken' && last.enemy && last.turn === turnNo) { last.dmg += dmg; last.blocked += blocked; renderHist(); }
        else { pushHist({ kind: 'taken', enemy: !mine, name: mine ? 'You lose HP' : def.name, dmg, blocked, turn: turnNo }); cur = null; }
      }
      if (dmg > 0) sfx(who === 'enemy' ? 'hit' : 'hurt'); else if (blocked > 0) sfx('block');
      if (who === 'enemy' && dmg > (run.bestHit || 0)) run.bestHit = dmg;
      if (dmg > 0) { float(who, `-${dmg}`, why && why !== 'self' ? why : 'dmg'); shake(who); }
      if (blocked > 0) float(who, `${blocked} blocked`, 'block');
    },
    flash: (ms) => { boardEl.classList.add('peek'); setTimeout(() => boardEl.classList.remove('peek'), ms); },
    scramble: () => { sfx('scramble'); boardEl.classList.remove('scramble'); void boardEl.offsetWidth; boardEl.classList.add('scramble'); },
    turn: () => {
      enemyPhase = false;
      if (battle) { turnNo = battle.turn; dealt = 0; taken = 0; cur = null; pushHist({ kind: 'turn', n: turnNo }); }
      if (battle && battle.turn > 1) { sfx('turn'); const l = $('[data-log]'); if (l && !l.textContent) l.textContent = 'Your turn.'; } },
    play: (card) => { run.plays[card.id] = (run.plays[card.id] || 0) + 1; cur = pushHist({ kind: 'play', name: cardName(card), dmg: 0, blocked: 0 }); },
    enemyAct: () => { cur = null; enemyPhase = true; if (theme) sfx('motif', theme.voice, true); },
    end: (result) => {
      if (result === 'win' && kind === 'boss') { bossKO(); return; }
      sfx(result === 'win' ? 'win' : 'lose');
      setTimeout(() => (result === 'win' ? battleWon(kind, enemyId) : gameOver(false, false, enemyId)), 900 * PACE.scale);
    },
  });
  // The final blow on a boss: big K.O. pop, the fight slows down, then the win.
  const bossKO = () => {
    const main = app.querySelector('main.battle');
    sfx('ko');
    musicSlowMo(900);
    // the final blow's number, big, outside the fading enemy picture
    const last = [...app.querySelectorAll('[data-who="enemy"] .float:not(.k-block)')].pop();
    if (last) { app.querySelector('[data-who="enemy"]').insertAdjacentHTML('beforeend', `<span class="ko-num">${esc(last.textContent)}</span>`); last.remove(); }
    main.insertAdjacentHTML('beforeend', '<div class="ko-flash" aria-hidden="true"></div><div class="ko-stamp" role="status"><b>K.O.!</b></div>');
    main.classList.add('ko');
    setTimeout(() => sfx('win'), 1100 * PACE.scale);
    setTimeout(() => battleWon(kind, enemyId), 2600 * PACE.scale);
  };
  $('[data-end]').addEventListener('click', () => battle.endTurn());
  app.querySelectorAll('[data-pile]').forEach((p) => p.addEventListener('click', () => {
    const which = p.dataset.pile;
    showDeck(battle[which].map((c) => ({ id: c.id, up: c.up })), which === 'draw' ? 'Draw pile (random order)' : 'Discard pile');
  }));
  battle.start();
  update();
  // The board is sized from the space left over, so measure again once the energy bar and
  // the bottom bar have their content (and whenever their height changes, e.g. a long log line).
  fitBoard();
  const refit = new ResizeObserver(() => { if (app.contains(boardEl)) fitBoard(); else refit.disconnect(); });
  [$('[data-energy]'), app.querySelector('.controls')].forEach((el) => refit.observe(el));
  if (theme) setTimeout(() => sfx('motif', theme.sting), 200);
}

// ---------- keyboard ----------
// Battle: arrows move between cards, Enter/Space flips, E ends the turn,
// D opens your deck. Map: arrows pick a room, Enter goes in. Esc opens the menu.
document.addEventListener('keydown', (e) => {
  if (e.ctrlKey || e.metaKey || e.altKey || e.target.matches?.('input, textarea, select')) return;
  if (document.querySelector('.modal-wrap')) return; // modals handle their own keys
  const key = e.key.length === 1 ? e.key.toLowerCase() : e.key;
  if (key === 'Escape' && app.querySelector('[data-menu]')) { e.preventDefault(); menu(); return; }
  if (key === 'd' && app.querySelector('[data-deck]')) { e.preventDefault(); app.querySelector('[data-deck]').click(); return; }
  if (key === 'm' && app.querySelector('[data-showmap]')) { e.preventDefault(); showMap(); return; }
  if (battle && app.querySelector('.battle')) {
    if (key === 'e' || (key === ' ' && !e.target.closest?.('button'))) { e.preventDefault(); if (!battle.over) battle.endTurn(); return; }
    if (key.startsWith('Arrow')) { e.preventDefault(); moveBoardFocus(key); }
    return;
  }
  const map = app.querySelector('.map-screen');
  if (map && map.pick) {
    if (key.startsWith('Arrow')) { e.preventDefault(); map.pick.step(key === 'ArrowUp' || key === 'ArrowLeft' ? -1 : 1); }
    else if (key === 'Enter' || key === ' ') { e.preventDefault(); map.pick.enter(); }
  }
});

// Wide PC layout: the cards are the same size on every floor. The card size is the one
// that lets the biggest board (Floor 3) fit the space in the middle column, and each
// board picks the column count that fits at that size and is closest in shape to it.
const WIDE = matchMedia('(min-width: 1000px), (orientation: landscape) and (max-height: 520px)'); // PC, or a phone on its side
const CARD_RATIO = 6.2 / 5; // slot height / width
// Narrow (phone) columns that fill every spot without scrolling: 16 cards 4x4,
// 18 cards 6x3, 20 cards 5x4. Wide screens pick their own in fitBoard().
const gridCols = (n) => [4, 5, 6].find((c) => n % c === 0 && n / c <= c) || (n > 16 ? 5 : 4);
const BOARD_SIZES = RULES.boardPairs.map((p) => p * 2); // cards on a full board, per floor
function fitBoard() {
  const battleEl = app.querySelector('main.battle');
  const board = battleEl?.querySelector('[data-board]');
  if (!board) return;
  if (!WIDE.matches) { board.style.width = ''; board.style.removeProperty('--cw'); fitCards(board); return; }
  const cs = getComputedStyle(battleEl), bs = getComputedStyle(board);
  const W = parseFloat(cs.gridTemplateColumns.split(' ')[1]);
  const top = battleEl.getBoundingClientRect().top;
  const energy = battleEl.querySelector('[data-energy]').offsetHeight;
  const controls = battleEl.querySelector('.controls').offsetHeight;
  const H = window.innerHeight - top - parseFloat(cs.paddingTop) - parseFloat(cs.paddingBottom) - energy - controls - 2 * parseFloat(cs.rowGap);
  const pad = 2 * (parseFloat(bs.paddingLeft) + parseFloat(bs.borderLeftWidth));
  const gap = parseFloat(bs.columnGap);
  const COLS = [3, 4, 5, 6, 7, 8];
  const layouts = (n) => { const full = COLS.filter((c) => n % c === 0); return (full.length ? full : COLS).map((c) => ({ c, r: Math.ceil(n / c) })); };
  const widthFor = ({ c, r }) => Math.min((W - pad - gap * (c - 1)) / c, (H - pad - gap * (r - 1)) / r / CARD_RATIO);
  const bestFor = (n) => layouts(n).reduce((a, l) => (widthFor(l) > widthFor(a) ? l : a));
  const n = board.children.length;
  // the card size every floor shares: whatever the biggest board can fit
  const ref = bestFor(Math.max(n, ...BOARD_SIZES));
  const cw = Math.floor(widthFor(ref));
  // this board: a layout that fits at that size, as close in shape to the biggest board as possible
  const shape = ({ c, r }) => Math.log((c * cw) / (r * cw * CARD_RATIO));
  // Even rows first. If none fits at that size (Floor 2's 18 cards only split 3 or 6 wide),
  // allow a short last row, which sits centred. The biggest board's column count always fits.
  const ragged = COLS.map((c) => ({ c, r: Math.ceil(n / c) }));
  let fits = layouts(n).filter((l) => widthFor(l) >= cw);
  if (!fits.length) fits = ragged.filter((l) => widthFor(l) >= cw);
  const pick = fits.length ? fits.reduce((a, l) => (Math.abs(shape(l) - shape(ref)) < Math.abs(shape(a) - shape(ref)) ? l : a)) : bestFor(n);
  const size = Math.min(cw, Math.floor(widthFor(pick))); // never wider than the space, whatever happens
  board.style.setProperty('--cols', pick.c);
  board.style.setProperty('--cw', size);
  board.style.width = `${pick.c * size + gap * (pick.c - 1) + pad}px`;
  fitCards(board);
}

// Shrink each board card a step at a time until nothing is cut off: the picture first
// (down to half size), then the text. Long names wrap to two lines on small cards,
// so counting letters alone isn't enough.
function fitCards(root) {
  const over = (c) => c.scrollHeight > c.clientHeight + 1;
  root.querySelectorAll('.slot .front .card').forEach((c) => {
    let art = 1, fit = 1;
    c.style.removeProperty('--art'); c.style.removeProperty('--fit');
    while (over(c) && art > 0.5) { art = Math.round((art - 0.1) * 10) / 10; c.style.setProperty('--art', art); }
    while (over(c) && fit > 0.6) { fit = Math.round((fit - 0.05) * 100) / 100; c.style.setProperty('--fit', fit); }
  });
}
window.addEventListener('resize', () => fitBoard());

function moveBoardFocus(key) {
  const board = app.querySelector('[data-board]');
  const slots = [...board.querySelectorAll('.slot')];
  const cols = Number(getComputedStyle(board).getPropertyValue('--cols')) || 4;
  let i = slots.indexOf(document.activeElement);
  if (i < 0) { slots.find((s) => !s.disabled)?.focus(); return; }
  const d = { ArrowLeft: -1, ArrowRight: 1, ArrowUp: -cols, ArrowDown: cols }[key];
  for (let j = i + d; j >= 0 && j < slots.length; j += d) {
    if (!slots[j].disabled) { slots[j].focus(); return; }
  }
}

function battleWon(kind, enemyId) {
  battle = null;
  run.kills += 1;
  noteEnemyDefeated(enemyId);
  // The final boss gives no rewards for now (nothing to spend them on yet):
  // straight to the win screen. Bring this back with the hidden level.
  // Floor 4's two gauntlet bosses sit in normal rows: rare card + coins, then on up the tower.
  const gauntlet = kind === 'boss' && run.pending?.row !== 'boss';
  if (kind === 'boss' && !gauntlet && run.act >= ACTS.length - 1) { actCleared(); return; }
  const healed = afterFightHealing(run);
  const coins = gainCoins(run, (kind === 'boss' ? 90 : kind === 'elite' ? 30 + Math.floor(Math.random() * 10) : 12 + Math.floor(Math.random() * 9)) + (run.charms.includes('loyaltyApp') ? 15 : 0) + (run.charms.includes('fortuneCookie') ? 10 : 0));
  const choices = cardChoices(run, kind);
  const charm = kind === 'elite' ? randomCharm(run, 'drop') : null;
  if (charm) takeCharm(charm);
  const snack = rollSnackDrop(run, kind);
  if (snack) noteSnackSeen(snack);
  let snackState = snack ? (takeSnack(snack) ? 'taken' : 'full') : null;
  const bossCharms = [];
  if (kind === 'boss' && !gauntlet) for (let i = 0; i < 3; i++) { const k = drawCharm(run, 'boss', bossCharms); if (k) bossCharms.push(k); }
  choices.forEach((c) => noteCardSeen(c.id));
  bossCharms.forEach(noteCharmSeen);
  setTimeout(() => sfx('coin'), 250);
  let pickedCard = false, skipped = false, pickedBoss = !bossCharms.length;

  const render = () => {
    app.innerHTML = `${header()}<main class="reward">
      <h1>${esc(ENEMIES[enemyId].name)} defeated!</h1>
      <ul class="loot">
        <li>${uiIcon('coin')} ${coins} ${T.coins}</li>
        ${healed ? `<li>${uiIcon('heart')} healed ${healed}</li>` : ''}
        ${charm ? `<li>${charmIcon(charm)} ${esc(CHARMS[charm].name)} <small>${esc(CHARMS[charm].desc)}</small></li>` : ''}
        ${snackState === 'taken' ? `<li>${snackIcon(snack)} ${esc(SNACKS[snack].name)} <small>${esc(SNACKS[snack].desc)} Added to your snack bar.</small></li>` : ''}
      </ul>
      ${snackState === 'full' ? `<div class="snack-offer">${snackIcon(snack)}<p><b>${esc(SNACKS[snack].name)}</b> ${esc(SNACKS[snack].desc)}<br><small>${snackRoom(run) ? 'You have room for it now.' : 'Your snack bar is full.'}</small></p><button class="btn${snackRoom(run) ? ' yellow' : ''}" data-swap>${snackRoom(run) ? 'Take it' : 'Swap one out'}</button><button class="btn ghost" data-leave-snack>Leave it</button></div>` : ''}
      ${bossCharms.length && !pickedBoss ? `<h2>Choose a boss charm</h2><div class="charm-choices">${bossCharms.map((k) => `<button class="charm-card" data-boss="${k}"><span class="big-icon">${charmIcon(k)}</span><b>${esc(CHARMS[k].name)}</b><small>${esc(CHARMS[k].desc)}</small></button>`).join('')}</div>` : ''}
      ${!pickedCard ? `<h2>Add a card to your deck</h2><div class="choices">${choices.map((c, i) => `<button class="card-btn" data-pick="${i}" aria-label="${esc(cardName(c))}: ${esc(cardText(c))}">${cardHTML(c)}</button>`).join('')}</div>
      <button class="btn ghost" data-skip>Skip card</button>` : ''}
      ${pickedCard && pickedBoss ? '<button class="btn big yellow" data-go>Continue</button>' : ''}
    </main>`;
    bindHeader(app);
    app.querySelectorAll('[data-pick]').forEach((b) => b.addEventListener('click', () => { takeCard({ ...choices[Number(b.dataset.pick)] }); pickedCard = true; render(); }));
    app.querySelector('[data-skip]')?.addEventListener('click', () => { pickedCard = true; skipped = true; render(); });
    app.querySelectorAll('[data-boss]').forEach((b) => b.addEventListener('click', () => { takeCharm(b.dataset.boss); pickedBoss = true; render(); }));
    app.querySelector('[data-swap]')?.addEventListener('click', async () => {
      // a slot may have opened up (eaten or tossed from the bar): then just take it
      if (!snackRoom(run)) { const i = await pickSnackSlot('Toss which snack?'); if (i === null) return; removeSnack(run, i); }
      if (takeSnack(snack)) snackState = 'taken';
      render();
    });
    app.querySelector('[data-leave-snack]')?.addEventListener('click', () => { snackState = null; render(); });
    app.querySelector('[data-go]')?.addEventListener('click', () => {
      barChanged = null;
      if (kind === 'boss' && !gauntlet) { actCleared(); return; }
      run.revisit = skipped && choices.length ? { type: 'cards', choices } : null; // skipped cards can be looked at again from the map
      completeRoom();
    });
    app.querySelector('main button')?.focus();
  };
  barChanged = render; // eating or tossing from the bar updates the snack offer
  render();
}

function actCleared() {
  run.pos = run.pending; run.path.push(run.pending); run.pending = null; run.floorsCleared += 1;
  const newHeroes = unlockAfterBoss(run.act);
  const newOutfits = outfitsForBoss(run.act);
  if (run.act >= ACTS.length - 1) return gameOver(true);
  const heal = Math.round((run.maxHp - run.hp) * 0.75);
  run.hp += heal;
  run.act += 1;
  run.map = generateMap(run.act, run.climb, run);
  run.pos = null; run.path = [];
  const fridge = fillSnacksForFloor(run);
  fridge.forEach(noteSnackTaken);
  run.giftPending = guardiansOn(run.act, run.character).length > 0;
  saveRun(run);
  app.innerHTML = `${header()}<main class="reward">
    <h1>Floor cleared!</h1>
    <p>${esc(hero().name)} takes the stairs up to <b>${esc(ACTS[run.act].name)}</b>. Healed ${heal} ${T.hp} on the way.</p>
    ${fridge.length ? `<p>Pocket Fridge restocked: ${fridge.map((k) => esc(SNACKS[k].name)).join(', ')}.</p>` : ''}
    ${newHeroes.map((n) => `<div class="unlock-note"><span class="hero-art">${heroSVG(Object.keys(CHARACTERS).find((k) => CHARACTERS[k].name === n), { crop: true })}</span><p><b>${esc(n)} unlocked!</b> Pick ${esc(n)} at the start of your next run.</p></div>`).join('')}
    ${newOutfits.map(outfitNote).join('')}
    <button class="btn big yellow" data-go>Keep climbing</button></main>`;
  bindHeader(app);
  app.querySelector('[data-go]').addEventListener('click', () => (run.giftPending ? guardianGift() : mapScreen()));
}

// Run-end story: the card you leaned on most, your biggest hit, the bosses you beat,
// and the whole deck at a glance.
function runStory(won) {
  const top = topCard(run);
  const topC = top && { id: top.id, ...(run.deck.some((c) => c.id === top.id && c.up) ? { up: true } : {}) };
  const pairs = Object.values(run.plays || {}).reduce((a, b) => a + b, 0);
  const beaten = ACTS.map((_, i) => i).filter((f) => f < run.act || (won && f === run.act)).map((f) => ENEMIES[run.bossOf?.[f]]?.name).filter(Boolean);
  const list = (xs) => (xs.length < 2 ? xs.join('') : `${xs.slice(0, -1).join(', ')} and ${xs[xs.length - 1]}`);
  const lines = [
    `${esc(hero().name)} climbed with <b>${run.deck.length} cards</b>${pairs ? ` and matched <b>${pairs} ${pairs === 1 ? 'pair' : 'pairs'}</b>` : ''}.`,
    run.bestHit ? `Biggest hit: <b>${run.bestHit} damage</b>.` : '',
    beaten.length ? `Beat ${list(beaten.map((n) => `<b>${esc(n)}</b>`))}.` : '',
  ].filter(Boolean);
  const groups = new Map();
  [...run.deck].sort((a, b) => (CARDS[a.id].type + cardName(a)).localeCompare(CARDS[b.id].type + cardName(b))).forEach((c) => {
    const k = c.id + (c.up ? '+' : '');
    groups.set(k, { c, n: (groups.get(k)?.n || 0) + 1 });
  });
  const chips = [...groups.values()].map(({ c, n }) => `<span class="deck-chip t-${CARDS[c.id].type}${c.up ? ' up' : ''}" data-tip="${esc(`${cardName(c)}: ${cardText(c)}`)}">${icon(CARDS[c.id].icon)}<span>${esc(cardName(c))}</span>${n > 1 ? `<b>×${n}</b>` : ''}</span>`).join('');
  return `<section class="run-story">
    <h2>Your run</h2>
    <div class="story-body">
      ${topC ? `<figure class="story-top">${cardHTML(topC)}<figcaption>Most played <b>×${top.n}</b></figcaption></figure>` : ''}
      <div class="story-text">
        ${lines.map((l) => `<p>${l}</p>`).join('')}
        <div class="deck-strip">${chips}</div>
        <button class="btn small" data-story-deck>See full deck</button>
      </div>
    </div>
  </section>`;
}

function gameOver(won, abandoned, killedBy) {
  battle = null;
  clearRun();
  const summary = runSummary(run, won, { killedBy, abandoned });
  const cameo = lastGuardian(run); // the last guardian you met cheers or comforts you
  const tipped = run.coins;
  const tips = addTips(tipped, revealSomething);
  const stats = recordRunEnd(summary).totals;
  const newOutfits = outfitsForRunEnd();
  app.innerHTML = `<main class="end ${won ? 'won' : 'lost'}">
    <div class="title-art" data-hero-art="${run.character}">${blobBackdrop()}${heroSVG(run.character)}</div>
    <h1>${won ? 'The Tower is cleared!' : abandoned ? 'Run abandoned' : 'Knocked out!'}</h1>
    <p>${won ? `${esc(hero().name)} beat ${esc(ENEMIES[run.bossOf?.[run.act]]?.name || 'the final boss')}. Legendary.` : `Made it to ${esc(ACTS[run.act].name)}.`}</p>
    <dl class="stats">
      <div><dt>Rooms</dt><dd>${run.floorsCleared}</dd></div>
      ${run.climb ? `<div><dt>Level</dt><dd>${run.climb}</dd></div>` : ''}
      <div><dt>Defeated</dt><dd>${run.kills}</dd></div>
      <div><dt>Deck</dt><dd>${run.deck.length}</dd></div>
      <div><dt>Best ever</dt><dd>${stats.best_floor}/${TOTAL_FLOORS}</dd></div>
    </dl>
    <div class="end-charms">${run.charms.map((k) => charmBadge(k)).join('')}</div>
    ${runStory(won)}
    ${tipped > 0 ? `<div class="tip-jar">${managerChibi()}<p><b>Tip jar +${tipped} ${T.coins}</b><span>${tips.found.length ? `Mina found ${tips.found.map((f) => `<b>${esc(f)}</b>`).join(', ')} for your Kioku Catalog!` : `Every ${TIP_STEP} ${T.coins} in the jar uncovers something new in your Kioku Catalog.`}</span><span class="jar-bar" style="--fill: ${Math.min(100, (tips.jar / TIP_STEP) * 100)}%"><i></i><small>${tips.jar}/${TIP_STEP}</small></span></p></div>` : ''}
    ${cameo ? `<div class="cameo"><span class="cameo-art pettable" role="button" tabindex="0" aria-label="Pet ${esc(GUARDIANS[cameo].name)}" data-pet>${guardianChibi(GUARDIANS[cameo].art)}</span><p><b>${esc(GUARDIANS[cameo].name)}</b>${esc(won ? GUARDIANS[cameo].cheer : GUARDIANS[cameo].comfort)}</p></div>` : ''}
    ${summary.climbUnlocked ? `<div class="unlock-note climb-note">${uiIcon('flag')}<p><b>Level ${summary.climbUnlocked} unlocked for ${esc(hero().name)}!</b><br><small>${esc(CLIMB[summary.climbUnlocked].name)}: ${esc(CLIMB[summary.climbUnlocked].text)} Pick it on the climber screen.</small></p></div>` : ''}
    ${newOutfits.map(outfitNote).join('')}
    <div class="stack narrow"><button class="btn big yellow" data-again>Play again</button><button class="btn ghost" data-title>Title screen</button></div>
  </main>`;
  if (cameo) bindPet(app.querySelector('[data-pet]'), GUARDIANS[cameo]);
  app.querySelector('[data-story-deck]').addEventListener('click', () => showDeck(run.deck, `${hero().name}'s deck`));
  app.querySelector('[data-again]').addEventListener('click', startNewRun);
  app.querySelector('[data-title]').addEventListener('click', title);
}

// Tip jar: uncover one random thing you haven't found yet (card, charm or snack).
function revealSomething() {
  const pool = [
    ...Object.keys(CARDS).filter((id) => !['status', 'curse'].includes(CARDS[id].rarity) && !isFound('cards', id)).map((id) => ['cards', id]),
    ...Object.keys(CHARMS).filter((id) => !isFound('charms', id)).map((id) => ['charms', id]),
    ...Object.keys(SNACKS).filter((id) => !isFound('snacks', id)).map((id) => ['snacks', id]),
  ];
  if (!pool.length) return null;
  const [page, id] = pool[Math.floor(Math.random() * pool.length)];
  if (page === 'cards') { noteCardSeen(id); return CARDS[id].name; }
  if (page === 'charms') { noteCharmSeen(id); return CHARMS[id].name; }
  noteSnackSeen(id); return SNACKS[id].name;
}

// ---------- rooms ----------
function eventScreen() {
  const base = drawEvent(run);
  noteEventMet(base.id);
  let ev = base;
  const api = {
    addCard: (id) => { takeCard({ id }); return CARDS[id].name; },
    randomCard: (rar) => drawCard(run, rar || 'common'),
    styleCard: (arch, rar) => drawStyleCard(run, arch, rar || 'uncommon') || drawCard(run, rar || 'uncommon'),
    upgradeAll: (pred) => { const ups = run.deck.filter((c) => canUpgrade(c) && pred(CARDS[c.id])); ups.forEach((c) => (c.up = true)); return ups.length; },
    pickCopy: async () => { const i = await pickFromDeck('Copy a card', (c) => !['curse', 'status', 'legendary'].includes(CARDS[c.id].rarity)); if (i === null) return 'No card copied.'; const c = run.deck[i]; takeCard({ id: c.id, ...(c.up ? { up: true } : {}) }); return `${cardName(c)} copied!`; },
    // No room: offer Take / Swap one out / Leave it (paid snacks refund when left).
    addSnack: async (id, paid = 0) => { const k = id || drawSnack(run); noteSnackSeen(k); return takeSnack(k) ? SNACKS[k].name : offerSnack(k, paid); },
    pickSnack: async (t) => { const i = await pickSnackSlot(t); if (i === null) return null; return SNACKS[removeSnack(run, i)].name; },
    addCharm: (id) => { if (id) { takeCharm(id); return CHARMS[id].name; } const k = randomCharm(run, 'drop'); if (!k) { run.coins += 50; return `50 ${T.coins} (you have every charm!)`; } takeCharm(k); return CHARMS[k].name; },
    pickUpgrade: async () => { const i = await pickFromDeck('Upgrade a card', canUpgrade); if (i === null) return 'You change your mind.'; run.deck[i].up = true; return `${cardName(run.deck[i])} upgraded!`; },
    pickRemove: async () => { const i = await pickFromDeck('Remove a card'); if (i === null) return 'No card removed.'; const n = cardName(run.deck[i]); run.deck.splice(i, 1); return `${n} removed.`; },
  };
  if (base.setup) ev = { ...base, ...base.setup(run, api) };
  if (ev.card) noteCardSeen(ev.card);
  (ev.cards || []).forEach(noteCardSeen);
  app.innerHTML = `${header()}<main class="room event${ev.special ? ' special' : ''}">
    <div class="room-icon${ev.art ? ' guardian-host' : ''}">${ev.art ? guardianChibi(ev.art) : ev.special && ev.boon ? charmIcon(ev.boon) : roomIcon('event')}</div>
    ${ev.special ? `<span class="special-tag">Special event${ev.style ? ` · ${esc(ARCHES[ev.style].name)}` : ''}</span>` : ''}
    <h1>${esc(ev.title)}</h1><p class="room-text">${esc(ev.text)}</p>
    ${ev.card ? `<div class="event-card">${cardHTML({ id: ev.card })}</div>` : ''}
    ${ev.cards ? `<div class="event-cards">${ev.cards.map((id) => `<div class="event-card">${cardHTML({ id })}</div>`).join('')}</div>` : ''}
    ${ev.timer ? `<div class="countdown" style="--secs: ${ev.timer}s" aria-hidden="true"><i></i></div>` : ''}
    <div class="stack narrow">${ev.options.map((o, i) => `<button class="btn option" data-opt="${i}" data-peek="${esc(`${o.label} ${o.note || ''}`)}" ${o.can && !o.can(run) ? 'disabled' : ''}>${esc(o.label)}${o.note ? `<small>${esc(o.note)}</small>` : ''}</button>`).join('')}</div>
  </main>`;
  bindHeader(app);
  bindPeek(app);
  // The snack offer shown when a snack has no room. Eating or tossing from the bar redraws it.
  let chosen = false, offerRedraw = null;
  const offerSnack = (k, paid) => new Promise((resolve) => {
    const stack = app.querySelector('.stack');
    const done = (text) => { offerRedraw = null; resolve(text); };
    offerRedraw = () => {
      const room = snackRoom(run);
      stack.innerHTML = `<div class="snack-offer">${snackIcon(k)}<p><b>${esc(SNACKS[k].name)}</b> ${esc(SNACKS[k].desc)}<br><small>${room ? 'You have room for it now.' : 'Your snack bar is full.'}</small></p><button class="btn${room ? ' yellow' : ''}" data-swap>${room ? 'Take it' : 'Swap one out'}</button><button class="btn ghost" data-leave-snack>${paid ? `Leave it (get ${paid} ${T.coins} back)` : 'Leave it'}</button></div>`;
      stack.querySelector('[data-swap]').addEventListener('click', async () => {
        if (!snackRoom(run)) { const i = await pickSnackSlot('Toss which snack?'); if (i === null) return; removeSnack(run, i); }
        if (takeSnack(k)) done(SNACKS[k].name); else offerRedraw();
      });
      stack.querySelector('[data-leave-snack]').addEventListener('click', () => {
        if (paid) run.coins += paid;
        done(`${SNACKS[k].name} (you leave it${paid ? ` and get your ${paid} ${T.coins} back` : ''})`);
      });
      stack.querySelector('[data-swap]').focus();
    };
    offerRedraw();
  });
  barChanged = () => {
    const bar = app.querySelector('.bar');
    if (bar) { bar.outerHTML = header(); bindHeader(app); }
    if (offerRedraw) offerRedraw();
    else if (!chosen) app.querySelectorAll('[data-opt]').forEach((x) => { const o = ev.options[Number(x.dataset.opt)]; x.disabled = !!(o.can && !o.can(run)); });
  };
  // A timed event picks its `timeout` option when time runs out.
  if (ev.timer) {
    const left = ev.options.findIndex((o) => o.timeout);
    setTimeout(() => { if (!chosen && app.contains(b0)) app.querySelector(`[data-opt="${left}"]`)?.click(); }, ev.timer * 1000);
  }
  const b0 = app.querySelector('[data-opt]');
  app.querySelectorAll('[data-opt]').forEach((b) => b.addEventListener('click', async () => {
    if (chosen) return;
    chosen = true;
    app.querySelector('.countdown')?.classList.add('stopped');
    app.querySelectorAll('[data-opt]').forEach((x) => (x.disabled = true));
    const result = await ev.options[Number(b.dataset.opt)].go(run, api);
    app.querySelector('.stack').outerHTML = `<p class="result">${esc(result)}</p><button class="btn big yellow" data-go>Continue</button>`;
    app.querySelector('.bar').outerHTML = header();
    bindHeader(app);
    app.querySelector('[data-go]').addEventListener('click', completeRoom);
    app.querySelector('[data-go]').focus();
  }));
}

// Doodle (Jenny's rest choice): any card with a style.
const doodleable = (c) => !!CARDS[c.id].arch && !['status', 'curse', 'gift', 'event', 'legendary'].includes(CARDS[c.id].rarity);

function restScreen() {
  const heal = run.charms.includes('footRub') ? run.maxHp : Math.round(run.maxHp * ((climbOn(run, 2) ? CLIMB_RULES.napHeal : 0.3) + (run.charms.includes('neckPillow') ? 0.15 : 0) + (run.charms.includes('pillowPet') ? 0.15 : 0)));
  const sleepHeal = run.charms.includes('footRub') ? run.maxHp : heal + Math.round(run.maxHp * 0.2); // Toni sleeps in: +20% of max HP over a nap
  app.innerHTML = `${header()}<main class="room rest">
    <div class="room-icon">${roomIcon('rest')}</div>
    <h1>Cozy Booth</h1><p class="room-text">A quiet booth with a blanket and free tea. Take a breather.</p>
    <div class="stack narrow">
      <button class="btn option" data-heal>Nap <small>Heal ${heal} ${T.hp}${run.charms.includes('doggyBed') ? ' and upgrade a random card' : ''}</small></button>
      <button class="btn option" data-up ${run.deck.some(canUpgrade) ? '' : 'disabled'}>Practice <small>Upgrade a card</small></button>
      <button class="btn option" data-snackrun ${snackRoom(run) ? '' : 'disabled'}>Snack run <small>${snackRoom(run) ? 'Fill one empty snack slot' : 'Your snack bar is full'}</small></button>
      ${run.character === 'jenny' ? `<button class="btn option" data-doodle ${run.deck.some(doodleable) ? '' : 'disabled'}>Doodle <small>Redraw a card as a different card of the same style</small></button>` : ''}
      ${run.character === 'toni' ? `<button class="btn option" data-sleepin>Sleep in <small>Heal ${sleepHeal} ${T.hp}, but your next fight's first board has no free reveals</small></button>` : ''}
    </div></main>`;
  bindHeader(app);
  app.querySelector('[data-heal]').addEventListener('click', () => {
    if (run.charms.includes('pillowPet')) { run.maxHp += 2; run.hp += 2; }
    run.hp = Math.min(run.maxHp, run.hp + heal);
    if (run.charms.includes('doggyBed')) { const ups = run.deck.filter(canUpgrade); if (ups.length) ups[Math.floor(Math.random() * ups.length)].up = true; }
    completeRoom();
  });
  app.querySelector('[data-snackrun]').addEventListener('click', () => {
    const k = drawSnack(run); noteSnackSeen(k);
    if (k && takeSnack(k)) toast(`${snackIcon(k)}<span>Snack run: <b>${esc(SNACKS[k].name)}</b></span>`);
    completeRoom();
  });
  app.querySelector('[data-doodle]')?.addEventListener('click', async () => {
    const i = await pickFromDeck('Doodle a card', doodleable);
    if (i === null) return;
    const c = run.deck[i], d = CARDS[c.id];
    const rar = ['common', 'uncommon', 'rare'].includes(d.rarity) ? d.rarity : 'common';
    const id = drawStyleCard(run, d.arch, rar, [c.id]) || drawStyleCard(run, d.arch, 'common', [c.id]);
    if (!id) return;
    const before = cardName(c);
    run.deck[i] = { id, ...(c.up ? { up: true } : {}) }; noteCardTaken(id);
    toast(`<span>Doodle: <b>${esc(before)}</b> became <b>${esc(cardName(run.deck[i]))}</b></span>`);
    completeRoom();
  });
  app.querySelector('[data-sleepin]')?.addEventListener('click', () => {
    run.hp = Math.min(run.maxHp, run.hp + sleepHeal);
    run.nextFight = { ...(run.nextFight || {}), noReveal: true };
    completeRoom();
  });
  app.querySelector('[data-up]').addEventListener('click', async () => {
    const i = await pickFromDeck('Upgrade a card', canUpgrade);
    if (i === null) return;
    run.deck[i].up = true;
    completeRoom();
  });
}

function treasureScreen() {
  const k = randomCharm(run, 'drop');
  if (k) takeCharm(k); else run.coins += 60;
  app.innerHTML = `${header()}<main class="room treasure">
    <div class="room-icon">${roomIcon('treasure')}</div>
    <h1>Prize Locker</h1>
    ${k ? `<div class="charm-card solo"><span class="big-icon">${charmIcon(k)}</span><b>${esc(CHARMS[k].name)}</b><small>${esc(CHARMS[k].desc)}</small></div>` : '<p>60 coins inside!</p>'}
    <button class="btn big yellow" data-go>Continue</button></main>`;
  bindHeader(app);
  app.querySelector('[data-go]').addEventListener('click', completeRoom);
}

// Mina, the night manager, runs the shop. What she says (one picked at random).
const MINA = {
  hello: ['Welcome to the Konbini Corner! No running in the café.', 'Fresh stock, just unboxed.', 'Coins first, browsing second. Hehe, kidding. Mostly.', 'Oh, you again! Good. I like you.', 'Everything here is legally obtained. Probably.'],
  sale: ['Card sale today! Don\'t tell the owner.', 'I marked some cards down. My accounting is a mystery.'],
  poor: ['Window shopping? That\'s free, at least.', 'Short on coins? Go beat something up and come back.'],
  card: ['Good pick!', 'Ooh, that one\'s a classic.', 'Great choice. I almost kept that one.'],
  charm: ['Shiny! It suits you.', 'Careful, that one\'s lucky.'],
  snack: ['Don\'t eat it in the PC booths.', 'Best before... soon. Enjoy!'],
  restock: ['Fine, fine, I\'ll check the back.', 'Let me dig through the boxes...', 'Okay, last box! ...Maybe.'],
  remove: ['I\'ll... recycle that for you.', 'Bye bye, card. You will not be missed.'],
  bye: ['Thanks for shopping! Come again!', 'Pleasure doing business!'],
  tease: ['Leaving empty-handed? I\'ll remember this.', 'Not even a snack? Rude.', 'Fine! More for the regulars.'],
};
const pickLine = (k) => MINA[k][Math.floor(Math.random() * MINA[k].length)];

// A short message at the bottom of the screen that fades away.
function toast(html, ms = 3200) {
  document.querySelector('.toast')?.remove();
  const t = document.createElement('div');
  t.className = 'toast'; t.setAttribute('role', 'status'); t.innerHTML = html;
  document.body.appendChild(t);
  setTimeout(() => t.classList.add('out'), ms - 400);
  setTimeout(() => t.remove(), ms);
}

function shopScreen(saved = null) {
  const stock = saved || shopStock(run);
  stock.rerolls ||= 0;
  let bought = false;
  const cheapest = () => Math.min(...[...stock.cards, ...stock.charms, ...stock.snacks].filter((c) => !c.sold).map((c) => c.price), Infinity);
  let mina = stock.cards.some((c) => c.sale) ? pickLine('sale') : run.coins < cheapest() ? pickLine('poor') : pickLine('hello');
  const say = (k) => { mina = pickLine(k); };
  stock.cards.forEach((c) => noteCardSeen(c.id));
  stock.charms.forEach((c) => noteCharmSeen(c.id));
  stock.snacks.forEach((c) => noteSnackSeen(c.id));
  const priceOf = (item) => (run.charms.includes('giftCard') && !stock.giftUsed ? Math.round(item.price / 2) : item.price);
  const render = () => {
    // One screen, no scrolling: title + Mina on top, the card shelf (shrinks to fit),
    // charms and snacks as compact lists side by side, buttons at the bottom.
    const line = (attr, i, c, icon, name, desc, extra, off) => `<div class="shop-line${c.sold ? ' sold' : ''}"><button class="shop-buy" ${attr}="${i}" ${c.sold || off ? 'disabled' : ''} data-tip="${esc(`${name}: ${desc}`)}" aria-label="Buy ${esc(name)} for ${priceOf(c)}: ${esc(desc)}"><span class="shop-ic">${icon}</span><span class="shop-txt"><b>${esc(name)}${extra}</b><small>${esc(desc)}</small></span><span class="price${run.coins < priceOf(c) ? ' poor' : ''}">${uiIcon('coin')}${priceOf(c)}</span></button></div>`;
    app.innerHTML = `${header()}<main class="room shop">
      <div class="shop-top">
        <h1>${GAME.shop}</h1>
        <div class="shopkeep"><span class="shopkeep-art">${managerChibi()}</span><p><b>Mina</b><span data-mina>${esc(mina)}</span></p></div>
        ${run.charms.includes('giftCard') && !stock.giftUsed ? `<b class="gift-note">${charmIcon('giftCard')} Gift Card: first item half price!</b>` : ''}
      </div>
      <section class="shop-cards">
        <div class="shop-h"><h2>Cards</h2>${stock.cards.some((c) => c.sale && !c.sold) ? '<b class="sale-note">Card sale today!</b>' : ''}</div>
        <div class="choices shelf">${stock.cards.map((c, i) => `<div class="shop-item${c.sold ? ' sold' : ''}${c.sale ? ` on-sale sale-${c.sale}` : ''}">${c.sale && !c.sold ? `<em class="sale-tag">${c.sale}% off</em>` : ''}<button class="card-btn" data-card="${i}" ${c.sold || run.coins < priceOf(c) ? 'disabled' : ''} aria-label="Buy ${esc(cardName(c))} for ${priceOf(c)}${c.sale ? `, ${c.sale}% off` : ''}">${cardHTML(c)}</button><span class="price${run.coins < priceOf(c) ? ' poor' : ''}">${uiIcon('coin')}${c.sale ? `<s>${priceOf({ price: c.was })}</s>` : ''}${priceOf(c)}</span></div>`).join('')}</div>
      </section>
      <section class="shop-list"><h2>Charms</h2>${stock.charms.map((c, i) => line('data-charm', i, c, charmIcon(c.id), CHARMS[c.id].name, CHARMS[c.id].desc, c.shopOnly ? ' <em class="tag">shop only</em>' : '', run.coins < priceOf(c))).join('')}</section>
      <section class="shop-list"><h2>Snacks</h2>${stock.snacks.map((c, i) => line('data-snackbuy', i, c, snackIcon(c.id), SNACKS[c.id].name, SNACKS[c.id].desc, '', run.coins < priceOf(c) || !snackRoom(run))).join('')}${snackRoom(run) ? '' : '<p class="shop-note">Snack bar full: click a snack at the top to eat or toss it.</p>'}</section>
      <div class="shop-row">
        <button class="btn" data-restock ${run.coins < restockCost(stock.rerolls) ? 'disabled' : ''} data-tip="Swap the cards on the shelf for a new set. Costs more each time.">Restock<span class="wide-only"> cards</span> <small>${uiIcon('coin')} ${restockCost(stock.rerolls)}</small></button>
        <button class="btn" data-remove ${stock.removed || run.coins < removeCost(run) ? 'disabled' : ''}>Remove<span class="wide-only"> a card</span> <small>${uiIcon('coin')} ${removeCost(run)}</small></button>
        <button class="btn yellow" data-go>Leave<span class="wide-only"> shop</span></button>
      </div></main>`;
    bindHeader(app);
    app.querySelectorAll('[data-card]').forEach((b) => b.addEventListener('click', () => {
      const c = stock.cards[Number(b.dataset.card)];
      run.coins -= priceOf(c); stock.giftUsed = true; c.sold = true; takeCard({ id: c.id }); sfx('coin'); bought = true; say('card'); render();
    }));
    app.querySelectorAll('[data-charm]').forEach((b) => b.addEventListener('click', () => {
      const c = stock.charms[Number(b.dataset.charm)];
      run.coins -= priceOf(c); stock.giftUsed = true; c.sold = true; takeCharm(c.id); sfx('coin'); bought = true; say('charm'); render();
    }));
    app.querySelectorAll('[data-snackbuy]').forEach((b) => b.addEventListener('click', () => {
      const c = stock.snacks[Number(b.dataset.snackbuy)];
      if (!snackRoom(run)) return;
      run.coins -= priceOf(c); stock.giftUsed = true; c.sold = true; takeSnack(c.id); sfx('coin'); bought = true; say('snack'); render();
    }));
    app.querySelector('[data-remove]').addEventListener('click', async () => {
      const i = await pickFromDeck('Remove a card');
      if (i === null) return;
      const cost = removeCost(run);
      run.deck.splice(i, 1); run.coins -= cost; if (!run.charms.includes('stampCard')) run.removeCost += 25; stock.removed = true; sfx('coin'); bought = true; say('remove'); render();
    });
    app.querySelector('[data-restock]').addEventListener('click', () => {
      const cost = restockCost(stock.rerolls);
      if (run.coins < cost) return;
      run.coins -= cost; stock.rerolls += 1;
      stock.cards = shopCards(run);
      stock.cards.forEach((c) => noteCardSeen(c.id));
      sfx('scramble'); say(stock.cards.some((c) => c.sale) ? 'sale' : 'restock'); render();
    });
    app.querySelector('[data-go]').addEventListener('click', () => {
      run.revisit = { type: 'shop', stock }; // the shop stays open until you pick the next room
      if (saved) mapScreen(); else completeRoom();
      toast(`${managerChibi()}<span><b>Mina:</b> ${esc(pickLine(bought ? 'bye' : 'tease'))}</span>`);
    });
  };
  barChanged = render;
  render();
}

// debugging handle
window.__sm = { get run() { return run; }, get battle() { return battle; }, music };
