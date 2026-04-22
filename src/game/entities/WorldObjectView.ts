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

    const shadow = scene.add.ellipse(0, definition.height * 0.35, definition.width * 0.6, 14, 0x10232a, 0.16);
    this.mainShape = this.createShape(scene, definition);
    const label = scene.add.text(0, -definition.height * 0.68, definition.label, LABEL_STYLE);
    label.setOrigin(0.5);
    label.setAlign('center');

    this.container.add([shadow, this.mainShape, label]);
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

  private createShape(scene: Phaser.Scene, definition: WorldObjectDefinition): Phaser.GameObjects.Shape {
    const color = definition.accentColor ?? 0x4d908e;
    const width = definition.width;
    const height = definition.height;

    switch (definition.kind) {
      case 'npc': {
        const npc = scene.add.ellipse(0, 0, width, height, color);
        npc.setStrokeStyle(2, 0x17333a);
        return npc;
      }
      case 'board':
      case 'sign':
      case 'message': {
        const board = scene.add.rectangle(0, 0, width, height, color);
        board.setStrokeStyle(2, 0x17333a);
        return board;
      }
      case 'door': {
        const door = scene.add.rectangle(0, 0, width, height, color);
        door.setStrokeStyle(2, 0x17333a);
        return door;
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
}
