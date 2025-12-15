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
    for (let i = 0; i < 7; i++) {
      const a = 0.2 - i * 0.025;
      gfx.fillStyle(0x000000, Math.max(0, a));
      gfx.fillEllipse(24, 12, 36 - i * 4.2, 12 - i * 1.15);
    }
    // Slight offset dark core to help ground sprites.
    gfx.fillStyle(0x000000, 0.08);
    gfx.fillEllipse(25, 12.5, 22, 7);
  });

  makeTexture('ring', 64, 64, (gfx) => {
    // Double-ring with subtle inner glow.
    gfx.fillStyle(0x38bdf8, 0.06);
    gfx.fillCircle(32, 32, 28);

    gfx.lineStyle(4, 0xffffff, 0.9);
    gfx.strokeCircle(32, 32, 21);

    gfx.lineStyle(3, 0x38bdf8, 0.85);
    gfx.strokeCircle(32, 32, 26);

    gfx.lineStyle(1, 0x93c5fd, 0.5);
    gfx.strokeCircle(32, 32, 17);

    // Soft glow accent
    gfx.lineStyle(2, 0x38bdf8, 0.16);
    gfx.strokeCircle(32, 32, 29);
  });

  makeTexture('spark', 16, 16, (gfx) => {
    // Tiny starburst particle (reads better than a dot).
    gfx.fillStyle(0xffffff, 0.95);
    gfx.fillCircle(8, 8, 1.8);

    gfx.fillStyle(0x38bdf8, 0.95);
    gfx.fillTriangle(8, 1.5, 6.7, 8, 9.3, 8);
    gfx.fillTriangle(8, 14.5, 6.7, 8, 9.3, 8);
    gfx.fillTriangle(1.5, 8, 8, 6.7, 8, 9.3);
    gfx.fillTriangle(14.5, 8, 8, 6.7, 8, 9.3);

    gfx.fillStyle(0xffffff, 0.7);
    gfx.fillCircle(7.2, 7.1, 0.9);
  });

  makeTexture('tileset32', 32 * 7, 32, (gfx) => {
    // 7 tiles laid out horizontally, 32x32 each.
    // Index mapping (keep in sync with `tilemapWorld.ts`):
    // 0 forest_a, 1 forest_b, 2 clearing, 3 path, 4 water, 5 tree, 6 rock

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

    const drawForest = (ox: number, base: number, foliageA: number, foliageB: number) => {
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
      gfx.fillStyle(0xfbbf24, 0.14);
      for (let i = 0; i < 4; i++) {
        gfx.fillRect(ox + Phaser.Math.Between(2, 29), Phaser.Math.Between(2, 29), 1, 1);
      }

      applyTileLighting(ox);
    };

    const drawClearing = (ox: number) => {
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
      gfx.fillStyle(0x3f1d0b, 0.12);
      for (let i = 0; i < 8; i++) {
        gfx.fillCircle(ox + Phaser.Math.Between(4, 28), Phaser.Math.Between(4, 28), Phaser.Math.Between(2, 5));
      }

      applyTileLighting(ox);
    };

    const drawPath = (ox: number) => {
      gfx.fillStyle(0x0a1710, 1);
      gfx.fillRect(ox, 0, 32, 32);

      // Packed dirt band.
      gfx.fillStyle(0x3b2a1a, 1);
      gfx.fillRoundedRect(ox + 0, 8, 32, 16, 9);

      // Darker edges to read as a worn groove.
      gfx.fillStyle(0x2a1b10, 0.55);
      gfx.fillRoundedRect(ox + 0, 8, 32, 4, 9);
      gfx.fillRoundedRect(ox + 0, 20, 32, 4, 9);

      // Pebbles.
      gfx.fillStyle(0xe5e7eb, 0.28);
      for (let i = 0; i < 10; i++) {
        gfx.fillRect(ox + Phaser.Math.Between(4, 28), Phaser.Math.Between(10, 22), 1, 1);
      }

      applyTileLighting(ox);
    };

    const drawWater = (ox: number) => {
      gfx.fillStyle(0x0b2942, 1);
      gfx.fillRect(ox, 0, 32, 32);

      // Depth gradient.
      gfx.fillStyle(0x0b3a5a, 0.35);
      gfx.fillRect(ox, 0, 32, 10);
      gfx.fillStyle(0x07263d, 0.35);
      gfx.fillRect(ox, 22, 32, 10);

      // Soft swells.
      gfx.fillStyle(0x1d4ed8, 0.12);
      for (let i = 0; i < 6; i++) {
        gfx.fillEllipse(
          ox + Phaser.Math.Between(2, 30),
          Phaser.Math.Between(2, 30),
          Phaser.Math.Between(12, 18),
          Phaser.Math.Between(4, 7),
        );
      }

      // Wave highlights.
      gfx.lineStyle(2, 0x38bdf8, 0.18);
      for (let y = 7; y <= 27; y += 7) {
        gfx.beginPath();
        gfx.moveTo(ox + 2, y);
        gfx.lineTo(ox + 30, y + Phaser.Math.Between(-1, 1));
        gfx.strokePath();
      }

      applyTileLighting(ox);
    };

    const drawTree = (ox: number) => {

      // Ground under the tree so the silhouette reads against any tile.
      gfx.fillStyle(0x0a1710, 1);
      gfx.fillRect(ox, 0, 32, 32);
      gfx.fillStyle(0x050e09, 0.22);
      gfx.fillCircle(ox + 18, 18, 10);

      // Canopy + shadow.
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

      // Trunk.
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

    const drawRock = (ox: number) => {

      // Ground behind rock.
      gfx.fillStyle(0x0a1710, 1);
      gfx.fillRect(ox, 0, 32, 32);
      gfx.fillStyle(0x050e09, 0.18);
      gfx.fillCircle(ox + 20, 20, 9);

      // Rock body.
      gfx.fillStyle(0x23304d, 1);
      gfx.fillRoundedRect(ox + 6, 9, 20, 16, 7);
      gfx.fillStyle(0x30446c, 0.85);
      gfx.fillRoundedRect(ox + 8, 11, 16, 6, 6);
      gfx.fillStyle(0x3b5584, 0.35);
      gfx.fillRoundedRect(ox + 10, 16, 10, 4, 4);

      // Moss/lichen.
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

    // Subtle top edge highlight to separate from dark scenes.
    gfx.lineStyle(1, 0xe5e7eb, 0.08);
    gfx.beginPath();
    gfx.moveTo(12, 9);
    gfx.lineTo(116, 9);
    gfx.strokePath();
  });

  makeTexture('leader', 32, 32, (gfx) => {
    // Body (shaded) + tiny feet nubs for motion readability.
    shadedCircle(gfx, 16, 18, 10, 0x38bdf8, 0x0ea5e9, 0x93c5fd);
    gfx.fillStyle(0x111827, 0.35);
    gfx.fillRoundedRect(11, 25, 4, 3, 1);
    gfx.fillRoundedRect(17, 25, 4, 3, 1);

    // Face/eyes
    gfx.fillStyle(0x111827, 0.85);
    gfx.fillCircle(13.3, 17.3, 1.1);
    gfx.fillCircle(18.3, 17.3, 1.1);
    gfx.fillStyle(0xffffff, 0.75);
    gfx.fillCircle(12.9, 16.9, 0.45);
    gfx.fillCircle(17.9, 16.9, 0.45);

    // Hat with clearer silhouette
    gfx.fillStyle(0x1f2937, 1);
    gfx.fillTriangle(10, 11, 22, 11, 16, 4);
    gfx.fillRoundedRect(9, 11, 14, 5, 2);
    gfx.fillStyle(0xe5e7eb, 0.08);
    gfx.fillTriangle(12, 11, 20, 11, 16, 6);
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
    gfx.fillStyle(0x111827, 0.32);
    gfx.fillRoundedRect(9.5, 21.5, 3.8, 2.6, 1);
    gfx.fillRoundedRect(15.0, 21.5, 3.8, 2.6, 1);

    // Eyes
    gfx.fillStyle(0x111827, 0.75);
    gfx.fillCircle(11.7, 14.3, 1);
    gfx.fillCircle(15.6, 14.3, 1);
    gfx.fillStyle(0xffffff, 0.55);
    gfx.fillCircle(11.3, 13.9, 0.35);
    gfx.fillCircle(15.2, 13.9, 0.35);

    // Bandana stripe
    gfx.fillStyle(0x14532d, 1);
    gfx.fillRoundedRect(7, 9, 14, 5, 3);
    gfx.fillStyle(0xe5e7eb, 0.06);
    gfx.fillRoundedRect(8, 10, 12, 2, 2);
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

  const drawTentStage = (gfx: Phaser.GameObjects.Graphics, stage: 0 | 1 | 2 | 3) => {
    buildBase(gfx);

    if (stage === 0) {
      // Blueprint only.
      gfx.lineStyle(2, 0x38bdf8, 0.55);
      gfx.strokeTriangle(17, 11, 10, 24, 24, 24);
      gfx.lineStyle(2, 0x93c5fd, 0.35);
      gfx.strokeRoundedRect(11, 22, 12, 3, 2);
      return;
    }

    // Poles/scaffolding.
    gfx.lineStyle(2, 0x111827, stage === 1 ? 0.55 : 0.75);
    gfx.beginPath();
    gfx.moveTo(17, 11);
    gfx.lineTo(11, 24);
    gfx.moveTo(17, 11);
    gfx.lineTo(23, 24);
    gfx.strokePath();

    if (stage === 1) {
      gfx.fillStyle(0xe5e7eb, 0.16);
      gfx.fillTriangle(17, 12, 13, 24, 21, 24);
      return;
    }

    // Hut body (reads as a hut vs. a pure tent marker).
    // Footprint / floor.
    gfx.fillStyle(0x3f1d0b, stage === 2 ? 0.25 : 0.35);
    gfx.fillRoundedRect(10, 22, 14, 4, 2);

    // Walls.
    gfx.fillStyle(0xd1d5db, stage === 2 ? 0.45 : 0.85);
    gfx.fillRoundedRect(10.5, 16.5, 13, 8, 2);
    gfx.fillStyle(0xffffff, stage === 2 ? 0.10 : 0.16);
    gfx.fillRoundedRect(11.5, 17.5, 11, 2.5, 2);

    // Roof (canvas roof, still tent-y but hut-shaped).
    gfx.fillStyle(0x4c1d95, stage === 2 ? 0.6 : 0.95);
    gfx.fillTriangle(17, 9, 8.5, 17, 25.5, 17);
    gfx.fillStyle(0xddd6fe, stage === 2 ? 0.28 : 0.5);
    gfx.fillTriangle(17, 10.5, 11, 17, 23, 17);

    // Eaves.
    gfx.fillStyle(0x1f2937, stage === 2 ? 0.18 : 0.28);
    gfx.fillRoundedRect(10, 16.3, 14, 1.8, 1);

    // Door.
    gfx.fillStyle(0x111827, stage === 2 ? 0.32 : 0.65);
    gfx.fillRoundedRect(15.4, 19, 4.2, 6, 1);
    gfx.fillStyle(0xe5e7eb, stage === 2 ? 0.08 : 0.14);
    gfx.fillCircle(18.8, 22, 0.7);

    gfx.lineStyle(2, stroke, stage === 2 ? 0.6 : 0.85);
    gfx.strokeTriangle(17, 9, 8.5, 17, 25.5, 17);
    gfx.strokeRoundedRect(10.5, 16.5, 13, 8, 2);

    if (stage === 3) {
      // Little chimney puff / final polish.
      gfx.fillStyle(0x111827, 0.65);
      gfx.fillRoundedRect(22.5, 10.5, 3, 5, 1);
      gfx.lineStyle(2, stroke, 0.75);
      gfx.strokeRoundedRect(22.5, 10.5, 3, 5, 1);

      gfx.fillStyle(0xe5e7eb, 0.12);
      gfx.fillCircle(23, 12, 2);
      gfx.fillStyle(0xffffff, 0.06);
      gfx.fillCircle(21.5, 10.8, 1.2);
    }
  };

  makeTexture('build_tent_s0', 34, 34, (gfx) => drawTentStage(gfx, 0));
  makeTexture('build_tent_s1', 34, 34, (gfx) => drawTentStage(gfx, 1));
  makeTexture('build_tent_s2', 34, 34, (gfx) => drawTentStage(gfx, 2));
  makeTexture('build_tent_s3', 34, 34, (gfx) => drawTentStage(gfx, 3));

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

  const drawFlagStage = (gfx: Phaser.GameObjects.Graphics, stage: 0 | 1 | 2 | 3) => {
    buildBase(gfx);

    // This site is also a hut in gameplay; give it a distinct hut silhouette (wooden cabin).
    // Foundation marker.
    gfx.fillStyle(0x3f1d0b, 0.22);
    gfx.fillRoundedRect(10, 23, 14, 3, 2);

    if (stage === 0) {
      // Blueprint cabin outline.
      gfx.lineStyle(2, 0x38bdf8, 0.55);
      gfx.strokeRoundedRect(11, 16, 12, 8, 2);
      gfx.beginPath();
      gfx.moveTo(17, 11);
      gfx.lineTo(10, 16);
      gfx.moveTo(17, 11);
      gfx.lineTo(24, 16);
      gfx.strokePath();
      gfx.lineStyle(2, 0x93c5fd, 0.35);
      gfx.strokeRoundedRect(16, 19, 3, 5, 1);
      return;
    }

    if (stage === 1) {
      // Frame only.
      gfx.lineStyle(2, 0x111827, 0.55);
      gfx.strokeRoundedRect(11, 16, 12, 8, 2);
      gfx.beginPath();
      gfx.moveTo(17, 11);
      gfx.lineTo(10, 16);
      gfx.moveTo(17, 11);
      gfx.lineTo(24, 16);
      gfx.strokePath();
      gfx.fillStyle(0xe5e7eb, 0.12);
      gfx.fillRoundedRect(12, 18, 10, 3, 2);
      return;
    }

    // Cabin walls.
    gfx.fillStyle(0x92400e, stage === 2 ? 0.55 : 0.92);
    gfx.fillRoundedRect(10.5, 16.2, 13.5, 8.3, 2);
    gfx.fillStyle(0xfbbf24, stage === 2 ? 0.14 : 0.22);
    for (let y = 18; y <= 24; y += 2) {
      gfx.fillRect(11.5, y, 11.5, 1);
    }

    // Roof.
    gfx.fillStyle(0x1f2937, stage === 2 ? 0.55 : 0.95);
    gfx.fillTriangle(17, 9, 8.2, 16.2, 25.8, 16.2);
    gfx.fillStyle(0x334155, stage === 2 ? 0.22 : 0.35);
    gfx.fillTriangle(17, 10.7, 11.2, 16.2, 22.8, 16.2);

    // Eaves.
    gfx.fillStyle(0x111827, stage === 2 ? 0.16 : 0.26);
    gfx.fillRoundedRect(10, 15.8, 14.8, 2, 1);

    // Door + window.
    gfx.fillStyle(0x111827, stage === 2 ? 0.28 : 0.6);
    gfx.fillRoundedRect(15.2, 18.8, 4.6, 6.4, 1);
    gfx.fillStyle(0xe5e7eb, stage === 2 ? 0.07 : 0.12);
    gfx.fillCircle(18.9, 22, 0.7);

    // Larger window with cross muntins.
    gfx.fillStyle(0x38bdf8, stage === 2 ? 0.12 : 0.22);
    gfx.fillRoundedRect(11.7, 18.3, 4.6, 4.6, 1);
    gfx.fillStyle(0x111827, stage === 2 ? 0.10 : 0.16);
    gfx.fillRect(13.9, 18.6, 0.8, 4);
    gfx.fillRect(12.0, 20.4, 4.0, 0.8);

    gfx.lineStyle(2, stroke, stage === 2 ? 0.6 : 0.85);
    gfx.strokeRoundedRect(10.5, 16.2, 13.5, 8.3, 2);
    gfx.strokeTriangle(17, 9, 8.2, 16.2, 25.8, 16.2);

    if (stage === 3) {
      // Small flag to keep the identity of this site.
      gfx.lineStyle(2, 0x111827, 0.9);
      gfx.beginPath();
      gfx.moveTo(24, 12);
      gfx.lineTo(24, 18);
      gfx.strokePath();
      gfx.fillStyle(0x38bdf8, 0.8);
      gfx.fillTriangle(24, 12.5, 29, 14.5, 24, 16.5);
    }
  };

  makeTexture('build_flag_s0', 34, 34, (gfx) => drawFlagStage(gfx, 0));
  makeTexture('build_flag_s1', 34, 34, (gfx) => drawFlagStage(gfx, 1));
  makeTexture('build_flag_s2', 34, 34, (gfx) => drawFlagStage(gfx, 2));
  makeTexture('build_flag_s3', 34, 34, (gfx) => drawFlagStage(gfx, 3));

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

  const drawWoodPileStage = (gfx: Phaser.GameObjects.Graphics, stage: 0 | 1 | 2 | 3) => {
    gfx.fillStyle(0x0b1220, 0.25);
    gfx.fillEllipse(17, 26, 24, 8);

    const drawLog = (x: number, y: number, w: number, h: number, tint: number) => {
      gfx.fillStyle(tint, 1);
      gfx.fillRoundedRect(x, y, w, h, 4);
      gfx.fillStyle(0xfbbf24, 0.22);
      gfx.fillRoundedRect(x + 2, y + 2, w - 4, Math.max(2, Math.floor(h * 0.35)), 3);
      gfx.lineStyle(2, stroke, 0.75);
      gfx.strokeRoundedRect(x + 0.5, y + 0.5, w - 1, h - 1, 4);
    };

    if (stage >= 0) {
      drawLog(8, 18, 18, 7, 0x7c2d12);
    }
    if (stage >= 1) {
      drawLog(7, 11, 20, 7, 0x92400e);
    }
    if (stage >= 2) {
      drawLog(6, 20, 22, 8, 0x9a3412);
      gfx.fillStyle(0xe5e7eb, 0.22);
      gfx.fillCircle(12, 12, 1);
      gfx.fillCircle(24, 15, 1);
    }
    if (stage >= 3) {
      drawLog(10, 7, 16, 7, 0x92400e);
      gfx.fillStyle(0xffffff, 0.06);
      gfx.fillCircle(16, 9, 2);
    }
  };

  makeTexture('wood_pile_s0', 34, 34, (gfx) => drawWoodPileStage(gfx, 0));
  makeTexture('wood_pile_s1', 34, 34, (gfx) => drawWoodPileStage(gfx, 1));
  makeTexture('wood_pile_s2', 34, 34, (gfx) => drawWoodPileStage(gfx, 2));
  makeTexture('wood_pile_s3', 34, 34, (gfx) => drawWoodPileStage(gfx, 3));

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

  const drawWaterTankStage = (gfx: Phaser.GameObjects.Graphics, stage: 0 | 1 | 2 | 3) => {
    // Simple tank + water window (water level varies by stage).
    gfx.fillStyle(0x0b1220, 0.25);
    gfx.fillEllipse(17, 27, 24, 8);

    gfx.fillStyle(0x1f2937, 1);
    gfx.fillRoundedRect(9, 9, 16, 18, 6);
    gfx.fillStyle(0x334155, 0.95);
    gfx.fillRoundedRect(11, 11, 12, 14, 5);

    // Water level window
    gfx.fillStyle(0x0b2942, 1);
    gfx.fillRoundedRect(13, 16, 8, 8, 3);

    const level = stage === 0 ? 0 : stage === 1 ? 2 : stage === 2 ? 4 : 7;
    if (level > 0) {
      gfx.fillStyle(0x38bdf8, 0.22);
      gfx.fillRoundedRect(13, 24 - level, 8, level, 3);
      gfx.fillStyle(0x93c5fd, stage === 3 ? 0.22 : 0.14);
      gfx.fillRoundedRect(13, 24 - level, 8, 1, 3);
    }

    // Cap
    gfx.fillStyle(0x111827, 1);
    gfx.fillRoundedRect(13, 7, 8, 5, 2);

    gfx.lineStyle(2, stroke, 0.8);
    gfx.strokeRoundedRect(9, 9, 16, 18, 6);
  };

  makeTexture('water_tank_s0', 34, 34, (gfx) => drawWaterTankStage(gfx, 0));
  makeTexture('water_tank_s1', 34, 34, (gfx) => drawWaterTankStage(gfx, 1));
  makeTexture('water_tank_s2', 34, 34, (gfx) => drawWaterTankStage(gfx, 2));
  makeTexture('water_tank_s3', 34, 34, (gfx) => drawWaterTankStage(gfx, 3));

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
