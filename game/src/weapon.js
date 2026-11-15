import * as THREE from 'three';
import { audio } from './audio.js';

export function createWeapon(scene, camera) {
  const weapons = [
    { name: 'Rifle', damage: 32, headMult: 3.0, fireRate: 0.12, mag: 30, reserve: 90, maxMag: 30, cost: 2700, price: 0 },
    { name: 'Pistol', damage: 22, headMult: 2.5, fireRate: 0.20, mag: 12, reserve: 36, maxMag: 12, cost: 0, price: 0 },
    { name: 'Grenade', damage: 85, headMult: 1.0, fireRate: 1.0, mag: 1, reserve: 1, maxMag: 1, cost: 300, price: 300 },
  ];

  let currentIdx = 0;
  let reloadTimer = 0;
  let fireCooldown = 0;

  // Gun mesh group attached to camera
  const gunGroup = new THREE.Group();
  
  // Rifle mesh
  const rifleBody = new THREE.Mesh(
    new THREE.BoxGeometry(0.12, 0.15, 0.8),
    new THREE.MeshStandardMaterial({ color: 0x2b2f35, roughness: 0.5 })
  );
  rifleBody.position.set(0.2, -0.25, -0.6);
  gunGroup.add(rifleBody);

  const barrel = new THREE.Mesh(
    new THREE.CylinderGeometry(0.02, 0.02, 0.4, 8),
    new THREE.MeshStandardMaterial({ color: 0x111111, metalness: 0.8, roughness: 0.2 })
  );
  barrel.rotation.x = Math.PI / 2;
  barrel.position.set(0.2, -0.22, -1.0);
  gunGroup.add(barrel);

  camera.add(gunGroup);

  function getActive() {
    return weapons[currentIdx];
  }

  function switchWeapon(index) {
    if (index >= 0 && index < weapons.length) {
      currentIdx = index;
      reloadTimer = 0;
      updateVisual();
    }
  }

  function updateVisual() {
    const w = getActive();
    if (w.name === 'Pistol') {
      rifleBody.scale.set(0.7, 0.7, 0.5);
      barrel.position.set(0.2, -0.25, -0.7);
    } else if (w.name === 'Rifle') {
      rifleBody.scale.set(1, 1, 1);
      barrel.position.set(0.2, -0.22, -1.0);
    } else {
      // Grenade
      rifleBody.scale.set(0.4, 0.4, 0.4);
      barrel.position.set(0.2, -0.25, -0.5);
    }
  }

  function reload() {
    const w = getActive();
    if (reloadTimer > 0 || w.mag === w.maxMag || w.reserve <= 0) return;
    reloadTimer = 2.0;
    audio.playReload();
  }

  function update(dt) {
    if (fireCooldown > 0) fireCooldown -= dt;
    if (reloadTimer > 0) {
      reloadTimer -= dt;
      if (reloadTimer <= 0) {
        const w = getActive();
        const needed = w.maxMag - w.mag;
        const take = Math.min(needed, w.reserve);
        w.mag += take;
        w.reserve -= take;
      }
    }

    // Subtle gun idle sway
    gunGroup.position.y = -0.01 * Math.sin(Date.now() * 0.008);
  }

  function fire(shootables, bots, onHit, onKill) {
    if (fireCooldown > 0 || reloadTimer > 0) return false;
    const w = getActive();
    if (w.mag <= 0) {
      reload();
      return false;
    }

    w.mag--;
    fireCooldown = w.fireRate;
    audio.playGunshot();

    // Muzzle recoil kick
    gunGroup.position.z += 0.05;
    setTimeout(() => { gunGroup.position.z = 0; }, 60);

    // Hitscan raycaster
    const raycaster = new THREE.Raycaster();
    const center = new THREE.Vector2(0, 0);
    raycaster.setFromCamera(center, camera);

    // Check intersections with bot meshes and world colliders / shootables
    const botMeshes = bots.map(b => b.mesh);
    const intersects = raycaster.intersectObjects([...botMeshes, ...shootables], true);

    if (intersects.length > 0) {
      const hit = intersects[0];
      // Check if hit is head (higher y relative to object)
      const isHead = hit.point.y > (hit.object.position.y + 0.5);
      const damage = Math.round(w.damage * (isHead ? w.headMult : 1.0));

      audio.playHit();

      // Find which bot was hit
      for (const bot of bots) {
        if (bot.mesh === hit.object || bot.mesh.children.includes(hit.object)) {
          const died = bot.takeDamage(damage, isHead);
          if (onHit) onHit(isHead);
          if (died && onKill) onKill(bot);
          break;
        }
      }
    }

    return true;
  }

  return {
    update,
    fire,
    reload,
    switchWeapon,
    getActive,
    weapons
  };
}
