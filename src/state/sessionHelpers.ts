import type Phaser from 'phaser';
import { getSaveStore } from '../systems/save/saveStore';
import type { SaveData } from '../systems/save/saveTypes';
import { getSession, updateSession } from './gameSession';

export function persistSaveData(scene: Phaser.Scene, saveData: SaveData): SaveData {
  getSaveStore(scene).save(saveData);
  updateSession(scene, saveData);
  return saveData;
}

export function getSaveData(scene: Phaser.Scene): SaveData {
  return getSession(scene).saveData;
}

export function getReducedMotion(scene: Phaser.Scene): boolean {
  return getSaveData(scene).settings.reducedMotion;
}
