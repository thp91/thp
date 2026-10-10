import Logo from '../../components/Logo/Logo';
import './BrandExperience.css';

/** Scène 02 — Le logo devient une expérience : DESIGN × CODE. */
export default function BrandExperience({ variant = 'flow' }) {
  const isFlow = variant === 'flow';

  return (
    <section
      className={`brand brand--${variant}`}
      data-scene={isFlow ? 2 : undefined}
      data-header-theme={isFlow ? 'dark' : undefined}
      aria-labelledby="brand-title"
    >
      <p className="brand__label label">La forme devient interface</p>

      {isFlow && (
        <div className="brand__visual" data-reveal="logo">
          <Logo decorative />
        </div>
      )}

      <h2 className="brand__title" id="brand-title">
        <span className="brand__word brand__word--design">Design</span>{' '}
        <span className="brand__word brand__word--code">× Code</span>
      </h2>
      <p className="brand__text">Deux disciplines, un seul regard.</p>
      <p className="brand__hint" aria-hidden="true">
        ↓ Continuer
      </p>
    </section>
  );
}
