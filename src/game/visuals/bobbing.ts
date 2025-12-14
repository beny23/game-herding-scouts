import Phaser from 'phaser';

export function enableBobbing(sprite: Phaser.Physics.Arcade.Sprite) {
  sprite.setDataEnabled();
  sprite.data.set('bobbingSeed', Phaser.Math.FloatBetween(0, Math.PI * 2));
  sprite.data.set('baseScaleX', sprite.scaleX);
  sprite.data.set('baseScaleY', sprite.scaleY);
}

export function updateBobbing(sprite: Phaser.Physics.Arcade.Sprite, timeMs: number) {
  const seed = sprite.data?.get('bobbingSeed') as number | undefined;
  if (typeof seed !== 'number') return;

  const body = sprite.body as Phaser.Physics.Arcade.Body | null;
  const speed = body ? Math.hypot(body.velocity.x, body.velocity.y) : 0;

  const baseScaleX = (sprite.data?.get('baseScaleX') as number | undefined) ?? 1;
  const baseScaleY = (sprite.data?.get('baseScaleY') as number | undefined) ?? 1;

  const isMoving = speed > 12;
  const freqHz = isMoving ? 3.5 : 1.4;
  const t = timeMs / 1000;
  const w = Math.sin((t * Math.PI * 2 * freqHz) + seed);

  const rot = Phaser.Math.DegToRad(isMoving ? 4 : 2.5);
  sprite.setRotation(w * rot);

  const sx = baseScaleX * (1 + (isMoving ? 0.045 : 0.03) * w);
  const sy = baseScaleY * (1 - (isMoving ? 0.035 : 0.02) * w);
  sprite.setScale(sx, sy);
}
