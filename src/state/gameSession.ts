import type Phaser from 'phaser';
import type { SaveData } from '../systems/save/saveTypes';

export const SESSION_REGISTRY_KEY = 'game-session';

export type GameSession = {
  saveData: SaveData;
};

export function createGameSession(saveData: SaveData): GameSession {
  return { saveData };
}

export function setSession(scene: Phaser.Scene, session: GameSession): void {
  scene.registry.set(SESSION_REGISTRY_KEY, session);
}

export function getSession(scene: Phaser.Scene): GameSession {
  const session = scene.registry.get(SESSION_REGISTRY_KEY) as GameSession | undefined;

  if (!session) {
    throw new Error('Game session is not available in the scene registry.');
  }

  return session;
}

export function updateSession(scene: Phaser.Scene, saveData: SaveData): GameSession {
  const nextSession = createGameSession(saveData);
  setSession(scene, nextSession);
  return nextSession;
}

