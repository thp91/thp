# THP Development — Portfolio

Site portfolio immersif de THP Development (Théophile Mazaud, développeur web freelance).
Maquette de référence : Figma `THbx4JH39gJnEoyiyvlRTd`, frame `7:3` (9 états de scroll).

## Lancement

```bash
npm install
npm run dev       # http://localhost:5173
npm run build     # production dans dist/
npm run preview   # sert la version de production
```

Node 20+ recommandé.

## Dépendances

| Paquet | Rôle |
| --- | --- |
| `react`, `react-dom` | Interface |
| `gsap` + `ScrollTrigger` | Timelines et scènes pilotées par le scroll |
| `@gsap/react` | `useGSAP()` : création et nettoyage automatiques des animations |
| `lenis` | Défilement fluide, branché sur le ticker GSAP (une seule boucle d'animation) |
| `@fontsource-variable/inter` | Police Inter auto-hébergée (aucun appel à Google Fonts) |
| `vite`, `@vitejs/plugin-react` | Outillage |

Pas de Tailwind, de CSS-in-JS ni de bibliothèque de composants : CSS classique en BEM, un fichier par composant.

## Architecture

```
src/
├── assets/logos/        logo officiel (SVG Figma) + tracés découpés par lettre (thpLetters.js)
├── components/          Header, Footer, CustomCursor, MagneticButton, SectionHeading,
│                        ProjectCard, ScrollProgress, BrowserMockup, PhoneMockup, TileGrid, Logo…
├── sections/            Story (scènes 01→04), Hero, BrandExperience, WebsiteBuilder,
│                        WebsitePreview, Services, About, Projects, Process, FAQ, Contact
├── animations/          timelines GSAP, séparées des composants
├── hooks/               useMediaQuery, useReducedMotion, useLenis
├── data/                contenus : services, projets, FAQ, parcours, étapes, contact
├── lib/                 configuration GSAP (plugins, media queries partagées), bus d'événements
└── styles/              reset, variables (tokens), typographie, global
```

### Deux compositions animées, mêmes scènes (`src/lib/gsap.js`)

- **Paysage** (`wide` : ratio ≥ 1, largeur ≥ 900 px, hauteur ≥ 500 px) — repère Figma 1440 × 900.
- **Portrait** (mobile, tablette verticale) — repère dédié 390 × 700 (`STORY_LAYOUTS.portrait` dans `src/animations/storyGeometry.js`) : compositions recomposées pour l'écran vertical, pas une réduction du desktop.
- **Animations réduites** (`prefers-reduced-motion`) : sections classiques, contenu affiché directement, curseur natif, sans Lenis.

## Récapitulatif des animations

| Scène | Paysage | Portrait (mobile) |
| --- | --- | --- |
| 01 Entrée | Intro ≈ 1,3 s : chaque lettre du logo se découvre par masque dans le sens de sa courbe, titre ligne par ligne, bouton. Les formes suivent légèrement le pointeur. | Même intro, composition verticale |
| 02 Logo → expérience | Scène épinglée : fond qui passe au noir, logo agrandi (Figma 10:12), puis le T s'écarte, le H s'ouvre, le P grandit ; DESIGN × CODE arrive par les côtés. | Même scène épinglée : les lettres se réorganisent en colonne, en zigzag autour de DESIGN et × CODE |
| 03 Construction | Chaque forme du logo rejoint une case de la grille 5 × 5 et devient un bloc ; les 19 autres tuiles apparaissent. | Même transformation, grille 5 × 5 compacte |
| 04 Le site prend vie | Les blocs se placent dans un vrai navigateur : barre du T → en-tête, H → bloc héros et carte, P → bouton d'action ; relais au pixel près avec les vrais composants. Puis le site se recompose pour le mobile avec les mêmes blocs : la barre noire s'élargit en coque, la page devient l'écran, bloc principal, bouton et cartes glissent et s'empilent ; les textes réapparaissent dans la mise en page mobile (cibles mesurées sur la maquette du téléphone). | Même scène, composition verticale |
| 05 Prestations | Galerie horizontale épinglée (`animations/horizontalGallery.js`) : échelle des visuels, fiche qui glisse en place, numéro en parallaxe, teinte par offre. Chaque esquisse a son micro-scénario : la vitrine se compose, l'évolutif reçoit un nouvel article, l'e-commerce envoie un produit au panier. « Voir des exemples » ouvre le panneau détaillé. | Identique, format mobile |
| 06 À propos | Axe vertical qui se dessine ; chaque agence arrive en contour puis se remplit en s'alignant. | Identique |
| 07 Projets | Pile de fiches collantes (`position: sticky`, sans épinglage) : le visuel s'ouvre par un masque arrondi, la fiche glisse en place ; la fiche suivante recouvre la précédente, qui recule et s'assombrit ; teinte de fond par projet. | Identique |
| 08 Processus + FAQ | L'illustration reste visible (sticky) et évolue au fil des étapes : échange (bulles), conception (maquette en pointillés + palette), développement (blocs qui se remplissent, `</>`), mise en ligne (navigateur, « En ligne », téléphone). Le fil se remplit et chaque étape s'active. FAQ claire en accordéon, sur deux colonnes. | Identique, illustration compacte en haut |
| 09 Contact | Mots qui prennent leur place, logo qui réapparaît, ligne qui souligne le CTA, courbes du H qui remontent. | Identique |

Transverse : curseur personnalisé (pointeur précis uniquement, « VOIR » sur les projets ayant un lien, contraste automatique), boutons magnétiques avec remplissage, soulignement dynamique de la navigation, en-tête qui se masque au scroll et s'adapte aux fonds sombres, indicateur `0X / 09` + barre de progression.

## À personnaliser

- **Adresse e-mail** : `src/data/site.js` → `CONTACT.email` (actuellement un placeholder `contact@thp-development.fr`).
- **Projets** : `src/data/projects.js` — les 3 entrées sont des placeholders (`placeholder: true`) reprenant les catégories de la maquette. Renseigner nom, type, nature (personnel / freelance / agence), agence, besoin, travail réalisé, livrables, `image` et `url`.
- **Agences** : `src/data/experience.js` — `url` optionnelle pour chaque agence.
- **FAQ** : `src/data/faq.js` — réponses volontairement prudentes (aucun tarif ni délai), à ajuster.
- **URL du site** : `index.html` (canonical, Open Graph, JSON-LD).
- **Formulaire** : il prépare un e-mail dans la messagerie du visiteur (`mailto:`), sans service tiers. Pour un envoi direct depuis le site, brancher un service (Formspree, Web3Forms, fonction serverless…) dans `handleSubmit` de `src/sections/Contact/Contact.jsx`.

## Assets manquants

- Captures réelles des projets (idéalement WebP 1600 × 1000).
- Image Open Graph `public/og-image.jpg` (1200 × 630), puis décommenter la balise dans `index.html`.
- Couleurs de fond des scènes 01, 04 à 09 : le quota Figma (forfait Starter) n'a permis d'extraire en détail que les scènes 02 et 03 ; les autres scènes reprennent leurs positions et textes exacts (métadonnées Figma) et des fonds choisis dans la palette. À valider visuellement contre la maquette.
- Une version vectorielle du logo adaptée aux fonds sombres, si souhaitée (le T `#222222` est peu contrasté sur noir, comme dans la maquette).

## Références Figma

`docs/figma-ref/` contient les exports du logo et les rendus des scènes 02 et 03 récupérés via le connecteur Figma.
