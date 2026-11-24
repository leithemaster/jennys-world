import { CARDS, cardName, cardText, canUpgrade } from '../game/cards.js';
import { CHARMS, charmPool } from '../game/charms.js';
import { ENEMIES, ACTS } from '../game/enemies.js';
import { EVENTS } from '../game/events.js';
import { Battle, STATUS_NAMES, STATUS_HELP } from '../game/battle.js';
import {
  newRun, generateMap, availableRooms, roomAt, enemyFor, cardChoices, randomCharm, gainCharm, gainCoins,
  afterFightHealing, shopStock, saveRun, loadRun, clearRun, loadStats, recordRun, TOTAL_FLOORS,
} from '../game/run.js';
import { icon, jennySVG, enemySVG, roomIcon } from './art.js';

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
    <div class="card-type">${TYPE_LABEL[def.type]}${def.rarity === 'curse' ? ' · Curse' : ''}</div>
  </div>`;
}

function charmBadge(id, cls = '') {
  const c = CHARMS[id];
  return `<button class="charm ${cls}" data-tip="${esc(`${c.name}: ${c.desc}`)}" aria-label="${esc(`${c.name}: ${c.desc}`)}"><span>${c.icon}</span></button>`;
}

function header() {
  const roomNo = run.pos ? (run.pos.row === 'boss' ? 10 : run.pos.row + 1) : 0;
  return `<header class="bar">
    <div class="bar-left">
      <span class="pill hp" aria-label="Health">♥ <b>${run.hp}</b>/${run.maxHp}</span>
      <span class="pill coins" aria-label="Coins">● <b>${run.coins}</b></span>
      <span class="pill floor">${esc(ACTS[run.act].name)} <small>room ${roomNo}/10</small></span>
    </div>
    <div class="bar-charms">${run.charms.map((k) => charmBadge(k)).join('')}</div>
    <div class="bar-right">
      <button class="btn small" data-deck>Deck <b>${run.deck.length}</b></button>
      <button class="btn small ghost" data-menu aria-label="Menu">☰</button>
    </div>
  </header>`;
}

function bindHeader(root) {
  root.querySelector('[data-deck]')?.addEventListener('click', () => showDeck(run.deck, 'Your deck'));
  root.querySelector('[data-menu]')?.addEventListener('click', menu);
}

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

function showDeck(cards, title) {
  const sorted = [...cards].sort((a, b) => (CARDS[a.id].type + a.id).localeCompare(CARDS[b.id].type + b.id));
  modal(`<h2>${esc(title)}</h2><div class="card-grid">${sorted.map((c) => cardHTML(c)).join('') || '<p>Empty.</p>'}</div><button class="btn" data-close>Close</button>`, { wide: true });
}

// Pick a card from the deck; resolves to deck index or null.
function pickFromDeck(title, filter = () => true, confirmLabel) {
  return new Promise((resolve) => {
    const items = run.deck.map((c, i) => ({ c, i })).filter(({ c }) => filter(c));
    if (!items.length) { resolve(null); return; }
    let done = false;
    const m = modal(`<h2>${esc(title)}</h2><div class="card-grid">${items.map(({ c, i }) => `<button class="card-btn" data-i="${i}" aria-label="${esc(cardName(c))}">${cardHTML(c)}</button>`).join('')}</div><button class="btn ghost" data-close>Cancel</button>`, {
      wide: true, onClose: () => { if (!done) resolve(null); },
    });
    m.el.querySelectorAll('[data-i]').forEach((b) => b.addEventListener('click', () => { done = true; m.close(); resolve(Number(b.dataset.i)); }));
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
    <p><b>Combo:</b> matches in a row add +2 damage to your attacks. A miss resets it.</p>
    <p><b>Watch out:</b> some enemies scramble the board or sneak junk cards into your deck.</p>
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
    <div class="title-art">${jennySVG()}</div>
    <h1 class="logo"><span>SPIRE</span><span>MATCH</span></h1>
    <p class="tagline">A memory card battler · climb the Net Café Tower</p>
    <div class="stack narrow">
      ${saved ? `<button class="btn big yellow" data-continue>Continue <small>${esc(ACTS[saved.act].name)} · ♥ ${saved.hp}</small></button>` : ''}
      <button class="btn big ${saved ? '' : 'yellow'}" data-new>${saved ? 'New run' : 'Start a run'}</button>
      <button class="btn ghost" data-help>How to play</button>
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
  app.querySelector('[data-continue]')?.addEventListener('click', () => { run = saved; mapScreen(); });
  app.querySelector('[data-new]').addEventListener('click', () => {
    if (saved && !confirm('Start over? Your current run will be lost.')) return;
    run = newRun();
    run.path = [];
    saveRun(run);
    if (!localStorage.getItem('sm.helped')) { localStorage.setItem('sm.helped', '1'); help(); }
    mapScreen();
  });
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

  let lines = '';
  rows.forEach((row, r) => row.forEach((n) => {
    const targets = r === rows.length - 1 ? [{ x: W / 2, y: yOf('boss') }] : n.next.map((c) => ({ x: xOf(c), y: yOf(r + 1), c }));
    targets.forEach((t) => {
      const on = visited(r, n.col) && (t.c === undefined ? run.pos?.row === 'boss' : visited(r + 1, t.c));
      lines += `<line x1="${xOf(n.col)}" y1="${yOf(r)}" x2="${t.x}" y2="${t.y}" class="${on ? 'on' : ''}"/>`;
    });
  }));
  let nodes = '';
  rows.forEach((row, r) => row.forEach((n) => {
    const a = isAvail(r, n.col), v = visited(r, n.col);
    nodes += `<g class="node t-${n.type}${a ? ' avail' : ''}${v ? ' done' : ''}" transform="translate(${xOf(n.col)} ${yOf(r)})" ${a ? `tabindex="0" role="button" data-room="${r},${n.col}" aria-label="${n.type} room"` : ''}>
      <circle r="19"/><g transform="translate(-12 -12) scale(.75)">${roomIcon(n.type).replace('<svg viewBox="0 0 32 32" aria-hidden="true">', '').replace('</svg>', '')}</g></g>`;
  }));
  const bossA = isAvail('boss');
  nodes += `<g class="node t-boss${bossA ? ' avail' : ''}" transform="translate(${W / 2} ${yOf('boss')})" ${bossA ? 'tabindex="0" role="button" data-room="boss" aria-label="Boss room"' : ''}>
    <circle r="30"/><g transform="translate(-18 -18) scale(1.125)">${roomIcon('boss').replace('<svg viewBox="0 0 32 32" aria-hidden="true">', '').replace('</svg>', '')}</g></g>`;

  const boss = ENEMIES[run.map.boss];
  app.innerHTML = `${header()}<main class="map-screen">
    <div class="map-head"><h2>${esc(ACTS[run.act].name)}</h2><p>Boss: <b>${esc(boss.name)}</b> · pick a glowing room</p></div>
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
        <div class="portrait">${jennySVG()}</div>
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
    <section class="board" data-board aria-label="Card board"></section>
    <footer class="controls">
      <div class="energy" data-energy aria-live="polite"></div>
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
    $('[data-pstat]').innerHTML = statusHTML(b.player) + (b.powers.energy ? `<span class="status s-power" data-tip="Energy Drink: +${b.powers.energy} energy each turn.">+${b.powers.energy}⚡</span>` : '') + (b.powers.fortress ? '<span class="status s-power" data-tip="Blanket Fort: Block stays between turns.">Fort</span>' : '') + (b.powers.freeMiss ? '<span class="status s-power" data-tip="Photo Memory: first miss each turn is free.">Memory</span>' : '');
    $('[data-estat]').innerHTML = statusHTML(e);
    $('[data-intent]').innerHTML = intentHTML();
    $('[data-energy]').innerHTML = `<b>${b.energy}</b><span>energy</span>`;
    $('[data-energy]').classList.toggle('empty', b.energy === 0);
    $('[data-combo]').innerHTML = b.combo > 1 ? `Combo ×${b.combo} <small>+${(b.combo - 1) * 2} dmg</small>` : b.combo === 1 ? 'Combo ×1' : '';
    $('[data-draw]').textContent = b.draw.length;
    $('[data-discard]').textContent = b.discard.length;
    $('[data-end]').disabled = b.busy || b.over;
    app.querySelector('.hp b').textContent = run.hp;
    updateSlots();
  };

  battle = new Battle(run, enemyId, {
    log: (m) => { const l = $('[data-log]'); if (l) l.textContent = m; },
    board: () => renderBoard(),
    update: () => update(),
    float: (who, text, k) => float(who, text, k),
    hit: (who, dmg, blocked, why) => {
      if (dmg > 0) { float(who, `-${dmg}`, why || 'dmg'); shake(who); }
      if (blocked > 0) float(who, `⛨${blocked}`, 'block');
    },
    flash: (ms) => { boardEl.classList.add('peek'); setTimeout(() => boardEl.classList.remove('peek'), ms); },
    scramble: () => { boardEl.classList.remove('scramble'); void boardEl.offsetWidth; boardEl.classList.add('scramble'); },
    turn: () => { if (battle && battle.turn > 1) { const l = $('[data-log]'); if (l && !l.textContent) l.textContent = 'Your turn.'; } },
    end: (result) => setTimeout(() => (result === 'win' ? battleWon(kind, enemyId) : gameOver(false)), 700),
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
  const choices = cardChoices(kind);
  const charm = kind === 'elite' ? randomCharm(run) : null;
  if (charm) gainCharm(run, charm);
  const bossCharms = kind === 'boss' ? charmPool('boss').filter((k) => !run.charms.includes(k)).sort(() => Math.random() - 0.5).slice(0, 3) : [];
  let pickedCard = false, pickedBoss = !bossCharms.length;

  const render = () => {
    app.innerHTML = `${header()}<main class="reward">
      <h1>${esc(ENEMIES[enemyId].name)} defeated!</h1>
      <ul class="loot">
        <li>● ${coins} coins</li>
        ${healed ? `<li>♥ healed ${healed}</li>` : ''}
        ${charm ? `<li>${CHARMS[charm].icon} ${esc(CHARMS[charm].name)} <small>${esc(CHARMS[charm].desc)}</small></li>` : ''}
      </ul>
      ${bossCharms.length && !pickedBoss ? `<h2>Choose a boss charm</h2><div class="charm-choices">${bossCharms.map((k) => `<button class="charm-card" data-boss="${k}"><span class="big-icon">${CHARMS[k].icon}</span><b>${esc(CHARMS[k].name)}</b><small>${esc(CHARMS[k].desc)}</small></button>`).join('')}</div>` : ''}
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
    <div class="title-art">${jennySVG()}</div>
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
  app.querySelector('[data-again]').addEventListener('click', () => { run = newRun(); run.path = []; saveRun(run); mapScreen(); });
  app.querySelector('[data-title]').addEventListener('click', title);
}

// ---------- rooms ----------
function eventScreen() {
  const ev = EVENTS[Math.floor(Math.random() * EVENTS.length)];
  const api = {
    addCard: (id) => { run.deck.push({ id }); return CARDS[id].name; },
    randomCard: (rar) => { const ids = Object.keys(CARDS).filter((k) => CARDS[k].rarity === (rar || 'common')); return ids[Math.floor(Math.random() * ids.length)]; },
    addCharm: () => { const k = randomCharm(run); if (!k) { run.coins += 50; return '50 coins (you have every charm!)'; } gainCharm(run, k); return `${CHARMS[k].icon} ${CHARMS[k].name}`; },
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
  const heal = Math.round(run.maxHp * 0.3);
  app.innerHTML = `${header()}<main class="room rest">
    <div class="room-icon">${roomIcon('rest')}</div>
    <h1>Cozy Booth</h1><p class="room-text">A quiet booth with a blanket and free tea. Take a breather.</p>
    <div class="stack narrow">
      <button class="btn option" data-heal>Nap <small>Heal ${heal} HP</small></button>
      <button class="btn option" data-up ${run.deck.some(canUpgrade) ? '' : 'disabled'}>Practice <small>Upgrade a card</small></button>
    </div></main>`;
  bindHeader(app);
  app.querySelector('[data-heal]').addEventListener('click', () => { run.hp = Math.min(run.maxHp, run.hp + heal); completeRoom(); });
  app.querySelector('[data-up]').addEventListener('click', async () => {
    const i = await pickFromDeck('Upgrade a card', canUpgrade);
    if (i === null) return;
    run.deck[i].up = true;
    completeRoom();
  });
}

function treasureScreen() {
  const k = randomCharm(run, Math.random() < 0.5 ? 'uncommon' : 'common');
  if (k) gainCharm(run, k); else run.coins += 60;
  app.innerHTML = `${header()}<main class="room treasure">
    <div class="room-icon">${roomIcon('treasure')}</div>
    <h1>Prize Locker</h1>
    ${k ? `<div class="charm-card solo"><span class="big-icon">${CHARMS[k].icon}</span><b>${esc(CHARMS[k].name)}</b><small>${esc(CHARMS[k].desc)}</small></div>` : '<p>60 coins inside!</p>'}
    <button class="btn big yellow" data-go>Continue</button></main>`;
  bindHeader(app);
  app.querySelector('[data-go]').addEventListener('click', completeRoom);
}

function shopScreen() {
  const stock = shopStock(run);
  const render = () => {
    app.innerHTML = `${header()}<main class="room shop">
      <h1>Konbini Corner</h1><p class="room-text">Snacks, cards and shiny charms.</p>
      <h2>Cards</h2>
      <div class="choices">${stock.cards.map((c, i) => `<div class="shop-item${c.sold ? ' sold' : ''}"><button class="card-btn" data-card="${i}" ${c.sold || run.coins < c.price ? 'disabled' : ''} aria-label="Buy ${esc(cardName(c))} for ${c.price}">${cardHTML(c)}</button><span class="price${run.coins < c.price ? ' poor' : ''}">● ${c.price}</span></div>`).join('')}</div>
      <h2>Charms</h2>
      <div class="charm-choices">${stock.charms.map((c, i) => `<div class="shop-item${c.sold ? ' sold' : ''}"><button class="charm-card" data-charm="${i}" ${c.sold || run.coins < c.price ? 'disabled' : ''}><span class="big-icon">${CHARMS[c.id].icon}</span><b>${esc(CHARMS[c.id].name)}</b><small>${esc(CHARMS[c.id].desc)}</small></button><span class="price${run.coins < c.price ? ' poor' : ''}">● ${c.price}</span></div>`).join('')}</div>
      <div class="shop-row">
        <button class="btn" data-remove ${stock.removed || run.coins < run.removeCost ? 'disabled' : ''}>Remove a card <small>● ${run.removeCost}</small></button>
        <button class="btn yellow" data-go>Leave shop</button>
      </div></main>`;
    bindHeader(app);
    app.querySelectorAll('[data-card]').forEach((b) => b.addEventListener('click', () => {
      const c = stock.cards[Number(b.dataset.card)];
      run.coins -= c.price; c.sold = true; run.deck.push({ id: c.id }); render();
    }));
    app.querySelectorAll('[data-charm]').forEach((b) => b.addEventListener('click', () => {
      const c = stock.charms[Number(b.dataset.charm)];
      run.coins -= c.price; c.sold = true; gainCharm(run, c.id); render();
    }));
    app.querySelector('[data-remove]').addEventListener('click', async () => {
      const i = await pickFromDeck('Remove a card');
      if (i === null) return;
      run.deck.splice(i, 1); run.coins -= run.removeCost; run.removeCost += 25; stock.removed = true; render();
    });
    app.querySelector('[data-go]').addEventListener('click', completeRoom);
  };
  render();
}

// debugging handle
window.__sm = { get run() { return run; }, get battle() { return battle; } };
