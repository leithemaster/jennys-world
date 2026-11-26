// Enemies of the Net Café Tower. Intents:
//   atk n [times] | block n | atkBlock n b | buff n (strength) | debuff weak/vuln
//   status card count | atkStatus n card count | scramble | heal n
//   steal n coins (attack + take coins, returned if you win) | drain n (attack, heal what got through) | ban [n] (a card sits out this fight; with n, also attacks)
// ai: 'cycle' walks the move list in order; 'random' picks (never the same move 3x).

export const ENEMIES = {
  // ----- Floor 1 -----
  slime: { name: 'Glitch Slime', hp: [22, 26], art: 'slime', color: '#7de0d3', ai: 'cycle',
    moves: [{ t: 'atk', n: 6 }, { t: 'atk', n: 8 }, { t: 'block', n: 6 }] },
  gremlin: { name: 'Lag Gremlin', hp: [24, 28], art: 'gremlin', color: '#9fc46a', ai: 'random',
    moves: [{ t: 'atk', n: 4, times: 2 }, { t: 'atkStatus', n: 5, card: 'lag', count: 1 }, { t: 'buff', n: 2 }] },
  popup: { name: 'Pop-up Wraith', hp: [20, 24], art: 'wraith', color: '#eef0f6', ai: 'random',
    moves: [{ t: 'atk', n: 7 }, { t: 'debuff', weak: 2 }, { t: 'atk', n: 3, times: 3 }] },
  spambot: { name: 'Spam Bot', hp: [26, 30], art: 'bot', color: '#f3a6bd', ai: 'cycle',
    moves: [{ t: 'status', card: 'spam', count: 2 }, { t: 'atk', n: 9 }, { t: 'atkBlock', n: 5, b: 5 }] },
  cookie: { name: 'Cookie Crumbler', hp: [28, 32], art: 'cookie', color: '#d6ab7b', ai: 'random',
    moves: [{ t: 'atk', n: 10 }, { t: 'heal', n: 6 }, { t: 'atk', n: 5, times: 2 }] },
  // elites
  captcha: { name: 'Captcha Golem', hp: [40, 44], art: 'golem', color: '#b9bdb3', ai: 'cycle', elite: true,
    moves: [{ t: 'atk', n: 11 }, { t: 'scramble' }, { t: 'block', n: 9 }, { t: 'atk', n: 5, times: 2 }] },
  adswarm: { name: 'Ad Swarm', hp: [36, 40], art: 'swarm', color: '#f2c94c', ai: 'cycle', elite: true,
    moves: [{ t: 'status', card: 'spam', count: 2 }, { t: 'atk', n: 3, times: 3 }, { t: 'buff', n: 1 }, { t: 'atk', n: 3, times: 3 }] },
  bouncer: { name: 'Café Bouncer', hp: [42, 46], art: 'knight', color: '#3d3a4a', ai: 'cycle', elite: true,
    moves: [{ t: 'block', n: 8 }, { t: 'atk', n: 9 }, { t: 'atkBlock', n: 6, b: 6 }, { t: 'atk', n: 13 }] },
  printer: { name: 'Paper Jam Printer', hp: [38, 42], art: 'bot', color: '#e8e2f2', ai: 'cycle', elite: true,
    moves: [{ t: 'status', card: 'lag', count: 2 }, { t: 'atk', n: 4, times: 2 }, { t: 'block', n: 10 }, { t: 'atk', n: 11 }] },
  clout: { name: 'Clout Chaser', hp: [36, 40], art: 'wraith', color: '#ff8fb0', ai: 'random', elite: true,
    moves: [{ t: 'debuff', vuln: 2 }, { t: 'atk', n: 6, times: 2 }, { t: 'buff', n: 2 }, { t: 'atk', n: 10 }] },
  // bosses (one per run is picked for each floor; the map shows which)
  firewall: { name: 'The Firewall', hp: [74, 74], art: 'wall', color: '#d2493f', ai: 'cycle', boss: true,
    moves: [{ t: 'block', n: 12 }, { t: 'atk', n: 12 }, { t: 'atk', n: 4, times: 3 }, { t: 'scramble' }, { t: 'buff', n: 2 }] },
  ramenThief: { name: 'The Ramen Thief', hp: [72, 72], art: 'ramen', color: '#3d3a4a', ai: 'cycle', boss: true,
    moves: [{ t: 'steal', n: 7, coins: 15 }, { t: 'atk', n: 4, times: 3 }, { t: 'atkBlock', n: 6, b: 8 }, { t: 'buff', n: 2 }, { t: 'atk', n: 14 }] },
  regular: { name: 'The Forever Regular', hp: [80, 80], art: 'regular', color: '#7a8c6b', ai: 'cycle', boss: true,
    moves: [{ t: 'debuff', weak: 2, vuln: 1 }, { t: 'atk', n: 9 }, { t: 'heal', n: 10 }, { t: 'status', card: 'spam', count: 2 }, { t: 'atk', n: 5, times: 3 }, { t: 'buff', n: 2 }] },

  // ----- Floor 2 -----
  moth: { name: 'Troll Moth', hp: [38, 42], art: 'moth', color: '#b8a3d9', ai: 'random',
    moves: [{ t: 'atk', n: 11 }, { t: 'debuff', weak: 2, vuln: 1 }, { t: 'atk', n: 4, times: 3 }] },
  hook: { name: 'Phish Hook', hp: [34, 38], art: 'hook', color: '#4a6fa5', ai: 'cycle',
    moves: [{ t: 'debuff', vuln: 2 }, { t: 'atk', n: 12 }, { t: 'atkStatus', n: 7, card: 'bug', count: 1 }] },
  buffer: { name: 'Buffer Wheel', hp: [40, 44], art: 'wheel', color: '#7de0d3', ai: 'cycle',
    moves: [{ t: 'block', n: 10 }, { t: 'buff', n: 3 }, { t: 'atk', n: 9 }, { t: 'scramble' }] },
  crab: { name: 'Clickbait Crab', hp: [42, 46], art: 'crab', color: '#ec8a3b', ai: 'random',
    moves: [{ t: 'atk', n: 7, times: 2 }, { t: 'atkBlock', n: 9, b: 8 }, { t: 'status', card: 'bug', count: 2 }] },
  // elites
  ransom: { name: 'Ransom Knight', hp: [62, 66], art: 'knight', color: '#6b4f9a', ai: 'cycle', elite: true,
    moves: [{ t: 'atkBlock', n: 12, b: 10 }, { t: 'status', card: 'lag', count: 2 }, { t: 'atk', n: 16 }, { t: 'buff', n: 2 }] },
  popstorm: { name: 'Notification Storm', hp: [56, 60], art: 'swarm', color: '#e5658f', ai: 'random', elite: true,
    moves: [{ t: 'atk', n: 3, times: 5 }, { t: 'scramble' }, { t: 'debuff', weak: 2, vuln: 2 }, { t: 'atkStatus', n: 8, card: 'spam', count: 2 }] },
  ddos: { name: 'DDoS Cloud', hp: [56, 60], art: 'swarm', color: '#8fa0b8', ai: 'cycle', elite: true,
    moves: [{ t: 'atk', n: 2, times: 6 }, { t: 'buff', n: 1 }, { t: 'atk', n: 2, times: 6 }, { t: 'status', card: 'lag', count: 2 }] },
  bitrot: { name: 'Bit Rot Beast', hp: [60, 64], art: 'crab', color: '#7d9a5a', ai: 'random', elite: true,
    moves: [{ t: 'atkStatus', n: 9, card: 'bug', count: 2 }, { t: 'heal', n: 10 }, { t: 'atk', n: 14 }, { t: 'debuff', weak: 2 }] },
  sysadmin: { name: 'Sys Admin', hp: [58, 62], art: 'mimic', color: '#4a6fa5', ai: 'cycle', elite: true,
    moves: [{ t: 'block', n: 14 }, { t: 'scramble' }, { t: 'atk', n: 15 }, { t: 'atkBlock', n: 10, b: 10 }] },
  // bosses
  hydra: { name: 'Server Hydra', hp: [150, 150], art: 'hydra', color: '#55834f', ai: 'cycle', boss: true,
    moves: [{ t: 'atk', n: 6, times: 3 }, { t: 'scramble' }, { t: 'atkStatus', n: 14, card: 'bug', count: 2 }, { t: 'block', n: 20 }, { t: 'buff', n: 4 }] },
  dataMiner: { name: 'The Data Miner', hp: [160, 160], art: 'dataminer', color: '#4a6fa5', ai: 'cycle', boss: true,
    moves: [{ t: 'drain', n: 14 }, { t: 'debuff', vuln: 2 }, { t: 'atk', n: 6, times: 3 }, { t: 'block', n: 18 }, { t: 'drain', n: 20 }, { t: 'buff', n: 3 }] },
  serverAdmins: { name: 'The Server Admins', hp: [165, 165], art: 'admins', color: '#5b6fc9', ai: 'cycle', boss: true,
    moves: [{ t: 'ban', n: 8 }, { t: 'atkBlock', n: 12, b: 12 }, { t: 'scramble' }, { t: 'atk', n: 10, times: 2 }, { t: 'buff', n: 4 }, { t: 'atk', n: 24 }] },

  // ----- Floor 3 -----
  mimic: { name: 'Deepfake Mimic', hp: [56, 60], art: 'mimic', color: '#c7a6ff', ai: 'random',
    moves: [{ t: 'atk', n: 15 }, { t: 'scramble' }, { t: 'atk', n: 6, times: 3 }, { t: 'debuff', vuln: 2 }] },
  fiend: { name: 'Overclock Fiend', hp: [52, 56], art: 'fiend', color: '#d2493f', ai: 'cycle',
    moves: [{ t: 'buff', n: 4 }, { t: 'atk', n: 8, times: 2 }, { t: 'atk', n: 18 }] },
  nullptr: { name: 'Null Pointer', hp: [58, 62], art: 'null', color: '#2a2830', ai: 'random',
    moves: [{ t: 'status', card: 'lag', count: 2 }, { t: 'atk', n: 16 }, { t: 'atkBlock', n: 10, b: 12 }] },
  // elites
  miner: { name: 'Crypto Miner', hp: [96, 100], art: 'golem', color: '#f2c94c', ai: 'cycle', elite: true,
    moves: [{ t: 'block', n: 18 }, { t: 'buff', n: 5 }, { t: 'atk', n: 10, times: 2 }, { t: 'atk', n: 25 }] },
  troll: { name: 'Comment Troll', hp: [90, 94], art: 'gremlin', color: '#7a2f3b', ai: 'random', elite: true,
    moves: [{ t: 'atkStatus', n: 12, card: 'bug', count: 2 }, { t: 'debuff', weak: 3, vuln: 2 }, { t: 'atk', n: 5, times: 5 }] },
  botnet: { name: 'Botnet Hive', hp: [92, 96], art: 'hydra', color: '#9a4f7a', ai: 'cycle', elite: true,
    moves: [{ t: 'atk', n: 4, times: 4 }, { t: 'status', card: 'spam', count: 3 }, { t: 'buff', n: 3 }, { t: 'atk', n: 4, times: 4 }] },
  streamer: { name: 'Rage Streamer', hp: [86, 90], art: 'fiend', color: '#ec8a3b', ai: 'cycle', elite: true,
    moves: [{ t: 'buff', n: 3 }, { t: 'atk', n: 7, times: 3 }, { t: 'debuff', weak: 2, vuln: 2 }, { t: 'atk', n: 22 }] },
  quantum: { name: 'Quantum Glitch', hp: [94, 98], art: 'null', color: '#a98bf0', ai: 'random', elite: true,
    moves: [{ t: 'scramble' }, { t: 'atk', n: 20 }, { t: 'block', n: 16 }, { t: 'atkStatus', n: 12, card: 'lag', count: 2 }] },
  // bosses
  moderator: { name: 'The Head Moderator', hp: [215, 215], art: 'moderator', color: '#c2417a', ai: 'cycle', boss: true,
    moves: [{ t: 'ban', n: 12 }, { t: 'atk', n: 14, times: 2 }, { t: 'debuff', weak: 2, vuln: 2 }, { t: 'ban', n: 12 }, { t: 'atk', n: 36 }, { t: 'buff', n: 5 }] },
  hivemind: { name: 'The Hive Mind', hp: [215, 215], art: 'hive', color: '#4f8a55', ai: 'cycle', boss: true,
    moves: [{ t: 'atk', n: 3, times: 6 }, { t: 'status', card: 'spam', count: 3 }, { t: 'buff', n: 3 }, { t: 'drain', n: 14 }, { t: 'scramble' }, { t: 'atk', n: 3, times: 8 }] },
  bluescreen: { name: 'The Blue Screen', hp: [210, 210], art: 'screen', color: '#3f7cc0', ai: 'cycle', boss: true,
    moves: [{ t: 'scramble' }, { t: 'atk', n: 10, times: 3 }, { t: 'status', card: 'lag', count: 3 }, { t: 'atk', n: 32 }, { t: 'block', n: 25 }, { t: 'buff', n: 5 }] },
};

export const ACTS = [
  { name: 'Floor 1 · Lobby', normals: ['slime', 'gremlin', 'popup', 'spambot', 'cookie'], elites: ['captcha', 'adswarm', 'bouncer', 'printer', 'clout'], bosses: ['firewall', 'ramenThief', 'regular'] },
  { name: 'Floor 2 · Server Room', normals: ['moth', 'hook', 'buffer', 'crab'], elites: ['ransom', 'popstorm', 'ddos', 'bitrot', 'sysadmin'], bosses: ['hydra', 'dataMiner', 'serverAdmins'] },
  { name: 'Floor 3 · The Rooftop', normals: ['mimic', 'fiend', 'nullptr'], elites: ['miner', 'troll', 'botnet', 'streamer', 'quantum'], bosses: ['bluescreen', 'moderator', 'hivemind'] },
];
