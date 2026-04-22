import type { MissionRecord } from '../missions/missionTypes';

export type GameSettings = {
  muted: boolean;
  reducedMotion: boolean;
};

export type SaveData = {
  version: number;
  introSeen: boolean;
  currentMissionId: string | null;
  unlockedMissionIds: string[];
  completedMissionIds: string[];
  missionRecords: Record<string, MissionRecord>;
  settings: GameSettings;
};

