import type Phaser from 'phaser';
import { WorldObjectView } from '../entities/WorldObjectView';
import type { LocationDefinition, LocationDecoration } from './worldTypes';

export type RenderedLocation = {
  colliderGroup: Phaser.Physics.Arcade.StaticGroup;
  objectViews: WorldObjectView[];
};

function renderDecoration(scene: Phaser.Scene, decoration: LocationDecoration): void {
  switch (decoration.kind) {
    case 'rect': {
      const rect = scene.add.rectangle(
        decoration.x + decoration.width / 2,
        decoration.y + decoration.height / 2,
        decoration.width,
        decoration.height,
        decoration.fillColor,
        decoration.alpha ?? 1,
      );

      if (decoration.strokeColor) {
        rect.setStrokeStyle(decoration.strokeWidth ?? 2, decoration.strokeColor);
      }

      if (decoration.label) {
        scene.add.text(rect.x, rect.y, decoration.label, {
          fontFamily: 'Aptos, Segoe UI, sans-serif',
          fontSize: `${decoration.labelSize ?? 18}px`,
          color: decoration.labelColor ?? '#17333a',
          align: 'center',
        }).setOrigin(0.5);
      }
      break;
    }
    case 'circle':
      scene.add.circle(decoration.x, decoration.y, decoration.radius, decoration.fillColor, decoration.alpha ?? 1);
      break;
    case 'line': {
      const line = scene.add.line(
        0,
        0,
        decoration.x1,
        decoration.y1,
        decoration.x2,
        decoration.y2,
        decoration.color,
        decoration.alpha ?? 1,
      );
      line.setLineWidth(decoration.width, decoration.width);
      break;
    }
    case 'text':
      scene.add.text(decoration.x, decoration.y, decoration.text, {
        fontFamily: 'Aptos, Segoe UI, sans-serif',
        fontSize: `${decoration.fontSize ?? 18}px`,
        color: decoration.color ?? '#17333a',
        fontStyle: decoration.fontStyle ?? 'normal',
        align: 'center',
      }).setOrigin(decoration.originX ?? 0, decoration.originY ?? 0);
      break;
  }
}

export function renderLocation(scene: Phaser.Scene, location: LocationDefinition): RenderedLocation {
  scene.cameras.main.setBackgroundColor(location.backgroundColor);
  scene.add.rectangle(location.width / 2, location.height / 2, location.width, location.height, location.backgroundColor);

  for (const decoration of location.decorations) {
    renderDecoration(scene, decoration);
  }

  const colliderGroup = scene.physics.add.staticGroup();

  for (const collider of location.colliders) {
    const rect = scene.add.rectangle(
      collider.x + collider.width / 2,
      collider.y + collider.height / 2,
      collider.width,
      collider.height,
      collider.fillColor,
      collider.alpha ?? 1,
    );

    if (collider.strokeColor) {
      rect.setStrokeStyle(collider.strokeWidth ?? 2, collider.strokeColor);
    }

    scene.physics.add.existing(rect, true);
    colliderGroup.add(rect);
  }

  const objectViews = location.objects.map((object) => new WorldObjectView(scene, object));

  return {
    colliderGroup,
    objectViews,
  };
}
