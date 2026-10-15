import { gsap } from '../lib/gsap';
import { createHorizontalGallery } from './horizontalGallery';

/**
 * Scène 05 : galerie horizontale des prestations (même mécanique que l'ancienne
 * séquence projets) + micro-scénario propre à chaque esquisse :
 * - vitrine : la page se compose ;
 * - évolutif : un nouvel article vient remplir l'emplacement vide ;
 * - e-commerce : un produit part dans le panier, le compteur passe à 1.
 */
export function createServicesGallery(root) {
  const { horizontal, cleanup } = createHorizontalGallery(root, {
    block: 'services',
    media: '.service-card__media',
    reveal: '.service-card__title, .service-card__text, .service-card__ideal',
  });

  const sketchTimeline = (slide) =>
    gsap.timeline({
      defaults: { ease: 'none' },
      scrollTrigger: {
        trigger: slide,
        containerAnimation: horizontal,
        start: 'left 85%',
        end: 'left 15%',
        scrub: true,
      },
    });

  gsap.utils.toArray(root.querySelectorAll('.services__slide')).forEach((slide) => {
    const q = gsap.utils.selector(slide);
    const visual = q('.service-visual')[0];
    const tl = sketchTimeline(slide);

    if (visual.classList.contains('service-visual--vitrine')) {
      tl.from(q('[data-sketch="hero"]'), { clipPath: 'inset(0% 100% 0% 0% round 1.6cqw)', duration: 1 })
        .from(q('[data-sketch="line"]'), { scaleX: 0, stagger: 0.15, duration: 0.6 }, 0.4)
        .from(q('[data-sketch="pop"]'), { scale: 0, stagger: 0.15, duration: 0.5, ease: 'back.out(2)' }, 0.8)
        .from(q('[data-sketch="rise"]'), { yPercent: 120, autoAlpha: 0, stagger: 0.1, duration: 0.6 }, 0.9);
    }

    if (visual.classList.contains('service-visual--evolutif')) {
      tl.from(q('[data-sketch="rise"]'), { y: 20, autoAlpha: 0, stagger: 0.08, duration: 0.5 }, 0)
        .from(q('[data-sketch="new"]'), { yPercent: -30, scale: 0.8, autoAlpha: 0, duration: 0.6, ease: 'back.out(1.6)' }, 0.9)
        .from(q('[data-sketch="badge"]'), { scale: 0, rotation: -20, duration: 0.4, ease: 'back.out(3)' }, 1.4);
    }

    if (visual.classList.contains('service-visual--ecommerce')) {
      const flyer = q('[data-sketch="flyer"]')[0];
      const count = q('.service-visual__count')[0];

      // Trajet du produit vers le panier, mesuré dans le repère (non transformé) de l'esquisse
      const toCart = () => {
        const shop = flyer.offsetParent;
        const scale = shop.getBoundingClientRect().width / shop.offsetWidth || 1;
        const from = flyer.getBoundingClientRect();
        const to = count.getBoundingClientRect();
        return {
          x: (to.left + to.width / 2 - (from.left + from.width / 2)) / scale,
          y: (to.top + to.height / 2 - (from.top + from.height / 2)) / scale,
        };
      };

      tl.from(q('[data-sketch="rise"]'), { y: 20, autoAlpha: 0, stagger: 0.08, duration: 0.5 }, 0)
        .fromTo(flyer, { x: 0, y: 0, opacity: 0, scale: 1 }, { opacity: 1, duration: 0.1 }, 0.8)
        .to(flyer, { x: () => toCart().x, y: () => toCart().y, scale: 0.6, duration: 0.6, ease: 'power2.in' }, 0.9)
        .to(flyer, { opacity: 0, duration: 0.05 }, 1.5)
        .to(q('[data-sketch="count-from"]'), { yPercent: -110, duration: 0.2 }, 1.5)
        .to(q('[data-sketch="count-to"]'), { yPercent: -110, duration: 0.2 }, 1.5)
        .fromTo(count, { scale: 1 }, { scale: 1.35, duration: 0.15, yoyo: true, repeat: 1 }, 1.5);
    }
  });

  return cleanup;
}
