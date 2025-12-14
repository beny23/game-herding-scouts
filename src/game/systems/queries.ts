import Phaser from 'phaser';
import type { Scout } from '../Scout';

export function findNearbyScout(leader: Phaser.Physics.Arcade.Sprite, scouts: Scout[], maxDist: number): Scout | null {
  let best: Scout | null = null;
  let bestDist = Number.POSITIVE_INFINITY;

  for (const scout of scouts) {
    const d = Phaser.Math.Distance.Between(leader.x, leader.y, scout.sprite.x, scout.sprite.y);
    if (d <= maxDist && d < bestDist) {
      bestDist = d;
      best = scout;
    }
  }

  return best;
}

export function findNearestInteractableInRange(
  leader: Phaser.Physics.Arcade.Sprite,
  interactables: Phaser.GameObjects.Group,
  maxDist: number,
): Phaser.Physics.Arcade.Sprite | null {
  const sprites = interactables.getChildren() as Phaser.Physics.Arcade.Sprite[];
  let best: Phaser.Physics.Arcade.Sprite | null = null;
  let bestDist = Number.POSITIVE_INFINITY;

  for (const s of sprites) {
    const d = Phaser.Math.Distance.Between(leader.x, leader.y, s.x, s.y);
    if (d <= maxDist && d < bestDist) {
      bestDist = d;
      best = s;
    }
  }

  return best;
}

export function findNearestIdleScout(x: number, y: number, scouts: Scout[]): Scout | null {
  let best: Scout | null = null;
  let bestDist = Number.POSITIVE_INFINITY;

  for (const scout of scouts) {
    if (!scout.isIdle()) continue;
    const d = Phaser.Math.Distance.Between(x, y, scout.sprite.x, scout.sprite.y);
    if (d < bestDist) {
      bestDist = d;
      best = scout;
    }
  }

  return best;
}
