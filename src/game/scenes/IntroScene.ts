import Phaser from 'phaser';
import { SCENE_KEYS } from '../config/sceneKeys';
import { UI_COLORS } from '../config/theme';
import { createMenuControls, type MenuControls } from '../input/createPlayerControls';
import { markIntroSeen } from '../../systems/save/saveStore';
import { persistSaveData } from '../../state/sessionHelpers';
import { getSession } from '../../state/gameSession';

const INTRO_PAGES = [
  {
    title: 'Amiens, début de journée',
    body: "Tu es étudiant international à ISPA. Ce matin, tout semble normal, mais plusieurs petites urgences vont s'enchaîner très vite.",
  },
  {
    title: 'Objectif',
    body: "Tu dois te repérer, parler aux bonnes personnes, comprendre des messages courts et réagir sans perdre trop de temps. La langue t'aide à avancer.",
  },
  {
    title: 'Cap sur le hall',
    body: "Le hall d'ISPA sert de point de départ. Chaque mission représente une situation crédible de vie étudiante à Amiens.",
  },
];

export class IntroScene extends Phaser.Scene {
  private controls!: MenuControls;
  private pageIndex = 0;
  private titleText!: Phaser.GameObjects.Text;
  private bodyText!: Phaser.GameObjects.Text;
  private hintText!: Phaser.GameObjects.Text;

  constructor() {
    super(SCENE_KEYS.intro);
  }

  create(): void {
    this.controls = createMenuControls(this);

    this.add.rectangle(640, 360, 1280, 720, 0x112129);
    this.add.circle(230, 210, 150, 0xe07a5f, 0.16);
    this.add.circle(1020, 520, 190, 0x2f7d84, 0.18);
    this.add.rectangle(640, 360, 980, 520, 0xf8f2e6, 0.06).setStrokeStyle(1, 0xf8f2e6, 0.14);

    this.titleText = this.add.text(640, 180, '', {
      fontFamily: 'Georgia, Aptos, serif',
      fontSize: '58px',
      color: UI_COLORS.cream,
      fontStyle: 'bold',
    }).setOrigin(0.5);

    this.bodyText = this.add.text(640, 360, '', {
      fontFamily: 'Aptos, Segoe UI, sans-serif',
      fontSize: '30px',
      color: UI_COLORS.cream,
      wordWrap: {
        width: 760,
      },
      align: 'center',
    }).setOrigin(0.5);

    this.hintText = this.add.text(640, 610, '', {
      fontFamily: 'Aptos, Segoe UI, sans-serif',
      fontSize: '18px',
      color: UI_COLORS.aqua,
    }).setOrigin(0.5);

    this.renderPage();
  }

  update(): void {
    if (Phaser.Input.Keyboard.JustDown(this.controls.confirm)) {
      if (this.pageIndex < INTRO_PAGES.length - 1) {
        this.pageIndex += 1;
        this.renderPage();
        return;
      }

      const nextSave = markIntroSeen(getSession(this).saveData);
      persistSaveData(this, nextSave);
      this.scene.start(SCENE_KEYS.hub);
    }

    if (Phaser.Input.Keyboard.JustDown(this.controls.back)) {
      this.scene.start(SCENE_KEYS.menu);
    }
  }

  private renderPage(): void {
    const page = INTRO_PAGES[this.pageIndex];

    this.titleText.setText(page.title);
    this.bodyText.setText(page.body);
    this.hintText.setText(this.pageIndex === INTRO_PAGES.length - 1 ? 'Entrée : entrer dans le hall' : 'Entrée : continuer');
  }
}

