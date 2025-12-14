import Phaser from 'phaser';

import type { TileTarget } from '../types';
import { findNearestWalkableAround, findPathAStar, type Grid, type TilePoint } from './pathfinding';

export type TilemapWorld = {
  seed: number;
  tileSize: number;
  cols: number;
  rows: number;
  width: number;
  height: number;

  layer: Phaser.Tilemaps.TilemapLayer;

  clearingCenter: { x: number; y: number };
  leaderSpawn: { x: number; y: number };
  scoutSpawns: Array<{ x: number; y: number }>;

  woodYieldPerTree: number;
  waterYieldPerFetch: number;

  worldToTile: (x: number, y: number) => { tx: number; ty: number };
  tileToWorldCenter: (tx: number, ty: number) => { x: number; y: number };
  isWalkable: (tx: number, ty: number) => boolean;
  findNearestWalkableWorld: (x: number, y: number, maxRadiusTiles: number) => { x: number; y: number };
  findPath: (fromX: number, fromY: number, toX: number, toY: number) => Array<{ x: number; y: number }> | null;

  findNearestTreeTarget: (x: number, y: number, maxDist: number) => TileTarget | null;
  findNearestWaterTarget: (x: number, y: number, maxDist: number) => TileTarget | null;
  findNearestTreeTargetInCone: (
    x: number,
    y: number,
    maxDist: number,
    facing: Phaser.Math.Vector2,
    minDot: number,
  ) => TileTarget | null;
  findNearestWaterTargetInCone: (
    x: number,
    y: number,
    maxDist: number,
    facing: Phaser.Math.Vector2,
    minDot: number,
  ) => TileTarget | null;
  chopTreeAt: (tx: number, ty: number) => number;
};

const TILE = {
  FOREST_A: 0,
  FOREST_B: 1,
  CLEARING: 2,
  PATH: 3,
  WATER: 4,
  TREE: 5,
  ROCK: 6,
} as const;

function hash2(x: number, y: number) {
  const s = Math.sin(x * 127.1 + y * 311.7) * 43758.5453123;
  return s - Math.floor(s);
}

function hash2Seeded(x: number, y: number, seed: number) {
  // Deterministic pseudo-random in [0,1) varying by (x,y,seed).
  const s = Math.sin(x * 127.1 + y * 311.7 + seed * 0.001) * 43758.5453123;
  return s - Math.floor(s);
}

function tileCenter(tileSize: number, tx: number, ty: number) {
  return { x: tx * tileSize + tileSize / 2, y: ty * tileSize + tileSize / 2 };
}

