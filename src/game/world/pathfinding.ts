import Phaser from 'phaser';

export type Grid = {
  cols: number;
  rows: number;
  isWalkable: (tx: number, ty: number) => boolean;
};

export type TilePoint = { tx: number; ty: number };

function key(tx: number, ty: number, cols: number) {
  return ty * cols + tx;
}

function heuristic(ax: number, ay: number, bx: number, by: number) {
  // Manhattan distance for 4-neighborhood.
  return Math.abs(ax - bx) + Math.abs(ay - by);
}

export function findPathAStar(grid: Grid, start: TilePoint, goal: TilePoint): TilePoint[] | null {
  const { cols, rows, isWalkable } = grid;

  if (start.tx === goal.tx && start.ty === goal.ty) return [start];
  if (goal.tx < 0 || goal.ty < 0 || goal.tx >= cols || goal.ty >= rows) return null;
  if (!isWalkable(goal.tx, goal.ty)) return null;

  const startKey = key(start.tx, start.ty, cols);
  const goalKey = key(goal.tx, goal.ty, cols);

  const gScore = new Float32Array(cols * rows);
  const fScore = new Float32Array(cols * rows);
  const cameFrom = new Int32Array(cols * rows);
  const inOpen = new Uint8Array(cols * rows);
  const inClosed = new Uint8Array(cols * rows);

  for (let i = 0; i < gScore.length; i++) {
    gScore[i] = Number.POSITIVE_INFINITY;
    fScore[i] = Number.POSITIVE_INFINITY;
    cameFrom[i] = -1;
  }

  gScore[startKey] = 0;
  fScore[startKey] = heuristic(start.tx, start.ty, goal.tx, goal.ty);

  // Open set as a simple array (grid is small).
  const open: number[] = [startKey];
  inOpen[startKey] = 1;

  const neighbors: Array<{ dx: number; dy: number }> = [
    { dx: 1, dy: 0 },
    { dx: -1, dy: 0 },
    { dx: 0, dy: 1 },
    { dx: 0, dy: -1 },
  ];

  while (open.length > 0) {
    // Find node in open set with lowest fScore.
    let bestIndex = 0;
    let bestKey = open[0]!;
    let bestF = fScore[bestKey]!;

    for (let i = 1; i < open.length; i++) {
      const k = open[i]!;
      const f = fScore[k]!;
      if (f < bestF) {
        bestF = f;
        bestKey = k;
        bestIndex = i;
      }
    }

    // Pop best.
    open.splice(bestIndex, 1);
    inOpen[bestKey] = 0;
    inClosed[bestKey] = 1;

    if (bestKey === goalKey) {
      // Reconstruct path.
      const out: TilePoint[] = [];
      let cur = bestKey;
      while (cur !== -1) {
        const tx = cur % cols;
        const ty = Math.floor(cur / cols);
        out.push({ tx, ty });
        cur = cameFrom[cur]!;
      }
      out.reverse();
      return out;
    }

    const cx = bestKey % cols;
    const cy = Math.floor(bestKey / cols);

    for (const n of neighbors) {
      const nx = cx + n.dx;
      const ny = cy + n.dy;
      if (nx < 0 || ny < 0 || nx >= cols || ny >= rows) continue;
      if (!isWalkable(nx, ny)) continue;

      const nk = key(nx, ny, cols);
      if (inClosed[nk]) continue;

      const tentativeG = gScore[bestKey]! + 1;
      if (!inOpen[nk]) {
        open.push(nk);
        inOpen[nk] = 1;
      } else if (tentativeG >= gScore[nk]!) {
        continue;
      }

      cameFrom[nk] = bestKey;
      gScore[nk] = tentativeG;
      fScore[nk] = tentativeG + heuristic(nx, ny, goal.tx, goal.ty);
    }
  }

  return null;
}

export function findNearestWalkableAround(grid: Grid, center: TilePoint, maxRadius: number): TilePoint | null {
  const { cols, rows, isWalkable } = grid;

  const cx = Phaser.Math.Clamp(center.tx, 0, cols - 1);
  const cy = Phaser.Math.Clamp(center.ty, 0, rows - 1);
  if (isWalkable(cx, cy)) return { tx: cx, ty: cy };

  for (let r = 1; r <= maxRadius; r++) {
    for (let dy = -r; dy <= r; dy++) {
      for (let dx = -r; dx <= r; dx++) {
        if (Math.abs(dx) !== r && Math.abs(dy) !== r) continue; // perimeter only
        const tx = cx + dx;
        const ty = cy + dy;
        if (tx < 0 || ty < 0 || tx >= cols || ty >= rows) continue;
        if (isWalkable(tx, ty)) return { tx, ty };
      }
    }
  }

  return null;
}
