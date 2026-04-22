import Phaser from 'phaser';
import { SCENE_KEYS } from '../config/sceneKeys';
import { UI_COLORS } from '../config/theme';
import { createMenuControls, type MenuControls } from '../input/createPlayerControls';
import { MenuList } from '../../ui/common/MenuList';

export class CreditsScene extends Phaser.Scene {
  private controls!: MenuControls;
  private menuList!: MenuList;

  constructor() {
    super(SCENE_KEYS.credits);
  }

  create(): void {
    this.controls = createMenuControls(this);

    this.add.rectangle(640, 360, 1280, 720, 0x10232a);
    this.add.rectangle(640, 360, 1020, 560, 0xf8f2e6, 0.06).setStrokeStyle(1, 0xf8f2e6, 0.14);

    this.add.text(640, 100, 'Crédits', {
      fontFamily: 'Georgia, Aptos, serif',
      fontSize: '58px',
      color: UI_COLORS.cream,
      fontStyle: 'bold',
    }).setOrigin(0.5);

    this.add.text(640, 220, [
      'Concept : prototype de jeu éducatif action-aventure pour ISPA à Amiens',
      'Stack : Vite, TypeScript, Phaser 3',
      'Direction : environnement stylisé, missions courtes, français B1 contextualisé',
      'Contrôle principal : clavier, avec support souris pour les menus',
      'Contenu : situations plausibles de vie étudiante et administrative',
    ].join('\n\n'), {
      fontFamily: 'Aptos, Segoe UI, sans-serif',
      fontSize: '24px',
      color: UI_COLORS.cream,
      align: 'center',
      wordWrap: {
        width: 820,
      },
    }).setOrigin(0.5);

    this.menuList = new MenuList(this, [
      {
        label: 'Retour',
        onSelect: () => {
          this.scene.start(SCENE_KEYS.menu);
        },
      },
    ], 640, 610);
  }

  update(): void {
    if (Phaser.Input.Keyboard.JustDown(this.controls.confirm) || Phaser.Input.Keyboard.JustDown(this.controls.back)) {
      this.menuList.activateSelected();
    }
  }
}
