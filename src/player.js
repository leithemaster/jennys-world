// Walking on a sphere: the player is a pivot at the planet centre with the
// character standing at +Y. Moving = rotating the pivot about its local X,
// turning = rotating about its local Y.
import * as THREE from 'three';
import { frameQuat, R } from './world/planet.js';

const X = new THREE.Vector3(1, 0, 0);
const Y = new THREE.Vector3(0, 1, 0);
const tmpQ = new THREE.Quaternion();

export class Player {
  constructor(scene, character, spawn) {
    this.pivot = new THREE.Object3D();
    this.pivot.quaternion.copy(frameQuat(spawn.lat, spawn.lon, spawn.yaw));
    character.root.position.y = R;
    this.pivot.add(character.root);
    scene.add(this.pivot);
    this.character = character;
    this.speed = 7;
    this.turnSpeed = 2.4;
    this.frozen = false;
  }

  get up() { return Y.clone().applyQuaternion(this.pivot.quaternion); }
  get worldPos() { return this.up.multiplyScalar(R); }

  // input: { forward: -1..1, turn: -1..1 }
  update(dt, input, obstacles) {
    let amount = 0;
    if (!this.frozen) {
      if (input.turn) this.pivot.quaternion.multiply(tmpQ.setFromAxisAngle(Y, -input.turn * this.turnSpeed * dt));
      if (input.forward) {
        const step = (input.forward * this.speed * dt) / R;
        this.pivot.quaternion.multiply(tmpQ.setFromAxisAngle(X, step));
        amount = Math.abs(input.forward);
      }
      this._resolve(obstacles);
    }
    this.pivot.quaternion.normalize();
    this.character.update(dt, amount);
  }

  // Push the player out of any obstacle footprint (slides along edges).
  _resolve(obstacles) {
    const body = 0.6;
    for (const o of obstacles) {
      const up = this.up;
      const ang = up.angleTo(o.dir);
      const min = (o.r + body) / R;
      if (ang < min && ang > 1e-5) {
        const axis = new THREE.Vector3().crossVectors(o.dir, up).normalize();
        const target = o.dir.clone().applyAxisAngle(axis, min);
        const fix = new THREE.Quaternion().setFromUnitVectors(up, target);
        this.pivot.quaternion.premultiply(fix);
      }
    }
  }
}
