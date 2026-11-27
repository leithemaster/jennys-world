// The fight itself. Pure game logic; the UI listens through `hooks`.
//
// Board: draw up to 8 cards from the draw pile; each appears twice (16 slots).
// Flipping the first card of a pair costs 1 energy. Two cards with the same
// name (and upgrade) match and play that card. Clearing the board gives
// +1 energy and draws a fresh board. Unmatched cards stay put between turns,
// so remembering them pays off. When energy hits 0, the enemy acts.
import { climbOn, CLIMB_RULES as CR } from './climb.js';
import { CARDS } from './cards.js';
import { ENEMIES } from './enemies.js';
import { T } from './terms.js';
import { CHARACTERS } from './characters.js';
import { SNACKS } from './snacks.js';

// Tunable rules. freeReveal = cards revealed for free on every new board.
export const COMBO_CHANCE = 0.7;
export const MAX_ATTACK_RUN = 2;
const DAMAGING = ['atk', 'atkBlock', 'atkStatus', 'steal', 'drain'];
export const moveDamage = (m) => (DAMAGING.includes(m.t) || (m.t === 'ban' && m.n) ? m.n * (m.times || 1) : 0);
export const moveIs = (m, kind) => (kind === 'attack' ? moveDamage(m) > 0 : m.t === kind);
export const RULES = { freeReveal: [3, 3, 4], boardPairs: [8, 9, 10], sleepAt: 3, sleepGrow: 3, sleepTurns: 2, bossSleepTurns: 1 }; // boardPairs / freeReveal: per floor (1, 2, 3); boardPairs = deck cards per board, each shown as a pair
export const perFloor = (v, act = 0) => (Array.isArray(v) ? v[Math.min(act, v.length - 1)] : v);
// Animation pacing. The UI sets scale < 1 for Fast mode; the simulator leaves it at 1.
export const PACE = { scale: 1 };
const wait = (fn, ms) => setTimeout(fn, ms * PACE.scale);
const shuffle = (a) => { for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
const randInt = (a, b) => a + Math.floor(Math.random() * (b - a + 1));
let uidSeq = 1;

// Jenny's Sticker Book. Drawn from a shuffled deck per fight, so every
// sticker shows up once before any repeats, and the next one is visible.
export const STICKERS = {
  star: { name: 'Star', text: 'deal 4', fx: (b) => b.attack(4, { raw: true }) },
  bow: { name: 'Bow', text: `4 ${T.block}`, fx: (b) => b.gainBlock(4) },
  heart: { name: 'Heart', text: 'heal 3', fx: (b) => b.heal(3) },
  bunny: { name: 'Bunny', text: 'reveal 2', fx: (b) => b.reveal(2, true) },
  bolt: { name: 'Bolt', text: `+1 ${T.energy}`, fx: (b) => b.gainEnergy(1) },
};

export class Battle {
  constructor(run, enemyId, hooks = {}) {
    this.run = run;
    this.hooks = hooks;
    const def = ENEMIES[enemyId];
    this.def = def;
    // climb levels 1 and 5: tougher elites and bosses
    const hp = Math.round(randInt(def.hp[0], def.hp[1]) * (def.elite && climbOn(run, 1) ? CR.eliteHp : 1) * (def.boss && climbOn(run, 5) ? CR.bossHp : 1));
    this.enemy = { id: enemyId, name: def.name, hp, maxHp: hp, block: 0, strength: 0, weak: 0, vuln: 0, poison: 0, asleep: 0, sleepAt: RULES.sleepAt, step: 0, last: [] };
    this.player = { block: 0, strength: 0, weak: 0, vuln: 0, poison: 0, thorns: 0 };
    this.powers = { energy: 0, fortress: false, freeMiss: false, malware: 0, armor: 0, groove: false, spotlight: 0, bedtime: 0, deepSleep: 0, sweetDreams: false, roast: false };
    this.healedThisFight = 0;
    this.stolen = 0; // coins an enemy stole this fight (you get them back if you win)
    this.matchesThisFight = 0;
    this.stickerDeck = [];
    this.character = CHARACTERS[run.character] || CHARACTERS.jenny;
    this.turnEnergy = 3;
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
    this.playing = null; // card definition whose effect is running (style boons read it)
  }

  emit(name, ...args) { this.hooks[name]?.(...args); }
  log(msg) { this.emit('log', msg); }

  start() {
    if (this.has('hairclip')) this.player.block += 6;
    if (this.has('puffyJacket')) this.player.block += 4;
    if (this.has('glowstick')) this.player.strength += 1;
    if (this.has('neon')) this.enemy.vuln += 2;
    if (this.has('gossipPhone')) this.enemy.vuln += 1;
    if (this.has('sleepMask')) this.enemy.weak += 1;
    if (this.has('puppyEyes')) this.player.block += 7;
    if (this.has('chewedCable')) this.enemy.poison += 3;
    if (this.has('sharpTeeth')) this.player.thorns += 2;
    if (this.has('toroCrown')) { this.enemy.vuln += 3; this.enemy.poison += 4; }
    if (this.has('nightOwl')) this.enemy.weak += 2;
    if (this.has('hisHoodie')) this.player.block += 5;
    if (this.has('goodLuckKiss')) this.player.strength += 2;
    if (this.has('loveLetter')) { this.enemy.vuln += 2; this.enemy.weak += 2; }
    // one-fight buffs from events (e.g. the spicy ramen)
    if (climbOn(this.run, 10) && (this.def.elite || this.def.boss)) this.enemy.strength += CR.bigSpirit;
    const nf = this.run.nextFight;
    if (nf) { if (nf.strength) this.player.strength += nf.strength; if (nf.noReveal) this.flags.noFreeReveal = true; this.run.nextFight = null; }
    this.chooseIntent();
    this.dealBoard();
    this.startTurn();
    this.log(`${this.enemy.name} blocks the way!`);
  }

  // ---------- board ----------
  dealBoard() {
    // Discard whatever's left on the old board.
    for (const c of this.boardCards || []) (c._exhaust ? this.exhaust : this.discard).push(c);
    const hand = [];
    while (hand.length < perFloor(RULES.boardPairs, this.run.act)) {
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
    // Every new board: saved-up reveals carry over, and "new board" charms trigger.
    const saved = this.pendingReveal || 0;
    this.pendingReveal = 0;
    const charmReveal = (this.has('moonPin') ? 2 : 0) + (this.has('bandana') ? 1 : 0) + (this.has('peekMirror') ? 2 : 0) + (this.flags.noFreeReveal ? 0 : perFloor(RULES.freeReveal, this.run.act) - (climbOn(this.run, 7) ? CR.revealLoss : 0));
    this.flags.noFreeReveal = false; // Sleep in: only the first board
    if (saved + charmReveal > 0) {
      this.reveal(saved + charmReveal, true, true);
      if (saved) this.log(`${saved} saved reveal${saved > 1 ? 's' : ''} used on the new board.`);
    }
    if (this.has('luckyCat') || this.has('peekMirror')) this.flash(1400);
  }

  // Is the card being played tagged with this style (either of its two)?
  playingStyle(arch) { const d = this.playing; return !!d && (d.arch === arch || d.arch2 === arch); }

  keyOf(card) { return card.id + (card.up ? '+' : ''); }

  // The sticker the next Sticker Book trigger will give (refills the deck when empty).
  nextSticker() {
    if (!this.stickerDeck.length) this.stickerDeck = shuffle(Object.keys(STICKERS));
    return this.stickerDeck[0];
  }
  stickersIn() { const n = this.character.passive.n; return n - (this.matchesThisFight % n); }

  flip(i) {
    if (this.over || this.busy) return;
    const s = this.board[i];
    if (!s || s.state === 'up' || s.state === 'gone') return;
    if (!this.first) {
      if (this.energy <= 0) { this.log(`Out of ${T.energy}. End your turn.`); return; }
      this.energy -= 1;
      s.state = 'up'; s.seen = true;
      this.emit('sfx', 'flip');
      this.first = s;
      this.emit('update');
      return;
    }
    const a = this.first, b = s;
    b.state = 'up'; b.seen = true;
    this.emit('sfx', 'flip');
    this.first = null;
    this.busy = true;
    this.emit('update');
    if (this.keyOf(a.card) === this.keyOf(b.card)) {
      wait(() => { this.resolveMatch(a, b); }, 340);
    } else {
      this.miss();
      wait(() => {
        a.state = a.revealed ? 'revealed' : 'down';
        b.state = b.revealed ? 'revealed' : 'down';
        this.busy = false;
        this.emit('update');
        this.checkAutoEnd();
      }, 760);
    }
  }

  miss() {
    this.emit('sfx', 'miss');
    if (this.flags.comboLock) { this.log(`Miss! Choco Sticks keep your ${T.combo}.`); }
    else if (this.flags.keepCombo) { this.flags.keepCombo = false; this.log(`Miss! Momentum keeps your ${T.combo}.`); }
    else if (this.has('kittenBell') && !this.bellUsed) { this.bellUsed = true; this.log(`Miss! Kitten Bell keeps your ${T.combo}.`); }
    else if (this.has('tennisBall') && !this.flags.tennisBall) { this.flags.tennisBall = true; this.log(`Miss! Tennis Ball keeps your ${T.combo}.`); }
    else if (this.powers.groove) { this.combo = Math.floor(this.combo / 2); this.log(`Miss! Groove keeps half your ${T.combo}.`); }
    else { this.combo = 0; this.log('No match…'); }
    if (!this.flags.missRefunded && (this.powers.freeMiss || this.has('mint') || this.has('remembers'))) {
      this.flags.missRefunded = true;
      this.energy += 1;
      this.log(`Miss refunded (+1 ${T.energy}).`);
    }
  }

  resolveMatch(a, b) {
    a.state = 'gone'; b.state = 'gone';
    const card = a.card;
    const def = CARDS[card.id];
    this.combo += this.has('keyboard') ? 2 : 1;
    this.matchesThisTurn += 1;
    this.emit('sfx', 'match', this.combo);
    if (def.exhaust || def.type === 'power') { card._exhaust = true; if (b.card !== a.card) b.card._exhaust = true; }
    this.emit('play', card);
    if (def.type === 'power' && this.has('powerBank')) this.gainEnergy(1);
    if (def.rarity === 'status' && this.has('vpnDongle')) this.gainBlock(4);
    if (this.matchesThisTurn === 1 && this.has('keychain')) this.attack(3, { raw: true, quiet: true });
    if (this.matchesThisTurn === 1 && this.has('spikedCollar')) this.gainBlock(3);
    if (this.has('encore') && (def.arch === 'combo' || def.arch2 === 'combo') && !this.flags.encore) { this.flags.encore = true; this.combo += 1; }
    if (this.has('crossover') && def.arch2 && !this.crossoverUsed) { this.crossoverUsed = true; this.gainEnergy(2); this.log(`Crossover! +2 ${T.energy}.`); }
    this.playing = def;
    def.fx(this, !!card.up);
    this.playing = null;
    if (this.powers.spotlight && (a.revealed || b.revealed)) this.attack(this.powers.spotlight, { raw: true });
    this.matchesThisFight += 1;
    if (this.has('matchingCharms') && this.matchesThisFight % 4 === 0) { this.gainEnergy(1); this.heal(3); this.log(`Matching Phone Charms! +1 ${T.energy}.`); }
    const pas = this.character.passive;
    if (pas.id === 'stickerBook' && this.matchesThisFight % pas.n === 0) {
      const id = this.nextSticker();
      this.stickerDeck.shift();
      const st = STICKERS[id];
      this.emit('float', 'player', `${st.name} sticker!`, 'heal');
      this.log(`Sticker Book: ${st.name} sticker (${st.text}).`);
      st.fx(this);
    }
    this.busy = false;
    if (this.checkEnd()) return;
    if (this.board.every((s) => s.state === 'gone')) {
      this.gainEnergy(1, true);
      if (this.has('strap')) this.gainBlock(6);
      if (this.has('lipTint')) this.heal(3);
      if (this.has('snackBag')) this.heal(2);
      if (this.has('goldenMic')) this.attack(5, { raw: true });
      this.log(`Board cleared! +1 ${T.energy}.`);
      this.emit('sfx', 'clear');
      this.emit('cleared');
      wait(() => { this.dealBoard(); this.emit('update'); this.checkAutoEnd(); }, 450);
      this.emit('update');
      return;
    }
    this.emit('update');
    this.checkAutoEnd();
  }

  checkAutoEnd() {
    if (!this.over && !this.busy && !this.first && this.energy <= 0 && this.has('spareBattery') && !this.batteryUsed) {
      this.batteryUsed = true;
      this.gainEnergy(2);
      this.log(`Spare Battery! +2 ${T.energy}.`);
      this.emit('update');
      return;
    }
    if (!this.over && !this.busy && !this.first && this.energy <= 0) {
      wait(() => { if (!this.over && !this.busy && !this.first && this.energy <= 0) this.endTurn(); }, 500);
    }
  }

  // Reveal n hidden cards. Any reveals that don't fit on this board (because
  // it's nearly cleared) are saved and used on the next board.
  reveal(n, quiet, noCarry) {
    if (this.has('palaceKey') && this.playingStyle('memory') && !this.flags.palace) { this.flags.palace = true; n += 1; }
    const hidden = shuffle(this.board.filter((s) => s.state === 'down'));
    const used = Math.min(n, hidden.length);
    hidden.slice(0, used).forEach((s) => { s.state = 'revealed'; s.revealed = true; s.seen = true; });
    const left = n - used;
    if (left > 0 && !noCarry) {
      this.pendingReveal = Math.min(16, (this.pendingReveal || 0) + left);
      this.log(`${used ? `Revealed ${used}. ` : ''}${left > 15 ? 'The whole next board' : `${left} more`} will be revealed on the next board.`);
    } else if (!quiet) this.log(`Revealed ${used} card${used === 1 ? '' : 's'}.`);
    this.emit('update');
  }

  flash(ms = 1100) {
    this.emit('flash', ms);
  }

  // Eat a snack from the snack bar. Free: costs no energy and doesn't end the turn.
  // The caller removes it from the bar. Returns false if it can't be eaten right now.
  useSnack(id) {
    const s = SNACKS[id];
    if (!s || this.over || this.busy || this.first) return false;
    const times = this.has('secretRecipe') ? 2 : 1;
    for (let k = 0; k < times; k++) s.fx(this);
    if (this.has('hamsterCheeks')) this.heal(2);
    this.log(`You eat ${s.name}.`);
    this.emit('sfx', 'clear');
    if (!this.checkEnd()) { this.emit('update'); this.checkAutoEnd(); }
    return true;
  }

  // ---------- combat helpers (used by card effects) ----------
  calcDamage(base, from, to) {
    let d = base + from.strength;
    if (from.weak > 0) d *= 0.75;
    if (to.vuln > 0) d *= to === this.enemy && this.has('trending') ? 1.75 : 1.5;
    if (to === this.enemy && to.asleep > 0 && this.has('napBuddy')) d *= 1.3;
    if (from === this.enemy && from.vuln > 0 && this.has('growl')) d *= 0.75;
    if (from === this.enemy && climbOn(this.run, 3)) d *= CR.enemyDamage;
    return Math.max(0, Math.floor(d));
  }

  attack(base, opts = {}) {
    const e = this.enemy;
    if (e.hp <= 0) return;
    let dmg;
    if (opts.raw) dmg = base;
    else {
      const comboBonus = Math.max(0, this.combo - 1) * this.comboStep();
      dmg = this.calcDamage(base + comboBonus, this.player, e);
    }
    const absorbed = Math.min(e.block, dmg);
    e.block -= absorbed;
    e.hp = Math.max(0, e.hp - (dmg - absorbed));
    this.emit('hit', 'enemy', dmg - absorbed, absorbed);
  }

  comboStep() { return this.has('rhythmBracelet') ? 3 : 2; }

  gainBlock(n) {
    let b = n;
    if (this.has('bouncerStance') && this.playingStyle('guard')) b += 2;
    if (this.has('guardDog') && this.playing) b += 2;
    this.player.block += b;
    this.emit('float', 'player', `+${b}`, 'block');
  }
  gainEnergy(n, quiet) {
    this.energy = Math.max(0, this.energy + n);
    if (!quiet) this.emit('float', 'player', `${n > 0 ? '+' : ''}${n} ${T.energy}`, 'energy');
  }
  // opts.cozy: healing past max HP hits the enemy instead of being wasted.
  heal(n, opts = {}) {
    if (n <= 0) return;
    if (this.character.passive.id === 'comfy') n += this.character.passive.n;
    if (this.has('grandmaSoup')) opts = { ...opts, cozy: true };
    const before = this.run.hp;
    this.run.hp = Math.min(this.run.maxHp, this.run.hp + n);
    const healed = this.run.hp - before;
    this.healedThisFight += healed;
    this.emit('float', 'player', `+${healed}`, 'heal');
    const extra = n - healed;
    if (opts.cozy && extra > 0) { this.attack(extra, { raw: true }); this.log(`Cozy: ${extra} extra healing hits ${this.enemy.name}.`); }
    if (this.powers.sweetDreams && healed > 0) this.attack(healed, { raw: true });
    if (this.has('bellyRubs') && n > 0) this.gainBlock(2);
  }
  selfDamage(n) {
    this.run.hp = Math.max(0, this.run.hp - n);
    this.emit('hit', 'player', n, 0, 'self');
    this.checkEnd();
  }
  applyEnemy(k, n) {
    if (n > 0 && k === 'poison' && this.has('venomVial')) n += 2;
    if (n > 0 && k === 'poison' && this.has('rootAccess') && this.playingStyle('glitch')) n += 2;
    if (n > 0 && k === 'weak' && this.has('lucidDream') && this.playingStyle('dreamy') && !this.flags.lucid) { this.flags.lucid = true; n += 1; }
    if (n <= 0) return;
    const e = this.enemy;
    if (k === 'weak' && e.asleep) { this.emit('float', 'enemy', 'Zzz', 'weak'); return; }
    e[k] += n;
    this.emit('float', 'enemy', `+${n} ${STATUS_NAMES[k]}`, k);
    // Sleepy builds up to Asleep: the enemy skips its next turns. Each time it
    // wakes up, it takes 1 more Sleepy to put it back to sleep.
    if (k === 'weak' && !e.asleep && e.weak >= e.sleepAt) {
      e.weak = 0;
      e.asleep = (this.def.boss ? RULES.bossSleepTurns : RULES.sleepTurns) + this.powers.deepSleep;
      e.sleepAt += RULES.sleepGrow;
      this.emit('float', 'enemy', T.asleep, 'weak');
      this.emit('sfx', 'clear');
      this.log(`${e.name} falls ${T.asleep.toLowerCase()} for ${e.asleep} turn${e.asleep > 1 ? 's' : ''}!`);
    }
  }
  applyPlayer(k, n) { if (n > 0) { this.player[k] += n; this.emit('float', 'player', `+${n} ${STATUS_NAMES[k]}`, k); } }

  // ---------- turns ----------
  startTurn() {
    this.turn += 1;
    if (!this.powers.fortress) this.player.block = this.turn === 1 ? this.player.block : this.has('bambooMat') ? Math.floor(this.player.block / 2) : 0;
    this.energy = 3 + this.powers.energy + (this.has('chair') ? 1 : 0) + (this.turn === 1 && this.has('americano') ? 1 : 0) + (this.turn === 1 && this.has('bandana') ? 1 : 0) + (this.turn <= 2 && this.has('batWings') ? 1 : 0) + (this.turn === 1 && this.has('luckyChopsticks') && (this.def.elite || this.def.boss) ? 1 : 0) + (this.turn % 3 === 0 && this.has('tamago') ? 1 : 0);
    this.combo = (this.has('stickers') ? 1 : 0) + (this.has('rainbowRoll') ? 2 : 0);
    this.matchesThisTurn = 0;
    this.flags = {};
    this.turnEnergy = this.energy;
    if (this.has('headset')) this.reveal(1, true);
    if (this.has('conveyorBelt')) this.reveal(2, true);
    if (this.has('remembers')) this.reveal(1, true);
    if (this.has('hanaSigh')) this.heal(2);
    if (this.powers.armor) this.gainBlock(this.powers.armor);
    if (this.powers.malware) this.applyEnemy('poison', this.powers.malware);
    if (this.powers.bedtime) this.applyEnemy('weak', this.powers.bedtime);
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
    wait(() => this.enemyTurn(), 450);
  }

  enemyTurn() {
    const e = this.enemy;
    e.block = 0;
    if (e.poison > 0) {
      e.hp = Math.max(0, e.hp - e.poison);
      this.emit('hit', 'enemy', e.poison, 0, 'poison');
      if (!this.has('hexRibbon')) e.poison -= 1;
      if (this.checkEnd()) { this.busy = false; return; }
    }
    if (e.asleep > 0) {
      e.asleep -= 1;
      this.log(e.asleep ? `${e.name} is fast ${T.asleep.toLowerCase()}. Zzz…` : `${e.name} sleeps through its turn and wakes up.`);
      this.emit('float', 'enemy', 'Zzz', 'weak');
      if (e.vuln > 0 && !this.powers.roast) e.vuln -= 1;
      this.busy = false;
      this.startTurn();
      return;
    }
    const it = this.intent;
    this.emit('enemyAct', it);
    const hitPlayer = (n) => {
      const dmg = this.calcDamage(n, e, this.player);
      const absorbed = Math.min(this.player.block, dmg);
      this.player.block -= absorbed;
      this.run.hp = Math.max(0, this.run.hp - (dmg - absorbed));
      this.emit('hit', 'player', dmg - absorbed, absorbed);
      if (this.has('spiteful') && dmg - absorbed > 0) e.vuln += 1;
      if (this.player.thorns > 0) {
        e.hp = Math.max(0, e.hp - this.player.thorns);
        this.emit('hit', 'enemy', this.player.thorns, 0, 'thorns');
      }
    };
    switch (it.t) {
      case 'atk': for (let k = 0; k < (it.times || 1); k++) hitPlayer(it.n); this.log(`${e.name} attacks!`); break;
      case 'atkBlock': hitPlayer(it.n); e.block += it.b; this.log(`${e.name} attacks and shields up.`); break;
      case 'block': e.block += it.n; this.log(`${e.name} shields up (${it.n}).`); break;
      case 'buff': e.strength += it.n; this.log(`${e.name} powers up! +${it.n} ${T.spirit}.`); this.emit('float', 'enemy', `+${it.n} ${T.spirit}`, 'strength'); break;
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
        this.emit('sfx', 'junk');
        this.log(`${e.name} slips ${it.count} ${CARDS[it.card].name} into your deck.`);
        break;
      case 'steal': {
        hitPlayer(it.n);
        const took = Math.min(this.run.coins, it.coins);
        this.run.coins -= took; this.stolen += took;
        this.emit('float', 'player', `-${took} ${T.coins}`, 'vuln');
        this.log(`${e.name} swipes ${took} ${T.coins}! Win to get them back.`);
        break;
      }
      case 'drain': {
        const before = this.run.hp;
        hitPlayer(it.n);
        const took = before - this.run.hp;
        if (took > 0) { e.hp = Math.min(e.maxHp, e.hp + took); this.emit('float', 'enemy', `+${took}`, 'heal'); }
        this.log(`${e.name} drains you${took ? ` and heals ${took}` : ''}.`);
        break;
      }
      case 'ban': {
        // Bans a card from your deck for the rest of this fight (and attacks, if it has n).
        if (it.n) hitPlayer(it.n);
        const pile = this.draw.some((c) => CARDS[c.id].type !== 'status') ? this.draw : this.discard;
        const ok = pile.filter((c) => CARDS[c.id].type !== 'status');
        if (ok.length) {
          const c = ok[Math.floor(Math.random() * ok.length)];
          pile.splice(pile.indexOf(c), 1); this.exhaust.push(c);
          this.log(`${e.name} bans ${CARDS[c.id].name} for the rest of this fight!`);
          this.emit('sfx', 'junk');
        } else this.log(`${e.name} looks for something to ban, but finds nothing.`);
        break;
      }
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
    if (e.vuln > 0 && !this.powers.roast) e.vuln -= 1;
    if (this.checkEnd()) { this.busy = false; return; }
    this.chooseIntent();
    this.busy = false;
    this.startTurn();
  }

  chooseIntent() {
    const e = this.enemy, moves = this.def.moves;
    let idx;
    if (this.def.ai === 'bag') idx = this.drawMarble();
    else if (this.def.ai === 'cycle') idx = e.step % moves.length;
    else {
      do { idx = Math.floor(Math.random() * moves.length); } while (e.last.length >= 2 && e.last[0] === idx && e.last[1] === idx && moves.length > 1);
    }
    e.last = [idx, ...e.last].slice(0, 2);
    e.step += 1;
    this.intent = moves[idx];
  }

  // Boss marble bag: each move has `w` marbles. Draw one without putting it
  // back; refill when the bag is empty. A combo makes the next draw come from
  // a certain kind of marble most of the time. The opening move is never the
  // boss's biggest hit.
  drawMarble() {
    const e = this.enemy, moves = this.def.moves;
    if (!e.bag || !e.bag.length) e.bag = moves.flatMap((m, i) => Array(m.w || 1).fill(i));
    let pool = e.bag.map((_, k) => k);
    const keep = (ok) => { const p = pool.filter((k) => ok(moves[e.bag[k]])); if (p.length) pool = p; };
    if (e.step === 0) { const big = Math.max(...moves.map(moveDamage)); keep((m) => moveDamage(m) < big); }
    // never a third attack in a row while the bag still has something else
    const capped = (e.atkRun || 0) >= MAX_ATTACK_RUN;
    if (capped) keep((m) => !moveDamage(m));
    const combo = this.intent && this.def.combo?.[this.intent.t];
    if (combo && !(capped && combo === 'attack') && Math.random() < COMBO_CHANCE) keep((m) => moveIs(m, combo));
    const k = pool[Math.floor(Math.random() * pool.length)];
    const idx = e.bag.splice(k, 1)[0];
    e.atkRun = moveDamage(moves[idx]) ? (e.atkRun || 0) + 1 : 0;
    return idx;
  }

  // What's left in the boss's bag: [{ move, left, total }] in move order.
  bagLeft() {
    if (this.def.ai !== 'bag') return null;
    const bag = this.enemy.bag || [];
    return this.def.moves.map((m, i) => ({ move: m, left: bag.filter((x) => x === i).length, total: m.w || 1 }));
  }

  intentDamage() {
    const it = this.intent;
    if (!it || !('n' in it) || it.t === 'block' || it.t === 'buff' || it.t === 'heal') return null;
    return this.calcDamage(it.n, this.enemy, this.player);
  }

  checkEnd() {
    if (this.over) return true;
    if (this.run.hp <= 0 && this.has('shibaCharm') && !this.run.shibaUsed) {
      this.run.shibaUsed = true;
      this.run.hp = Math.max(1, Math.round(this.run.maxHp * 0.25));
      this.log(`Shiba Keychain! Back up with 25% ${T.hp}.`);
      this.emit('float', 'player', 'Saved!', 'heal');
      this.emit('update');
    }
    if (this.run.hp <= 0 && this.has('alwaysThere') && !this.savedByToni) {
      this.savedByToni = true;
      this.run.hp = Math.min(this.run.maxHp, 15);
      this.log(`Toni is always there for you! (15 ${T.hp})`);
      this.emit('float', 'player', 'Saved!', 'heal');
      this.emit('update');
    }
    if (this.run.hp <= 0 && this.has('shibaPlush') && !this.savedByShiba) {
      this.savedByShiba = true;
      this.run.hp = 1;
      this.log(`Shiba Plush saves you! (1 ${T.hp})`);
      this.emit('float', 'player', 'Saved!', 'heal');
      this.emit('update');
    }
    if (this.enemy.hp <= 0) {
      if (this.stolen) { this.run.coins += this.stolen; this.log(`You get your ${this.stolen} ${T.coins} back.`); this.stolen = 0; }
      this.over = true; this.emit('end', 'win'); return true;
    }
    if (this.run.hp <= 0) { this.over = true; this.emit('end', 'lose'); return true; }
    return false;
  }
}

export const STATUS_NAMES = { weak: T.sleepy, vuln: T.exposed, poison: T.glitch, strength: T.spirit, thorns: T.spikes, asleep: T.asleep };
export const STATUS_HELP = {
  weak: `${T.sleepy}: deals 25% less damage. An enemy with ${RULES.sleepAt} ${T.sleepy} falls ${T.asleep} (each time it wakes up, it takes ${RULES.sleepGrow} more).`,
  asleep: `${T.asleep}: skips its turns until it wakes up. Can't get more ${T.sleepy} while asleep. ${T.glitch} still ticks.`,
  vuln: `${T.exposed}: takes 50% more damage.`,
  poison: `${T.glitch}: loses that much ${T.hp} each turn, then ${T.glitch} goes down by 1.`,
  strength: `${T.spirit}: adds damage to every hit.`,
  thorns: `${T.spikes}: deals damage back when hit.`,
};