export function createTilemapWorld(params: {
  scene: Phaser.Scene;
  cols?: number;
  rows?: number;
  tileSize?: number;
  seed?: number;
}): TilemapWorld {
  const { scene } = params;
  const tileSize = params.tileSize ?? 32;
  const cols = params.cols ?? 50;
  const rows = params.rows ?? 32;
  const seed = params.seed ?? Math.floor(Math.random() * 1_000_000_000);

  const width = cols * tileSize;
  const height = rows * tileSize;

  const map = scene.make.tilemap({ width: cols, height: rows, tileWidth: tileSize, tileHeight: tileSize });
  const tileset = map.addTilesetImage('tileset32');
  if (!tileset) {
    throw new Error('Missing tileset texture: tileset32');
  }

  const layer = map.createBlankLayer('world', tileset, 0, 0, cols, rows, tileSize, tileSize);
  if (!layer) {
    throw new Error('Failed to create tilemap layer');
  }

  // Generate terrain.
  const clearingJitterX = Math.round((hash2Seeded(10, 20, seed) - 0.5) * 4);
  const clearingJitterY = Math.round((hash2Seeded(30, 40, seed) - 0.5) * 4);
  const clearingCenterTx = Phaser.Math.Clamp(Math.floor(cols * 0.5) + clearingJitterX, 6, cols - 7);
  const clearingCenterTy = Phaser.Math.Clamp(Math.floor(rows * 0.5) + clearingJitterY, 6, rows - 7);
  const clearingRadius = 6;

  const riverBaseTx = Phaser.Math.Clamp(
    Math.floor(cols * (0.72 + hash2Seeded(1, 2, seed) * 0.12)),
    8,
    cols - 8,
  );

  for (let ty = 0; ty < rows; ty++) {
    // Meandering vertical river.
    const riverDx = Math.round(
      Math.sin(ty * 0.32 + seed * 0.0008) * 2 + Math.sin(ty * 0.07 + seed * 0.0016) * 1,
    );
    const riverTx = Phaser.Math.Clamp(riverBaseTx + riverDx, 3, cols - 4);

    for (let tx = 0; tx < cols; tx++) {
      const v = hash2Seeded(tx, ty, seed);
      const baseGround = v < 0.5 ? TILE.FOREST_A : TILE.FOREST_B;

      // River tiles.
      if (Math.abs(tx - riverTx) <= 1) {
        layer.putTileAt(TILE.WATER, tx, ty);
        continue;
      }

      // Clearing.
      const dToCenter = Phaser.Math.Distance.Between(tx, ty, clearingCenterTx, clearingCenterTy);
      if (dToCenter <= clearingRadius) {
        layer.putTileAt(TILE.CLEARING, tx, ty);
        continue;
      }

      // A subtle path corridor from clearing toward the river (mostly blocked by trees).
      const pathBand = Math.abs(ty - clearingCenterTy) <= 1;
      const inPathX = tx > clearingCenterTx + clearingRadius && tx < riverTx - 2;
      if (pathBand && inPathX && v < 0.18) {
        layer.putTileAt(TILE.PATH, tx, ty);
        continue;
      }

      // Forest ground base.
      layer.putTileAt(baseGround, tx, ty);

      // Obstacles.
      // Make a dense ring around the clearing so you must chop to open routes.
      const isRing = dToCenter > clearingRadius && dToCenter < clearingRadius + 2.2;
      const treeChance = isRing ? 0.92 : 0.38;
      const rockChance = isRing ? 0.06 : 0.06;

      const r = hash2Seeded(tx + 1000, ty + 2000, seed);
      if (r < treeChance) {
        layer.putTileAt(TILE.TREE, tx, ty);
      } else if (r < treeChance + rockChance) {
        layer.putTileAt(TILE.ROCK, tx, ty);
      }
    }
  }

  // Collision.
  layer.setCollision([TILE.TREE, TILE.ROCK, TILE.WATER], true);
  layer.setCollision([TILE.FOREST_A, TILE.FOREST_B, TILE.CLEARING, TILE.PATH], false);

  // Helpful spawn positions in the clearing.
  const clearingCenter = tileCenter(tileSize, clearingCenterTx, clearingCenterTy);
  const leaderSpawn = tileCenter(tileSize, clearingCenterTx - 2, clearingCenterTy);
  const scoutSpawns = [
    tileCenter(tileSize, clearingCenterTx, clearingCenterTy + 1),
    tileCenter(tileSize, clearingCenterTx + 1, clearingCenterTy + 1),
    tileCenter(tileSize, clearingCenterTx + 1, clearingCenterTy - 1),
  ];

  const woodYieldPerTree = 2;
  const waterYieldPerFetch = 2;

  const worldToTile = (x: number, y: number) => {
    return {
      tx: Phaser.Math.Clamp(Math.floor(x / tileSize), 0, cols - 1),
      ty: Phaser.Math.Clamp(Math.floor(y / tileSize), 0, rows - 1),
    };
  };

  const tileToWorldCenter = (tx: number, ty: number) => tileCenter(tileSize, tx, ty);

  const isWalkable = (tx: number, ty: number) => {
    const t = layer.getTileAt(tx, ty);
    if (!t) return true;
    return !t.collides;
  };

  const grid: Grid = { cols, rows, isWalkable };

  const findNearestWalkableWorld = (x: number, y: number, maxRadiusTiles: number) => {
    const base = worldToTile(x, y);
    const found = findNearestWalkableAround(grid, base, maxRadiusTiles);
    if (!found) return tileToWorldCenter(base.tx, base.ty);
    return tileToWorldCenter(found.tx, found.ty);
  };

  const findPath = (fromX: number, fromY: number, toX: number, toY: number) => {
    const start = worldToTile(fromX, fromY);
    const goalRaw = worldToTile(toX, toY);
    const goal = findNearestWalkableAround(grid, goalRaw, 3);
    if (!goal) return null;

    const startOk = findNearestWalkableAround(grid, start, 2) ?? start;
    const path = findPathAStar(grid, startOk, goal);
    if (!path) return null;

    // Convert to world centers (skip the starting tile so we don't jitter).
    const out = path.slice(1).map((p) => tileToWorldCenter(p.tx, p.ty));
    return out.length ? out : [tileToWorldCenter(goal.tx, goal.ty)];
  };

  const findNearestTreeTarget = (x: number, y: number, maxDist: number): TileTarget | null => {
    const maxTiles = Math.ceil(maxDist / tileSize);
    const baseTx = Phaser.Math.Clamp(Math.floor(x / tileSize), 0, cols - 1);
    const baseTy = Phaser.Math.Clamp(Math.floor(y / tileSize), 0, rows - 1);

    let best: TileTarget | null = null;
    let bestDist = Number.POSITIVE_INFINITY;

    for (let dy = -maxTiles; dy <= maxTiles; dy++) {
      for (let dx = -maxTiles; dx <= maxTiles; dx++) {
        const tx = baseTx + dx;
        const ty = baseTy + dy;
        if (tx < 0 || ty < 0 || tx >= cols || ty >= rows) continue;

        const tile = layer.getTileAt(tx, ty);
        if (!tile || tile.index !== TILE.TREE) continue;

        // Trees are collidable; choose a reachable stand point on an adjacent non-colliding tile.
        const stand = findNearestWalkableAround(grid, { tx, ty }, 1);
        if (!stand) continue;
        if (stand.tx === tx && stand.ty === ty) continue;

        const c = tileToWorldCenter(stand.tx, stand.ty);
        const src = tileToWorldCenter(tx, ty);
        const d = Phaser.Math.Distance.Between(x, y, c.x, c.y);
        if (d <= maxDist && d < bestDist) {
          bestDist = d;
          best = { kind: 'tree', tx, ty, x: c.x, y: c.y, sourceX: src.x, sourceY: src.y };
        }
      }
    }

    return best;
  };

  const findNearestTreeTargetInCone = (
    x: number,
    y: number,
    maxDist: number,
    facing: Phaser.Math.Vector2,
    minDot: number,
  ): TileTarget | null => {
    const maxTiles = Math.ceil(maxDist / tileSize);
    const baseTx = Phaser.Math.Clamp(Math.floor(x / tileSize), 0, cols - 1);
    const baseTy = Phaser.Math.Clamp(Math.floor(y / tileSize), 0, rows - 1);

    let best: TileTarget | null = null;
    let bestDist = Number.POSITIVE_INFINITY;

    for (let dy = -maxTiles; dy <= maxTiles; dy++) {
      for (let dx = -maxTiles; dx <= maxTiles; dx++) {
        const tx = baseTx + dx;
        const ty = baseTy + dy;
        if (tx < 0 || ty < 0 || tx >= cols || ty >= rows) continue;

        const tile = layer.getTileAt(tx, ty);
        if (!tile || tile.index !== TILE.TREE) continue;

        const stand = findNearestWalkableAround(grid, { tx, ty }, 1);
        if (!stand) continue;
        if (stand.tx === tx && stand.ty === ty) continue;

        const standWorld = tileToWorldCenter(stand.tx, stand.ty);
        const src = tileToWorldCenter(tx, ty);

        const dist = Phaser.Math.Distance.Between(x, y, src.x, src.y);
        if (dist > maxDist) continue;

        const dxw = src.x - x;
        const dyw = src.y - y;
        const inv = dist < 1e-6 ? 0 : 1 / dist;
        const dot = dist < 1e-6 ? 1 : (dxw * inv) * facing.x + (dyw * inv) * facing.y;
        if (dot < minDot) continue;

        if (dist < bestDist) {
          bestDist = dist;
          best = { kind: 'tree', tx, ty, x: standWorld.x, y: standWorld.y, sourceX: src.x, sourceY: src.y };
        }
      }
    }

    return best;
  };

  const findNearestWaterTarget = (x: number, y: number, maxDist: number): TileTarget | null => {
    const maxTiles = Math.ceil(maxDist / tileSize);
    const baseTx = Phaser.Math.Clamp(Math.floor(x / tileSize), 0, cols - 1);
    const baseTy = Phaser.Math.Clamp(Math.floor(y / tileSize), 0, rows - 1);

    let best: TileTarget | null = null;
    let bestDist = Number.POSITIVE_INFINITY;

    for (let dy = -maxTiles; dy <= maxTiles; dy++) {
      for (let dx = -maxTiles; dx <= maxTiles; dx++) {
        const tx = baseTx + dx;
        const ty = baseTy + dy;
        if (tx < 0 || ty < 0 || tx >= cols || ty >= rows) continue;

        const tile = layer.getTileAt(tx, ty);
        if (!tile || tile.index !== TILE.WATER) continue;

        // Water is collidable; choose a reachable stand point on an adjacent non-colliding tile.
        const neighbors = [
          { tx: tx + 1, ty },
          { tx: tx - 1, ty },
          { tx, ty: ty + 1 },
          { tx, ty: ty - 1 },
        ];

        let bestStand: { x: number; y: number; d: number } | null = null;
        for (const n of neighbors) {
          if (n.tx < 0 || n.ty < 0 || n.tx >= cols || n.ty >= rows) continue;
          const nt = layer.getTileAt(n.tx, n.ty);
          if (!nt) continue;
          if (nt.index === TILE.WATER || nt.index === TILE.TREE || nt.index === TILE.ROCK) continue;

          const c = tileCenter(tileSize, n.tx, n.ty);
          const d = Phaser.Math.Distance.Between(x, y, c.x, c.y);
          if (!bestStand || d < bestStand.d) bestStand = { x: c.x, y: c.y, d };
        }

        if (!bestStand) continue;
        const src = tileToWorldCenter(tx, ty);
        if (bestStand.d <= maxDist && bestStand.d < bestDist) {
          bestDist = bestStand.d;
          best = { kind: 'water', tx, ty, x: bestStand.x, y: bestStand.y, sourceX: src.x, sourceY: src.y };
        }
      }
    }

    return best;
  };

  const findNearestWaterTargetInCone = (
    x: number,
    y: number,
    maxDist: number,
    facing: Phaser.Math.Vector2,
    minDot: number,
  ): TileTarget | null => {
    const maxTiles = Math.ceil(maxDist / tileSize);
    const baseTx = Phaser.Math.Clamp(Math.floor(x / tileSize), 0, cols - 1);
    const baseTy = Phaser.Math.Clamp(Math.floor(y / tileSize), 0, rows - 1);

    let best: TileTarget | null = null;
    let bestDist = Number.POSITIVE_INFINITY;

    for (let dy = -maxTiles; dy <= maxTiles; dy++) {
      for (let dx = -maxTiles; dx <= maxTiles; dx++) {
        const tx = baseTx + dx;
        const ty = baseTy + dy;
        if (tx < 0 || ty < 0 || tx >= cols || ty >= rows) continue;

        const tile = layer.getTileAt(tx, ty);
        if (!tile || tile.index !== TILE.WATER) continue;

        const neighbors = [
          { tx: tx + 1, ty },
          { tx: tx - 1, ty },
          { tx, ty: ty + 1 },
          { tx, ty: ty - 1 },
        ];

        let bestStand: { x: number; y: number } | null = null;
        let bestStandDist = Number.POSITIVE_INFINITY;
        for (const n of neighbors) {
          if (n.tx < 0 || n.ty < 0 || n.tx >= cols || n.ty >= rows) continue;
          const nt = layer.getTileAt(n.tx, n.ty);
          if (!nt) continue;
          if (nt.index === TILE.WATER || nt.index === TILE.TREE || nt.index === TILE.ROCK) continue;
          const c = tileToWorldCenter(n.tx, n.ty);
          const d = Phaser.Math.Distance.Between(x, y, c.x, c.y);
          if (d < bestStandDist) {
            bestStandDist = d;
            bestStand = c;
          }
        }
        if (!bestStand) continue;

        const src = tileToWorldCenter(tx, ty);
        const dist = Phaser.Math.Distance.Between(x, y, src.x, src.y);
        if (dist > maxDist) continue;

        const dxw = src.x - x;
        const dyw = src.y - y;
        const inv = dist < 1e-6 ? 0 : 1 / dist;
        const dot = dist < 1e-6 ? 1 : (dxw * inv) * facing.x + (dyw * inv) * facing.y;
        if (dot < minDot) continue;

        if (dist < bestDist) {
          bestDist = dist;
          best = { kind: 'water', tx, ty, x: bestStand.x, y: bestStand.y, sourceX: src.x, sourceY: src.y };
        }
      }
    }

    return best;
  };

  const chopTreeAt = (tx: number, ty: number): number => {
    const tile = layer.getTileAt(tx, ty);
    if (!tile || tile.index !== TILE.TREE) return 0;

    const v = hash2Seeded(tx, ty, seed);
    const replacement = v < 0.5 ? TILE.FOREST_A : TILE.FOREST_B;
    layer.putTileAt(replacement, tx, ty);

    return woodYieldPerTree;
  };

  return {
    seed,
    tileSize,
    cols,
    rows,
    width,
    height,
    layer,
    clearingCenter,
    leaderSpawn,
    scoutSpawns,
    woodYieldPerTree,
    waterYieldPerFetch,

    worldToTile,
    tileToWorldCenter,
    isWalkable,
    findNearestWalkableWorld,
    findPath,

    findNearestTreeTarget,
    findNearestWaterTarget,
    findNearestTreeTargetInCone,
    findNearestWaterTargetInCone,
    chopTreeAt,
  };
}
