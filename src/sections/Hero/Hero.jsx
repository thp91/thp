import MagneticButton from '../../components/MagneticButton/MagneticButton';
import Logo from '../../components/Logo/Logo';
import { useScrollTo } from '../../hooks/useLenis';
import './Hero.css';

/**
 * Scène 01 — Entrée.
 * variant="stage" : calque de la scène animée (le logo est alors porté par les pièces animées).
 * variant="flow"  : section classique (mobile, tablette, animations réduites).
 */
export default function Hero({ variant = 'flow' }) {
  const scrollTo = useScrollTo();
  const isFlow = variant === 'flow';

  const handleContact = (event) => {
    event.preventDefault();
    scrollTo('#contact');
  };

  return (
    <section
      className={`hero hero--${variant}`}
      id={isFlow ? 'top' : undefined}
      data-scene={isFlow ? 1 : undefined}
      aria-labelledby="hero-title"
    >
      <div className="hero__content">
        <p className="hero__label label" data-intro="fade">
          Théophile Mazaud / Développeur web freelance
        </p>
        <h1 className="hero__title" id="hero-title">
          <span className="line-mask">
            <span className="line-mask__inner" data-intro="line">
              Votre site.
            </span>
          </span>
          <span className="line-mask">
            <span className="line-mask__inner hero__title-accent" data-intro="line">
              Votre signature.
            </span>
          </span>
        </h1>
        <p className="hero__lead" data-intro="fade">
          Des sites internet qui reflètent votre activité, attirent les bons clients et restent simples à gérer.
        </p>
        <div className="hero__actions" data-intro="fade">
          <MagneticButton href="#contact" onClick={handleContact}>
            Parlons de votre site
          </MagneticButton>
        </div>
      </div>

      <div className="hero__aside">
        <p className="hero__stat" data-intro="fade">
          <span className="hero__stat-value">+7 ans</span>
          <span className="hero__stat-text">d’expérience dans le web</span>
        </p>
        <span className="hero__accent hero__accent--lavender" data-intro="pop" aria-hidden="true" />
        <span className="hero__accent hero__accent--coral" data-intro="pop" aria-hidden="true" />
        <span className="hero__accent hero__accent--ink" data-intro="pop" aria-hidden="true" />
      </div>

      {isFlow && (
        <div className="hero__visual" data-intro="logo">
          <Logo decorative />
        </div>
      )}

      <p className="hero__hint label" aria-hidden="true">
        <span className="hero__hint-text" data-intro="fade">
          Défilez pour découvrir ↓
        </span>
      </p>
    </section>
  );
}
