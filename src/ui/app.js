import { CARDS, ARCHES, cardName, cardText, canUpgrade } from '../game/cards.js';
import { CHARMS } from '../game/charms.js';
import { ENEMIES, ACTS } from '../game/enemies.js';
import { Battle, STATUS_NAMES, STATUS_HELP } from '../game/battle.js';
import {
  newRun, generateMap, availableRooms, roomAt, enemyFor, cardChoices, randomCharm, gainCharm, gainCoins,
  afterFightHealing, shopStock, saveRun, loadRun, clearRun, loadStats, recordRun, TOTAL_FLOORS, removeCost,
} from '../game/run.js';
import { drawCard, drawCharm, drawEvent, deckStyle } from '../game/loot.js';
import { sfx, settings, saveSettings, music } from '../audio.js';
import { icon, jennySVG, enemySVG, roomIcon } from './art.js';
import { LOOKS, getLook, setLook, blobBackdrop } from './chibi.js';
import { charmIcon, uiIcon } from './charmIcons.js';

const app = document.getElementById('app');
let run = null;
let battle = null;

const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const TYPE_LABEL = { attack: 'Attack', skill: 'Skill', power: 'Power', status: 'Status' };

// ---------- shared pieces ----------
export function cardHTML(c, extra = '') {
  const def = CARDS[c.id];
  return `<div class="card t-${def.type} r-${def.rarity}${c.up ? ' up' : ''} ${extra}">
    <div class="card-art">${icon(def.icon)}</div>
    <div class="card-name">${esc(cardName(c))}</div>
    <div class="card-text">${esc(cardText(c))}</div>
    <div class="card-type">${TYPE_LABEL[def.type]}${def.arch ? ` · <span class="arch a-${def.arch}">${ARCHES[def.arch].name}</span>` : ''}${def.rarity === 'curse' ? ' · Curse' : ''}</div>
  </div>`;
}

function charmBadge(id, cls = '') {
  const c = CHARMS[id];
  return `<button class="charm ${cls}" data-tip="${esc(`${c.name}: ${c.desc}`)}" aria-label="${esc(`${c.name}: ${c.desc}`)}">${charmIcon(id)}</button>`;
}

function header() {
  const roomNo = run.pos ? (run.pos.row === 'boss' ? 10 : run.pos.row + 1) : 0;
  return `<header class="bar">
    <div class="bar-left">
      <span class="pill hp" aria-label="Health">${uiIcon('heart')}<b>${run.hp}</b>/${run.maxHp}</span>
      <span class="pill coins" aria-label="Coins">${uiIcon('coin')}<b>${run.coins}</b></span>
      <span class="pill floor">${esc(ACTS[run.act].name)} <small>room ${roomNo}/10</small></span>
    </div>
    <div class="bar-charms">${run.charms.map((k) => charmBadge(k)).join('')}</div>
    <div class="bar-right">
      <button class="btn small icon-only" data-sound aria-label="Settings" title="Settings">${uiIcon('gear')}</button>
      <button class="btn small" data-deck>Deck <b>${run.deck.length}</b></button>
      <button class="btn small icon-only" data-menu aria-label="Menu" title="Menu">${uiIcon('menu')}</button>
    </div>
  </header>`;
}

function bindHeader(root) {
  root.querySelector('[data-deck]')?.addEventListener('click', () => { const s = deckStyle(run); showDeck(run.deck, 'Your deck', s ? `Play style: <b class="arch a-${s.arch}">${ARCHES[s.arch].name}</b> · ${esc(ARCHES[s.arch].desc)} Rewards will offer more ${ARCHES[s.arch].name} cards.` : 'No play style yet. Pick up Glitch, Guard, Combo or Memory cards and rewards will start offering more of that style.'); });
  root.querySelector('[data-menu]')?.addEventListener('click', menu);
  root.querySelector('[data-sound]')?.addEventListener('click', soundSettings);
}

