import Phaser from 'phaser';
import { allMissions, getMission } from '../../content';
import { SCENE_KEYS } from '../config/sceneKeys';
import { UI_COLORS } from '../config/theme';
import { createMenuControls, type MenuControls } from '../input/createPlayerControls';
import { MenuList } from '../../ui/common/MenuList';
import { getSession } from '../../state/gameSession';

export class SummaryScene extends Phaser.Scene {
  private controls!: MenuControls;
  private menuList!: MenuList;

  constructor() {
    super(SCENE_KEYS.summary);
  }

  create(): void {
    const saveData = getSession(this).saveData;
    const totalScore = allMissions.reduce(
      (sum, mission) => sum + (saveData.missionRecords[mission.id]?.bestScore ?? 0),
      0,
    );
    const summaryLines = allMissions.map((mission) => {
      const record = saveData.missionRecords[mission.id];
      const label = getMission(mission.id).shortTitle;
      return `${label} : score ${record.bestScore} • temps ${record.bestTimeLeftSeconds} s • précision ${record.bestLanguageAccuracy} %`;
    }).join('\n');

    this.controls = createMenuControls(this);

    this.add.rectangle(640, 360, 1280, 720, 0x143642);
    this.add.circle(220, 170, 140, 0xf2cc8f, 0.16);
    this.add.circle(1090, 550, 180, 0x9fd0c7, 0.18);
    this.add.rectangle(640, 360, 1120, 590, 0xf8f2e6, 0.06).setStrokeStyle(1, 0xf8f2e6, 0.14);

    this.add.text(640, 90, 'Bilan final', {
      fontFamily: 'Georgia, Aptos, serif',
      fontSize: '62px',
      color: UI_COLORS.cream,
      fontStyle: 'bold',
    }).setOrigin(0.5);

    this.add.text(640, 150, 'Urgence résolue : tu as traversé la journée complète à Amiens.', {
      fontFamily: 'Aptos, Segoe UI, sans-serif',
      fontSize: '24px',
      color: UI_COLORS.aqua,
    }).setOrigin(0.5);

    this.add.text(140, 225, `Score total : ${totalScore}`, {
      fontFamily: 'Aptos, Segoe UI, sans-serif',
      fontSize: '28px',
      color: UI_COLORS.warm,
      fontStyle: 'bold',
    });

    this.add.text(140, 280, summaryLines, {
      fontFamily: 'Aptos, Segoe UI, sans-serif',
      fontSize: '22px',
      color: UI_COLORS.cream,
      wordWrap: {
        width: 970,
      },
    });

    this.add.text(140, 470, 'Compétences travaillées', {
      fontFamily: 'Aptos, Segoe UI, sans-serif',
      fontSize: '28px',
      color: UI_COLORS.aqua,
      fontStyle: 'bold',
    });

    this.add.text(140, 514, [
      '• demander un renseignement avec une formule naturelle',
      '• comprendre une signalétique simple mais utile',
      '• parler au secrétariat avec un registre adapté',
      '• réagir à une urgence pratique sans perdre le fil des consignes',
    ].join('\n'), {
      fontFamily: 'Aptos, Segoe UI, sans-serif',
      fontSize: '22px',
      color: UI_COLORS.cream,
    });

    this.menuList = new MenuList(this, [
      {
        label: 'Retour au hall',
        onSelect: () => {
          this.scene.start(SCENE_KEYS.hub);
        },
      },
      {
        label: 'Sélectionner une mission',
        onSelect: () => {
          this.scene.start(SCENE_KEYS.missions);
        },
      },
      {
        label: 'Menu principal',
        onSelect: () => {
          this.scene.start(SCENE_KEYS.menu);
        },
      },
    ], 930, 520, 82);
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

    if (Phaser.Input.Keyboard.JustDown(this.controls.back)) {
      this.scene.start(SCENE_KEYS.menu);
    }
  }
}

