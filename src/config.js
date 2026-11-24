// Where everything lives on the planet. lat/lon are in degrees.
// The main street runs around the equator (lat 0); a cross street runs
// through lon 90 / 270. yaw 0 = building faces south, 180 = faces north.
//
// To turn a placeholder into a real area: change its `kind` and write a
// builder for it in src/world/places.js, plus an action in src/main.js.

export const SPAWN = { lat: 4, lon: 14, yaw: 180 };

export const PLACES = [
  { id: 'store', kind: 'store', name: 'Mochi Moon', prompt: 'Enter Mochi Moon (try on outfits)', lat: 17, lon: 0, yaw: 0, radius: 5.4, door: [2.8, 0, 4.4] },
  { id: 'cafe', kind: 'cafe', name: 'Net Café 24', prompt: 'Enter Net Café 24 (play Spire Match)', lat: 17, lon: 30, yaw: 0, radius: 5, door: [3, 0, 4.4] },

  // Placeholders: swap these for real places later.
  { id: 'spot1', kind: 'placeholder', name: 'Spot 1', label: 'photo booth?', lat: -17, lon: 16, yaw: 180, radius: 4.4 },
  { id: 'spot2', kind: 'placeholder', name: 'Spot 2', label: 'ramen stand?', lat: 17, lon: 130, yaw: 0, radius: 4.4 },
  { id: 'spot3', kind: 'placeholder', name: 'Spot 3', label: 'arcade?', lat: -17, lon: 200, yaw: 180, radius: 4.4 },
  { id: 'spot4', kind: 'placeholder', name: 'Spot 4', label: 'boba shop?', lat: 17, lon: 245, yaw: 0, radius: 4.4 },
];