function soundSettings() {
  const pct = (v) => Math.round(v * 100);
  const m = modal(`<h2>Settings</h2>
    <div class="look-pick"><span class="look-label">Jenny's look</span><div class="looks">${Object.entries(LOOKS).map(([k, l]) => `<button class="look${k === getLook() ? ' on' : ''}" data-look="${k}" aria-pressed="${k === getLook()}">${jennySVG({ look: k, crop: true })}<b>${esc(l.name)}</b></button>`).join('')}</div></div>
    <label class="slider"><span>Music <b data-mv>${pct(settings.music)}%</b></span>
      <input type="range" min="0" max="100" step="5" value="${pct(settings.music)}" data-music aria-label="Music volume"></label>
    <label class="slider"><span>Effects <b data-sv>${pct(settings.sfx)}%</b></span>
      <input type="range" min="0" max="100" step="5" value="${pct(settings.sfx)}" data-sfx aria-label="Sound effects volume"></label>
    <div class="row2">
      <button class="btn ghost" data-mute-music>${settings.musicOn ? 'Mute music' : 'Unmute music'}</button>
      <button class="btn ghost" data-mute-sfx>${settings.sfxOn ? 'Mute effects' : 'Unmute effects'}</button>
    </div>
    <p class="small-note">Music: “Her Shiba Are Her Knights”</p>
    <button class="btn" data-close>Done</button>`);
  const el = m.el;
  el.querySelectorAll('[data-look]').forEach((btn) => btn.addEventListener('click', () => {
    setLook(btn.dataset.look);
    el.querySelectorAll('[data-look]').forEach((x) => { x.classList.toggle('on', x === btn); x.setAttribute('aria-pressed', x === btn); });
    document.querySelectorAll('.title-art, .portrait-jenny').forEach((n) => { n.innerHTML = jennySVG(n.classList.contains('portrait-jenny') ? { crop: true } : {}); });
  }));
  el.querySelector('[data-music]').addEventListener('input', (e) => { settings.music = e.target.value / 100; settings.musicOn = true; el.querySelector('[data-mv]').textContent = `${e.target.value}%`; el.querySelector('[data-mute-music]').textContent = 'Mute music'; saveSettings(); });
  el.querySelector('[data-sfx]').addEventListener('input', (e) => { settings.sfx = e.target.value / 100; settings.sfxOn = true; el.querySelector('[data-sv]').textContent = `${e.target.value}%`; el.querySelector('[data-mute-sfx]').textContent = 'Mute effects'; saveSettings(); });
  el.querySelector('[data-sfx]').addEventListener('change', () => sfx('match', 2));
  el.querySelector('[data-mute-music]').addEventListener('click', (e) => { settings.musicOn = !settings.musicOn; e.target.textContent = settings.musicOn ? 'Mute music' : 'Unmute music'; saveSettings(); });
  el.querySelector('[data-mute-sfx]').addEventListener('click', (e) => { settings.sfxOn = !settings.sfxOn; e.target.textContent = settings.sfxOn ? 'Mute effects' : 'Unmute effects'; saveSettings(); sfx('click'); });
}

