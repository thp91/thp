/**
 * Prestations. `verb` résume la différence entre les offres (Présenter / Enrichir / Vendre).
 * Aucun tarif ni délai : ils sont définis au devis.
 */
export const SERVICES = [
  {
    id: 'vitrine',
    number: '01',
    title: 'Site vitrine',
    verb: 'Présenter',
    description:
      'Un site professionnel pour présenter votre activité et permettre à vos visiteurs de vous contacter.',
    tone: 'ink',
    tint: '#f1efe8',
    idealFor:
      'Artisans, indépendants, commerces de proximité, restaurants, professions libérales, associations.',
  },
  {
    id: 'evolutif',
    number: '02',
    title: 'Site évolutif',
    verb: 'Enrichir',
    description:
      'Un site capable d’accueillir de nouvelles pages, réalisations, actualités ou fonctionnalités.',
    tone: 'lavender',
    tint: '#efe9ff',
    idealFor:
      'Les activités qui publient régulièrement, présentent leurs réalisations ou prévoient de se développer.',
  },
  {
    id: 'ecommerce',
    number: '03',
    title: 'Site e-commerce',
    verb: 'Vendre',
    description:
      'Une boutique en ligne pour présenter vos produits, recevoir des commandes et encaisser les paiements en toute sécurité.',
    tone: 'coral',
    tint: '#ffe9e4',
    idealFor:
      'Les créateurs, commerçants et producteurs qui veulent vendre en ligne, en complément ou à la place d’une boutique physique.',
  },
];
