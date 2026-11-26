// Playtest simulator: a bot plays full runs with the real game rules.
// The bot has human-ish memory: it remembers a card it saw with some chance,
// and forgets a bit each turn. Run:  node tools/sim.mjs [runsPerConfig]
//
// Simplified run: per floor 6 fights, 2 elites, 2 rests, then the boss.
// The bot takes the first card offered after each fight, or with a target
// style, the first offered card of that style.
//
//   node tools/sim.mjs 200            free-reveal comparison (Jenny)
//   node tools/sim.mjs 200 chars      Jenny vs Toni (and Jenny with no passive)
//   node tools/sim.mjs 200 styles     every character x every card style
//   node tools/sim.mjs 200 deaths     where runs end
//   node tools/sim.mjs 200 bosses     win rate against each boss (of the runs that reach it)
//   node tools/sim.mjs 200 snacks     with and without snacks
//   node tools/sim.mjs 200 boons      each style with and without its special-event boon

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
const { drawCharm, drawSpecialEvent, rollSnackDrop } = await import('../src/game/loot.js');
const { SNACKS, addSnack, removeSnack } = await import('../src/game/snacks.js');
const { CHARMS } = await import('../src/game/charms.js');
const { canUpgrade, CARDS, ARCHES } = await import('../src/game/cards.js');
const { CHARACTERS } = await import('../src/game/characters.js');

const SKILLS = {
  casual: { recall: 0.6, forget: 0.2 },
  sharp: { recall: 0.85, forget: 0.06 },
};

