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
  private woodChipEmitter!: Phaser.GameObjects.Particles.ParticleEmitter;
  private waterDropEmitter!: Phaser.GameObjects.Particles.ParticleEmitter;
  private buildProgressGfx!: Phaser.GameObjects.Graphics;

  private waterAnimMs = 0;
  private waterFrame = 0;

  private decorProps!: Phaser.GameObjects.Group;

  private worldTint!: Phaser.GameObjects.Rectangle;
  private vignetteGfx!: Phaser.GameObjects.Graphics;
  private campfireLightGfx!: Phaser.GameObjects.Graphics;

  private lastWoodStockpile = 0;
  private lastWaterStockpile = 0;

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

    this.decorProps = this.add.group();
    this.spawnDecorProps();

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

    this.woodChipEmitter = this.add.particles(0, 0, 'chip', {
      lifespan: { min: 260, max: 520 },
      speed: { min: 18, max: 70 },
      gravityY: 40,
      rotate: { min: -120, max: 120 },
      scale: { start: 0.9, end: 0 },
      alpha: { start: 0.9, end: 0 },
      quantity: 0,
    });
    this.woodChipEmitter.setDepth(51);

    this.waterDropEmitter = this.add.particles(0, 0, 'droplet', {
      lifespan: { min: 260, max: 520 },
      speed: { min: 14, max: 54 },
      gravityY: 60,
      rotate: { min: -80, max: 80 },
      scale: { start: 0.9, end: 0 },
      alpha: { start: 0.8, end: 0 },
      quantity: 0,
      blendMode: 'ADD',
    });
    this.waterDropEmitter.setDepth(51);

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
    // Mixed scout variants for readability.
    for (let i = 0; i < this.scouts.length; i++) {
      const key = i % 3 === 0 ? 'scout_a' : i % 3 === 1 ? 'scout_b' : 'scout_c';
      this.scouts[i]!.sprite.setTexture(key);
    }

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

    // Lighting pass (drawn above the world, below HUD).
    this.worldTint = this.add.rectangle(0, 0, this.scale.width, this.scale.height, 0x0b1220, 0.12).setOrigin(0, 0);
    this.worldTint.setScrollFactor(0);
    this.worldTint.setDepth(200);

    this.campfireLightGfx = this.add.graphics();
    this.campfireLightGfx.setDepth(210);
    this.campfireLightGfx.setBlendMode(Phaser.BlendModes.ADD);

    this.vignetteGfx = this.add.graphics();
    this.vignetteGfx.setScrollFactor(0);
    this.vignetteGfx.setDepth(220);
    this.redrawVignette();

    this.scale.on('resize', () => {
      this.worldTint.setSize(this.scale.width, this.scale.height);
      this.redrawVignette();
    });

    this.lastWoodStockpile = this.woodStockpile;
    this.lastWaterStockpile = this.waterStockpile;
  }

  update(time: number, delta: number) {
    this.updateWaterAnimation(delta);
    this.updateLighting(time);

    updateLeaderMovement({ leader: this.leader, cursors: this.cursors, keys: this.keys, speed: 260 * (this.tileWorld.tileSize / 32) });

    const body = this.leader.body as Phaser.Physics.Arcade.Body;
    if (body && (Math.abs(body.velocity.x) > 1 || Math.abs(body.velocity.y) > 1)) {
      this.leaderFacing.set(body.velocity.x, body.velocity.y).normalize();
      // Rotate leader so the facing cue points along motion.
      this.leader.setRotation(Math.atan2(body.velocity.y, body.velocity.x));
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
        woodChipEmitter: this.woodChipEmitter,
        waterDropEmitter: this.waterDropEmitter,
      });

      const sb = scout.sprite.body as Phaser.Physics.Arcade.Body;
      if (sb && (Math.abs(sb.velocity.x) > 1 || Math.abs(sb.velocity.y) > 1)) {
        scout.sprite.setRotation(Math.atan2(sb.velocity.y, sb.velocity.x));
      }
      updateBobbing(scout.sprite, time);
      updateShadow(scout.sprite, 11);
      updateDepth(scout.sprite);
    }

    this.updateCampfireBurn(delta);

    this.updateStockpileFeedback();

    this.updateProgressVisuals();

    updateChecklistText(this.hud, this.tasks, this.woodStockpile, this.waterStockpile);
    this.updatePromptAndHighlight();
    updateHudPanels(this.hud);
    updateBuildProgressRings(this.buildProgressGfx, this.tasks);
  }

  private redrawVignette() {
    this.vignetteGfx.clear();
    const w = this.scale.width;
    const h = this.scale.height;

    // Simple stepped vignette (no shaders): draw edge bands with increasing alpha.
    const steps = 5;
    for (let i = 0; i < steps; i++) {
      const t = (i + 1) / steps;
      const pad = Math.floor(t * 36);
      const a = 0.02 + t * 0.055;
      this.vignetteGfx.fillStyle(0x000000, a);
      // top
      this.vignetteGfx.fillRect(0, 0, w, pad);
      // bottom
      this.vignetteGfx.fillRect(0, h - pad, w, pad);
      // left
      this.vignetteGfx.fillRect(0, 0, pad, h);
      // right
      this.vignetteGfx.fillRect(w - pad, 0, pad, h);
    }
  }

  private updateLighting(timeMs: number) {
    // Slow day/night pulse (subtle).
    const dayLenMs = 120_000;
    const t01 = ((timeMs % dayLenMs) / dayLenMs) * Math.PI * 2;
    const night01 = 0.5 + 0.5 * Math.sin(t01);

    const alpha = 0.06 + night01 * 0.18;
    this.worldTint.setFillStyle(0x0b1220, alpha);

    // Campfire light (only when built + lit).
    this.campfireLightGfx.clear();
    if (this.tasks?.campfire?.complete && this.campfireLit) {
      const x = this.tasks.campfire.sprite.x;
      const y = this.tasks.campfire.sprite.y;
      // Layered circles to approximate a radial glow.
      const rings = [
        { r: 150, a: 0.03, c: 0xf97316 },
        { r: 110, a: 0.05, c: 0xfbbf24 },
        { r: 70, a: 0.08, c: 0xf97316 },
        { r: 40, a: 0.12, c: 0xfbbf24 },
      ];
      for (const rr of rings) {
        this.campfireLightGfx.fillStyle(rr.c, rr.a);
        this.campfireLightGfx.fillCircle(x, y, rr.r);
      }
    }
  }

  private updateWaterAnimation(delta: number) {
    this.waterAnimMs += delta;
    const frameMs = 320;
    if (this.waterAnimMs < frameMs) return;
    this.waterAnimMs %= frameMs;

    this.waterFrame = (this.waterFrame + 1) % this.tileWorld.waterFrames.length;
    const idx = this.tileWorld.waterFrames[this.waterFrame] ?? this.tileWorld.waterFrames[0]!;
    for (const p of this.tileWorld.waterTiles) {
      this.tileWorld.layer.putTileAt(idx, p.tx, p.ty);
    }
  }

  private spawnDecorProps() {
    const seed = this.tileWorld.seed;
    const hash2Seeded = (x: number, y: number) => {
      const s = Math.sin(x * 127.1 + y * 311.7 + seed * 0.001) * 43758.5453123;
      return s - Math.floor(s);
    };

    const cx = this.tileWorld.clearingCenter.x;
    const cy = this.tileWorld.clearingCenter.y;

    for (let ty = 0; ty < this.tileWorld.rows; ty++) {
      for (let tx = 0; tx < this.tileWorld.cols; tx++) {
        if (!this.tileWorld.isWalkable(tx, ty)) continue;
        const tile = this.tileWorld.layer.getTileAt(tx, ty);
        if (!tile) continue;
        if (this.tileWorld.isPathTileIndex(tile.index)) continue;
        if (this.tileWorld.isWaterTileIndex(tile.index)) continue;

        const p = this.tileWorld.tileToWorldCenter(tx, ty);

        // Keep the camp clearing a bit cleaner.
        if (Phaser.Math.Distance.Between(p.x, p.y, cx, cy) < 140) continue;

        const r = hash2Seeded(tx + 7000, ty + 9000);
        if (r > 0.075) continue;

        const kind = hash2Seeded(tx + 123, ty + 456);
        const key = kind < 0.6 ? 'prop_grass' : kind < 0.82 ? 'prop_pebble' : 'prop_flower';
        const ox = (hash2Seeded(tx + 77, ty + 88) - 0.5) * 14;
        const oy = (hash2Seeded(tx + 99, ty + 11) - 0.5) * 14;
        const img = this.add.image(p.x + ox, p.y + oy, key);
        img.setAlpha(0.92);
        img.setDepth(p.y - 1);
        this.decorProps.add(img);
      }
    }
  }

  private updateStockpileFeedback() {
    const pop = (obj?: Phaser.GameObjects.GameObject & { setScale: (s: number) => any }) => {
      if (!obj) return;
      // Reset any prior scale tween effect.
      (obj as any).setScale(1);
      this.tweens.add({
        targets: obj as any,
        scale: { from: 1.0, to: 1.08 },
        duration: 90,
        yoyo: true,
        ease: 'Sine.easeOut',
      });
    };

    if (this.woodStockpile > this.lastWoodStockpile) pop(this.woodPileSprite as any);
    if (this.waterStockpile > this.lastWaterStockpile) pop(this.tasks?.waterTank?.sprite as any);

    this.lastWoodStockpile = this.woodStockpile;
    this.lastWaterStockpile = this.waterStockpile;
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
