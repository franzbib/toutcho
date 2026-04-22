# PLAN.md

## Stack retenue

- Vite
- TypeScript
- Phaser 3
- Vitest
- ESLint

Cette stack reste la meilleure option ici : elle est légère, adaptée à un jeu 2D top-down, simple à déployer en application statique et assez modulaire pour séparer proprement moteur, UI et contenu pédagogique.

## Vision produit

Construire un prototype jouable et cohérent de **MISSION ISPA : URGENCE À AMIENS** :

- jeu desktop-first au clavier
- boucle action + navigation + interactions courtes
- apprentissage du français intégré aux missions
- ton réaliste, adulte, crédible
- quatre missions complètes, rejouables, avec progression sauvegardée

Le prototype doit ressembler à une vraie première vertical slice, pas à un quiz habillé en jeu.

## Architecture proposée

Le projet sera organisé en couches simples et extensibles.

### 1. App

Responsabilité :

- configurer Phaser
- enregistrer les scènes
- démarrer le jeu

Fichiers pressentis :

- `src/app/game.ts`
- `src/app/createGameConfig.ts`

### 2. Game / rendu / input

Responsabilité :

- scènes Phaser
- déplacement joueur
- collisions
- caméra
- prompts d’interaction
- rendu des maps compactes

Fichiers pressentis :

- `src/game/scenes/*`
- `src/game/entities/*`
- `src/game/input/*`
- `src/game/world/*`
- `src/game/config/*`

### 3. Systems / logique réutilisable

Responsabilité :

- état des missions
- score
- timer
- interactions linguistiques
- validation de contenu
- sauvegarde locale

Fichiers pressentis :

- `src/systems/missions/*`
- `src/systems/interactions/*`
- `src/systems/save/*`
- `src/systems/content/*`

### 4. UI

Responsabilité :

- menu principal
- listes navigables au clavier
- HUD de mission
- panneau d’interaction
- écrans debrief / résumé

Fichiers pressentis :

- `src/ui/common/*`
- `src/ui/mission/*`

### 5. Content

Responsabilité :

- missions
- dialogues / interactions à choix
- signalétique
- lexique
- maps et objets du monde

Règle non négociable :

- tout le contenu pédagogique et linguistique vit dans `src/content/`
- le moteur n’embarque pas le français pédagogique en dur si ce contenu peut être exprimé en données

## Arborescence cible

```text
src/
├─ app/
├─ content/
│  ├─ index.ts
│  ├─ missions.ts
│  ├─ dialogues.ts
│  ├─ signage.ts
│  ├─ lexicon.ts
│  └─ locations/
├─ game/
│  ├─ config/
│  ├─ entities/
│  ├─ input/
│  ├─ scenes/
│  └─ world/
├─ state/
├─ styles/
├─ systems/
│  ├─ content/
│  ├─ interactions/
│  ├─ missions/
│  └─ save/
└─ ui/
   ├─ common/
   └─ mission/
```

## Gameplay loop

Boucle de jeu principale :

1. Le joueur lit un brief court.
2. Il entre dans une zone compacte.
3. Il se déplace, observe les panneaux, parle à un PNJ ou récupère un objet.
4. Il rencontre une interaction linguistique courte, liée à l’objectif en cours.
5. Un bon choix donne de l’information, du temps ou valide l’objectif.
6. Un mauvais choix coûte un peu de temps et affiche une explication courte.
7. L’objectif suivant s’active.
8. La mission se termine par un debrief avec score, temps et rappel pédagogique.
9. La progression débloque la mission suivante.

Principes de design :

- peu d’interruptions longues
- navigation lisible
- feedback immédiat
- erreurs pardonnables
- français naturel et plausible

## Liste des scènes

### `BootScene`

- initialise la session
- charge ou crée la sauvegarde
- valide le contenu
- démarre le menu

### `MenuScene`

- `Commencer`
- `Continuer`
- `Missions`
- `Options et contrôles`
- `Réinitialiser la progression`
- `Crédits`

### `OptionsScene`

- rappel des contrôles
- mute on/off
- animations réduites on/off

### `IntroScene`

- contexte narratif initial
- mise en place de la journée urgente à Amiens

### `HubScene`

- hall intérieur ISPA
- point de transition entre les missions
- accès aux missions débloquées
- PNJ de repère

### `MissionScene`

Scène réutilisable pilotée par les données :

