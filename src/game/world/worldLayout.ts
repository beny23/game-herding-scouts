import Phaser from 'phaser';
import type { BuildTask, InteractableKind, ResourceKind, TaskId } from '../types';
import { attachStaticShadow, updateDepth } from '../visuals/shadows';
import type { TilemapWorld } from './tilemapWorld';

type WorldSize = { width: number; height: number };

type CreateWorldResult = {
  tasks: Record<TaskId, BuildTask>;
  woodPile: { x: number; y: number };
  woodPileSprite: Phaser.GameObjects.Image;
};

export function createWorldLayout(params: {
  scene: Phaser.Scene;
  world: WorldSize;
  interactables: Phaser.GameObjects.Group;
  tileWorld: TilemapWorld;
}): CreateWorldResult {
  const { scene, world, interactables, tileWorld } = params;

  const cx = tileWorld.clearingCenter.x;
  const cy = tileWorld.clearingCenter.y;

  const snap = (x: number, y: number) => tileWorld.findNearestWalkableWorld(x, y, 4);

  // Wood pile prop inside the clearing (visual feedback for the wood resource).
  const woodPilePos = snap(cx - 60, cy + 50);
  const woodPileX = woodPilePos.x;
  const woodPileY = woodPilePos.y;
  const woodPileSprite = scene.add.image(woodPileX, woodPileY, 'wood_pile_s0').setDepth(woodPileY);
  attachStaticShadow(scene, woodPileX, woodPileY + 6, 14, 0.45);
  scene.add
    .text(woodPileX, woodPileY + 26, 'Wood Pile', {
      fontFamily: 'system-ui, -apple-system, Segoe UI, Roboto, Arial',
      fontSize: '12px',
      color: '#cbd5e1',
    })
    .setOrigin(0.5, 0)
    .setDepth(2000)
    .setShadow(1, 1, '#000000', 3, true, true);

  // Hut build sites inside the clearing.
  const hutAPos = snap(cx - 80, cy - 20);
  const hutBPos = snap(cx + 60, cy + 40);
  const tankPos = snap(cx + 160, cy - 40);
  const campfirePos = snap(cx + 10, cy + 10);

  const hutA = createInteractable({
    scene,
    x: hutAPos.x,
    y: hutAPos.y,
    textureKey: 'build_tent_s0',
    kind: 'hut',
    label: 'Hut A',
    interactables,
  });
  const hutB = createInteractable({
    scene,
    x: hutBPos.x,
    y: hutBPos.y,
    textureKey: 'build_flag_s0',
    kind: 'hut',
    label: 'Hut B',
    interactables,
  });
  const waterTank = createInteractable({
    scene,
    x: tankPos.x,
    y: tankPos.y,
    textureKey: 'water_tank_s0',
    kind: 'hut',
    label: 'Water Tank',
    interactables,
  });

  const campfire = createInteractable({
    scene,
    x: campfirePos.x,
    y: campfirePos.y,
    textureKey: 'campfire_s0',
    kind: 'hut',
    label: 'Campfire',
    interactables,
  });

  const makeTask = (
    id: TaskId,
    label: string,
    sprite: Phaser.Physics.Arcade.Sprite,
    resource: ResourceKind,
    cost: number,
  ): BuildTask => ({
    id,
    label,
    sprite,
    resource,
    cost,
    used: 0,
    progress01: 0,
    complete: false,
  });

  // World bounds hint.
  scene.add
    .rectangle(world.width / 2, world.height / 2, world.width - 40, world.height - 40)
    .setStrokeStyle(2, 0x1f2937, 0.6)
    .setDepth(-9);

  return {
    tasks: {
      hutA: makeTask('hutA', 'Build Hut A', hutA, 'wood', 10),
      hutB: makeTask('hutB', 'Build Hut B', hutB, 'wood', 12),
      waterTank: makeTask('waterTank', 'Fill Water Tank', waterTank, 'water', 12),
      campfire: makeTask('campfire', 'Build Campfire', campfire, 'wood', 6),
    },
    woodPile: { x: woodPileX, y: woodPileY },
    woodPileSprite,
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
