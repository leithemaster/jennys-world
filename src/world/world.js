// Assembles the planet, places and street props, and exposes what the
// player needs: obstacles to bump into and doors to walk up to.
import * as THREE from 'three';
import { PALETTE } from '../toon.js';
import { buildPlanet, placeAt, dirFrom, R } from './planet.js';
import { kawaiiStore, netCafe, placeholderLot, tree, utilityPole, vendingMachine, lantern, bench, wiresBetween } from './places.js';
import { PLACES } from '../config.js';

export function buildWorld(scene) {
  const planet = buildPlanet(scene);
  const world = planet.world;
  const obstacles = []; // { dir: Vector3, r: world units }
  const doors = []; // { place, point: Vector3 }
  const bobbers = [];

  const addObstacle = (lat, lon, r) => obstacles.push({ dir: dirFrom(lat, lon), r });

  for (const p of PLACES) {
    const { anchor } = placeAt(world, p.lat, p.lon, p.yaw);
    let obj;
    if (p.kind === 'store') obj = kawaiiStore();
    else if (p.kind === 'cafe') obj = netCafe();
    else obj = placeholderLot(p.label || p.name);
    anchor.add(obj);
    if (obj.userData.bobbers) bobbers.push(...obj.userData.bobbers);
    addObstacle(p.lat, p.lon, p.radius);
    p.anchor = anchor;
  }

  // Street props along both sidewalks
  const poles = [];
  const skipNear = (lon, lat) => PLACES.some((p) => Math.sign(p.lat) === Math.sign(lat) && Math.abs(((lon - p.lon + 540) % 360) - 180) < 10);
  for (let lon = 0; lon < 360; lon += 20) {
    if (Math.abs(((lon + 90) % 180) - 90) < 8) continue;
    const { anchor, pivot } = placeAt(world, 7.2, lon + 7, 0);
    const pole = utilityPole();
    anchor.add(pole);
    poles.push(pole);
    addObstacle(7.2, lon + 7, 0.4);
    void pivot;
  }
  for (let lon = 0; lon < 360; lon += 13) {
    for (const lat of [-11, 11, -22, 24, 34, -34, 48, -48]) {
      const jitterLon = lon + (Math.abs(lat) > 20 ? 6 : 0) + Math.random() * 4;
      if (skipNear(jitterLon, lat) && Math.abs(lat) < 30) continue;
      if (Math.abs(((jitterLon + 90) % 180) - 90) < 7) continue;
      if (Math.random() < 0.45) continue;
      const { anchor } = placeAt(world, lat, jitterLon, Math.random() * 360);
      anchor.add(tree(0.8 + Math.random() * 0.6));
      addObstacle(lat, jitterLon, 0.9);
    }
  }
  // Vending machines + bench + lanterns near the shops
  const vm = [
    [8.6, 9, 0, PALETTE.red], [8.6, 10.6, 0, '#3f7cc0'], [-8.6, 40, 180, PALETTE.yellow], [8.6, 190, 0, PALETTE.red],
  ];
  for (const [lat, lon, yaw, c] of vm) {
    const { anchor } = placeAt(world, lat, lon, yaw);
    anchor.add(vendingMachine(c));
    addObstacle(lat, lon, 0.8);
  }
  for (const [lat, lon, yaw] of [[-8.4, 2, 180], [-8.4, 28, 180], [8.4, 150, 0]]) {
    const { anchor } = placeAt(world, lat, lon, yaw);
    anchor.add(bench());
    addObstacle(lat, lon, 1);
  }
  // Wires drawn once everything is positioned
  scene.updateMatrixWorld(true);
  wiresBetween(scene, poles);

  // Door points in world space
  for (const p of PLACES) {
    if (!p.door) continue;
    const point = p.anchor.localToWorld(new THREE.Vector3(...p.door));
    doors.push({ place: p, point });
  }

  return {
    obstacles,
    doors,
    update(t) {
      planet.update(t);
      bobbers.forEach((b, i) => { b.rotation.y = Math.sin(t * 0.8 + i) * 0.25; });
    },
  };
}

export { R };
