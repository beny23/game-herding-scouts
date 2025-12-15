import Phaser from 'phaser';

export class BootScene extends Phaser.Scene {
  constructor() {
    super('BootScene');
  }

  preload() {
    // Pixel art assets (placeholders). Procedural textures will fill any missing keys.
    // Mystic Woods pack-derived tileset (16px tiles). Generated via: npm run gen:mystic
    this.load.image('tileset_mw16', 'assets/tiles/mystic_woods_tileset16.png');
    this.load.image('tileset32', 'assets/tiles/tileset32.png');
    // CC0 tileset from OpenGameArt (upscaled 2x nearest-neighbor to 32px tiles).
    this.load.image('tileset_oga32', 'assets/tiles/oga_terrain_tiles32.png');
    this.load.image('leader', 'assets/chars/leader32.png');
    this.load.image('scout', 'assets/chars/scout32.png');
    this.load.image('spark', 'assets/ui/spark.png');

    // UI + props
    this.load.image('shadow', 'assets/ui/shadow.png');
    this.load.image('ring', 'assets/ui/ring.png');
    this.load.image('label_bg', 'assets/ui/label_bg.png');
    this.load.image('build_tent', 'assets/props/build_tent.png');
    this.load.image('build_flag', 'assets/props/build_flag.png');
    this.load.image('wood_pile', 'assets/props/wood_pile.png');
    this.load.image('water_tank', 'assets/props/water_tank.png');
  }

  create() {
    this.scene.start('GameScene');
  }
}
