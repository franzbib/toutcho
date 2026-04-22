import { describe, expect, test } from 'vitest';
import {
  allInteractions,
  allLexiconEntries,
  allLocations,
  allMissions,
  allSignageEntries,
} from '../content';
import { validateGameContent } from '../systems/content/validateGameContent';

describe('validateGameContent', () => {
  test('retourne aucune erreur pour le contenu du prototype', () => {
    expect(validateGameContent({
      missions: allMissions,
      interactions: allInteractions,
      locations: allLocations,
      signage: allSignageEntries,
      lexicon: allLexiconEntries,
    })).toEqual([]);
  });
});

