import * as THREE from 'three';
import { audio } from './audio.js';

export function createBots(scene, colliders) {
  const bots = [];

  // Waypoints for navigation across the map (Mid, Bombsites A/B, spawns)
  const waypoints = [
    new THREE.Vector3(0, 0, 30),
    new THREE.Vector3(0, 0, 10),
    new THREE.Vector3(-15, 0, 0),
    new THREE.Vector3(15, 0, 0),
    new THREE.Vector3(-20, 0, -25),
    new THREE.Vector3(20, 0, -25),
    new THREE.Vector3(0, 0, -35),
  ];

  function spawnBot(team, x, z) {
    const group = new THREE.Group();
    const color = team === 'T' ? 0xd35400 : 0x2980b9;

    // Body
    const bodyGeo = new THREE.BoxGeometry(0.6, 1.4, 0.6);
    const bodyMat = new THREE.MeshStandardMaterial({ color, roughness: 0.6 });
    const body = new THREE.Mesh(bodyGeo, bodyMat);
    body.position.y = 0.7;
    body.castShadow = true;
    group.add(body);

    // Head
    const headGeo = new THREE.BoxGeometry(0.4, 0.4, 0.4);
    const headMat = new THREE.MeshStandardMaterial({ color: 0xf5cba7, roughness: 0.5 });
    const head = new THREE.Mesh(headGeo, headMat);
    head.position.y = 1.6;
    head.castShadow = true;
    group.add(head);

    group.position.set(x, 0, z);
    scene.add(group);

    const bot = {
      id: Math.random().toString(36).substring(7),
      team,
      mesh: group,
      position: group.position,
      health: 100,
      alive: true,
      wpIndex: Math.floor(Math.random() * waypoints.length),
      shootCooldown: Math.random() * 2,
      state: 'patrol', // patrol, engage, hold

      takeDamage(amount, isHead) {
        if (!this.alive) return false;
        this.health -= amount;
        if (this.health <= 0) {
          this.alive = false;
          this.mesh.visible = false;
          return true;
        }
        return false;
      },

      respawn(x, z) {
        this.health = 100;
        this.alive = true;
        this.mesh.visible = true;
        this.position.set(x, 0, z);
      },

      update(dt, playerPosition, onPlayerShot) {
        if (!this.alive) return;

        // Simple AI navigation towards current waypoint
        const targetWp = waypoints[this.wpIndex];
        const dir = new THREE.Vector3().subVectors(targetWp, this.position);
        dir.y = 0;
        const dist = dir.length();

        if (dist < 2.0) {
          this.wpIndex = (this.wpIndex + 1) % waypoints.length;
        } else {
          dir.normalize();
          const speed = 3.2;
          this.position.addScaledVector(dir, speed * dt);
          this.mesh.lookAt(targetWp.x, this.position.y, targetWp.z);
        }

        // Check distance to player
        const distToPlayer = this.position.distanceTo(playerPosition);
        if (distToPlayer < 20.0 && this.team === 'T') {
          this.shootCooldown -= dt;
          if (this.shootCooldown <= 0) {
            this.shootCooldown = 1.2 + Math.random() * 0.8;
            audio.playGunshot();
            if (Math.random() < 0.4 && onPlayerShot) {
              onPlayerShot(15);
            }
          }
        }
      }
    };

    bots.push(bot);
    return bot;
  }

  // Spawn 4 Terrorist bots and 3 Counter-Terrorist bots (+ player)
  spawnBot('T', -8, -30);
  spawnBot('T', 8, -30);
  spawnBot('T', -15, -20);
  spawnBot('T', 15, -20);

  spawnBot('CT', -5, 25);
  spawnBot('CT', 5, 25);
  spawnBot('CT', 0, 28);

  return {
    bots,
    update(dt, playerPos, onPlayerShot) {
      for (const b of bots) {
        b.update(dt, playerPos, onPlayerShot);
      }
    }
  };
}