function fight(run, enemyId, skill, stats, kind = 'fight') {
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

  let snackTurn = 0;
  while (!result && actions++ < 3000) {
    if (b.board !== boardRef) { boardRef = b.board; memory = new Map(); }
    // Snacks: one per turn in elite/boss fights; heal snacks only when low.
    if (b.turn !== snackTurn && !b.busy && !b.first) {
      snackTurn = b.turn;
      const low = run.hp < run.maxHp * 0.45;
      const slot = run.snacks.findIndex((id) => id && (SNACKS[id].anytime || SNACKS[id].desc.startsWith('Heal') ? low : kind !== 'fight' || low));
      if (slot >= 0) { const id = run.snacks[slot]; if (b.useSnack(id)) { removeSnack(run, slot); stats.snacks = (stats.snacks || 0) + 1; flush(); if (result) break; } }
    }
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

function playRun(skill, stats, opts = {}) {
  const run = newRun(opts.character || 'jenny');
  stats.runBoons = 0;
  let gifts = Object.keys(CHARMS).filter((k) => CHARMS[k].pool === 'haru');
  if (opts.style) { const g = gifts.filter((k) => CHARMS[k].style === opts.style); if (g.length) gifts = g; }
  gainCharm(run, gifts[Math.floor(Math.random() * gifts.length)]);
  run.giftPending = false;
  for (let act = 0; act < 3; act++) {
    run.act = act;
    const plan = ['fight', 'fight', 'event', 'fight', 'elite', 'rest', 'fight', 'fight', 'elite', 'fight', 'rest', 'boss'];
    for (const room of plan) {
      if (room === 'event') { if (opts.boon && (stats.runBoons || 0) < (opts.cap || 9)) { const sp = drawSpecialEvent(run); if (sp && sp.boon) { gainCharm(run, sp.boon); stats.boons = (stats.boons || 0) + 1; stats.runBoons = (stats.runBoons || 0) + 1; } } continue; }
      if (room === 'rest') {
        if (run.hp < run.maxHp * 0.6) run.hp = Math.min(run.maxHp, run.hp + Math.round(run.maxHp * 0.3));
        else { const ups = run.deck.filter(canUpgrade); if (ups.length) ups[Math.floor(Math.random() * ups.length)].up = true; }
        continue;
      }
      const foe = enemyFor(run, room);
      const won = fight(run, foe, skill, stats, room);
      if (room === 'boss') { const bs = (stats.bossRes ||= {})[foe] ||= [0, 0]; bs[0]++; if (won) bs[1]++; }
      if (!won) { stats.deaths[`${act}:${room}`] = (stats.deaths[`${act}:${room}`] || 0) + 1; return act; }
      afterFightHealing(run);
      if (!opts.noSnacks) { const sn = rollSnackDrop(run, room); if (sn) addSnack(run, sn); }
      const offer = cardChoices(run, room);
      const pick = (opts.style && offer.find((c) => CARDS[c.id].arch === opts.style || CARDS[c.id].arch2 === opts.style)) || (opts.style ? null : offer[0]);
      if (pick) run.deck.push(pick);
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
const MODE = process.argv[3];
const newStats = () => ({ fights: 0, turns: 0, hpLost: 0, matches: 0, misses: 0, lucky: 0, deaths: {}, bossKills: [0, 0, 0] });
function summarize(stats, wins, extra) {
  return {
    ...extra,
    'beat boss 1': `${Math.round((stats.bossKills[0] / N) * 100)}%`,
    'beat boss 2': `${Math.round((stats.bossKills[1] / N) * 100)}%`,
    'win run': `${Math.round((wins / N) * 100)}%`,
    'turns/fight': (stats.turns / stats.fights).toFixed(2),
    'hp lost/fight': (stats.hpLost / stats.fights).toFixed(1),
  };
}
function batch(skill, opts) {
  const stats = newStats();
  let wins = 0;
  for (let i = 0; i < N; i++) if (playRun(skill, stats, opts) === 3) wins++;
  return { stats, wins };
}
if (MODE === 'bosses') {
  const { ENEMIES, ACTS } = await import('../src/game/enemies.js');
  const res = {};
  for (const character of Object.keys(CHARACTERS)) {
    const { stats } = batch(SKILLS.sharp, { character });
    for (const [id, [f, w]] of Object.entries(stats.bossRes || {})) { const r = (res[id] ||= [0, 0]); r[0] += f; r[1] += w; }
  }
  console.table(ACTS.flatMap((a, i) => a.bosses.map((id) => ({ floor: i + 1, boss: ENEMIES[id].name, fights: res[id]?.[0] || 0, 'beaten': res[id] ? `${Math.round((res[id][1] / res[id][0]) * 100)}%` : '-' }))));
  process.exit(0);
}
if (MODE === 'snacks') {
  const out = [];
  for (const character of Object.keys(CHARACTERS)) for (const [skillName, skill] of Object.entries(SKILLS)) for (const noSnacks of [true, false]) {
    const { stats, wins } = batch(skill, { character, noSnacks });
    out.push(summarize(stats, wins, { setup: `${character} ${noSnacks ? 'no snacks' : 'snacks'}`, skill: skillName, 'snacks/run': ((stats.snacks || 0) / N).toFixed(1) }));
  }
  console.table(out);
  process.exit(0);
}
if (MODE === 'boons') {
  const out = [];
  for (const style of Object.keys(ARCHES)) for (const boon of [false, true]) {
    const { stats, wins } = batch(SKILLS.sharp, { character: 'jenny', style, boon, cap: Number(process.argv[4] || 9) });
    out.push(summarize(stats, wins, { setup: `${style}${boon ? ' + boon' : ''}`, 'boons/run': ((stats.boons || 0) / N).toFixed(2) }));
  }
  console.table(out);
  process.exit(0);
}
if (MODE === 'chars' || MODE === 'styles') {
  const out = [];
  const jennyN = CHARACTERS.jenny.passive.n;
  const setups = MODE === 'chars'
    ? [{ label: 'jenny (no passive)', character: 'jenny', noPassive: true }, ...Object.keys(CHARACTERS).map((c) => ({ label: c, character: c }))]
    : Object.keys(CHARACTERS).flatMap((c) => [null, ...Object.keys(ARCHES)].map((style) => ({ label: `${c} · ${style || 'any'}`, character: c, style })));
  for (const s of setups) {
    for (const [skillName, skill] of Object.entries(SKILLS)) {
      CHARACTERS.jenny.passive.n = s.noPassive ? 0 : jennyN;
      const { stats, wins } = batch(skill, s);
      out.push(summarize(stats, wins, { setup: s.label, skill: skillName }));
    }
  }
  CHARACTERS.jenny.passive.n = jennyN;
  console.table(out);
  process.exit(0);
}
const rows = [];
// default: compare free reveals 0/1/2. `node tools/sim.mjs 200 pairs` compares board sizes instead.
const PAIRS_MODE = process.argv[3] === 'pairs';
const setups = PAIRS_MODE ? (process.env.PAIRS ? JSON.parse(process.env.PAIRS) : [{ free: [4, 4, 4], pairs: [10, 10, 10] }, { free: [3, 3, 4], pairs: [8, 9, 10] }, { free: [3, 4, 4], pairs: [8, 9, 10] }]) : [0, 1, 2].map((f) => ({ free: f, pairs: RULES.boardPairs }));
for (const { free, pairs } of setups) {
  for (const [skillName, skill] of Object.entries(SKILLS)) {
    RULES.freeReveal = free;
    RULES.boardPairs = pairs;
    const stats = { fights: 0, turns: 0, hpLost: 0, matches: 0, misses: 0, lucky: 0, deaths: {}, bossKills: [0, 0, 0] };
    let wins = 0;
    for (let i = 0; i < N; i++) if (playRun(skill, stats) === 3) wins++;
    rows.push({
      ...(PAIRS_MODE ? { 'board pairs': String(pairs), free: String(free) } : { free }), skill: skillName,
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
