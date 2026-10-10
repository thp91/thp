import MagneticButton from '../../components/MagneticButton/MagneticButton';
import TileGrid from '../../components/TileGrid/TileGrid';
import { useScrollTo } from '../../hooks/useLenis';
import './WebsiteBuilder.css';

/** Scène 03 — Les formes deviennent des composants : un site se construit. */
export default function WebsiteBuilder({ variant = 'flow' }) {
  const scrollTo = useScrollTo();
  const isFlow = variant === 'flow';

  const handleClick = (event) => {
    event.preventDefault();
    scrollTo('#services');
  };

  return (
    <section className={`builder builder--${variant}`} data-scene={isFlow ? 3 : undefined} aria-labelledby="builder-title">
      <p className="builder__label label">01 / De l’idée au site</p>
      <h2 className="builder__title" id="builder-title">
        <span className="line-mask">
          <span className="line-mask__inner">Un site, ça se</span>
        </span>
        <span className="line-mask">
          <span className="line-mask__inner">construit ensemble.</span>
        </span>
      </h2>
      <p className="builder__text">
        Je m’occupe de la conception et du développement. Vous gardez le contrôle de vos contenus.
      </p>

      {isFlow && <TileGrid className="builder__grid" />}

      <div className="builder__actions">
        <MagneticButton href="#services" size="large" onClick={handleClick}>
          Un site professionnel à votre image
        </MagneticButton>
      </div>
    </section>
  );
}
