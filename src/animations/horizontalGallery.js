import { gsap, ScrollTrigger } from '../lib/gsap';

/**
 * Galerie horizontale épinglée (desktop et mobile) : la piste défile au scroll,
 * chaque diapositive grandit en approchant du centre, son contenu glisse en place,
 * un grand numéro passe en parallaxe et la teinte de fond s'adapte à la diapositive.
 *
 * Classes attendues, préfixées par `block` (BEM) :
 * __stage (épinglé), __track, __slide (data-tint), __ghost ; `media` et `reveal`
 * désignent, dans chaque diapositive, le visuel et les éléments qui glissent.
 * Retourne { horizontal, cleanup } : `horizontal` sert de containerAnimation.
 */
export function createHorizontalGallery(root, { block, media, reveal }) {
  const q = gsap.utils.selector(root);
  const stage = q(`.${block}__stage`)[0];
  const track = q(`.${block}__track`)[0];
  const slides = q(`.${block}__slide`);

  gsap.from(q('.section-heading__title .line-mask__inner'), {
    yPercent: 110,
    stagger: 0.12,
    ease: 'none',
    scrollTrigger: { trigger: root, start: 'top 80%', end: 'top 30%', scrub: 0.6 },
  });

  const distance = () => track.scrollWidth - window.innerWidth;

  const horizontal = gsap.to(track, {
    x: () => -distance(),
    ease: 'none',
    scrollTrigger: {
      trigger: stage,
      start: 'top top',
      end: () => `+=${distance()}`,
      pin: true,
      scrub: 0.8,
      invalidateOnRefresh: true,
    },
  });

  slides.forEach((slide) => {
    const visual = slide.querySelector(media);

    // Échelle : le visuel grandit en approchant du centre puis se retire
    gsap
      .timeline({
        defaults: { ease: 'none' },
        scrollTrigger: {
          trigger: slide,
          containerAnimation: horizontal,
          start: 'left right',
          end: 'right left',
          scrub: true,
        },
      })
      .fromTo(visual, { scale: 0.82, transformOrigin: '0% 50%' }, { scale: 1, duration: 1 })
      .to(visual, { scale: 0.9, transformOrigin: '100% 50%', duration: 1 });

    // Le titre et la fiche glissent vers leur place quand la diapositive arrive
    gsap.from(slide.querySelectorAll(reveal), {
      x: 120,
      autoAlpha: 0,
      stagger: 0.1,
      ease: 'none',
      scrollTrigger: {
        trigger: slide,
        containerAnimation: horizontal,
        start: 'left 75%',
        end: 'left 25%',
        scrub: true,
      },
    });

    gsap.fromTo(
      slide.querySelector(`.${block}__ghost`),
      { xPercent: 40 },
      {
        xPercent: -40,
        ease: 'none',
        scrollTrigger: { trigger: slide, containerAnimation: horizontal, start: 'left right', end: 'right left', scrub: true },
      },
    );

    // Teinte de fond propre à la diapositive au centre de l'écran
    ScrollTrigger.create({
      trigger: slide,
      containerAnimation: horizontal,
      start: 'left 60%',
      end: 'right 40%',
      onToggle: (self) => {
        if (self.isActive) gsap.to(root, { backgroundColor: slide.dataset.tint, duration: 0.6, overwrite: 'auto' });
      },
    });
  });

  return {
    horizontal,
    cleanup: () => gsap.set(root, { clearProps: 'backgroundColor' }),
  };
}
