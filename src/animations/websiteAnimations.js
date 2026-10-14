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

/**
 * Le site devient mobile en se recomposant : ce sont les mêmes blocs (issus du logo)
 * qui se déplacent vers leur place dans la version téléphone.
 * - la barre noire du navigateur s'élargit et devient la coque ;
 * - la page blanche se resserre et devient l'écran ;
 * - bloc principal, bouton et cartes glissent et s'empilent ;
 * - les textes s'effacent pendant le déplacement et réapparaissent recomposés.
 * Les cibles sont mesurées sur la maquette du téléphone (relais au pixel près).
 */
export function addResponsiveScene(tl, { q, layout, pieces, cardPiece, measure }, start) {
  const { hideOnPhone } = layout.responsive;
  const device = q('.story__browser');
  const morph = q('.story__morph')[0];
  const phone = q('.story__phone');
  const dimmed = q('.preview__title, .preview__text, .preview__label');
  const restored = hideOnPhone ? dimmed.filter((element) => !element.matches(hideOnPhone)) : dimmed;

  const piece = (id) => (id === 'card' ? cardPiece : pieces.find((item) => item.id === id).element);
  const TARGETS = {
    't-bar': 'device',
    'h-left': 'hero',
    p: 'cta',
    't-stem': 'card-ink',
    'h-right': 'card-lavender',
    card: 'card-coral',
  };
  // La page démarre sous la barre noire : la barre reste visible et s'élargit en coque derrière l'écran
  const frame = measure('.story__browser .browser-mockup__frame');
  const bar = measure('.story__browser .browser-mockup__bar');
  const radius = parseFloat(frame.borderRadius);
  const page = {
    ...frame,
    y: frame.y + bar.height,
    height: frame.height - bar.height,
    borderRadius: `0px 0px ${radius}px ${radius}px`,
  };
  const screen = measure('.story__phone [data-phone="screen"]');

  // 1. Les textes du site desktop s'effacent : il ne reste que sa structure
  tl.to(dimmed, { autoAlpha: 0.25, duration: 0.3 }, start)
    .to(q('.story__browser .browser-mockup__content, .story__browser .browser-mockup__dot'), { autoAlpha: 0, duration: 0.25, stagger: 0.01 }, start);

  // 2. Relais invisible : les blocs animés reprennent la place exacte du navigateur
  const swapAt = start + 0.3;
  tl.set(morph, { ...page, autoAlpha: 1, zIndex: 1 }, swapAt)
    .set(piece('t-bar'), { autoAlpha: 1, zIndex: 0 }, swapAt)
    .set(Object.keys(TARGETS).filter((id) => id !== 't-bar').map(piece), { autoAlpha: 1, zIndex: 2 }, swapAt)
    .set(device, { autoAlpha: 0 }, swapAt);

  // 3. Recomposition : chaque bloc rejoint sa place dans la version mobile
  const moveAt = swapAt + 0.05;
  tl.to(morph, { ...screen, duration: 0.9, ease: 'power3.inOut' }, moveAt);
  Object.entries(TARGETS).forEach(([id, target], index) => {
    const { borderRadius, ...rect } = measure(`.story__phone [data-phone="${target}"]`);
    const element = piece(id);
    tl.to(element, { ...rect, duration: 0.9, ease: 'power3.inOut' }, moveAt + index * 0.03).to(
      element.querySelector('.story-piece__block'),
      { borderRadius, duration: 0.9, ease: 'power3.inOut' },
      moveAt + index * 0.03,
    );
  });

  // 4. Le téléphone prend le relais et ses contenus s'installent
  const doneAt = moveAt + 1.05;
  tl.set(phone, { autoAlpha: 1 }, doneAt)
    .set([morph, ...Object.keys(TARGETS).map(piece)], { autoAlpha: 0 }, doneAt)
    .from(q('.story__phone [data-phone-text]'), { y: 10, autoAlpha: 0, duration: 0.3, stagger: 0.04, ease: 'power2.out' }, doneAt)
    .to(restored, { autoAlpha: 1, duration: 0.4 }, doneAt)
    .to(q('.preview__caption-item--desktop'), { autoAlpha: 0, y: -16, duration: 0.3 }, doneAt - 0.1)
    .fromTo(q('.preview__caption-item--mobile'), { autoAlpha: 0, y: 16 }, { autoAlpha: 1, y: 0, duration: 0.3 }, doneAt);

  // En portrait, le téléphone occupe la place du paragraphe
  if (hideOnPhone) tl.to(q(hideOnPhone), { autoAlpha: 0, duration: 0.3 }, swapAt);

  return doneAt + 0.5;
}
