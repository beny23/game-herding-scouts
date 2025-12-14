import Phaser from 'phaser';
import type { BuildTask, TaskId } from '../types';

export type Hud = {
  checklistPanel: Phaser.GameObjects.Graphics;
  promptPanel: Phaser.GameObjects.Graphics;
  checklistText: Phaser.GameObjects.Text;
  promptText: Phaser.GameObjects.Text;
};

export function createHud(scene: Phaser.Scene): Hud {
  const checklistPanel = scene.add.graphics().setScrollFactor(0).setDepth(999);
  const promptPanel = scene.add.graphics().setScrollFactor(0).setDepth(999);

  const checklistText = scene.add
    .text(12, 12, '', {
      fontFamily: 'system-ui, -apple-system, Segoe UI, Roboto, Arial',
      fontSize: '16px',
      color: '#e5e7eb',
    })
    .setScrollFactor(0)
    .setDepth(1000);

  const promptText = scene.add
    .text(12, 540 - 12, '', {
      fontFamily: 'system-ui, -apple-system, Segoe UI, Roboto, Arial',
      fontSize: '16px',
      color: '#e5e7eb',
    })
    .setOrigin(0, 1)
    .setScrollFactor(0)
    .setDepth(1000);

  return { checklistPanel, promptPanel, checklistText, promptText };
}

export function updateChecklistText(hud: Hud, tasks: Record<TaskId, BuildTask> | null, wood: number = 0, water: number = 0) {
  if (!tasks) {
    hud.checklistText.setText('Loading...');
    return;
  }

  const taskList = Object.values(tasks);
  const allComplete = taskList.every((t) => t.complete);

  const lines = [
    'Checklist',
    `Wood: ${Math.floor(wood)}`,
    `Water: ${Math.floor(water)}`,
    ...taskList.map((t) => {
      const status = t.complete ? '✓' : `${Math.round(t.progress01 * 100)}%`;
      return `- ${t.label}: ${status}`;
    }),
    '',
    allComplete ? 'All tasks complete — you win!' : 'Controls: WASD / Arrows to move, E to interact, Q to whistle',
  ];

  hud.checklistText.setText(lines.join('\n'));
}

export function updatePromptText(hud: Hud, prompt: string) {
  hud.promptText.setText(prompt);
}

export function updateHudPanels(hud: Hud) {
  hud.checklistPanel.clear();
  const pad = 10;
  const x = hud.checklistText.x;
  const y = hud.checklistText.y;
  const w = Math.max(240, hud.checklistText.width + pad * 2);
  const h = hud.checklistText.height + pad * 2;
  hud.checklistPanel.fillStyle(0x0b1220, 0.72);
  hud.checklistPanel.lineStyle(2, 0x1f2937, 0.9);
  hud.checklistPanel.fillRoundedRect(x - pad, y - pad, w, h, 10);
  hud.checklistPanel.strokeRoundedRect(x - pad, y - pad, w, h, 10);

  hud.promptPanel.clear();
  if (!hud.promptText.text) return;

  const pw = Math.max(360, hud.promptText.width + pad * 2);
  const ph = hud.promptText.height + pad * 2;
  const px = hud.promptText.x;
  const pyTop = hud.promptText.y - hud.promptText.height;
  hud.promptPanel.fillStyle(0x0b1220, 0.72);
  hud.promptPanel.lineStyle(2, 0x1f2937, 0.9);
  hud.promptPanel.fillRoundedRect(px - pad, pyTop - pad, pw, ph, 10);
  hud.promptPanel.strokeRoundedRect(px - pad, pyTop - pad, pw, ph, 10);
}
