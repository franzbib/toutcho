import Phaser from 'phaser';
import {
  allMissions,
  getInteraction,
  getLocation,
  getMission,
  getSignage,
  getObjectFromLocation,
} from '../../content';
import { SCENE_KEYS } from '../config/sceneKeys';
import { UI_COLORS } from '../config/theme';
import { playUiTone } from '../audio/playUiTone';
import { PlayerAvatar } from '../entities/PlayerAvatar';
import type { WorldObjectView } from '../entities/WorldObjectView';
import { createPlayerControls, getMovementVector, type PlayerControls } from '../input/createPlayerControls';
import { isWithinInteractionRange } from '../world/interactionZones';
import { renderLocation } from '../world/renderLocation';
import type { WorldObjectDefinition } from '../world/worldTypes';
import type { LanguageInteractionDefinition } from '../../systems/interactions/interactionTypes';
import { completeObjective, consumeItem, createMissionRun, getCurrentObjective, grantItem, hasItem, isMissionComplete, registerNavigationMistake, registerSolvedInteraction, registerWrongChoice, tickMissionTimer } from '../../systems/missions/missionState';
import { buildMissionOutcome } from '../../systems/missions/missionScoring';
import { getObjectiveLabel } from '../../systems/missions/objectiveHelpers';
import type { MissionDefinition, MissionRunState } from '../../systems/missions/missionTypes';
import { recordMissionOutcome } from '../../systems/save/saveStore';
import { getSession } from '../../state/gameSession';
import { persistSaveData } from '../../state/sessionHelpers';
import { ObjectiveBeacon } from '../../ui/mission/ObjectiveBeacon';
import { MissionHud } from '../../ui/mission/MissionHud';
import { InteractionPanel } from '../../ui/mission/InteractionPanel';
import { ObjectiveToast } from '../../ui/mission/ObjectiveToast';
import type { LocationDefinition } from '../world/worldTypes';

const ITEM_LABELS: Record<string, string> = {
  'insurance-certificate': "Attestation d'assurance",
  'fle-manual': 'Manuel B1',
  'blue-folder': 'Dossier bleu',
};

type InfoOverlayState = {
  mode: 'info';
  title: string;
  speaker?: string;
  body: string;
  feedback?: string;
  onClose?: () => void;
};

type ChoiceOverlayState = {
  mode: 'choice';
  objectId: string;
  interaction: LanguageInteractionDefinition;
  feedback?: string;
};

type OverlayState = InfoOverlayState | ChoiceOverlayState;

export class MissionScene extends Phaser.Scene {
  private controls!: PlayerControls;
  private player!: PlayerAvatar;
  private mission!: MissionDefinition;
  private location!: LocationDefinition;
  private runState!: MissionRunState;
  private objectViews: WorldObjectView[] = [];
  private hud!: MissionHud;
  private interactionPanel!: InteractionPanel;
  private objectiveBeacon!: ObjectiveBeacon;
  private objectiveToast!: ObjectiveToast;
  private interactionPrompt!: Phaser.GameObjects.Text;
  private overlayState: OverlayState | null = null;
  private finished = false;
  private lowTimeWarningShown = false;
  private collisionDebugKey?: Phaser.Input.Keyboard.Key;
  private collisionDebugShapes: Phaser.GameObjects.Rectangle[] = [];
  private collisionDebugVisible = false;

  constructor() {
    super(SCENE_KEYS.mission);
  }

