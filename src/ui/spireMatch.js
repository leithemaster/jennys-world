// Spire Match: a memory game with a roguelike card-battle twist.
// Flip two cards (costs 1 energy). A match plays that card's effect.
// When energy runs out the enemy acts on its shown intent.
// Beat 4 floors to clear the run; pick an upgrade after each win.

const ICONS = {
  slash: '<path d="M6 26 L24 8 L27 5 L26 9 L9 28 Z M5 23 l5 5 M4 28 l3 -3" stroke-width="2.4" fill="currentColor"/>',
  guard: '<path d="M16 4 L27 8 V16 C27 22 22 27 16 29 C10 27 5 22 5 16 V8 Z" fill="currentColor"/>',
  heal: '<path d="M16 28 C6 20 3 15 3 10 C3 6 6 4 9 4 C12 4 14 6 16 9 C18 6 20 4 23 4 C26 4 29 6 29 10 C29 15 26 20 16 28 Z" fill="currentColor"/>',
  zap: '<path d="M18 3 L7 18 H15 L13 29 L25 13 H17 Z" fill="currentColor"/>',
  focus: '<path d="M7 11 H22 V21 C22 25 19 27 15 27 H14 C10 27 7 25 7 21 Z M22 13 H25 C27 13 27 19 25 19 H22" fill="currentColor"/><path d="M11 4 C10 6 13 7 12 9 M16 4 C15 6 18 7 17 9" stroke-width="1.6" fill="none"/>',
};

const CARD_INFO = {
  slash: { name: 'Slash', color: '#d2493f', text: (s) => `Deal ${s.slash}` },
  guard: { name: 'Guard', color: '#4a6fa5', text: (s) => `Block ${s.guard}` },
  heal: { name: 'Snack', color: '#e5658f', text: (s) => `Heal ${s.heal}` },
  zap: { name: 'Zap', color: '#c99a1c', text: (s) => `Deal ${s.zap}` },
  focus: { name: 'Boba', color: '#6b4f9a', text: () => '+2 energy' },
};

const ENEMIES = [
  { name: 'Glitch Slime', hp: 24, art: 'slime', pattern: [{ atk: 5 }, { atk: 7 }, { block: 5 }] },
  { name: 'Lag Gremlin', hp: 32, art: 'gremlin', pattern: [{ atk: 4, times: 2 }, { atk: 9 }, { buff: 2 }] },
  { name: 'Pop-up Wraith', hp: 40, art: 'wraith', pattern: [{ atk: 8 }, { block: 8 }, { atk: 5, times: 2 }, { buff: 2 }] },
  { name: 'The Firewall', hp: 62, art: 'boss', boss: true, pattern: [{ block: 10 }, { atk: 12 }, { atk: 5, times: 3 }, { buff: 3 }] },
];

const REWARDS = [
  { id: 'sharpen', name: 'Sharpen', desc: 'Slash deals +3', apply: (s) => { s.slash += 3; } },
  { id: 'hoodie', name: 'Thick Hoodie', desc: 'Guard blocks +3', apply: (s) => { s.guard += 3; } },
  { id: 'coffee', name: 'Iced Americano', desc: '+1 energy every turn', apply: (s) => { s.energyMax += 1; } },
  { id: 'kimbap', name: 'Kimbap', desc: '+8 max HP, heal 8', apply: (s) => { s.maxHp += 8; s.hp = Math.min(s.maxHp, s.hp + 8); } },
  { id: 'peek', name: 'Lucky Peek', desc: 'See every card for a moment on each new board', apply: (s) => { s.peek += 1; } },
  { id: 'zapper', name: 'Static Socks', desc: 'Zap deals +5', apply: (s) => { s.zap += 5; } },
  { id: 'lunch', name: 'Convenience-store lunch', desc: 'Snack heals +3', apply: (s) => { s.heal += 3; } },
];

const BEST_KEY = 'jw.spire.best';

