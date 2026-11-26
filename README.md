# Kioku Tower

A memory card battler made for my sister. Part of Jenny's World.

**Play:** https://leithemaster.github.io/jennys-world/

## How it works

- Every card in your deck shows up **twice**, face down. Flip two: if they match, that card is played.
- Flipping a pair costs **1 energy**. You get 3 a turn; when you run out, the enemy acts on the intent shown in its bubble.
- Unmatched cards **stay where they are** between turns, so memory pays off. Clearing the whole board gives +1 energy and a fresh board.
- The board **grows as you climb**: **16 cards** (8 pairs, 4×4) on Floor 1, **18** (9 pairs, 6×3) on Floor 2 and **20** (10 pairs, 5×4) on Floor 3. Every new board starts with **3 / 3 / 4 cards revealed** for free.
- **Combo:** matches in a row add +2 damage to attacks. A miss resets it.
- Some enemies **scramble** the board or slip junk cards (Bug, Lag, Spam) into your deck.

## The run

Climb three floors of the Net Café Tower (Lobby, Server Room, Rooftop), each ending in one of 3 bosses (picked per run and shown on the map). Some bosses steal coins (you get them back if you win), drain HP or ban a card for the fight. Bosses don't repeat a fixed pattern: each one draws its moves from a bag of 10 marbles (no repeats until the bag is empty, never its biggest hit first, never 3 attacks in a row while it has anything else, plus combos like "after a Spirit boost, usually an attack"). The marbles under the boss show what's left. On the map pick fights, elites, "?" events, shops, rest booths and treasure. Build your deck from 55+ cards, collect 40+ charms, and upgrade or remove cards along the way. Runs are saved in the browser so you can continue later, and a separate progress save remembers stats, unlocks and everything you've found (see `docs/save-format.md`).

**Kioku Catalog:** a button on the main menu opens the in-game catalog: characters, outfits, cards, charms, enemies, bosses, events, styles and rules, with the in-game art. Anything not found or unlocked yet is greyed out with its name hidden. It's built by `src/ui/catalogData.js` straight from the game files, so new content shows up there on its own.

The full list of characters, cards and charms is in **[docs/catalog.md](docs/catalog.md)**. There's also a visual catalog page with the in-game art (`tools/catalog-page/`, published as a private artifact). Both are generated from the game files: run `npm run catalog` after changing cards, charms, enemies, characters or outfits, then republish `tools/catalog-page/index.html` with its `data.json`.

## Characters

Pick who climbs at the start of each run. Every card style is open to every character; a character only changes max HP, the starting deck and one passive (all in `src/game/characters.js`).

- **Jenny** (55 HP): *Sticker Book*, every 8th match in a fight gives a cute sticker (Star, Bow, Heart, Bunny or Bolt). The stickers come from a shuffled deck and the next one is shown, so it's never a surprise. Starts with Zap and Boba.
- **Toni** (50 HP): *Comfy*, every heal restores 2 more HP. Starts with Yawn and Warm Milk. Unlocked by beating the Floor 1 boss (saves that already got past it unlock him automatically).

## Couple outfits

Jenny and Toni have 5 matching outfit sets (Outfits button on the title screen): Date Night, Cat & Shiba (the original cat hoodie), Lilac Twins, Café Shift and Christmas Knits. Sets unlock at milestones (5 runs, the Floor 2 boss, December). Open the game with `?unlockall` at the end of the address to unlock every character and outfit and fill in the whole Kioku Catalog, for testing. The sets are in `src/game/outfits.js`, the drawings in `src/ui/chibi.js`.

## Haru's Gift

Every run starts by picking 1 of 3 starter charms from Haru (15 in total). Some of them push you toward a play style, including Sleep Mask (Dreamy), Hot Water Bottle (Cozy) and Gossip Phone (Exposed).

## Play styles

Cards can be tagged **Glitch** (damage over time), **Guard** (Block), **Combo** (chain matches), **Memory** (reveal cards), **Dreamy** (Sleepy until the enemy falls Asleep), **Cozy** (healing, with extra healing turning into damage) or **Exposed** (stack Exposed and hit hard). **Hybrid** cards carry two tags and count toward both. Your deck's style is the tag you own the most of (starter cards don't count).

- **Asleep:** an enemy that reaches 3 Sleepy skips its next 2 turns (bosses 1). It can't get more Sleepy while asleep, and each time it wakes up it takes 3 more to fall asleep again.
- **Cozy:** on a Cozy card, healing past your max HP hits the enemy.
- There's no "draw a card" in this game: anything that would draw reveals cards instead. Once you have one, card rewards and shops pull extra cards from that style's own deck: 1 style card per reward at first, 2 once you're committed (4+ style cards). The Deck button shows your current style.

## Loot decks (less swingy RNG)

Rewards don't come from pure dice rolls. Each source draws from its own shuffled deck that's saved with the run, so nothing repeats until that deck is used up:

