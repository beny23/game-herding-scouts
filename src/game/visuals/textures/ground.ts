import Phaser from 'phaser';

import type { TextureFactory } from './factory';

export function createGroundTextures(f: TextureFactory) {
  const { makeTexture } = f;

  const drawForestGround = (
    gfx: Phaser.GameObjects.Graphics,
    palette: {
      base: number;
      shadow: number;
      foliageA: number;
      foliageB: number;
      foliageC: number;
      accentGreen: number;
      accentChance: number;
    },
  ) => {
    gfx.fillStyle(palette.base, 1);
    gfx.fillRect(0, 0, 64, 64);

    gfx.fillStyle(palette.shadow, 0.9);
    for (let i = 0; i < 14; i++) {
      const x = Phaser.Math.Between(0, 63);
      const y = Phaser.Math.Between(0, 63);
      gfx.fillCircle(x, y, Phaser.Math.Between(6, 12));
    }

    const foliage = [palette.foliageA, palette.foliageB, palette.foliageC];
    for (let layer = 0; layer < 3; layer++) {
      gfx.fillStyle(foliage[layer]!, 0.95);
      const count = layer === 0 ? 170 : layer === 1 ? 120 : 70;
      const rMin = layer === 2 ? 2 : 1;
      const rMax = layer === 0 ? 2 : 3;
      for (let i = 0; i < count; i++) {
        const x = Phaser.Math.Between(0, 63);
        const y = Phaser.Math.Between(0, 63);
        gfx.fillCircle(x, y, Phaser.Math.Between(rMin, rMax));
      }
    }

    gfx.fillStyle(palette.accentGreen, 0.18);
    for (let i = 0; i < 18; i++) {
      const x = Phaser.Math.Between(0, 63);
      const y = Phaser.Math.Between(0, 63);
      gfx.fillCircle(x, y, Phaser.Math.Between(5, 9));
    }

    const accents = [0xf472b6, 0xfbbf24, 0x60a5fa];
    for (let i = 0; i < 10; i++) {
      if (Phaser.Math.Between(0, 100) > palette.accentChance) continue;
      const x = Phaser.Math.Between(2, 61);
      const y = Phaser.Math.Between(2, 61);
      gfx.fillStyle(accents[Phaser.Math.Between(0, accents.length - 1)]!, 0.8);
      gfx.fillCircle(x, y, 1);
      gfx.fillStyle(0xffffff, 0.5);
      gfx.fillCircle(x + 0.5, y - 0.5, 0.5);
    }

    gfx.lineStyle(2, 0x0b1220, 0.7);
    gfx.strokeRect(1, 1, 62, 62);
  };

  // Keep old key as a default/compat texture.
  makeTexture('ground', 64, 64, (gfx) => {
    drawForestGround(gfx, {
      base: 0x0a1710,
      shadow: 0x07110b,
      foliageA: 0x0f2a1a,
      foliageB: 0x12321f,
      foliageC: 0x163d26,
      accentGreen: 0x22c55e,
      accentChance: 18,
    });
  });

  // New ground variants for a more varied environment.
  makeTexture('ground_forest_a', 64, 64, (gfx) => {
    drawForestGround(gfx, {
      base: 0x09140e,
      shadow: 0x050e09,
      foliageA: 0x0f2a1a,
      foliageB: 0x12321f,
      foliageC: 0x163d26,
      accentGreen: 0x22c55e,
      accentChance: 14,
    });
  });

  makeTexture('ground_forest_b', 64, 64, (gfx) => {
    drawForestGround(gfx, {
      base: 0x0b1911,
      shadow: 0x06110b,
      foliageA: 0x12321f,
      foliageB: 0x163d26,
      foliageC: 0x1b4a2e,
      accentGreen: 0x34d399,
      accentChance: 20,
    });
  });

  makeTexture('ground_forest_c', 64, 64, (gfx) => {
    drawForestGround(gfx, {
      base: 0x08130d,
      shadow: 0x040b07,
      foliageA: 0x0b2417,
      foliageB: 0x10301d,
      foliageC: 0x134026,
      accentGreen: 0x4ade80,
      accentChance: 16,
    });
  });

  const drawMoss = (gfx: Phaser.GameObjects.Graphics, variant: 'a' | 'b') => {
    gfx.fillStyle(variant === 'a' ? 0x0a2014 : 0x081b12, 1);
    gfx.fillRect(0, 0, 64, 64);
    gfx.fillStyle(0x064e3b, 0.85);
    for (let i = 0; i < 140; i++) {
      const x = Phaser.Math.Between(0, 63);
      const y = Phaser.Math.Between(0, 63);
      gfx.fillCircle(x, y, Phaser.Math.Between(1, 3));
    }
    gfx.fillStyle(0x34d399, 0.22);
    for (let i = 0; i < 22; i++) {
      const x = Phaser.Math.Between(0, 63);
      const y = Phaser.Math.Between(0, 63);
      gfx.fillCircle(x, y, Phaser.Math.Between(6, 10));
    }
    gfx.lineStyle(2, 0x0b1220, 0.7);
    gfx.strokeRect(1, 1, 62, 62);
  };

  makeTexture('ground_moss_a', 64, 64, (gfx) => drawMoss(gfx, 'a'));
  makeTexture('ground_moss_b', 64, 64, (gfx) => drawMoss(gfx, 'b'));

  const drawPath = (gfx: Phaser.GameObjects.Graphics, variant: 'a' | 'b') => {
    gfx.fillStyle(0x0a1710, 1);
    gfx.fillRect(0, 0, 64, 64);

    // Packed dirt base.
    gfx.fillStyle(variant === 'a' ? 0x3b2a1a : 0x463322, 1);
    gfx.fillRoundedRect(0, 14, 64, 36, 14);

    // Edge grass.
    gfx.fillStyle(0x14532d, 0.7);
    for (let i = 0; i < 50; i++) {
      const x = Phaser.Math.Between(0, 63);
      const y = Phaser.Math.Between(10, 53);
      if (y > 16 && y < 48) continue;
      gfx.fillCircle(x, y, Phaser.Math.Between(1, 2));
    }

    // Pebbles.
    gfx.fillStyle(0xe5e7eb, 0.5);
    for (let i = 0; i < 18; i++) {
      const x = Phaser.Math.Between(4, 60);
      const y = Phaser.Math.Between(18, 46);
      gfx.fillCircle(x, y, 1);
    }

    gfx.lineStyle(2, 0x0b1220, 0.65);
    gfx.strokeRect(1, 1, 62, 62);
  };

  makeTexture('ground_path_a', 64, 64, (gfx) => drawPath(gfx, 'a'));
  makeTexture('ground_path_b', 64, 64, (gfx) => drawPath(gfx, 'b'));

  const drawClearing = (gfx: Phaser.GameObjects.Graphics, variant: 'a' | 'b') => {
    gfx.fillStyle(0x0a1710, 1);
    gfx.fillRect(0, 0, 64, 64);

    gfx.fillStyle(variant === 'a' ? 0x2a2f1d : 0x2f341f, 1);
    gfx.fillRect(0, 0, 64, 64);

    // Light straw / trampled grass streaks.
    gfx.lineStyle(2, 0xa3a36a, 0.35);
    for (let i = 0; i < 16; i++) {
      const x1 = Phaser.Math.Between(0, 63);
      const y1 = Phaser.Math.Between(0, 63);
      gfx.beginPath();
      gfx.moveTo(x1, y1);
      gfx.lineTo(x1 + Phaser.Math.Between(6, 18), y1 + Phaser.Math.Between(-2, 8));
      gfx.strokePath();
    }

    gfx.fillStyle(0x3f1d0b, 0.15);
    for (let i = 0; i < 18; i++) {
      const x = Phaser.Math.Between(0, 63);
      const y = Phaser.Math.Between(0, 63);
      gfx.fillCircle(x, y, Phaser.Math.Between(2, 5));
    }

    gfx.lineStyle(2, 0x0b1220, 0.65);
    gfx.strokeRect(1, 1, 62, 62);
  };

  makeTexture('ground_clearing_a', 64, 64, (gfx) => drawClearing(gfx, 'a'));
  makeTexture('ground_clearing_b', 64, 64, (gfx) => drawClearing(gfx, 'b'));
}
