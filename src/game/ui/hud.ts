import Phaser from 'phaser';
import type { BuildTask, TaskId } from '../types';

export type Hud = {
  checklistPanel: Phaser.GameObjects.Graphics;
  promptPanel: Phaser.GameObjects.Graphics;
  checklistText: Phaser.GameObjects.Text;
  promptText: Phaser.GameObjects.Text;
};

function getSafeArea(scene: Phaser.Scene) {
  const raw = scene.game.registry.get('safeArea') as any;
  if (!raw || typeof raw !== 'object') {
    return { x: 0, y: 0, width: scene.scale.width, height: scene.scale.height };
  }

  const x = typeof raw.x === 'number' ? raw.x : 0;
  const y = typeof raw.y === 'number' ? raw.y : 0;
  const width = typeof raw.width === 'number' ? raw.width : scene.scale.width;
  const height = typeof raw.height === 'number' ? raw.height : scene.scale.height;

  return { x, y, width, height };
}

export function createHud(scene: Phaser.Scene): Hud {
  const safe = getSafeArea(scene);
  const isCompact = safe.height <= 300;
  const fontSize = isCompact ? '9px' : '12px';
  const margin = isCompact ? 4 : 6;
  const strokeThickness = isCompact ? 1 : 2;

  const checklistPanel = scene.add.graphics().setScrollFactor(0).setDepth(999);
  const promptPanel = scene.add.graphics().setScrollFactor(0).setDepth(999);

  const checklistText = scene.add
    .text(safe.x + margin, safe.y + margin, '', {
      fontFamily: 'system-ui, -apple-system, Segoe UI, Roboto, Arial',
      fontSize,
      color: '#f8fafc',
      fontStyle: '600',
      lineSpacing: isCompact ? 1 : 3,
    })
    .setScrollFactor(0)
    .setDepth(1000);

  checklistText.setStroke('#0b1220', strokeThickness);
  checklistText.setShadow(1, 1, '#000000', 4, true, true);

  const promptText = scene.add
    .text(safe.x + margin, safe.y + safe.height - margin, '', {
      fontFamily: 'system-ui, -apple-system, Segoe UI, Roboto, Arial',
      fontSize,
      color: '#f8fafc',
      fontStyle: '600',
      lineSpacing: isCompact ? 1 : 2,
    })
    .setOrigin(0, 1)
    .setScrollFactor(0)
    .setDepth(1000);

  promptText.setStroke('#0b1220', strokeThickness);
  promptText.setShadow(1, 1, '#000000', 4, true, true);

  return { checklistPanel, promptPanel, checklistText, promptText };
}

export function updateChecklistText(
  hud: Hud,
  tasks: Record<TaskId, BuildTask> | null,
  wood: number = 0,
  water: number = 0,
  controlsHint?: string,
) {
  if (!tasks) {
    hud.checklistText.setText('Loading...');
    return;
  }

  const taskList = Object.values(tasks);
  const allComplete = taskList.every((t) => t.complete);

  // Compact HUD for low internal resolutions (e.g. 320x180).
  const isCompact = hud.checklistText.scene.scale.height <= 300;
  if (isCompact) {
    const byId = (id: TaskId) => taskList.find((t) => t.id === id);
    const pct = (t: BuildTask | undefined) => (t ? Math.round(t.progress01 * 100) : 0);

    const hutA = byId('hutA');
    const hutB = byId('hutB');
    const waterTank = byId('waterTank');
    const campfire = byId('campfire');

    const lines = allComplete
      ? ['All complete!']
      : [
          `W ${Math.floor(wood)}  Wa ${Math.floor(water)}`,
          `A ${pct(hutA)}%  B ${pct(hutB)}%  T ${pct(waterTank)}%  F ${pct(campfire)}%`,
        ];

    hud.checklistText.setText(lines.join('\n'));
    return;
  }

  const lines = [
    'Checklist',
    `Wood: ${Math.floor(wood)}`,
    `Water: ${Math.floor(water)}`,
    ...taskList.map((t) => {
      const status = t.complete ? '✓' : `${Math.round(t.progress01 * 100)}%`;
      return `- ${t.label}: ${status}`;
    }),
    '',
    allComplete ? 'All tasks complete — you win!' : controlsHint ?? 'Controls: WASD / Arrows to move, E to interact, Q to whistle',
  ];

  hud.checklistText.setText(lines.join('\n'));
}

export function updatePromptText(hud: Hud, prompt: string) {
  hud.promptText.setText(prompt);
}

export function updateHudPanels(hud: Hud) {
  const safe = getSafeArea(hud.checklistText.scene);

  hud.checklistPanel.clear();
  const isCompact = safe.height <= 300;
  const pad = isCompact ? 4 : 6;

  // Re-anchor HUD text into the visible safe area each frame (important for full-screen cover scaling).
  hud.checklistText.setPosition(safe.x + pad, safe.y + pad);
  hud.promptText.setPosition(safe.x + pad, safe.y + safe.height - pad);

  const x = hud.checklistText.x;
  const y = hud.checklistText.y;
  const maxW = Math.max(40, safe.width - 12);
  const w = Math.min(maxW, Math.max(isCompact ? 108 : 180, hud.checklistText.width + pad * 2));
  const h = hud.checklistText.height + pad * 2;
  hud.checklistPanel.fillStyle(0x0b1220, 0.8);
  hud.checklistPanel.lineStyle(2, 0x1f2937, 0.95);
  hud.checklistPanel.fillRoundedRect(x - pad, y - pad, w, h, isCompact ? 6 : 10);
  hud.checklistPanel.strokeRoundedRect(x - pad, y - pad, w, h, isCompact ? 6 : 10);

  hud.promptPanel.clear();
  if (!hud.promptText.text) return;

  const pw = Math.min(maxW, Math.max(isCompact ? 160 : 260, hud.promptText.width + pad * 2));
  const ph = hud.promptText.height + pad * 2;
  const px = hud.promptText.x;
  const pyTop = hud.promptText.y - hud.promptText.height;
  hud.promptPanel.fillStyle(0x0b1220, 0.8);
  hud.promptPanel.lineStyle(2, 0x1f2937, 0.95);
  hud.promptPanel.fillRoundedRect(px - pad, pyTop - pad, pw, ph, isCompact ? 6 : 10);
  hud.promptPanel.strokeRoundedRect(px - pad, pyTop - pad, pw, ph, isCompact ? 6 : 10);
}
