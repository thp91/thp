import { gsap } from '../lib/gsap';
import { EDUCATION_END_YEAR } from '../data/education';

// Tracé qui se dessine (éléments `pathLength="1"`)
const draw = (tl, targets, at, duration = 0.2, stagger = 0) =>
  tl.fromTo(
    targets,
    { strokeDasharray: 1, strokeDashoffset: 1 },
    { strokeDashoffset: 0, duration, stagger, ease: 'power1.inOut' },
    at,
  );

const pop = { scale: 0, transformOrigin: '50% 50%', ease: 'back.out(2.5)' };
const rise = { scaleY: 0, transformOrigin: '50% 100%', ease: 'power2.out' };

/** Construction de chaque école, sur une durée de 1 (rejouée par le curseur). */
const SCENE_BUILDS = {
  'saint-martin': (tl, q) => {
    draw(tl, q('.school__ground'), 0);
    tl.from(q('.school__step'), { ...rise, duration: 0.12, stagger: -0.06 }, 0.08);
    tl.from(q('.school__column'), { ...rise, duration: 0.18, stagger: 0.05 }, 0.2);
    draw(tl, q('.school__door'), 0.38, 0.15);
    tl.from(q('.school__beam'), { scaleX: 0, transformOrigin: '50% 50%', duration: 0.1 }, 0.42);
    draw(tl, q('.school__pediment'), 0.48);
    tl.from(q('.school__pediment'), { fillOpacity: 0, duration: 0.1 }, 0.62);
    tl.from(q('.school__clock'), { ...pop, duration: 0.1 }, 0.6);
    tl.from(q('.school__hands'), { rotation: -540, svgOrigin: '120 66', duration: 0.35, ease: 'power1.out' }, 0.62);
    draw(tl, q('.school__pole'), 0.66, 0.1);
    tl.from(q('.school__flag'), { y: 22, scaleX: 0, transformOrigin: '0% 50%', duration: 0.18 }, 0.76);
    draw(tl, q('.school__square'), 0.55, 0.25);
    draw(tl, q('.school__arc'), 0.7, 0.25);
  },
  lisaa: (tl, q) => {
    draw(tl, q('.school__ground'), 0);
    draw(tl, q('.school__body'), 0.08, 0.22);
    draw(tl, q('.school__roof'), 0.25, 0.22);
    tl.from(q('.school__pane'), { ...pop, duration: 0.1, stagger: 0.05 }, 0.38);
    draw(tl, q('.school__leg'), 0.35, 0.14, 0.03);
    tl.from(q('.school__canvas'), { ...rise, duration: 0.1 }, 0.48);
    draw(tl, q('.school__paint'), 0.58, 0.14, 0.08);
    tl.from(q('.school__swatch'), { ...pop, y: 12, duration: 0.1, stagger: 0.06 }, 0.8);
  },
  hetic: (tl, q) => {
    draw(tl, q('.school__ground'), 0);
    draw(tl, q('.school__body'), 0.06, 0.24);
    tl.from(q('.school__window'), { opacity: 0, duration: 0.06, stagger: { each: 0.025, from: 'random' } }, 0.28);
    draw(tl, q('.school__office'), 0.32, 0.2);
    tl.from(q('.school__office-window'), { ...pop, duration: 0.08, stagger: 0.04 }, 0.48);
    tl.from(q('.school__text'), { opacity: 0, y: 6, duration: 0.1, stagger: 0.08 }, 0.45);
    draw(tl, q('.school__bridge'), 0.5, 0.1);
    tl.from(q('.school__commuter'), { ...pop, duration: 0.05 }, 0.58);
    tl.to(q('.school__commuter'), { x: 32, duration: 0.09, repeat: 3, yoyo: true, ease: 'power1.inOut' }, 0.62);
    tl.from(q('.school__browser'), { opacity: 0, y: 14, duration: 0.12 }, 0.72);
    tl.from(q('.school__browser-block'), { scaleX: 0, transformOrigin: '0% 50%', duration: 0.08, stagger: 0.06 }, 0.82);
  },
  etna: (tl, q) => {
    draw(tl, q('.school__ground'), 0);
    draw(tl, q('.school__body'), 0.06, 0.24);
    tl.from(q('.school__screen'), { scaleY: 0, transformOrigin: '50% 50%', duration: 0.1, ease: 'power2.out' }, 0.26);
    tl.from(q('.school__code'), { scaleX: 0, transformOrigin: '0% 50%', duration: 0.07, stagger: 0.07 }, 0.36);
    tl.from(q('.school__caret'), { opacity: 0, duration: 0.02, repeat: 5, yoyo: true }, 0.62);
    tl.from(q('.school__led'), { opacity: 0, duration: 0.04, stagger: { each: 0.03, from: 'random' } }, 0.36);
    tl.from(q('.school__brace'), { opacity: 0, x: (i) => (i ? -16 : 16), duration: 0.14 }, 0.55);
    tl.from(q('.school__cap'), { y: -80, rotation: -25, opacity: 0, transformOrigin: '50% 50%', duration: 0.22, ease: 'bounce.out' }, 0.76);
  },
};

