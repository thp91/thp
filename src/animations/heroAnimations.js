import { gsap } from '../lib/gsap';

/**
 * Animation d'entrée (≈ 1,3 s) : le fond est déjà là, le logo se révèle par masques,
 * puis le titre se place et le bouton apparaît.
 * Les cibles sont repérées par l'attribut data-intro.
 */
export function createHeroIntro(root) {
  const q = gsap.utils.selector(root);
  const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

  // Chaque forme se découvre dans le sens de sa courbe principale
  const logoReveals = q('[data-intro="logo"]');
  const clipFrom = {
    't-bar': 'inset(0% 100% 0% 0%)',
    't-stem': 'inset(0% 0% 100% 0%)',
    'h-left': 'inset(100% 0% 0% 0%)',
    'h-right': 'inset(0% 0% 100% 0%)',
    p: 'inset(0% 0% 0% 100%)',
  };

  logoReveals.forEach((element, index) => {
    tl.fromTo(
      element,
      { clipPath: clipFrom[element.dataset.piece] ?? 'inset(0% 0% 100% 0%)' },
      { clipPath: 'inset(0% 0% 0% 0%)', duration: 0.75, ease: 'power3.inOut' },
      index * 0.08,
    );
  });

  tl.from(q('[data-intro="line"]'), { yPercent: 110, duration: 0.8, stagger: 0.1 }, 0.25)
    .from(q('[data-intro="fade"]'), { y: 18, autoAlpha: 0, duration: 0.6, stagger: 0.06 }, 0.6)
    .from(q('[data-intro="pop"]'), { scale: 0, duration: 0.5, stagger: 0.07, ease: 'back.out(2)' }, 0.75);

  return tl;
}

/**
 * Les formes du logo suivent légèrement le pointeur, uniquement en haut de page.
 * Retourne une fonction de nettoyage.
 */
export function bindLogoPointer(root) {
  const layers = gsap.utils.toArray(root.querySelectorAll('[data-parallax]'));
  const movers = layers.map((layer) => ({
    depth: Number(layer.dataset.parallax),
    x: gsap.quickTo(layer, 'x', { duration: 0.9, ease: 'power3.out' }),
    y: gsap.quickTo(layer, 'y', { duration: 0.9, ease: 'power3.out' }),
  }));

  const handleMove = (event) => {
    const active = window.scrollY < window.innerHeight * 0.25;
    const nx = active ? event.clientX / window.innerWidth - 0.5 : 0;
    const ny = active ? event.clientY / window.innerHeight - 0.5 : 0;
    movers.forEach(({ depth, x, y }) => {
      x(nx * depth);
      y(ny * depth);
    });
  };

  window.addEventListener('pointermove', handleMove, { passive: true });
  return () => window.removeEventListener('pointermove', handleMove);
}
