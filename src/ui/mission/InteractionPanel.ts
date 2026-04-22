import type Phaser from 'phaser';
import { createPanel } from '../common/createPanel';

const OVERLAY_DEPTH = 220;
const PANEL_WIDTH = 1080;
const PANEL_HEIGHT = 560;
const PANEL_X = 640;
const PANEL_Y = 392;
const LEFT_X = 116;
const CONTENT_WIDTH = 960;

export type InteractionPanelPayload = {
  title: string;
  speaker?: string;
  body: string;
  options?: string[];
  feedback?: string;
  hint: string;
};

export class InteractionPanel {
  private readonly backdrop: Phaser.GameObjects.Rectangle;
  private readonly panelShadow: Phaser.GameObjects.Rectangle;
  private readonly panel: Phaser.GameObjects.Rectangle;
  private readonly headerBand: Phaser.GameObjects.Rectangle;
  private readonly accentBar: Phaser.GameObjects.Rectangle;
  private readonly titleText: Phaser.GameObjects.Text;
  private readonly speakerText: Phaser.GameObjects.Text;
  private readonly bodyText: Phaser.GameObjects.Text;
  private readonly optionTexts: Phaser.GameObjects.Text[];
  private readonly feedbackText: Phaser.GameObjects.Text;
  private readonly hintText: Phaser.GameObjects.Text;

  constructor(scene: Phaser.Scene) {
    this.backdrop = scene.add.rectangle(640, 360, 1280, 720, 0x051219, 0.66);
    this.backdrop.setScrollFactor(0);
    this.backdrop.setDepth(OVERLAY_DEPTH);

    this.panelShadow = scene.add.rectangle(PANEL_X + 10, PANEL_Y + 12, PANEL_WIDTH, PANEL_HEIGHT, 0x000000, 0.24);
    this.panelShadow.setScrollFactor(0);
    this.panelShadow.setDepth(OVERLAY_DEPTH + 1);

    this.panel = createPanel(scene, PANEL_X, PANEL_Y, PANEL_WIDTH, PANEL_HEIGHT, 0x10232a, 0.985);
    this.panel.setDepth(OVERLAY_DEPTH + 2);

    this.headerBand = scene.add.rectangle(PANEL_X, 130, PANEL_WIDTH, 78, 0x17333a, 0.94);
    this.headerBand.setScrollFactor(0);
    this.headerBand.setDepth(OVERLAY_DEPTH + 3);

    this.accentBar = scene.add.rectangle(92, PANEL_Y, 12, PANEL_HEIGHT - 64, 0xf2cc8f, 0.95);
    this.accentBar.setScrollFactor(0);
    this.accentBar.setDepth(OVERLAY_DEPTH + 4);

    this.titleText = scene.add.text(LEFT_X, 104, '', {
      fontFamily: 'Aptos, Segoe UI, sans-serif',
      fontSize: '28px',
      color: '#f8f2e6',
      fontStyle: 'bold',
      wordWrap: {
        width: CONTENT_WIDTH,
        useAdvancedWrap: true,
      },
    }).setScrollFactor(0).setDepth(OVERLAY_DEPTH + 5);

    this.speakerText = scene.add.text(LEFT_X, 146, '', {
      fontFamily: 'Aptos, Segoe UI, sans-serif',
      fontSize: '18px',
      color: '#f2cc8f',
      fontStyle: 'bold',
      backgroundColor: '#21424b',
      padding: {
        x: 10,
        y: 5,
      },
    }).setScrollFactor(0).setDepth(OVERLAY_DEPTH + 5);

    this.bodyText = scene.add.text(LEFT_X, 194, '', {
      fontFamily: 'Aptos, Segoe UI, sans-serif',
      fontSize: '22px',
      color: '#f8f2e6',
      wordWrap: {
        width: CONTENT_WIDTH,
        useAdvancedWrap: true,
      },
      lineSpacing: 8,
    }).setScrollFactor(0).setDepth(OVERLAY_DEPTH + 5);

    this.optionTexts = [0, 1, 2].map(() => scene.add.text(LEFT_X, 0, '', {
      fontFamily: 'Aptos, Segoe UI, sans-serif',
      fontSize: '20px',
      color: '#f8f2e6',
      backgroundColor: '#17333a',
      wordWrap: {
        width: CONTENT_WIDTH - 8,
        useAdvancedWrap: true,
      },
      padding: {
        x: 14,
        y: 10,
      },
      lineSpacing: 6,
    }).setScrollFactor(0).setDepth(OVERLAY_DEPTH + 5));

    this.feedbackText = scene.add.text(LEFT_X, 0, '', {
      fontFamily: 'Aptos, Segoe UI, sans-serif',
      fontSize: '18px',
      color: '#f2cc8f',
      wordWrap: {
        width: CONTENT_WIDTH,
        useAdvancedWrap: true,
      },
      lineSpacing: 6,
    }).setScrollFactor(0).setDepth(OVERLAY_DEPTH + 5);

    this.hintText = scene.add.text(1128, 0, '', {
      fontFamily: 'Aptos, Segoe UI, sans-serif',
      fontSize: '16px',
      color: '#d7ede8',
      align: 'right',
      backgroundColor: '#21424b',
      padding: {
        x: 10,
        y: 6,
      },
    }).setOrigin(1, 0).setScrollFactor(0).setDepth(OVERLAY_DEPTH + 5);

    this.hide();
  }

  show(payload: InteractionPanelPayload): void {
    this.titleText.setText(payload.title);
    this.speakerText.setText(payload.speaker ?? '');
    this.bodyText.setText(payload.body);
    this.feedbackText.setText(payload.feedback ?? '');
    this.hintText.setText(payload.hint);

    let y = 104;
    this.titleText.setPosition(LEFT_X, y);
    y += this.titleText.height + 14;

    if (payload.speaker) {
      this.speakerText.setPosition(LEFT_X, y);
      this.speakerText.setVisible(true);
      y += this.speakerText.height + 18;
    } else {
      this.speakerText.setVisible(false);
    }

    this.bodyText.setPosition(LEFT_X, y);
    y += this.bodyText.height + 24;

    for (const [index, optionText] of this.optionTexts.entries()) {
      const option = payload.options?.[index];

      if (!option) {
        optionText.setText('');
        optionText.setVisible(false);
        continue;
      }

      optionText.setText(`${index + 1}. ${option}`);
      optionText.setPosition(LEFT_X, y);
      optionText.setVisible(true);
      y += optionText.height + 14;
    }

    if (payload.feedback) {
      this.feedbackText.setPosition(LEFT_X, y);
      this.feedbackText.setVisible(true);
      y += this.feedbackText.height + 18;
    } else {
      this.feedbackText.setVisible(false);
    }

    this.hintText.setPosition(1128, Math.min(598, y));
    this.setVisible(true);
  }

  hide(): void {
    this.setVisible(false);
  }

  isVisible(): boolean {
    return this.panel.visible;
  }

  private setVisible(visible: boolean): void {
    this.backdrop.setVisible(visible);
    this.panelShadow.setVisible(visible);
    this.panel.setVisible(visible);
    this.headerBand.setVisible(visible);
    this.accentBar.setVisible(visible);
    this.titleText.setVisible(visible);
    this.speakerText.setVisible(visible && Boolean(this.speakerText.text));
    this.bodyText.setVisible(visible);
    this.optionTexts.forEach((optionText) => {
      optionText.setVisible(visible && Boolean(optionText.text));
    });
    this.feedbackText.setVisible(visible && Boolean(this.feedbackText.text));
    this.hintText.setVisible(visible);
  }
}
