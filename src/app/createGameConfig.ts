import Phaser from 'phaser';
import { GAME_HEIGHT, GAME_WIDTH } from '../game/config/viewport';
import { BootScene } from '../game/scenes/BootScene';
import { CreditsScene } from '../game/scenes/CreditsScene';
import { HubScene } from '../game/scenes/HubScene';
import { IntroScene } from '../game/scenes/IntroScene';
import { MenuScene } from '../game/scenes/MenuScene';
import { MissionSelectScene } from '../game/scenes/MissionSelectScene';
import { MissionScene } from '../game/scenes/MissionScene';
import { OptionsScene } from '../game/scenes/OptionsScene';
import { ResultScene } from '../game/scenes/ResultScene';
import { SummaryScene } from '../game/scenes/SummaryScene';

export function createGameConfig(): Phaser.Types.Core.GameConfig {
  return {
    type: Phaser.AUTO,
    parent: 'game-root',
    width: GAME_WIDTH,
    height: GAME_HEIGHT,
    backgroundColor: '#10232a',
    fps: {
      target: 60,
      forceSetTimeOut: false,
    },
    physics: {
      default: 'arcade',
      arcade: {
        debug: false,
      },
    },
    scene: [
      BootScene,
      MenuScene,
      OptionsScene,
      IntroScene,
      HubScene,
      MissionSelectScene,
      MissionScene,
      ResultScene,
      SummaryScene,
      CreditsScene,
    ],
    scale: {
      mode: Phaser.Scale.FIT,
      autoCenter: Phaser.Scale.CENTER_BOTH,
    },
    render: {
      antialias: true,
      pixelArt: false,
    },
  };
}
