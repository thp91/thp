import { gsap } from '../lib/gsap';

/** Compteur lié à une timeline : monte ou descend de data-from à data-to. */
const addCounter = (tl, element, at, duration = 1) => {
  const counter = { value: Number(element.dataset.from) };
  const render = () => {
    element.textContent = Math.round(counter.value);
  };
  tl.to(counter, { value: Number(element.dataset.to), duration, ease: 'power1.out', onUpdate: render }, at);
  render();
};

/** Chaque scène : l'état de départ est défini ici, l'état final est celui du CSS. */
const SCENES = {
  quote(tl, q) {
    tl.from(q('.quote-sketch'), { y: 40, rotation: -3, autoAlpha: 0, duration: 0.5 }, 0)
      .from(q('.quote-sketch__row'), { x: -16, autoAlpha: 0, stagger: 0.12, duration: 0.3 }, 0.3)
      .fromTo(q('.commitments__check path'), { strokeDashoffset: 1 }, { strokeDashoffset: 0, stagger: 0.12, duration: 0.25 }, 0.45)
      .from(q('.quote-sketch__total'), { autoAlpha: 0, duration: 0.25 }, 0.95)
      .from(q('.quote-sketch__stamp'), { scale: 1.8, rotation: -30, autoAlpha: 0, duration: 0.3, ease: 'back.out(2)' }, 1.1);
  },
  switch(tl, q) {
    tl.from(q('.switch-sketch'), { y: 40, rotation: 3, autoAlpha: 0, duration: 0.5 }, 0)
      // Départ : interrupteur activé (bouton à droite, rail sombre)
      .fromTo(q('.switch-sketch__knob'), { x: 24 }, { x: 0, duration: 0.35, ease: 'power2.inOut' }, 0.6)
      .fromTo(
        q('.switch-sketch__track'),
        { backgroundColor: '#1e1e1f' },
        { backgroundColor: 'rgba(30, 30, 31, 0.18)', duration: 0.35 },
        0.6,
      )
      .fromTo(q('.switch-sketch__state-item--on'), { autoAlpha: 1, yPercent: 0 }, { autoAlpha: 0, yPercent: -100, duration: 0.2 }, 0.7)
      .from(q('.switch-sketch__state-item--off'), { autoAlpha: 0, yPercent: 100, duration: 0.2 }, 0.75)
      .from(q('.switch-sketch__choice'), { scale: 0.6, autoAlpha: 0, duration: 0.3, ease: 'back.out(2.5)' }, 1);
  },
  access(tl, q) {
    tl.fromTo(q('.access-sketch__ring-fill'), { strokeDashoffset: 1 }, { strokeDashoffset: 0, duration: 1.1, ease: 'power1.inOut' }, 0)
      .from(q('.access-sketch__item'), { x: 20, autoAlpha: 0, stagger: 0.22, duration: 0.25 }, 0.1)
      .fromTo(q('.commitments__check path'), { strokeDashoffset: 1 }, { strokeDashoffset: 0, stagger: 0.22, duration: 0.2 }, 0.2);
  },
  timeline(tl, q) {
    tl.from(q('.timeline-sketch__line'), { scaleX: 0, duration: 1 }, 0)
      .from(q('.timeline-sketch__dot'), { scale: 0, stagger: 0.25, duration: 0.2, ease: 'back.out(3)' }, 0.05)
      .from(q('.timeline-sketch__name'), { y: 12, autoAlpha: 0, stagger: 0.25, duration: 0.25 }, 0.1);
  },
};

/**
 * Engagements : chaque tuile s'ouvre (masque arrondi) puis joue sa scène pendant
 * que son chiffre monte ou descend. Tout est lié au défilement.
 */
export function createCommitmentsAnimations(root) {
  const q = gsap.utils.selector(root);

  gsap.from(q('.commitments__title .line-mask__inner'), {
    yPercent: 110,
    stagger: 0.12,
    ease: 'none',
    scrollTrigger: { trigger: q('.commitments')[0], start: 'top 85%', end: 'top 45%', scrub: 0.6 },
  });

  q('.commitment').forEach((tile) => {
    const tq = gsap.utils.selector(tile);
    const visual = tq('.commitment__visual > *')[0];
    const scene = SCENES[[...visual.classList][0].replace('-sketch', '')];

    const tl = gsap.timeline({
      defaults: { ease: 'power2.out' },
      scrollTrigger: { trigger: tile, start: 'top 90%', end: 'top 30%', scrub: 0.6 },
    });

    tl.fromTo(
      tile,
      { clipPath: 'inset(8% 6% 8% 6% round 48px)', y: 60 },
      { clipPath: 'inset(0% 0% 0% 0% round 28px)', y: 0, duration: 0.5, ease: 'power3.out' },
      0,
    ).from(tq('.commitment__title, .commitment__text'), { y: 20, autoAlpha: 0, stagger: 0.08, duration: 0.3 }, 0.35);

    addCounter(tl, tq('.commitment__value')[0], 0.2);
    scene(tl, tq);
  });

  return () => q('.commitment__value').forEach((value) => {
    value.textContent = value.dataset.to;
  });
}
