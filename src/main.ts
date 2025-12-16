import Phaser from 'phaser';
import { BootScene } from './scenes/BootScene';
import { GameScene } from './scenes/GameScene';

const BASE_WIDTH = 480;
const BASE_HEIGHT = 270;

const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  parent: 'app',
  backgroundColor: '#0b1220',
  pixelArt: true,
  render: {
    antialias: false,
    roundPixels: true,
  },
  scale: {
    // Keep a fixed internal resolution and scale the canvas in CSS.
    mode: Phaser.Scale.NONE,
    width: BASE_WIDTH,
    height: BASE_HEIGHT,
  },
  physics: {
    default: 'arcade',
    arcade: {
      debug: false,
    },
  },
  scene: [BootScene, GameScene],
};

const game = new Phaser.Game(config);

function applyCanvasScale() {
  const parent = document.getElementById('app');
  if (!parent || !game.canvas) return;

  const parentW = parent.clientWidth;
  const parentH = parent.clientHeight;

  // Fill the entire available screen area while preserving aspect ratio.
  // Note: on aspect ratios different from BASE_WIDTH:BASE_HEIGHT, this will crop.
  const zoom = Math.max(parentW / BASE_WIDTH, parentH / BASE_HEIGHT);

  game.canvas.style.width = `${BASE_WIDTH * zoom}px`;
  game.canvas.style.height = `${BASE_HEIGHT * zoom}px`;
}

window.addEventListener('resize', applyCanvasScale);
window.visualViewport?.addEventListener('resize', applyCanvasScale);
window.visualViewport?.addEventListener('scroll', applyCanvasScale);
applyCanvasScale();
