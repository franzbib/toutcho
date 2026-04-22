import { describe, expect, test } from 'vitest';
import { allMissions } from '../content';
import { createDefaultSaveData, createMemoryStorageAdapter, createSaveStore, updateSettings } from '../systems/save/saveStore';

describe('saveStore', () => {
  test('retourne une sauvegarde par défaut', () => {
    const defaultSave = createDefaultSaveData(allMissions);

    expect(defaultSave.currentMissionId).toBe(allMissions[0]?.id);
    expect(defaultSave.unlockedMissionIds).toEqual([allMissions[0]?.id]);
    expect(defaultSave.completedMissionIds).toEqual([]);
  });

  test('persiste les réglages et la progression', () => {
    const storage = createMemoryStorageAdapter();
    const saveStore = createSaveStore(allMissions, storage);
    let saveData = createDefaultSaveData(allMissions);

    saveData = updateSettings(saveData, {
      muted: true,
      reducedMotion: true,
    });
    saveData.completedMissionIds.push('hall-notice');
    saveStore.save(saveData);

    const loadedSave = saveStore.load();

    expect(loadedSave.settings.muted).toBe(true);
    expect(loadedSave.settings.reducedMotion).toBe(true);
    expect(loadedSave.completedMissionIds).toContain('hall-notice');
  });
});
