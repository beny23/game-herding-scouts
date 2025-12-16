import type { TextureFactory } from './factory';

export function createUiTextures(f: TextureFactory) {
  const { makeTexture } = f;

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
}
