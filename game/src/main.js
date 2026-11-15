import * as THREE from 'three';
import { createWorld } from './world.js';
import { createPlayer } from './player.js';
import { createWeapon } from './weapon.js';
import { createBots } from './bots.js';
import { createRoundManager } from './rounds.js';
import { createHUD } from './hud.js';
import { createInput } from './input.js';
import { audio } from './audio.js';

const container = document.getElementById('game');
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x14161a);
scene.fog = new THREE.FogExp2(0x14161a, 0.015);

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
container.appendChild(renderer.domElement);

const world = createWorld(scene);
const player = createPlayer(world.colliders);
const weapon = createWeapon(scene, camera);
const botsManager = createBots(scene, world.colliders);
const hud = createHUD();

const rounds = createRoundManager((winner) => {
  hud.showRoundBanner(`${winner} TEAM WINS`);
  audio.playBombPlant();
});

const input = createInput(renderer.domElement, (locked) => {
  if (locked) hud.setOverlayVisible(false);
});

// Start button
const playBtn = document.getElementById('play');
if (playBtn) {
  playBtn.onclick = () => {
    renderer.domElement.requestPointerLock();
  };
}

const closeBuyBtn = document.getElementById('close-buy');
if (closeBuyBtn) {
  closeBuyBtn.onclick = () => {
    hud.setBuyMenuVisible(false);
  };
}

let buyMenuOpen = false;

// Handle query params for screenshots: ?shot=start|play|end&seed=1
const urlParams = new URLSearchParams(window.location.search);
const shotMode = urlParams.get('shot');

if (shotMode) {
  // Disable pointer lock / overlay for static screenshot poses
  hud.setOverlayVisible(false);
  if (shotMode === 'start') {
    player.position.set(0, 0, 32);
    hud.showRoundBanner('ROUND 1 START');
  } else if (shotMode === 'play') {
    player.position.set(0, 0, 10);
    camera.rotation.set(0, 0, 0);
    hud.addKillMessage('<b>Player</b> eliminated <b>Terrorist</b>');
  } else if (shotMode === 'end') {
    player.position.set(0, 0, 0);
    rounds.setPhase('ended');
    hud.showRoundBanner('COUNTER-TERRORISTS WIN');
  }
}

// Main fixed-step simulation loop
let lastTime = performance.now();
const fixedStep = 1 / 60;
let accumulator = 0;

function animate(time) {
  requestAnimationFrame(animate);

  const dt = Math.min((time - lastTime) / 1000, 0.1);
  lastTime = time;

  // Handle inputs
  if (input.keys.has('KeyB') && !buyMenuOpen) {
    buyMenuOpen = true;
    hud.setBuyMenuVisible(true, weapon.weapons, (idx, cost) => {
      if (player.money >= cost) {
        player.money -= cost;
        weapon.switchWeapon(idx);
        return true;
      }
      return false;
    });
  } else if (!input.keys.has('KeyB')) {
    buyMenuOpen = false;
  }

  if (input.keys.has('Digit1')) weapon.switchWeapon(0);
  if (input.keys.has('Digit2')) weapon.switchWeapon(1);
  if (input.keys.has('Digit3')) weapon.switchWeapon(2);
  if (input.keys.has('KeyR')) weapon.reload();

  if (input.isLocked && !buyMenuOpen && !shotMode) {
    player.look(input.mouseDelta.x, input.mouseDelta.y);
    input.mouseDelta.x = 0;
    input.mouseDelta.y = 0;

    if (input.buttons.has(0)) {
      weapon.fire(world.shootables, botsManager.bots, () => {
        hud.showHitmarker();
      }, (bot) => {
        player.money += 300;
        hud.addKillMessage(`<b>You</b> eliminated <b>${bot.team} Bot</b>`);
      });
    }
  }

  // Fixed simulation step
  accumulator += dt;
  while (accumulator >= fixedStep) {
    if (!shotMode && input.isLocked && !buyMenuOpen) {
      player.step(fixedStep, input.keys);
      botsManager.update(fixedStep, player.position, (damage) => {
        player.health -= damage;
      });
      rounds.update(fixedStep, botsManager.bots);
    }
    accumulator -= fixedStep;
  }

  // Camera sync
  camera.position.copy(player.position);
  camera.position.y += player.eye;
  camera.rotation.set(0, 0, 0);
  camera.rotation.y = player.yaw;
  camera.rotation.x = player.pitch;

  weapon.update(dt);
  hud.updateStats(player, weapon, rounds);

  renderer.render(scene, camera);
}

requestAnimationFrame(animate);

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});
