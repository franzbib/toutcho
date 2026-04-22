import type { MissionDefinition, MissionRunState } from './missionTypes';
import { getCurrentObjective } from './missionState';

export function getObjectiveLabel(mission: MissionDefinition, runState: MissionRunState): string {
  return getCurrentObjective(mission, runState)?.label ?? 'Mission terminée.';
}

export function isCurrentObjectiveTarget(mission: MissionDefinition, runState: MissionRunState, targetId: string): boolean {
  return getCurrentObjective(mission, runState)?.targetId === targetId;
}

