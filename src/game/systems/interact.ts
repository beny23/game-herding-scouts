import Phaser from 'phaser';
import type { Scout } from '../Scout';
import { findNearbyScout, findNearestIdleScout, findNearestInteractableInRange } from './queries';

type HandleInteractParams = {
  leader: Phaser.Physics.Arcade.Sprite;
  scouts: Scout[];
  interactables: Phaser.GameObjects.Group;
  scoutToggleRange: number;
  interactableRange: number;
};

export function handleInteract(params: HandleInteractParams) {
  const { leader, scouts, interactables, scoutToggleRange, interactableRange } = params;

  const nearbyScout = findNearbyScout(leader, scouts, scoutToggleRange);
  if (nearbyScout) {
    nearbyScout.state = nearbyScout.state.kind === 'Follow' ? { kind: 'Idle' } : { kind: 'Follow' };
    return;
  }

  const interactable = findNearestInteractableInRange(leader, interactables, interactableRange);
  if (!interactable) return;

  const idleScout = findNearestIdleScout(interactable.x, interactable.y, scouts);
  if (!idleScout) return;

  idleScout.state = { kind: 'GoToTarget', target: interactable };
}
