import './BrowserMockup.css';

/**
 * Aperçu d'un site vitrine dans un navigateur (Figma 7:89, 741 × 634).
 * Toutes les cotes sont exprimées en unités de maquette (--u), ce qui permet
 * d'utiliser le même composant dans la scène animée et dans la version fluide.
 * data-piece : bloc qui prend le relais d'une forme du logo à la fin de la construction.
 */
export default function BrowserMockup({ className = '' }) {
  return (
    <div className={`browser-mockup ${className}`.trim()} aria-hidden="true">
      <div className="browser-mockup__frame">
        <div className="browser-mockup__bar browser-mockup__block" data-piece="t-bar">
          <span className="browser-mockup__dot" />
          <span className="browser-mockup__dot" />
          <span className="browser-mockup__dot" />
          <span className="browser-mockup__address browser-mockup__content">votre-entreprise.fr</span>
        </div>

        <span className="browser-mockup__brand browser-mockup__content">Votre entreprise</span>
        <span className="browser-mockup__nav browser-mockup__content">
          <span>Accueil</span>
          <span>Services</span>
          <span>Contact</span>
        </span>

        <div className="browser-mockup__hero browser-mockup__block" data-piece="h-left">
          <span className="browser-mockup__visual browser-mockup__content">
            <span className="browser-mockup__visual-shape browser-mockup__visual-shape--round" />
            <span className="browser-mockup__visual-shape browser-mockup__visual-shape--square" />
          </span>
        </div>
        <span className="browser-mockup__title browser-mockup__content">
          Votre activité mérite d’être remarquée.
        </span>

        <div className="browser-mockup__cta browser-mockup__block" data-piece="p">
          <span className="browser-mockup__cta-label browser-mockup__content">Prendre contact ↗</span>
        </div>

        <div className="browser-mockup__card browser-mockup__card--first browser-mockup__block" data-piece="t-stem">
          <span className="browser-mockup__card-label browser-mockup__content">Site vitrine</span>
        </div>
        <div className="browser-mockup__card browser-mockup__card--second browser-mockup__block" data-piece="h-right">
          <span className="browser-mockup__card-label browser-mockup__content">Site évolutif</span>
        </div>
        <div className="browser-mockup__card browser-mockup__card--third browser-mockup__block" data-piece="card">
          <span className="browser-mockup__card-label browser-mockup__content">E-commerce</span>
        </div>
      </div>
    </div>
  );
}
