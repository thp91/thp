import { gsap } from '../lib/gsap';

/**
 * Scène 06 : une ligne verticale se dessine ; chaque agence vient s'aligner sur l'axe,
 * d'abord en contour, puis en plein lorsqu'elle est atteinte.
 */
export function createAboutTimeline(root) {
  const q = gsap.utils.selector(root);

  gsap.from(q('.section-heading__title .line-mask__inner'), {
    yPercent: 110,
    stagger: 0.12,
    ease: 'none',
    scrollTrigger: { trigger: root, start: 'top 75%', end: 'top 20%', scrub: 0.6 },
  });

  gsap.from(q('.about__intro p'), {
    y: 40,
    autoAlpha: 0,
    stagger: 0.2,
    ease: 'none',
    scrollTrigger: { trigger: q('.about__intro')[0], start: 'top 85%', end: 'top 55%', scrub: 0.6 },
  });

  const timeline = q('.about__timeline')[0];
  const tl = gsap.timeline({
    defaults: { ease: 'none' },
    scrollTrigger: { trigger: timeline, start: 'top 80%', end: 'bottom 55%', scrub: 0.6 },
  });

  tl.fromTo(q('.about__axis-fill'), { scaleY: 0 }, { scaleY: 1, duration: 3 }, 0);

  q('.about__item').forEach((item, index) => {
    const at = index * 0.9;
    tl.from(item, { borderTopColor: 'rgba(44, 44, 49, 0)', duration: 0.3 }, at)
      .from(item.querySelector('.about__marker'), { scale: 0, duration: 0.3, ease: 'back.out(3)' }, at + 0.2)
      .fromTo(item.querySelector('.about__name-outline'), { opacity: 1, x: 140 }, { x: 0, duration: 0.7, ease: 'power2.out' }, at)
      .from(item.querySelector('.about__name-fill'), { x: 140, clipPath: 'inset(0% 100% 0% 0%)', duration: 0.7, ease: 'power2.out' }, at + 0.15)
      .to(item.querySelector('.about__name-outline'), { opacity: 0, duration: 0.2 }, at + 0.85)
      .from(item.querySelector('.about__number'), { autoAlpha: 0, duration: 0.3 }, at + 0.3);

    const role = item.querySelector('.about__role');
    if (role) tl.from(role, { y: 12, autoAlpha: 0, duration: 0.4 }, at + 0.5);
  });

  // Engagements : la ligne se trace, puis le compteur monte (ou descend) jusqu'à sa valeur
  q('.about__stat').forEach((stat, index) => {
    const value = stat.querySelector('.about__stat-value');
    const counter = { current: Number(value.dataset.from) };
    const target = Number(value.dataset.to);
    const render = () => {
      value.textContent = Math.round(counter.current);
    };

    gsap
      .timeline({
        defaults: { ease: 'none' },
        scrollTrigger: {
          trigger: q('.about__stats')[0],
          start: `top ${95 - index * 3}%`,
          end: `top ${68 - index * 3}%`,
          scrub: 0.6,
        },
      })
      .from(stat.querySelector('.about__stat-rule'), { scaleX: 0, duration: 0.4 }, 0)
      .from(stat.querySelectorAll('.about__stat-title, .about__stat-text'), { y: 20, autoAlpha: 0, stagger: 0.1, duration: 0.4 }, 0.2)
      .to(counter, { current: target, duration: 1, ease: 'power1.out', onUpdate: render }, 0);
    render();
  });

  gsap.from(q('.about__commitments-head > *'), {
    y: 30,
    autoAlpha: 0,
    stagger: 0.1,
    ease: 'none',
    scrollTrigger: { trigger: q('.about__commitments')[0], start: 'top 85%', end: 'top 55%', scrub: 0.6 },
  });

  return () => q('.about__stat-value').forEach((value) => {
    value.textContent = value.dataset.to;
  });
}
