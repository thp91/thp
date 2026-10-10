import { gsap } from '../lib/gsap';

/**
 * Révélations légères utilisées hors des scènes épinglées (tablette, mobile).
 * Elles sont jouées une fois, à l'entrée dans l'écran.
 */
export function revealLines(targets, trigger) {
  return gsap.from(targets, {
    yPercent: 110,
    duration: 0.9,
    stagger: 0.08,
    ease: 'power3.out',
    scrollTrigger: { trigger, start: 'top 85%', once: true },
  });
}

export function revealFade(targets, trigger, options = {}) {
  return gsap.from(targets, {
    y: 28,
    autoAlpha: 0,
    duration: 0.7,
    stagger: 0.08,
    ease: 'power2.out',
    ...options,
    scrollTrigger: { trigger, start: 'top 85%', once: true },
  });
}

export function revealClip(target, trigger, from = 'inset(0% 0% 100% 0%)') {
  return gsap.fromTo(
    target,
    { clipPath: from },
    {
      clipPath: 'inset(0% 0% 0% 0%)',
      duration: 1,
      ease: 'power3.inOut',
      scrollTrigger: { trigger, start: 'top 80%', once: true },
    },
  );
}
