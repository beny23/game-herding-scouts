import Phaser from 'phaser';

export type ScoutState =
  | { kind: 'Idle' }
  | { kind: 'Follow' }
  | { kind: 'GoToTarget'; target: Phaser.GameObjects.GameObject }
  | { kind: 'Work'; target: Phaser.GameObjects.GameObject; untilMs: number };

export type InteractableKind = 'resource' | 'build';

export type TaskId = 'tent' | 'campfire' | 'flag';

export type BuildTask = {
  id: TaskId;
  label: string;
  sprite: Phaser.Physics.Arcade.Sprite;
  progress01: number;
  complete: boolean;
};
