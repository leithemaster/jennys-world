# Jenny's World

A tiny toon-shaded planet to walk around. Made for my sister.

- **Mochi Moon** – a kawaii shop with a fitting room: swap hats, tops, bottoms, shoes and bags (Tokyo / Seoul street style). Your outfit is saved.
- **Net Café 24** – sit down and play **Spire Match**, a memory game with a roguelike card-battle twist: match pairs to Slash, Guard, Snack, Zap or Boba, beat four floors, pick an upgrade after each fight.
- **Spots 1–4** – "coming soon" lots waiting for new places.

## Controls

- Move: `W A S D` / arrow keys, or drag on the screen on a phone
- Enter a place: walk to its door and press `E` (or tap the prompt)
- Outfits: the shirt button, or visit Mochi Moon
- `Esc` closes the shop or the card game

## Run it locally

```
npm install
npm run dev
```

## Adding a new place

1. Pick a placeholder in `src/config.js` and change its `kind`, `name`, `prompt` and add a `door`.
2. Write a builder for the building in `src/world/places.js` and use it in `src/world/world.js`.
3. Hook up what happens at the door in `interact()` in `src/main.js`.

## How it looks the way it does

Everything is built from simple shapes in [Three.js](https://threejs.org): banded toon shading, inked outlines (inverted hulls), a teal sky with painted clouds, and a small planet you walk around. The look is inspired by hand-painted anime backgrounds; all characters, mascots and places are original.

Deployed to GitHub Pages by `.github/workflows/deploy.yml` on every push to `main`.
