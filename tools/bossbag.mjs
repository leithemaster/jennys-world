// Compares each boss's move bag with its old fixed loop, without a player.
// Spirit (buff) adds to every hit. Run: node tools/bossbag.mjs [fights] [oldEnemiesFile]
const N = Number(process.argv[2] || 20000);
const { Battle, moveDamage } = await import('../src/game/battle.js');
const { ENEMIES, ACTS } = await import('../src/game/enemies.js');
const OLD = process.argv[3] ? (await import(new URL(`file:///${process.argv[3]}`))).ENEMIES : null;
const TURNS = 10;

function seq(def) {
  const fake = { def, enemy: { step: 0, bag: null }, intent: null };
  const out = [];
  for (let t = 0; t < TURNS; t++) {
    let m;
    if (def.ai === 'bag') m = def.moves[Battle.prototype.drawMarble.call(fake)];
    else m = def.moves[t % def.moves.length];
    fake.intent = m; fake.enemy.step++;
    out.push(m);
  }
  return out;
}
function stats(def) {
  let dmg = 0, worst3 = [], streak3 = 0, first = 0, atkT = 0;
  for (let i = 0; i < N; i++) {
    const s = seq(def);
    let str = 0, run = 0, hit3 = false;
    const per = s.map((m) => { const d = moveDamage(m) ? moveDamage(m) + str * (m.times || 1) : 0; if (m.t === 'buff') str += m.n; return d; });
    s.forEach((m) => { run = moveDamage(m) ? run + 1 : 0; if (run >= 3) hit3 = true; });
    dmg += per.reduce((a, b) => a + b, 0) / TURNS;
    first += per[0]; atkT += per.filter(Boolean).length / TURNS;
    let w = 0; for (let t = 0; t + 3 <= TURNS; t++) w = Math.max(w, per[t] + per[t + 1] + per[t + 2]);
    worst3.push(w); if (hit3) streak3++;
  }
  worst3.sort((a, b) => a - b);
  return { 'dmg/turn': (dmg / N).toFixed(1), 'attack turns': `${Math.round((atkT / N) * 100)}%`, 'turn 1 dmg': (first / N).toFixed(1),
    'worst 3 turns (typical)': worst3[Math.floor(N * 0.5)], 'worst 3 turns (unlucky 5%)': worst3[Math.floor(N * 0.95)], '3 attacks in a row': `${Math.round((streak3 / N) * 100)}%` };
}
const rows = [];
for (const a of ACTS) for (const id of a.bosses) {
  if (OLD) rows.push({ boss: ENEMIES[id].name, how: 'loop', ...stats(OLD[id]) });
  rows.push({ boss: ENEMIES[id].name, how: 'bag', ...stats(ENEMIES[id]) });
}
console.table(rows);
