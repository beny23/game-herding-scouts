# 07 — Open Questions

## Still Locked (2025-12-14)
These decisions still apply unless explicitly changed:

1) Control model: **Leader-only**
- Player controls the leader; scouts are commanded/automated

2) Art direction for MVP: **Clean vector/cartoon** (simple placeholders OK)

3) Difficulty / pacing: **Relaxed sandbox** (no fail state)

4) Scout command UX: **Simple interact**
- Interact to assign nearest idle scout
- Interact with scout toggles Follow/Idle

## New Questions (Tilemap + Wood + River Direction)
1) Tilemap source
- A) Authored in **Tiled** (JSON + tileset) (recommended)
- B) Procedural generation only (fast iteration, harder to art-direct)

2) How does the leader target a tile for interaction?
- A) “Nearest relevant tile within radius” (no facing)
- B) “Facing tile” (requires leader facing)
- C) Mouse hover/cursor (less keyboard-first)

3) Wood economy
- Wood yield per tree (constant vs per-tile property)
- Hut wood costs (e.g., 5/8/10) and number of huts required for win

4) Clearing paths
- Are *all* trees choppable?
- Or are some trees permanent obstacles (for level shaping)?

5) River role (MVP)
- A) Pure blocker/landmark (no interaction)
- B) Requires clearing a path to a crossing point
- C) Bridge building (MVP+)

