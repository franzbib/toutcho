import Phaser from 'phaser';
import { allMissions, getInteraction, getLocation, getSignage } from '../../content';
import { SCENE_KEYS } from '../config/sceneKeys';
import { UI_COLORS } from '../config/theme';
import { playUiTone } from '../audio/playUiTone';
import { PlayerAvatar } from '../entities/PlayerAvatar';
import type { WorldObjectView } from '../entities/WorldObjectView';
import { createPlayerControls, getMovementVector, type PlayerControls } from '../input/createPlayerControls';
import { isWithinInteractionRange } from '../world/interactionZones';
import { renderLocation } from '../world/renderLocation';
import { getMissionStatus } from '../../systems/missions/missionState';
import { startMission } from '../../systems/save/saveStore';
import { getSession } from '../../state/gameSession';
import { persistSaveData } from '../../state/sessionHelpers';
import { InteractionPanel } from '../../ui/mission/InteractionPanel';

export class HubScene extends Phaser.Scene {
  private controls!: PlayerControls;
  private player!: PlayerAvatar;
  private objectViews: WorldObjectView[] = [];
  private interactionPanel!: InteractionPanel;
  private interactionPrompt!: Phaser.GameObjects.Text;
  private headerText!: Phaser.GameObjects.Text;
  private doorStatusTexts = new Map<string, Phaser.GameObjects.Text>();
  private activeInfoHandler: (() => void) | null = null;

  constructor() {
    super(SCENE_KEYS.hub);
  }

  create(): void {
    const location = getLocation('ispa-hub');
    const rendered = renderLocation(this, location);

    this.objectViews = rendered.objectViews;
    this.player = new PlayerAvatar(this, location.playerSpawn.x, location.playerSpawn.y);
    this.player.bodyRect.setDepth(3);
    this.physics.add.collider(this.player.bodyRect, rendered.colliderGroup);

    this.controls = createPlayerControls(this);

    this.cameras.main.setBounds(0, 0, location.width, location.height);
    this.cameras.main.startFollow(this.player.bodyRect, true, 0.08, 0.08);

    this.headerText = this.add.text(38, 30, '', {
      fontFamily: 'Aptos, Segoe UI, sans-serif',
      fontSize: '24px',
      color: UI_COLORS.cream,
      backgroundColor: '#10232a',
      padding: {
        x: 14,
        y: 8,
      },
    }).setScrollFactor(0);

    this.add.text(1240, 32, 'ZQSD / WASD / flèches • E : interagir • Échap : menu', {
      fontFamily: 'Aptos, Segoe UI, sans-serif',
      fontSize: '17px',
      color: UI_COLORS.cream,
      backgroundColor: '#10232a',
      padding: {
        x: 12,
        y: 6,
      },
    }).setOrigin(1, 0).setScrollFactor(0);

    this.interactionPrompt = this.add.text(1240, 680, '', {
      fontFamily: 'Aptos, Segoe UI, sans-serif',
      fontSize: '18px',
      color: UI_COLORS.cream,
      backgroundColor: '#10232a',
      padding: {
        x: 14,
        y: 8,
      },
    }).setOrigin(1, 1).setScrollFactor(0);
    this.interactionPrompt.setVisible(false);

    this.interactionPanel = new InteractionPanel(this);
    this.createDoorStatusTexts();
    this.refreshHeader();
  }

  update(): void {
    if (this.interactionPanel.isVisible()) {
      this.player.freeze();

      if (
        Phaser.Input.Keyboard.JustDown(this.controls.interact) ||
        Phaser.Input.Keyboard.JustDown(this.controls.confirm) ||
        Phaser.Input.Keyboard.JustDown(this.controls.pause)
      ) {
        playUiTone(this, 'confirm');
        this.interactionPanel.hide();
        const handler = this.activeInfoHandler;
        this.activeInfoHandler = null;
        handler?.();
      }

      return;
    }

    if (Phaser.Input.Keyboard.JustDown(this.controls.pause)) {
      this.scene.start(SCENE_KEYS.menu);
      return;
    }

    this.player.updateFromInput(getMovementVector(this.controls));
    const nearestObject = this.findNearestObject();
    this.refreshDoorStates();

    this.objectViews.forEach((view) => {
      view.setHighlighted(view === nearestObject);
    });

    if (nearestObject) {
      this.interactionPrompt.setVisible(true);
      this.interactionPrompt.setText(`${nearestObject.definition.prompt} : ${nearestObject.definition.label.replace('\n', ' ')}`);

      if (
        Phaser.Input.Keyboard.JustDown(this.controls.interact) ||
        Phaser.Input.Keyboard.JustDown(this.controls.confirm)
      ) {
        playUiTone(this, 'confirm');
        this.handleObjectInteraction(nearestObject);
      }
    } else {
      this.interactionPrompt.setVisible(false);
    }
  }

