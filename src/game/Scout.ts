import Phaser from 'phaser';
import type { ScoutState } from './types';

export class Scout {
  public readonly sprite: Phaser.Physics.Arcade.Sprite;
  public state: ScoutState = { kind: 'Idle' };

  constructor(sprite: Phaser.Physics.Arcade.Sprite) {
    this.sprite = sprite;
    this.sprite.setDamping(true);
    this.sprite.setDrag(900, 900);
    this.sprite.setMaxVelocity(220, 220);
  }

  isIdle(): boolean {
    return this.state.kind === 'Idle';
  }
}
