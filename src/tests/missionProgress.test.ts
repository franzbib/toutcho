import { describe, expect, test } from 'vitest';
import { allMissions } from '../content';
import { buildMissionOutcome } from '../systems/missions/missionScoring';
import { completeObjective, createMissionRun, getCurrentObjective } from '../systems/missions/missionState';
import { createDefaultSaveData, recordMissionOutcome } from '../systems/save/saveStore';

describe('mission progression', () => {
  test('avance correctement dans les objectifs d’une mission', () => {
    const mission = allMissions[0];
    let run = createMissionRun(mission);

    expect(getCurrentObjective(mission, run)?.id).toBe('ask-student');

    run = completeObjective(run, 'ask-student');
    expect(getCurrentObjective(mission, run)?.id).toBe('read-board');

    run = completeObjective(run, 'read-board');
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
      firstTryCorrectCount: 2,
      interactionAttempts: {
        'm1-ask-lina': 1,
        'm1-read-board': 1,
      },
      solvedInteractionIds: ['m1-ask-lina', 'm1-read-board'],
    }, true);

    const nextSave = recordMissionOutcome(saveData, allMissions, outcome);

    expect(nextSave.completedMissionIds).toContain(mission.id);
    expect(nextSave.unlockedMissionIds).toContain('secretariat-delivery');
    expect(nextSave.currentMissionId).toBe('secretariat-delivery');
    expect(nextSave.missionRecords[mission.id]?.completed).toBe(true);
  });
});

