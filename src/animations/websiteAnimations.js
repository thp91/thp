/**
 * Scènes 02 → 04 : les formes deviennent une grille, puis les composants d'un vrai site,
 * qui se transforme enfin en version mobile.
 */
export function addBuildScene(tl, { q, pieces, cardPiece, states }, start) {
  tl.to(q('.brand__label, .brand__title, .brand__text, .brand__hint'), {
    y: -60,
    autoAlpha: 0,
    duration: 0.4,
    stagger: 0.03,
    ease: 'power2.in',
  }, start)
    .to(q('.story__night'), { autoAlpha: 0, duration: 0.5, ease: 'none' }, start + 0.15);

  // Chaque lettre rejoint sa case de la grille et devient un bloc plein
  pieces.forEach(({ id, element }) => {
    const { borderRadius, ...rect } = states[id].tile;
    tl.to(element, { ...rect, duration: 0.8, ease: 'power3.inOut' }, start + 0.1)
      .to(element.querySelector('.story-piece__shape'), { autoAlpha: 0, duration: 0.3 }, start + 0.45)
      .fromTo(
        element.querySelector('.story-piece__block'),
        { autoAlpha: 0, borderRadius: '0px 0px 0px 0px' },
        { autoAlpha: 1, borderRadius, duration: 0.35 },
        start + 0.42,
      );
  });

  tl.fromTo(cardPiece, { scale: 0, autoAlpha: 0 }, { scale: 1, autoAlpha: 1, duration: 0.4, ease: 'back.out(1.6)' }, start + 0.55)
    .fromTo(
      q('.story__grid .tile-grid__tile'),
      { scale: 0, rotation: -25 },
      {
        scale: 1,
        rotation: 0,
        duration: 0.4,
        ease: 'back.out(1.6)',
        stagger: { each: 0.02, from: 'random' },
      },
      start + 0.5,
    )
    .fromTo(q('.builder__label'), { autoAlpha: 0, y: 20 }, { autoAlpha: 1, y: 0, duration: 0.35 }, start + 0.55)
    .fromTo(q('.builder__title .line-mask__inner'), { yPercent: 110 }, { yPercent: 0, duration: 0.5, stagger: 0.1, ease: 'power3.out' }, start + 0.6)
    .fromTo(q('.builder__text, .builder__actions'), { autoAlpha: 0, y: 30 }, { autoAlpha: 1, y: 0, duration: 0.4, stagger: 0.08 }, start + 0.8);

  return start + 1.6; // incluant un court temps de pause sur la grille
}

export function addRevealScene(tl, { q, pieces, cardPiece, states, layout }, start) {
  const frameRadius = `${Math.round((16 * layout.browser.width) / 741)}px`;

  tl.to(q('.builder__label, .builder__title, .builder__text, .builder__actions'), {
    y: -60,
    autoAlpha: 0,
    duration: 0.4,
    stagger: 0.03,
    ease: 'power2.in',
  }, start)
    .to(q('.story__grid .tile-grid__tile'), {
      scale: 0,
      duration: 0.35,
      ease: 'power2.in',
      stagger: { each: 0.012, from: 'random' },
    }, start);

  // Le cadre du navigateur se déploie…
  tl.fromTo(
    q('.story__browser .browser-mockup__frame'),
    { clipPath: `inset(0% 0% 100% 0% round ${frameRadius})` },
    { clipPath: `inset(0% 0% 0% 0% round ${frameRadius})`, duration: 0.6, ease: 'power3.inOut' },
    start + 0.3,
  );

  // …et chaque bloc prend sa place dans l'interface
  [...pieces, { id: 'card', element: cardPiece }].forEach(({ id, element }, index) => {
    tl.to(element, { ...states[id].ui, duration: 0.85, ease: 'power3.inOut' }, start + 0.15 + index * 0.04);
    const block = element.querySelector('.story-piece__block');
    if (block) tl.to(block, { borderRadius: states[id].ui.borderRadius, duration: 0.85 }, start + 0.15 + index * 0.04);
  });

  tl.fromTo(q('.preview__label'), { autoAlpha: 0, y: 20 }, { autoAlpha: 1, y: 0, duration: 0.35 }, start + 0.6)
    .fromTo(q('.preview__title .line-mask__inner'), { yPercent: 110 }, { yPercent: 0, duration: 0.5, stagger: 0.1, ease: 'power3.out' }, start + 0.65)
    .fromTo(q('.preview__text, .preview__caption'), { autoAlpha: 0, y: 30 }, { autoAlpha: 1, y: 0, duration: 0.4, stagger: 0.08 }, start + 0.85);

  // Relais : les formes animées laissent place aux vrais blocs du site, au pixel près
  const swapAt = start + 1.12;
  tl.to([...pieces.map(({ element }) => element), cardPiece], { autoAlpha: 0, duration: 0.02 }, swapAt)
    .fromTo(q('.story__browser .browser-mockup__block'), { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.02 }, swapAt)
    .fromTo(
      q('.story__browser .browser-mockup__content'),
      { autoAlpha: 0, y: 14 },
      { autoAlpha: 1, y: 0, duration: 0.35, stagger: 0.04, ease: 'power2.out' },
      swapAt + 0.02,
    );

  return start + 1.7;
}

