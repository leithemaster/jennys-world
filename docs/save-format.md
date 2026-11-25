# Save format

Kioku Tower keeps two save documents. Both are plain JSON so the Godot port can read the same data.

| Document | Web key | Godot path | Lifetime |
|---|---|---|---|
| `progress` | `localStorage["kioku.progress"]` | `user://progress.json` | Forever |
| `run` | `localStorage["kioku.run"]` | `user://run.json` | Deleted when a run ends |

All storage access goes through [src/platform/storage.js](../src/platform/storage.js) (`readDoc`, `writeDoc`, `removeDoc`). In Godot, that file maps to one autoload that uses `FileAccess` and `JSON.stringify` / `JSON.parse_string`.

## Rules

- Plain JSON only: objects, arrays, strings, numbers and booleans. No `null` fields are written.
- Ids are the stable internal strings: the keys of `CARDS`, `CHARMS`, `ENEMIES`, the `id` of each event, and guardian ids (`haru`). Display names live in `terms.js` and the content files, never in saves.
- Numbers are whole numbers. Godot's JSON parser returns every number as a float, so call `int()` on load.
- Timestamps are Unix seconds (`Time.get_unix_time_from_system()` in Godot).
- Each document has a `version`. When the shape changes, bump the version and add a step to `MIGRATIONS` in `progress.js` that turns version N-1 into version N. The Godot port needs the same steps.
- A save with a higher version than the code knows is loaded read-only and never written over.
- Missing fields are filled with defaults on load, so adding a field doesn't need a migration. Renaming or removing a field does.

## `progress` (version 1)

```json
{
  "version": 1,
  "created_at": 1764000000,
  "totals": { "runs": 12, "wins": 1, "best_floor": 30, "defeated": 140 },
  "characters": {
    "jenny": { "runs": 12, "wins": 1, "best_floor": 30 }
  },
  "unlocks": { "characters": ["jenny", "toni"], "outfits": ["cafe"] },
  "cosmetics": { "jenny": "cat", "toni": "date" },
  "collection": {
    "cards":     { "stinger": { "seen": 9, "taken": 3 } },
    "charms":    { "kimbap":  { "seen": 4, "taken": 1 } },
    "enemies":   { "slime":   { "met": 6, "defeated": 6 } },
    "events":    { "claw":    { "met": 2 } },
    "guardians": { "haru":    { "met": 12 } }
  },
  "history": [
    {
      "ended_at": 1764000000,
      "character": "jenny",
      "won": false,
      "floors": 14,
      "act": 1,
      "defeated": 11,
      "deck": ["strike", "strike+", "guard"],
      "charms": ["kimbap", "purse"]
    }
  ]
}
```

| Field | Meaning |
|---|---|
| `totals` | Across every character. `best_floor` counts rooms cleared, out of 30. |
| `characters.<id>` | The same numbers for one character. A key exists for every unlocked character. |
| `unlocks.characters` | Playable characters. `jenny` is always there. |
| `unlocks.outfits` | Outfit sets unlocked by a milestone (ids from `src/game/outfits.js`). Sets with no unlock rule are always open, listed or not. |
| `cosmetics.<character>` | The outfit set that character wears. Falls back to `date` if that set isn't available. |
| `collection.cards` / `charms` | `seen`: times offered (reward, shop, gift). `taken`: times added to a run. Taking also counts as seeing. |
| `collection.enemies` | `met`: fights started. `defeated`: fights won. |
| `collection.events` / `guardians` | `met`: times visited. |
| `history` | The last 30 finished runs, newest first. A `+` after a card id means upgraded. |

An entry that is missing from a `collection` page means the player has never found that thing, so the book shows its silhouette.

Version 1 is built from the old `sm.stats.v2` key the first time it loads, so runs played before the rework still count. The collection starts empty, because older builds didn't track it.

## `run` (version 1)

This is the live run object from `newRun()` in [src/game/run.js](../src/game/run.js), saved whenever the player is on the map, plus `"version": 1`. Fields: `character`, `hp`, `maxHp`, `coins`, `deck` (`[{ "id": "...", "up": true }]`), `charms`, `giftPending`, `act`, `map`, `pos`, `path`, `pending`, `removeCost`, `floorsCleared`, `kills`, `loot`.

If `kioku.run` is missing, the game falls back to the old `sm.run.v3` key once, so a run that was in progress during the update can still be continued.
