import type { InteractionDefinition } from '../interactions/interactionTypes';
import type { MissionDefinition } from '../missions/missionTypes';
import type { LocationDefinition } from '../../game/world/worldTypes';
import type { SignageDefinition } from '../../content/signage';
import type { LexiconEntry } from '../../content/lexicon';

function requireNonEmpty(value: string, label: string, errors: string[]): void {
  if (!value.trim()) {
    errors.push(`${label} must not be empty.`);
  }
}

function collectDuplicateIds(entries: Array<{ id: string }>, label: string, errors: string[]): void {
  const seen = new Set<string>();

  for (const entry of entries) {
    if (seen.has(entry.id)) {
      errors.push(`Duplicate ${label} id: ${entry.id}`);
    }

    seen.add(entry.id);
  }
}

export function validateGameContent(input: {
  missions: MissionDefinition[];
  interactions: InteractionDefinition[];
  locations: LocationDefinition[];
  signage: SignageDefinition[];
  lexicon: LexiconEntry[];
}): string[] {
  const errors: string[] = [];
  const interactionIds = new Set(input.interactions.map((entry) => entry.id));
  const locationIds = new Set(input.locations.map((entry) => entry.id));
  const signageIds = new Set(input.signage.map((entry) => entry.id));
  const lexiconIds = new Set(input.lexicon.map((entry) => entry.id));

  collectDuplicateIds(input.missions, 'mission', errors);
  collectDuplicateIds(input.interactions, 'interaction', errors);
  collectDuplicateIds(input.locations, 'location', errors);
  collectDuplicateIds(input.signage, 'signage', errors);
  collectDuplicateIds(input.lexicon, 'lexicon', errors);

  for (const mission of input.missions) {
    requireNonEmpty(mission.id, 'Mission id', errors);
    requireNonEmpty(mission.title, `Mission ${mission.id} title`, errors);
    requireNonEmpty(mission.brief, `Mission ${mission.id} brief`, errors);

    if (!locationIds.has(mission.locationId)) {
      errors.push(`Mission ${mission.id} references unknown location ${mission.locationId}.`);
    }

    for (const vocabularyId of mission.vocabularyIds) {
      if (!lexiconIds.has(vocabularyId)) {
        errors.push(`Mission ${mission.id} references unknown lexicon entry ${vocabularyId}.`);
      }
    }
  }

  for (const interaction of input.interactions) {
    requireNonEmpty(interaction.id, 'Interaction id', errors);

    if (interaction.kind === 'choice') {
      requireNonEmpty(interaction.prompt, `Interaction ${interaction.id} prompt`, errors);
      requireNonEmpty(interaction.explanation, `Interaction ${interaction.id} explanation`, errors);

      if (interaction.options.length < 2 || interaction.options.length > 3) {
        errors.push(`Interaction ${interaction.id} must expose between 2 and 3 options.`);
      }

      const optionIds = new Set<string>();

      for (const option of interaction.options) {
        requireNonEmpty(option.id, `Interaction ${interaction.id} option id`, errors);
        requireNonEmpty(option.text, `Interaction ${interaction.id} option text`, errors);
        requireNonEmpty(option.feedback, `Interaction ${interaction.id} option feedback`, errors);

        if (optionIds.has(option.id)) {
          errors.push(`Interaction ${interaction.id} has duplicate option id ${option.id}.`);
        }

        optionIds.add(option.id);
      }

      if (!optionIds.has(interaction.correctOptionId)) {
        errors.push(`Interaction ${interaction.id} has no valid correct option id.`);
      }
    } else {
      requireNonEmpty(interaction.title, `Info interaction ${interaction.id} title`, errors);

      if (interaction.body.length === 0) {
        errors.push(`Info interaction ${interaction.id} must have at least one body line.`);
      }
    }
  }

  for (const location of input.locations) {
    requireNonEmpty(location.id, 'Location id', errors);
    requireNonEmpty(location.name, `Location ${location.id} name`, errors);

    const objectIds = new Set<string>();
    const zoneIds = new Set<string>();

    for (const object of location.objects) {
      requireNonEmpty(object.id, `Location ${location.id} object id`, errors);
      requireNonEmpty(object.label, `Location ${location.id} object ${object.id} label`, errors);

      if (objectIds.has(object.id)) {
        errors.push(`Location ${location.id} has duplicate object id ${object.id}.`);
      }

      objectIds.add(object.id);

      if (object.interactionId && !interactionIds.has(object.interactionId)) {
        errors.push(`Object ${object.id} references unknown interaction ${object.interactionId}.`);
      }

      if (object.signageId && !signageIds.has(object.signageId)) {
        errors.push(`Object ${object.id} references unknown signage ${object.signageId}.`);
      }
    }

    for (const zone of location.reachZones) {
      requireNonEmpty(zone.id, `Location ${location.id} zone id`, errors);

      if (zoneIds.has(zone.id)) {
        errors.push(`Location ${location.id} has duplicate reach zone id ${zone.id}.`);
      }

      zoneIds.add(zone.id);
    }

    for (const mission of input.missions.filter((entry) => entry.locationId === location.id)) {
      for (const objective of mission.objectives) {
        const targetExists = objectIds.has(objective.targetId) || zoneIds.has(objective.targetId);

        if (!targetExists) {
          errors.push(`Mission ${mission.id} objective ${objective.id} references missing target ${objective.targetId}.`);
        }
      }
    }
  }

  for (const sign of input.signage) {
    requireNonEmpty(sign.id, 'Signage id', errors);
    requireNonEmpty(sign.title, `Signage ${sign.id} title`, errors);

    if (!locationIds.has(sign.locationId)) {
      errors.push(`Signage ${sign.id} references unknown location ${sign.locationId}.`);
    }
  }

  for (const lexiconEntry of input.lexicon) {
    requireNonEmpty(lexiconEntry.id, 'Lexicon id', errors);
    requireNonEmpty(lexiconEntry.term, `Lexicon ${lexiconEntry.id} term`, errors);
    requireNonEmpty(lexiconEntry.meaning, `Lexicon ${lexiconEntry.id} meaning`, errors);
    requireNonEmpty(lexiconEntry.example, `Lexicon ${lexiconEntry.id} example`, errors);
  }

  return errors;
}
