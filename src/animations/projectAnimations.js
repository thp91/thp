import { gsap, ScrollTrigger } from '../lib/gsap';

/**
 * Scène 07 : pile de fiches collantes (position: sticky, sans épinglage GSAP).
 * - à l'entrée, le visuel s'ouvre par un masque arrondi et la fiche glisse en place ;
 * - quand la fiche suivante la recouvre, la précédente recule et s'assombrit ;
 * - la teinte de fond suit le projet au premier plan.
 */
export function createProjectsStack(root) {
  const q = gsap.utils.selector(root);
  const items = q('.projects__item');
  const stack = q('.projects__stack')[0];

  // Les fiches sont « sticky » : leur position mesurée change une fois collées.
  // Les déclencheurs s'appuient donc sur la pile (non collante) + la position naturelle de chaque fiche.
  const naturalTop = (index) => {
    const gap = parseFloat(getComputedStyle(stack).rowGap) || 0;
    return items.slice(0, index).reduce((total, item) => total + item.offsetHeight + gap, 0);
  };
  const at = (index, viewport) => () => `top+=${naturalTop(index)} ${viewport}`;

  gsap.from(q('.section-heading__title .line-mask__inner'), {
    yPercent: 110,
    stagger: 0.12,
    ease: 'none',
    scrollTrigger: { trigger: root, start: 'top 80%', end: 'top 30%', scrub: 0.6 },
  });

  items.forEach((item, index) => {
    const card = item.querySelector('.projects__card');
    const media = item.querySelector('.project-card__media');
    const reveal = item.querySelectorAll('.project-card__meta, .project-card__title, .project-card__type, .project-card__detail');

    // Entrée : ouverture du visuel et mise en place de la fiche
    gsap
      .timeline({
        defaults: { ease: 'none' },
        scrollTrigger: { trigger: stack, start: at(index, '95%'), end: at(index, '35%'), scrub: 0.6 },
      })
      .fromTo(
        media,
        { clipPath: 'inset(14% 18% 14% 18% round 24px)', scale: 1.08 },
        { clipPath: 'inset(0% 0% 0% 0% round 16px)', scale: 1, duration: 1 },
      )
      .from(reveal, { y: 40, autoAlpha: 0, stagger: 0.08, duration: 0.6 }, 0.25)
      .fromTo(item.querySelector('.projects__ghost'), { yPercent: 40 }, { yPercent: 0, duration: 1 }, 0);

    // Recouvrement par la fiche suivante : recul + voile
    const next = items[index + 1];
    if (next) {
      gsap
        .timeline({
          defaults: { ease: 'none' },
          scrollTrigger: { trigger: stack, start: at(index + 1, 'bottom'), end: at(index + 1, 'top+=120'), scrub: 0.6 },
        })
        .to(card, { scale: 0.92, duration: 1 }, 0)
        .to(item.querySelector('.projects__shade'), { opacity: 0.35, duration: 1 }, 0);
    }

    // Teinte de fond du projet au premier plan
    ScrollTrigger.create({
      trigger: stack,
      start: at(index, '55%'),
      end: next ? at(index + 1, '55%') : 'bottom top',
      onToggle: (self) => {
        if (self.isActive) gsap.to(root, { backgroundColor: item.dataset.tint, duration: 0.6, overwrite: 'auto' });
      },
      onLeaveBack: () => index === 0 && gsap.to(root, { backgroundColor: '#faf8f3', duration: 0.6, overwrite: 'auto' }),
    });
  });

  return () => gsap.set(root, { clearProps: 'backgroundColor' });
}
