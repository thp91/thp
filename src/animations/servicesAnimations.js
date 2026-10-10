import { gsap } from '../lib/gsap';

/** Position d'un élément relative à l'un de ses ancêtres positionnés (sans tenir compte des transformations). */
const offsetWithin = (element, ancestor) => {
  let x = 0;
  let y = 0;
  let node = element;
  while (node && node !== ancestor) {
    x += node.offsetLeft;
    y += node.offsetTop;
    node = node.offsetParent;
  }
  return { x, y };
};

/**
 * Scène 05 : la première carte occupe une grande partie de l'écran,
 * puis se range pendant que la suivante prend sa place.
 * La section est épinglée en haut de la fenêtre : son repère est celui de l'écran.
 */
export function createServicesTimeline(section) {
  const root = section.querySelector('.services__viewport');
  const cards = gsap.utils.toArray(root.querySelectorAll('.service-card'));

  const focus = (card, offsetY = 0) => {
    const { x, y } = offsetWithin(card, root);
    const width = card.offsetWidth;
    const height = card.offsetHeight;
    return {
      x: window.innerWidth / 2 - (x + width / 2),
      y: window.innerHeight * 0.55 - (y + height / 2) + offsetY,
      scale: Math.min((window.innerWidth * 0.6) / width, (window.innerHeight * 0.62) / height),
    };
  };

  // Valeurs fonctionnelles : recalculées à chaque rafraîchissement (redimensionnement)
  const focusVars = (card, below = false) => ({
    x: () => focus(card).x,
    y: () => focus(card, below ? window.innerHeight : 0).y,
    scale: () => focus(card).scale,
  });
  // Objet neuf à chaque appel : GSAP enrichit les vars qu'on lui passe (startAt…)
  const rest = () => ({ x: 0, y: 0, scale: 1 });

  cards.forEach((card, index) => gsap.set(card, { zIndex: index + 1 }));

  const tl = gsap.timeline({
    defaults: { ease: 'power2.inOut', duration: 1 },
    scrollTrigger: {
      trigger: root,
      start: 'top top',
      end: '+=180%',
      pin: true,
      scrub: 0.8,
      invalidateOnRefresh: true,
    },
  });

  tl.fromTo(cards[0], focusVars(cards[0]), rest(), 0.2);

  cards.slice(1).forEach((card, i) => {
    const at = 0.05 + i * 1.05;
    tl.fromTo(card, focusVars(card, true), { ...focusVars(card), ease: 'power3.out' }, at)
      .to(card, rest(), at + 1.1);
  });

  tl.to({}, { duration: 0.3 });
  return tl;
}

/**
 * Scène 05, composition portrait : les cartes arrivent l'une après l'autre
 * et forment une pile ; les précédentes reculent légèrement.
 */
export function createServicesDeck(section) {
  const root = section.querySelector('.services__viewport');
  const cards = gsap.utils.toArray(root.querySelectorAll('.service-card'));
  const titleLines = root.querySelectorAll('.section-heading__title .line-mask__inner');

  gsap.from(titleLines, {
    yPercent: 110,
    stagger: 0.12,
    ease: 'none',
    scrollTrigger: { trigger: section, start: 'top 85%', end: 'top 25%', scrub: 0.6 },
  });

  cards.forEach((card, index) => gsap.set(card, { zIndex: index + 1 }));

  const tl = gsap.timeline({
    defaults: { ease: 'power2.inOut', duration: 1 },
    scrollTrigger: {
      trigger: root,
      start: 'top top',
      end: '+=200%',
      pin: true,
      scrub: 0.8,
      invalidateOnRefresh: true,
    },
  });

  // La première carte se pose pendant l'arrivée de la section, avant l'épinglage
  gsap.from(cards[0], {
    yPercent: 40,
    scale: 0.9,
    autoAlpha: 0,
    ease: 'none',
    scrollTrigger: { trigger: section, start: 'top 75%', end: 'top 5%', scrub: 0.6 },
  });

  cards.slice(1).forEach((card, i) => {
    const at = 0.2 + i * 1.1;
    // Départ sous le bord de l'écran, quelle que soit la hauteur de la fenêtre
    tl.fromTo(card, { y: () => window.innerHeight, rotation: 3 }, { y: 0, rotation: 0, ease: 'power3.out' }, at);

    // Les cartes déjà posées reculent dans la pile
    cards.slice(0, i + 1).forEach((previous, j) => {
      const depth = i + 1 - j;
      tl.to(previous, { y: -14 * depth, scale: 1 - 0.05 * depth, duration: 1 }, at);
    });
  });

  tl.to({}, { duration: 0.4 });
  return tl;
}
