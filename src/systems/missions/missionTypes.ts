export type MissionObjectiveKind = 'reach' | 'inspect' | 'talk' | 'choose' | 'collect' | 'deliver';

export type MissionObjective = {
  id: string;
  kind: MissionObjectiveKind;
  label: string;
  targetId: string;
  requiredItemId?: string;
};

export type MissionDefinition = {
  id: string;
  order: number;
  title: string;
  shortTitle: string;
  brief: string;
  successSummary: string;
  failureSummary: string;
  locationId: string;
  timeLimitSeconds: number;
  objectives: MissionObjective[];
  learnedPoints: string[];
  vocabularyIds: string[];
  nextMissionId?: string;
};

export type MissionStatus = 'locked' | 'available' | 'completed';

export type MissionRecord = {
  missionId: string;
  attempts: number;
  completed: boolean;
  bestScore: number;
  bestTimeLeftSeconds: number;
  bestLanguageAccuracy: number;
};

export type MissionOutcome = {
  missionId: string;
  success: boolean;
  score: number;
  timeLeftSeconds: number;
  languageAccuracy: number;
  wrongChoiceCount: number;
  firstTryCorrectCount: number;
};

export type MissionRunState = {
  missionId: string;
  completedObjectiveIds: string[];
  inventory: string[];
  timeRemainingSeconds: number;
  wrongChoiceCount: number;
  navigationMistakes: number;
  firstTryCorrectCount: number;
  interactionAttempts: Record<string, number>;
  solvedInteractionIds: string[];
};

