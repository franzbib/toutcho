import Phaser from 'phaser';
import { createGameConfig } from './createGameConfig';

let game: Phaser.Game | null = null;

export function mountGame(): Phaser.Game {
  if (game) {
    return game;
  }

  game = new Phaser.Game(createGameConfig());
  return game;
}

