import Phaser from 'phaser';
import type { Scout } from '../Scout';
import type { BuildTask, ResourceKind, TaskId } from '../types';
import type { TileTarget } from '../types';
import type { TilemapWorld } from '../world/tilemapWorld';
import { findNearestIdleScout, findNearestInteractableInRange } from './queries';

type ForcedInteractTarget =
  | { kind: 'interactable'; sprite: Phaser.Physics.Arcade.Sprite }
  | { kind: 'tree'; target: TileTarget }
  | { kind: 'water'; target: TileTarget };

type HandleInteractParams = {
  leader: Phaser.Physics.Arcade.Sprite;
  scouts: Scout[];
  interactables: Phaser.GameObjects.Group;
  tileWorld: TilemapWorld;
  tasks: Record<TaskId, BuildTask> | null;
  woodPile: { x: number; y: number };
  reserveResource: (resource: ResourceKind, want: number) => number;
  interactableRange: number;
  treeRange: number;
  waterRange: number;
  forced?: ForcedInteractTarget;
};

export function handleInteract(params: HandleInteractParams) {
  const {
    leader,
    scouts,
    interactables,
    tileWorld,
    tasks,
    woodPile,
    reserveResource,
    interactableRange,
    treeRange,
    waterRange,
    forced,
  } = params;

  if (forced) {
    if (forced.kind === 'interactable') {
      const interactable = forced.sprite;

      const task = tasks ? Object.values(tasks).find((t) => t.sprite === interactable) : null;
      if (!task || task.complete) return;

      const idleScout = findNearestIdleScout(interactable.x, interactable.y, scouts);
      if (!idleScout) return;

      if (task.resource === 'wood') {
        const want = Math.min(2, Math.max(0, task.cost - task.used));
        if (want <= 0) return;

        const amount = reserveResource('wood', want);
        if (amount <= 0) return;

        idleScout.state = { kind: 'CarryWoodToTask', task: interactable, amount, stage: 'toPile' };
        return;
      }

      if (task.resource === 'water') {
        const waterTarget = tileWorld.findNearestWaterTarget(
          interactable.x,
          interactable.y,
          Math.max(waterRange, tileWorld.width, tileWorld.height),
        );
        if (!waterTarget) return;

        idleScout.state = { kind: 'CarryWaterToTask', task: interactable, stage: 'toWater', waterTarget, amount: 0 };
        return;
      }

      return;
    }

    if (forced.kind === 'tree') {
      const treeTarget = forced.target;
      const idleScout = findNearestIdleScout(treeTarget.x, treeTarget.y, scouts);
      if (!idleScout) return;
      idleScout.state = { kind: 'GoToTarget', target: treeTarget };
      return;
    }

    if (forced.kind === 'water') {
      const waterTarget = forced.target;
      const idleScout = findNearestIdleScout(waterTarget.x, waterTarget.y, scouts);
      if (!idleScout) return;
      idleScout.state = { kind: 'GoToTarget', target: waterTarget };
      return;
    }
  }

  const interactable = findNearestInteractableInRange(leader, interactables, interactableRange);
  if (interactable) {
    // Assign a scout to deliver the required resource to this task (leader-directed).
    const task = tasks ? Object.values(tasks).find((t) => t.sprite === interactable) : null;
    if (!task || task.complete) return;

    const idleScout = findNearestIdleScout(interactable.x, interactable.y, scouts);
    if (!idleScout) return;

    if (task.resource === 'wood') {
      const want = Math.min(2, Math.max(0, task.cost - task.used));
      if (want <= 0) return;

      const amount = reserveResource('wood', want);
      if (amount <= 0) return;

      idleScout.state = { kind: 'CarryWoodToTask', task: interactable, amount, stage: 'toPile' };
      return;
    }

    if (task.resource === 'water') {
      // Enforce river gathering: go to river first, then deliver to the tank.
      const waterTarget = tileWorld.findNearestWaterTarget(
        interactable.x,
        interactable.y,
        Math.max(waterRange, tileWorld.width, tileWorld.height),
      );
      if (!waterTarget) return;

      idleScout.state = { kind: 'CarryWaterToTask', task: interactable, stage: 'toWater', waterTarget, amount: 0 };
      return;
    }

    return;
  }

  const treeTarget = tileWorld.findNearestTreeTarget(leader.x, leader.y, treeRange);
  if (treeTarget) {
    const idleScout = findNearestIdleScout(treeTarget.x, treeTarget.y, scouts);
    if (!idleScout) return;

    idleScout.state = { kind: 'GoToTarget', target: treeTarget };
    return;
  }

  const waterTarget = tileWorld.findNearestWaterTarget(leader.x, leader.y, waterRange);
  if (!waterTarget) return;

  const idleScout = findNearestIdleScout(waterTarget.x, waterTarget.y, scouts);
  if (!idleScout) return;

  idleScout.state = { kind: 'GoToTarget', target: waterTarget };
}
