import type { TextureFactory } from './factory';

export function createPropTextures(f: TextureFactory) {
  const { makeTexture } = f;

  // Micro-props (small decorative sprites).
  makeTexture('prop_grass', 16, 16, (gfx) => {
    gfx.fillStyle(0x14532d, 0.9);
    gfx.fillTriangle(8, 15, 6, 8, 10, 15);
    gfx.fillTriangle(8, 15, 3, 10, 7, 15);
    gfx.fillTriangle(8, 15, 9, 9, 13, 15);
    gfx.fillStyle(0x22c55e, 0.18);
    gfx.fillTriangle(8, 15, 7, 10, 9, 15);
  });

  makeTexture('prop_flower', 16, 16, (gfx) => {
    gfx.fillStyle(0x14532d, 0.75);
    gfx.fillRect(7.5, 7, 1, 7);
    gfx.fillStyle(0xfbbf24, 0.9);
    gfx.fillCircle(8, 6.2, 2.2);
    gfx.fillStyle(0xffffff, 0.35);
    gfx.fillCircle(7.2, 5.5, 0.8);
  });

  makeTexture('prop_pebble', 16, 16, (gfx) => {
    gfx.fillStyle(0x0b1220, 0.18);
    gfx.fillEllipse(9, 12, 10, 4);
    gfx.fillStyle(0x334155, 0.9);
    gfx.fillCircle(7, 10, 2.2);
    gfx.fillCircle(11, 11, 1.8);
    gfx.fillStyle(0xe5e7eb, 0.12);
    gfx.fillCircle(6.2, 9.3, 0.8);
  });
}
