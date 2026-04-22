import Phaser from 'phaser';
import { allMissions } from '../../content';
import { SCENE_KEYS } from '../config/sceneKeys';
import { UI_COLORS } from '../config/theme';
import { createMenuControls, type MenuControls } from '../input/createPlayerControls';
import { MenuList } from '../../ui/common/MenuList';
import { getMissionStatus } from '../../systems/missions/missionState';
import { startMission } from '../../systems/save/saveStore';
import { persistSaveData } from '../../state/sessionHelpers';
import { getSession } from '../../state/gameSession';

export class MissionSelectScene extends Phaser.Scene {
  private controls!: MenuControls;
  private menuList!: MenuList;
  private detailText!: Phaser.GameObjects.Text;

  constructor() {
    super(SCENE_KEYS.missions);
  }

  create(): void {
    this.controls = createMenuControls(this);

    const saveData = getSession(this).saveData;

    this.add.rectangle(640, 360, 1280, 720, 0x13262d);
    this.add.rectangle(640, 360, 1120, 590, 0xf8f2e6, 0.06).setStrokeStyle(1, 0xf8f2e6, 0.14);

    this.add.text(640, 90, 'Sélection des missions', {
      fontFamily: 'Georgia, Aptos, serif',
      fontSize: '58px',
      color: UI_COLORS.cream,
      fontStyle: 'bold',
    }).setOrigin(0.5);

    const missionItems = allMissions.map((mission) => {
      const status = getMissionStatus(mission.id, saveData.unlockedMissionIds, saveData.completedMissionIds);
      const record = saveData.missionRecords[mission.id];
      const statusLabel =
        status === 'completed' ? 'Terminée' : status === 'available' ? 'Disponible' : 'Verrouillée';

      return {
        label: `${mission.order}. ${mission.shortTitle} · ${statusLabel}`,
        enabled: status !== 'locked',
        description: [
          mission.title,
          '',
          mission.brief,
          '',
          `Meilleur score : ${record.bestScore}`,
          `Meilleur temps restant : ${record.bestTimeLeftSeconds} s`,
          `Précision linguistique : ${record.bestLanguageAccuracy} %`,
        ].join('\n'),
        onSelect: () => {
          const nextSave = startMission(getSession(this).saveData, mission.id);
          persistSaveData(this, nextSave);
          this.scene.start(SCENE_KEYS.mission, { missionId: mission.id });
        },
      };
    });

    this.menuList = new MenuList(this, [
      ...missionItems,
      {
        label: 'Retour',
        description: 'Revenir au menu principal.',
        onSelect: () => {
          this.scene.start(SCENE_KEYS.menu);
        },
      },
    ], 300, 210, 72);

    this.detailText = this.add.text(760, 230, missionItems[0]?.description ?? '', {
      fontFamily: 'Aptos, Segoe UI, sans-serif',
      fontSize: '22px',
      color: UI_COLORS.cream,
      wordWrap: {
        width: 390,
      },
    });
  }

  update(): void {
    this.refreshDetails();

    if (Phaser.Input.Keyboard.JustDown(this.controls.up)) {
      this.menuList.move(-1);
    }

    if (Phaser.Input.Keyboard.JustDown(this.controls.down)) {
      this.menuList.move(1);
    }

    if (Phaser.Input.Keyboard.JustDown(this.controls.confirm)) {
      this.menuList.activateSelected();
    }

    if (Phaser.Input.Keyboard.JustDown(this.controls.back)) {
      this.scene.start(SCENE_KEYS.menu);
    }
  }

  private refreshDetails(): void {
    this.detailText.setText(this.menuList.getSelectedItem()?.description ?? '');
  }
}
