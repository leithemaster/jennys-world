# Design: Chibi Sticker

The whole game looks like a sheet of vinyl stickers on a deep berry table.

## Principles
- **Sticker, not app.** Every surface is a flat shape with a 3px cocoa-ink outline, a soft drop shadow, and at most one white shine highlight.
- **Three shapes:** rounded rectangle, circle, blob. Nothing sharp.
- **Readable first.** HP, energy, intent and card text are the loudest things on a battle screen; decoration lives on the ground behind.

## Colour
| Token | Value | Use |
|---|---|---|
| `--ground` | `#6b1f3f` | page ground (deep berry, from the reference) |
| `--blob` / `--blob-2` | `#8c2a52` / `#a8355f` | background blobs |
| `--ring` | `#ff8fb0` | rings and sparkles |
| `--paper` | `#fff6ec` | panels, cards, modals |
| `--ink` | `#2a1626` | outlines and text on paper |
| `--muted` | `#7a5a6c` | secondary text on paper |
| `--pink` `--sun` `--mint` `--sky` `--coral` `--lilac` | `#ff5d8f` `#ffc53d` `#4fd1b9` `#5aaeff` `#ff6b5e` `#a98bf0` | accents; each has a darker `--*-lip` for chunky buttons |
Card types: attack = coral, skill = sky, power = lilac, status = grey.

## Type
- Display: **Fredoka** 600–700 (self-hosted). Logo uses a thick ink stroke with `paint-order: stroke`.
- Body/UI: **M PLUS Rounded 1c** 500/800 (self-hosted).

## Components
- **Button:** flat fill, 3px ink border, radius 14px, an inset darker "lip" at the bottom (`inset 0 -5px 0 var(--lip)`), small shine pill top-left, sinks 2px when pressed.
- **Panel / modal:** paper, 3px ink, radius 22px, soft shadow `0 8px 18px rgba(40,6,24,.35)`.
- **Card:** paper, colored header band by type, outlined icon. Card back: pink with a moon motif and shine.
- **Map rooms:** coloured sticker circles by type; reachable rooms pulse; unreachable rooms fade.
- **Icons:** authored SVG only (charms, HP, coins, gear, menu); no emoji.

## Motion
Fast, ease-out, interruptible: card flips 330ms, presses 140ms, one bob on the title character. Everything rests under reduced motion.
