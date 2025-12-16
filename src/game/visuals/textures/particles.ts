import type { TextureFactory } from './factory';

export function createParticleTextures(f: TextureFactory) {
  const { makeTexture } = f;

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

  // Resource-action particles.
  makeTexture('chip', 12, 12, (gfx) => {
    gfx.fillStyle(0xb45309, 0.9);
    gfx.fillTriangle(6, 2, 2, 10, 10, 9);
    gfx.fillStyle(0xfbbf24, 0.22);
    gfx.fillTriangle(6.5, 3, 4, 9, 9, 8);
  });

  makeTexture('droplet', 12, 12, (gfx) => {
    gfx.fillStyle(0x38bdf8, 0.9);
    gfx.fillCircle(6, 7, 3);
    gfx.fillTriangle(6, 1.5, 3.7, 6, 8.3, 6);
    gfx.fillStyle(0xffffff, 0.14);
    gfx.fillCircle(5, 6, 1);
  });
}
