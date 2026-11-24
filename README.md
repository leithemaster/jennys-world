# Spire Match

A memory card battler made for my sister. Part of Jenny's World.

**Play:** https://leithemaster.github.io/jennys-world/

## How it works

- Every card in your deck shows up **twice**, face down. Flip two: if they match, that card is played.
- Flipping a pair costs **1 energy**. You get 3 a turn; when you run out, the enemy acts on the intent shown in its bubble.
- Unmatched cards **stay where they are** between turns, so memory pays off. Clearing the whole board gives +1 energy and a fresh board.
- **Combo:** matches in a row add +2 damage to attacks. A miss resets it.
- Some enemies **scramble** the board or slip junk cards (Bug, Lag, Spam) into your deck.

## The run

Climb three floors of the Net Café Tower (Lobby, Server Room, Rooftop), each ending in a boss. On the map pick fights, elites, "?" events, shops, rest booths and treasure. Build your deck from 25+ cards, collect 19 charms, and upgrade or remove cards along the way. Runs are saved in the browser so you can continue later.

## Run it locally

```
npm install
npm run dev
```

## Where things live

- `src/game/cards.js` – every card and what it does
- `src/game/enemies.js` – enemies, their move patterns, and which floor they're on
- `src/game/charms.js` – charms (passive items)
- `src/game/events.js` – "?" room events
- `src/game/battle.js` – the fight rules
- `src/game/run.js` – map generation, rewards, shop stock, saving
- `src/ui/` – screens and art (all original SVG drawings)

The earlier 3D tiny-planet version of Jenny's World is in the git history (commit `c650673`).

Deployed to GitHub Pages by `.github/workflows/deploy.yml` on every push to `main`.
