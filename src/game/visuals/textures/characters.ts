import type { TextureFactory } from './factory';

export function createCharacterTextures(f: TextureFactory) {
  const { makeTexture, shadedCircle, strokeRoundedRect, stroke } = f;

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

    // Facing cue (tiny highlight "nose" on the right).
    gfx.fillStyle(0xffffff, 0.14);
    gfx.fillCircle(23.3, 18.1, 2.0);
    gfx.fillStyle(0xffffff, 0.12);
    gfx.fillCircle(24.2, 17.3, 1.1);

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

  const drawScout = (
    gfx: Phaser.GameObjects.Graphics,
    bodyA: number,
    bodyB: number,
    bodyHi: number,
    stripe: number,
  ) => {
    shadedCircle(gfx, 14, 15, 9, bodyA, bodyB, bodyHi);
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

    // Facing cue (tiny visor highlight on the right).
    gfx.fillStyle(0xffffff, 0.14);
    gfx.fillCircle(21.1, 15.2, 1.9);

    // Bandana stripe
    gfx.fillStyle(stripe, 1);
    gfx.fillRoundedRect(7, 9, 14, 5, 3);
    gfx.fillStyle(0xe5e7eb, 0.06);
    gfx.fillRoundedRect(8, 10, 12, 2, 2);
    strokeRoundedRect(gfx, 7, 9, 14, 5, 3);

    // Small backpack
    gfx.fillStyle(0x1f2937, 0.8);
    gfx.fillRoundedRect(3, 13, 6, 9, 3);
    gfx.fillStyle(0xffffff, 0.06);
    gfx.fillRoundedRect(4, 14, 4, 2, 2);
    gfx.lineStyle(1, stroke, 0.8);
    gfx.strokeRoundedRect(3, 13, 6, 9, 3);
  };

  // Scout variants (same shape, subtle color accents).
  makeTexture('scout_a', 28, 28, (gfx) => drawScout(gfx, 0x22c55e, 0x16a34a, 0x86efac, 0x14532d));
  makeTexture('scout_b', 28, 28, (gfx) => drawScout(gfx, 0x38bdf8, 0x0ea5e9, 0x93c5fd, 0x1f2937));
  makeTexture('scout_c', 28, 28, (gfx) => drawScout(gfx, 0xa78bfa, 0x8b5cf6, 0xddd6fe, 0x4c1d95));

  // Back-compat default.
  makeTexture('scout', 28, 28, (gfx) => drawScout(gfx, 0x22c55e, 0x16a34a, 0x86efac, 0x14532d));
}
