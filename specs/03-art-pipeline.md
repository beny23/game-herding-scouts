# 03 — Art Pipeline (Sprites, Animations, Backgrounds)

This document describes how to create and export **sprites**, **animations**, and **backgrounds/tiles** for a top‑down Phaser game.

## MVP Decision (2025-12-14)
- Art direction: **Option B (Vector / Cartoon)** (simplest; placeholders are fine early on)

## Recommended Approach
Use **tiles + props** for the environment (easy to iterate), and sprite sheets (or atlases) for characters.

## Option A — Pixel Art (fast iteration)
### Tools
- Aseprite (paid) / Libresprite (free) / Piskel (free)

### Sprite Sizes
- Character frames: **32×32** or **48×48** per frame
- Export scale: 2× or 3× for crisp pixels

### Character Directions & Animations (MVP)
Top-down usually needs 4 directions:
- Down, Up, Left, Right

Animations:
- Idle: 1 frame per direction (or reuse a single idle-down for MVP)
- Walk: 4–6 frames loop per direction
- Work/Build: 3–5 frames loop per direction (or only down-facing for MVP)

### Sprite Sheet Layout (simple)
- Rows = directions
- Columns = animation frames

Example (4 rows × 6 columns):
- Row 0: walk-down frames 0–5
- Row 1: walk-left frames 0–5
- Row 2: walk-right frames 0–5
- Row 3: walk-up frames 0–5

### Export Rules (important)
- PNG, transparent background
- No anti-aliasing
- Consistent frame size
- Align the character feet to a consistent baseline across frames

## Option B — Vector / Cartoon
### Tools
- Figma, Inkscape, Illustrator, Affinity Designer

### Export
- Export each frame as PNG with consistent canvas size
- Consider a texture atlas later for performance

## Environment Art: Tiles vs Single Background
### Tilemap (recommended)
- Build a tileset image (tile size 16×16 or 32×32)
- Use Tiled to lay out the map
- Export map as JSON
- Mark collision tiles on a dedicated layer

### Single Painted Background (fast MVP)
- Paint/export one large PNG (e.g., 1920×1080 or larger)
- Add invisible collision rectangles in code
- Downside: harder to iterate on layout

## Campsite Objects (Props)
Create sprites for:
- Tent: `unbuilt → halfBuilt → built`
- Campfire ring: `unlit → lit`
- Flagpole: `down → raised`
- Woodpile, water source, supply crate

## Animation Strategy in Phaser
- Define animations once (per Scene or globally)
- Switch animation by movement direction and velocity
- For build/work: play a looping animation while a timer/progress runs

## Suggested Asset Organization
- `assets/sprites/leader.png`
- `assets/sprites/scout_01.png`
- `assets/tiles/forest_tiles.png`
- `assets/props/tent.png`
- `assets/maps/clearing.json`
