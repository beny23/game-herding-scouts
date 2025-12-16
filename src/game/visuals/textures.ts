import Phaser from 'phaser';

import { createCharacterTextures } from './textures/characters';
import { createTextureFactory } from './textures/factory';
import { createGroundTextures } from './textures/ground';
import { createObjectTextures } from './textures/objects';
import { createParticleTextures } from './textures/particles';
import { createPropTextures } from './textures/props';
import { createTileset32Textures } from './textures/tileset32';
import { createUiTextures } from './textures/ui';

export function createProceduralTextures(scene: Phaser.Scene) {
  const f = createTextureFactory(scene);

  createGroundTextures(f);
  createUiTextures(f);
  createParticleTextures(f);
  createTileset32Textures(f);
  createCharacterTextures(f);
  createPropTextures(f);
  createObjectTextures(f);
}
