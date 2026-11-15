# Tactical Strike: 3D Tactical FPS

An original round-based tactical first-person shooter built on Three.js for the make.fun threejs-fps-02 competition.

## Game Features
- **Round-Based Tactical Combat:** 100-second rounds with win conditions based on elimination and objectives.
- **Gunplay & Economy:** Rifle, pistol, and grenade options with recoil, spread, headshot multipliers, and a between-rounds buy menu.
- **Smart Bots:** 4v4 combatants navigating map routes, holding angles, and reacting to engagements.
- **Original Map:** Designed with mid lanes, bombsites A & B, walls, and crates with AABB collision.
- **Zero Dependencies:** Pure ES modules, no network requests, and procedural WebAudio sound synthesis.

## Controls
- **Move:** `W`, `A`, `S`, `D`
- **Aim & Look:** Mouse
- **Fire:** Left Click
- **Reload:** `R`
- **Crouch:** `Ctrl` or `C`
- **Walk:** `Shift`
- **Buy Menu:** `B`
- **Switch Weapons:** `1` (Rifle), `2` (Pistol), `3` (Grenade)

## Play-Testing & Local Check
1. Start local server:
   ```bash
   node serve.ts
   ```
2. Open `http://localhost:8080` in desktop Chrome.
3. Run local build and check:
   ```bash
   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
   ```
