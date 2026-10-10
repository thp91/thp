import { gsap, ScrollTrigger } from '../lib/gsap';

/**
 * Scène 07 : séquence horizontale épinglée. Chaque projet entre, prend l'échelle 1
 * au centre, son titre se repositionne et la couleur de fond s'adapte au projet.
 */
export function createProjectsTimeline(root) {
  const q = gsap.utils.selector(root);
  const stage = q('.projects__stage')[0];
  const track = q('.projects__track')[0];
  const slides = q('.projects__slide');

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
    const media = slide.querySelector('.project-card__media');
    const title = slide.querySelector('.project-card__title');
    const body = slide.querySelector('.project-card__body');

    // Échelle : la carte grandit en approchant du centre puis se retire
    gsap.timeline({
      defaults: { ease: 'none' },
      scrollTrigger: {
        trigger: slide,
        containerAnimation: horizontal,
        start: 'left right',
        end: 'right left',
        scrub: true,
      },
    })
      .fromTo(media, { scale: 0.82, transformOrigin: '0% 50%' }, { scale: 1, duration: 1 })
      .to(media, { scale: 0.9, transformOrigin: '100% 50%', duration: 1 });

    // Titre et fiche : glissent vers leur place quand la carte arrive
    gsap.from([title, body.querySelector('.project-card__details')], {
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
      slide.querySelector('.projects__ghost'),
      { xPercent: 40 },
      {
        xPercent: -40,
        ease: 'none',
        scrollTrigger: { trigger: slide, containerAnimation: horizontal, start: 'left right', end: 'right left', scrub: true },
      },
    );

    // Teinte de fond du projet au centre de l'écran
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

  return () => gsap.set(root, { clearProps: 'backgroundColor' });
}
