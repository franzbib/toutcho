import Phaser from 'phaser';
import { allMissions, getLexiconEntry, getMission } from '../../content';
import { SCENE_KEYS } from '../config/sceneKeys';
import { UI_COLORS } from '../config/theme';
import { createMenuControls, type MenuControls } from '../input/createPlayerControls';
import { MenuList } from '../../ui/common/MenuList';
import type { MissionOutcome } from '../../systems/missions/missionTypes';
import { areAllMissionsComplete, startMission } from '../../systems/save/saveStore';
import { persistSaveData } from '../../state/sessionHelpers';
import { getSession } from '../../state/gameSession';

type ResultSceneData = {
  missionId: string;
  outcome: MissionOutcome;
};

export class ResultScene extends Phaser.Scene {
  private controls!: MenuControls;
  private menuList!: MenuList;

  constructor() {
    super(SCENE_KEYS.result);
  }

  create(data: ResultSceneData): void {
    const mission = getMission(data.missionId);
    const allComplete = areAllMissionsComplete(getSession(this).saveData, allMissions);
    const summaryText = data.outcome.success ? mission.successSummary : mission.failureSummary;
    const vocabularyLines = mission.vocabularyIds
      .map((entryId) => {
        const entry = getLexiconEntry(entryId);
        return `• ${entry.term} : ${entry.meaning}`;
      })
      .join('\n');

    this.controls = createMenuControls(this);

    this.add.rectangle(640, 360, 1280, 720, data.outcome.success ? 0x18353d : 0x3b1f2b);
    this.add.rectangle(640, 360, 1120, 590, 0xf8f2e6, 0.06).setStrokeStyle(1, 0xf8f2e6, 0.14);

    this.add.text(640, 90, data.outcome.success ? 'Mission réussie' : 'Mission à recommencer', {
      fontFamily: 'Georgia, Aptos, serif',
      fontSize: '60px',
      color: UI_COLORS.cream,
      fontStyle: 'bold',
    }).setOrigin(0.5);

    this.add.text(640, 152, mission.title, {
      fontFamily: 'Aptos, Segoe UI, sans-serif',
      fontSize: '24px',
      color: UI_COLORS.aqua,
    }).setOrigin(0.5);

    this.add.text(130, 220, summaryText, {
      fontFamily: 'Aptos, Segoe UI, sans-serif',
      fontSize: '24px',
      color: UI_COLORS.cream,
      wordWrap: {
        width: 1020,
      },
    });

    this.add.text(130, 300, `Score : ${data.outcome.score}`, {
      fontFamily: 'Aptos, Segoe UI, sans-serif',
      fontSize: '24px',
      color: UI_COLORS.warm,
    });
    this.add.text(130, 338, `Temps restant : ${data.outcome.timeLeftSeconds} s`, {
      fontFamily: 'Aptos, Segoe UI, sans-serif',
      fontSize: '24px',
      color: UI_COLORS.warm,
    });
    this.add.text(130, 376, `Précision linguistique : ${data.outcome.languageAccuracy} %`, {
      fontFamily: 'Aptos, Segoe UI, sans-serif',
      fontSize: '24px',
      color: UI_COLORS.warm,
    });

    this.add.text(130, 446, 'Ce que tu retiens', {
      fontFamily: 'Aptos, Segoe UI, sans-serif',
      fontSize: '28px',
      color: UI_COLORS.aqua,
      fontStyle: 'bold',
    });

    this.add.text(130, 490, mission.learnedPoints.map((line) => `• ${line}`).join('\n'), {
      fontFamily: 'Aptos, Segoe UI, sans-serif',
      fontSize: '20px',
      color: UI_COLORS.cream,
      wordWrap: {
        width: 560,
      },
    });

    this.add.text(760, 446, 'Lexique utile', {
      fontFamily: 'Aptos, Segoe UI, sans-serif',
      fontSize: '28px',
      color: UI_COLORS.aqua,
      fontStyle: 'bold',
    });

    this.add.text(760, 490, vocabularyLines, {
      fontFamily: 'Aptos, Segoe UI, sans-serif',
      fontSize: '20px',
      color: UI_COLORS.cream,
      wordWrap: {
        width: 380,
      },
    });

    const items = [
      {
        label: 'Réessayer',
        onSelect: () => {
          const nextSave = startMission(getSession(this).saveData, mission.id);
          persistSaveData(this, nextSave);
          this.scene.start(SCENE_KEYS.mission, { missionId: mission.id });
        },
      },
      ...(data.outcome.success
        ? [{
            label: allComplete ? 'Voir le bilan final' : 'Mission suivante',
            onSelect: () => {
              if (allComplete) {
                this.scene.start(SCENE_KEYS.summary);
                return;
              }

              if (!mission.nextMissionId) {
                this.scene.start(SCENE_KEYS.hub);
                return;
              }

              const nextSave = startMission(getSession(this).saveData, mission.nextMissionId);
              persistSaveData(this, nextSave);
              this.scene.start(SCENE_KEYS.mission, { missionId: mission.nextMissionId });
            },
          }]
        : []),
      {
        label: 'Retour au hall',
        onSelect: () => {
          this.scene.start(SCENE_KEYS.hub);
        },
      },
    ];

    this.menuList = new MenuList(this, items, 980, 250, 82);
  }

  update(): void {
    if (Phaser.Input.Keyboard.JustDown(this.controls.up)) {
      this.menuList.move(-1);
    }

    if (Phaser.Input.Keyboard.JustDown(this.controls.down)) {
      this.menuList.move(1);
    }

    if (Phaser.Input.Keyboard.JustDown(this.controls.confirm)) {
      this.menuList.activateSelected();
    }
  }
}