// UI click sounds
document.addEventListener('click', (e) => {
  const t = e.target.closest?.('button, .node.avail');
  if (!t || t.disabled) return;
  if (t.matches('.slot, [data-sound], [data-mute-sfx]')) return;
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
document.addEventListener('click', (e) => { const el = e.target.closest?.('[data-tip]'); if (el) { showTip(el); clearTimeout(showTip.t); showTip.t = setTimeout(() => (tip.hidden = true), 2600); } else tip.hidden = true; });
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
  const hint = sorted.some(hasUpgradeView) ? '<p class="deck-note">Click a card to see its upgraded version.</p>' : '';
  const m = modal(`<h2>${esc(title)}</h2>${note ? `<p class="deck-note">${note}</p>` : ''}${hint}<div class="card-grid">${sorted.map((c, i) => hasUpgradeView(c)
    ? `<button class="card-btn flip" data-flip="${i}" aria-label="${esc(cardName(c))}: show other version">${cardHTML(c)}</button>`
    : cardHTML(c)).join('') || '<p>Empty.</p>'}</div><button class="btn" data-close>Close</button>`, { wide: true });
  // Toggle each card between its normal and upgraded version.
  m.el.querySelectorAll('[data-flip]').forEach((b) => {
    const c = sorted[Number(b.dataset.flip)];
    let other = false;
    b.addEventListener('click', () => { other = !other; b.innerHTML = cardHTML({ ...c, up: other ? !c.up : c.up }, other ? 'alt-view' : ''); });
  });
}

// Cards that have an upgraded version worth showing (not statuses or curses).
function hasUpgradeView(c) {
  const r = CARDS[c.id].rarity;
  return r !== 'status' && r !== 'curse';
}

// While choosing a card to upgrade, resting on a card (or focusing it) shows the upgraded version.
function upgradePreview(btn, c) {
  let t;
  const show = () => { btn.innerHTML = cardHTML({ ...c, up: true }, 'alt-view'); };
  const hide = () => { clearTimeout(t); btn.innerHTML = cardHTML(c); };
  btn.addEventListener('pointerenter', (e) => { if (e.pointerType === 'mouse') { clearTimeout(t); t = setTimeout(show, 450); } });
  btn.addEventListener('pointerleave', hide);
  btn.addEventListener('focus', show);
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
    <p><b>Climb the Net Café Tower.</b> Three floors, each ending with a boss. Pick your path on the map.</p>
    <p><b>Every card in your deck shows up twice</b> on the board, face down. Flip two cards: if they match, that card is played.</p>
    <p><b>Flipping a pair costs 1 energy.</b> You get 3 energy a turn. When it runs out, the enemy does what its bubble says.</p>
    <p><b>Unmatched cards stay put</b> between turns, so remember where things are. Clear the whole board for +1 energy and a fresh board.</p>
    <p><b>Free peek:</b> every new board starts with 2 cards revealed.</p>
    <p><b>Reveals carry over:</b> if a reveal effect has nothing left to show (say it's the last pair on the board), it's saved and used on the next board.</p>
    <p><b>Combo:</b> matches in a row add +2 damage to your attacks. A miss resets it.</p>
    <p><b>Watch out:</b> some enemies scramble the board or sneak junk cards into your deck.</p>
    <p><b>Play styles:</b> cards tagged Glitch, Guard, Combo or Memory build a style. Once your deck leans one way, rewards and shops offer more of that style. Check the Deck button to see yours.</p>
    <p><b>Between fights:</b> add new cards, collect charms, shop, rest or try your luck at "?" rooms. A smaller, sharper deck is often stronger.</p>
    <p class="muted">Keys: Space ends your turn · Esc closes windows</p>
  </div><button class="btn" data-close>Got it</button>`);
}

// ---------- title ----------
export function title() {
  battle = null;
  const saved = loadRun();
  const stats = loadStats();
  app.innerHTML = `<main class="title">
    <div class="title-art">${blobBackdrop()}${jennySVG()}</div>
    <h1 class="logo"><span>SPIRE</span><span>MATCH</span></h1>
    <p class="tagline">A memory card battler · climb the Net Café Tower</p>
    <div class="stack narrow">
      ${saved ? `<button class="btn big yellow" data-continue>Continue <small>${esc(ACTS[saved.act].name)} · ${uiIcon('heart')} ${saved.hp}</small></button>` : ''}
      <button class="btn big ${saved ? '' : 'yellow'}" data-new>${saved ? 'New run' : 'Start a run'}</button>
      <div class="row2"><button class="btn ghost" data-help>How to play</button><button class="btn ghost" data-sound>Settings</button></div>
    </div>
    <dl class="stats">
      <div><dt>Runs</dt><dd>${stats.runs}</dd></div>
      <div><dt>Wins</dt><dd>${stats.wins}</dd></div>
      <div><dt>Best</dt><dd>${stats.bestFloor}/${TOTAL_FLOORS}</dd></div>
      <div><dt>Defeated</dt><dd>${stats.kills}</dd></div>
    </dl>
    <p class="footnote">Jenny's World</p>
  </main>`;
  app.querySelector('[data-help]').addEventListener('click', help);
  app.querySelector('[data-sound]').addEventListener('click', soundSettings);
  app.querySelector('[data-continue]')?.addEventListener('click', () => { run = saved; if (run.giftPending) harusGift(); else mapScreen(); });
  app.querySelector('[data-new]').addEventListener('click', () => {
    if (saved && !confirm('Start over? Your current run will be lost.')) return;
    run = newRun();
    saveRun(run);
    harusGift();
  });
}

// ---------- Haru's Gift ----------
function harusGift() {
  battle = null;
  const ids = Object.keys(CHARMS).filter((k) => CHARMS[k].pool === 'haru').sort(() => Math.random() - 0.5).slice(0, 3);
  app.innerHTML = `<main class="room gift">
    <div class="gift-art">${blobBackdrop()}${jennySVG()}</div>
    <h1>Haru's Gift</h1>
    <p class="room-text">Before the climb, Haru hands you a little bag. Pick one thing to take with you.</p>
    <div class="charm-choices">${ids.map((k) => `<button class="charm-card" data-gift="${k}"><span class="big-icon">${charmIcon(k)}</span><b>${esc(CHARMS[k].name)}</b><small>${esc(CHARMS[k].desc)}</small>${CHARMS[k].style ? `<em class="tag style-${CHARMS[k].style}">${ARCHES[CHARMS[k].style].name} style</em>` : ''}</button>`).join('')}</div>
  </main>`;
  app.querySelectorAll('[data-gift]').forEach((b) => b.addEventListener('click', () => {
    gainCharm(run, b.dataset.gift);
    run.giftPending = false;
    saveRun(run);
    if (!localStorage.getItem('sm.helped')) { localStorage.setItem('sm.helped', '1'); help(); }
    mapScreen();
  }));
  app.querySelector('[data-gift]').focus();
}


// ---------- map ----------
function mapScreen() {
  battle = null;
  run.path ||= [];
  saveRun(run);
  const rows = run.map.rows;
  const W = 340, rowH = 74, padY = 60;
  const H = padY * 2 + rowH * rows.length + 40;
  const xOf = (col) => 40 + col * ((W - 80) / 4);
  const yOf = (row) => (row === 'boss' ? padY - 10 : H - padY - row * rowH);
  const avail = availableRooms(run);
  const isAvail = (r, c) => avail.some((a) => a.row === r && (r === 'boss' || a.col === c));
  const visited = (r, c) => run.path.some((p) => p.row === r && p.col === c);
  // rooms you can still reach from where you are; everything else is greyed out
  const reach = new Set();
  const walk = (r, c) => {
    const key = `${r},${c}`;
    if (reach.has(key)) return;
    reach.add(key);
    if (r < rows.length - 1) rows[r].find((n) => n.col === c).next.forEach((nc) => walk(r + 1, nc));
  };
  if (!run.pos) rows[0].forEach((n) => walk(0, n.col));
  else if (run.pos.row !== 'boss') walk(run.pos.row, run.pos.col);
  const live = (r, c) => reach.has(`${r},${c}`);

  let lines = '';
  rows.forEach((row, r) => row.forEach((n) => {
    const targets = r === rows.length - 1 ? [{ x: W / 2, y: yOf('boss') }] : n.next.map((c) => ({ x: xOf(c), y: yOf(r + 1), c }));
    targets.forEach((t) => {
      const on = visited(r, n.col) && (t.c === undefined ? run.pos?.row === 'boss' : visited(r + 1, t.c));
      const open = live(r, n.col) && (t.c === undefined || live(r + 1, t.c));
      lines += `<line x1="${xOf(n.col)}" y1="${yOf(r)}" x2="${t.x}" y2="${t.y}" class="${on ? 'on' : open ? '' : 'skip'}"/>`;
    });
  }));
  let nodes = '';
  rows.forEach((row, r) => row.forEach((n) => {
    const a = isAvail(r, n.col), v = visited(r, n.col), gone = !v && !live(r, n.col);
    nodes += `<g class="node t-${n.type}${a ? ' avail' : ''}${v ? ' done' : ''}${gone ? ' skipped' : ''}" transform="translate(${xOf(n.col)} ${yOf(r)})" ${a ? `tabindex="0" role="button" data-room="${r},${n.col}" aria-label="${n.type} room"` : ''}>
      <circle r="19"/><g transform="translate(-12 -12) scale(.75)">${roomIcon(n.type).replace('<svg viewBox="0 0 32 32" aria-hidden="true">', '').replace('</svg>', '')}</g></g>`;
  }));
  const bossA = isAvail('boss');
  nodes += `<g class="node t-boss${bossA ? ' avail' : ''}" transform="translate(${W / 2} ${yOf('boss')})" ${bossA ? 'tabindex="0" role="button" data-room="boss" aria-label="Boss room"' : ''}>
    <circle r="30"/><g transform="translate(-18 -18) scale(1.125)">${roomIcon('boss').replace('<svg viewBox="0 0 32 32" aria-hidden="true">', '').replace('</svg>', '')}</g></g>`;

  const boss = ENEMIES[ACTS[run.act].boss];
  app.innerHTML = `${header()}<main class="map-screen">
    <div class="map-head"><h2>${esc(ACTS[run.act].name)}</h2><p>Boss: <b>${esc(boss.name)}</b> · pick a glowing room</p><p class="map-note">Every path has a shop and at least two rest booths.</p></div>
    <div class="map-scroll"><svg class="map" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}">${lines}${nodes}</svg></div>
    <ul class="legend">${['fight', 'elite', 'event', 'shop', 'rest', 'treasure'].map((t) => `<li class="t-${t}">${roomIcon(t)}<span>${{ fight: 'Fight', elite: 'Elite', event: 'Unknown', shop: 'Shop', rest: 'Rest', treasure: 'Treasure' }[t]}</span></li>`).join('')}</ul>
  </main>`;
  bindHeader(app);
  const scroller = app.querySelector('.map-scroll');
  const target = app.querySelector('.node.avail');
  if (target) {
    const ty = Number(target.getAttribute('transform').match(/ ([\d.]+)\)/)[1]);
    scroller.scrollTop = Math.max(0, ty - scroller.clientHeight / 2);
  }
  app.querySelectorAll('[data-room]').forEach((g) => {
    const go = () => {
      const v = g.dataset.room;
      if (v === 'boss') enterRoom({ row: 'boss' });
      else { const [r, c] = v.split(',').map(Number); enterRoom({ row: r, col: c }); }
    };
    g.addEventListener('click', go);
    g.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); go(); } });
  });
}

function enterRoom(pos) {
  const room = roomAt(run, pos.row, pos.col);
  run.pending = pos;
  const type = room.type;
  if (type === 'fight' || type === 'elite' || type === 'boss') battleScreen(enemyFor(run, type), type);
  else if (type === 'event') eventScreen();
  else if (type === 'rest') restScreen();
  else if (type === 'shop') shopScreen();
  else if (type === 'treasure') treasureScreen();
}

function completeRoom() {
  run.pos = run.pending;
  run.path.push(run.pending);
  run.pending = null;
  run.floorsCleared += 1;
  mapScreen();
}

// ---------- battle ----------
function battleScreen(enemyId, kind) {
  const def = ENEMIES[enemyId];
  app.innerHTML = `${header()}<main class="battle">
    <section class="arena">
      <div class="fighter you" data-who="player">
        <div class="portrait portrait-jenny">${jennySVG({ crop: true })}</div>
        <div class="f-name">Jenny</div>
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
        <div class="combo" data-combo></div>
        <div class="log" data-log aria-live="polite"></div>
      </div>
      <div class="piles">
        <button class="pile" data-pile="draw" aria-label="Draw pile">${icon('film')}<b data-draw></b></button>
        <button class="pile" data-pile="discard" aria-label="Discard pile">${icon('swirl')}<b data-discard></b></button>
      </div>
      <button class="btn yellow end" data-end>End turn</button>
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
    boardEl.style.setProperty('--cols', b.board.length > 16 ? 5 : 4);
    boardEl.innerHTML = b.board.map((s, i) => `<button class="slot" data-i="${i}">
        <span class="face back">${icon('star')}</span>
        <span class="face front">${cardHTML(s.card)}</span>
      </button>`).join('');
    boardEl.querySelectorAll('.slot').forEach((el) => el.addEventListener('click', () => battle.flip(Number(el.dataset.i))));
    boardEl.classList.remove('deal'); void boardEl.offsetWidth; boardEl.classList.add('deal');
    updateSlots();
  };
  const updateSlots = () => {
    battle.board.forEach((s, i) => {
      const el = boardEl.children[i];
      if (!el) return;
      // the card in a slot can change after a scramble
      const key = s.card.id + (s.card.up ? '+' : '');
      if (el.dataset.key !== key) { el.dataset.key = key; el.querySelector('.front').innerHTML = cardHTML(s.card); }
      el.className = `slot s-${s.state}`;
      el.disabled = s.state === 'gone';
      el.setAttribute('aria-label', s.state === 'down' ? `Hidden card ${i + 1}` : `${cardName(s.card)}: ${cardText(s.card)}`);
    });
  };

  const statusHTML = (o) => ['strength', 'weak', 'vuln', 'poison', 'thorns']
    .filter((k) => o[k] > 0)
    .map((k) => `<button class="status s-${k}" data-tip="${esc(STATUS_HELP[k])}">${esc(STATUS_NAMES[k])} <b>${o[k]}</b></button>`).join('');

  const intentHTML = () => {
    const it = battle.intent; if (!it || battle.enemy.hp <= 0) return '';
    const dmg = battle.intentDamage();
    const parts = [];
    if (it.t === 'atk' || it.t === 'atkBlock' || it.t === 'atkStatus') parts.push(`<span class="i-atk">${icon('blade')}${dmg}${it.times ? `×${it.times}` : ''}</span>`);
    if (it.t === 'block' || it.t === 'atkBlock') parts.push(`<span class="i-def">${icon('shield')}${it.b || it.n}</span>`);
    if (it.t === 'buff') parts.push(`<span class="i-buff">${icon('fire')}Power up</span>`);
    if (it.t === 'heal') parts.push(`<span class="i-buff">${icon('rice')}Heal</span>`);
    if (it.t === 'debuff') parts.push(`<span class="i-debuff">${icon('swirl')}Hex</span>`);
    if (it.t === 'status' || it.t === 'atkStatus') parts.push(`<span class="i-debuff">${icon(CARDS[it.card].icon)}+${it.count} ${esc(CARDS[it.card].name)}</span>`);
    if (it.t === 'scramble') parts.push(`<span class="i-debuff">${icon('bounce')}Scramble</span>`);
    const tipText = {
      atk: 'Will attack.', atkBlock: 'Will attack and gain Block.', block: 'Will gain Block.', buff: 'Will gain Strength.', heal: 'Will heal.',
      debuff: 'Will make you Sleepy or Exposed.', status: 'Will add junk cards to your deck.', atkStatus: 'Will attack and add junk cards to your deck.',
      scramble: 'Will shuffle every face-down card on the board!',
    }[it.t];
    return `<div class="bubble" data-tip="${esc(tipText)}">${parts.join('')}</div>`;
  };

  const update = () => {
    const b = battle, e = b.enemy;
    $('[data-hpbar]').style.width = `${(run.hp / run.maxHp) * 100}%`;
    $('[data-hptext]').textContent = `${run.hp}/${run.maxHp}`;
    $('[data-ehpbar]').style.width = `${(e.hp / e.maxHp) * 100}%`;
    $('[data-ehptext]').textContent = `${e.hp}/${e.maxHp}`;
    const blk = $('[data-blk]'); blk.hidden = !b.player.block; blk.textContent = b.player.block;
    const eblk = $('[data-eblk]'); eblk.hidden = !e.block; eblk.textContent = e.block;
    $('[data-pstat]').innerHTML = statusHTML(b.player) + (b.powers.energy ? `<span class="status s-power" data-tip="Energy Drink: +${b.powers.energy} energy each turn.">+${b.powers.energy} energy</span>` : '') + (b.powers.fortress ? '<span class="status s-power" data-tip="Blanket Fort: Block stays between turns.">Fort</span>' : '') + (b.powers.freeMiss ? '<span class="status s-power" data-tip="Photo Memory: first miss each turn is free.">Memory</span>' : '') + (b.powers.malware ? `<span class="status s-power" data-tip="Malware: apply ${b.powers.malware} Glitch each turn.">Malware ${b.powers.malware}</span>` : '') + (b.powers.armor ? `<span class="status s-power" data-tip="Iron Hoodie: gain ${b.powers.armor} Block each turn.">Armor ${b.powers.armor}</span>` : '') + (b.powers.groove ? '<span class="status s-power" data-tip="Groove: a miss only halves your combo.">Groove</span>' : '') + (b.powers.spotlight ? `<span class="status s-power" data-tip="Spotlight: matching a revealed card deals ${b.powers.spotlight}.">Spotlight</span>` : '');
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
    const label = out ? '<span class="en-empty">Out of energy · enemy turn</span>'
      : pending ? `<span><b>${b.energy}</b> energy left · pick a second card</span>`
      : `<span><b>${b.energy}</b> energy left · each pair costs 1</span>`;
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
      if (dmg > 0) sfx(who === 'enemy' ? 'hit' : 'hurt'); else if (blocked > 0) sfx('block');
      if (dmg > 0) { float(who, `-${dmg}`, why || 'dmg'); shake(who); }
      if (blocked > 0) float(who, `${blocked} blocked`, 'block');
    },
    flash: (ms) => { boardEl.classList.add('peek'); setTimeout(() => boardEl.classList.remove('peek'), ms); },
    scramble: () => { sfx('scramble'); boardEl.classList.remove('scramble'); void boardEl.offsetWidth; boardEl.classList.add('scramble'); },
    turn: () => { if (battle && battle.turn > 1) { sfx('turn'); const l = $('[data-log]'); if (l && !l.textContent) l.textContent = 'Your turn.'; } },
    end: (result) => { sfx(result === 'win' ? 'win' : 'lose'); setTimeout(() => (result === 'win' ? battleWon(kind, enemyId) : gameOver(false)), 900); },
  });
  $('[data-end]').addEventListener('click', () => battle.endTurn());
  app.querySelectorAll('[data-pile]').forEach((p) => p.addEventListener('click', () => {
    const which = p.dataset.pile;
    showDeck(battle[which].map((c) => ({ id: c.id, up: c.up })), which === 'draw' ? 'Draw pile (random order)' : 'Discard pile');
  }));
  battle.start();
  update();
}

