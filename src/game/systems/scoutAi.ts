import Phaser from 'phaser';
import type { Scout } from '../Scout';
import type { BuildTask, InteractableKind, TaskId } from '../types';

type UpdateScoutParams = {
  scout: Scout;
  leader: Phaser.Physics.Arcade.Sprite;
  tasks: Record<TaskId, BuildTask> | null;
  time: number;
  delta: number;
  workEmitter: Phaser.GameObjects.Particles.ParticleEmitter;
};

export function updateScoutAI(params: UpdateScoutParams) {
  const { scout, leader, tasks, time, delta, workEmitter } = params;
  const speed = 200;

  switch (scout.state.kind) {
    case 'Idle': {
      scout.sprite.setVelocity(0, 0);
      return;
    }
    case 'Follow': {
      const desiredDist = 70;
      const d = Phaser.Math.Distance.Between(scout.sprite.x, scout.sprite.y, leader.x, leader.y);
      if (d > desiredDist) {
        const v = new Phaser.Math.Vector2(leader.x - scout.sprite.x, leader.y - scout.sprite.y).normalize().scale(speed);
        scout.sprite.setVelocity(v.x, v.y);
      } else {
        scout.sprite.setVelocity(0, 0);
      }
      return;
    }
    case 'GoToTarget': {
      const target = scout.state.target as any;
      const tx = typeof target.x === 'number' ? target.x : leader.x;
      const ty = typeof target.y === 'number' ? target.y : leader.y;

      const d = Phaser.Math.Distance.Between(scout.sprite.x, scout.sprite.y, tx, ty);
      if (d < 30) {
        const untilMs = time + 1400;
        scout.state = { kind: 'Work', target: scout.state.target, untilMs };
        scout.sprite.setVelocity(0, 0);
        return;
      }

      const v = new Phaser.Math.Vector2(tx - scout.sprite.x, ty - scout.sprite.y).normalize().scale(speed);
      scout.sprite.setVelocity(v.x, v.y);
      return;
    }
    case 'Work': {
      scout.sprite.setVelocity(0, 0);

      const target = scout.state.target as any;
      const kind: InteractableKind | undefined = target?.data?.get?.('kind');

      if (kind === 'build' && tasks) {
        const buildTask = Object.values(tasks).find((t) => t.sprite === target);
        if (buildTask && !buildTask.complete) {
          const ratePerSecond = 0.18;
          buildTask.progress01 = Phaser.Math.Clamp(buildTask.progress01 + ratePerSecond * (delta / 1000), 0, 1);
          if (buildTask.progress01 >= 1) {
            buildTask.complete = true;
          }

          if (Phaser.Math.Between(0, 2) === 0) {
            const ox = Phaser.Math.Between(-10, 10);
            const oy = Phaser.Math.Between(-10, 10);
            workEmitter.emitParticleAt((target as any).x + ox, (target as any).y + oy, 1);
          }
        }
      }

      if (time >= scout.state.untilMs) {
        scout.state = { kind: 'Idle' };
      }
      return;
    }
  }
}
