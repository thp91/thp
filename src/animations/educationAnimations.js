import { gsap } from '../lib/gsap';
import { EDUCATION_END_YEAR } from '../data/education';

/**
 * Formation : le défilement fait avancer un curseur du DESIGN au CODE.
 * --progress (0 → 1) pilote en CSS sa position, sa forme (rond → carré) et sa couleur
 * (lavande → corail). Chaque école s'allume quand le curseur l'atteint ; l'année
 * affichée est interpolée entre les années d'entrée.
 */
export function createEducationAnimations(root) {
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

  const render = (p) => {
    block.style.setProperty('--progress', p.toFixed(4));
    yearLabel.textContent = yearAt(p);
    stops.forEach((stop, i) => stop.classList.toggle('education__stop--active', p >= marks[i].at - 0.01));
  };

  measure();
  const state = { p: 0 };
  render(0);
  gsap.to(state, {
    p: 1,
    ease: 'none',
    onUpdate: () => render(state.p),
    scrollTrigger: {
      trigger: track,
      start: 'top 70%',
      end: 'bottom 55%',
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
  };
}
