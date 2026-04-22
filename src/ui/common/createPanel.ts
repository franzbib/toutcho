import type Phaser from 'phaser';

export function createPanel(
  scene: Phaser.Scene,
  x: number,
  y: number,
  width: number,
  height: number,
  fillColor = 0x10232a,
  alpha = 0.9,
): Phaser.GameObjects.Rectangle {
  const panel = scene.add.rectangle(x, y, width, height, fillColor, alpha);
  panel.setStrokeStyle(1, 0xf8f2e6, 0.14);
  panel.setScrollFactor(0);
  return panel;
}
