import { describe, expect, test } from 'vitest';
import { allMissions } from '../content';
import { buildMissionOutcome } from '../systems/missions/missionScoring';
import { completeObjective, createMissionRun, getCurrentObjective } from '../systems/missions/missionState';
import { createDefaultSaveData, recordMissionOutcome } from '../systems/save/saveStore';

describe('mission progression', () => {
  test("avance correctement dans les objectifs d'une mission", () => {
    const mission = allMissions[0];
    let run = createMissionRun(mission);

    expect(getCurrentObjective(mission, run)?.id).toBe('ask-delphine');

    run = completeObjective(run, 'ask-delphine');
    expect(getCurrentObjective(mission, run)?.id).toBe('inspect-hall-sign');

    run = completeObjective(run, 'inspect-hall-sign');
    expect(getCurrentObjective(mission, run)?.id).toBe('read-board');

    run = completeObjective(run, 'read-board');
    expect(getCurrentObjective(mission, run)?.id).toBe('relay-change');

    run = completeObjective(run, 'relay-change');
    expect(getCurrentObjective(mission, run)?.id).toBe('confirm-corridor');

    run = completeObjective(run, 'confirm-corridor');
    expect(getCurrentObjective(mission, run)?.id).toBe('reach-classroom');
  });

  test('débloque la mission suivante après un succès', () => {
    const mission = allMissions[0];
    const saveData = createDefaultSaveData(allMissions);
    const outcome = buildMissionOutcome(mission.id, {
      missionId: mission.id,
      completedObjectiveIds: mission.objectives.map((objective) => objective.id),
      inventory: [],
      timeRemainingSeconds: 64,
      wrongChoiceCount: 1,
      navigationMistakes: 0,
      firstTryCorrectCount: 4,
      interactionAttempts: {
        'm1-ask-delphine': 1,
        'm1-read-board': 1,
        'm1-relay-to-student': 1,
        'm1-confirm-corridor': 1,
      },
      solvedInteractionIds: ['m1-ask-delphine', 'm1-read-board', 'm1-relay-to-student', 'm1-confirm-corridor'],
    }, true);

    const nextSave = recordMissionOutcome(saveData, allMissions, outcome);

    expect(nextSave.completedMissionIds).toContain(mission.id);
    expect(nextSave.unlockedMissionIds).toContain('secretariat-delivery');
    expect(nextSave.currentMissionId).toBe('secretariat-delivery');
    expect(nextSave.missionRecords[mission.id]?.completed).toBe(true);
  });
});
