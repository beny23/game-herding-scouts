import Phaser from 'phaser';

import { Scout } from '../Scout';

export function spawnScouts(params: {
  scene: Phaser.Scene & { physics: Phaser.Physics.Arcade.ArcadePhysics };
  positions?: Array<{ x: number; y: number }>;
  textureKey?: string;
}) {
  const { scene } = params;
  const textureKey = params.textureKey ?? 'scout';

  const positions =
    params.positions ??
    [
      { x: 220, y: 300 },
      { x: 280, y: 310 },
      { x: 240, y: 340 },
    ];

  return positions.map((pos) => {
    const sprite = scene.physics.add.sprite(pos.x, pos.y, textureKey);
    sprite.setCollideWorldBounds(true);
    sprite.setDepth(5);

    // Tighter collision so scouts don't feel like big blocks.
    const body = sprite.body as Phaser.Physics.Arcade.Body;
    body.setCircle(8, Math.floor(sprite.width / 2 - 8), Math.floor(sprite.height / 2 - 8));

    return new Scout(sprite);
  });
}
