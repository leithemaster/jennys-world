// Playtest simulator: a bot plays full runs with the real game rules.
// The bot has human-ish memory: it remembers a card it saw with some chance,
// and forgets a bit each turn. Run:  node tools/sim.mjs [runsPerConfig]
//
// Simplified run: per floor 6 fights, 2 elites, 2 rests, then the boss.
// The bot takes the first card offered after each fight.

// ---- fake clock so battle timeouts resolve instantly ----
let now = 0;
let timers = [];
globalThis.setTimeout = (fn, ms = 0) => { timers.push({ t: now + ms, fn, id: Math.random() }); return 0; };
function flush() {
  let guard = 0;
  while (timers.length && guard++ < 10000) {
    timers.sort((a, b) => a.t - b.t);
    const next = timers.shift();
    now = next.t;
    next.fn();
  }
}
globalThis.localStorage = { getItem: () => null, setItem: () => {}, removeItem: () => {} };

const { Battle, RULES } = await import('../src/game/battle.js');
const { newRun, gainCharm, afterFightHealing, enemyFor, cardChoices } = await import('../src/game/run.js');
const { drawCharm } = await import('../src/game/loot.js');
const { CHARMS } = await import('../src/game/charms.js');
const { canUpgrade } = await import('../src/game/cards.js');

const SKILLS = {
  casual: { recall: 0.6, forget: 0.2 },
  sharp: { recall: 0.85, forget: 0.06 },
};

function fight(run, enemyId, skill, stats) {
  let result = null;
  let memory = new Map(); // slot index -> key
  let boardRef = null;
  const b = new Battle(run, enemyId, {
    end: (r) => { result = r; },
    scramble: () => { memory = new Map(); },
    turn: () => { for (const k of [...memory.keys()]) if (Math.random() < skill.forget) memory.delete(k); },
  });
  b.start();
  flush();
  const hpBefore = run.hp;
  let actions = 0;
  const see = (s) => { if (Math.random() < skill.recall) memory.set(s.i, b.keyOf(s.card)); };
  const flip = (s) => { b.flip(s.i); see(s); flush(); };

  while (!result && actions++ < 3000) {
    if (b.board !== boardRef) { boardRef = b.board; memory = new Map(); }
    if (b.energy <= 0 && !b.first) { b.endTurn(); flush(); continue; }
    const live = b.board.filter((s) => s.state !== 'gone' && s.state !== 'up');
    if (!live.length) { flush(); continue; }
    const known = (s) => (s.state === 'revealed' ? b.keyOf(s.card) : memory.get(s.i));
    // 1) a pair I already know
    const byKey = {};
    for (const s of live) { const k = known(s); if (k) (byKey[k] ||= []).push(s); }
    const pair = Object.values(byKey).find((g) => g.length >= 2);
    if (pair) {
      flip(pair[0]); if (result || b.board !== boardRef) continue;
      flip(pair[1]); stats.matches++; continue;
    }
    // 2) flip an unknown card, then look for its partner
    const unknown = live.filter((s) => !known(s));
    const first = unknown.length ? unknown[Math.floor(Math.random() * unknown.length)] : live[0];
    flip(first);
    if (result || b.board !== boardRef || !b.first) continue;
    const key = b.keyOf(first.card);
    const live2 = b.board.filter((s) => s !== first && s.state !== 'gone' && s.state !== 'up');
    const partner = live2.find((s) => known(s) === key);
    const missMatches = b.matchesThisTurn;
    if (partner) { flip(partner); stats.matches++; continue; }
    const unknown2 = live2.filter((s) => !known(s));
    const second = unknown2.length ? unknown2[Math.floor(Math.random() * unknown2.length)] : live2[0];
    if (!second) { b.endTurn(); flush(); continue; }
    const wasMatch = b.keyOf(second.card) === key;
    flip(second);
    if (wasMatch) stats.lucky++; else stats.misses++;
    void missMatches;
  }
  flush();
  stats.fights++;
  stats.turns += b.turn;
  stats.hpLost += Math.max(0, hpBefore - run.hp);
  return result === 'win';
}

