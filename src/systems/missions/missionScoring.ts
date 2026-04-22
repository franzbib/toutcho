import type { MissionOutcome, MissionRunState } from './missionTypes';

export function calculateLanguageAccuracy(runState: MissionRunState): number {
  const solvedCount = runState.solvedInteractionIds.length;

  if (solvedCount === 0) {
    return 100;
  }

  return Math.max(0, Math.round((runState.firstTryCorrectCount / solvedCount) * 100));
}

export function calculateMissionScore(runState: MissionRunState, success: boolean): number {
  const baseScore = success ? 320 : 80;
  const timeBonus = Math.round(runState.timeRemainingSeconds * 2.2);
  const firstTryBonus = runState.firstTryCorrectCount * 45;
  const mistakePenalty = runState.wrongChoiceCount * 18 + runState.navigationMistakes * 10;

  return Math.max(0, baseScore + timeBonus + firstTryBonus - mistakePenalty);
}

export function buildMissionOutcome(missionId: string, runState: MissionRunState, success: boolean): MissionOutcome {
  return {
    missionId,
    success,
    score: calculateMissionScore(runState, success),
    timeLeftSeconds: Math.max(0, Math.round(runState.timeRemainingSeconds)),
    languageAccuracy: calculateLanguageAccuracy(runState),
    wrongChoiceCount: runState.wrongChoiceCount,
    firstTryCorrectCount: runState.firstTryCorrectCount,
  };
}

