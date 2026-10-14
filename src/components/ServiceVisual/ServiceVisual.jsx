import './ServiceVisual.css';

/**
 * Esquisse d'interface propre à chaque offre (blocs et traits, sans faux contenu).
 * Les éléments marqués data-sketch sont animés au défilement (servicesAnimations.js).
 */
const Nav = () => (
  <span className="service-visual__nav">
    <span className="service-visual__brand" />
    <span className="service-visual__links">
      <span className="service-visual__line service-visual__line--xs" />
      <span className="service-visual__line service-visual__line--xs" />
      <span className="service-visual__line service-visual__line--xs" />
    </span>
  </span>
);

function Vitrine() {
  return (
    <>
      <Nav />
      <span className="service-visual__hero" data-sketch="hero">
        <span className="service-visual__line service-visual__line--title" data-sketch="line" />
        <span className="service-visual__line service-visual__line--title service-visual__line--short" data-sketch="line" />
        <span className="service-visual__pill" data-sketch="pop">Contact</span>
        <span className="service-visual__orb" data-sketch="pop" />
      </span>
      <span className="service-visual__row">
        <span className="service-visual__card service-visual__card--ink" data-sketch="rise" />
        <span className="service-visual__card service-visual__card--lavender" data-sketch="rise" />
        <span className="service-visual__card service-visual__card--coral" data-sketch="rise" />
      </span>
    </>
  );
}

function Evolutif() {
  return (
    <>
      <Nav />
      <span className="service-visual__line service-visual__line--label" />
      <span className="service-visual__grid">
        {[0, 1, 2, 3, 4].map((index) => (
          <span key={index} className="service-visual__article" data-sketch="rise">
            <span className={`service-visual__thumb service-visual__thumb--${index % 3}`} />
            <span className="service-visual__line" />
            <span className="service-visual__line service-visual__line--short" />
          </span>
        ))}
        <span className="service-visual__article service-visual__article--slot">
          <span className="service-visual__article-new" data-sketch="new">
            <span className="service-visual__thumb service-visual__thumb--new" />
            <span className="service-visual__line" />
            <span className="service-visual__line service-visual__line--short" />
          </span>
          <span className="service-visual__badge" data-sketch="badge">Nouveau</span>
        </span>
      </span>
    </>
  );
}

function Ecommerce() {
  return (
    <>
      <span className="service-visual__nav">
        <span className="service-visual__brand" />
        <span className="service-visual__cart">
          Panier
          <span className="service-visual__count">
            <span className="service-visual__count-value" data-sketch="count-from">0</span>
            <span className="service-visual__count-value service-visual__count-value--next" data-sketch="count-to">
              1
            </span>
          </span>
        </span>
      </span>
      <span className="service-visual__shop">
        {[0, 1, 2, 3].map((index) => (
          <span key={index} className="service-visual__product" data-sketch="rise">
            <span className={`service-visual__thumb service-visual__thumb--${index % 3}`} />
            <span className="service-visual__line" />
            <span className="service-visual__product-footer">
              <span className="service-visual__line service-visual__line--xs" />
              <span className={`service-visual__add${index === 1 ? ' service-visual__add--active' : ''}`} />
            </span>
          </span>
        ))}
        <span className="service-visual__flyer" data-sketch="flyer" />
      </span>
    </>
  );
}

const VARIANTS = { vitrine: Vitrine, evolutif: Evolutif, ecommerce: Ecommerce };

export default function ServiceVisual({ variant }) {
  const Sketch = VARIANTS[variant];
  return (
    <span className={`service-visual service-visual--${variant}`} aria-hidden="true">
      <span className="service-visual__chrome">
        <span className="service-visual__dot" />
        <span className="service-visual__dot" />
        <span className="service-visual__dot" />
      </span>
      <span className="service-visual__screen">
        <Sketch />
      </span>
    </span>
  );
}
