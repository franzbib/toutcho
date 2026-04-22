export type SignageDefinition = {
  id: string;
  locationId: string;
  title: string;
  body: string[];
};

export const signageEntries: SignageDefinition[] = [
  {
    id: 'hub-directions',
    locationId: 'ispa-hub',
    title: 'Plan rapide',
    body: [
      'Portes de gauche : affichage et secrétariat.',
      'Portes de droite : bibliothèque et urgence en ville.',
    ],
  },
  {
    id: 'm1-direction-sign',
    locationId: 'ispa-hall',
    title: 'Orientation',
    body: [
      'Escalier et salles C à droite.',
      "Panneau d'affichage au fond du hall.",
    ],
  },
  {
    id: 'm1-corridor-sign',
    locationId: 'ispa-hall',
    title: 'Couloir des salles',
    body: [
      'Salles C1 à C6 au fond à droite.',
      "En cas de changement, vérifiez d'abord le panneau d'affichage.",
    ],
  },
  {
    id: 'm2-direction-sign',
    locationId: 'secretariat-wing',
    title: 'Couloir administratif',
    body: [
      'Secrétariat tout droit.',
      "Merci d'avoir votre document prêt avant de vous présenter à l'accueil.",
    ],
  },
  {
    id: 'm2-counter-sign',
    locationId: 'secretariat-wing',
    title: 'Accueil du secrétariat',
    body: [
      'Préparez votre document avant de vous présenter au guichet.',
      "Merci d'annoncer clairement l'objet de votre visite.",
    ],
  },
  {
    id: 'm3-direction-sign',
    locationId: 'library-floor',
    title: 'Bibliothèque',
    body: [
      'Accueil à gauche.',
      'Rayons FLE et méthodes au fond.',
    ],
  },
  {
    id: 'm3-shelf-sign',
    locationId: 'library-floor',
    title: 'Repères des rayons',
    body: [
      'Rayon 1 : presse et actualités.',
      'Rayon 3 : FLE B1, méthodes et grammaire.',
      'Rayon 5 : romans.',
    ],
  },
  {
    id: 'm4-street-sign',
    locationId: 'amiens-outdoor',
    title: 'Rue des Jacobins',
    body: [
      "Annexe 2 tout droit après l'arrêt de tram.",
      "Accueil extérieur sur la place avant l'annexe.",
    ],
  },
  {
    id: 'm4-tram-stop-sign',
    locationId: 'amiens-outdoor',
    title: 'Arrêt Cathédrale',
    body: [
      "Annexe 2 tout droit après la place.",
      "L'accueil extérieur se trouve à gauche du passage piéton.",
    ],
  },
];