- charge une mission par `missionId`
- rend la map correspondante
- gère déplacement, collisions, timer, objectifs, objets, dialogues et interactions

### `MissionSelectScene`

- rejouer une mission débloquée
- voir état verrouillé / disponible / terminée

### `ResultScene`

- succès ou échec
- score
- temps restant
- ce qui a été appris
- retry / suivant / retour au hub

### `SummaryScene`

- bilan final
- progression globale
- score total
- missions rejouables

### `CreditsScene`

- crédits du prototype

## Modèle de données

### Missions

```ts
type MissionDefinition = {
  id: string;
  order: number;
  title: string;
  shortTitle: string;
  brief: string;
  successSummary: string;
  failureSummary: string;
  locationId: string;
  timeLimitSeconds: number;
  objectives: MissionObjective[];
  learnedPoints: string[];
  vocabularyIds: string[];
  nextMissionId?: string;
};

type MissionObjective = {
  id: string;
  kind: 'reach' | 'inspect' | 'talk' | 'choose' | 'collect' | 'deliver';
  label: string;
  targetId: string;
  requiredItemId?: string;
};
```

### Interactions linguistiques

```ts
type LanguageInteractionDefinition = {
  id: string;
  context: string;
  prompt: string;
  speaker?: string;
  options: LanguageOption[];
  correctOptionId: string;
  explanation: string;
  retryOnIncorrect: boolean;
  successText: string;
  metadata: {
    cefr: 'B1';
    skillType: 'speaking' | 'reading' | 'navigation';
    linguisticFocus: string;
    registerFocus: string;
    missionId: string;
    tags: string[];
  };
};

type LanguageOption = {
  id: string;
  text: string;
  feedback: string;
  penaltySeconds: number;
};
```

### Signalétique et lexique

```ts
type SignageDefinition = {
  id: string;
  locationId: string;
  title: string;
  body: string[];
};

type LexiconEntry = {
  id: string;
  term: string;
  meaning: string;
  example: string;
};
```

### Monde / map

```ts
type LocationDefinition = {
  id: string;
  name: string;
  subtitle: string;
  width: number;
  height: number;
  playerSpawn: { x: number; y: number };
  decorations: LocationDecoration[];
  colliders: RectArea[];
  objects: WorldObjectDefinition[];
  reachZones: ReachZoneDefinition[];
};
```

## Missions prévues

### Mission 1. Hall + panneau d’affichage

- parler à un autre étudiant
- consulter le bon panneau
- trouver la bonne salle à temps

### Mission 2. Dépôt de document au secrétariat

- choisir le bon document
- rejoindre le secrétariat
- employer une formulation polie et adaptée

### Mission 3. Bibliothèque / soutien

- lire les panneaux
- demander une information
- identifier la bonne ressource

### Mission 4. Changement d’emploi du temps en ville

- comprendre un message bref
- demander une clarification
- récupérer la bonne information ou le bon dossier
- atteindre le bon lieu avant la fin

## Ordre d’implémentation

### Phase 1. Refonte propre du scaffold

- enrichir `PLAN.md`
- consolider les types
- poser le modèle de sauvegarde et de progression
- poser le modèle de contenu

### Phase 2. Fondations réutilisables

- système de menus clavier/souris
- HUD de mission
- panneau d’interaction
- joueur avec collisions et interaction radius
- renderer de lieux compacts

### Phase 3. Progression et validation

- validation du contenu au boot
- sauvegarde locale
- score
- debrief mission
- résumé final

### Phase 4. Contenu jouable

- hub ISPA
- mission 1 complète
- mission 2 complète
- mission 3 complète
- mission 4 complète

### Phase 5. Finition

- options / contrôles
- mission select
- crédits
- polish visuel
- documentation complète

## Commandes prévues

Installation :

```bash
npm install
```

Développement :

```bash
npm run dev
```

Lint :

```bash
npm run lint
```

Typecheck :

```bash
npm run typecheck
```

Tests :

```bash
npm run test
```

Build :

```bash
npm run build
```

Preview :

```bash
npm run preview
```

## Critères de fin

Le prototype sera considéré comme prêt quand :

- le menu complet fonctionne
- le hub est jouable
- les 4 missions sont finissables
- les dialogues et feedbacks sont naturels et cohérents
- la progression est sauvegardée
- les écrans de debrief et le résumé final existent
- `lint`, `typecheck`, `test` et `build` passent
