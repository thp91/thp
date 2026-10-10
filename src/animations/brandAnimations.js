/**
 * Scène 01 → 02 : la composition d'entrée s'efface, le fond passe au noir,
 * le logo s'agrandit puis ses lettres se détachent ; DESIGN × CODE s'installe.
 */
export function addBrandScene(tl, { q, pieces, states }) {
  const start = 0;

  tl.to(q('.hero__content'), { y: -90, autoAlpha: 0, duration: 0.5, ease: 'power2.in' }, start)
    .to(q('.hero__aside, .hero__hint'), { y: -50, autoAlpha: 0, duration: 0.4, ease: 'power2.in' }, start + 0.05)
    .to(q('.story__night'), { autoAlpha: 1, duration: 0.6, ease: 'none' }, start + 0.2);

  // Le logo prend toute la place (Figma 10:12)…
  pieces.forEach(({ id, element }) => {
    tl.to(element, { ...states[id].brand, duration: 0.75, ease: 'power2.inOut' }, start + 0.1);
  });

  // …puis les lettres se détachent : le T s'écarte, le H s'ouvre, le P grandit
  pieces.forEach(({ id, element }) => {
    tl.to(element, { ...states[id].detached, duration: 0.55, ease: 'power2.inOut' }, start + 0.85);
  });

  tl.fromTo(q('.brand__label'), { autoAlpha: 0, y: 20 }, { autoAlpha: 1, y: 0, duration: 0.4 }, start + 0.6)
    .fromTo(q('.brand__word--design'), { xPercent: -40, autoAlpha: 0 }, { xPercent: 0, autoAlpha: 1, duration: 0.55, ease: 'power3.out' }, start + 0.85)
    .fromTo(q('.brand__word--code'), { xPercent: 40, autoAlpha: 0 }, { xPercent: 0, autoAlpha: 1, duration: 0.55, ease: 'power3.out' }, start + 0.9)
    .fromTo(q('.brand__text, .brand__hint'), { y: 24, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.4, stagger: 0.08 }, start + 1.05);

  return start + 1.5;
}
