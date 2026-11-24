// The fight itself. Pure game logic; the UI listens through `hooks`.
//
// Board: draw up to 8 cards from the draw pile; each appears twice (16 slots).
// Flipping the first card of a pair costs 1 energy. Two cards with the same
// name (and upgrade) match and play that card. Clearing the board gives
// +1 energy and draws a fresh board. Unmatched cards stay put between turns,
// so remembering them pays off. When energy hits 0, the enemy acts.
import { CARDS } from './cards.js';
import { ENEMIES } from './enemies.js';

const BOARD_PAIRS = 8;
const shuffle = (a) => { for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
const randInt = (a, b) => a + Math.floor(Math.random() * (b - a + 1));
let uidSeq = 1;

export class Battle {
  constructor(run, enemyId, hooks = {}) {
    this.run = run;
    this.hooks = hooks;
    const def = ENEMIES[enemyId];
    this.def = def;
    const hp = randInt(def.hp[0], def.hp[1]);
    this.enemy = { id: enemyId, name: def.name, hp, maxHp: hp, block: 0, strength: 0, weak: 0, vuln: 0, poison: 0, step: 0, last: [] };
    this.player = { block: 0, strength: 0, weak: 0, vuln: 0, poison: 0, thorns: 0 };
    this.powers = { energy: 0, fortress: false, freeMiss: false };
    this.flags = {};
    this.turn = 0;
    this.energy = 0;
    this.combo = 0;
    this.matchesThisTurn = 0;
    this.over = false;
    this.busy = false;
    this.first = null;
    this.draw = shuffle(run.deck.map((c) => ({ ...c, uid: uidSeq++ })));
    this.discard = [];
    this.exhaust = [];
    this.board = [];
    this.has = (k) => run.charms.includes(k);
  }

  emit(name, ...args) { this.hooks[name]?.(...args); }
  log(msg) { this.emit('log', msg); }

  start() {
    if (this.has('hairclip')) this.player.block += 6;
    if (this.has('glowstick')) this.player.strength += 1;
    if (this.has('neon')) this.enemy.vuln += 2;
    this.chooseIntent();
    this.dealBoard();
    if (this.has('moonPin')) this.reveal(2, true);
    if (this.has('luckyCat')) this.flash(1400);
    this.startTurn();
    this.log(`${this.enemy.name} blocks the way!`);
  }

  // ---------- board ----------
  dealBoard() {
    // Discard whatever's left on the old board.
    for (const c of this.boardCards || []) (c._exhaust ? this.exhaust : this.discard).push(c);
    const hand = [];
    while (hand.length < BOARD_PAIRS) {
      if (!this.draw.length) {
        if (!this.discard.length) break;
        this.draw = shuffle(this.discard);
        this.discard = [];
      }
      hand.push(this.draw.pop());
    }
    this.boardCards = hand;
    const slots = [];
    for (const c of hand) { slots.push({ card: c }); slots.push({ card: c }); }
    shuffle(slots);
    this.board = slots.map((s, i) => ({ i, card: s.card, state: 'down', seen: false }));
    this.first = null;
    this.emit('board');
  }

  keyOf(card) { return card.id + (card.up ? '+' : ''); }

  flip(i) {
    if (this.over || this.busy) return;
    const s = this.board[i];
    if (!s || s.state === 'up' || s.state === 'gone') return;
    if (!this.first) {
      if (this.energy <= 0) { this.log('Out of energy. End your turn.'); return; }
      this.energy -= 1;
      s.state = 'up'; s.seen = true;
      this.first = s;
      this.emit('update');
      return;
    }
    const a = this.first, b = s;
    b.state = 'up'; b.seen = true;
    this.first = null;
    this.busy = true;
    this.emit('update');
    if (this.keyOf(a.card) === this.keyOf(b.card)) {
      setTimeout(() => { this.resolveMatch(a, b); }, 340);
    } else {
      this.miss();
      setTimeout(() => {
        a.state = a.revealed ? 'revealed' : 'down';
        b.state = b.revealed ? 'revealed' : 'down';
        this.busy = false;
        this.emit('update');
        this.checkAutoEnd();
      }, 760);
    }
  }

  miss() {
    if (this.flags.keepCombo) { this.flags.keepCombo = false; this.log('Miss! Momentum keeps your combo.'); }
    else { this.combo = 0; this.log('No match…'); }
    if (!this.flags.missRefunded && (this.powers.freeMiss || this.has('mint'))) {
      this.flags.missRefunded = true;
      this.energy += 1;
      this.log('Miss refunded (+1 energy).');
    }
  }

  resolveMatch(a, b) {
    a.state = 'gone'; b.state = 'gone';
    const card = a.card;
    const def = CARDS[card.id];
    this.combo += this.has('keyboard') ? 2 : 1;
    this.matchesThisTurn += 1;
    if (def.exhaust || def.type === 'power') { card._exhaust = true; if (b.card !== a.card) b.card._exhaust = true; }
    this.emit('play', card);
    if (this.matchesThisTurn === 1 && this.has('keychain')) this.attack(3, { raw: true, quiet: true });
    def.fx(this, !!card.up);
    this.busy = false;
    if (this.checkEnd()) return;
    if (this.board.every((s) => s.state === 'gone')) {
      this.gainEnergy(1, true);
      if (this.has('strap')) this.gainBlock(6);
      if (this.has('lipTint')) this.heal(3);
      this.log('Board cleared! +1 energy.');
      this.emit('cleared');
      setTimeout(() => { this.dealBoard(); this.emit('update'); this.checkAutoEnd(); }, 450);
      this.emit('update');
      return;
    }
    this.emit('update');
    this.checkAutoEnd();
  }

  checkAutoEnd() {
    if (!this.over && !this.busy && !this.first && this.energy <= 0) {
      setTimeout(() => { if (!this.over && !this.busy && !this.first && this.energy <= 0) this.endTurn(); }, 500);
    }
  }

  reveal(n, quiet) {
    const hidden = shuffle(this.board.filter((s) => s.state === 'down'));
    hidden.slice(0, n).forEach((s) => { s.state = 'revealed'; s.revealed = true; s.seen = true; });
    if (!quiet) this.log(`Revealed ${Math.min(n, hidden.length)} cards.`);
    this.emit('update');
  }

  flash(ms = 1100) {
    this.emit('flash', ms);
  }

  // ---------- combat helpers (used by card effects) ----------
  calcDamage(base, from, to) {
    let d = base + from.strength;
    if (from.weak > 0) d *= 0.75;
    if (to.vuln > 0) d *= 1.5;
    return Math.max(0, Math.floor(d));
  }

  attack(base, opts = {}) {
    const e = this.enemy;
    if (e.hp <= 0) return;
    let dmg;
    if (opts.raw) dmg = base;
    else {
      const comboBonus = Math.max(0, this.combo - 1) * 2;
      dmg = this.calcDamage(base + comboBonus, this.player, e);
    }
    const absorbed = Math.min(e.block, dmg);
    e.block -= absorbed;
    e.hp = Math.max(0, e.hp - (dmg - absorbed));
    this.emit('hit', 'enemy', dmg - absorbed, absorbed);
  }

  gainBlock(n) {
    let b = n;
    this.player.block += b;
    this.emit('float', 'player', `+${b}`, 'block');
  }
  gainEnergy(n, quiet) {
    this.energy = Math.max(0, this.energy + n);
    if (!quiet) this.emit('float', 'player', `${n > 0 ? '+' : ''}${n} ⚡`, 'energy');
  }
  heal(n) {
    const before = this.run.hp;
    this.run.hp = Math.min(this.run.maxHp, this.run.hp + n);
    this.emit('float', 'player', `+${this.run.hp - before}`, 'heal');
  }
  selfDamage(n) {
    this.run.hp = Math.max(0, this.run.hp - n);
    this.emit('hit', 'player', n, 0);
    this.checkEnd();
  }
  applyEnemy(k, n) { if (n > 0) { this.enemy[k] += n; this.emit('float', 'enemy', `+${n} ${STATUS_NAMES[k]}`, k); } }
  applyPlayer(k, n) { if (n > 0) { this.player[k] += n; this.emit('float', 'player', `+${n} ${STATUS_NAMES[k]}`, k); } }

  // ---------- turns ----------
  startTurn() {
    this.turn += 1;
    if (!this.powers.fortress) this.player.block = this.turn === 1 ? this.player.block : 0;
    this.energy = 3 + this.powers.energy + (this.has('chair') ? 1 : 0) + (this.turn === 1 && this.has('americano') ? 1 : 0) + (this.turn % 3 === 0 && this.has('tamago') ? 1 : 0);
    this.combo = this.has('stickers') ? 1 : 0;
    this.matchesThisTurn = 0;
    this.flags = {};
    if (this.has('headset')) this.reveal(1, true);
    // Glitch (poison) ticks on the player at the start of their turn
    if (this.player.poison > 0) { this.selfDamage(this.player.poison); this.player.poison -= 1; }
    this.emit('turn');
    this.emit('update');
  }

  endTurn() {
    if (this.over || this.busy) return;
    if (this.first) { this.first.state = this.first.revealed ? 'revealed' : 'down'; this.first = null; }
    // player statuses tick down at end of their turn
    if (this.player.weak > 0) this.player.weak -= 1;
    if (this.player.vuln > 0) this.player.vuln -= 1;
    this.busy = true;
    this.emit('update');
    setTimeout(() => this.enemyTurn(), 450);
  }

  enemyTurn() {
    const e = this.enemy;
    e.block = 0;
    if (e.poison > 0) {
      e.hp = Math.max(0, e.hp - e.poison);
      this.emit('hit', 'enemy', e.poison, 0, 'poison');
      e.poison -= 1;
      if (this.checkEnd()) { this.busy = false; return; }
    }
    const it = this.intent;
    const hitPlayer = (n) => {
      const dmg = this.calcDamage(n, e, this.player);
      const absorbed = Math.min(this.player.block, dmg);
      this.player.block -= absorbed;
      this.run.hp = Math.max(0, this.run.hp - (dmg - absorbed));
      this.emit('hit', 'player', dmg - absorbed, absorbed);
      if (this.player.thorns > 0) {
        e.hp = Math.max(0, e.hp - this.player.thorns);
        this.emit('hit', 'enemy', this.player.thorns, 0, 'thorns');
      }
    };
    switch (it.t) {
      case 'atk': for (let k = 0; k < (it.times || 1); k++) hitPlayer(it.n); this.log(`${e.name} attacks!`); break;
      case 'atkBlock': hitPlayer(it.n); e.block += it.b; this.log(`${e.name} attacks and shields up.`); break;
      case 'block': e.block += it.n; this.log(`${e.name} shields up (${it.n}).`); break;
      case 'buff': e.strength += it.n; this.log(`${e.name} powers up! +${it.n} Strength.`); this.emit('float', 'enemy', `+${it.n} Strength`, 'strength'); break;
      case 'heal': e.hp = Math.min(e.maxHp, e.hp + it.n); this.emit('float', 'enemy', `+${it.n}`, 'heal'); this.log(`${e.name} munches and heals.`); break;
      case 'debuff':
        if (it.weak) this.applyPlayer('weak', it.weak);
        if (it.vuln) this.applyPlayer('vuln', it.vuln);
        this.log(`${e.name} messes with you.`);
        break;
      case 'status':
      case 'atkStatus':
        if (it.t === 'atkStatus') hitPlayer(it.n);
        for (let k = 0; k < it.count; k++) this.draw.splice(Math.floor(Math.random() * (this.draw.length + 1)), 0, { id: it.card, uid: uidSeq++ });
        this.log(`${e.name} slips ${it.count} ${CARDS[it.card].name} into your deck.`);
        break;
      case 'scramble': {
        const live = this.board.filter((s) => s.state !== 'gone');
        const cards = shuffle(live.map((s) => s.card));
        live.forEach((s, k) => { s.card = cards[k]; s.state = 'down'; s.revealed = false; });
        this.log(`${e.name} scrambles the board!`);
        this.emit('scramble');
        break;
      }
    }
    if (e.weak > 0) e.weak -= 1;
    if (e.vuln > 0) e.vuln -= 1;
    if (this.checkEnd()) { this.busy = false; return; }
    this.chooseIntent();
    this.busy = false;
    this.startTurn();
  }

  chooseIntent() {
    const e = this.enemy, moves = this.def.moves;
    let idx;
    if (this.def.ai === 'cycle') idx = e.step % moves.length;
    else {
      do { idx = Math.floor(Math.random() * moves.length); } while (e.last.length >= 2 && e.last[0] === idx && e.last[1] === idx && moves.length > 1);
    }
    e.last = [idx, ...e.last].slice(0, 2);
    e.step += 1;
    this.intent = moves[idx];
  }

  intentDamage() {
    const it = this.intent;
    if (!it || !('n' in it) || it.t === 'block' || it.t === 'buff' || it.t === 'heal') return null;
    return this.calcDamage(it.n, this.enemy, this.player);
  }

  checkEnd() {
    if (this.over) return true;
    if (this.enemy.hp <= 0) { this.over = true; this.emit('end', 'win'); return true; }
    if (this.run.hp <= 0) { this.over = true; this.emit('end', 'lose'); return true; }
    return false;
  }
}

export const STATUS_NAMES = { weak: 'Sleepy', vuln: 'Exposed', poison: 'Glitch', strength: 'Strength', thorns: 'Spikes' };
export const STATUS_HELP = {
  weak: 'Sleepy: deals 25% less damage.',
  vuln: 'Exposed: takes 50% more damage.',
  poison: 'Glitch: loses that much HP each turn, then Glitch goes down by 1.',
  strength: 'Strength: adds damage to every hit.',
  thorns: 'Spikes: deals damage back when hit.',
};
