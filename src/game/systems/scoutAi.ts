import Phaser from 'phaser';
import type { Scout } from '../Scout';
import type { BuildTask, InteractableKind, ResourceKind, Target, TaskId, TileTarget } from '../types';
import type { TilemapWorld } from '../world/tilemapWorld';

type UpdateScoutParams = {
  scout: Scout;
  leader: Phaser.Physics.Arcade.Sprite;
  tasks: Record<TaskId, BuildTask> | null;
  tileWorld: TilemapWorld;
  woodPile: { x: number; y: number };
  resources: Record<
    ResourceKind,
    {
      get: () => number;
      add: (amount: number) => void;
      spend: (amount: number) => number;
    }
  >;
  time: number;
  delta: number;
  workEmitter: Phaser.GameObjects.Particles.ParticleEmitter;
};

export function updateScoutAI(params: UpdateScoutParams) {
  const { scout, leader, tasks, tileWorld, woodPile, resources, time, delta, workEmitter } = params;
  const speed = 200;
  const arriveDist = 30;

  const followPathTo = (destX: number, destY: number) => {
    const distToDest = Phaser.Math.Distance.Between(scout.sprite.x, scout.sprite.y, destX, destY);
    if (distToDest <= arriveDist) {
      scout.sprite.setVelocity(0, 0);
      scout.nav = null;
      return { arrived: true };
    }

    const needRepath =
      !scout.nav ||
      Math.abs(scout.nav.destX - destX) > 2 ||
      Math.abs(scout.nav.destY - destY) > 2 ||
      time >= scout.nav.recomputeAtMs ||
      scout.nav.index >= scout.nav.path.length;

    if (needRepath) {
      const path = tileWorld.findPath(scout.sprite.x, scout.sprite.y, destX, destY) ?? [];
      scout.nav = {
        destX,
        destY,
        path,
        index: 0,
        recomputeAtMs: time + 650,
      };
    }

    const nav = scout.nav!;
    const next = nav.path[nav.index] ?? { x: destX, y: destY };
    const d = Phaser.Math.Distance.Between(scout.sprite.x, scout.sprite.y, next.x, next.y);
    if (d < 10 && nav.index < nav.path.length - 1) {
      nav.index++;
    }

    const v = new Phaser.Math.Vector2(next.x - scout.sprite.x, next.y - scout.sprite.y).normalize().scale(speed);
    scout.sprite.setVelocity(v.x, v.y);
    return { arrived: false };
  };

  const getTargetXY = (target: Target): { x: number; y: number } => {
    const t: any = target as any;
    return { x: typeof t.x === 'number' ? t.x : leader.x, y: typeof t.y === 'number' ? t.y : leader.y };
  };

  const getInteractableKind = (target: Target): InteractableKind | 'tree' | 'water' | undefined => {
    if ((target as any).kind === 'tree') return 'tree';
    if ((target as any).kind === 'water') return 'water';
    const t: any = target as any;
    return t?.data?.get?.('kind');
  };

  switch (scout.state.kind) {
    case 'Idle': {
      scout.sprite.setVelocity(0, 0);
      return;
    }
    case 'Follow': {
      const desiredDist = 70;
      const d = Phaser.Math.Distance.Between(scout.sprite.x, scout.sprite.y, leader.x, leader.y);
      if (d > desiredDist) {
        followPathTo(leader.x, leader.y);
      } else {
        scout.sprite.setVelocity(0, 0);
      }
      return;
    }
    case 'Regroup': {
      const desiredDist = 70;
      const d = Phaser.Math.Distance.Between(scout.sprite.x, scout.sprite.y, leader.x, leader.y);
      if (d <= desiredDist) {
        scout.state = { kind: 'Idle' };
        scout.sprite.setVelocity(0, 0);
        scout.nav = null;
        return;
      }

      followPathTo(leader.x, leader.y);
      return;
    }
    case 'GoToTarget': {
      const target = scout.state.target;
      const { x: tx, y: ty } = getTargetXY(target);

      const { arrived } = followPathTo(tx, ty);
      if (arrived) {
        const kind = getInteractableKind(target);
        if (kind === 'tree') {
          scout.state = { kind: 'ChopTree', target: target as TileTarget, untilMs: time + 1200 };
        } else if (kind === 'water') {
          scout.state = { kind: 'FetchWater', target: target as TileTarget, untilMs: time + 900 };
        } else {
          scout.state = { kind: 'BuildHut', target: target as Phaser.GameObjects.GameObject };
        }
        scout.sprite.setVelocity(0, 0);
        return;
      }
      return;
    }
    case 'ChopTree': {
      scout.sprite.setVelocity(0, 0);

      if (time < scout.state.untilMs) {
        if (Phaser.Math.Between(0, 2) === 0) {
          const ox = Phaser.Math.Between(-10, 10);
          const oy = Phaser.Math.Between(-10, 10);
          workEmitter.emitParticleAt(scout.state.target.sourceX + ox, scout.state.target.sourceY + oy, 1);
        }
        return;
      }

      const yieldWood = tileWorld.chopTreeAt(scout.state.target.tx, scout.state.target.ty);
      scout.state = { kind: 'CarryWoodToPile', amount: yieldWood };
      return;
    }
    case 'FetchWater': {
      scout.sprite.setVelocity(0, 0);

      if (time < scout.state.untilMs) {
        if (Phaser.Math.Between(0, 3) === 0) {
          const ox = Phaser.Math.Between(-10, 10);
          const oy = Phaser.Math.Between(-10, 10);
          workEmitter.emitParticleAt(scout.state.target.sourceX + ox, scout.state.target.sourceY + oy, 1);
        }
        return;
      }

      resources.water.add(tileWorld.waterYieldPerFetch);
      scout.state = { kind: 'Idle' };
      return;
    }

    case 'CarryWoodToPile': {
      if (scout.state.amount <= 0) {
        scout.state = { kind: 'Idle' };
        scout.sprite.setVelocity(0, 0);
        return;
      }

      const { arrived } = followPathTo(woodPile.x, woodPile.y);
      if (arrived) {
        resources.wood.add(scout.state.amount);
        scout.state = { kind: 'Idle' };
        scout.sprite.setVelocity(0, 0);
        return;
      }
      return;
    }

    case 'CarryWoodToTask': {
      if (!tasks) {
        scout.state = { kind: 'Idle' };
        scout.sprite.setVelocity(0, 0);
        return;
      }

      const taskSprite = scout.state.task as any;
      const buildTask = Object.values(tasks).find((t) => t.sprite === taskSprite);
      if (!buildTask || buildTask.complete) {
        // If task disappeared/completed, just drop the assignment (wood was already reserved by caller).
        scout.state = { kind: 'Idle' };
        scout.sprite.setVelocity(0, 0);
        return;
      }

      const targetPos = scout.state.stage === 'toPile' ? woodPile : { x: taskSprite.x, y: taskSprite.y };
      const { arrived } = followPathTo(targetPos.x, targetPos.y);
      if (arrived) {
        if (scout.state.stage === 'toPile') {
          scout.state = { ...scout.state, stage: 'toTask' };
          scout.sprite.setVelocity(0, 0);
          return;
        }

        const deliver = Math.min(scout.state.amount, Math.max(0, buildTask.cost - buildTask.used));
        if (deliver > 0) {
          buildTask.used = Phaser.Math.Clamp(buildTask.used + deliver, 0, buildTask.cost);
        }

        if (Phaser.Math.Between(0, 1) === 0) {
          workEmitter.emitParticleAt(taskSprite.x + Phaser.Math.Between(-8, 8), taskSprite.y + Phaser.Math.Between(-8, 8), 1);
        }

        // Start building at the site once materials are delivered.
        scout.state = { kind: 'BuildHut', target: taskSprite };
        scout.sprite.setVelocity(0, 0);
        return;
      }

      return;
    }

    case 'CarryWaterToTask': {
      if (!tasks) {
        scout.state = { kind: 'Idle' };
        scout.sprite.setVelocity(0, 0);
        return;
      }

      const taskSprite = scout.state.task as any;
      const buildTask = Object.values(tasks).find((t) => t.sprite === taskSprite);
      if (!buildTask || buildTask.complete) {
        scout.state = { kind: 'Idle' };
        scout.sprite.setVelocity(0, 0);
        return;
      }

      const targetPos =
        scout.state.stage === 'toWater'
          ? { x: scout.state.waterTarget.x, y: scout.state.waterTarget.y }
          : { x: taskSprite.x, y: taskSprite.y };

      const { arrived } = followPathTo(targetPos.x, targetPos.y);
      if (arrived) {
        if (scout.state.stage === 'toWater') {
          scout.state = { ...scout.state, stage: 'toTask', amount: tileWorld.waterYieldPerFetch };
          scout.sprite.setVelocity(0, 0);
          return;
        }

        const deliver = Math.min(scout.state.amount, Math.max(0, buildTask.cost - buildTask.used));
        if (deliver > 0) {
          buildTask.used = Phaser.Math.Clamp(buildTask.used + deliver, 0, buildTask.cost);
        }

        if (Phaser.Math.Between(0, 1) === 0) {
          workEmitter.emitParticleAt(taskSprite.x + Phaser.Math.Between(-8, 8), taskSprite.y + Phaser.Math.Between(-8, 8), 1);
        }

        scout.state = { kind: 'BuildHut', target: taskSprite };
        scout.sprite.setVelocity(0, 0);
        return;
      }

      return;
    }
    case 'BuildHut': {
      scout.sprite.setVelocity(0, 0);

      const target = scout.state.target as any;
      const kind: InteractableKind | undefined = target?.data?.get?.('kind');
      if (kind !== 'hut' || !tasks) {
        scout.state = { kind: 'Idle' };
        return;
      }

      const buildTask = Object.values(tasks).find((t) => t.sprite === target);
      if (!buildTask || buildTask.complete) {
        scout.state = { kind: 'Idle' };
        return;
      }

      // Delivery alone isn't enough: you still need time-on-task to build/fill.
      // Build progress is capped by delivered materials.
      const maxByDelivery = Phaser.Math.Clamp(buildTask.used / Math.max(1e-6, buildTask.cost), 0, 1);
      if (maxByDelivery <= buildTask.progress01 + 1e-6) {
        // No materials available for further progress.
        scout.state = { kind: 'Idle' };
        return;
      }

      const ratePerSecond = buildTask.resource === 'water' ? 0.22 : 0.18;
      buildTask.progress01 = Phaser.Math.Clamp(buildTask.progress01 + ratePerSecond * (delta / 1000), 0, maxByDelivery);
      if (buildTask.progress01 >= 1) buildTask.complete = true;

      if (Phaser.Math.Between(0, 2) === 0) {
        const ox = Phaser.Math.Between(-10, 10);
        const oy = Phaser.Math.Between(-10, 10);
        workEmitter.emitParticleAt((target as any).x + ox, (target as any).y + oy, 1);
      }

      return;
    }
  }
}
