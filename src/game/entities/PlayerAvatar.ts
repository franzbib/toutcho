import type Phaser from 'phaser';

const ACCELERATION = 1400;
const DRAG = 1800;
const MAX_SPEED = 280;

export class PlayerAvatar {
  public readonly bodyRect: Phaser.GameObjects.Rectangle;
  private readonly shadow: Phaser.GameObjects.Ellipse;
  private readonly accent: Phaser.GameObjects.Rectangle;
  private readonly physicsBody: Phaser.Physics.Arcade.Body;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    this.shadow = scene.add.ellipse(x, y + 18, 30, 14, 0x10232a, 0.22);
    this.bodyRect = scene.add.rectangle(x, y, 34, 44, 0xf7f1e4);
    this.bodyRect.setStrokeStyle(3, 0x17333a);
    this.accent = scene.add.rectangle(x, y + 9, 18, 8, 0xe07a5f);

    scene.physics.add.existing(this.bodyRect);

    this.physicsBody = this.bodyRect.body as Phaser.Physics.Arcade.Body;
    this.physicsBody.setCollideWorldBounds(true);
    this.physicsBody.setDrag(DRAG, DRAG);
    this.physicsBody.setMaxVelocity(MAX_SPEED, MAX_SPEED);
  }

  updateFromInput(direction: Phaser.Math.Vector2): void {
    this.physicsBody.setAcceleration(direction.x * ACCELERATION, direction.y * ACCELERATION);

    if (direction.lengthSq() === 0) {
      this.physicsBody.setAcceleration(0, 0);
    }

    this.sync();
  }

  freeze(): void {
    this.physicsBody.stop();
    this.physicsBody.setAcceleration(0, 0);
    this.sync();
  }

  sync(): void {
    this.shadow.setPosition(this.bodyRect.x, this.bodyRect.y + 18);
    this.accent.setPosition(this.bodyRect.x, this.bodyRect.y + 10);
  }

  get x(): number {
    return this.bodyRect.x;
  }

  get y(): number {
    return this.bodyRect.y;
  }

  destroy(): void {
    this.shadow.destroy();
    this.accent.destroy();
    this.bodyRect.destroy();
  }
}