  private refreshHeader(): void {
    const saveData = getSession(this).saveData;
    this.headerText.setText(`Hall central • ${saveData.completedMissionIds.length}/${allMissions.length} missions terminées`);
  }

  private refreshDoorStates(): void {
    const saveData = getSession(this).saveData;

    for (const objectView of this.objectViews) {
      const missionId = objectView.definition.portalMissionId;

      if (!missionId) {
        objectView.setDisabled(false);
        continue;
      }

      const status = getMissionStatus(missionId, saveData.unlockedMissionIds, saveData.completedMissionIds);
      const missionRecord = saveData.missionRecords[missionId];
      const statusText = this.doorStatusTexts.get(objectView.definition.id);

      objectView.setDisabled(status === 'locked');

      if (!statusText) {
        continue;
      }

      if (status === 'completed') {
        statusText.setColor('#c8f0d3');
        statusText.setText(`Terminée\nScore ${missionRecord.bestScore}`);
      } else if (status === 'available') {
        statusText.setColor('#f2cc8f');
        statusText.setText('Disponible');
      } else {
        statusText.setColor('#d7d0c4');
        statusText.setText('Verrouillée');
      }
    }
  }

  private findNearestObject(): WorldObjectView | null {
    let nearestObject: WorldObjectView | null = null;
    let nearestDistance = Number.POSITIVE_INFINITY;

    for (const objectView of this.objectViews) {
      if (!isWithinInteractionRange(this.player.bodyRect, objectView.container, 108)) {
        continue;
      }

      const distance = Phaser.Math.Distance.Between(this.player.x, this.player.y, objectView.x, objectView.y);

      if (distance < nearestDistance) {
        nearestDistance = distance;
        nearestObject = objectView;
      }
    }

    return nearestObject;
  }

  private handleObjectInteraction(objectView: WorldObjectView): void {
    const object = objectView.definition;

    if (object.portalMissionId) {
      const saveData = getSession(this).saveData;
      const status = getMissionStatus(object.portalMissionId, saveData.unlockedMissionIds, saveData.completedMissionIds);

      if (status === 'locked') {
        playUiTone(this, 'error');
        this.showInfo('Mission verrouillée', object.lockedText ?? 'Cette mission est encore verrouillée.');
        return;
      }

      const nextSave = startMission(saveData, object.portalMissionId);
      persistSaveData(this, nextSave);
      this.scene.start(SCENE_KEYS.mission, { missionId: object.portalMissionId });
      return;
    }

    if (object.id === 'hub-board') {
      const saveData = getSession(this).saveData;
      const progressLines = allMissions.map((mission) => {
        const status = getMissionStatus(mission.id, saveData.unlockedMissionIds, saveData.completedMissionIds);
        const label = status === 'completed' ? 'terminée' : status === 'available' ? 'disponible' : 'verrouillée';
        const bestScore = saveData.missionRecords[mission.id]?.bestScore ?? 0;
        return `${mission.order}. ${mission.shortTitle} : ${label} • meilleur score ${bestScore}`;
      });

      this.showInfo('Tableau des missions', progressLines.join('\n'));
      return;
    }

    if (object.signageId) {
      const sign = getSignage(object.signageId);
      this.showInfo(sign.title, sign.body.join('\n\n'));
      return;
    }

    if (object.interactionId) {
      const interaction = getInteraction(object.interactionId);

      if (interaction.kind === 'info') {
        this.showInfo(interaction.title, interaction.body.join('\n\n'), interaction.speaker);
      }
    }
  }

  private showInfo(title: string, body: string, speaker?: string): void {
    this.activeInfoHandler = null;
    this.interactionPanel.show({
      title,
      speaker,
      body,
      hint: 'Espace ou E pour fermer',
    });
  }

  private createDoorStatusTexts(): void {
    for (const objectView of this.objectViews) {
      if (!objectView.definition.portalMissionId) {
        continue;
      }

      const label = this.add.text(
        objectView.x,
        objectView.y + objectView.definition.height * 0.82,
        '',
        {
          fontFamily: 'Aptos, Segoe UI, sans-serif',
          fontSize: '16px',
          color: '#f2cc8f',
          backgroundColor: '#10232a',
          padding: {
            x: 8,
            y: 4,
          },
          align: 'center',
        },
      );
      label.setOrigin(0.5, 0);
      this.doorStatusTexts.set(objectView.definition.id, label);
    }

    this.refreshDoorStates();
  }
}