export function addResponsiveScene(tl, { q, layout, morphStates }, start) {
  const device = q('.story__browser');
  const morph = q('.story__morph');
  const phone = q('.story__phone');
  const { zoom, hideOnPhone } = layout.responsive;
  const dimmed = q('.preview__title, .preview__text, .preview__label');
  const restored = hideOnPhone ? dimmed.filter((element) => !element.matches(hideOnPhone)) : dimmed;
  const { start: from, end: to, clipStart, clipEnd } = morphStates;

  // 1. Zoom maîtrisé : le site vient au centre de l'attention
  tl.to(device, { ...zoom, duration: 0.6, ease: 'power2.inOut' }, start)
    .to(dimmed, { autoAlpha: 0.12, duration: 0.4 }, start);

  // 2. La fenêtre se redimensionne comme un vrai navigateur : le cadre se resserre
  //    et rogne le site desktop sur ses bords…
  const resizeAt = start + 0.75;
  tl.set(morph, { ...from, autoAlpha: 1 }, resizeAt)
    .fromTo(device, { clipPath: clipStart }, { clipPath: clipEnd, duration: 0.8, ease: 'power3.inOut' }, resizeAt)
    .to(morph, { ...to, duration: 0.8, ease: 'power3.inOut' }, resizeAt)
    // …puis le site se recompose pour le mobile et le cadre devient la coque du téléphone
    .to(device, { autoAlpha: 0, duration: 0.15 }, resizeAt + 0.75)
    .to(morph, { backgroundColor: '#1e1e1f', duration: 0.15 }, resizeAt + 0.75)
    .set(phone, { autoAlpha: 1 }, resizeAt + 0.9)
    .set(morph, { autoAlpha: 0 }, resizeAt + 0.9)
    .from(
      q('.story__phone .phone-mockup__notch, .story__phone .phone-mockup__header, .story__phone .phone-mockup__hero, .story__phone .phone-mockup__card'),
      { y: 16, autoAlpha: 0, duration: 0.3, stagger: 0.06, ease: 'power2.out' },
      resizeAt + 0.9,
    );

  tl.to(restored, { autoAlpha: 1, duration: 0.4 }, start + 1.3)
    .to(q('.preview__caption-item--desktop'), { autoAlpha: 0, y: -16, duration: 0.3 }, start + 1.25)
    .fromTo(q('.preview__caption-item--mobile'), { autoAlpha: 0, y: 16 }, { autoAlpha: 1, y: 0, duration: 0.3 }, start + 1.35);

  // En portrait, le téléphone occupe la place du paragraphe
  if (hideOnPhone) tl.to(q(hideOnPhone), { autoAlpha: 0, duration: 0.3 }, start + 1.3);

  return start + 2;
}
