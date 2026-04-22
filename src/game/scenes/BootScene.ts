import Phaser from 'phaser';
import {
  allInteractions,
  allLexiconEntries,
  allLocations,
  allMissions,
  allSignageEntries,
} from '../../content';
import { SCENE_KEYS } from '../config/sceneKeys';
import { validateGameContent } from '../../systems/content/validateGameContent';
import { createSaveStore, setSaveStore } from '../../systems/save/saveStore';
import { createGameSession, setSession } from '../../state/gameSession';

export class BootScene extends Phaser.Scene {
  constructor() {
    super(SCENE_KEYS.boot);
  }

  create(): void {
    const contentErrors = validateGameContent({
      missions: allMissions,
      interactions: allInteractions,
      locations: allLocations,
      signage: allSignageEntries,
      lexicon: allLexiconEntries,
    });

    if (contentErrors.length > 0) {
      this.cameras.main.setBackgroundColor('#22181c');
      this.add.text(40, 40, `Erreurs de contenu :\n\n${contentErrors.join('\n')}`, {
        fontFamily: 'Consolas, monospace',
        fontSize: '18px',
        color: '#f8f2e6',
        wordWrap: {
          width: 1180,
        },
      });
      throw new Error(contentErrors.join('\n'));
    }

    const saveStore = createSaveStore(allMissions);
    const saveData = saveStore.load();

    setSaveStore(this, saveStore);
    setSession(this, createGameSession(saveData));

    this.scene.start(SCENE_KEYS.menu);
  }
}

