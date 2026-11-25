// The one place the game touches the browser's storage.
// Every save is a named JSON document ("progress", "run", ...). In the Godot
// port this file becomes a tiny script that reads and writes
// user://<name>.json with FileAccess + JSON; nothing else needs to change.

const PREFIX = 'kioku.';

export function readDoc(name) {
  try {
    const raw = globalThis.localStorage?.getItem(PREFIX + name);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function writeDoc(name, data) {
  try { globalThis.localStorage?.setItem(PREFIX + name, JSON.stringify(data)); } catch { /* storage full or blocked */ }
}

export function removeDoc(name) {
  try { globalThis.localStorage?.removeItem(PREFIX + name); } catch { /* ignore */ }
}

// Old keys from before the save rework, read once during migration.
export function readLegacy(key) {
  try { return JSON.parse(globalThis.localStorage?.getItem(key)); } catch { return null; }
}
