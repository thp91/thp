import { gsap } from '../lib/gsap';

/**
 * Scène 09 : les mots prennent leur place pendant le défilement, la ligne souligne
 * l'appel à l'action et les courbes du logo remontent.
 */
export function createContactTimeline(root) {
  const q = gsap.utils.selector(root);

  const tl = gsap.timeline({
    defaults: { ease: 'none' },
    scrollTrigger: { trigger: root, start: 'top 85%', end: 'top 10%', scrub: 0.7 },
  });

  tl.from(q('.contact__word'), {
    yPercent: 115,
    rotation: 4,
    transformOrigin: '0% 100%',
    stagger: 0.12,
    duration: 0.6,
  })
    .from(q('.contact__logo'), { autoAlpha: 0, scale: 0.6, transformOrigin: '100% 0%', duration: 0.5 }, 0.2)
    .from(q('.contact__rule'), { scaleX: 0, duration: 0.6 }, 0.55)
    .from(q('.contact__cta'), { y: 60, autoAlpha: 0, duration: 0.5 }, 0.7)
    .from(q('.contact__curve--left'), { yPercent: 60, rotation: -10, duration: 1 }, 0)
    .from(q('.contact__curve--right'), { yPercent: 80, rotation: 10, duration: 1 }, 0.1);

  return tl;
}
