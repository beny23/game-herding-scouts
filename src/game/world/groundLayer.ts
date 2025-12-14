import Phaser from 'phaser';

type WorldSize = { width: number; height: number };

type CreateGroundLayerParams = {
  scene: Phaser.Scene;
  world: WorldSize;
  tileSize?: number;
  spawn?: { x: number; y: number };
  clearing?: { x: number; y: number; radius?: number };
};

function hash2(x: number, y: number) {
  // Deterministic hash in [0, 1)
  const s = Math.sin(x * 127.1 + y * 311.7) * 43758.5453123;
  return s - Math.floor(s);
}

function distPointToSegment(px: number, py: number, ax: number, ay: number, bx: number, by: number) {
  const abx = bx - ax;
  const aby = by - ay;
  const apx = px - ax;
  const apy = py - ay;
  const abLen2 = abx * abx + aby * aby;
  const t = abLen2 <= 0.00001 ? 0 : Phaser.Math.Clamp((apx * abx + apy * aby) / abLen2, 0, 1);
  const cx = ax + abx * t;
  const cy = ay + aby * t;
  return Phaser.Math.Distance.Between(px, py, cx, cy);
}

export function createGroundLayer(params: CreateGroundLayerParams) {
  const { scene, world } = params;
  const tileSize = params.tileSize ?? 64;

  const spawn = params.spawn ?? { x: 260, y: 260 };
  const clearing = params.clearing ?? { x: 880, y: 560, radius: 220 };

  // Draw a pre-baked background so we can use multiple tile textures.
  const rt = scene.add.renderTexture(0, 0, world.width, world.height).setOrigin(0, 0);
  rt.setDepth(-20);

  const cols = Math.ceil(world.width / tileSize);
  const rows = Math.ceil(world.height / tileSize);

  const pathEnd = { x: clearing.x, y: clearing.y };

  for (let ty = 0; ty < rows; ty++) {
    for (let tx = 0; tx < cols; tx++) {
      const x = tx * tileSize;
      const y = ty * tileSize;
      const cx = x + tileSize / 2;
      const cy = y + tileSize / 2;

      const v = hash2(tx, ty);
      const patch = hash2(Math.floor(tx / 2), Math.floor(ty / 2));

      const toClearing = Phaser.Math.Distance.Between(cx, cy, clearing.x, clearing.y);
      const inClearing = toClearing < (clearing.radius ?? 220);

      const pathDist = distPointToSegment(cx, cy, spawn.x, spawn.y, pathEnd.x, pathEnd.y);
      const onPath = pathDist < 58;

      let key = 'ground_forest_a';

      if (inClearing) {
        key = v < 0.5 ? 'ground_clearing_a' : 'ground_clearing_b';
      } else if (onPath) {
        key = v < 0.5 ? 'ground_path_a' : 'ground_path_b';
      } else if (patch < 0.28) {
        key = v < 0.55 ? 'ground_moss_a' : 'ground_moss_b';
      } else if (patch > 0.78) {
        key = v < 0.5 ? 'ground_forest_b' : 'ground_forest_c';
      } else {
        key = v < 0.33 ? 'ground_forest_a' : v < 0.66 ? 'ground_forest_b' : 'ground_forest_c';
      }

      rt.draw(key, cx, cy);
    }
  }

  return rt;
}