document.addEventListener('keydown', (e) => {
  if (e.code === 'Space' && battle && !battle.over && !document.querySelector('.modal-wrap') && !e.target.closest('button')) {
    e.preventDefault();
    battle.endTurn();
  }
});

function battleWon(kind, enemyId) {
  battle = null;
  run.kills += 1;
  const healed = afterFightHealing(run);
  const coins = gainCoins(run, kind === 'boss' ? 90 : kind === 'elite' ? 30 + Math.floor(Math.random() * 10) : 12 + Math.floor(Math.random() * 9));
  const choices = cardChoices(run, kind);
  const charm = kind === 'elite' ? randomCharm(run, 'drop') : null;
  if (charm) gainCharm(run, charm);
  const bossCharms = [];
  if (kind === 'boss') for (let i = 0; i < 3; i++) { const k = drawCharm(run, 'boss', bossCharms); if (k) bossCharms.push(k); }
  setTimeout(() => sfx('coin'), 250);
  let pickedCard = false, pickedBoss = !bossCharms.length;

  const render = () => {
    app.innerHTML = `${header()}<main class="reward">
      <h1>${esc(ENEMIES[enemyId].name)} defeated!</h1>
      <ul class="loot">
        <li>${uiIcon('coin')} ${coins} coins</li>
        ${healed ? `<li>${uiIcon('heart')} healed ${healed}</li>` : ''}
        ${charm ? `<li>${charmIcon(charm)} ${esc(CHARMS[charm].name)} <small>${esc(CHARMS[charm].desc)}</small></li>` : ''}
      </ul>
      ${bossCharms.length && !pickedBoss ? `<h2>Choose a boss charm</h2><div class="charm-choices">${bossCharms.map((k) => `<button class="charm-card" data-boss="${k}"><span class="big-icon">${charmIcon(k)}</span><b>${esc(CHARMS[k].name)}</b><small>${esc(CHARMS[k].desc)}</small></button>`).join('')}</div>` : ''}
      ${!pickedCard ? `<h2>Add a card to your deck</h2><div class="choices">${choices.map((c, i) => `<button class="card-btn" data-pick="${i}" aria-label="${esc(cardName(c))}: ${esc(cardText(c))}">${cardHTML(c)}</button>`).join('')}</div>
      <button class="btn ghost" data-skip>Skip card</button>` : ''}
      ${pickedCard && pickedBoss ? '<button class="btn big yellow" data-go>Continue</button>' : ''}
    </main>`;
    bindHeader(app);
    app.querySelectorAll('[data-pick]').forEach((b) => b.addEventListener('click', () => { run.deck.push({ ...choices[Number(b.dataset.pick)] }); pickedCard = true; render(); }));
    app.querySelector('[data-skip]')?.addEventListener('click', () => { pickedCard = true; render(); });
    app.querySelectorAll('[data-boss]').forEach((b) => b.addEventListener('click', () => { gainCharm(run, b.dataset.boss); pickedBoss = true; render(); }));
    app.querySelector('[data-go]')?.addEventListener('click', () => (kind === 'boss' ? actCleared() : completeRoom()));
    app.querySelector('main button')?.focus();
  };
  render();
}

