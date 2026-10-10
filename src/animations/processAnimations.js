import { gsap } from '../lib/gsap';

/**
 * Scène 08 : la ligne du parcours se dessine au défilement et active chaque étape
 * lorsqu'elle l'atteint.
 */
export function createProcessTimeline(root) {
  const q = gsap.utils.selector(root);
  const steps = q('.process__step');
  const list = q('.process__steps')[0];

  gsap.from(q('.section-heading__title .line-mask__inner'), {
    yPercent: 110,
    ease: 'none',
    scrollTrigger: { trigger: root, start: 'top 80%', end: 'top 40%', scrub: 0.6 },
  });

  gsap.fromTo(
    q('.process__path-line'),
    { strokeDashoffset: 1 },
    {
      strokeDashoffset: 0,
      ease: 'none',
      scrollTrigger: {
        trigger: list,
        start: 'top 65%',
        end: 'bottom 55%',
        scrub: 0.6,
        onUpdate: (self) => {
          steps.forEach((step, index) => {
            const reached = self.progress >= index / (steps.length - 1) - 0.02;
            step.classList.toggle('process__step--active', reached);
          });
        },
      },
    },
  );

  gsap.from(steps, {
    x: 40,
    autoAlpha: 0.25,
    stagger: 0.15,
    ease: 'none',
    scrollTrigger: { trigger: list, start: 'top 85%', end: 'bottom 70%', scrub: 0.6 },
  });

  gsap.from(q('.faq'), {
    y: 60,
    autoAlpha: 0,
    ease: 'none',
    scrollTrigger: { trigger: q('.faq')[0], start: 'top 95%', end: 'top 65%', scrub: 0.6 },
  });

  return () => steps.forEach((step) => step.classList.remove('process__step--active'));
}
