import { createContext, useContext, useEffect, useState } from 'react';
import Lenis from 'lenis';
import { gsap, ScrollTrigger } from '../lib/gsap';
import useReducedMotion from './useReducedMotion';
import useMediaQuery from './useMediaQuery';

export const LenisContext = createContext(null);

/**
 * Crée une instance Lenis pilotée par le ticker GSAP (une seule boucle d'animation)
 * et synchronisée avec ScrollTrigger. Désactivée si l'utilisateur réduit les animations.
 */
export function useLenisInstance() {
  const reducedMotion = useReducedMotion();
  const finePointer = useMediaQuery('(pointer: fine)');
  const [lenis, setLenis] = useState(null);

  useEffect(() => {
    // Sur écran tactile, Lenis n'apporte rien (défilement natif déjà inertiel) : on l'évite
    if (reducedMotion || !finePointer) return undefined;

    const instance = new Lenis({ lerp: 0.11, wheelMultiplier: 0.95, autoRaf: false });
    const update = (time) => instance.raf(time * 1000);

    instance.on('scroll', ScrollTrigger.update);
    gsap.ticker.add(update);
    gsap.ticker.lagSmoothing(0);
    setLenis(instance);

    return () => {
      gsap.ticker.remove(update);
      gsap.ticker.lagSmoothing(500, 33);
      instance.destroy();
      setLenis(null);
    };
  }, [reducedMotion, finePointer]);

  return lenis;
}

export default function useLenis() {
  return useContext(LenisContext);
}

/** Défilement vers une ancre, avec ou sans Lenis. */
export function useScrollTo() {
  const lenis = useLenis();
  const reducedMotion = useReducedMotion();

  return (target) => {
    const element = typeof target === 'string' ? document.querySelector(target) : target;
    if (!element) return;

    if (lenis) {
      lenis.scrollTo(element, { duration: 1.4 });
    } else {
      element.scrollIntoView({ behavior: reducedMotion ? 'auto' : 'smooth' });
    }

    element.setAttribute('tabindex', '-1');
    element.focus({ preventScroll: true });
  };
}