function actCleared() {
  run.pos = run.pending; run.path.push(run.pending); run.pending = null; run.floorsCleared += 1;
  if (run.act >= ACTS.length - 1) return gameOver(true);
  const heal = Math.round((run.maxHp - run.hp) * 0.75);
  run.hp += heal;
  run.act += 1;
  run.map = generateMap(run.act);
  run.pos = null; run.path = [];
  saveRun(run);
  app.innerHTML = `${header()}<main class="reward">
    <h1>Floor cleared!</h1>
    <p>Jenny takes the stairs up to <b>${esc(ACTS[run.act].name)}</b>. Healed ${heal} HP on the way.</p>
    <button class="btn big yellow" data-go>Keep climbing</button></main>`;
  bindHeader(app);
  app.querySelector('[data-go]').addEventListener('click', mapScreen);
}

function gameOver(won, abandoned) {
  battle = null;
  clearRun();
  const stats = recordRun(run, won);
  app.innerHTML = `<main class="end ${won ? 'won' : 'lost'}">
    <div class="title-art">${blobBackdrop()}${jennySVG()}</div>
    <h1>${won ? 'The Tower is cleared!' : abandoned ? 'Run abandoned' : 'Knocked out!'}</h1>
    <p>${won ? 'Jenny beat The Blue Screen. Legendary.' : `Made it to ${esc(ACTS[run.act].name)}.`}</p>
    <dl class="stats">
      <div><dt>Rooms</dt><dd>${run.floorsCleared}</dd></div>
      <div><dt>Defeated</dt><dd>${run.kills}</dd></div>
      <div><dt>Deck</dt><dd>${run.deck.length}</dd></div>
      <div><dt>Best ever</dt><dd>${stats.bestFloor}/${TOTAL_FLOORS}</dd></div>
    </dl>
    <div class="end-charms">${run.charms.map((k) => charmBadge(k)).join('')}</div>
    <div class="stack narrow"><button class="btn big yellow" data-again>Play again</button><button class="btn ghost" data-title>Title screen</button></div>
  </main>`;
  app.querySelector('[data-again]').addEventListener('click', () => { run = newRun(); saveRun(run); harusGift(); });
  app.querySelector('[data-title]').addEventListener('click', title);
}

