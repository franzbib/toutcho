import type Phaser from 'phaser';
import { createPanel } from '../common/createPanel';

export type InteractionPanelPayload = {
  title: string;
  speaker?: string;
  body: string;
  options?: string[];
  feedback?: string;
  hint: string;
};

export class InteractionPanel {
  private readonly panel: Phaser.GameObjects.Rectangle;
  private readonly titleText: Phaser.GameObjects.Text;
  private readonly speakerText: Phaser.GameObjects.Text;
  private readonly bodyText: Phaser.GameObjects.Text;
  private readonly optionsText: Phaser.GameObjects.Text;
  private readonly feedbackText: Phaser.GameObjects.Text;
  private readonly hintText: Phaser.GameObjects.Text;

  constructor(scene: Phaser.Scene) {
    this.panel = createPanel(scene, 640, 605, 1200, 210, 0x10232a, 0.94);
    this.panel.setScrollFactor(0);

    this.titleText = scene.add.text(66, 512, '', {
      fontFamily: 'Aptos, Segoe UI, sans-serif',
      fontSize: '24px',
      color: '#9fd0c7',
      fontStyle: 'bold',
    }).setScrollFactor(0);

    this.speakerText = scene.add.text(66, 544, '', {
      fontFamily: 'Aptos, Segoe UI, sans-serif',
      fontSize: '18px',
      color: '#f2cc8f',
    }).setScrollFactor(0);

    this.bodyText = scene.add.text(66, 578, '', {
      fontFamily: 'Aptos, Segoe UI, sans-serif',
      fontSize: '24px',
      color: '#f8f2e6',
      wordWrap: {
        width: 700,
      },
    }).setScrollFactor(0);

    this.optionsText = scene.add.text(835, 570, '', {
      fontFamily: 'Aptos, Segoe UI, sans-serif',
      fontSize: '20px',
      color: '#f8f2e6',
      wordWrap: {
        width: 320,
      },
    }).setScrollFactor(0);

    this.feedbackText = scene.add.text(66, 676, '', {
      fontFamily: 'Aptos, Segoe UI, sans-serif',
      fontSize: '17px',
      color: '#f2cc8f',
      wordWrap: {
        width: 820,
      },
    }).setScrollFactor(0);

    this.hintText = scene.add.text(1160, 680, '', {
      fontFamily: 'Aptos, Segoe UI, sans-serif',
      fontSize: '16px',
      color: '#f8f2e6',
      align: 'right',
    }).setOrigin(1, 0).setScrollFactor(0);

    this.hide();
  }

  show(payload: InteractionPanelPayload): void {
    this.titleText.setText(payload.title);
    this.speakerText.setText(payload.speaker ?? '');
    this.bodyText.setText(payload.body);
    this.optionsText.setText(payload.options?.map((option, index) => `${index + 1}. ${option}`).join('\n\n') ?? '');
    this.feedbackText.setText(payload.feedback ?? '');
    this.hintText.setText(payload.hint);
    this.setVisible(true);
  }

  hide(): void {
    this.setVisible(false);
  }

  isVisible(): boolean {
    return this.panel.visible;
  }

  private setVisible(visible: boolean): void {
    this.panel.setVisible(visible);
    this.titleText.setVisible(visible);
    this.speakerText.setVisible(visible);
    this.bodyText.setVisible(visible);
    this.optionsText.setVisible(visible);
    this.feedbackText.setVisible(visible);
    this.hintText.setVisible(visible);
  }
}
