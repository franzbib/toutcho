import type Phaser from 'phaser';
import { createPanel } from '../common/createPanel';

type ToastTone = 'info' | 'success';

export class ObjectiveToast {
  private readonly panel: Phaser.GameObjects.Rectangle;
  private readonly text: Phaser.GameObjects.Text;
  private hideTimer?: Phaser.Time.TimerEvent;

  constructor(private readonly scene: Phaser.Scene) {
    this.panel = createPanel(scene, 640, 196, 560, 58, 0x10232a, 0.94);
    this.text = scene.add.text(640, 196, '', {
      fontFamily: 'Aptos, Segoe UI, sans-serif',
      fontSize: '20px',
      color: '#f8f2e6',
      fontStyle: 'bold',
      align: 'center',
    }).setOrigin(0.5).setScrollFactor(0);

    this.hide();
  }

  show(message: string, tone: ToastTone = 'info', durationMs = 1700): void {
    this.hideTimer?.remove(false);

    this.panel.setFillStyle(tone === 'success' ? 0x214e4a : 0x10232a, 0.94);
    this.panel.setVisible(true);
    this.text.setColor(tone === 'success' ? '#c8f0d3' : '#f2cc8f');
    this.text.setText(message);
    this.text.setVisible(true);

    this.scene.tweens.killTweensOf([this.panel, this.text]);
    this.panel.setAlpha(0);
    this.text.setAlpha(0);
    this.scene.tweens.add({
      targets: [this.panel, this.text],
      alpha: 1,
      duration: 140,
      ease: 'Quad.easeOut',
    });

    this.hideTimer = this.scene.time.delayedCall(durationMs, () => {
      this.scene.tweens.add({
        targets: [this.panel, this.text],
        alpha: 0,
        duration: 220,
        ease: 'Quad.easeIn',
        onComplete: () => {
          this.hide();
        },
      });
    });
  }

  hide(): void {
    this.panel.setVisible(false);
    this.text.setVisible(false);
    this.panel.setAlpha(1);
    this.text.setAlpha(1);
  }
}
