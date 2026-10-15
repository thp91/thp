import nutrimuscle from '../assets/images/projects/nutrimuscle.jpg';
import bonParfumeur from '../assets/images/projects/bon-parfumeur.jpg';
import moulinDeBalme from '../assets/images/projects/moulin-de-balme.jpg';
import chateauLArc from '../assets/images/projects/chateau-l-arc.jpg';

/**
 * Projets auxquels Théophile a collaboré.
 * - `description` : ce qu'est le site (constaté sur le site en ligne) ;
 * - `work`        : ⚠️ À CONFIRMER — sa contribution exacte (affichée seulement si renseignée) ;
 * - `agency`      : ⚠️ À CONFIRMER — agence concernée le cas échéant ;
 * - `image`       : capture de la page d'accueil (800 × 500, octobre 2026).
 * kind : 'collaboration' | 'personnel' | 'freelance' | 'agence'
 */
export const PROJECT_KINDS = {
  collaboration: 'Collaboration',
  personnel: 'Projet personnel',
  freelance: 'Projet freelance',
  agence: 'Contribution en agence',
};

export const PROJECTS = [
  {
    id: 'nutrimuscle',
    number: '01',
    name: 'Nutrimuscle',
    type: 'Site e-commerce',
    kind: 'collaboration',
    agency: null,
    description: 'Boutique en ligne de compléments alimentaires et de nutrition sportive.',
    work: null,
    result: null,
    image: nutrimuscle,
    url: 'https://www.nutrimuscle.com/',
    tint: '#eceef0',
  },
  {
    id: 'bon-parfumeur',
    number: '02',
    name: 'Bon Parfumeur Paris',
    type: 'Site e-commerce',
    kind: 'collaboration',
    agency: null,
    description: 'Boutique en ligne d’une maison de haute parfumerie française.',
    work: null,
    result: null,
    image: bonParfumeur,
    url: 'https://www.bonparfumeur.com/fr',
    tint: '#e8efe9',
  },
  {
    id: 'moulin-de-balme',
    number: '03',
    name: 'Le Moulin de Balme',
    type: 'Site e-commerce local',
    kind: 'collaboration',
    agency: null,
    description: 'Boulangerie artisanale de Brive-la-Gaillarde, avec commande en ligne et retrait en boutique (click & collect).',
    work: null,
    result: null,
    image: moulinDeBalme,
    url: 'https://www.moulin-de-balme.fr/',
    tint: '#f3ece4',
  },
  {
    id: 'chateau-l-arc',
    number: '04',
    name: 'Golf Château l’Arc',
    type: 'Site vitrine',
    kind: 'collaboration',
    agency: null,
    description: 'Golf 18 trous en Provence : parcours, tarifs, compétitions, adhésion et réservation de départs.',
    work: null,
    result: null,
    image: chateauLArc,
    url: 'https://chateau-l-arc.vercel.app/',
    tint: '#e6ece4',
  },
];
