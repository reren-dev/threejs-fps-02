import * as THREE from 'three';
import { audio } from './audio.js';

export function createPlayer(colliders) {
  const state = {
    position: new THREE.Vector3(0, 0, 35),
    velocity: new THREE.Vector3(),
    yaw: 0,
    pitch: 0,
    eye: 1.6,
    crouch: false,
    health: 100,
    armor: 100,
    money: 800,
    speed: 6.0,
    radius: 0.4,
    height: 1.8,
    footstepTimer: 0,
  };

  const tempBox = new THREE.Box3();
  const playerBox = new THREE.Box3();

  function checkCollision(pos) {
    const halfH = state.crouch ? 0.8 : state.height / 2;
    playerBox.min.set(pos.x - state.radius, pos.y, pos.z - state.radius);
    playerBox.max.set(pos.x + state.radius, pos.y + state.height * (state.crouch ? 0.75 : 1), pos.z + state.radius);

    for (const box of colliders) {
      if (playerBox.intersectsBox(box)) return true;
    }
    return false;
  }

  function look(dx, dy) {
    const sensitivity = 0.0022;
    state.yaw -= dx * sensitivity;
    state.pitch -= dy * sensitivity;
    const maxPitch = Math.PI / 2 - 0.01;
    state.pitch = Math.max(-maxPitch, Math.min(maxPitch, state.pitch));
  }

  function step(dt, keys) {
    const accel = 35.0;
    const friction = 10.0;
    
    state.crouch = keys.has('ControlLeft') || keys.has('ControlRight') || keys.has('KeyC');
    const targetSpeed = state.crouch ? 2.5 : (keys.has('ShiftLeft') ? 7.5 : 5.0);

    const forward = (keys.has('KeyW') ? 1 : 0) - (keys.has('KeyS') ? 1 : 0);
    const side = (keys.has('KeyD') ? 1 : 0) - (keys.has('KeyA') ? 1 : 0);

    const dir = new THREE.Vector3(side, 0, forward).normalize();
    dir.applyAxisAngle(new THREE.Vector3(0, 1, 0), state.yaw);

    // Apply acceleration
    state.velocity.x += (dir.x * targetSpeed - state.velocity.x) * Math.min(1, accel * dt);
    state.velocity.z += (dir.z * targetSpeed - state.velocity.z) * Math.min(1, accel * dt);

    // Friction
    if (forward === 0 && side === 0) {
      state.velocity.x -= state.velocity.x * Math.min(1, friction * dt);
      state.velocity.z -= state.velocity.z * Math.min(1, friction * dt);
    }

    // Try moving X
    state.position.x += state.velocity.x * dt;
    if (checkCollision(state.position)) {
      state.position.x -= state.velocity.x * dt;
      state.velocity.x = 0;
    }

    // Try moving Z
    state.position.z += state.velocity.z * dt;
    if (checkCollision(state.position)) {
      state.position.z -= state.velocity.z * dt;
      state.velocity.z = 0;
    }

    // Eye height interpolation for crouching
    const targetEye = state.crouch ? 1.0 : 1.6;
    state.eye += (targetEye - state.eye) * Math.min(1, 15 * dt);

    // Footsteps sound
    const speedHoriz = Math.hypot(state.velocity.x, state.velocity.z);
    if (speedHoriz > 1.0) {
      state.footstepTimer += dt * speedHoriz;
      if (state.footstepTimer > 3.2) {
        state.footstepTimer = 0;
        audio.playFootstep();
      }
    }
  }

  function recoil(drPitch, drYaw) {
    state.pitch += drPitch;
    state.yaw += drYaw;
  }

  function groundSpeed() {
    return Math.hypot(state.velocity.x, state.velocity.z);
  }

  return {
    state,
    get position() { return state.position; },
    get velocity() { return state.velocity; },
    get yaw() { return state.yaw; },
    set yaw(v) { state.yaw = v; },
    get pitch() { return state.pitch; },
    set pitch(v) { state.pitch = v; },
    get eye() { return state.eye; },
    get crouch() { return state.crouch; },
    get health() { return state.health; },
    set health(v) { state.health = v; },
    get armor() { return state.armor; },
    set armor(v) { state.armor = v; },
    get money() { return state.money; },
    set money(v) { state.money = v; },
    look,
    step,
    recoil,
    groundSpeed,
    reset(spawnPos) {
      state.position.copy(spawnPos);
      state.velocity.set(0, 0, 0);
      state.health = 100;
      state.armor = 100;
    }
  };
}