// ---------- rooms ----------
function eventScreen() {
  const ev = drawEvent(run);
  const api = {
    addCard: (id) => { run.deck.push({ id }); return CARDS[id].name; },
    randomCard: (rar) => drawCard(run, rar || 'common'),
    addCharm: () => { const k = randomCharm(run, 'drop'); if (!k) { run.coins += 50; return '50 coins (you have every charm!)'; } gainCharm(run, k); return CHARMS[k].name; },
    pickUpgrade: async () => { const i = await pickFromDeck('Upgrade a card', canUpgrade); if (i === null) return 'You change your mind.'; run.deck[i].up = true; return `${cardName(run.deck[i])} upgraded!`; },
    pickRemove: async () => { const i = await pickFromDeck('Remove a card'); if (i === null) return 'No card removed.'; const n = cardName(run.deck[i]); run.deck.splice(i, 1); return `${n} removed.`; },
  };
  app.innerHTML = `${header()}<main class="room event">
    <div class="room-icon">${roomIcon('event')}</div>
    <h1>${esc(ev.title)}</h1><p class="room-text">${esc(ev.text)}</p>
    <div class="stack narrow">${ev.options.map((o, i) => `<button class="btn option" data-opt="${i}" ${o.can && !o.can(run) ? 'disabled' : ''}>${esc(o.label)}${o.note ? `<small>${esc(o.note)}</small>` : ''}</button>`).join('')}</div>
  </main>`;
  bindHeader(app);
  app.querySelectorAll('[data-opt]').forEach((b) => b.addEventListener('click', async () => {
    app.querySelectorAll('[data-opt]').forEach((x) => (x.disabled = true));
    const result = await ev.options[Number(b.dataset.opt)].go(run, api);
    app.querySelector('.stack').outerHTML = `<p class="result">${esc(result)}</p><button class="btn big yellow" data-go>Continue</button>`;
    app.querySelector('.bar').outerHTML = header();
    bindHeader(app);
    app.querySelector('[data-go]').addEventListener('click', completeRoom);
    app.querySelector('[data-go]').focus();
  }));
}

