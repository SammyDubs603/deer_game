# Buck Blitz

Buck Blitz is a **stylized, non-gory arcade shooting gallery** mini-game built with plain HTML, CSS, and JavaScript using a single `<canvas>`.

## How to Run

1. Download or clone this folder.
2. Open `index.html` directly in a modern browser.
3. Click **Play**.

No build step, server, or external assets are required.

## Controls

- **Mouse Move**: Aim crosshair
- **Left Click**: Shoot
- **R**: Reload (or auto-reload when magazine is empty)
- **1 / 2 / 3**: Choose timed upgrade when overlay appears

## Gameplay Rules

- Run duration: **60 seconds**
- **3 Strikes** ends the run
- Scoring:
  - Buck hit: `+100`
  - Big-antler buck: `+150`
  - Golden Buck (rare): `+500`
  - Doe hit: `-200` and +1 strike
  - Missed shot: `-25`

Biomes rotate every 20 seconds (Forest → Meadow → Snow), each with a different look and slight speed behavior.

## Tuning Constants

Open `game.js` and tweak these key values:

- **Match length**: `this.timeLeft = 60;` in `Game.resetRun()`
- **Biome duration**: `if (this.biomeTimer >= 20)` in `Game.update()`
- **Spawn pacing**:
  - Start interval: `this.spawnInterval = 1.4;`
  - Ramp formula: `this.spawnInterval = Math.max(0.38, 1.4 - this.elapsed * 0.012);`
- **Deer speed**: values in `Game.spawnDeer()` (`minSpeed`, `maxSpeed`, biome `speedFactor`)
- **Golden buck chance**: `const golden = Math.random() < 0.02;`
- **Doe chance**: `const doe = !golden && Math.random() < 0.33;`
- **Scoring**: `Deer.getScoreValue()` and the miss penalty in `Game.shoot()`
- **Magazine / reload defaults**: `Player` constructor (`magSize`, `reloadTime`)
- **Upgrade timing**: `this.upgradeTimer = 15;` in `Game.resetRun()`

## Project Files

- `index.html` — structure and UI overlays
- `styles.css` — page + overlay styling
- `game.js` — full game logic, rendering, entities, loop
- `README.md` — this guide
