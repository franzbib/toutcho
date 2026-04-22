import Phaser from 'phaser';

type PointLike = {
  x: number;
  y: number;
};

export function isWithinInteractionRange(source: PointLike, target: PointLike, range = 110): boolean {
  return Phaser.Math.Distance.Between(source.x, source.y, target.x, target.y) <= range;
}

