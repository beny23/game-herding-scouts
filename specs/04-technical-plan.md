# 04 — Technical Plan (Phaser 3)

## Engine
- Phaser 3 (web)

## Scene Structure (suggested)
- `BootScene`: preload assets, show loading progress
- `GameScene`: main world (map, leader, scouts, tasks)
- `UIScene` (optional): overlay UI (checklist, prompts)

## Core Systems
### Entity Model
- Leader (player-controlled)
- Scout NPCs (state machine)
- Build sites (consume wood; progress toward completion)
- Tilemap world (ground, obstacles, water)

### Interaction Model (MVP)
- Leader-only control.
- `E` interaction on a **tree tile** or **build site** assigns the nearest idle scout to that target.
- Interaction targeting is based on the leader position + facing/closest tile under cursor/nearby (implementation choice).

### Data Definitions (MVP)
- `ResourceType`: `wood`
- `TaskType`: `hutA | hutB | hutC` (or a list of hut tasks)
- `TaskDefinition`: woodCost + target build site + completion state
- `TileKinds` (via tile properties in Tiled):
  - `ground` (walkable)
  - `tree` (blocked, **choppable**, yields wood)
  - `rock` (blocked, not choppable)
  - `water` (blocked)

### Scout AI (MVP)
- Finite state machine with a small set of states:
  - `Idle`, `Follow`, `GoToTarget`, `ChopTree`, `BuildHut`

### Movement & Collisions
- Arcade Physics
- Map collisions via **tilemap collision layer (required for this direction)**
- Use a tilemap layer with collision enabled via tile properties (e.g., `collides: true`) or by index.

#### Destructible Tiles (Tree Chopping)
- Trees are obstacle tiles with properties like:
  - `kind: tree`
  - `collides: true`
  - `choppable: true`
  - `woodYield: number` (optional; can be constant for MVP)
- When a scout completes a chop action:
  - Replace the tree tile with a ground tile (or remove it)
  - Ensure collision is removed for that tile
  - Increment the global wood stockpile

#### River
- Water tiles are collidable and non-destructible for MVP.

## Save/Load
- None for MVP

## Performance Notes
- Texture atlases later; for MVP, separate PNGs are fine
- Avoid per-frame expensive searches; use simple lists and state changes
