# 05 — Level Content (MVP)

## Level: Forest Clearing
A single top‑down map with a central clearing for the campsite.

## Pacing
- Relaxed sandbox (no time limit / no fail state for MVP)

## Key Areas
- Campsite build zone (flat clearing)
- Resource nodes around the perimeter
- Obstacles (trees/rocks) forming natural boundaries

## Required Objects
### Resource Nodes
- Woodpile
- Water source
- Supply crate

### Build Sites
- Tent spot (inside clearing)
- Campfire ring spot (must be in a safe zone)
- Flagpole spot (near clearing edge)

## Collisions
- Trees/rocks are non-walkable
- Build sites are walkable but have interaction zones

## Map Production Notes
If using Tiled:
- Base layer: ground
- Detail layer: props
- Collision layer: collidable tiles
- Object layer: spawn points, interaction zones