/**
 * Formation : le défilement fait avancer un curseur du DESIGN au CODE.
 * --progress (0 → 1) pilote en CSS sa position, sa forme (rond → carré) et sa couleur
 * (lavande → corail). Chaque école s'allume quand le curseur l'atteint et son bâtiment
 * se construit pendant que le curseur la traverse ; l'année est interpolée entre les
 * années d'entrée. En paysage, la piste est épinglée le temps du parcours (si elle tient
 * dans l'écran).
 */
export function createEducationAnimations(root, { wide = false } = {}) {
  const block = root.querySelector('.education');
  if (!block) return () => {};
  const q = gsap.utils.selector(block);
  const track = q('.education__track')[0];
  const list = q('.education__list')[0];
  const stops = q('.education__stop');
  const yearLabel = q('.education__cursor-year')[0];

  gsap.from(q('.education__title .line-mask__inner'), {
    yPercent: 110,
    stagger: 0.12,
    ease: 'none',
    scrollTrigger: { trigger: block, start: 'top 85%', end: 'top 45%', scrub: 0.6 },
  });

  // Position de chaque école le long de la ligne (0 → 1), selon l'orientation de la piste
  let marks = [];
  const measure = () => {
    const horizontal = getComputedStyle(track).getPropertyValue('--axis').trim() === 'horizontal';
    const length = horizontal ? list.offsetWidth : list.offsetHeight;
    marks = stops.map((stop) => ({
      at: (horizontal ? stop.offsetLeft : stop.offsetTop) / length,
      year: Number(stop.dataset.year),
    }));
    marks.push({ at: 1, year: EDUCATION_END_YEAR });
  };

  const yearAt = (p) => {
    const next = marks.findIndex((m) => m.at >= p);
    if (next <= 0) return marks[0]?.year ?? EDUCATION_END_YEAR;
    const a = marks[next - 1];
    const b = marks[next];
    return Math.round(a.year + ((p - a.at) / Math.max(0.0001, b.at - a.at)) * (b.year - a.year));
  };

  // Une timeline en pause par école, avancée par le curseur entre son repère et le suivant
  const builds = stops.map((stop) => {
    const scene = stop.querySelector('.education__scene');
    const build = scene && SCENE_BUILDS[scene.dataset.sceneId];
    if (!build) return null;
    const tl = gsap.timeline({ paused: true, defaults: { ease: 'none' } });
    build(tl, gsap.utils.selector(scene));
    return tl;
  });

  const render = (p) => {
    block.style.setProperty('--progress', p.toFixed(4));
    yearLabel.textContent = yearAt(p);
    stops.forEach((stop, i) => {
      stop.classList.toggle('education__stop--active', p >= marks[i].at - 0.01);
      const tl = builds[i];
      if (!tl) return;
      const from = marks[i].at - 0.01;
      const to = marks[i + 1].at - 0.02;
      tl.progress(gsap.utils.clamp(0, 1, (p - from) / Math.max(0.01, to - from)));
    });
  };

  measure();
  const state = { p: 0 };
  render(0);
  // Épinglage seulement si toute la piste reste visible
  const pin = wide && track.offsetHeight < window.innerHeight * 0.82;
  gsap.to(state, {
    p: 1,
    ease: 'none',
    onUpdate: () => render(state.p),
    scrollTrigger: {
      trigger: track,
      start: pin ? 'center 54%' : 'top 70%',
      end: pin ? '+=240%' : 'bottom 55%',
      pin,
      scrub: 0.6,
      onRefresh: () => {
        measure();
        render(state.p);
      },
    },
  });

  return () => {
    block.style.removeProperty('--progress');
    yearLabel.textContent = EDUCATION_END_YEAR;
    stops.forEach((stop) => stop.classList.add('education__stop--active'));
    builds.forEach((tl) => tl?.progress(1));
  };
}
