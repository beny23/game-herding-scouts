import Phaser from 'phaser';

export type TileTarget = {
  kind: 'tree' | 'water';
  tx: number;
  ty: number;

  // Reachable stand position (adjacent walkable tile).
  x: number;
  y: number;

  // Visual/source position (center of the actual tile being interacted with).
  sourceX: number;
  sourceY: number;
};

export type Target = Phaser.GameObjects.GameObject | TileTarget;

export type ScoutState =
  | { kind: 'Idle' }
  | { kind: 'Follow' }
  | { kind: 'Regroup' }
  | { kind: 'GoToTarget'; target: Target }
  | { kind: 'ChopTree'; target: TileTarget; untilMs: number }
  | { kind: 'FetchWater'; target: TileTarget; untilMs: number }
  | { kind: 'CarryWoodToPile'; amount: number }
  | { kind: 'CarryWoodToTask'; task: Phaser.Physics.Arcade.Sprite; amount: number; stage: 'toPile' | 'toTask' }
  | {
      kind: 'CarryWaterToTask';
      task: Phaser.Physics.Arcade.Sprite;
      stage: 'toWater' | 'toTask';
      waterTarget: TileTarget;
      amount: number;
    }
  | { kind: 'BuildHut'; target: Phaser.GameObjects.GameObject };

export type InteractableKind = 'hut';

export type ResourceKind = 'wood' | 'water';

export type TaskId = 'hutA' | 'hutB' | 'waterTank' | 'campfire';

export type BuildTask = {
  id: TaskId;
  label: string;
  sprite: Phaser.Physics.Arcade.Sprite;
  resource: ResourceKind;
  cost: number;
  used: number;
  progress01: number;
  complete: boolean;
};
