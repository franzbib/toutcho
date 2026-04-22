import Phaser from 'phaser';
import { SCENE_KEYS } from '../config/sceneKeys';
import { UI_COLORS } from '../config/theme';
import { createMenuControls, type MenuControls } from '../input/createPlayerControls';
import { MenuList } from '../../ui/common/MenuList';
import { updateSettings } from '../../systems/save/saveStore';
import { persistSaveData } from '../../state/sessionHelpers';
import { getSession } from '../../state/gameSession';

export class OptionsScene extends Phaser.Scene {
  private controls!: MenuControls;
  private menuList!: MenuList;

  constructor() {
    super(SCENE_KEYS.options);
  }

  create(): void {
    this.controls = createMenuControls(this);
    this.draw();
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

  private draw(): void {
    const saveData = getSession(this).saveData;

    this.menuList?.destroy();
    this.children.removeAll(true);

    this.add.rectangle(640, 360, 1280, 720, 0x13262d);
    this.add.rectangle(640, 360, 1100, 590, 0xf8f2e6, 0.06).setStrokeStyle(1, 0xf8f2e6, 0.14);

    this.add.text(640, 96, 'Options et contrôles', {
      fontFamily: 'Georgia, Aptos, serif',
      fontSize: '60px',
      color: UI_COLORS.cream,
      fontStyle: 'bold',
    }).setOrigin(0.5);

    this.add.text(118, 190, 'Contrôles', {
      fontFamily: 'Aptos, Segoe UI, sans-serif',
      fontSize: '28px',
      color: UI_COLORS.aqua,
      fontStyle: 'bold',
    });

    this.add.text(118, 236, 'Déplacement : ZQSD, WASD ou flèches', {
      fontFamily: 'Aptos, Segoe UI, sans-serif',
      fontSize: '22px',
      color: UI_COLORS.cream,
    });
    this.add.text(118, 272, 'Interaction : E ou Espace', {
      fontFamily: 'Aptos, Segoe UI, sans-serif',
      fontSize: '22px',
      color: UI_COLORS.cream,
    });
    this.add.text(118, 308, 'Choix linguistiques : 1, 2, 3', {
      fontFamily: 'Aptos, Segoe UI, sans-serif',
      fontSize: '22px',
      color: UI_COLORS.cream,
    });
    this.add.text(118, 344, 'Menus : flèches + Entrée, ou clic souris', {
      fontFamily: 'Aptos, Segoe UI, sans-serif',
      fontSize: '22px',
      color: UI_COLORS.cream,
    });

    this.add.text(118, 432, 'Accessibilité', {
      fontFamily: 'Aptos, Segoe UI, sans-serif',
      fontSize: '28px',
      color: UI_COLORS.aqua,
      fontStyle: 'bold',
    });
    this.add.text(118, 478, 'Texte large, contraste fort, choix limités à trois options maximum.', {
      fontFamily: 'Aptos, Segoe UI, sans-serif',
      fontSize: '22px',
      color: UI_COLORS.cream,
      wordWrap: {
        width: 520,
      },
    });

    this.menuList = new MenuList(this, [
      {
        label: `Son : ${saveData.settings.muted ? 'coupé' : 'activé'}`,
        description: 'Coupe ou réactive les futurs sons d’interface du prototype.',
        onSelect: () => {
          const nextSave = updateSettings(getSession(this).saveData, {
            muted: !getSession(this).saveData.settings.muted,
          });
          persistSaveData(this, nextSave);
          this.draw();
        },
      },
      {
        label: `Animations réduites : ${saveData.settings.reducedMotion ? 'oui' : 'non'}`,
        description: 'Réduit les légers mouvements décoratifs et certains fondus.',
        onSelect: () => {
          const nextSave = updateSettings(getSession(this).saveData, {
            reducedMotion: !getSession(this).saveData.settings.reducedMotion,
          });
          persistSaveData(this, nextSave);
          this.draw();
        },
      },
      {
        label: 'Retour',
        description: 'Revenir au menu principal.',
        onSelect: () => {
          this.scene.start(SCENE_KEYS.menu);
        },
      },
    ], 880, 330, 82);

    this.add.text(880, 560, 'Échap : retour', {
      fontFamily: 'Aptos, Segoe UI, sans-serif',
      fontSize: '18px',
      color: UI_COLORS.warm,
    }).setOrigin(0.5);
  }
}
