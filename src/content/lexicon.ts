export type LexiconEntry = {
  id: string;
  term: string;
  meaning: string;
  example: string;
};

export const lexiconEntries: LexiconEntry[] = [
  {
    id: 'salle',
    term: 'salle',
    meaning: 'Pièce où a lieu un cours ou une activité.',
    example: 'La salle C4 est au premier étage.',
  },
  {
    id: 'panneau-affichage',
    term: "panneau d'affichage",
    meaning: "Support où l'on lit des avis et des changements d'information.",
    example: "Regarde le panneau d'affichage avant le cours.",
  },
  {
    id: 'premier-etage',
    term: 'premier étage',
    meaning: 'Niveau situé au-dessus du rez-de-chaussée.',
    example: 'La bibliothèque est au premier étage.',
  },
  {
    id: 'attestation-assurance',
    term: "attestation d'assurance",
    meaning: 'Document qui prouve que tu es assuré.',
    example: "Le secrétariat demande l'attestation d'assurance.",
  },
  {
    id: 'secretariat',
    term: 'secrétariat',
    meaning: 'Service administratif de l’établissement.',
    example: 'Je dois passer au secrétariat ce matin.',
  },
  {
    id: 'deposer-document',
    term: 'déposer un document',
    meaning: 'Remettre officiellement un papier à un service.',
    example: "Je viens déposer ce document à l'accueil.",
  },
  {
    id: 'bibliotheque',
    term: 'bibliothèque',
    meaning: 'Lieu où l’on consulte ou emprunte des ressources.',
    example: 'La bibliothèque ferme à 18 heures.',
  },
  {
    id: 'rayon',
    term: 'rayon',
    meaning: 'Section ou étagère thématique dans une bibliothèque ou un magasin.',
    example: 'Le manuel est au rayon FLE B1.',
  },
  {
    id: 'manuel-b1',
    term: 'manuel',
    meaning: 'Livre de cours ou de méthode.',
    example: 'Je cherche un manuel de français niveau B1.',
  },
  {
    id: 'annexe',
    term: 'annexe',
    meaning: 'Bâtiment secondaire dépendant de l’établissement principal.',
    example: "Le cours a été déplacé à l'annexe 2.",
  },
  {
    id: 'dossier-bleu',
    term: 'dossier bleu',
    meaning: 'Pochette administrative identifiée par sa couleur.',
    example: 'Passe prendre le dossier bleu avant le rendez-vous.',
  },
  {
    id: 'confirmer',
    term: 'confirmer',
    meaning: 'Vérifier et dire de nouveau une information pour être sûr.',
    example: "Vous pouvez me confirmer l'adresse, s'il vous plaît ?",
  },
];