- **Cards** – one deck per rarity. Your chance of a rare goes up a little each time you see commons, and resets when a rare appears.
- **Charms** – three separate decks: *drops* (treasure, elites, events), *shop only* (Member Card, Stamp Card, Shiba Plush, …) and *boss only*.
- **Conditional items** stay hidden until your deck can use them. Catalyst only shows up once you own Stinger, Glitch Vial needs a Glitch card, Fuzzy Socks needs 3+ Guard/Hoodie Up, and so on.
- **Events** – every "?" event shows up once before any repeats.
- **Snacks** – one-use items (like potions) kept in the snack bar in the header, 3 slots to start. Click one to eat it (free, no energy) or toss it; Banana Milk and Birthday Cake can also be eaten on the map. 18 snacks in `src/game/snacks.js`: 2 per card style plus 4 for any deck. After a fight there's a 30% chance of a snack (elites +15%); the chance drops 10% after a drop and rises 10% after a fight without one. Once your deck has a style, half of all snacks come from that style. Shops sell 3. Snack charms: Lunchbox (+2 slots), Snack Coupon (+20% drops), Secret Recipe (snacks work twice), Hamster Cheeks and Pocket Fridge (event only). Snack events: Vending Machine, Free Samples, Snack Swap (trade snacks for cards, charms or coins) and Midnight Konbini Run.
- **Event snacks** – Cotton Candy and Rainbow Cotton Candy (The Cotton Candy Lady), Roasted Sweet Potato (Sweet Potato Cart) and Dalgona Candy (Dalgona Challenge) only come from those events.
- **Event-only cards and charms** – 9 cards (rarity `event`) and 4 charms (pool `event`) that never show up in rewards or shops. Events hand them out; each event lists them in `gives`, and the catalog shows which event they come from.
- **Special events** – 8 conditional "?" events, one per card style plus a Crossover one for hybrid decks. From Floor 2 on, once your deck has 3+ cards of a style (or 2+ hybrid cards), the next "?" room is that special event, at most one per floor. Each offers a boon (a run-long charm that powers up that style), an upgrade for all your cards of that style, or a smaller reward.
- **Enemies** – you won't meet the same enemy twice until you've seen the rest of that floor's lineup.

## Map rules

Rooms you can no longer reach are greyed out so the paths still open to you stand out.

Fixed rows: fights at the start, a treasure in the middle, a rest booth right before the boss. The rest of the map is dealt from a room deck, then fixed up so that **every path** has:

- at least **2 rest booths** (one mid-floor + the one before the boss)
- at least **1 shop**
- no more than **2 elites**

## Sound

Music: "Her Shiba Are Her Knights" (default 25%). Sound effects are generated in code with the Web Audio API (default 40%). Both can be changed or muted from the ♪ button; settings are remembered.

## Playtest simulator

`node tools/sim.mjs 200` plays 200 full runs per setting with a bot that has human-like memory (a casual and a sharp version) and prints win rates, turns per fight, HP lost and miss rate. Change `RULES` in `src/game/battle.js` to try other rules.

- `node tools/sim.mjs 200 chars` compares the characters (and Jenny with no passive).
- `node tools/sim.mjs 200 styles` plays every character with every card style (the bot only picks cards of that style).
- `node tools/sim.mjs 200 deaths` shows where runs end.
- `node tools/sim.mjs 200 bosses` shows how often each boss is beaten by the runs that reach it.
- `node tools/bossbag.mjs 20000` shows each boss's move bag without a player: damage per turn, worst 3-turn stretch and how often it attacks 3 times in a row.
- `node tools/sim.mjs 200 snacks` compares runs with and without snacks (the bot eats them in elite and boss fights, and heals when low).
- `node tools/sim.mjs 200 boons` plays each style with and without its special-event boon (add `1` at the end to allow only one boon per run).

## Run it locally

```
npm install
npm run dev
```

## Renaming things

Every name a player reads lives in **`src/game/terms.js`**: the game's name, the tower and shop names, Haru's Gift, and keywords like Block, energy, combo, Exhaust, the statuses (Fighting Spirit, Sleepy, Exposed, Glitch, Spikes) and card types. Change a word there and it updates card text, charms, events, the battle log, tooltips and help.

The code itself uses fixed internal ids (for example the `strength` status), so renaming never breaks saved runs. Card, charm and enemy names are in their own files (`cards.js`, `charms.js`, `enemies.js`).

## Where things live

- `src/game/terms.js` – every player-facing name and keyword (rename things here)
- `src/game/characters.js` – playable characters: HP, starting deck, passive
- `src/game/cards.js` – every card and what it does
- `src/game/enemies.js` – enemies, their move patterns, and which floor they're on
- `src/game/charms.js` – charms (passive items)
- `src/game/events.js` – "?" room events
- `src/game/battle.js` – the fight rules
- `src/game/run.js` – map generation and guarantees, rewards, shop stock, run save
- `src/game/progress.js` – the save that lasts between runs (stats, unlocks, collection)
- `src/game/loot.js` – loot decks and item conditions
- `src/audio.js` – music and generated sound effects
- `src/ui/` – screens and art (all original SVG drawings)

The earlier 3D tiny-planet version of Jenny's World is in the git history (commit `c650673`).

Deployed to GitHub Pages by `.github/workflows/deploy.yml` on every push to `main`.
