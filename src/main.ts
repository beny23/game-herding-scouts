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
    // Keep a fixed internal resolution and scale the canvas in CSS using integer zoom.
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

function applyIntegerCanvasScale() {
  const parent = document.getElementById('app');
  if (!parent || !game.canvas) return;

  const parentW = parent.clientWidth;
  const parentH = parent.clientHeight;
  const rawZoom = Math.min(parentW / BASE_WIDTH, parentH / BASE_HEIGHT);
  // Prefer crisp integer scaling when possible, but allow downscaling on small screens
  // so the whole game stays visible on mobile.
  const zoom = rawZoom >= 1 ? Math.floor(rawZoom) : rawZoom;

  game.canvas.style.width = `${BASE_WIDTH * zoom}px`;
  game.canvas.style.height = `${BASE_HEIGHT * zoom}px`;
}

window.addEventListener('resize', applyIntegerCanvasScale);
window.visualViewport?.addEventListener('resize', applyIntegerCanvasScale);
window.visualViewport?.addEventListener('scroll', applyIntegerCanvasScale);
applyIntegerCanvasScale();
