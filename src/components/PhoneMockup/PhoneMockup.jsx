import './PhoneMockup.css';

/**
 * Le même site vitrine, recomposé pour un écran de téléphone (300 × 620 unités).
 * data-phone : zones vers lesquelles se déplacent les blocs du navigateur (scène 04).
 * data-phone-text : contenus qui s'affichent une fois le site recomposé.
 */
export default function PhoneMockup({ className = '' }) {
  return (
    <div className={`phone-mockup ${className}`.trim()} aria-hidden="true">
      <div className="phone-mockup__device" data-phone="device">
        <div className="phone-mockup__screen" data-phone="screen">
          <span className="phone-mockup__notch" data-phone-text />
          <div className="phone-mockup__header" data-phone-text>
            <span className="phone-mockup__brand">Votre entreprise</span>
            <span className="phone-mockup__burger" />
          </div>
          <div className="phone-mockup__hero" data-phone="hero">
            <span className="phone-mockup__title" data-phone-text>
              Votre activité mérite d’être remarquée.
            </span>
            <span className="phone-mockup__cta" data-phone="cta">
              <span data-phone-text>Prendre contact ↗</span>
            </span>
            <span className="phone-mockup__shape" data-phone-text />
          </div>
          <div className="phone-mockup__cards">
            <span className="phone-mockup__card phone-mockup__card--ink" data-phone="card-ink">
              <span data-phone-text>Site vitrine</span>
            </span>
            <span className="phone-mockup__card phone-mockup__card--lavender" data-phone="card-lavender">
              <span data-phone-text>Site évolutif</span>
            </span>
            <span className="phone-mockup__card phone-mockup__card--coral" data-phone="card-coral">
              <span data-phone-text>E-commerce</span>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
