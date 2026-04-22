# Architecture

## Vue d’ensemble

Le projet sépare strictement :

- le moteur de jeu
- la logique réutilisable
- le contenu pédagogique

Objectif : ajouter des missions et des interactions sans réécrire le cœur technique.

## Graphe des scènes

```text
Boot
  -> Menu
      -> Intro
          -> Hub
              -> Mission
                  -> Result
                      -> Mission suivante | Hub | Summary
      -> Missions
      -> Options
      -> Credits
```

## Modèle de mission

Source :

- [src/content/missions.ts](</C:/Users/franz/OneDrive/Desktop/toutcho/src/content/missions.ts>)

Chaque mission définit :

- un id
- un ordre
- un lieu
- un temps limite
- une suite d’objectifs
- des points d’apprentissage
- une liste de vocabulaire
- la mission suivante à débloquer

Les objectifs restent simples :

- `reach`
- `inspect`
- `talk`
- `choose`
- `collect`
- `deliver`

## Modèle d’interaction linguistique

Source :

- [src/content/dialogues.ts](</C:/Users/franz/OneDrive/Desktop/toutcho/src/content/dialogues.ts>)

Deux familles :

- `info`
- `choice`

Les interactions `choice` portent :

- un contexte
- un prompt
- 2 à 3 options
- un `correctOptionId`
- une explication courte
- des métadonnées CECRL / focus linguistique / registre / mission

Le moteur applique :

- réussite : progression + parfois objet reçu
- erreur : feedback court + pénalité de temps + retry rapide

## Modèle de monde

Source :

- [src/game/world/worldTypes.ts](</C:/Users/franz/OneDrive/Desktop/toutcho/src/game/world/worldTypes.ts>)
- [src/content/locations/](</C:/Users/franz/OneDrive/Desktop/toutcho/src/content/locations>)

Chaque lieu contient :

- décorations visuelles
- colliders
- objets interactifs
- zones de reach

Le rendu est volontairement shape-based :

- rectangles
- cercles
- textes
- panneaux stylisés

## Sauvegarde

Source :

- [src/systems/save/saveStore.ts](</C:/Users/franz/OneDrive/Desktop/toutcho/src/systems/save/saveStore.ts>)
- [src/systems/save/saveTypes.ts](</C:/Users/franz/OneDrive/Desktop/toutcho/src/systems/save/saveTypes.ts>)

La sauvegarde persiste :

- intro vue ou non
- mission courante
- missions débloquées
- missions terminées
- meilleurs résultats par mission
- réglages utilisateur

## Validation de contenu

Source :

- [src/systems/content/validateGameContent.ts](</C:/Users/franz/OneDrive/Desktop/toutcho/src/systems/content/validateGameContent.ts>)

Le boot valide notamment :

- ids dupliqués
- références de lieux inconnues
- références d’interactions inconnues
- objectifs pointant vers des objets ou zones absents
- options vides
- absence d’option correcte

## Points d’extension

- ajouter de nouveaux lieux dans `src/content/locations/`
- ajouter de nouvelles interactions dans `src/content/dialogues.ts`
- enrichir le hub avec plus de PNJ ou d’objets
- ajouter de nouvelles missions sans toucher au système de base
- remplacer plus tard les formes stylisées par des assets dédiés si nécessaire

