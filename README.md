# Arcane Runegate (Alpha)
Simple top-down prototype made with Phaser. Control the hero, collect coins, avoid zombies. After collecting all coins a portal appears - enter it to win.

![Gameplay Screenshot](public/assets/screenshots/readmeScreenshot.png)
## Features
- Top-down single level (early test map)
- Keyboard controlled player
- 4 patrolling zombies (patrol + chase when close)
- Collision system (trees, rocks, lake)
- Coin collection + score
- Portal spawns after all coins taken
- UI: score, lives, Start screen, Win screen
- Game state manager (start / pause)
- Basic enemy AI and chase trigger
- Atlas based world objects
## Controls
- Arrow Keys: move
- Shift: run
## Install & Run
```bash
  npm install
  npm run dev
```
  Open shown local URL (e.g. http://localhost:5173/)
## Project Structure (short)
- src/scenes/GameScene.ts - core scene logic
- src/characters/ - player and enemies
- src/managers/ - UI + game flow
- public/assets/ - sprites, atlas (world.png, world.json)
## Technology
- Phaser 3
- TypeScript
- NPM dev server
## Current State
  Version: early alpha
  Planned: more levels, sound, zombie animations, damage system, power-ups.
## Build
```bash
- npm run build
```
then serve dist/
## License
  TBD.