function enemySVG(kind) {
  const ink = '#1f2126';
  const eyes = `<circle cx="42" cy="52" r="5" fill="${ink}"/><circle cx="62" cy="52" r="5" fill="${ink}"/><circle cx="44" cy="50" r="1.6" fill="#fff"/><circle cx="64" cy="50" r="1.6" fill="#fff"/>`;
  switch (kind) {
    case 'slime':
      return `<svg viewBox="0 0 104 90"><path d="M10 80 C8 50 26 20 52 20 C78 20 96 50 94 80 Z" fill="#7de0d3" stroke="${ink}" stroke-width="4"/><rect x="66" y="30" width="10" height="6" fill="#c7a6ff"/><rect x="24" y="58" width="8" height="5" fill="#f3a6bd"/>${eyes}<path d="M44 64 q8 6 16 0" stroke="${ink}" stroke-width="3" fill="none"/></svg>`;
    case 'gremlin':
      return `<svg viewBox="0 0 104 90"><path d="M20 30 L12 8 L34 22 Z M84 30 L92 8 L70 22 Z" fill="#9fc46a" stroke="${ink}" stroke-width="4"/><ellipse cx="52" cy="54" rx="38" ry="32" fill="#9fc46a" stroke="${ink}" stroke-width="4"/>${eyes}<path d="M40 68 l6 -5 l6 5 l6 -5 l6 5" stroke="${ink}" stroke-width="3" fill="none"/><circle cx="80" cy="24" r="9" fill="none" stroke="${ink}" stroke-width="3" stroke-dasharray="4 4"/></svg>`;
    case 'wraith':
      return `<svg viewBox="0 0 104 90"><path d="M18 84 V34 C18 16 32 8 52 8 C72 8 86 16 86 34 V84 L76 76 L66 84 L56 76 L46 84 L36 76 L26 84 Z" fill="#eef0f6" stroke="${ink}" stroke-width="4"/><rect x="24" y="18" width="56" height="10" fill="#4a6fa5" stroke="${ink}" stroke-width="2"/><text x="72" y="27" font-size="9" fill="#fff" font-family="sans-serif">x</text>${eyes}<ellipse cx="52" cy="66" rx="6" ry="8" fill="${ink}"/></svg>`;
    default:
      return `<svg viewBox="0 0 104 90"><rect x="8" y="14" width="88" height="72" fill="#d2493f" stroke="${ink}" stroke-width="4"/>${[0, 1, 2, 3].map((r) => `<line x1="8" x2="96" y1="${32 + r * 18}" y2="${32 + r * 18}" stroke="${ink}" stroke-width="3"/>`).join('')}${[0, 1, 2, 3, 4].map((c) => `<line x1="${22 + c * 18 + ((c % 2) * 6)}" x2="${22 + c * 18 + ((c % 2) * 6)}" y1="14" y2="32" stroke="${ink}" stroke-width="3"/>`).join('')}<path d="M30 6 L36 14 M52 2 V14 M74 6 L68 14" stroke="#f2c94c" stroke-width="4"/>${eyes.replace(/cy="5[02]"/g, 'cy="56"')}<path d="M38 72 h28" stroke="${ink}" stroke-width="4"/></svg>`;
  }
}

function intentLabel(it, strength) {
  if (it.atk) return `<span class="sm-intent atk">⚔ ${it.atk + strength}${it.times ? ` × ${it.times}` : ''}</span>`;
  if (it.block) return `<span class="sm-intent def">⛨ Block ${it.block}</span>`;
  return `<span class="sm-intent buff">▲ Power up</span>`;
}

export class SpireMatch {
  constructor(root, { onClose }) {
    this.root = root;
    this.onClose = onClose;
    this.root.innerHTML = `
      <div class="sm-wrap" role="dialog" aria-label="Spire Match card game">
        <header class="sm-top">
          <div class="sm-title">SPIRE MATCH <small>floor <b data-floor>1</b>/4</small></div>
          <button class="tile-btn sm-close" data-close aria-label="Leave the net cafe">✕</button>
        </header>
        <section class="sm-arena">
          <div class="sm-fighter sm-you">
            <div class="sm-name">Jenny</div>
            <div class="sm-bar"><i data-hpbar></i><span data-hp></span></div>
            <div class="sm-block" data-block hidden></div>
          </div>
          <div class="sm-fighter sm-enemy">
            <div data-intent></div>
            <div class="sm-art" data-art></div>
            <div class="sm-name" data-ename></div>
            <div class="sm-bar enemy"><i data-ehpbar></i><span data-ehp></span></div>
            <div class="sm-block" data-eblock hidden></div>
          </div>
        </section>
        <div class="sm-board" data-board></div>
        <footer class="sm-bottom">
          <div class="sm-energy" data-energy aria-label="Energy"></div>
          <div class="sm-log" data-log aria-live="polite"></div>
          <button class="tile-btn wide" data-end>End turn</button>
        </footer>
        <div class="sm-modal" data-modal hidden></div>
      </div>`;
    this.$ = (s) => this.root.querySelector(s);
    this.$('[data-close]').addEventListener('click', () => this.onClose());
    this.$('[data-end]').addEventListener('click', () => this.endTurn());
  }

  open() {
    this.root.hidden = false;
    if (!this.state || this.state.over) this.newRun();
    else this.render();
    this.$('[data-close]').focus();
  }
  close() { this.root.hidden = true; }

