# 05 — Level Content (MVP)

## Level: Forest Clearing
A single top‑down map with a central clearing for the campsite, surrounded by dense forest and featuring a **river**.

## Pacing
- Relaxed sandbox (no time limit / no fail state for MVP)

## Key Areas
- Campsite build zone (flat clearing)
- Dense forest (tile obstacles)
- A river (water tiles, impassable)
- One or more “blocked routes” that require chopping trees to open paths

## Required Objects
### Resource Sources
- Trees (tile obstacles) that can be chopped to yield wood

### Build Sites
- Hut build sites (inside clearing)

## Collisions
- Trees/rocks are non-walkable tiles
- Water (river) is non-walkable tiles
- Build sites are walkable but have interaction zones

## Map Production Notes
If using Tiled:
- Base layer: ground
- Obstacle layer: trees/rocks (collidable; trees also choppable)
- Water layer: river (collidable)
- Object layer: spawn points (leader + scouts), hut sites, goal markers

