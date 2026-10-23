# THP Development — Portfolio

Site portfolio immersif de THP Development (Théophile Mazaud, développeur web freelance).
Maquette de référence : Figma `THbx4JH39gJnEoyiyvlRTd`, frame `7:3` (9 états de scroll).

## Lancement

```bash
npm install
npm run dev       # site http://localhost:5173 + serveur local de prospection
npm run build     # production dans dist/
npm run preview   # sert la version de production
```

Node 22+ recommandé (le serveur de prospection s'exécute avec `tsx`).

## Dépendances

| Paquet | Rôle |
| --- | --- |
| `react`, `react-dom` | Interface |
| `gsap` + `ScrollTrigger` | Timelines et scènes pilotées par le scroll |
| `@gsap/react` | `useGSAP()` : création et nettoyage automatiques des animations |
| `lenis` | Défilement fluide, branché sur le ticker GSAP (une seule boucle d'animation) |
| `@fontsource-variable/inter` | Police Inter auto-hébergée (aucun appel à Google Fonts) |
| `vite`, `@vitejs/plugin-react` | Outillage |
| `express`, `cheerio`, `tsx`, `concurrently` | Serveur local de prospection (développement uniquement, jamais déployé) |

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

## Espace administrateur (`/admin`)

Protégé par mot de passe (cookie de session signé, HttpOnly, 7 jours ; 10 essais par quart d'heure et par IP). Jamais indexé (`noindex`, `robots.txt`).

### Vue d'ensemble — analytics (en ligne)

- Chaque chargement du site envoie une page vue à `api/track.js` (`src/lib/analytics.js`, ignoré en local et dans l'admin).
- **Sans cookie ni donnée personnelle** : compteurs agrégés par jour dans Upstash Redis, visiteur unique = empreinte (IP + navigateur) hachée et salée, renouvelée chaque jour. Pas de bandeau de consentement nécessaire.
- Provenances classées dans `api/_lib/sources.js` : **assistants IA** (ChatGPT, Perplexity, Claude, Gemini, Copilot, Mistral, DeepSeek), **moteurs** (Google, Bing, DuckDuckGo, Qwant, Ecosia, Yahoo), **réseaux sociaux** (Instagram, Facebook, LinkedIn, X, TikTok, Pinterest, YouTube, WhatsApp), accès direct, autres sites. `utm_source` prioritaire (ChatGPT ajoute `utm_source=chatgpt.com`). Robots exclus.
- L'admin affiche visiteurs uniques, pages vues, pages par visiteur, part des visites venues d'une IA, courbe par jour (7 / 30 / 90 jours, comparaison à la période précédente), sources, pages et appareils.

### Prospection (en local uniquement)

L'outil `prospect/` (anciennement `~/Documents/prospect`) tourne sur votre Mac avec `npm run dev` : il utilise Claude Code (abonnement), le serveur MCP Figma et des fichiers locaux, impossible à héberger sur Vercel. En ligne, l'onglet indique « disponible en local ».

- **Sans base de données** : `prospect/data/prospects.json` et `searches.json` (+ maquettes HTML et images), exclus de git.
- **Envoi des mails via Resend** (`prospect/server/mailer.ts`) : nécessite un domaine vérifié dans Resend (`PROSPECT_FROM`), sinon Resend n'envoie qu'à l'adresse du compte.
- Prompts personnalisables : `prospect/server/prompts/` (maquette, mail, développement). Sites clients développés dans `~/Documents/sites-clients` (`SITES_DIR`).

### Variables d'environnement

| Variable | Où | Rôle |
| --- | --- | --- |
| `ADMIN_PASSWORD` | Vercel + `.env.local` | Mot de passe de l'admin |
| `ADMIN_SESSION_SECRET` | Vercel + `.env.local` | Secret de signature des sessions (et sel de l'analytics) |
| `KV_REST_API_URL`, `KV_REST_API_TOKEN` | Vercel (intégration Upstash) + `.env.local` | Base Redis de l'analytics |
| `RESEND_API_KEY` | Vercel + `.env.local` | Formulaire de contact et mails de prospection |
| `PROSPECT_FROM`, `SENDER_PHONE`, `FIGMA_PROJECT_ID`… | `.env.local` | Prospection (local) |

Générer le secret : `openssl rand -base64 48`. Récupérer les variables Vercel en local : `vercel env pull .env.local`.

## À personnaliser

- **Adresse e-mail** : `src/data/site.js` → `CONTACT.email` (thp.development.pro@gmail.com).
- **Projets** : `src/data/projects.js` — Nutrimuscle, Bon Parfumeur Paris, Le Moulin de Balme, Golf Château l'Arc, avec captures de page d'accueil (800 × 500). À compléter : `work` (contribution exacte), `agency` et `kind` ; les champs vides ne s'affichent pas. Remplacer les captures par des versions haute définition (1600 × 1000) si possible.
- **Agences** : `src/data/experience.js` — `url` optionnelle pour chaque agence.
- **FAQ** : `src/data/faq.js` — réponses volontairement prudentes (aucun tarif ni délai), à ajuster.
- **URL du site** : `index.html` (canonical, Open Graph, JSON-LD).
- **Formulaire de contact** : envoi direct via Resend, par la fonction serveur `api/contact.js` (Vercel). La clé API reste côté serveur.
  - En local : copier `.env.example` en `.env.local`, y renseigner `RESEND_API_KEY`, puis relancer `npm run dev` (le serveur de dev sert aussi `/api/contact`).
  - En production (Vercel) : *Project Settings → Environment Variables* → `RESEND_API_KEY` (et éventuellement `CONTACT_TO`, `CONTACT_FROM`).
  - Tant qu'aucun domaine n'est vérifié dans Resend, l'expéditeur est `onboarding@resend.dev` et Resend n'autorise l'envoi **qu'à l'adresse du compte Resend**. Pour un expéditeur à votre nom, vérifier un domaine dans Resend puis définir `CONTACT_FROM`.
  - Protection : validation des champs, champ piège anti-robots ; le visiteur peut répondre directement (« Répondre » renvoie vers son adresse).

## Assets manquants

- Captures réelles des projets (idéalement WebP 1600 × 1000).
- Image Open Graph `public/og-image.jpg` (1200 × 630), puis décommenter la balise dans `index.html`.
- Couleurs de fond des scènes 01, 04 à 09 : le quota Figma (forfait Starter) n'a permis d'extraire en détail que les scènes 02 et 03 ; les autres scènes reprennent leurs positions et textes exacts (métadonnées Figma) et des fonds choisis dans la palette. À valider visuellement contre la maquette.
- Une version vectorielle du logo adaptée aux fonds sombres, si souhaitée (le T `#222222` est peu contrasté sur noir, comme dans la maquette).

## Références Figma

`docs/figma-ref/` contient les exports du logo et les rendus des scènes 02 et 03 récupérés via le connecteur Figma.
