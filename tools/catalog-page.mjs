// Writes tools/catalog-page/data.json for the published catalog page
// (tools/catalog-page/index.html). The data itself comes from
// src/ui/catalogData.js, the same builder the in-game Memory Catalog uses.
//   npm run catalog     then republish index.html + data.json
import { writeFileSync } from 'node:fs';

globalThis.localStorage = { getItem: () => null, setItem: () => {}, removeItem: () => {} };
const { buildCatalog } = await import('../src/ui/catalogData.js');
const data = buildCatalog();
writeFileSync(new URL('./catalog-page/data.json', import.meta.url), JSON.stringify(data));
console.log(`catalog-page/data.json: ${data.cards.length} cards, ${data.charms.length} charms, ${data.enemies.length} enemies, ${data.events.length} events, ${data.characters.length} characters, ${data.outfits.length} outfit sets`);
