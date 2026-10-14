/**
 * Prestations. Les compléments (idéal pour, exemples, contenu) s'affichent
 * dans le panneau ouvert depuis la flèche de chaque carte.
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
    examples: [
      'Un plombier qui présente ses services, sa zone d’intervention et un formulaire de demande de devis.',
      'Un restaurant qui affiche sa carte, ses horaires, ses photos et un plan d’accès.',
      'Un cabinet qui présente son équipe, ses domaines d’expertise et ses coordonnées.',
    ],
    includes: [
      'Quelques pages claires : accueil, services, à propos, contact',
      'Formulaire de contact et liens vers vos réseaux',
      'Affichage soigné sur ordinateur, tablette et téléphone',
      'Bases du référencement pour être trouvé sur Google',
    ],
    difference: 'Le bon choix si votre objectif principal est d’être visible et d’être contacté.',
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
    examples: [
      'Un architecte qui ajoute lui-même ses nouveaux projets dans une galerie de réalisations.',
      'Une agence immobilière qui publie et met à jour ses biens.',
      'Une association qui annonce ses événements et partage ses actualités.',
    ],
    includes: [
      'Tout ce que propose un site vitrine',
      'Un espace simple pour modifier vos textes, photos et contenus vous-même',
      'Des rubriques qui s’enrichissent : actualités, réalisations, blog…',
      'Une base prête à accueillir de nouvelles fonctionnalités (réservation, espace membre…)',
    ],
    difference: 'Le bon choix si votre site doit vivre et grandir avec votre activité.',
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
    examples: [
      'Une créatrice de bijoux qui vend ses pièces à travers toute la France.',
      'Une épicerie fine qui propose la commande en ligne avec retrait en magasin.',
      'Un producteur local qui vend ses paniers avec livraison.',
    ],
    includes: [
      'Catalogue produits avec photos, variantes et prix',
      'Panier et paiement en ligne sécurisé',
      'Suivi des commandes et des stocks',
      'Un espace d’administration pour gérer produits, commandes et clients',
    ],
    difference: 'Le bon choix si votre objectif est de vendre directement depuis votre site.',
  },
];
