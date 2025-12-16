import Phaser from 'phaser';

import { Scout } from '../game/Scout';
import type { BuildTask, TaskId } from '../game/types';
import { createHud, updateChecklistText, updateHudPanels, updatePromptText, type Hud } from '../game/ui/hud';
import { handleInteract } from '../game/systems/interact';
// (No query helpers needed here; we do cone-based selection locally.)
import { updateScoutAI } from '../game/systems/scoutAi';
import { createProceduralTextures } from '../game/visuals/textures';
import { enableBobbing, updateBobbing } from '../game/visuals/bobbing';
import { attachShadow, updateDepth, updateShadow } from '../game/visuals/shadows';
import { createHighlightRing, setHighlightTarget } from '../game/visuals/highlightRing';
import { updateBuildProgressRings } from '../game/visuals/buildProgress';
import { createWorldLayout } from '../game/world/worldLayout';
import { spawnScouts } from '../game/world/spawnScouts';
import { updateLeaderMovement } from '../game/systems/leaderMovement';
import { createControls, type GameKeys } from '../game/input/controls';
import { createTilemapWorld, type TilemapWorld } from '../game/world/tilemapWorld';

export class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
  }

  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private keys!: GameKeys;

  private leader!: Phaser.Physics.Arcade.Sprite;
  private scouts: Scout[] = [];

  private leaderFacing = new Phaser.Math.Vector2(1, 0);

  private interactables!: Phaser.GameObjects.Group;

  private tileWorld!: TilemapWorld;
  private woodStockpile = 0;
  private waterStockpile = 0;
  private woodPile = { x: 0, y: 0 };
  private woodPileSprite!: Phaser.GameObjects.Image;

  private campfireLit = false;
  private campfireBurnMs = 0;

  private tasks: Record<TaskId, BuildTask> | null = null;

  private hud!: Hud;

  private highlightRing!: Phaser.GameObjects.Image;
  private workEmitter!: Phaser.GameObjects.Particles.ParticleEmitter;
  private buildProgressGfx!: Phaser.GameObjects.Graphics;

  create() {
    createProceduralTextures(this);

    const controls = createControls(this);
    this.cursors = controls.cursors;
    this.keys = controls.keys;

    this.tileWorld = createTilemapWorld({ scene: this });
    const worldScale = this.tileWorld.tileSize / 32;

    const world = { width: this.tileWorld.width, height: this.tileWorld.height };
    this.cameras.main.setBounds(0, 0, world.width, world.height);
    this.physics.world.setBounds(0, 0, world.width, world.height);

    this.interactables = this.add.group();

    this.workEmitter = this.add.particles(0, 0, 'spark', {
      lifespan: { min: 300, max: 550 },
      speed: { min: 14, max: 52 },
      gravityY: -18,
      scale: { start: 0.9, end: 0 },
      alpha: { start: 0.9, end: 0 },
      quantity: 0,
      blendMode: 'ADD',
    });
    this.workEmitter.setDepth(50);

    this.buildProgressGfx = this.add.graphics();
    this.buildProgressGfx.setDepth(60);

    const worldResult = createWorldLayout({ scene: this, world, interactables: this.interactables, tileWorld: this.tileWorld });
    this.tasks = worldResult.tasks;
    this.woodPile = worldResult.woodPile;
    this.woodPileSprite = worldResult.woodPileSprite;

    this.leader = this.physics.add.sprite(this.tileWorld.leaderSpawn.x, this.tileWorld.leaderSpawn.y, 'leader');
    this.leader.setCollideWorldBounds(true);
    this.leader.setDamping(true);
    this.leader.setDrag(900, 900);
    this.leader.setMaxVelocity(260 * worldScale, 260 * worldScale);

    attachShadow(this, this.leader, 12);
    enableBobbing(this.leader);

    this.physics.add.collider(this.leader, this.tileWorld.layer);

    this.scouts = spawnScouts({ scene: this, positions: this.tileWorld.scoutSpawns });

    for (const scout of this.scouts) {
      scout.sprite.setMaxVelocity(220 * worldScale, 220 * worldScale);
      this.physics.add.collider(scout.sprite, this.tileWorld.layer);
      this.physics.add.collider(scout.sprite, this.leader);

      attachShadow(this, scout.sprite, 11);
      enableBobbing(scout.sprite);
    }

    // Prevent scouts from stacking on top of each other.
    for (let i = 0; i < this.scouts.length; i++) {
      for (let j = i + 1; j < this.scouts.length; j++) {
        this.physics.add.collider(this.scouts[i]!.sprite, this.scouts[j]!.sprite);
      }
    }

    this.cameras.main.startFollow(this.leader, true, 0.12, 0.12);
    this.cameras.main.roundPixels = true;

    this.highlightRing = createHighlightRing(this);

    this.hud = createHud(this);
    updateChecklistText(this.hud, this.tasks, this.woodStockpile, this.waterStockpile);
    updatePromptText(this.hud, '');
    updateHudPanels(this.hud);

    // Whistle: cancel current jobs and regroup all scouts.
    this.keys.Q.on('down', () => {
      for (const scout of this.scouts) {
        // Refund reserved wood deliveries if a scout was assigned to deliver.
        if (scout.state.kind === 'CarryWoodToTask') {
          this.woodStockpile += Math.max(0, scout.state.amount);
        }
        // If a scout had harvested wood but not deposited yet, just credit it back to the pile.
        if (scout.state.kind === 'CarryWoodToPile') {
          this.woodStockpile += Math.max(0, scout.state.amount);
        }

        scout.state = { kind: 'Regroup' };
        scout.nav = null;
      }
    });

    this.keys.E.on('down', () => {
      const forced = this.getFacingTarget();
      if (!forced) return;
      handleInteract({
        leader: this.leader,
        scouts: this.scouts,
        interactables: this.interactables,
        tileWorld: this.tileWorld,
        tasks: this.tasks,
        woodPile: this.woodPile,
        reserveResource: (resource, want) => {
          const amount = Math.max(0, want);
          if (resource === 'wood') {
            const taken = Math.min(this.woodStockpile, amount);
            this.woodStockpile -= taken;
            return taken;
          }
          const taken = Math.min(this.waterStockpile, amount);
          this.waterStockpile -= taken;
          return taken;
        },
        interactableRange: 72 * worldScale,
        treeRange: 120 * worldScale,
        waterRange: 150 * worldScale,
        forced,
      });
    });
  }

  update(time: number, delta: number) {
    updateLeaderMovement({ leader: this.leader, cursors: this.cursors, keys: this.keys, speed: 260 * (this.tileWorld.tileSize / 32) });

    const body = this.leader.body as Phaser.Physics.Arcade.Body;
    if (body && (Math.abs(body.velocity.x) > 1 || Math.abs(body.velocity.y) > 1)) {
      this.leaderFacing.set(body.velocity.x, body.velocity.y).normalize();
    }

    updateBobbing(this.leader, time);
    updateShadow(this.leader, 12);
    updateDepth(this.leader);

    for (const scout of this.scouts) {
      updateScoutAI({
        scout,
        leader: this.leader,
        tasks: this.tasks,
        tileWorld: this.tileWorld,
        woodPile: this.woodPile,
        resources: {
          wood: {
            get: () => this.woodStockpile,
            add: (amount) => {
              this.woodStockpile = Math.max(0, this.woodStockpile + amount);
            },
            spend: (amount) => {
              const want = Math.max(0, amount);
              const spent = Math.min(this.woodStockpile, want);
              this.woodStockpile -= spent;
              return spent;
            },
          },
          water: {
            get: () => this.waterStockpile,
            add: (amount) => {
              this.waterStockpile = Math.max(0, this.waterStockpile + amount);
            },
            spend: (amount) => {
              const want = Math.max(0, amount);
              const spent = Math.min(this.waterStockpile, want);
              this.waterStockpile -= spent;
              return spent;
            },
          },
        },
        time,
        delta,
        workEmitter: this.workEmitter,
      });
      updateBobbing(scout.sprite, time);
      updateShadow(scout.sprite, 11);
      updateDepth(scout.sprite);
    }

    this.updateCampfireBurn(delta);

    this.updateProgressVisuals();

    updateChecklistText(this.hud, this.tasks, this.woodStockpile, this.waterStockpile);
    this.updatePromptAndHighlight();
    updateHudPanels(this.hud);
    updateBuildProgressRings(this.buildProgressGfx, this.tasks);
  }

  private updateProgressVisuals() {
    if (!this.tasks) return;

    const stageFrom01 = (p: number) => {
      if (!Number.isFinite(p)) return 0;
      const t = Phaser.Math.Clamp(p, 0, 1);
      return Math.min(3, Math.floor(t * 4));
    };

    const setIfChanged = (sprite: Phaser.GameObjects.Sprite, key: string) => {
      if (sprite.texture?.key === key) return;
      sprite.setTexture(key);
    };

    const hutAStage = stageFrom01(this.tasks.hutA.progress01);
    const hutBStage = stageFrom01(this.tasks.hutB.progress01);
    const tankStage = stageFrom01(this.tasks.waterTank.progress01);

    setIfChanged(this.tasks.hutA.sprite, `build_tent_s${hutAStage}`);
    setIfChanged(this.tasks.hutB.sprite, `build_flag_s${hutBStage}`);
    setIfChanged(this.tasks.waterTank.sprite, `water_tank_s${tankStage}`);

    const campfireStage = stageFrom01(this.tasks.campfire.progress01);
    if (this.tasks.campfire.complete) {
      setIfChanged(this.tasks.campfire.sprite, this.campfireLit ? 'campfire_lit' : 'campfire_out');
    } else {
      setIfChanged(this.tasks.campfire.sprite, `campfire_s${campfireStage}`);
    }

    // Wood pile fullness is driven by stockpile amount.
    const woodStage = this.woodStockpile <= 0 ? 0 : this.woodStockpile < 5 ? 1 : this.woodStockpile < 10 ? 2 : 3;
    if (this.woodPileSprite && this.woodPileSprite.texture?.key !== `wood_pile_s${woodStage}`) {
      this.woodPileSprite.setTexture(`wood_pile_s${woodStage}`);
    }
  }

  private updateCampfireBurn(delta: number) {
    if (!this.tasks) return;
    const campfire = this.tasks.campfire;
    if (!campfire?.complete) return;

    // The campfire consumes wood slowly to stay lit.
    // If the stockpile runs out, it goes out until more wood is available.
    const burnIntervalMs = 25000;

    if (!this.campfireLit) {
      if (this.woodStockpile > 0) {
        this.woodStockpile = Math.max(0, this.woodStockpile - 1);
        this.campfireLit = true;
        this.campfireBurnMs = 0;
      }
      return;
    }

    this.campfireBurnMs += delta;
    while (this.campfireBurnMs >= burnIntervalMs) {
      this.campfireBurnMs -= burnIntervalMs;
      if (this.woodStockpile > 0) {
        this.woodStockpile = Math.max(0, this.woodStockpile - 1);
      } else {
        this.campfireLit = false;
        this.campfireBurnMs = 0;
        return;
      }
    }
  }

  private inFrontAndClose(targetX: number, targetY: number, maxDist: number, minDot: number) {
    const dx = targetX - this.leader.x;
    const dy = targetY - this.leader.y;
    const dist = Math.hypot(dx, dy);
    if (dist > maxDist) return false;
    if (dist < 1e-6) return true;
    const inv = 1 / dist;
    const dot = (dx * inv) * this.leaderFacing.x + (dy * inv) * this.leaderFacing.y;
    return dot >= minDot;
  }

  private findBestInteractableInCone(maxDist: number, minDot: number): Phaser.Physics.Arcade.Sprite | null {
    const sprites = this.interactables.getChildren() as Phaser.Physics.Arcade.Sprite[];
    let best: Phaser.Physics.Arcade.Sprite | null = null;
    let bestDist = Number.POSITIVE_INFINITY;

    for (const s of sprites) {
      const dx = s.x - this.leader.x;
      const dy = s.y - this.leader.y;
      const dist = Math.hypot(dx, dy);
      if (dist > maxDist) continue;
      const inv = dist < 1e-6 ? 0 : 1 / dist;
      const dot = dist < 1e-6 ? 1 : (dx * inv) * this.leaderFacing.x + (dy * inv) * this.leaderFacing.y;
      if (dot < minDot) continue;
      if (dist < bestDist) {
        bestDist = dist;
        best = s;
      }
    }

    return best;
  }

  private getFacingTarget():
    | { kind: 'interactable'; sprite: Phaser.Physics.Arcade.Sprite }
    | { kind: 'tree'; target: any }
    | { kind: 'water'; target: any }
    | null {
    const maxDist = 52;
    const minDot = 0.65;

    const interactable = this.findBestInteractableInCone(maxDist, minDot);
    if (interactable) return { kind: 'interactable', sprite: interactable };

    const treeTarget = this.tileWorld.findNearestTreeTargetInCone(
      this.leader.x,
      this.leader.y,
      maxDist,
      this.leaderFacing,
      minDot,
    );
    if (treeTarget) return { kind: 'tree', target: treeTarget };

    const waterTarget = this.tileWorld.findNearestWaterTargetInCone(
      this.leader.x,
      this.leader.y,
      maxDist,
      this.leaderFacing,
      minDot,
    );
    if (waterTarget) return { kind: 'water', target: waterTarget };

    return null;
  }

  private updatePromptAndHighlight() {
    const facingTarget = this.getFacingTarget();
    if (facingTarget) {
      const idleCount = this.scouts.filter((s) => s.isIdle()).length;
      if (idleCount === 0) {
        // Still show the ring, but make it clear no one is free.
        if (facingTarget.kind === 'interactable') setHighlightTarget(this.highlightRing, facingTarget.sprite);
        else setHighlightTarget(this.highlightRing, { x: facingTarget.target.sourceX, y: facingTarget.target.sourceY });
        updatePromptText(this.hud, 'E: No idle scouts available');
        return;
      }

      if (facingTarget.kind === 'interactable') {
        setHighlightTarget(this.highlightRing, facingTarget.sprite);
        const label = String(facingTarget.sprite.data?.get('label') ?? 'Target');
        const task = this.tasks ? Object.values(this.tasks).find((t) => t.sprite === facingTarget.sprite) : null;
        if (task?.resource === 'wood') {
          if (this.woodStockpile <= 0) updatePromptText(this.hud, `E: Need wood at the pile → ${label}`);
          else updatePromptText(this.hud, `E: Deliver wood to ${label}`);
        } else if (task?.resource === 'water') {
          updatePromptText(this.hud, `E: Send scout to fetch river water → ${label}`);
        } else {
          updatePromptText(this.hud, `E: Assign nearest idle scout → ${label}`);
        }
        return;
      }

      setHighlightTarget(this.highlightRing, { x: facingTarget.target.sourceX, y: facingTarget.target.sourceY });
      updatePromptText(
        this.hud,
        facingTarget.kind === 'tree'
          ? 'E: Assign nearest idle scout → Chop tree'
          : 'E: Assign nearest idle scout → Fetch water',
      );
      return;
    }

    setHighlightTarget(this.highlightRing, null);
    updatePromptText(this.hud, '');
  }

}
