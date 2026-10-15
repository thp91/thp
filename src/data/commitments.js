/**
 * Engagements chiffrés (section « À propos »), présentés en grille.
 * `from` : valeur de départ du compteur (il monte ou descend vers `value`).
 * `visual` : petite scène illustrant l'engagement (voir Commitments.jsx).
 */
export const COMMITMENTS = [
  {
    id: 'frais',
    tone: 'lavender',
    visual: 'quote',
    value: 0,
    from: 24,
    title: 'frais caché',
    text: 'Le devis détaille chaque poste. Ce qui est annoncé est ce qui est facturé.',
  },
  {
    id: 'abonnement',
    tone: 'coral',
    visual: 'switch',
    value: 0,
    from: 12,
    title: 'abonnement imposé',
    text: 'La maintenance n’est jamais obligatoire : vous choisissez si et quand vous en avez besoin.',
  },
  {
    id: 'acces',
    tone: 'cream',
    visual: 'access',
    value: 100,
    from: 0,
    suffix: '%',
    title: 'de vos accès remis',
    text: 'Site, interface d’administration, nom de domaine, hébergement : tout est à votre disposition.',
  },
  {
    id: 'experience',
    tone: 'outline',
    visual: 'timeline',
    prefix: '+',
    value: 7,
    from: 0,
    suffix: 'ans',
    title: 'd’expérience',
    text: 'à concevoir et développer des sites internet, en agence puis en indépendant.',
  },
];

/** Lignes du devis illustré (largeurs relatives des libellés). */
export const QUOTE_LINES = [62, 48, 70, 54];

export const ACCESS_ITEMS = ['Site', 'Administration', 'Nom de domaine', 'Hébergement'];
