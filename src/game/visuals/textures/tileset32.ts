import Phaser from 'phaser';

import type { TextureFactory } from './factory';

export function createTileset32Textures(f: TextureFactory) {
  const { makeTexture, stroke } = f;

  makeTexture('tileset32', 32 * 19, 32, (gfx) => {
    // 19 tiles laid out horizontally, 32x32 each.
    // Index mapping (keep in sync with `tilemapWorld.ts`):
    // 0 forest_a0, 1 forest_a1, 2 forest_b0, 3 forest_b1,
    // 4 clearing0, 5 clearing1,
    // 6 path_center, 7 path_edge,
    // 8 shore,
    // 9 water0, 10 water1, 11 water2, 12 water3,
    // 13 tree_a, 14 tree_b, 15 tree_c,
    // 16 rock_a, 17 rock_b, 18 rock_c

    const applyTileLighting = (ox: number) => {
      // Subtle, consistent top-left light and bottom-right shadow.
      gfx.fillStyle(0xffffff, 0.06);
      gfx.fillRect(ox + 1, 1, 30, 10);
      gfx.fillStyle(0xffffff, 0.03);
      gfx.fillRect(ox + 1, 1, 10, 30);

      gfx.fillStyle(0x000000, 0.09);
      gfx.fillRect(ox + 1, 22, 30, 9);
      gfx.fillStyle(0x000000, 0.06);
      gfx.fillRect(ox + 22, 1, 9, 30);

      // Slight edge separation without a boxed outline.
      gfx.fillStyle(0x000000, 0.08);
      gfx.fillRect(ox + 31, 0, 1, 32);
      gfx.fillRect(ox, 31, 32, 1);
    };

    const drawForest = (ox: number, base: number, foliageA: number, foliageB: number, accent: number) => {
      gfx.fillStyle(base, 1);
      gfx.fillRect(ox, 0, 32, 32);

      // Broad shadow pockets (less speckle, more readable texture).
      gfx.fillStyle(0x050e09, 0.33);
      for (let i = 0; i < 3; i++) {
        gfx.fillCircle(ox + Phaser.Math.Between(6, 26), Phaser.Math.Between(6, 26), Phaser.Math.Between(6, 9));
      }

      // Leaf clumps.
      gfx.fillStyle(foliageA, 0.9);
      for (let i = 0; i < 14; i++) {
        gfx.fillCircle(ox + Phaser.Math.Between(2, 29), Phaser.Math.Between(2, 29), Phaser.Math.Between(2, 4));
      }
      gfx.fillStyle(foliageB, 0.8);
      for (let i = 0; i < 10; i++) {
        gfx.fillCircle(ox + Phaser.Math.Between(2, 29), Phaser.Math.Between(2, 29), Phaser.Math.Between(1, 3));
      }

      // Tiny accents (flowers / fireflies).
      gfx.fillStyle(accent, 0.13);
      for (let i = 0; i < 4; i++) gfx.fillRect(ox + Phaser.Math.Between(2, 29), Phaser.Math.Between(2, 29), 1, 1);

      applyTileLighting(ox);
    };

    const drawClearing = (ox: number, variant: 0 | 1) => {
      gfx.fillStyle(0x2a2f1d, 1);
      gfx.fillRect(ox, 0, 32, 32);

      // Trampled grass streaks.
      gfx.lineStyle(2, 0xa3a36a, 0.24);
      for (let i = 0; i < 10; i++) {
        const x1 = ox + Phaser.Math.Between(0, 31);
        const y1 = Phaser.Math.Between(0, 31);
        gfx.beginPath();
        gfx.moveTo(x1, y1);
        gfx.lineTo(x1 + Phaser.Math.Between(6, 14), y1 + Phaser.Math.Between(-2, 6));
        gfx.strokePath();
      }

      // Dirt patches.
      gfx.fillStyle(0x3f1d0b, variant === 0 ? 0.12 : 0.16);
      const n = variant === 0 ? 8 : 12;
      for (let i = 0; i < n; i++) {
        gfx.fillCircle(ox + Phaser.Math.Between(4, 28), Phaser.Math.Between(4, 28), Phaser.Math.Between(2, variant === 0 ? 5 : 6));
      }

      // Small stones (variant 1 reads a bit more "used").
      if (variant === 1) {
        gfx.fillStyle(0xe5e7eb, 0.18);
        for (let i = 0; i < 10; i++) gfx.fillRect(ox + Phaser.Math.Between(3, 29), Phaser.Math.Between(3, 29), 1, 1);
      }

      applyTileLighting(ox);
    };

    const drawPath = (ox: number, kind: 'center' | 'edge') => {
      gfx.fillStyle(0x0a1710, 1);
      gfx.fillRect(ox, 0, 32, 32);

      // Packed dirt band.
      gfx.fillStyle(0x3b2a1a, 1);
      gfx.fillRoundedRect(ox + 0, 8, 32, 16, 9);

      // Darker edges to read as a worn groove.
      gfx.fillStyle(0x2a1b10, kind === 'center' ? 0.55 : 0.68);
      gfx.fillRoundedRect(ox + 0, 8, 32, 4, 9);
      gfx.fillRoundedRect(ox + 0, 20, 32, 4, 9);

      if (kind === 'edge') {
        // Slight grass creep-in at the edges so borders read intentional.
        gfx.fillStyle(0x14532d, 0.28);
        gfx.fillRoundedRect(ox + 0, 6, 32, 4, 9);
        gfx.fillRoundedRect(ox + 0, 22, 32, 4, 9);
      }

      // Pebbles.
      gfx.fillStyle(0xe5e7eb, 0.28);
      for (let i = 0; i < 10; i++) {
        gfx.fillRect(ox + Phaser.Math.Between(4, 28), Phaser.Math.Between(10, 22), 1, 1);
      }

      applyTileLighting(ox);
    };

    const drawShore = (ox: number) => {
      // Wet bank / muddy shoreline tile (orientation-agnostic).
      gfx.fillStyle(0x0a1710, 1);
      gfx.fillRect(ox, 0, 32, 32);

      // Damp gradient.
      gfx.fillStyle(0x0b2942, 0.14);
      gfx.fillRect(ox, 0, 32, 12);
      gfx.fillStyle(0x0b2942, 0.08);
      gfx.fillRect(ox, 12, 32, 10);

      // Mud patches + a couple of pebbles.
      gfx.fillStyle(0x3b2a1a, 0.12);
      for (let i = 0; i < 6; i++) gfx.fillCircle(ox + Phaser.Math.Between(4, 28), Phaser.Math.Between(6, 28), Phaser.Math.Between(2, 5));
      gfx.fillStyle(0xe5e7eb, 0.18);
      for (let i = 0; i < 6; i++) gfx.fillRect(ox + Phaser.Math.Between(4, 28), Phaser.Math.Between(6, 28), 1, 1);

      // Soft foam flecks.
      gfx.fillStyle(0x38bdf8, 0.14);
      for (let i = 0; i < 6; i++) gfx.fillRect(ox + Phaser.Math.Between(2, 29), Phaser.Math.Between(2, 14), 1, 1);

      applyTileLighting(ox);
    };

    const drawWaterFrame = (ox: number, frame: 0 | 1 | 2 | 3) => {
      gfx.fillStyle(0x0b2942, 1);
      gfx.fillRect(ox, 0, 32, 32);

      // Depth gradient.
      gfx.fillStyle(0x0b3a5a, 0.35);
      gfx.fillRect(ox, 0, 32, 10);
      gfx.fillStyle(0x07263d, 0.35);
      gfx.fillRect(ox, 22, 32, 10);

      // Soft swells (fixed positions, slightly phase-shifted per frame).
      gfx.fillStyle(0x1d4ed8, 0.12);
      const swell = [
        { x: 9, y: 10, w: 16, h: 6 },
        { x: 22, y: 14, w: 14, h: 5 },
        { x: 14, y: 22, w: 18, h: 6 },
        { x: 6, y: 25, w: 14, h: 5 },
      ];
      for (const s of swell) {
        const wob = Math.sin((s.y + frame * 3) * 0.35) * 1.4;
        gfx.fillEllipse(ox + s.x + wob, s.y + Math.cos((s.x + frame * 2) * 0.4) * 1.0, s.w, s.h);
      }

      // Wave highlights (animated by phase).
      gfx.lineStyle(2, 0x38bdf8, 0.18);
      const phase = frame * 0.9;
      for (let y = 7; y <= 27; y += 7) {
        const wob = Math.sin(y * 0.35 + phase) * 1.6;
        gfx.beginPath();
        gfx.moveTo(ox + 2, y + wob);
        gfx.lineTo(ox + 30, y - wob);
        gfx.strokePath();
      }

      applyTileLighting(ox);
    };

    const drawTreeA = (ox: number) => {
      // Round-canopy tree (oak-ish).
      gfx.fillStyle(0x0a1710, 1);
      gfx.fillRect(ox, 0, 32, 32);
      gfx.fillStyle(0x050e09, 0.22);
      gfx.fillCircle(ox + 18, 18, 10);

      gfx.fillStyle(0x000000, 0.16);
      gfx.fillEllipse(ox + 18, 22, 18, 8);

      gfx.fillStyle(0x14532d, 1);
      gfx.fillCircle(ox + 16, 15, 12);
      gfx.fillStyle(0x166534, 1);
      gfx.fillCircle(ox + 14, 14, 10);
      gfx.fillStyle(0x15803d, 1);
      gfx.fillCircle(ox + 18, 16, 8);
      gfx.fillStyle(0x22c55e, 0.22);
      gfx.fillCircle(ox + 12, 11, 5);

      gfx.fillStyle(0x5b3416, 0.95);
      gfx.fillRoundedRect(ox + 14, 18, 4, 7, 2);
      gfx.fillStyle(0x92400e, 0.35);
      gfx.fillRect(ox + 15, 19, 1, 5);
      gfx.lineStyle(1, stroke, 0.55);
      gfx.strokeRoundedRect(ox + 14, 18, 4, 7, 2);

      gfx.lineStyle(2, stroke, 0.55);
      gfx.strokeCircle(ox + 16, 15, 12);

      applyTileLighting(ox);
    };

    const drawTreeB = (ox: number) => {
      // Conifer / pine silhouette (taller, pointier).
      gfx.fillStyle(0x0a1710, 1);
      gfx.fillRect(ox, 0, 32, 32);
      gfx.fillStyle(0x050e09, 0.22);
      gfx.fillCircle(ox + 16, 20, 10);

      gfx.fillStyle(0x000000, 0.16);
      gfx.fillEllipse(ox + 16, 23, 16, 7);

      // Layered triangles to read as branches.
      gfx.fillStyle(0x14532d, 1);
      gfx.fillTriangle(ox + 16, 6, ox + 7, 18, ox + 25, 18);
      gfx.fillStyle(0x166534, 1);
      gfx.fillTriangle(ox + 16, 10, ox + 6, 22, ox + 26, 22);
      gfx.fillStyle(0x15803d, 1);
      gfx.fillTriangle(ox + 16, 14, ox + 7, 26, ox + 25, 26);

      gfx.fillStyle(0x22c55e, 0.18);
      gfx.fillTriangle(ox + 15, 8, ox + 11, 14, ox + 19, 14);

      // Trunk.
      gfx.fillStyle(0x5b3416, 0.95);
      gfx.fillRoundedRect(ox + 14, 20, 4, 7, 2);
      gfx.fillStyle(0x92400e, 0.32);
      gfx.fillRect(ox + 15, 21, 1, 5);
      gfx.lineStyle(1, stroke, 0.55);
      gfx.strokeRoundedRect(ox + 14, 20, 4, 7, 2);

      gfx.lineStyle(2, stroke, 0.55);
      gfx.strokeTriangle(ox + 16, 6, ox + 7, 18, ox + 25, 18);

      applyTileLighting(ox);
    };

    const drawTreeC = (ox: number) => {
      // Bushy / split-canopy tree (two-lobed).
      gfx.fillStyle(0x0a1710, 1);
      gfx.fillRect(ox, 0, 32, 32);
      gfx.fillStyle(0x050e09, 0.22);
      gfx.fillCircle(ox + 16, 18, 10);

      gfx.fillStyle(0x000000, 0.15);
      gfx.fillEllipse(ox + 16, 22, 17, 7);

      gfx.fillStyle(0x14532d, 1);
      gfx.fillCircle(ox + 12, 15, 10);
      gfx.fillCircle(ox + 20, 15, 10);
      gfx.fillStyle(0x166534, 1);
      gfx.fillCircle(ox + 11, 14, 8);
      gfx.fillCircle(ox + 21, 14, 8);
      gfx.fillStyle(0x15803d, 1);
      gfx.fillCircle(ox + 16, 17, 7);
      gfx.fillStyle(0x22c55e, 0.22);
      gfx.fillCircle(ox + 10, 11, 4);
      gfx.fillCircle(ox + 22, 11, 4);

      gfx.fillStyle(0x5b3416, 0.95);
      gfx.fillRoundedRect(ox + 14, 18, 4, 8, 2);
      gfx.fillStyle(0x92400e, 0.35);
      gfx.fillRect(ox + 15, 20, 1, 5);
      gfx.lineStyle(1, stroke, 0.55);
      gfx.strokeRoundedRect(ox + 14, 18, 4, 8, 2);

      gfx.lineStyle(2, stroke, 0.55);
      gfx.strokeCircle(ox + 12, 15, 10);
      gfx.strokeCircle(ox + 20, 15, 10);

      applyTileLighting(ox);
    };

    const drawRockA = (ox: number) => {
      // Rounded boulder.
      gfx.fillStyle(0x0a1710, 1);
      gfx.fillRect(ox, 0, 32, 32);
      gfx.fillStyle(0x050e09, 0.18);
      gfx.fillCircle(ox + 20, 20, 9);

      gfx.fillStyle(0x23304d, 1);
      gfx.fillRoundedRect(ox + 6, 9, 20, 16, 7);
      gfx.fillStyle(0x30446c, 0.85);
      gfx.fillRoundedRect(ox + 8, 11, 16, 6, 6);
      gfx.fillStyle(0x3b5584, 0.35);
      gfx.fillRoundedRect(ox + 10, 16, 10, 4, 4);

      gfx.fillStyle(0x34d399, 0.18);
      gfx.fillCircle(ox + 10, 18, 4);
      gfx.fillStyle(0xe5e7eb, 0.12);
      for (let i = 0; i < 6; i++) {
        gfx.fillRect(ox + Phaser.Math.Between(9, 23), Phaser.Math.Between(12, 23), 1, 1);
      }

      gfx.lineStyle(2, stroke, 0.65);
      gfx.strokeRoundedRect(ox + 6, 9, 20, 16, 7);

      applyTileLighting(ox);
    };

    const drawRockB = (ox: number) => {
      // Jagged rock (more angular silhouette).
      gfx.fillStyle(0x0a1710, 1);
      gfx.fillRect(ox, 0, 32, 32);
      gfx.fillStyle(0x050e09, 0.18);
      gfx.fillCircle(ox + 18, 21, 9);

      gfx.fillStyle(0x23304d, 1);
      gfx.fillTriangle(ox + 7, 22, ox + 12, 9, ox + 18, 24);
      gfx.fillTriangle(ox + 12, 9, ox + 26, 14, ox + 18, 24);
      gfx.fillTriangle(ox + 7, 22, ox + 18, 24, ox + 23, 26);

      gfx.fillStyle(0x30446c, 0.8);
      gfx.fillTriangle(ox + 13, 12, ox + 22, 15, ox + 16, 22);
      gfx.fillStyle(0x3b5584, 0.32);
      gfx.fillRect(ox + 11, 20, 9, 3);

      // Crack line.
      gfx.lineStyle(2, 0x0b1220, 0.25);
      gfx.beginPath();
      gfx.moveTo(ox + 14, 12);
      gfx.lineTo(ox + 16, 18);
      gfx.lineTo(ox + 13, 23);
      gfx.strokePath();

      gfx.lineStyle(2, stroke, 0.65);
      gfx.strokeTriangle(ox + 7, 22, ox + 12, 9, ox + 18, 24);
      gfx.strokeTriangle(ox + 12, 9, ox + 26, 14, ox + 18, 24);
      gfx.strokeTriangle(ox + 7, 22, ox + 18, 24, ox + 23, 26);

      applyTileLighting(ox);
    };

    const drawRockC = (ox: number) => {
      // Pebble cluster (reads as a different obstruction type).
      gfx.fillStyle(0x0a1710, 1);
      gfx.fillRect(ox, 0, 32, 32);
      gfx.fillStyle(0x050e09, 0.16);
      gfx.fillEllipse(ox + 18, 22, 18, 7);

      const peb = (x: number, y: number, r: number, hi: boolean) => {
        gfx.fillStyle(0x23304d, 1);
        gfx.fillCircle(ox + x, y, r);
        gfx.fillStyle(0x30446c, 0.75);
        gfx.fillCircle(ox + x - 1, y - 1, Math.max(1.8, r * 0.55));
        if (hi) {
          gfx.fillStyle(0x3b5584, 0.22);
          gfx.fillCircle(ox + x + 1, y + 1, Math.max(1.4, r * 0.4));
        }
        gfx.lineStyle(2, stroke, 0.55);
        gfx.strokeCircle(ox + x, y, r);
      };

      peb(12, 19, 5.2, true);
      peb(20, 20, 4.6, false);
      peb(17, 14, 4.2, true);
      peb(24, 23, 3.6, false);

      // Tiny lichen specks.
      gfx.fillStyle(0xe5e7eb, 0.1);
      for (let i = 0; i < 5; i++) {
        gfx.fillRect(ox + Phaser.Math.Between(10, 26), Phaser.Math.Between(12, 26), 1, 1);
      }

      applyTileLighting(ox);
    };

    // Forest variants.
    drawForest(0, 0x09140e, 0x0f2a1a, 0x163d26, 0xfbbf24);
    drawForest(32, 0x0a1510, 0x112d1c, 0x1a452b, 0xa78bfa);
    drawForest(64, 0x0b1911, 0x12321f, 0x1b4a2e, 0xfbbf24);
    drawForest(96, 0x0c1b13, 0x153724, 0x1f5534, 0x60a5fa);

    // Clearing variants.
    drawClearing(128, 0);
    drawClearing(160, 1);

    // Path tiles.
    drawPath(192, 'center');
    drawPath(224, 'edge');

    // Shore + animated water frames.
    drawShore(256);
    drawWaterFrame(288, 0);
    drawWaterFrame(320, 1);
    drawWaterFrame(352, 2);
    drawWaterFrame(384, 3);

    // Trees.
    drawTreeA(416);
    drawTreeB(448);
    drawTreeC(480);

    // Rocks.
    drawRockA(512);
    drawRockB(544);
    drawRockC(576);
  });
}
