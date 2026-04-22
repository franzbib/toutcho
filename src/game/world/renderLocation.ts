import type Phaser from 'phaser';
import { WorldObjectView } from '../entities/WorldObjectView';
import type { LocationDefinition, LocationDecoration, RectArea } from './worldTypes';

export type RenderedLocation = {
  colliderGroup: Phaser.Physics.Arcade.StaticGroup;
  objectViews: WorldObjectView[];
};

function renderRect(scene: Phaser.Scene, rectLike: RectArea): Phaser.GameObjects.Rectangle {
  if (rectLike.shadowColor !== undefined) {
    const shadow = scene.add.rectangle(
      rectLike.x + (rectLike.shadowOffsetX ?? 6) + rectLike.width / 2,
      rectLike.y + (rectLike.shadowOffsetY ?? 8) + rectLike.height / 2,
      rectLike.width,
      rectLike.height,
      rectLike.shadowColor,
      rectLike.shadowAlpha ?? 0.18,
    );
    shadow.setDepth((rectLike.depth ?? 0) - 0.5);
  }

  const rect = scene.add.rectangle(
    rectLike.x + rectLike.width / 2,
    rectLike.y + rectLike.height / 2,
    rectLike.width,
    rectLike.height,
    rectLike.fillColor,
    rectLike.alpha ?? 1,
  );

  if (rectLike.strokeColor) {
    rect.setStrokeStyle(rectLike.strokeWidth ?? 2, rectLike.strokeColor);
  }

  rect.setDepth(rectLike.depth ?? 0);
  return rect;
}

function renderDecoration(scene: Phaser.Scene, decoration: LocationDecoration): void {
  switch (decoration.kind) {
    case 'rect': {
      const rect = renderRect(scene, decoration);

      if (decoration.label) {
        scene.add.text(
          rect.x + (decoration.labelOffsetX ?? 0),
          rect.y + (decoration.labelOffsetY ?? 0),
          decoration.label,
          {
          fontFamily: 'Aptos, Segoe UI, sans-serif',
          fontSize: `${decoration.labelSize ?? 18}px`,
          color: decoration.labelColor ?? '#17333a',
          fontStyle: decoration.labelFontStyle ?? 'normal',
          backgroundColor: decoration.labelBackgroundColor,
          padding: {
            x: decoration.labelPaddingX ?? 0,
            y: decoration.labelPaddingY ?? 0,
          },
          align: 'center',
          },
        ).setOrigin(0.5).setDepth((decoration.depth ?? 0) + 0.25);
      }
      break;
    }
    case 'circle': {
      const circle = scene.add.circle(decoration.x, decoration.y, decoration.radius, decoration.fillColor, decoration.alpha ?? 1);

      if (decoration.strokeColor) {
        circle.setStrokeStyle(decoration.strokeWidth ?? 2, decoration.strokeColor);
      }

      circle.setDepth(decoration.depth ?? 0);
      break;
    }
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
      line.setDepth(decoration.depth ?? 0);
      break;
    }
    case 'text':
      scene.add.text(decoration.x, decoration.y, decoration.text, {
        fontFamily: 'Aptos, Segoe UI, sans-serif',
        fontSize: `${decoration.fontSize ?? 18}px`,
        color: decoration.color ?? '#17333a',
        fontStyle: decoration.fontStyle ?? 'normal',
        backgroundColor: decoration.backgroundColor,
        padding: {
          x: decoration.paddingX ?? 0,
          y: decoration.paddingY ?? 0,
        },
        align: 'center',
      }).setOrigin(decoration.originX ?? 0, decoration.originY ?? 0).setDepth(decoration.depth ?? 0);
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
    const rect = renderRect(scene, collider);

    scene.physics.add.existing(rect, true);
    colliderGroup.add(rect);
  }

  const objectViews = location.objects.map((object) => new WorldObjectView(scene, object));

  return {
    colliderGroup,
    objectViews,
  };
}