  create(data: { missionId?: string } = {}): void {
    const missionId = data.missionId ?? getSession(this).saveData.currentMissionId ?? allMissions[0]?.id;

    if (!missionId) {
      this.scene.start(SCENE_KEYS.menu);
      return;
    }

    this.finished = false;
    this.lowTimeWarningShown = false;
    this.mission = getMission(missionId);
    this.location = getLocation(this.mission.locationId);
    this.runState = createMissionRun(this.mission);

    const rendered = renderLocation(this, this.location);

    this.objectViews = rendered.objectViews;
    this.player = new PlayerAvatar(this, this.location.playerSpawn.x, this.location.playerSpawn.y);
    this.player.bodyRect.setDepth(3);
    this.physics.add.collider(this.player.bodyRect, rendered.colliderGroup);

    this.controls = createPlayerControls(this);
    this.hud = new MissionHud(this);
    this.interactionPanel = new InteractionPanel(this);
    this.objectiveBeacon = new ObjectiveBeacon(this);
    this.objectiveToast = new ObjectiveToast(this);

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

    this.add.text(1240, 24, 'ZQSD / WASD / flèches • E : interagir • 1/2/3 : choisir', {
      fontFamily: 'Aptos, Segoe UI, sans-serif',
      fontSize: '17px',
      color: UI_COLORS.cream,
      backgroundColor: '#10232a',
      padding: {
        x: 12,
        y: 6,
      },
    }).setOrigin(1, 0).setScrollFactor(0);

    this.cameras.main.setBounds(0, 0, this.location.width, this.location.height);
    this.cameras.main.startFollow(this.player.bodyRect, true, 0.08, 0.08);
    this.setupCollisionDebug();

    this.refreshHud();
    this.openInfoOverlay({
      title: this.mission.title,
      body: this.mission.brief,
      feedback: 'La mission commence dès que tu fermes ce panneau.',
      onClose: () => {
        this.objectiveToast.show(`Objectif : ${getCurrentObjective(this.mission, this.runState)?.label ?? ''}`);
      },
    });
  }

  update(_: number, delta: number): void {
    if (this.finished) {
      return;
    }

    if (this.collisionDebugKey && Phaser.Input.Keyboard.JustDown(this.collisionDebugKey)) {
      this.toggleCollisionDebug();
    }

    if (this.overlayState) {
      this.player.freeze();
      this.objectiveBeacon.hide();
      this.objectiveToast.hide();
      this.interactionPrompt.setVisible(false);
      this.handleOverlayInput();
      return;
    }

    this.runState = tickMissionTimer(this.runState, delta / 1000);
    this.refreshHud();

    if (!this.lowTimeWarningShown && this.runState.timeRemainingSeconds <= 20) {
      this.lowTimeWarningShown = true;
      playUiTone(this, 'error');
      this.objectiveToast.show('Plus que 20 secondes.', 'info', 1500);
    }

    if (this.runState.timeRemainingSeconds <= 0) {
      this.finishMission(false);
      return;
    }

    this.player.updateFromInput(getMovementVector(this.controls));
    this.checkReachObjective();
    this.objectiveBeacon.update(this.getCurrentTargetPoint(), this.getCurrentTargetShortLabel());

    const nearestObject = this.findNearestObject();

    this.objectViews.forEach((view) => {
      view.setHighlighted(view === nearestObject);
      view.setDisabled(this.isObjectDisabled(view.definition));
    });

    if (nearestObject) {
      this.interactionPrompt.setVisible(true);
      this.interactionPrompt.setText(`${nearestObject.definition.prompt} : ${nearestObject.definition.label.replace('\n', ' ')}`);

      if (
        Phaser.Input.Keyboard.JustDown(this.controls.interact) ||
        Phaser.Input.Keyboard.JustDown(this.controls.confirm)
      ) {
        this.handleObjectInteraction(nearestObject.definition);
      }
    } else {
      this.interactionPrompt.setVisible(false);
    }
  }

