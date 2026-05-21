# Space Shooter — Spec

## Overview
A top-down vertical-scrolling shoot-em-up. The player pilots a fighter against waves of enemies, dodges drifting asteroids, and faces a boss to complete the run.

## Tech
- **Engine**: Phaser 3 (loaded via CDN; no build step required)
- **Language**: Vanilla JavaScript (ES modules)
- **Runtime**: Modern desktop browser, served from a local static server (`python -m http.server`)

## Controls
- **Move**: WASD or arrow keys — 8-directional, clamped to screen
- **Aim**: Mouse cursor — bullets travel toward the cursor; ship sprite rotates to face it
- **Fire**: Left mouse button — hold for auto-fire at a fixed cadence
- **Pause**: `P` or `Esc`
- **Help**: `H` (toggle overlay)

## Core mechanics
- Tile-scrolling starfield background; decorative props (planets, eclipses) parallax behind
- Enemies spawn off the top edge with per-type behaviors and move downward
- Asteroids drift down as destructible environmental hazards
- Player has HP (3 hits = lose a life) and lives (3 = game over)
- Score per kill, persisted for the run; shown in HUD
- Wave-based difficulty ramp; **three boss battles** at score thresholds 800 / 2000 / 4000 (each tier tougher, color-tinted)
- **Shield pickups** drop from kills (~15% from enemies, ~30% from large asteroids, 100% from bosses); absorb up to 3 hits before breaking

## Out of scope
- **Audio** — the provided asset pack is art only.
- Multiple levels beyond the M3 boss, save/leaderboards, mobile/touch input, multiplayer.

---

## Assets

All runtime assets live under `./assets/`. Art licensing is in [`LICENSE-art.pdf`](LICENSE-art.pdf) (from the Warped "Legacy Collection" public license).

### Player
- Body (4-frame idle): [`assets/player/ship-yellow.png`](assets/player/ship-yellow.png) — 48×48 per frame, 5 frames
- Thrust: [`assets/player/thrust.png`](assets/player/thrust.png) — 16×10 per frame, 2 frames

### Enemies
- Drifter: [`assets/enemies/enemy-01.png`](assets/enemies/enemy-01.png) — 48×48, 5 frames
- Tank: [`assets/enemies/enemy-02.png`](assets/enemies/enemy-02.png) — 48×48, 4 frames
- Raider: [`assets/enemies/enemy-03.png`](assets/enemies/enemy-03.png) — 48×48, 4 frames
- Explosion: [`assets/enemies/enemy-explosion.png`](assets/enemies/enemy-explosion.png) — 80×80, 7 frames

### Boss
- Body (5 damage frames): [`assets/boss/boss.png`](assets/boss/boss.png) — 192×144 per frame
- Thrust: [`assets/boss/boss-thrust.png`](assets/boss/boss-thrust.png) — 128×48, 2 frames
- Cannons: [`assets/boss/cannon-left.png`](assets/boss/cannon-left.png), [`assets/boss/cannon-right.png`](assets/boss/cannon-right.png)
- Projectile: [`assets/boss/bolt.png`](assets/boss/bolt.png) — 8×8, 2 frames
- Ray attack: [`assets/boss/rays.png`](assets/boss/rays.png) — 64×224, 11 frames

### Background
- Tileable: [`assets/bg/stage-back.png`](assets/bg/stage-back.png)
- Parallax props: [`assets/bg/planet.png`](assets/bg/planet.png), [`assets/bg/eclipse-1.png`](assets/bg/eclipse-1.png), [`assets/bg/eclipse-2.png`](assets/bg/eclipse-2.png)

### Asteroids
- [`assets/asteroids/asteroid-1.png`](assets/asteroids/asteroid-1.png) … [`assets/asteroids/asteroid-5.png`](assets/asteroids/asteroid-5.png)

### Projectiles & FX
- Player pulse: [`assets/fx/pulse.png`](assets/fx/pulse.png) — 63×32, 4 frames
- Tank/enemy bolt: [`assets/fx/bolt.png`](assets/fx/bolt.png) — 48×32, 4 frames
- Hit spark: [`assets/fx/hit.png`](assets/fx/hit.png) — 31×32, 3 frames
- Explosion: [`assets/fx/explosion-g.png`](assets/fx/explosion-g.png) — 48×48, 7 frames
- Shield (pickup + aura + break): [`assets/fx/shield.png`](assets/fx/shield.png) — 51×47, 8 frames

---

## Milestones

### Milestone 1 — Playable core
Open the page, fly the ship, shoot one enemy type.
- Phaser scene skeleton, asset loader, `index.html` entry point
- Tile-scrolling starfield
- Player ship: WASD movement, mouse-aim rotation, click-to-fire pulse bolts
- Thrust flame while moving
- `enemy-01` spawns from top on a timer, drifts down
- Bullet ↔ enemy collision: enemy explodes, hit spark on impact
- No player damage yet

### Milestone 2 — Combat & survival
- Three enemy behaviors: drifter / tank (shoots) / raider (sine-wave weave)
- Asteroids in three size classes, destructible, contact damage
- Player HP (3) + lives (3), damage flash, brief invuln, respawn invuln
- HUD: score, lives, HP bar
- Wave system: spawn rates ramp every 8s
- Game-over screen → R to retry

### Milestone 3 — Boss & polish
- Title screen with animated ship + parallax planet
- Boss triggers at score ≥ 800: warning, regular spawns pause
- Boss behaviors: spread fan → aimed bursts → telegraphed ray beam
- 5 damage frames as HP drops
- Boss death: chained explosions + heavy shake → Victory screen → Title
- Pause (P/Esc) overlay, context-aware Help (H)
- Parallax props drift in background
- Juice: score popups, screen shake, hit-flash tints

---

## File layout
```
/
├── index.html
├── SPEC.md
├── LICENSE-art.pdf
├── .gitignore
├── assets/
│   ├── bg/        # stage + parallax props
│   ├── player/    # ship + thrust
│   ├── enemies/   # 3 enemy types + explosion
│   ├── boss/      # body, thrust, cannons, bolt, rays
│   ├── fx/        # pulse, bolt, hit, explosion-g
│   └── asteroids/ # 5 variants
└── src/
    ├── main.js
    ├── scenes/
    │   ├── BootScene.js
    │   ├── TitleScene.js
    │   ├── GameScene.js
    │   ├── HUDScene.js
    │   ├── HelpScene.js
    │   ├── PauseScene.js
    │   ├── GameOverScene.js
    │   └── VictoryScene.js
    └── entities/
        ├── Player.js
        ├── Projectile.js
        ├── Enemy.js
        ├── EnemyBolt.js
        ├── Asteroid.js
        ├── Boss.js
        ├── BossBolt.js
        ├── RayBeam.js
        ├── ParallaxProp.js
        └── ShieldPickup.js
```

## Running locally
```
python -m http.server 8000
# open http://localhost:8000
```
