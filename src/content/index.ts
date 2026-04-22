import { interactions } from './dialogues';
import { lexiconEntries } from './lexicon';
import { locations } from './locations';
import { missions } from './missions';
import { signageEntries } from './signage';
import type { LocationDefinition, WorldObjectDefinition } from '../game/world/worldTypes';
import type { InteractionDefinition } from '../systems/interactions/interactionTypes';
import type { MissionDefinition } from '../systems/missions/missionTypes';
import type { LexiconEntry } from './lexicon';
import type { SignageDefinition } from './signage';

export const allMissions: MissionDefinition[] = missions;
export const allInteractions: InteractionDefinition[] = interactions;
export const allLocations: LocationDefinition[] = locations;
export const allSignageEntries: SignageDefinition[] = signageEntries;
export const allLexiconEntries: LexiconEntry[] = lexiconEntries;

export const firstMissionId = allMissions[0]?.id ?? null;

const missionMap = new Map(allMissions.map((mission) => [mission.id, mission]));
const interactionMap = new Map(allInteractions.map((interaction) => [interaction.id, interaction]));
const locationMap = new Map(allLocations.map((location) => [location.id, location]));
const signageMap = new Map(allSignageEntries.map((entry) => [entry.id, entry]));
const lexiconMap = new Map(allLexiconEntries.map((entry) => [entry.id, entry]));

export function getMission(missionId: string): MissionDefinition {
  const mission = missionMap.get(missionId);

  if (!mission) {
    throw new Error(`Unknown mission ${missionId}.`);
  }

  return mission;
}

export function getLocation(locationId: string): LocationDefinition {
  const location = locationMap.get(locationId);

  if (!location) {
    throw new Error(`Unknown location ${locationId}.`);
  }

  return location;
}

export function getInteraction(interactionId: string): InteractionDefinition {
  const interaction = interactionMap.get(interactionId);

  if (!interaction) {
    throw new Error(`Unknown interaction ${interactionId}.`);
  }

  return interaction;
}

export function getSignage(signageId: string): SignageDefinition {
  const signage = signageMap.get(signageId);

  if (!signage) {
    throw new Error(`Unknown signage ${signageId}.`);
  }

  return signage;
}

export function getLexiconEntry(entryId: string): LexiconEntry {
  const entry = lexiconMap.get(entryId);

  if (!entry) {
    throw new Error(`Unknown lexicon entry ${entryId}.`);
  }

  return entry;
}

export function getObjectFromLocation(locationId: string, objectId: string): WorldObjectDefinition | undefined {
  return getLocation(locationId).objects.find((object) => object.id === objectId);
}
