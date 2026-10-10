import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';

gsap.registerPlugin(ScrollTrigger, useGSAP);

// Mobile : la barre d'adresse qui se replie ne doit pas recalculer toutes les scènes
ScrollTrigger.config({ ignoreMobileResize: true });

/**
 * Deux mises en page animées, mêmes scènes :
 * - `wide`   : écran paysage assez grand (desktop, tablette paysage) ;
 * - sinon    : composition verticale (mobile, tablette portrait).
 * `reduce` : l'utilisateur a demandé moins d'animations → contenu statique.
 * Les mêmes conditions sont reprises dans les fichiers CSS.
 */
export const LAYOUT_QUERIES = {
  wide: '(min-aspect-ratio: 1/1) and (min-width: 900px) and (min-height: 500px)',
  reduce: '(prefers-reduced-motion: reduce)',
};

/**
 * Enregistre une animation dans un gsap.matchMedia selon la mise en page.
 * `wide` et `narrow` peuvent retourner une fonction de nettoyage.
 */
export function addLayoutAnimation(mm, { wide, narrow }) {
  // gsap.matchMedia n'appelle la fonction que si au moins une condition est vraie :
  // `motion` garantit l'appel en mise en page étroite.
  mm.add({ ...LAYOUT_QUERIES, motion: '(prefers-reduced-motion: no-preference)' }, (context) => {
    const { conditions } = context;
    if (conditions.reduce) return undefined;
    return conditions.wide ? wide?.() : narrow?.();
  });
}

export { gsap, ScrollTrigger, useGSAP };
