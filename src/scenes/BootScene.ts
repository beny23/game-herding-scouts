import Phaser from 'phaser';

export class BootScene extends Phaser.Scene {
  constructor() {
    super('BootScene');
  }

  preload() {
    // MVP: no external assets yet; we use simple graphics.
    // Keep this scene so it’s easy to add assets later.
  }

  create() {
    this.scene.start('GameScene');
  }
}
