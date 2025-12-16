import Phaser from 'phaser';

export type TextureFactory = {
  scene: Phaser.Scene;
  stroke: number;
  makeTexture: (key: string, width: number, height: number, draw: (gfx: Phaser.GameObjects.Graphics) => void) => void;
  shadedCircle: (
    gfx: Phaser.GameObjects.Graphics,
    x: number,
    y: number,
    r: number,
    base: number,
    shade: number,
    highlight: number,
  ) => void;
  strokeRoundedRect: (
    gfx: Phaser.GameObjects.Graphics,
    x: number,
    y: number,
    w: number,
    h: number,
    radius: number,
  ) => void;
};

export function createTextureFactory(scene: Phaser.Scene): TextureFactory {
  const stroke = 0x0b1220;

  const shadedCircle: TextureFactory['shadedCircle'] = (gfx, x, y, r, base, shade, highlight) => {
    gfx.fillStyle(shade, 1);
    gfx.fillCircle(x + 2, y + 2, r);
    gfx.fillStyle(base, 1);
    gfx.fillCircle(x, y, r);
    gfx.fillStyle(highlight, 0.9);
    gfx.fillCircle(x - 2, y - 3, Math.max(1, r - 3));
    gfx.lineStyle(2, stroke, 0.92);
    gfx.strokeCircle(x, y, r);
  };

  const strokeRoundedRect: TextureFactory['strokeRoundedRect'] = (gfx, x, y, w, h, radius) => {
    gfx.lineStyle(2, stroke, 0.9);
    gfx.strokeRoundedRect(x, y, w, h, radius);
  };

  const makeTexture: TextureFactory['makeTexture'] = (key, width, height, draw) => {
    if (scene.textures.exists(key)) return;
    const gfx = scene.add.graphics({ x: 0, y: 0 });
    gfx.setVisible(false);

    draw(gfx);

    gfx.generateTexture(key, width, height);
    gfx.destroy();
  };

  return { scene, stroke, makeTexture, shadedCircle, strokeRoundedRect };
}
