import './PhoneMockup.css';

/** Le même site vitrine, recomposé pour un écran de téléphone (300 × 620 unités). */
export default function PhoneMockup({ className = '' }) {
  return (
    <div className={`phone-mockup ${className}`.trim()} aria-hidden="true">
      <div className="phone-mockup__device">
        <div className="phone-mockup__screen">
          <span className="phone-mockup__notch" />
          <div className="phone-mockup__header">
            <span className="phone-mockup__brand">Votre entreprise</span>
            <span className="phone-mockup__burger" />
          </div>
          <div className="phone-mockup__hero">
            <span className="phone-mockup__title">Votre activité mérite d’être remarquée.</span>
            <span className="phone-mockup__cta">Prendre contact ↗</span>
            <span className="phone-mockup__shape" />
          </div>
          <div className="phone-mockup__cards">
            <span className="phone-mockup__card phone-mockup__card--ink">Site vitrine</span>
            <span className="phone-mockup__card phone-mockup__card--lavender">Site évolutif</span>
          </div>
        </div>
      </div>
    </div>
  );
}
