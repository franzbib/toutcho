# MISSION ISPA : URGENCE À AMIENS

Prototype de jeu éducatif top-down 2D, desktop-first, construit avec Phaser 3 et TypeScript.

Le joueur incarne un étudiant international à Amiens. Pour avancer, il doit se déplacer, lire la signalétique, parler aux bonnes personnes, choisir des formulations crédibles en français et gérer une légère pression temporelle dans des micro-missions réalistes.

## Stack

- Vite
- TypeScript
- Phaser 3
- Vitest
- ESLint

## Installer

```bash
npm install
```

## Lancer en développement

```bash
npm run dev
```

## Builder

```bash
npm run build
npm run preview
```

## Vérifications qualité

```bash
npm run lint
npm run typecheck
npm run test
```

## Contrôles

- déplacement : `ZQSD`, `WASD` ou flèches
- interaction : `E` ou `Espace`
- choix linguistiques : `1`, `2`, `3`
- menus : flèches + `Entrée`
- retour menu / fermer certains panneaux : `Échap`
- menus souris : clic sur les boutons

## Contenu du prototype

Le prototype inclut :

- boot + validation de contenu
- menu principal complet
- écran options / contrôles
- scène d’introduction
- hub jouable dans le hall d’ISPA
- 4 missions complètes
- écran debrief par mission
- écran de résumé final
- sauvegarde locale
- progression débloquée mission par mission
- sons d’interface synthétiques très légers, désactivables

## Missions disponibles

1. `Hall + panneau d'affichage`
2. `Document au secrétariat`
3. `Ressource à la bibliothèque`
4. `Urgence en ville`

## Architecture du contenu

Le contenu pédagogique reste séparé du moteur :

- [src/content/missions.ts](</C:/Users/franz/OneDrive/Desktop/toutcho/src/content/missions.ts>) : définition des missions, objectifs, temps, points appris
- [src/content/dialogues.ts](</C:/Users/franz/OneDrive/Desktop/toutcho/src/content/dialogues.ts>) : interactions linguistiques et dialogues courts
- [src/content/signage.ts](</C:/Users/franz/OneDrive/Desktop/toutcho/src/content/signage.ts>) : panneaux, repères, signalétique
- [src/content/lexicon.ts](</C:/Users/franz/OneDrive/Desktop/toutcho/src/content/lexicon.ts>) : vocabulaire utile pour les debriefs
- [src/content/locations/](</C:/Users/franz/OneDrive/Desktop/toutcho/src/content/locations>) : cartes compactes et objets de monde

## Ajouter une mission

1. Ajouter une mission dans [src/content/missions.ts](</C:/Users/franz/OneDrive/Desktop/toutcho/src/content/missions.ts>)
2. Ajouter les interactions dans [src/content/dialogues.ts](</C:/Users/franz/OneDrive/Desktop/toutcho/src/content/dialogues.ts>)
3. Ajouter la carte dans [src/content/locations/](</C:/Users/franz/OneDrive/Desktop/toutcho/src/content/locations>)
4. Ajouter la signalétique utile dans [src/content/signage.ts](</C:/Users/franz/OneDrive/Desktop/toutcho/src/content/signage.ts>) si nécessaire
5. Ajouter le lexique associé dans [src/content/lexicon.ts](</C:/Users/franz/OneDrive/Desktop/toutcho/src/content/lexicon.ts>)
6. Vérifier que les ids se correspondent : mission, objets, interactions, zones, vocabulaire
7. Lancer `npm run test` et `npm run typecheck`

## Sauvegarde

La progression est stockée en local via `localStorage` sous la clé :

- `mission-ispa.save.v1`

Elle contient :

- missions débloquées
- missions terminées
- meilleurs scores / temps / précision
- mission courante
- réglages `mute` et `animations réduites`

## QA manuelle conseillée

- démarrer une nouvelle partie depuis le menu
- finir la mission 1 puis vérifier le déblocage de la mission 2
- tester au moins un mauvais choix linguistique par mission
- vérifier que le temps diminue et que les pénalités s’appliquent
- vérifier le debrief et le résumé final
- couper puis réactiver le son dans les options
- réinitialiser la progression depuis le menu

## Limitations connues

- pas d’assets dessinés externes : les décors sont stylisés par formes et couleurs
- pas de reprise en plein milieu d’une mission : la sauvegarde reprend la progression globale
- pas d’e2e navigateur : les tests sont centrés sur la validation de contenu et la logique de progression

