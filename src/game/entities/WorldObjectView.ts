import type Phaser from 'phaser';
import type { WorldObjectDefinition } from '../world/worldTypes';

const LABEL_STYLE = {
  fontFamily: 'Aptos, Segoe UI, sans-serif',
  fontSize: '18px',
  color: '#17333a',
  backgroundColor: '#f8f2e6',
  padding: {
    x: 8,
    y: 3,
  },
};

export class WorldObjectView {
  public readonly definition: WorldObjectDefinition;
  public readonly container: Phaser.GameObjects.Container;
  private readonly mainShape: Phaser.GameObjects.Shape;

  constructor(scene: Phaser.Scene, definition: WorldObjectDefinition) {
    this.definition = definition;
    this.container = scene.add.container(definition.x, definition.y);
    this.container.setDepth(6);

    const shadow = scene.add.ellipse(0, definition.height * 0.36, definition.width * 0.62, 16, 0x10232a, 0.16);
    this.mainShape = this.createBaseShape(scene, definition);
    const details = this.createDetails(scene, definition);
    const children: Phaser.GameObjects.GameObject[] = [shadow, this.mainShape, ...details];

    if (definition.showLabel !== false) {
      const label = scene.add.text(0, -definition.height * 0.74, definition.label, LABEL_STYLE);
      label.setOrigin(0.5);
      label.setAlign('center');
      children.push(label);
    }

    this.container.add(children);
  }

  get x(): number {
    return this.container.x;
  }

  get y(): number {
    return this.container.y;
  }

  setHighlighted(isHighlighted: boolean): void {
    this.mainShape.setStrokeStyle(isHighlighted ? 4 : 2, isHighlighted ? 0xf2cc8f : 0x17333a);
    this.container.setScale(isHighlighted ? 1.04 : 1);
  }

  setDisabled(isDisabled: boolean): void {
    this.container.setAlpha(isDisabled ? 0.45 : 1);
  }

  private createBaseShape(scene: Phaser.Scene, definition: WorldObjectDefinition): Phaser.GameObjects.Shape {
    const color = definition.accentColor ?? 0x4d908e;
    const width = definition.width;
    const height = definition.height;

    switch (definition.kind) {
      case 'npc': {
        const body = scene.add.ellipse(0, 8, width * 0.7, height * 0.62, color);
        body.setStrokeStyle(2, 0x17333a);
        return body;
      }
      case 'sign': {
        const sign = scene.add.rectangle(0, -height * 0.1, width, height * 0.58, color);
        sign.setStrokeStyle(2, 0x17333a);
        return sign;
      }
      case 'message': {
        const phone = scene.add.rectangle(0, 0, width, height, color);
        phone.setStrokeStyle(2, 0x17333a);
        return phone;
      }
      case 'door': {
        const door = scene.add.rectangle(0, 0, width, height, color);
        door.setStrokeStyle(2, 0x17333a);
        return door;
      }
      case 'board': {
        const board = scene.add.rectangle(0, 0, width, height, color);
        board.setStrokeStyle(2, 0x17333a);
        return board;
      }
      case 'locker':
      case 'desk':
      case 'counter':
      case 'kiosk':
      case 'resource':
      default: {
        const rectangle = scene.add.rectangle(0, 0, width, height, color);
        rectangle.setStrokeStyle(2, 0x17333a);
        return rectangle;
      }
    }
  }

  private createDetails(scene: Phaser.Scene, definition: WorldObjectDefinition): Phaser.GameObjects.GameObject[] {
    const width = definition.width;
    const height = definition.height;

    switch (definition.kind) {
      case 'npc': {
        const head = scene.add.circle(0, -height * 0.34, Math.max(14, Math.min(width, height) * 0.18), 0xf3c9a1);
        head.setStrokeStyle(2, 0x17333a);

        const shoulders = scene.add.ellipse(0, -2, width * 0.42, height * 0.16, 0xf8f2e6, 0.85);
        return [head, shoulders];
      }
      case 'board': {
        const inner = scene.add.rectangle(0, 0, width - 18, height - 18, 0xf7f2e8);
        inner.setStrokeStyle(1, 0x30545d, 0.3);

        const noticeA = scene.add.rectangle(-width * 0.2, -height * 0.16, width * 0.28, height * 0.28, 0xfffaee);
        const noticeB = scene.add.rectangle(width * 0.16, -height * 0.16, width * 0.24, height * 0.24, 0xfef3d4);
        const noticeC = scene.add.rectangle(-width * 0.04, height * 0.18, width * 0.42, height * 0.22, 0xf2f0fb);
        const pinA = scene.add.circle(-width * 0.2, -height * 0.28, 4, 0xe56b6f);
        const pinB = scene.add.circle(width * 0.16, -height * 0.26, 4, 0x4d908e);
        const pinC = scene.add.circle(-width * 0.04, height * 0.08, 4, 0xf2cc8f);
        return [inner, noticeA, noticeB, noticeC, pinA, pinB, pinC];
      }
      case 'sign': {
        const plaqueInset = scene.add.rectangle(0, -height * 0.1, width - 14, height * 0.4, 0xf8f2e6);
        plaqueInset.setStrokeStyle(1, 0x17333a, 0.2);
        const post = scene.add.rectangle(0, height * 0.22, Math.max(12, width * 0.12), height * 0.38, 0x6a5b4d);
        return [plaqueInset, post];
      }
      case 'message': {
        const screen = scene.add.rectangle(0, -8, width - 16, height - 28, 0xf4f8fb);
        screen.setStrokeStyle(1, 0x17333a, 0.24);
        const bar = scene.add.rectangle(0, height * 0.33, width * 0.3, 6, 0xf8f2e6, 0.8);
        return [screen, bar];
      }
      case 'door': {
        const panel = scene.add.rectangle(0, 4, width - 18, height - 26, 0xc79b6c, 0.65);
        panel.setStrokeStyle(1, 0x17333a, 0.18);
        const plaque = scene.add.rectangle(0, -height * 0.34, width * 0.5, 18, 0xf8f2e6);
        const handle = scene.add.circle(width * 0.22, 8, 5, 0xf2cc8f);
        return [panel, plaque, handle];
      }
      case 'locker':
      case 'counter':
      case 'desk':
      case 'kiosk':
      case 'resource':
      default: {
        const top = scene.add.rectangle(0, -height * 0.18, width - 12, height * 0.22, 0xf8f2e6, 0.7);
        const shelf = scene.add.rectangle(0, height * 0.1, width - 16, 6, 0x17333a, 0.14);
        return [top, shelf];
      }
    }
  }
}