  newRun() {
    this.state = {
      hp: 40, maxHp: 40, block: 0, energy: 3, energyMax: 3,
      slash: 6, guard: 6, heal: 4, zap: 10, peek: 0,
      floor: 0, over: false,
    };
    this.startFight();
  }

  startFight() {
    const e = ENEMIES[this.state.floor];
    this.enemy = { ...e, hp: e.hp, maxHp: e.hp, block: 0, strength: 0, step: 0 };
    this.$('[data-art]').innerHTML = enemySVG(e.art);
    this.$('[data-ename]').textContent = e.name;
    this.state.block = 0;
    this.state.energy = this.state.energyMax;
    this.log(`A wild ${e.name} appears!`);
    this.dealBoard();
  }

  dealBoard() {
    const kinds = ['slash', 'slash', 'slash', 'guard', 'guard', 'heal', 'zap', 'focus'];
    const deck = [...kinds, ...kinds].sort(() => Math.random() - 0.5);
    this.cards = deck.map((kind, i) => ({ id: i, kind, up: false, gone: false }));
    this.open1 = null;
    this.busy = false;
    this.$('[data-board]').innerHTML = '';
    this.render();
    if (this.state.peek > 0) {
      this.busy = true;
      this.cards.forEach((c) => (c.up = true));
      this.render();
      setTimeout(() => { this.cards.forEach((c) => (c.up = false)); this.busy = false; this.render(); }, 700 + this.state.peek * 500);
    }
  }

  log(msg) { this.$('[data-log]').textContent = msg; }

  flip(card) {
    if (this.busy || card.up || card.gone || this.state.over) return;
    if (!this.open1 && this.state.energy <= 0) { this.log('Out of energy. End your turn.'); return; }
    card.up = true;
    if (!this.open1) {
      this.open1 = card;
      this.state.energy -= 1;
      this.render();
      return;
    }
    const a = this.open1, b = card;
    this.open1 = null;
    this.render();
    if (a.kind === b.kind) {
      this.busy = true;
      setTimeout(() => {
        a.gone = b.gone = true;
        this.play(a.kind);
        this.busy = false;
        this.afterAction();
      }, 380);
    } else {
      this.busy = true;
      this.log('No match…');
      setTimeout(() => {
        a.up = b.up = false;
        this.busy = false;
        this.afterAction();
      }, 750);
    }
  }

  play(kind) {
    const s = this.state, e = this.enemy;
    const hit = (n) => {
      const absorbed = Math.min(e.block, n);
      e.block -= absorbed;
      e.hp = Math.max(0, e.hp - (n - absorbed));
      this.shake('.sm-enemy');
    };
    if (kind === 'slash') { hit(s.slash); this.log(`Slash! ${s.slash} damage.`); }
    if (kind === 'zap') { hit(s.zap); this.log(`Zap! ${s.zap} damage.`); }
    if (kind === 'guard') { s.block += s.guard; this.log(`Guard up: ${s.guard} block.`); }
    if (kind === 'heal') { s.hp = Math.min(s.maxHp, s.hp + s.heal); this.log(`Snack break: +${s.heal} HP.`); }
    if (kind === 'focus') { s.energy += 2; this.log('Boba boost: +2 energy.'); }
  }

  afterAction() {
    if (this.enemy.hp <= 0) return this.win();
    if (this.cards.every((c) => c.gone)) { this.log('Board cleared! Reshuffling…'); setTimeout(() => this.dealBoard(), 500); }
    if (this.state.energy <= 0 && !this.open1) setTimeout(() => this.endTurn(), 450);
    this.render();
  }

  endTurn() {
    if (this.busy || this.state.over || this.enemy.hp <= 0) return;
    if (this.open1) { this.open1.up = false; this.open1 = null; }
    const s = this.state, e = this.enemy;
    const it = e.pattern[e.step % e.pattern.length];
    e.block = 0;
    if (it.atk) {
      const times = it.times || 1;
      let total = 0;
      for (let i = 0; i < times; i++) {
        const dmg = it.atk + e.strength;
        const absorbed = Math.min(s.block, dmg);
        s.block -= absorbed;
        s.hp = Math.max(0, s.hp - (dmg - absorbed));
        total += dmg - absorbed;
      }
      this.shake('.sm-you');
      this.log(`${e.name} attacks for ${total}!`);
    } else if (it.block) {
      e.block += it.block;
      this.log(`${e.name} raises ${it.block} block.`);
    } else if (it.buff) {
      e.strength += it.buff;
      this.log(`${e.name} powers up (+${it.buff} attack).`);
    }
    e.step++;
    if (s.hp <= 0) return this.lose();
    s.block = 0;
    s.energy = s.energyMax;
    this.render();
  }

