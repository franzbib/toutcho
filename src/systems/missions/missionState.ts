import type { MissionDefinition, MissionOutcome, MissionRecord, MissionRunState, MissionStatus } from './missionTypes';

export function createMissionRun(mission: MissionDefinition): MissionRunState {
  return {
    missionId: mission.id,
    completedObjectiveIds: [],
    inventory: [],
    timeRemainingSeconds: mission.timeLimitSeconds,
    wrongChoiceCount: 0,
    navigationMistakes: 0,
    firstTryCorrectCount: 0,
    interactionAttempts: {},
    solvedInteractionIds: [],
  };
}

export function getCurrentObjective(mission: MissionDefinition, runState: MissionRunState) {
  return mission.objectives.find((objective) => !runState.completedObjectiveIds.includes(objective.id)) ?? null;
}

export function completeObjective(runState: MissionRunState, objectiveId: string): MissionRunState {
  if (runState.completedObjectiveIds.includes(objectiveId)) {
    return runState;
  }

  return {
    ...runState,
    completedObjectiveIds: [...runState.completedObjectiveIds, objectiveId],
  };
}

export function grantItem(runState: MissionRunState, itemId: string): MissionRunState {
  if (runState.inventory.includes(itemId)) {
    return runState;
  }

  return {
    ...runState,
    inventory: [...runState.inventory, itemId],
  };
}

export function consumeItem(runState: MissionRunState, itemId: string): MissionRunState {
  return {
    ...runState,
    inventory: runState.inventory.filter((candidate) => candidate !== itemId),
  };
}

export function hasItem(runState: MissionRunState, itemId: string): boolean {
  return runState.inventory.includes(itemId);
}

export function tickMissionTimer(runState: MissionRunState, deltaSeconds: number): MissionRunState {
  return {
    ...runState,
    timeRemainingSeconds: Math.max(0, runState.timeRemainingSeconds - deltaSeconds),
  };
}

export function addTime(runState: MissionRunState, seconds: number): MissionRunState {
  return {
    ...runState,
    timeRemainingSeconds: Math.max(0, runState.timeRemainingSeconds + seconds),
  };
}

export function registerWrongChoice(runState: MissionRunState, interactionId: string, penaltySeconds: number): MissionRunState {
  return {
    ...runState,
    wrongChoiceCount: runState.wrongChoiceCount + 1,
    timeRemainingSeconds: Math.max(0, runState.timeRemainingSeconds - penaltySeconds),
    interactionAttempts: {
      ...runState.interactionAttempts,
      [interactionId]: (runState.interactionAttempts[interactionId] ?? 0) + 1,
    },
  };
}

export function registerSolvedInteraction(runState: MissionRunState, interactionId: string): MissionRunState {
  if (runState.solvedInteractionIds.includes(interactionId)) {
    return runState;
  }

  const attempts = runState.interactionAttempts[interactionId] ?? 0;

  return {
    ...runState,
    firstTryCorrectCount: attempts === 0 ? runState.firstTryCorrectCount + 1 : runState.firstTryCorrectCount,
    interactionAttempts: {
      ...runState.interactionAttempts,
      [interactionId]: attempts + 1,
    },
    solvedInteractionIds: [...runState.solvedInteractionIds, interactionId],
  };
}

export function registerNavigationMistake(runState: MissionRunState, penaltySeconds: number): MissionRunState {
  return {
    ...runState,
    navigationMistakes: runState.navigationMistakes + 1,
    timeRemainingSeconds: Math.max(0, runState.timeRemainingSeconds - penaltySeconds),
  };
}

export function isMissionComplete(mission: MissionDefinition, runState: MissionRunState): boolean {
  return mission.objectives.every((objective) => runState.completedObjectiveIds.includes(objective.id));
}

export function getMissionStatus(
  missionId: string,
  unlockedMissionIds: string[],
  completedMissionIds: string[],
): MissionStatus {
  if (completedMissionIds.includes(missionId)) {
    return 'completed';
  }

  if (unlockedMissionIds.includes(missionId)) {
    return 'available';
  }

  return 'locked';
}

export function createEmptyMissionRecord(missionId: string): MissionRecord {
  return {
    missionId,
    attempts: 0,
    completed: false,
    bestScore: 0,
    bestTimeLeftSeconds: 0,
    bestLanguageAccuracy: 0,
  };
}

export function mergeMissionRecord(previous: MissionRecord | undefined, outcome: MissionOutcome): MissionRecord {
  const seed = previous ?? createEmptyMissionRecord(outcome.missionId);

  return {
    missionId: outcome.missionId,
    attempts: seed.attempts + 1,
    completed: seed.completed || outcome.success,
    bestScore: Math.max(seed.bestScore, outcome.score),
    bestTimeLeftSeconds: Math.max(seed.bestTimeLeftSeconds, outcome.timeLeftSeconds),
    bestLanguageAccuracy: Math.max(seed.bestLanguageAccuracy, outcome.languageAccuracy),
  };
}

