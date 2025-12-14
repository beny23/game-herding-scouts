import Phaser from 'phaser';

export type LeaderMovementKeys = {
  W: Phaser.Input.Keyboard.Key;
  A: Phaser.Input.Keyboard.Key;
  S: Phaser.Input.Keyboard.Key;
  D: Phaser.Input.Keyboard.Key;
};

export function updateLeaderMovement(params: {
  leader: Phaser.Physics.Arcade.Sprite;
  cursors: Phaser.Types.Input.Keyboard.CursorKeys;
  keys: LeaderMovementKeys;
  speed?: number;
}) {
  const { leader, cursors, keys } = params;
  const speed = params.speed ?? 260;

  const left = cursors.left?.isDown || keys.A.isDown;
  const right = cursors.right?.isDown || keys.D.isDown;
  const up = cursors.up?.isDown || keys.W.isDown;
  const down = cursors.down?.isDown || keys.S.isDown;

  let vx = 0;
  let vy = 0;

  if (left) vx -= 1;
  if (right) vx += 1;
  if (up) vy -= 1;
  if (down) vy += 1;

  if (vx !== 0 || vy !== 0) {
    const v = new Phaser.Math.Vector2(vx, vy).normalize().scale(speed);
    leader.setVelocity(v.x, v.y);
  } else {
    leader.setVelocity(0, 0);
  }
}
