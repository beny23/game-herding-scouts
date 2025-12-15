import Phaser from 'phaser';

export class BootScene extends Phaser.Scene {
  constructor() {
    super('BootScene');
  }

  preload() {
    // No external assets: the game uses procedural textures (created in GameScene).
  }

  create() {
    this.scene.start('GameScene');
  }
}
