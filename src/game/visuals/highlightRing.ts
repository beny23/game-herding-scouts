import Phaser from 'phaser';

export function createHighlightRing(scene: Phaser.Scene): Phaser.GameObjects.Image {
  const ring = scene.add.image(0, 0, 'ring');
  ring.setVisible(false);
  ring.setDepth(70);

  scene.tweens.add({
    targets: ring,
    scale: { from: 0.95, to: 1.05 },
    alpha: { from: 0.85, to: 1 },
    duration: 520,
    yoyo: true,
    repeat: -1,
    ease: 'Sine.inOut',
  });

  return ring;
}

export function setHighlightTarget(ring: Phaser.GameObjects.Image, target: { x: number; y: number } | null) {
  if (!target) {
    ring.setVisible(false);
    return;
  }
  ring.setVisible(true);
  ring.setPosition(target.x, target.y);
  ring.setDepth(target.y + 100);
}
