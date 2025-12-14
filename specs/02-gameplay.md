# 02 — Gameplay

## Core Gameplay Loop
1. Explore the clearing to find **resource spots**.
2. **Assign scouts** to tasks (gather, carry, build).
3. Deliver items to build points.
4. Place campsite objects in valid zones.
5. Complete checklist → win.

## Player Character: Scout Leader
- Movement: 8-direction (WASD/arrow keys)
- Interact key: `E` (or Space)
- Interactions:
  - Assign nearby scouts (simple, interact-based)
  - Pick up / drop items
  - Start/continue building at a build site

## Scout Command UX (MVP)
- Interact (`E`) with a **resource node** or **build site** to request help; the **nearest idle scout** is assigned to that target.
- Interact (`E`) with a **scout** to toggle them between **Follow** and **Idle**.

## Scouts (NPCs)
### Behavior States (MVP)
- Idle: wait near leader (optional gentle wander)
- Follow: maintain distance behind leader
- GoTo: move toward a target (resource node or build site)
- Carry: transport an item to a destination
- Work/Build: timed work animation that advances progress

### Navigation (MVP)
- Simple steering toward target + collision.
- Later upgrade path: grid-based pathfinding (e.g., EasyStar.js) once obstacles become more complex.

## Resources
- Woodpile → produces `wood`
- Water source → produces `water` (optional for campfire safety / cooking later)
- Supply crate → produces `tentParts`, `rope`, `stakes`

## Campsite Tasks (Checklist)
MVP checklist example:
- **Pitch Tent**: requires `tentParts + stakes` delivered to tent build site
- **Start Campfire**: requires `wood` delivered to fire ring site; must be in a fire-safe zone
- **Raise Flag**: requires `rope` delivered to flagpole site

## Win / Fail
- Win: all checklist tasks complete.
- Fail: none for MVP (relaxed sandbox).

## Controls (Draft)
- Move: WASD / Arrow keys
- Interact: E (or Space)
- Command (optional MVP+): `Q` whistle to rally scouts to leader
