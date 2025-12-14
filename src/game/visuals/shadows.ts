import Phaser from 'phaser';

export function attachShadow(scene: Phaser.Scene, sprite: Phaser.Physics.Arcade.Sprite, yOffset: number) {
  const shadow = scene.add.image(sprite.x, sprite.y + yOffset, 'shadow');
  shadow.setAlpha(0.6);
  shadow.setDepth(sprite.y - 2);
  sprite.setDataEnabled();
  sprite.data.set('shadow', shadow);
}

export function updateShadow(sprite: Phaser.Physics.Arcade.Sprite, yOffset: number) {
  const shadow = sprite.data?.get('shadow') as Phaser.GameObjects.Image | undefined;
  if (!shadow) return;
  shadow.setPosition(sprite.x, sprite.y + yOffset);
  shadow.setDepth(sprite.y - 2);
}

export function attachStaticShadow(scene: Phaser.Scene, x: number, y: number, yOffset: number, alpha: number) {
  const shadow = scene.add.image(x, y + yOffset, 'shadow');
  shadow.setAlpha(alpha);
  shadow.setDepth(y - 2);
  return shadow;
}

export function updateDepth(sprite: Phaser.GameObjects.GameObject & { y: number; setDepth: (d: number) => any }) {
  sprite.setDepth(sprite.y);
}
