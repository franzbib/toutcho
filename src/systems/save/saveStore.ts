import type Phaser from 'phaser';
import type { MissionDefinition, MissionOutcome } from '../missions/missionTypes';
import { createEmptyMissionRecord, mergeMissionRecord } from '../missions/missionState';
import type { SaveData } from './saveTypes';

export const SAVE_KEY = 'mission-ispa.save.v1';
export const SAVE_STORE_REGISTRY_KEY = 'save-store';

export type StorageAdapter = {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
};

export type SaveStore = {
  load(): SaveData;
  save(saveData: SaveData): SaveData;
};

function getBrowserStorage(): StorageAdapter | null {
  if (typeof window === 'undefined') {
    return null;
  }

  return window.localStorage;
}

export function createMemoryStorageAdapter(): StorageAdapter {
  const storage = new Map<string, string>();

  return {
    getItem(key) {
      return storage.get(key) ?? null;
    },
    setItem(key, value) {
      storage.set(key, value);
    },
  };
}

export function createDefaultSaveData(missions: MissionDefinition[]): SaveData {
  const firstMissionId = missions[0]?.id ?? null;

  return {
    version: 1,
    introSeen: false,
    currentMissionId: firstMissionId,
    unlockedMissionIds: firstMissionId ? [firstMissionId] : [],
    completedMissionIds: [],
    missionRecords: Object.fromEntries(missions.map((mission) => [mission.id, createEmptyMissionRecord(mission.id)])),
    settings: {
      muted: false,
      reducedMotion: false,
    },
  };
}

export function normalizeSaveData(raw: unknown, missions: MissionDefinition[]): SaveData {
  const defaults = createDefaultSaveData(missions);

  if (!raw || typeof raw !== 'object') {
    return defaults;
  }

  const parsed = raw as Partial<SaveData>;
  const unlockedMissionIds = Array.isArray(parsed.unlockedMissionIds)
    ? parsed.unlockedMissionIds.filter((value): value is string => typeof value === 'string')
    : defaults.unlockedMissionIds;
  const completedMissionIds = Array.isArray(parsed.completedMissionIds)
    ? parsed.completedMissionIds.filter((value): value is string => typeof value === 'string')
    : defaults.completedMissionIds;

  const missionRecords = { ...defaults.missionRecords };

  if (parsed.missionRecords && typeof parsed.missionRecords === 'object') {
    for (const mission of missions) {
      const candidate = (parsed.missionRecords as Record<string, Partial<SaveData['missionRecords'][string]>>)[mission.id];

      if (!candidate) {
        continue;
      }

      missionRecords[mission.id] = {
        missionId: mission.id,
        attempts: typeof candidate.attempts === 'number' ? candidate.attempts : 0,
        completed: Boolean(candidate.completed),
        bestScore: typeof candidate.bestScore === 'number' ? candidate.bestScore : 0,
        bestTimeLeftSeconds: typeof candidate.bestTimeLeftSeconds === 'number' ? candidate.bestTimeLeftSeconds : 0,
        bestLanguageAccuracy: typeof candidate.bestLanguageAccuracy === 'number' ? candidate.bestLanguageAccuracy : 0,
      };
    }
  }

  return {
    version: 1,
    introSeen: Boolean(parsed.introSeen),
    currentMissionId:
      typeof parsed.currentMissionId === 'string' && missionRecords[parsed.currentMissionId]
        ? parsed.currentMissionId
        : defaults.currentMissionId,
    unlockedMissionIds: Array.from(new Set([...defaults.unlockedMissionIds, ...unlockedMissionIds])),
    completedMissionIds: Array.from(new Set(completedMissionIds)),
    missionRecords,
    settings: {
      muted: Boolean(parsed.settings?.muted),
      reducedMotion: Boolean(parsed.settings?.reducedMotion),
    },
  };
}

export function createSaveStore(
  missions: MissionDefinition[],
  storage: StorageAdapter | null = getBrowserStorage(),
): SaveStore {
  return {
    load() {
      if (!storage) {
        return createDefaultSaveData(missions);
      }

      const raw = storage.getItem(SAVE_KEY);

      if (!raw) {
        return createDefaultSaveData(missions);
      }

      try {
        return normalizeSaveData(JSON.parse(raw), missions);
      } catch {
        return createDefaultSaveData(missions);
      }
    },
    save(saveData) {
      if (storage) {
        storage.setItem(SAVE_KEY, JSON.stringify(saveData));
      }

      return saveData;
    },
  };
}

export function markIntroSeen(saveData: SaveData): SaveData {
  return {
    ...saveData,
    introSeen: true,
  };
}

export function updateSettings(
  saveData: SaveData,
  partialSettings: Partial<SaveData['settings']>,
): SaveData {
  return {
    ...saveData,
    settings: {
      ...saveData.settings,
      ...partialSettings,
    },
  };
}

export function startMission(saveData: SaveData, missionId: string): SaveData {
  return {
    ...saveData,
    currentMissionId: missionId,
  };
}

export function recordMissionOutcome(
  saveData: SaveData,
  missions: MissionDefinition[],
  outcome: MissionOutcome,
): SaveData {
  const mission = missions.find((candidate) => candidate.id === outcome.missionId);

  if (!mission) {
    return saveData;
  }

  const updatedRecords = {
    ...saveData.missionRecords,
    [outcome.missionId]: mergeMissionRecord(saveData.missionRecords[outcome.missionId], outcome),
  };
  const completedMissionIds = outcome.success
    ? Array.from(new Set([...saveData.completedMissionIds, outcome.missionId]))
    : saveData.completedMissionIds;

  const unlockedMissionIds = [...saveData.unlockedMissionIds];

  if (outcome.success && mission.nextMissionId && !unlockedMissionIds.includes(mission.nextMissionId)) {
    unlockedMissionIds.push(mission.nextMissionId);
  }

  return {
    ...saveData,
    currentMissionId: outcome.success ? mission.nextMissionId ?? mission.id : mission.id,
    unlockedMissionIds,
    completedMissionIds,
    missionRecords: updatedRecords,
  };
}

export function resetProgress(missions: MissionDefinition[]): SaveData {
  return createDefaultSaveData(missions);
}

export function areAllMissionsComplete(saveData: SaveData, missions: MissionDefinition[]): boolean {
  return missions.every((mission) => saveData.completedMissionIds.includes(mission.id));
}

export function setSaveStore(scene: Phaser.Scene, saveStore: SaveStore): void {
  scene.registry.set(SAVE_STORE_REGISTRY_KEY, saveStore);
}

export function getSaveStore(scene: Phaser.Scene): SaveStore {
  const saveStore = scene.registry.get(SAVE_STORE_REGISTRY_KEY) as SaveStore | undefined;

  if (!saveStore) {
    throw new Error('Save store is not available in the scene registry.');
  }

  return saveStore;
}

