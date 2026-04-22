import type Phaser from 'phaser';
import { createPanel } from '../common/createPanel';

type MissionHudPayload = {
  title: string;
  subtitle: string;
  objective: string;
  progressText: string;
  timeLeftSeconds: number;
  inventoryText: string;
};

export class MissionHud {
  private readonly titleText: Phaser.GameObjects.Text;
  private readonly subtitleText: Phaser.GameObjects.Text;
  private readonly objectiveText: Phaser.GameObjects.Text;
  private readonly progressText: Phaser.GameObjects.Text;
  private readonly timerText: Phaser.GameObjects.Text;
  private readonly inventoryText: Phaser.GameObjects.Text;

  constructor(scene: Phaser.Scene) {
    createPanel(scene, 245, 96, 450, 160);
    createPanel(scene, 1100, 52, 260, 68, 0x10232a, 0.94);
    createPanel(scene, 1100, 118, 260, 68, 0x10232a, 0.94);

    this.titleText = scene.add.text(36, 28, '', {
      fontFamily: 'Aptos, Segoe UI, sans-serif',
      fontSize: '26px',
      color: '#f8f2e6',
      fontStyle: 'bold',
    }).setScrollFactor(0);

    this.subtitleText = scene.add.text(36, 58, '', {
      fontFamily: 'Aptos, Segoe UI, sans-serif',
      fontSize: '16px',
      color: '#9fd0c7',
    }).setScrollFactor(0);

    this.objectiveText = scene.add.text(36, 82, '', {
      fontFamily: 'Aptos, Segoe UI, sans-serif',
      fontSize: '18px',
      color: '#f8f2e6',
      wordWrap: {
        width: 380,
      },
    }).setScrollFactor(0);

    this.progressText = scene.add.text(36, 130, '', {
      fontFamily: 'Aptos, Segoe UI, sans-serif',
      fontSize: '16px',
      color: '#f2cc8f',
    }).setScrollFactor(0);

    this.timerText = scene.add.text(1100, 52, '', {
      fontFamily: 'Aptos, Segoe UI, sans-serif',
      fontSize: '24px',
      color: '#f2cc8f',
      align: 'center',
    }).setOrigin(0.5).setScrollFactor(0);

    this.inventoryText = scene.add.text(1100, 118, '', {
      fontFamily: 'Aptos, Segoe UI, sans-serif',
      fontSize: '18px',
      color: '#9fd0c7',
      align: 'center',
    }).setOrigin(0.5).setScrollFactor(0);
  }

  update(payload: MissionHudPayload): void {
    this.titleText.setText(payload.title);
    this.subtitleText.setText(payload.subtitle);
    this.objectiveText.setText(payload.objective);
    this.progressText.setText(payload.progressText);
    this.timerText.setText(`Temps : ${Math.max(0, Math.ceil(payload.timeLeftSeconds))} s`);
    this.timerText.setColor(payload.timeLeftSeconds <= 20 ? '#ffb4a2' : '#f2cc8f');
    this.inventoryText.setText(payload.inventoryText);
  }
}