  private findNearestObject(): WorldObjectView | null {
    let nearestObject: WorldObjectView | null = null;
    let nearestDistance = Number.POSITIVE_INFINITY;

    for (const objectView of this.objectViews) {
      if (this.isObjectDisabled(objectView.definition)) {
        continue;
      }

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

  private isObjectDisabled(object: WorldObjectDefinition): boolean {
    return Boolean(object.rewardItemId && hasItem(this.runState, object.rewardItemId));
  }

  private handleObjectInteraction(object: WorldObjectDefinition): void {
    if (object.requiredItemId && !hasItem(this.runState, object.requiredItemId)) {
      this.openInfoOverlay({
        title: object.label,
        body: object.missingItemText ?? "Il te manque encore l'objet demandé.",
      });
      return;
    }

    if (object.signageId) {
      const sign = getSignage(object.signageId);
      const shouldComplete = getCurrentObjective(this.mission, this.runState)?.targetId === object.id;

      this.openInfoOverlay({
        title: sign.title,
        body: sign.body.join('\n\n'),
        feedback: shouldComplete ? 'Information utile repérée.' : undefined,
        onClose: () => {
          if (shouldComplete) {
            this.completeObjectiveForTarget(object.id);
          }
        },
      });
      return;
    }

    if (!object.interactionId) {
      return;
    }

    const interaction = getInteraction(object.interactionId);

    if (interaction.kind === 'info') {
      const currentObjective = getCurrentObjective(this.mission, this.runState);

      if (currentObjective?.kind === 'reach' && currentObjective.targetId !== object.id && object.kind === 'door') {
        this.runState = registerNavigationMistake(this.runState, 4);
        this.refreshHud();
        this.objectiveToast.show('Mauvaise porte : -4 s');
      }

      this.openInfoOverlay({
        title: interaction.title,
        speaker: interaction.speaker,
        body: interaction.body.join('\n\n'),
      });
      return;
    }

    this.overlayState = {
      mode: 'choice',
      objectId: object.id,
      interaction,
    };

    this.prepareOverlayDisplay();
    this.interactionPanel.show({
      title: interaction.context,
      speaker: interaction.speaker,
      body: interaction.prompt,
      options: interaction.options.map((option) => option.text),
      hint: 'Touches 1, 2 ou 3',
    });
  }

  private handleOverlayInput(): void {
    if (!this.overlayState) {
      return;
    }

    if (this.overlayState.mode === 'info') {
      if (
        Phaser.Input.Keyboard.JustDown(this.controls.interact) ||
        Phaser.Input.Keyboard.JustDown(this.controls.confirm) ||
        Phaser.Input.Keyboard.JustDown(this.controls.pause)
      ) {
        const onClose = this.overlayState.onClose;
        this.overlayState = null;
        this.interactionPanel.hide();
        onClose?.();
      }

      return;
    }

    const interaction = this.overlayState.interaction;
    const optionIndex = this.getChoiceIndex(interaction.options.length);

    if (optionIndex === null) {
      return;
    }

    const option = interaction.options[optionIndex];

    if (!option) {
      return;
    }

    if (option.id !== interaction.correctOptionId) {
      playUiTone(this, 'error');
      this.runState = registerWrongChoice(this.runState, interaction.id, option.penaltySeconds);
      this.refreshHud();

      this.overlayState = {
        ...this.overlayState,
        feedback: option.feedback,
      };

      this.interactionPanel.show({
        title: interaction.context,
        speaker: interaction.speaker,
        body: interaction.prompt,
        options: interaction.options.map((entry) => entry.text),
        feedback: option.feedback,
        hint: interaction.retryOnIncorrect ? 'Réessaie avec 1, 2 ou 3' : 'Touches 1, 2 ou 3',
      });
      return;
    }

    playUiTone(this, 'success');
    this.runState = registerSolvedInteraction(this.runState, interaction.id);

    const object = getObjectFromLocation(this.mission.locationId, this.overlayState.objectId);
    const feedbackNotes: string[] = [interaction.explanation];

    if (object?.rewardItemId) {
      this.runState = grantItem(this.runState, object.rewardItemId);
      feedbackNotes.push(`Objet ajouté : ${ITEM_LABELS[object.rewardItemId] ?? object.rewardItemId}.`);
    }

    if (object?.requiredItemId && object.consumeItemOnSuccess) {
      this.runState = consumeItem(this.runState, object.requiredItemId);
      feedbackNotes.push(`Objet remis : ${ITEM_LABELS[object.requiredItemId] ?? object.requiredItemId}.`);
    }

    const shouldComplete = getCurrentObjective(this.mission, this.runState)?.targetId === this.overlayState.objectId;

    if (shouldComplete) {
      this.completeCurrentObjective(false);
    }

    this.refreshHud();
    const nextObjective = getCurrentObjective(this.mission, this.runState);

    this.openInfoOverlay({
      title: interaction.context,
      speaker: interaction.speaker,
      body: interaction.successText,
      feedback: feedbackNotes.join('\n'),
      onClose: () => {
        if (isMissionComplete(this.mission, this.runState)) {
          this.finishMission(true);
          return;
        }

        if (nextObjective) {
          this.objectiveToast.show(`Objectif : ${nextObjective.label}`, 'success');
        }
      },
    });
  }

  private getChoiceIndex(choiceCount: number): number | null {
    if (choiceCount >= 1 && Phaser.Input.Keyboard.JustDown(this.controls.choice1)) {
      return 0;
    }

    if (choiceCount >= 2 && Phaser.Input.Keyboard.JustDown(this.controls.choice2)) {
      return 1;
    }

    if (choiceCount >= 3 && Phaser.Input.Keyboard.JustDown(this.controls.choice3)) {
      return 2;
    }

    return null;
  }

  private openInfoOverlay(payload: Omit<InfoOverlayState, 'mode'>): void {
    this.overlayState = {
      mode: 'info',
      ...payload,
    };

    this.prepareOverlayDisplay();
    this.interactionPanel.show({
      title: payload.title,
      speaker: payload.speaker,
      body: payload.body,
      feedback: payload.feedback,
      hint: 'Espace ou E pour continuer',
    });
  }

  private completeObjectiveForTarget(targetId: string): void {
    const currentObjective = getCurrentObjective(this.mission, this.runState);

    if (!currentObjective || currentObjective.targetId !== targetId) {
      return;
    }

    this.completeCurrentObjective();
    this.refreshHud();

    if (isMissionComplete(this.mission, this.runState)) {
      this.finishMission(true);
    }
  }

  private checkReachObjective(): void {
    const currentObjective = getCurrentObjective(this.mission, this.runState);
    const mission1FinalZone = this.location.reachZones.find((candidate) => candidate.id === 'm1-zone-c4');

    if (
      this.mission.id === 'hall-notice' &&
      currentObjective?.id === 'confirm-corridor' &&
      mission1FinalZone &&
      this.isPlayerInsideReachZone(mission1FinalZone)
    ) {
      this.runState = completeObjective(this.runState, 'confirm-corridor');
      this.runState = completeObjective(this.runState, 'reach-classroom');
      this.refreshHud();
      this.finishMission(true);
      return;
    }

    if (currentObjective?.kind !== 'reach') {
      return;
    }

    const zone = this.location.reachZones.find((candidate) => candidate.id === currentObjective.targetId);

    if (!zone) {
      return;
    }

    if (this.isPlayerInsideReachZone(zone)) {
      this.completeCurrentObjective();
      this.refreshHud();

      if (isMissionComplete(this.mission, this.runState)) {
        this.finishMission(true);
      }
    }
  }

  private refreshHud(): void {
    const completedCount = this.runState.completedObjectiveIds.length;
    const inventoryText =
      this.runState.inventory.length > 0
        ? `Inventaire : ${this.runState.inventory.map((itemId) => ITEM_LABELS[itemId] ?? itemId).join(', ')}`
        : 'Inventaire : vide';

    this.hud.update({
      title: this.mission.title,
      subtitle: this.location.subtitle,
      objective: getObjectiveLabel(this.mission, this.runState),
      progressText: `Étapes : ${completedCount}/${this.mission.objectives.length}`,
      timeLeftSeconds: this.runState.timeRemainingSeconds,
      inventoryText,
    });
  }

  private completeCurrentObjective(showToast = true): void {
    const previousObjective = getCurrentObjective(this.mission, this.runState);

    if (!previousObjective) {
      return;
    }

    this.runState = completeObjective(this.runState, previousObjective.id);
    const nextObjective = getCurrentObjective(this.mission, this.runState);

    if (!showToast) {
      return;
    }

    if (nextObjective) {
      this.objectiveToast.show(`Nouvel objectif : ${nextObjective.label}`, 'success');
      return;
    }

    this.objectiveToast.show('Tous les objectifs sont validés.', 'success');
  }

  private prepareOverlayDisplay(): void {
    this.interactionPrompt.setVisible(false);
    this.objectiveToast.hide();
    this.objectiveBeacon.hide();
  }

  private setupCollisionDebug(): void {
    if (!import.meta.env.DEV) {
      return;
    }

    const keyboard = this.input.keyboard;

    if (!keyboard) {
      return;
    }

    this.collisionDebugKey = keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.F8);

    const colliderShapes = this.location.colliders.map((collider) => {
      const rect = this.add.rectangle(
        collider.x + collider.width / 2,
        collider.y + collider.height / 2,
        collider.width,
        collider.height,
        0xd62839,
        0.18,
      );
      rect.setStrokeStyle(2, 0xff4d6d, 0.9);
      rect.setDepth(40);
      rect.setVisible(false);
      return rect;
    });

    const zoneShapes = this.location.reachZones.map((zone) => {
      const rect = this.add.rectangle(
        zone.x + zone.width / 2,
        zone.y + zone.height / 2,
        zone.width,
        zone.height,
        0x2a9d8f,
        0.14,
      );
      rect.setStrokeStyle(2, 0x2a9d8f, 0.9);
      rect.setDepth(40);
      rect.setVisible(false);
      return rect;
    });

    this.collisionDebugShapes = [...colliderShapes, ...zoneShapes];
  }

  private toggleCollisionDebug(): void {
    this.collisionDebugVisible = !this.collisionDebugVisible;
    this.collisionDebugShapes.forEach((shape) => {
      shape.setVisible(this.collisionDebugVisible);
    });
  }

  private getCurrentTargetPoint(): { x: number; y: number } | null {
    const currentObjective = getCurrentObjective(this.mission, this.runState);

    if (!currentObjective) {
      return null;
    }

    if (this.isMission1FinalNavigationStep()) {
      if (this.hasEnteredMission1SearchZone()) {
        return null;
      }

      return {
        x: 1440,
        y: 560,
      };
    }

    const object = this.location.objects.find((candidate) => candidate.id === currentObjective.targetId);

    if (object) {
      return {
        x: object.x,
        y: object.y,
      };
    }

    const zone = this.location.reachZones.find((candidate) => candidate.id === currentObjective.targetId);

    if (zone) {
      return {
        x: zone.x + zone.width / 2,
        y: zone.y + zone.height / 2,
      };
    }

    return null;
  }

  private getCurrentTargetShortLabel(): string {
    const currentObjective = getCurrentObjective(this.mission, this.runState);

    if (!currentObjective) {
      return 'But';
    }

    if (this.isMission1FinalNavigationStep()) {
      return 'Couloir C';
    }

    const object = this.location.objects.find((candidate) => candidate.id === currentObjective.targetId);

    if (object) {
      return object.label.replace('\n', ' ');
    }

    const zone = this.location.reachZones.find((candidate) => candidate.id === currentObjective.targetId);
    return zone?.label ?? 'But';
  }

  private isMission1FinalNavigationStep(): boolean {
    return this.mission.id === 'hall-notice' && getCurrentObjective(this.mission, this.runState)?.id === 'reach-classroom';
  }

  private hasEnteredMission1SearchZone(): boolean {
    return this.player.x >= 1420 && this.player.y >= 450 && this.player.y <= 850;
  }

  private isPlayerInsideReachZone(zone: { x: number; y: number; width: number; height: number }): boolean {
    const zoneRect = new Phaser.Geom.Rectangle(zone.x, zone.y, zone.width, zone.height);
    return zoneRect.contains(this.player.x, this.player.y);
  }

  private finishMission(success: boolean): void {
    if (this.finished) {
      return;
    }

    this.finished = true;
    const outcome = buildMissionOutcome(this.mission.id, this.runState, success);
    const nextSave = recordMissionOutcome(getSession(this).saveData, allMissions, outcome);
    persistSaveData(this, nextSave);

    this.scene.start(SCENE_KEYS.result, {
      missionId: this.mission.id,
      outcome,
    });
  }
}
