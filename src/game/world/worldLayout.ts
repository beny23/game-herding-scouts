import Phaser from 'phaser';
import type { BuildTask, InteractableKind, TaskId } from '../types';
import { attachStaticShadow, updateDepth } from '../visuals/shadows';

type WorldSize = { width: number; height: number };

type CreateWorldResult = {
  tasks: Record<TaskId, BuildTask>;
};

export function createWorldLayout(params: {
  scene: Phaser.Scene;
  world: WorldSize;
  obstacles: Phaser.Physics.Arcade.StaticGroup;
  interactables: Phaser.GameObjects.Group;
}): CreateWorldResult {
  const { scene, world, obstacles, interactables } = params;

  const obstacleDefs: Array<{
    x: number;
    y: number;
    textureKey: 'obstacle' | 'obstacle_rock2' | 'obstacle_tree' | 'obstacle_stump';
  }> = [
    // Near-ish spawn (keep navigable)
    { x: 420, y: 210, textureKey: 'obstacle_stump' },
    { x: 520, y: 240, textureKey: 'obstacle' },
    { x: 620, y: 360, textureKey: 'obstacle_rock2' },
    { x: 500, y: 420, textureKey: 'obstacle_tree' },
    { x: 340, y: 300, textureKey: 'obstacle_tree' },

    // Upper / mid
    { x: 980, y: 260, textureKey: 'obstacle' },
    { x: 1120, y: 420, textureKey: 'obstacle_rock2' },
    { x: 1240, y: 310, textureKey: 'obstacle_tree' },
    { x: 1320, y: 520, textureKey: 'obstacle_stump' },
    { x: 1080, y: 160, textureKey: 'obstacle_tree' },
    { x: 900, y: 150, textureKey: 'obstacle_tree' },
    { x: 1380, y: 260, textureKey: 'obstacle_tree' },

    // Left / bottom-left
    { x: 300, y: 520, textureKey: 'obstacle_tree' },
    { x: 360, y: 640, textureKey: 'obstacle' },
    { x: 240, y: 720, textureKey: 'obstacle_rock2' },
    { x: 420, y: 820, textureKey: 'obstacle_tree' },
    { x: 160, y: 600, textureKey: 'obstacle_tree' },

    // Bottom / right-bottom
    { x: 820, y: 720, textureKey: 'obstacle_rock2' },
    { x: 980, y: 780, textureKey: 'obstacle' },
    { x: 1180, y: 760, textureKey: 'obstacle_tree' },
    { x: 1280, y: 880, textureKey: 'obstacle_stump' },
    { x: 1460, y: 680, textureKey: 'obstacle_rock2' },
    { x: 1380, y: 760, textureKey: 'obstacle_tree' },
    { x: 1120, y: 900, textureKey: 'obstacle_tree' },
  ];

  for (const def of obstacleDefs) {
    const o = obstacles.create(def.x, def.y, def.textureKey) as Phaser.Physics.Arcade.Sprite;

    // Place the shadow separately so all obstacles match the character style.
    const shadowAlpha = def.textureKey === 'obstacle_tree' ? 0.5 : 0.6;
    const shadowOffset = def.textureKey === 'obstacle_tree' ? 18 : def.textureKey === 'obstacle_stump' ? 16 : 22;
    attachStaticShadow(scene, def.x, def.y, shadowOffset, shadowAlpha);

    const body = o.body as Phaser.Physics.Arcade.StaticBody | Phaser.Physics.Arcade.Body | null;

    // Birds-eye obstacles: centered origins + centered colliders.
    // NOTE: `StaticBody` doesn't reliably expose `setCircle` typings, so we use setSize/setOffset.
    o.setOrigin(0.5, 0.5);
    if (body) {
      if (def.textureKey === 'obstacle_tree') {
        // 72x72 canopy; collider slightly smaller than art.
        body.setSize(44, 44);
        body.setOffset(36 - 22, 36 - 22);
      } else if (def.textureKey === 'obstacle_stump') {
        // 56x56 stump; small collider.
        body.setSize(28, 28);
        body.setOffset(28 - 14, 28 - 14);
      } else {
        // 72x72 rocks: larger centered collider so you can't clip into the top half.
        body.setSize(56, 56);
        body.setOffset(36 - 28, 36 - 28);
      }
    }

    // Static bodies need a refresh after manual size/origin tweaks.
    (o as any).refreshBody?.();

    updateDepth(o);
  }

  // Extra safety: refresh all static bodies.
  (obstacles as any).refresh?.();

  // Resource nodes around the perimeter.
  createInteractable({ scene, x: 200, y: 820, textureKey: 'resource_wood', kind: 'resource', label: 'Woodpile', interactables });
  createInteractable({ scene, x: 1380, y: 200, textureKey: 'resource_water', kind: 'resource', label: 'Water Source', interactables });
  createInteractable({ scene, x: 1420, y: 820, textureKey: 'resource_supply', kind: 'resource', label: 'Supply Crate', interactables });

  // Build sites.
  const tent = createInteractable({ scene, x: 760, y: 520, textureKey: 'build_tent', kind: 'build', label: 'Tent Site', interactables });
  const fire = createInteractable({ scene, x: 860, y: 600, textureKey: 'build_fire', kind: 'build', label: 'Fire Ring', interactables });
  const flag = createInteractable({ scene, x: 960, y: 520, textureKey: 'build_flag', kind: 'build', label: 'Flagpole', interactables });

  const makeTask = (id: TaskId, label: string, sprite: Phaser.Physics.Arcade.Sprite): BuildTask => ({
    id,
    label,
    sprite,
    progress01: 0,
    complete: false,
  });

  // Clearing zone.
  scene.add
    .rectangle(880, 560, 520, 340)
    .setStrokeStyle(2, 0x1f2937, 1)
    .setFillStyle(0x111827, 0.35);

  // World bounds hint.
  scene.add
    .rectangle(world.width / 2, world.height / 2, world.width - 40, world.height - 40)
    .setStrokeStyle(2, 0x1f2937, 0.6)
    .setDepth(-9);

  return {
    tasks: {
      tent: makeTask('tent', 'Pitch Tent', tent),
      campfire: makeTask('campfire', 'Start Campfire', fire),
      flag: makeTask('flag', 'Raise Flag', flag),
    },
  };
}

