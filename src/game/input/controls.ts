import Phaser from 'phaser';

export type GameKeys = {
  W: Phaser.Input.Keyboard.Key;
  A: Phaser.Input.Keyboard.Key;
  S: Phaser.Input.Keyboard.Key;
  D: Phaser.Input.Keyboard.Key;
  E: Phaser.Input.Keyboard.Key;
  Q: Phaser.Input.Keyboard.Key;
};

export function createControls(scene: Phaser.Scene) {
  const keyboard = scene.input.keyboard;
  if (!keyboard) {
    throw new Error('Keyboard input is not available on this scene');
  }

  const cursors = keyboard.createCursorKeys();
  const keys: GameKeys = {
    W: keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W),
    A: keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A),
    S: keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S),
    D: keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D),
    E: keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.E),
    Q: keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.Q),
  };

  return { cursors, keys };
}
