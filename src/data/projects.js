/**
 * Projets et contributions.
 *
 * ⚠️ PLACEHOLDERS : les trois entrées ci-dessous reprennent les catégories de la maquette
 * (« Visuels et périmètres exacts des projets à renseigner »). Remplacer chaque champ
 * marqué `placeholder: true` par les informations réelles, et ajouter `image`
 * (capture du site, idéalement 1600 × 1000 en WebP) lorsqu'elle est disponible.
 *
 * kind : 'personnel' | 'freelance' | 'agence'
 */
export const PROJECT_KINDS = {
  personnel: 'Projet personnel',
  freelance: 'Projet freelance',
  agence: 'Contribution en agence',
};

export const PROJECTS = [
  {
    id: 'projet-01',
    placeholder: true,
    number: '01',
    name: 'Sites vitrines',
    type: 'Site vitrine',
    kind: 'freelance',
    agency: null,
    need: 'Besoin du client — à renseigner.',
    work: 'Design + développement — périmètre exact à renseigner.',
    result: 'Fonctionnalités livrées — à renseigner.',
    image: null,
    url: null,
    tint: '#efe9ff',
  },
  {
    id: 'projet-02',
    placeholder: true,
    number: '02',
    name: 'Expériences e-commerce',
    type: 'Boutique en ligne',
    kind: 'agence',
    agency: 'Agence — à renseigner',
    need: 'Besoin du client — à renseigner.',
    work: 'Intégration et interfaces — périmètre exact à renseigner.',
    result: 'Fonctionnalités livrées — à renseigner.',
    image: null,
    url: null,
    tint: '#ffe9e4',
  },
  {
    id: 'projet-03',
    placeholder: true,
    number: '03',
    name: 'Outils web',
    type: 'Site avec administration',
    kind: 'personnel',
    agency: null,
    need: 'Besoin du client — à renseigner.',
    work: 'Pages et administration — périmètre exact à renseigner.',
    result: 'Fonctionnalités livrées — à renseigner.',
    image: null,
    url: null,
    tint: '#f1efe8',
  },
];
