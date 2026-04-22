import type Phaser from 'phaser';

type TargetPoint = {
  x: number;
  y: number;
};

export class ObjectiveBeacon {
  private readonly worldRing: Phaser.GameObjects.Ellipse;
  private readonly edgeArrow: Phaser.GameObjects.Triangle;
  private readonly edgeLabel: Phaser.GameObjects.Text;

  constructor(private readonly scene: Phaser.Scene) {
    this.worldRing = scene.add.ellipse(0, 0, 92, 46);
    this.worldRing.setStrokeStyle(3, 0xf2cc8f, 0.95);
    this.worldRing.setFillStyle(0xf2cc8f, 0.08);
    this.worldRing.setVisible(false);

    this.edgeArrow = scene.add.triangle(0, 0, 0, 22, 36, 0, 0, -22, 0xf2cc8f, 0.94);
    this.edgeArrow.setStrokeStyle(2, 0x17333a);
    this.edgeArrow.setScrollFactor(0);
    this.edgeArrow.setVisible(false);

    this.edgeLabel = scene.add.text(0, 0, '', {
      fontFamily: 'Aptos, Segoe UI, sans-serif',
      fontSize: '15px',
      color: '#f8f2e6',
      backgroundColor: '#10232a',
      padding: {
        x: 8,
        y: 4,
      },
    });
    this.edgeLabel.setOrigin(0.5);
    this.edgeLabel.setScrollFactor(0);
    this.edgeLabel.setVisible(false);

    scene.tweens.add({
      targets: this.worldRing,
      scaleX: 1.12,
      scaleY: 1.12,
      alpha: 0.65,
      duration: 820,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });
  }

  update(target: TargetPoint | null, shortLabel: string): void {
    if (!target) {
      this.hide();
      return;
    }

    const camera = this.scene.cameras.main;
    const screenX = target.x - camera.worldView.x;
    const screenY = target.y - camera.worldView.y;
    const isVisibleInCamera = camera.worldView.contains(target.x, target.y);

    if (isVisibleInCamera) {
      this.worldRing.setVisible(true);
      this.worldRing.setPosition(target.x, target.y + 8);
      this.edgeArrow.setVisible(false);
      this.edgeLabel.setVisible(false);
      return;
    }

    this.worldRing.setVisible(false);

    const centerX = camera.width / 2;
    const centerY = camera.height / 2;
    const dx = screenX - centerX;
    const dy = screenY - centerY;
    const angle = Math.atan2(dy, dx);
    const radiusX = camera.width / 2 - 76;
    const radiusY = camera.height / 2 - 92;
    const edgeX = centerX + Math.cos(angle) * radiusX;
    const edgeY = centerY + Math.sin(angle) * radiusY;

    this.edgeArrow.setVisible(true);
    this.edgeArrow.setPosition(edgeX, edgeY);
    this.edgeArrow.setRotation(angle + Math.PI / 2);

    this.edgeLabel.setVisible(true);
    this.edgeLabel.setText(shortLabel);
    this.edgeLabel.setPosition(
      centerX + Math.cos(angle) * (radiusX - 84),
      centerY + Math.sin(angle) * (radiusY - 64),
    );
  }

  hide(): void {
    this.worldRing.setVisible(false);
    this.edgeArrow.setVisible(false);
    this.edgeLabel.setVisible(false);
  }
}

