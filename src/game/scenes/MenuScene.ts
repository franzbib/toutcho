import Phaser from 'phaser';
import { allMissions, firstMissionId } from '../../content';
import { SCENE_KEYS } from '../config/sceneKeys';
import { UI_COLORS } from '../config/theme';
import { createMenuControls, type MenuControls } from '../input/createPlayerControls';
import { MenuList } from '../../ui/common/MenuList';
import { areAllMissionsComplete, resetProgress } from '../../systems/save/saveStore';
import { persistSaveData } from '../../state/sessionHelpers';
import { getSession } from '../../state/gameSession';

export class MenuScene extends Phaser.Scene {
  private controls!: MenuControls;
  private menuList!: MenuList;
  private descriptionText!: Phaser.GameObjects.Text;
  private confirmationText!: Phaser.GameObjects.Text;
  private awaitingResetConfirmation = false;

  constructor() {
    super(SCENE_KEYS.menu);
  }

  create(): void {
    const saveData = getSession(this).saveData;
    const hasProgress =
      saveData.introSeen ||
      saveData.completedMissionIds.length > 0 ||
      (firstMissionId ? saveData.missionRecords[firstMissionId]?.attempts > 0 : false);

    this.controls = createMenuControls(this);

    this.add.rectangle(640, 360, 1280, 720, 0x10232a);
    this.add.circle(1040, 180, 170, 0x2f7d84, 0.18);
    this.add.circle(240, 560, 220, 0xe07a5f, 0.14);
    this.add.rectangle(640, 360, 1120, 600, 0xf8f2e6, 0.06).setStrokeStyle(1, 0xf8f2e6, 0.14);

    const title = this.add.text(640, 118, 'MISSION ISPA', {
      fontFamily: 'Georgia, Aptos, serif',
      fontSize: '74px',
      color: UI_COLORS.cream,
      fontStyle: 'bold',
    }).setOrigin(0.5);

    this.add.text(640, 182, 'Urgence à Amiens', {
      fontFamily: 'Aptos, Segoe UI, sans-serif',
      fontSize: '28px',
      color: UI_COLORS.aqua,
    }).setOrigin(0.5);

    this.add.text(
      640,
      230,
      "Jeu d'action-aventure linguistique : se déplacer, comprendre, demander, livrer et réagir vite.",
      {
        fontFamily: 'Aptos, Segoe UI, sans-serif',
        fontSize: '20px',
        color: UI_COLORS.cream,
      },
    ).setOrigin(0.5);

    this.menuList = new MenuList(this, [
      {
        label: 'Commencer',
        description: 'Réinitialiser la progression et lancer le briefing initial.',
        onSelect: () => {
          this.awaitingResetConfirmation = false;
          const freshSave = resetProgress(allMissions);
          persistSaveData(this, freshSave);
          this.scene.start(SCENE_KEYS.intro);
        },
      },
      {
        label: 'Continuer',
        description: 'Reprendre depuis le hub ou le bilan final si tout est déjà terminé.',
        enabled: hasProgress,
        onSelect: () => {
          this.awaitingResetConfirmation = false;

          if (areAllMissionsComplete(saveData, allMissions)) {
            this.scene.start(SCENE_KEYS.summary);
            return;
          }

          this.scene.start(saveData.introSeen ? SCENE_KEYS.hub : SCENE_KEYS.intro);
        },
      },
      {
        label: 'Missions',
        description: 'Rejouer une mission débloquée ou consulter les meilleurs scores.',
        onSelect: () => {
          this.awaitingResetConfirmation = false;
          this.scene.start(SCENE_KEYS.missions);
        },
      },
      {
        label: 'Options et contrôles',
        description: 'Voir les commandes clavier et modifier le son ou les animations.',
        onSelect: () => {
          this.awaitingResetConfirmation = false;
          this.scene.start(SCENE_KEYS.options);
        },
      },
      {
        label: 'Réinitialiser la progression',
        description: 'Effacer la sauvegarde locale et recommencer depuis le début.',
        onSelect: () => {
          if (!this.awaitingResetConfirmation) {
            this.awaitingResetConfirmation = true;
            this.confirmationText.setText('Appuie encore sur Entrée pour confirmer la réinitialisation.');
            return;
          }

          this.awaitingResetConfirmation = false;
          this.confirmationText.setText('Progression réinitialisée.');
          persistSaveData(this, resetProgress(allMissions));
        },
      },
      {
        label: 'Crédits',
        description: 'Voir les intentions du prototype et ses références de production.',
        onSelect: () => {
          this.awaitingResetConfirmation = false;
          this.scene.start(SCENE_KEYS.credits);
        },
      },
    ], 360, 330, 66);

    this.descriptionText = this.add.text(760, 360, '', {
      fontFamily: 'Aptos, Segoe UI, sans-serif',
      fontSize: '23px',
      color: UI_COLORS.cream,
      wordWrap: {
        width: 360,
      },
    }).setOrigin(0, 0.5);

    this.confirmationText = this.add.text(640, 645, '', {
      fontFamily: 'Aptos, Segoe UI, sans-serif',
      fontSize: '18px',
      color: UI_COLORS.warm,
      align: 'center',
    }).setOrigin(0.5);

    this.add.text(640, 680, 'Flèches : naviguer • Entrée : valider • Souris : cliquer', {
      fontFamily: 'Aptos, Segoe UI, sans-serif',
      fontSize: '17px',
      color: UI_COLORS.aqua,
    }).setOrigin(0.5);

    if (!saveData.settings.reducedMotion) {
      this.tweens.add({
        targets: title,
        y: title.y - 8,
        duration: 2200,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut',
      });
    }

    this.refreshDescription();
  }

  update(): void {
    this.refreshDescription();

    if (Phaser.Input.Keyboard.JustDown(this.controls.up)) {
      this.awaitingResetConfirmation = false;
      this.confirmationText.setText('');
      this.menuList.move(-1);
    }

    if (Phaser.Input.Keyboard.JustDown(this.controls.down)) {
      this.awaitingResetConfirmation = false;
      this.confirmationText.setText('');
      this.menuList.move(1);
    }

    if (Phaser.Input.Keyboard.JustDown(this.controls.confirm)) {
      this.menuList.activateSelected();
    }
  }

  private refreshDescription(): void {
    const selectedItem = this.menuList.getSelectedItem();
    this.descriptionText.setText(selectedItem?.description ?? '');
  }
}