function restScreen() {
  const heal = Math.round(run.maxHp * (0.3 + (run.charms.includes('neckPillow') ? 0.15 : 0) + (run.charms.includes('pillowPet') ? 0.15 : 0)));
  app.innerHTML = `${header()}<main class="room rest">
    <div class="room-icon">${roomIcon('rest')}</div>
    <h1>Cozy Booth</h1><p class="room-text">A quiet booth with a blanket and free tea. Take a breather.</p>
    <div class="stack narrow">
      <button class="btn option" data-heal>Nap <small>Heal ${heal} HP</small></button>
      <button class="btn option" data-up ${run.deck.some(canUpgrade) ? '' : 'disabled'}>Practice <small>Upgrade a card</small></button>
    </div></main>`;
  bindHeader(app);
  app.querySelector('[data-heal]').addEventListener('click', () => { if (run.charms.includes('pillowPet')) { run.maxHp += 2; run.hp += 2; } run.hp = Math.min(run.maxHp, run.hp + heal); completeRoom(); });
  app.querySelector('[data-up]').addEventListener('click', async () => {
    const i = await pickFromDeck('Upgrade a card', canUpgrade);
    if (i === null) return;
    run.deck[i].up = true;
    completeRoom();
  });
}

function treasureScreen() {
  const k = randomCharm(run, 'drop');
  if (k) gainCharm(run, k); else run.coins += 60;
  app.innerHTML = `${header()}<main class="room treasure">
    <div class="room-icon">${roomIcon('treasure')}</div>
    <h1>Prize Locker</h1>
    ${k ? `<div class="charm-card solo"><span class="big-icon">${charmIcon(k)}</span><b>${esc(CHARMS[k].name)}</b><small>${esc(CHARMS[k].desc)}</small></div>` : '<p>60 coins inside!</p>'}
    <button class="btn big yellow" data-go>Continue</button></main>`;
  bindHeader(app);
  app.querySelector('[data-go]').addEventListener('click', completeRoom);
}

