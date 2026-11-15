import * as THREE from 'three';
import { PALETTE } from './palette.js';

export function createWorld(scene) {
  const colliders = [];
  const shootables = [];

  // Lighting
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
  scene.add(ambientLight);

  const dirLight = new THREE.DirectionalLight(0xfff5e6, 0.9);
  dirLight.position.set(20, 40, 20);
  dirLight.castShadow = true;
  dirLight.shadow.mapSize.width = 1024;
  dirLight.shadow.mapSize.height = 1024;
  dirLight.shadow.camera.near = 0.5;
  dirLight.shadow.camera.far = 100;
  const d = 35;
  dirLight.shadow.camera.left = -d;
  dirLight.shadow.camera.right = d;
  dirLight.shadow.camera.top = d;
  dirLight.shadow.camera.bottom = -d;
  scene.add(dirLight);

  const floorGeo = new THREE.PlaneGeometry(80, 80);
  const floorMat = new THREE.MeshStandardMaterial({ color: PALETTE.floor, roughness: 0.9 });
  const floor = new THREE.Mesh(floorGeo, floorMat);
  floor.rotation.x = -Math.PI / 2;
  floor.receiveShadow = true;
  scene.add(floor);

  // Helper to add box wall/crate with AABB and visual mesh
  function addBox(x, y, z, w, h, d, color = PALETTE.crate) {
    const geo = new THREE.BoxGeometry(w, h, d);
    const mat = new THREE.MeshStandardMaterial({ color, roughness: 0.7 });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.set(x, y + h / 2, z);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    scene.add(mesh);
    shootables.push(mesh);

    const box3 = new THREE.Box3().setFromObject(mesh);
    colliders.push(box3);
    return mesh;
  }

  // Outer boundary walls
  // North
  addBox(0, 0, -40, 80, 6, 2, PALETTE.wall);
  // South
  addBox(0, 0, 40, 80, 6, 2, PALETTE.wall);
  // West
  addBox(-40, 0, 0, 2, 6, 80, PALETTE.wall);
  // East
  addBox(40, 0, 0, 2, 6, 80, PALETTE.wall);

  // Interior tactical layout (Mid, Bombsite A, Bombsite B, tunnels)
  // Mid dividing wall / crates
  addBox(0, 0, 0, 4, 4, 16, PALETTE.crate);
  addBox(-12, 0, -10, 8, 4, 4, PALETTE.crate);
  addBox(12, 0, -10, 8, 4, 4, PALETTE.crate);

  // Bombsite A (North-East)
  addBox(24, 0, -25, 10, 3, 10, PALETTE.siteA);
  addBox(20, 0, -16, 4, 4, 4, PALETTE.crate);

  // Bombsite B (North-West)
  addBox(-24, 0, -25, 10, 3, 10, PALETTE.siteB);
  addBox(-20, 0, -16, 4, 4, 4, PALETTE.crate);

  // Cover boxes in Mid / T Spawn / CT Spawn
  addBox(0, 0, 20, 12, 4, 4, PALETTE.concrete);
  addBox(-15, 0, 25, 6, 3, 6, PALETTE.concrete);
  addBox(15, 0, 25, 6, 3, 6, PALETTE.concrete);

  // Waypoints for AI navigation
  const waypoints = [
    { id: 0, pos: new THREE.Vector3(0, 0, 30), neighbors: [1, 2, 3] }, // Spawn T
    { id: 1, pos: new THREE.Vector3(-15, 0, 15), neighbors: [0, 4] },
    { id: 2, pos: new THREE.Vector3(0, 0, 5), neighbors: [0, 5, 6] },   // Mid
    { id: 3, pos: new THREE.Vector3(15, 0, 15), neighbors: [0, 7] },
    { id: 4, pos: new THREE.Vector3(-22, 0, -10), neighbors: [1, 8] }, // Toward B
    { id: 5, pos: new THREE.Vector3(-10, 0, -20), neighbors: [2, 8] },
    { id: 6, pos: new THREE.Vector3(10, 0, -20), neighbors: [2, 9] },
    { id: 7, pos: new THREE.Vector3(22, 0, -10), neighbors: [3, 9] },  // Toward A
    { id: 8, pos: new THREE.Vector3(-24, 0, -30), neighbors: [4, 5] }, // Site B
    { id: 9, pos: new THREE.Vector3(24, 0, -30), neighbors: [6, 7] },  // Site A
    { id: 10, pos: new THREE.Vector3(0, 0, -35), neighbors: [8, 9] },  // Spawn CT
  ];

  const siteA = { center: new THREE.Vector3(24, 0, -25), radius: 8 };
  const siteB = { center: new THREE.Vector3(-24, 0, -25), radius: 8 };

  return {
    colliders,
    shootables,
    waypoints,
    siteA,
    siteB,
    ctSpawn: new THREE.Vector3(0, 0, -35),
    tSpawn: new THREE.Vector3(0, 0, 35),
  };
}
