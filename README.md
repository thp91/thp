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

### Trois modes d'animation (`src/lib/gsap.js`)

- **motion** — desktop ≥ 1100 × 620 px, animations autorisées : scènes épinglées complètes.
- **light** — tablette / mobile : sections classiques, révélations légères, aucun long `pin`.
- **reduce** — `prefers-reduced-motion` : tout le contenu est affiché directement, curseur natif, sans Lenis.

## Récapitulatif des animations

| Scène | Desktop (motion) | Mobile / tablette |
| --- | --- | --- |
| 01 Entrée | Intro ≈ 1,3 s : chaque lettre du logo se découvre par masque dans le sens de sa courbe, titre ligne par ligne, bouton. Les formes suivent légèrement le pointeur. | Même intro, logo en image |
| 02 Logo → expérience | Scène épinglée : fond qui passe au noir, logo agrandi (Figma 10:12), puis le T s'écarte, le H s'ouvre, le P grandit ; DESIGN × CODE arrive par les côtés. | Révélation du logo par masque |
| 03 Construction | Chaque forme du logo rejoint une case de la grille 5 × 5 et devient un bloc ; les 19 autres tuiles apparaissent. | Tuiles qui apparaissent en cascade |
| 04 Le site prend vie | Les blocs se placent dans un vrai navigateur : barre du T → en-tête, H → bloc héros et carte, P → bouton d'action. Le relais avec les vrais composants se fait au pixel près. Zoom, puis le navigateur devient un téléphone. | Navigateur + téléphone révélés |
| 05 Prestations | Section épinglée : la carte au premier plan occupe l'écran, se range pendant que la suivante prend sa place. | Cartes empilées |
| 06 À propos | Axe vertical qui se dessine ; chaque agence arrive en contour puis se remplit en s'alignant. | Apparitions simples |
| 07 Projets | Séquence horizontale épinglée : échelle des cartes, titre et fiche qui se repositionnent, numéro en arrière-plan en parallaxe, teinte du fond propre à chaque projet. | Liste verticale |
| 08 Processus + FAQ | Ligne du parcours dessinée au scroll ; chaque étape s'active et son glyphe évolue (contour → esquisse → bloc → en ligne). FAQ accessible, ouverture discrète. | Étapes révélées et activées |
| 09 Contact | Mots qui prennent leur place, logo qui réapparaît, ligne qui souligne le CTA, courbes du H qui remontent. | Apparitions simples |

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