function shopScreen() {
  const stock = shopStock(run);
  const priceOf = (item) => (run.charms.includes('giftCard') && !stock.giftUsed ? Math.round(item.price / 2) : item.price);
  const render = () => {
    app.innerHTML = `${header()}<main class="room shop">
      <h1>Konbini Corner</h1><p class="room-text">Snacks, cards and shiny charms.${run.charms.includes('giftCard') && !stock.giftUsed ? ` <b class="gift-note">${charmIcon('giftCard')} Gift Card: your first item is half price!</b>` : ''}</p>
      <h2>Cards</h2>
      <div class="choices">${stock.cards.map((c, i) => `<div class="shop-item${c.sold ? ' sold' : ''}"><button class="card-btn" data-card="${i}" ${c.sold || run.coins < priceOf(c) ? 'disabled' : ''} aria-label="Buy ${esc(cardName(c))} for ${c.price}">${cardHTML(c)}</button><span class="price${run.coins < priceOf(c) ? ' poor' : ''}">${uiIcon('coin')}${priceOf(c)}</span></div>`).join('')}</div>
      <h2>Charms</h2>
      <div class="charm-choices">${stock.charms.map((c, i) => `<div class="shop-item${c.sold ? ' sold' : ''}"><button class="charm-card" data-charm="${i}" ${c.sold || run.coins < priceOf(c) ? 'disabled' : ''}><span class="big-icon">${charmIcon(c.id)}</span><b>${esc(CHARMS[c.id].name)}</b><small>${esc(CHARMS[c.id].desc)}</small>${c.shopOnly ? '<em class="tag">shop only</em>' : ''}</button><span class="price${run.coins < priceOf(c) ? ' poor' : ''}">${uiIcon('coin')}${priceOf(c)}</span></div>`).join('')}</div>
      <div class="shop-row">
        <button class="btn" data-remove ${stock.removed || run.coins < removeCost(run) ? 'disabled' : ''}>Remove a card <small>${uiIcon('coin')} ${removeCost(run)}</small></button>
        <button class="btn yellow" data-go>Leave shop</button>
      </div></main>`;
    bindHeader(app);
    app.querySelectorAll('[data-card]').forEach((b) => b.addEventListener('click', () => {
      const c = stock.cards[Number(b.dataset.card)];
      run.coins -= priceOf(c); stock.giftUsed = true; c.sold = true; run.deck.push({ id: c.id }); sfx('coin'); render();
    }));
    app.querySelectorAll('[data-charm]').forEach((b) => b.addEventListener('click', () => {
      const c = stock.charms[Number(b.dataset.charm)];
      run.coins -= priceOf(c); stock.giftUsed = true; c.sold = true; gainCharm(run, c.id); sfx('coin'); render();
    }));
    app.querySelector('[data-remove]').addEventListener('click', async () => {
      const i = await pickFromDeck('Remove a card');
      if (i === null) return;
      const cost = removeCost(run);
      run.deck.splice(i, 1); run.coins -= cost; if (!run.charms.includes('stampCard')) run.removeCost += 25; stock.removed = true; sfx('coin'); render();
    });
    app.querySelector('[data-go]').addEventListener('click', completeRoom);
  };
  render();
}

// debugging handle
window.__sm = { get run() { return run; }, get battle() { return battle; }, music };