function createInteractable(params: {
  scene: Phaser.Scene;
  x: number;
  y: number;
  textureKey: string;
  kind: InteractableKind;
  label: string;
  interactables: Phaser.GameObjects.Group;
}): Phaser.Physics.Arcade.Sprite {
  const { scene, x, y, textureKey, kind, label, interactables } = params;

  const sprite = scene.physics.add.staticSprite(x, y, textureKey);
  sprite.setDataEnabled();
  sprite.data.set('kind', kind);
  sprite.data.set('label', label);

  const shadow = attachStaticShadow(scene, x, y, 14, 0.55);
  sprite.data.set('shadow', shadow);

  updateDepth(sprite);

  const labelText = scene.add
    .text(x, y + 26, label, {
      fontFamily: 'system-ui, -apple-system, Segoe UI, Roboto, Arial',
      fontSize: '12px',
      color: '#cbd5e1',
    })
    .setOrigin(0.5, 0);

  // Readability pill behind text (scaled to fit).
  const labelBg = scene.add.image(x, y + 36, 'label_bg').setOrigin(0.5, 0.5);
  labelBg.setDisplaySize(Math.max(72, labelText.width + 18), 22);
  labelBg.setAlpha(0.95);
  labelBg.setDepth(1999);

  labelText.setDepth(2000);
  labelText.setShadow(1, 1, '#000000', 3, true, true);

  interactables.add(sprite);
  return sprite;
}
