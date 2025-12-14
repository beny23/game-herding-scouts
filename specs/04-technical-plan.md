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
- Resource nodes (produce items)
- Build sites (consume items; progress toward completion)

### Interaction Model (MVP)
- Leader-only control.
- `E` interaction on a resource node/build site assigns the nearest idle scout to that target.

### Data Definitions (MVP)
- `ItemType`: `wood | water | tentParts | rope | stakes`
- `TaskType`: `tent | campfire | flag`
- `TaskDefinition`: required items + target build site + completion state

### Scout AI (MVP)
- Finite state machine with a small set of states:
  - `Idle`, `Follow`, `GoToTarget`, `CarryItem`, `Work`

### Movement & Collisions
- Arcade Physics
- Map collisions via tilemap collision layer (preferred)
- If single background: manual static bodies/rectangles

## Save/Load
- None for MVP

## Performance Notes
- Texture atlases later; for MVP, separate PNGs are fine
- Avoid per-frame expensive searches; use simple lists and state changes