  win() {
    const s = this.state;
    this.render();
    if (s.floor >= ENEMIES.length - 1) {
      s.over = true;
      this.saveBest(ENEMIES.length + 1);
      this.modal(`<h2>The Spire is cleared!</h2><p>Jenny beat The Firewall with ${s.hp} HP left.</p><button class="tile-btn wide yellow" data-again>Play again</button>`);
      return;
    }
    this.saveBest(s.floor + 2);
    const picks = [...REWARDS].sort(() => Math.random() - 0.5).slice(0, 3);
    this.modal(`<h2>${this.enemy.name} defeated!</h2><p>Pick an upgrade:</p><div class="sm-rewards">${picks
      .map((r) => `<button class="sm-reward" data-reward="${r.id}"><b>${r.name}</b><span>${r.desc}</span></button>`)
      .join('')}</div>`);
    this.root.querySelectorAll('[data-reward]').forEach((btn) =>
      btn.addEventListener('click', () => {
        REWARDS.find((r) => r.id === btn.dataset.reward).apply(s);
        s.floor += 1;
        this.modal(null);
        this.startFight();
      }),
    );
    this.root.querySelector('[data-reward]').focus();
  }

  lose() {
    this.state.over = true;
    this.render();
    const best = this.best();
    this.modal(`<h2>Knocked out on floor ${this.state.floor + 1}</h2><p>Best so far: floor ${Math.min(best, 4)}${best > 4 ? ' (cleared!)' : ''}.</p><button class="tile-btn wide yellow" data-again>Try again</button>`);
  }

  best() { return Number(localStorage.getItem(BEST_KEY) || 1); }
  saveBest(f) { if (f > this.best()) localStorage.setItem(BEST_KEY, String(f)); }

  modal(html) {
    const m = this.$('[data-modal]');
    if (!html) { m.hidden = true; m.innerHTML = ''; return; }
    m.innerHTML = `<div class="sm-modal-card">${html}</div>`;
    m.hidden = false;
    const again = m.querySelector('[data-again]');
    if (again) { again.addEventListener('click', () => { this.modal(null); this.newRun(); }); again.focus(); }
  }

  shake(sel) {
    const el = this.root.querySelector(sel);
    el.classList.remove('hit');
    void el.offsetWidth;
    el.classList.add('hit');
  }

  render() {
    const s = this.state, e = this.enemy;
    this.$('[data-floor]').textContent = s.floor + 1;
    this.$('[data-hp]').textContent = `${s.hp}/${s.maxHp}`;
    this.$('[data-hpbar]').style.width = `${(s.hp / s.maxHp) * 100}%`;
    this.$('[data-ehp]').textContent = `${e.hp}/${e.maxHp}`;
    this.$('[data-ehpbar]').style.width = `${(e.hp / e.maxHp) * 100}%`;
    const blk = this.$('[data-block]');
    blk.hidden = !s.block; blk.textContent = `⛨ ${s.block}`;
    const eblk = this.$('[data-eblock]');
    eblk.hidden = !e.block; eblk.textContent = `⛨ ${e.block}`;
    this.$('[data-intent]').innerHTML = e.hp > 0 ? intentLabel(e.pattern[e.step % e.pattern.length], e.strength) : '';
    this.$('[data-energy]').innerHTML = `<b>${s.energy}</b><span>energy</span>`;

    const board = this.$('[data-board]');
    if (board.children.length !== this.cards.length) {
      board.innerHTML = '';
      this.cards.forEach((c) => {
        const btn = document.createElement('button');
        btn.className = 'sm-card';
        btn.addEventListener('click', () => this.flip(this.cards[c.id]));
        board.appendChild(btn);
      });
    }
    this.cards.forEach((c, i) => {
      const btn = board.children[i];
      const info = CARD_INFO[c.kind];
      btn.classList.toggle('up', c.up);
      btn.classList.toggle('gone', c.gone);
      btn.disabled = c.gone;
      btn.setAttribute('aria-label', c.up || c.gone ? `${info.name}: ${info.text(s)}` : `Face-down card ${i + 1}`);
      const key = `${c.kind}|${info.text(s)}`;
      if (btn.dataset.key === key) return;
      btn.dataset.key = key;
      btn.innerHTML = `<span class="face back"><svg viewBox="0 0 32 32"><path d="M20 6 a10 10 0 1 0 6 16 a8 8 0 1 1 -6 -16z" fill="currentColor"/></svg></span>
        <span class="face front" style="--c:${info.color}"><svg viewBox="0 0 32 32" stroke="currentColor">${ICONS[c.kind]}</svg><b>${info.name}</b><small>${info.text(s)}</small></span>`;
    });
  }
}