function playRun(skill, stats) {
  const run = newRun();
  const gifts = Object.keys(CHARMS).filter((k) => CHARMS[k].pool === 'haru');
  gainCharm(run, gifts[Math.floor(Math.random() * gifts.length)]);
  run.giftPending = false;
  for (let act = 0; act < 3; act++) {
    run.act = act;
    const plan = ['fight', 'fight', 'event', 'fight', 'elite', 'rest', 'fight', 'fight', 'elite', 'fight', 'rest', 'boss'];
    for (const room of plan) {
      if (room === 'event') continue;
      if (room === 'rest') {
        if (run.hp < run.maxHp * 0.6) run.hp = Math.min(run.maxHp, run.hp + Math.round(run.maxHp * 0.3));
        else { const ups = run.deck.filter(canUpgrade); if (ups.length) ups[Math.floor(Math.random() * ups.length)].up = true; }
        continue;
      }
      const won = fight(run, enemyFor(run, room), skill, stats);
      if (!won) { stats.deaths[`${act}:${room}`] = (stats.deaths[`${act}:${room}`] || 0) + 1; return act; }
      afterFightHealing(run);
      const offer = cardChoices(run, room);
      if (offer[0]) run.deck.push(offer[0]);
      if (room === 'elite') gainCharm(run, drawCharm(run, 'drop'));
      if (room === 'boss') {
        gainCharm(run, drawCharm(run, 'boss'));
        stats.bossKills[act]++;
        run.hp += Math.round((run.maxHp - run.hp) * 0.75);
      }
    }
  }
  return 3;
}

const N = Number(process.argv[2] || 300);
const rows = [];
// default: compare free reveals 0/1/2. `node tools/sim.mjs 200 pairs` compares board sizes instead.
const PAIRS_MODE = process.argv[3] === 'pairs';
const setups = PAIRS_MODE ? [{ free: 2, pairs: 8 }, { free: 2, pairs: 9 }, { free: 3, pairs: 9 }] : [0, 1, 2].map((f) => ({ free: f, pairs: RULES.boardPairs }));
for (const { free, pairs } of setups) {
  for (const [skillName, skill] of Object.entries(SKILLS)) {
    RULES.freeReveal = free;
    RULES.boardPairs = pairs;
    const stats = { fights: 0, turns: 0, hpLost: 0, matches: 0, misses: 0, lucky: 0, deaths: {}, bossKills: [0, 0, 0] };
    let wins = 0;
    for (let i = 0; i < N; i++) if (playRun(skill, stats) === 3) wins++;
    rows.push({
      ...(PAIRS_MODE ? { 'board cards': pairs * 2, free } : { free }), skill: skillName,
      'beat boss 1': `${Math.round((stats.bossKills[0] / N) * 100)}%`,
      'beat boss 2': `${Math.round((stats.bossKills[1] / N) * 100)}%`,
      'win run': `${Math.round((wins / N) * 100)}%`,
      'turns/fight': (stats.turns / stats.fights).toFixed(2),
      'hp lost/fight': (stats.hpLost / stats.fights).toFixed(1),
      'miss rate': `${Math.round((stats.misses / (stats.misses + stats.matches + stats.lucky)) * 100)}%`,
    });
  }
}
console.table(rows);

// where runs end (free reveals = 2, sharp player)
if (process.argv[3] === 'deaths') {
  RULES.freeReveal = Number(process.argv[4] || 2);
  const stats = { fights: 0, turns: 0, hpLost: 0, matches: 0, misses: 0, lucky: 0, deaths: {}, bossKills: [0, 0, 0] };
  for (let i = 0; i < N; i++) playRun(SKILLS.sharp, stats);
  console.log('deaths by floor:room', Object.entries(stats.deaths).sort((a, b) => b[1] - a[1]));
}
