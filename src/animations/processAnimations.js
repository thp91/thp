import { gsap, ScrollTrigger } from '../lib/gsap';

/**
 * Scène 08 : l'illustration (sticky) passe de l'idée au site en ligne
 * pendant que les quatre étapes défilent. Le fil se remplit et chaque
 * étape s'active quand elle atteint le centre de l'écran.
 */
export function createProcessTimeline(root) {
  const q = gsap.utils.selector(root);
  const stepsList = q('.process__steps')[0];
  const steps = q('.process__step');
  const v = (selector) => q(`.process-visual ${selector}`);

  gsap.from(q('.section-heading__title .line-mask__inner'), {
    yPercent: 110,
    ease: 'none',
    scrollTrigger: { trigger: root, start: 'top 80%', end: 'top 40%', scrub: 0.6 },
  });

  // État de départ de l'illustration : la conversation seule
  gsap.set(v('[data-step="4"]'), { autoAlpha: 0 });
  gsap.set(v('.process-visual__chrome'), { yPercent: -100 });
  gsap.set(v('.process-visual__fill'), { clipPath: 'inset(0% 100% 0% 0% round 1.6cqw)' });
  gsap.set(v('.process-visual__outline'), { opacity: 0, scale: 0.9 });
  gsap.set(v('.process-visual__bubble, .process-visual__swatches, .process-visual__code'), { opacity: 0 });

  const tl = gsap.timeline({
    defaults: { ease: 'power2.inOut', duration: 1 },
    scrollTrigger: {
      trigger: stepsList,
      start: 'top 70%',
      end: 'bottom 60%',
      scrub: 0.7,
      onUpdate: (self) => stepsList.style.setProperty('--progress', self.progress.toFixed(3)),
    },
  });

  // 1. On échange : les bulles arrivent, la réponse s'écrit
  tl.fromTo(v('.process-visual__bubble--client'), { opacity: 0, y: 30, scale: 0.8 }, { opacity: 1, y: 0, scale: 1, ease: 'back.out(1.6)' }, 0)
    .fromTo(v('.process-visual__typing'), { y: 0 }, { y: -6, stagger: { each: 0.1, yoyo: true, repeat: 1 }, duration: 0.25 }, 0.4)
    .fromTo(v('.process-visual__bubble--me'), { opacity: 0, y: 30, scale: 0.8 }, { opacity: 1, y: 0, scale: 1, ease: 'back.out(1.6)' }, 0.5)
    .from(v('.process-visual__bar'), { scaleX: 0, transformOrigin: 'left center', stagger: 0.2, duration: 0.5 }, 0.9);

  // 2. Je conçois : la conversation laisse place à une maquette en pointillés et à une palette
  tl.to(v('.process-visual__bubble'), { opacity: 0, y: -40, scale: 0.9, stagger: 0.1, duration: 0.6 }, 1.6)
    .to(v('.process-visual__outline'), { opacity: 1, scale: 1, stagger: 0.08, duration: 0.6, ease: 'back.out(1.4)' }, 1.8)
    .fromTo(v('.process-visual__swatches'), { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.5 }, 2.2);

  // 3. Je développe : les blocs se remplissent, la balise de code apparaît
  tl.to(v('.process-visual__fill'), { clipPath: 'inset(0% 0% 0% 0% round 1.6cqw)', stagger: 0.12, duration: 0.8 }, 3)
    .to(v('.process-visual__swatches'), { opacity: 0, y: 20, duration: 0.4 }, 3.1)
    .to(v('.process-visual__outline'), { opacity: 0, duration: 0.4 }, 3.6)
    .fromTo(v('.process-visual__code'), { opacity: 0, scale: 0.6, rotation: -10 }, { opacity: 1, scale: 1, rotation: 0, duration: 0.5, ease: 'back.out(2)' }, 3.3);

  // 4. On le met en ligne : le navigateur se pose, la pastille s'allume, le téléphone suit
  tl.to(v('.process-visual__code'), { opacity: 0, y: -30, duration: 0.4 }, 4.4)
    .to(v('.process-visual__chrome'), { yPercent: 0, autoAlpha: 1, duration: 0.6 }, 4.5)
    .fromTo(v('.process-visual__live'), { autoAlpha: 0, scale: 0.6 }, { autoAlpha: 1, scale: 1, duration: 0.4, ease: 'back.out(2.5)' }, 5)
    .fromTo(v('.process-visual__phone'), { autoAlpha: 0, yPercent: 60, rotation: 8 }, { autoAlpha: 1, yPercent: 0, rotation: 0, duration: 0.7, ease: 'power3.out' }, 5.1)
    .to({}, { duration: 0.4 });

  // Activation des étapes au centre de l'écran
  steps.forEach((step) => {
    ScrollTrigger.create({
      trigger: step,
      start: 'top 60%',
      onEnter: () => step.classList.add('process__step--active'),
      onLeaveBack: () => step.classList.remove('process__step--active'),
    });
  });

  gsap.from(q('.faq__item'), {
    y: 40,
    autoAlpha: 0,
    stagger: 0.08,
    ease: 'none',
    scrollTrigger: { trigger: q('.faq')[0], start: 'top 85%', end: 'top 35%', scrub: 0.6 },
  });

  return () => {
    stepsList.style.removeProperty('--progress');
    steps.forEach((step) => step.classList.remove('process__step--active'));
  };
}
