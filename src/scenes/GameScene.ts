import Phaser from 'phaser';

import { Scout } from '../game/Scout';
import type { BuildTask, TaskId } from '../game/types';
import { createHud, updateChecklistText, updateHudPanels, updatePromptText, type Hud } from '../game/ui/hud';
import { handleInteract } from '../game/systems/interact';
import { findNearbyScout, findNearestInteractableInRange } from '../game/systems/queries';
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
import { createGroundLayer } from '../game/world/groundLayer';

export class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
  }

  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private keys!: GameKeys;

  private leader!: Phaser.Physics.Arcade.Sprite;
  private scouts: Scout[] = [];

  private interactables!: Phaser.GameObjects.Group;
  private obstacles!: Phaser.Physics.Arcade.StaticGroup;

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

    const world = {
      width: 1600,
      height: 1000,
    };

    this.cameras.main.setBounds(0, 0, world.width, world.height);
    this.physics.world.setBounds(0, 0, world.width, world.height);

    createGroundLayer({ scene: this, world, spawn: { x: 260, y: 260 }, clearing: { x: 880, y: 560, radius: 220 } });

    this.obstacles = this.physics.add.staticGroup();
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

    const worldResult = createWorldLayout({ scene: this, world, obstacles: this.obstacles, interactables: this.interactables });
    this.tasks = worldResult.tasks;

    this.leader = this.physics.add.sprite(260, 260, 'leader');
    this.leader.setCollideWorldBounds(true);
    this.leader.setDamping(true);
    this.leader.setDrag(900, 900);
    this.leader.setMaxVelocity(260, 260);

    attachShadow(this, this.leader, 12);
    enableBobbing(this.leader);

    this.physics.add.collider(this.leader, this.obstacles);

    this.scouts = spawnScouts({ scene: this });

    for (const scout of this.scouts) {
      this.physics.add.collider(scout.sprite, this.obstacles);
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

    this.highlightRing = createHighlightRing(this);

    this.hud = createHud(this);
    updateChecklistText(this.hud, this.tasks);
    updatePromptText(this.hud, '');
    updateHudPanels(this.hud);

    this.keys.E.on('down', () => {
      handleInteract({
        leader: this.leader,
        scouts: this.scouts,
        interactables: this.interactables,
        scoutToggleRange: 48,
        interactableRange: 72,
      });
    });
  }

  update(time: number, delta: number) {
    updateLeaderMovement({ leader: this.leader, cursors: this.cursors, keys: this.keys, speed: 260 });

    updateBobbing(this.leader, time);
    updateShadow(this.leader, 12);
    updateDepth(this.leader);

    for (const scout of this.scouts) {
      updateScoutAI({
        scout,
        leader: this.leader,
        tasks: this.tasks,
        time,
        delta,
        workEmitter: this.workEmitter,
      });
      updateBobbing(scout.sprite, time);
      updateShadow(scout.sprite, 11);
      updateDepth(scout.sprite);
    }

    updateChecklistText(this.hud, this.tasks);
    this.updatePromptAndHighlight();
    updateHudPanels(this.hud);
    updateBuildProgressRings(this.buildProgressGfx, this.tasks);
  }

  private updatePromptAndHighlight() {
    const nearbyScout = findNearbyScout(this.leader, this.scouts, 48);
    if (nearbyScout) {
      setHighlightTarget(this.highlightRing, nearbyScout.sprite);
      const next = nearbyScout.state.kind === 'Follow' ? 'Set scout to Idle' : 'Set scout to Follow';
      updatePromptText(this.hud, `E: ${next}`);
      return;
    }

    const interactable = findNearestInteractableInRange(this.leader, this.interactables, 72);
    if (interactable) {
      setHighlightTarget(this.highlightRing, interactable);
      const label = String(interactable.data?.get('label') ?? 'Target');
      const idleCount = this.scouts.filter((s) => s.isIdle()).length;
      if (idleCount === 0) {
        updatePromptText(this.hud, 'E: No idle scouts available');
      } else {
        updatePromptText(this.hud, `E: Assign nearest idle scout → ${label}`);
      }
      return;
    }

    setHighlightTarget(this.highlightRing, null);
    updatePromptText(this.hud, '');
  }

}
