import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';

gsap.registerPlugin(ScrollTrigger, useGSAP);

/**
 * Media queries partagées par toutes les timelines (gsap.matchMedia).
 * `motion` : scènes épinglées complètes (desktop, animations autorisées).
 * `light`  : alternatives légères (tablette / mobile, animations autorisées).
 */
export const MOTION_QUERIES = {
  motion: '(min-width: 1100px) and (min-height: 620px) and (prefers-reduced-motion: no-preference)',
  light: '(max-width: 1099.98px) and (prefers-reduced-motion: no-preference), (max-height: 619.98px) and (prefers-reduced-motion: no-preference)',
  reduce: '(prefers-reduced-motion: reduce)',
};

export { gsap, ScrollTrigger, useGSAP };
