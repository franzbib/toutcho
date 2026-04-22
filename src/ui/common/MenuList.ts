import Phaser from 'phaser';
import { playUiTone } from '../../game/audio/playUiTone';
import { UI_COLORS } from '../../game/config/theme';

export type MenuItemDefinition = {
  label: string;
  onSelect: () => void;
  enabled?: boolean;
  description?: string;
};

export class MenuList {
  private readonly buttons: Phaser.GameObjects.Text[] = [];
  private readonly items: MenuItemDefinition[];
  private selectedIndex = 0;

  constructor(
    private readonly scene: Phaser.Scene,
    items: MenuItemDefinition[],
    x: number,
    startY: number,
    gap = 74,
  ) {
    this.items = items;

    items.forEach((item, index) => {
      const button = scene.add.text(x, startY + index * gap, item.label, {
        fontFamily: 'Aptos, Segoe UI, sans-serif',
        fontSize: '30px',
        color: UI_COLORS.ink,
        backgroundColor: UI_COLORS.cream,
        padding: {
          x: 20,
          y: 10,
        },
      });
      button.setOrigin(0.5);
      button.setInteractive({ useHandCursor: item.enabled !== false });

      button.on('pointerover', () => {
        if (item.enabled === false) {
          return;
        }

        if (this.selectedIndex !== index) {
          playUiTone(this.scene, 'move');
        }

        this.selectedIndex = index;
        this.refresh();
      });

      button.on('pointerdown', () => {
        if (item.enabled === false) {
          return;
        }

        playUiTone(this.scene, 'confirm');
        item.onSelect();
      });

      this.buttons.push(button);
    });

    this.selectedIndex = this.findNextEnabledIndex(0, 1);
    this.refresh();
  }

  move(delta: number): void {
    const nextIndex = this.findNextEnabledIndex(this.selectedIndex + delta, delta >= 0 ? 1 : -1);

    if (nextIndex !== this.selectedIndex) {
      this.selectedIndex = nextIndex;
      playUiTone(this.scene, 'move');
      this.refresh();
    }
  }

  activateSelected(): void {
    const item = this.items[this.selectedIndex];

    if (item && item.enabled !== false) {
      playUiTone(this.scene, 'confirm');
      item.onSelect();
    }
  }

  getSelectedItem(): MenuItemDefinition | undefined {
    return this.items[this.selectedIndex];
  }

  setSelectedIndex(index: number): void {
    if (!this.items[index] || this.items[index].enabled === false) {
      return;
    }

    this.selectedIndex = index;
    this.refresh();
  }

  destroy(): void {
    this.buttons.forEach((button) => button.destroy());
  }

  private findNextEnabledIndex(seed: number, direction: 1 | -1): number {
    if (this.items.every((item) => item.enabled === false)) {
      return 0;
    }

    let index = Phaser.Math.Wrap(seed, 0, this.items.length);

    while (this.items[index]?.enabled === false) {
      index = Phaser.Math.Wrap(index + direction, 0, this.items.length);
    }

    return index;
  }

  private refresh(): void {
    this.buttons.forEach((button, index) => {
      const item = this.items[index];
      const selected = index === this.selectedIndex && item.enabled !== false;

      button.setAlpha(item.enabled === false ? 0.45 : 1);
      button.setColor(selected ? UI_COLORS.cream : UI_COLORS.ink);
      button.setBackgroundColor(selected ? UI_COLORS.teal : UI_COLORS.cream);
      button.setScale(selected ? 1.03 : 1);
    });
  }
}
