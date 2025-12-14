import Phaser from 'phaser';
import type { BuildTask, TaskId } from '../types';

export function updateBuildProgressRings(gfx: Phaser.GameObjects.Graphics, tasks: Record<TaskId, BuildTask> | null) {
  if (!tasks) return;

  gfx.clear();

  for (const task of Object.values(tasks)) {
    const x = task.sprite.x;
    const y = task.sprite.y;

    gfx.lineStyle(4, 0x0b1220, 0.65);
    gfx.strokeCircle(x, y, 22);

    if (task.complete) {
      gfx.lineStyle(4, 0x22c55e, 0.95);
      gfx.strokeCircle(x, y, 22);
      continue;
    }

    gfx.lineStyle(4, 0x38bdf8, 0.95);
    const start = -Math.PI / 2;
    const end = start + task.progress01 * Math.PI * 2;
    gfx.beginPath();
    gfx.arc(x, y, 22, start, end, false);
    gfx.strokePath();
  }
}
