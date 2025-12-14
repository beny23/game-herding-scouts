# 02 — Gameplay

## Core Gameplay Loop
1. Move around the clearing and forest edge.
2. **Assign scouts** to chop down trees (tile obstacles).
3. Wood is added to the camp stockpile.
4. **Assign scouts** to build huts at build sites using wood.
5. Clear paths through the forest (by removing tree tiles) to reach new areas.
6. Complete all huts → win.

## Player Character: Scout Leader
- Movement: 8-direction (WASD/arrow keys)
- Interact key: `E` (or Space)
- Interactions:
  - Assign nearby scouts (simple, interact-based)
  - Start/continue work at a target (tree tile or hut site)

## Scout Command UX (MVP)
- Interact (`E`) with a **tree** (tile) or **hut build site** to request help; the **nearest idle scout** is assigned to that target.
- Interact (`E`) with a **scout** to toggle them between **Follow** and **Idle**.

## Scouts (NPCs)
### Behavior States (MVP)
- Idle: wait near leader (optional gentle wander)
- Follow: maintain distance behind leader
- GoTo: move toward a target (tree tile or build site)
- Chop: timed work that removes a tree tile and adds wood
- Build: timed work that consumes wood and advances hut progress

### Navigation (MVP)
- Simple steering toward target + collision.
- Later upgrade path: grid-based pathfinding (e.g., EasyStar.js) if needed.

## Resources
- `wood`
  - Source: **trees** (obstacle tiles) in the forest
  - Produced by: scouts performing **Chop** work on a tree tile
  - Stored as: a shared camp stockpile (simple MVP)

## Campsite Tasks (Checklist)
MVP checklist example:
- **Build Hut A**: costs a fixed amount of `wood`
- **Build Hut B**: costs a fixed amount of `wood`
- **Build Hut C** (optional): costs a fixed amount of `wood`

Notes:
- Exact wood costs are defined in the technical plan and can be tuned.
- Huts are built at predefined build sites inside the clearing.

## Win / Fail
- Win: all checklist tasks complete.
- Fail: none for MVP (relaxed sandbox).

## River
- A river is present on the map as an **impassable water region** (tile collision).
- MVP interaction: purely a traversal blocker / landmark.
- Future upgrade: bridge building, fishing, water collection.

## Controls (Draft)
- Move: WASD / Arrow keys
- Interact: E (or Space)
- Command (optional MVP+): `Q` whistle to rally scouts to leader
