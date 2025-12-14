import Phaser from 'phaser';

export function createProceduralTextures(scene: Phaser.Scene) {
  const stroke = 0x0b1220;

  const shadedCircle = (gfx: Phaser.GameObjects.Graphics, x: number, y: number, r: number, base: number, shade: number, highlight: number) => {
    gfx.fillStyle(shade, 1);
    gfx.fillCircle(x + 2, y + 2, r);
    gfx.fillStyle(base, 1);
    gfx.fillCircle(x, y, r);
    gfx.fillStyle(highlight, 0.9);
    gfx.fillCircle(x - 2, y - 3, Math.max(1, r - 3));
    gfx.lineStyle(2, stroke, 0.92);
    gfx.strokeCircle(x, y, r);
  };

  const strokeRoundedRect = (gfx: Phaser.GameObjects.Graphics, x: number, y: number, w: number, h: number, radius: number) => {
    gfx.lineStyle(2, stroke, 0.9);
    gfx.strokeRoundedRect(x, y, w, h, radius);
  };

  const makeTexture = (key: string, width: number, height: number, draw: (gfx: Phaser.GameObjects.Graphics) => void) => {
    if (scene.textures.exists(key)) return;
    const gfx = scene.add.graphics({ x: 0, y: 0 });
    gfx.setVisible(false);

    draw(gfx);

    gfx.generateTexture(key, width, height);
    gfx.destroy();
  };

  const drawForestGround = (gfx: Phaser.GameObjects.Graphics, palette: {
    base: number;
    shadow: number;
    foliageA: number;
    foliageB: number;
    foliageC: number;
    accentGreen: number;
    accentChance: number;
  }) => {
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

  makeTexture('shadow', 48, 24, (gfx) => {
    // Fake soft shadow via layered ellipses.
    for (let i = 0; i < 6; i++) {
      const a = 0.18 - i * 0.025;
      gfx.fillStyle(0x000000, Math.max(0, a));
      gfx.fillEllipse(24, 12, 34 - i * 4, 12 - i * 1.2);
    }
  });

  makeTexture('ring', 64, 64, (gfx) => {
    // Double-ring with subtle inner glow.
    gfx.lineStyle(4, 0xffffff, 0.92);
    gfx.strokeCircle(32, 32, 21);
    gfx.lineStyle(3, 0x38bdf8, 0.9);
    gfx.strokeCircle(32, 32, 26);
    gfx.lineStyle(1, 0x93c5fd, 0.55);
    gfx.strokeCircle(32, 32, 17);
  });

  makeTexture('spark', 16, 16, (gfx) => {
    gfx.fillStyle(0xffffff, 1);
    gfx.fillCircle(8, 8, 3);
    gfx.fillStyle(0x38bdf8, 0.9);
    gfx.fillCircle(8, 8, 2);
    gfx.fillStyle(0xffffff, 0.6);
    gfx.fillCircle(6.5, 6.5, 1);
  });

  makeTexture('tileset32', 32 * 7, 32, (gfx) => {
    // 7 tiles laid out horizontally, 32x32 each.
    // Index mapping (keep in sync with `tilemapWorld.ts`):
    // 0 forest_a, 1 forest_b, 2 clearing, 3 path, 4 water, 5 tree, 6 rock

    const drawForest = (ox: number, base: number, foliageA: number, foliageB: number) => {
      gfx.fillStyle(base, 1);
      gfx.fillRect(ox, 0, 32, 32);

      gfx.fillStyle(0x050e09, 0.55);
      for (let i = 0; i < 5; i++) {
        gfx.fillCircle(ox + Phaser.Math.Between(0, 31), Phaser.Math.Between(0, 31), Phaser.Math.Between(4, 7));
      }

      gfx.fillStyle(foliageA, 0.95);
      for (let i = 0; i < 60; i++) {
        gfx.fillCircle(ox + Phaser.Math.Between(0, 31), Phaser.Math.Between(0, 31), Phaser.Math.Between(1, 2));
      }
      gfx.fillStyle(foliageB, 0.9);
      for (let i = 0; i < 40; i++) {
        gfx.fillCircle(ox + Phaser.Math.Between(0, 31), Phaser.Math.Between(0, 31), Phaser.Math.Between(1, 2));
      }

      // tiny accents
      gfx.fillStyle(0xfbbf24, 0.18);
      for (let i = 0; i < 5; i++) {
        gfx.fillCircle(ox + Phaser.Math.Between(2, 29), Phaser.Math.Between(2, 29), 1);
      }

      gfx.lineStyle(1, 0x0b1220, 0.35);
      gfx.strokeRect(ox + 0.5, 0.5, 31, 31);
    };

    const drawClearing = (ox: number) => {
      gfx.fillStyle(0x2a2f1d, 1);
      gfx.fillRect(ox, 0, 32, 32);
      gfx.lineStyle(2, 0xa3a36a, 0.25);
      for (let i = 0; i < 7; i++) {
        const x1 = ox + Phaser.Math.Between(0, 31);
        const y1 = Phaser.Math.Between(0, 31);
        gfx.beginPath();
        gfx.moveTo(x1, y1);
        gfx.lineTo(x1 + Phaser.Math.Between(4, 10), y1 + Phaser.Math.Between(-1, 5));
        gfx.strokePath();
      }
      gfx.lineStyle(1, 0x0b1220, 0.25);
      gfx.strokeRect(ox + 0.5, 0.5, 31, 31);
    };

    const drawPath = (ox: number) => {
      gfx.fillStyle(0x0a1710, 1);
      gfx.fillRect(ox, 0, 32, 32);
      gfx.fillStyle(0x3b2a1a, 1);
      gfx.fillRoundedRect(ox + 0, 7, 32, 18, 10);

      gfx.fillStyle(0xe5e7eb, 0.35);
      for (let i = 0; i < 7; i++) {
        gfx.fillCircle(ox + Phaser.Math.Between(4, 28), Phaser.Math.Between(10, 22), 1);
      }
      gfx.lineStyle(1, 0x0b1220, 0.25);
      gfx.strokeRect(ox + 0.5, 0.5, 31, 31);
    };

    const drawWater = (ox: number) => {
      gfx.fillStyle(0x0b2942, 1);
      gfx.fillRect(ox, 0, 32, 32);
      gfx.fillStyle(0x1e3a8a, 0.25);
      for (let i = 0; i < 10; i++) {
        gfx.fillEllipse(ox + Phaser.Math.Between(0, 31), Phaser.Math.Between(0, 31), Phaser.Math.Between(10, 18), Phaser.Math.Between(4, 8));
      }
      gfx.lineStyle(2, 0x38bdf8, 0.22);
      for (let y = 6; y <= 28; y += 8) {
        gfx.beginPath();
        gfx.moveTo(ox + 2, y);
        gfx.lineTo(ox + 30, y + Phaser.Math.Between(-2, 2));
        gfx.strokePath();
      }
      gfx.lineStyle(1, 0x0b1220, 0.25);
      gfx.strokeRect(ox + 0.5, 0.5, 31, 31);
    };

    const drawTree = (ox: number) => {
      // Canopy
      gfx.fillStyle(0x14532d, 1);
      gfx.fillCircle(ox + 16, 16, 12);
      gfx.fillStyle(0x166534, 1);
      gfx.fillCircle(ox + 14, 14, 10);
      gfx.fillStyle(0x15803d, 1);
      gfx.fillCircle(ox + 18, 18, 8);

      // trunk
      gfx.fillStyle(0x5b3416, 0.9);
      gfx.fillCircle(ox + 16, 18, 3);
      gfx.lineStyle(1, stroke, 0.6);
      gfx.strokeCircle(ox + 16, 18, 3);

      gfx.lineStyle(2, stroke, 0.6);
      gfx.strokeCircle(ox + 16, 16, 12);
      gfx.lineStyle(1, 0x0b1220, 0.25);
      gfx.strokeRect(ox + 0.5, 0.5, 31, 31);
    };

    const drawRock = (ox: number) => {
      gfx.fillStyle(0x23304d, 1);
      gfx.fillRoundedRect(ox + 6, 8, 20, 18, 8);
      gfx.fillStyle(0x30446c, 0.85);
      gfx.fillRoundedRect(ox + 8, 10, 16, 7, 6);
      gfx.lineStyle(2, stroke, 0.7);
      gfx.strokeRoundedRect(ox + 6, 8, 20, 18, 8);

      gfx.fillStyle(0x34d399, 0.15);
      gfx.fillCircle(ox + 10, 18, 4);
      gfx.lineStyle(1, 0x0b1220, 0.25);
      gfx.strokeRect(ox + 0.5, 0.5, 31, 31);
    };

    drawForest(0, 0x09140e, 0x0f2a1a, 0x163d26);
    drawForest(32, 0x0b1911, 0x12321f, 0x1b4a2e);
    drawClearing(64);
    drawPath(96);
    drawWater(128);
    drawTree(160);
    drawRock(192);
  });

  makeTexture('label_bg', 128, 32, (gfx) => {
    // Simple scalable HUD pill used behind world labels.
    gfx.fillStyle(0x0b1220, 0.55);
    gfx.fillRoundedRect(4, 6, 120, 20, 8);
    gfx.lineStyle(2, 0x1f2937, 0.85);
    gfx.strokeRoundedRect(4, 6, 120, 20, 8);
    gfx.fillStyle(0x111827, 0.35);
    gfx.fillRoundedRect(6, 8, 116, 7, 6);
  });

  makeTexture('leader', 32, 32, (gfx) => {
    // Body (shaded)
    shadedCircle(gfx, 16, 18, 10, 0x38bdf8, 0x0ea5e9, 0x93c5fd);

    // Face/eyes
    gfx.fillStyle(0x111827, 0.85);
    gfx.fillCircle(13.2, 17.5, 1.2);
    gfx.fillCircle(18.4, 17.5, 1.2);
    gfx.fillStyle(0xffffff, 0.8);
    gfx.fillCircle(12.7, 17, 0.45);
    gfx.fillCircle(17.9, 17, 0.45);

    // Hat
    gfx.fillStyle(0x1f2937, 1);
    gfx.fillTriangle(10, 11, 22, 11, 16, 4);
    gfx.fillRoundedRect(9, 11, 14, 5, 2);
    gfx.lineStyle(2, stroke, 0.85);
    gfx.strokeTriangle(10, 11, 22, 11, 16, 4);
    strokeRoundedRect(gfx, 9, 11, 14, 5, 2);

    // Backpack
    gfx.fillStyle(0x0ea5e9, 1);
    gfx.fillRoundedRect(6, 16, 7, 10, 3);
    gfx.fillStyle(0x38bdf8, 0.85);
    gfx.fillRoundedRect(7, 17, 5, 3, 2);
    gfx.lineStyle(1, stroke, 0.85);
    gfx.strokeRoundedRect(6, 16, 7, 10, 3);

    // Strap
    gfx.lineStyle(2, 0x1f2937, 0.9);
    gfx.beginPath();
    gfx.moveTo(11, 15);
    gfx.lineTo(14, 22);
    gfx.strokePath();
  });

  makeTexture('scout', 28, 28, (gfx) => {
    shadedCircle(gfx, 14, 15, 9, 0x22c55e, 0x16a34a, 0x86efac);

    // Eyes
    gfx.fillStyle(0x111827, 0.75);
    gfx.fillCircle(11.5, 14.5, 1);
    gfx.fillCircle(15.8, 14.5, 1);

    // Bandana stripe
    gfx.fillStyle(0x14532d, 1);
    gfx.fillRoundedRect(7, 9, 14, 5, 3);
    strokeRoundedRect(gfx, 7, 9, 14, 5, 3);

    // Small backpack
    gfx.fillStyle(0x16a34a, 1);
    gfx.fillRoundedRect(3, 13, 6, 9, 3);
    gfx.fillStyle(0x22c55e, 0.75);
    gfx.fillRoundedRect(4, 14, 4, 2, 2);
    gfx.lineStyle(1, stroke, 0.8);
    gfx.strokeRoundedRect(3, 13, 6, 9, 3);
  });

  makeTexture('resource', 32, 32, (gfx) => {
    // Shadow base
    gfx.fillStyle(0x0b1220, 0.35);
    gfx.fillEllipse(16, 26, 18, 6);

    // Crate body
    gfx.fillStyle(0xf59e0b, 1);
    gfx.fillRoundedRect(5, 6, 22, 20, 4);
    gfx.fillStyle(0xfbbf24, 0.85);
    gfx.fillRoundedRect(7, 8, 18, 6, 3);
    gfx.lineStyle(2, stroke, 0.9);
    gfx.strokeRoundedRect(5, 6, 22, 20, 4);

    // Planks
    gfx.lineStyle(2, 0xb45309, 1);
    gfx.beginPath();
    gfx.moveTo(8, 12);
    gfx.lineTo(24, 12);
    gfx.moveTo(8, 16);
    gfx.lineTo(24, 16);
    gfx.moveTo(8, 20);
    gfx.lineTo(24, 20);
    gfx.strokePath();

    // Corner bolts
    gfx.fillStyle(0x111827, 0.7);
    gfx.fillCircle(7.5, 8.5, 1);
    gfx.fillCircle(24.5, 8.5, 1);
    gfx.fillCircle(7.5, 23.5, 1);
    gfx.fillCircle(24.5, 23.5, 1);
  });

  makeTexture('resource_wood', 34, 34, (gfx) => {
    // Woodpile
    gfx.fillStyle(0x0b1220, 0.32);
    gfx.fillEllipse(17, 27, 20, 6);

    gfx.fillStyle(0x92400e, 1);
    gfx.fillRoundedRect(7, 16, 20, 6, 3);
    gfx.fillRoundedRect(8, 12, 19, 6, 3);
    gfx.fillRoundedRect(9, 20, 18, 6, 3);

    gfx.lineStyle(2, stroke, 0.85);
    gfx.strokeRoundedRect(7, 16, 20, 6, 3);
    gfx.strokeRoundedRect(8, 12, 19, 6, 3);
    gfx.strokeRoundedRect(9, 20, 18, 6, 3);

    // Cut ends
    gfx.fillStyle(0xfbbf24, 0.9);
    gfx.fillCircle(9, 19, 2);
    gfx.fillCircle(26, 15, 2);
    gfx.fillCircle(24, 23, 2);
  });

  makeTexture('resource_water', 34, 34, (gfx) => {
    // Small well / water source
    gfx.fillStyle(0x0b1220, 0.32);
    gfx.fillEllipse(17, 27, 20, 6);

    gfx.fillStyle(0x1f2937, 1);
    gfx.fillRoundedRect(9, 12, 16, 14, 6);
    gfx.lineStyle(2, stroke, 0.85);
    gfx.strokeRoundedRect(9, 12, 16, 14, 6);

    gfx.fillStyle(0x38bdf8, 1);
    gfx.fillEllipse(17, 19, 12, 7);
    gfx.lineStyle(2, 0x0ea5e9, 0.9);
    gfx.strokeEllipse(17, 19, 12, 7);

    gfx.fillStyle(0x93c5fd, 0.9);
    gfx.fillEllipse(15.5, 18.3, 5, 2);
  });

  makeTexture('resource_supply', 34, 34, (gfx) => {
    // Supply crate (chunkier version)
    gfx.fillStyle(0x0b1220, 0.35);
    gfx.fillEllipse(17, 28, 20, 6);

    gfx.fillStyle(0xf59e0b, 1);
    gfx.fillRoundedRect(6, 8, 22, 20, 5);
    gfx.fillStyle(0xfbbf24, 0.85);
    gfx.fillRoundedRect(8, 10, 18, 6, 4);
    gfx.lineStyle(2, stroke, 0.9);
    gfx.strokeRoundedRect(6, 8, 22, 20, 5);

    // Cross straps
    gfx.lineStyle(3, 0xb45309, 0.95);
    gfx.beginPath();
    gfx.moveTo(11, 12);
    gfx.lineTo(23, 24);
    gfx.moveTo(23, 12);
    gfx.lineTo(11, 24);
    gfx.strokePath();
  });

  const buildBase = (gfx: Phaser.GameObjects.Graphics) => {
    shadedCircle(gfx, 17, 17, 13, 0xa78bfa, 0x7c3aed, 0xddd6fe);
  };

  // Keep existing key for compatibility (generic build marker).
  makeTexture('build', 34, 34, (gfx) => {
    buildBase(gfx);
    gfx.lineStyle(3, 0x4c1d95, 1);
    gfx.beginPath();
    gfx.moveTo(12, 22);
    gfx.lineTo(22, 12);
    gfx.moveTo(12, 12);
    gfx.lineTo(22, 22);
    gfx.strokePath();
  });

  makeTexture('build_tent', 34, 34, (gfx) => {
    buildBase(gfx);
    gfx.fillStyle(0x4c1d95, 0.95);
    gfx.fillTriangle(17, 10, 10, 24, 24, 24);
    gfx.lineStyle(2, stroke, 0.85);
    gfx.strokeTriangle(17, 10, 10, 24, 24, 24);
    gfx.fillStyle(0xddd6fe, 0.8);
    gfx.fillTriangle(17, 12, 13, 24, 21, 24);
  });

  makeTexture('build_fire', 34, 34, (gfx) => {
    buildBase(gfx);
    // Logs
    gfx.lineStyle(3, 0x3f1d0b, 1);
    gfx.beginPath();
    gfx.moveTo(12, 23);
    gfx.lineTo(22, 19);
    gfx.moveTo(12, 19);
    gfx.lineTo(22, 23);
    gfx.strokePath();
    // Flame
    gfx.fillStyle(0xf97316, 1);
    gfx.fillTriangle(17, 11, 13, 20, 21, 20);
    gfx.fillStyle(0xfbbf24, 0.95);
    gfx.fillTriangle(17, 13, 15, 20, 19, 20);
    gfx.lineStyle(2, stroke, 0.7);
    gfx.strokeTriangle(17, 11, 13, 20, 21, 20);
  });

  makeTexture('build_flag', 34, 34, (gfx) => {
    buildBase(gfx);
    // Pole
    gfx.lineStyle(3, 0x111827, 0.9);
    gfx.beginPath();
    gfx.moveTo(14, 10);
    gfx.lineTo(14, 24);
    gfx.strokePath();
    // Flag
    gfx.fillStyle(0x38bdf8, 0.95);
    gfx.fillTriangle(14, 11, 24, 14, 14, 17);
    gfx.lineStyle(2, stroke, 0.75);
    gfx.strokeTriangle(14, 11, 24, 14, 14, 17);
  });

  makeTexture('wood_pile', 34, 34, (gfx) => {
    // Small pile of logs.
    gfx.fillStyle(0x0b1220, 0.25);
    gfx.fillEllipse(17, 26, 24, 8);

    const drawLog = (x: number, y: number, w: number, h: number, tint: number) => {
      gfx.fillStyle(tint, 1);
      gfx.fillRoundedRect(x, y, w, h, 4);
      gfx.fillStyle(0xfbbf24, 0.25);
      gfx.fillRoundedRect(x + 2, y + 2, w - 4, Math.max(2, Math.floor(h * 0.35)), 3);
      gfx.lineStyle(2, stroke, 0.75);
      gfx.strokeRoundedRect(x + 0.5, y + 0.5, w - 1, h - 1, 4);
    };

    drawLog(6, 18, 22, 8, 0x7c2d12);
    drawLog(8, 10, 20, 8, 0x92400e);
    drawLog(10, 20, 18, 7, 0x9a3412);

    gfx.fillStyle(0xe5e7eb, 0.28);
    gfx.fillCircle(12, 12, 1);
    gfx.fillCircle(24, 15, 1);
  });

  makeTexture('water_tank', 34, 34, (gfx) => {
    // Simple tank + water window.
    gfx.fillStyle(0x0b1220, 0.25);
    gfx.fillEllipse(17, 27, 24, 8);

    gfx.fillStyle(0x1f2937, 1);
    gfx.fillRoundedRect(9, 9, 16, 18, 6);
    gfx.fillStyle(0x334155, 0.95);
    gfx.fillRoundedRect(11, 11, 12, 14, 5);

    // Water level window
    gfx.fillStyle(0x0b2942, 1);
    gfx.fillRoundedRect(13, 16, 8, 8, 3);
    gfx.fillStyle(0x38bdf8, 0.25);
    gfx.fillRoundedRect(13, 16, 8, 3, 3);

    // Cap
    gfx.fillStyle(0x111827, 1);
    gfx.fillRoundedRect(13, 7, 8, 5, 2);

    gfx.lineStyle(2, stroke, 0.8);
    gfx.strokeRoundedRect(9, 9, 16, 18, 6);
  });

  makeTexture('obstacle', 72, 72, (gfx) => {
    // Rock A (no baked shadow; we place a real one in world).
    gfx.fillStyle(0x1f2a44, 1);
    gfx.fillRoundedRect(10, 14, 52, 44, 16);

    // Shading
    gfx.fillStyle(0x2b3b5f, 0.85);
    gfx.fillRoundedRect(14, 18, 44, 18, 12);
    gfx.fillStyle(0x334a73, 0.55);
    gfx.fillRoundedRect(18, 22, 20, 10, 8);

    // Moss patches
    gfx.fillStyle(0x22c55e, 0.18);
    gfx.fillCircle(24, 40, 8);
    gfx.fillCircle(48, 34, 7);
    gfx.fillStyle(0x16a34a, 0.22);
    gfx.fillCircle(29, 44, 5);

    // Outline
    gfx.lineStyle(3, stroke, 0.92);
    gfx.strokeRoundedRect(10, 14, 52, 44, 16);

    // Cracks
    gfx.lineStyle(2, 0x0b1220, 0.35);
    gfx.beginPath();
    gfx.moveTo(24, 20);
    gfx.lineTo(20, 38);
    gfx.lineTo(28, 50);
    gfx.moveTo(44, 22);
    gfx.lineTo(52, 40);
    gfx.lineTo(40, 54);
    gfx.strokePath();
  });

  makeTexture('obstacle_rock2', 72, 72, (gfx) => {
    // Rock B (slightly different silhouette)
    gfx.fillStyle(0x23304d, 1);
    gfx.fillRoundedRect(12, 12, 48, 48, 14);
    gfx.fillStyle(0x30446c, 0.8);
    gfx.fillRoundedRect(16, 16, 40, 18, 12);
    gfx.fillStyle(0x3b5584, 0.55);
    gfx.fillRoundedRect(34, 22, 18, 10, 8);

    // Moss + lichen dots
    gfx.fillStyle(0x34d399, 0.2);
    gfx.fillCircle(22, 34, 7);
    gfx.fillCircle(50, 46, 6);
    gfx.fillStyle(0xe5e7eb, 0.12);
    for (let i = 0; i < 10; i++) {
      gfx.fillCircle(Phaser.Math.Between(18, 54), Phaser.Math.Between(20, 54), 1);
    }

    gfx.lineStyle(3, stroke, 0.92);
    gfx.strokeRoundedRect(12, 12, 48, 48, 14);

    gfx.lineStyle(2, 0x0b1220, 0.32);
    gfx.beginPath();
    gfx.moveTo(26, 18);
    gfx.lineTo(30, 30);
    gfx.lineTo(22, 44);
    gfx.moveTo(46, 20);
    gfx.lineTo(42, 36);
    gfx.lineTo(50, 52);
    gfx.strokePath();
  });

  makeTexture('obstacle_tree', 72, 72, (gfx) => {
    // Top-down canopy tree
    // Outer canopy
    gfx.fillStyle(0x14532d, 1);
    gfx.fillCircle(36, 36, 26);
    gfx.fillStyle(0x166534, 1);
    gfx.fillCircle(34, 34, 22);
    gfx.fillStyle(0x15803d, 1);
    gfx.fillCircle(38, 38, 18);

    // Broad canopy highlights (avoid single bright dots)
    gfx.fillStyle(0x22c55e, 0.12);
    gfx.fillEllipse(30, 32, 26, 18);
    gfx.fillEllipse(46, 42, 24, 18);

    // Small trunk center
    gfx.fillStyle(0x5b3416, 0.9);
    gfx.fillCircle(36, 38, 5);
    gfx.lineStyle(2, stroke, 0.75);
    gfx.strokeCircle(36, 38, 5);

    // Canopy outline
    gfx.lineStyle(3, stroke, 0.9);
    gfx.strokeCircle(36, 36, 26);
  });

  makeTexture('obstacle_stump', 56, 56, (gfx) => {
    // Tree stump
    gfx.fillStyle(0x7c4a1f, 1);
    gfx.fillRoundedRect(12, 18, 32, 28, 10);
    gfx.fillStyle(0x9a5a2a, 0.75);
    gfx.fillRoundedRect(14, 20, 28, 10, 8);
    gfx.lineStyle(3, stroke, 0.9);
    gfx.strokeRoundedRect(12, 18, 32, 28, 10);

    // Rings
    gfx.lineStyle(2, 0x3f1d0b, 0.35);
    gfx.strokeEllipse(28, 26, 18, 10);
    gfx.strokeEllipse(28, 26, 10, 6);

    // Small sprouts
    gfx.fillStyle(0x22c55e, 0.8);
    gfx.fillTriangle(22, 16, 20, 22, 26, 22);
    gfx.fillTriangle(34, 15, 32, 22, 38, 22);
  });
}
