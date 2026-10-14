import ServiceVisual from '../ServiceVisual/ServiceVisual';
import './ServiceCard.css';

/** Carte d'une prestation : esquisse de l'interface + fiche, avec accès aux exemples. */
export default function ServiceCard({ service, onOpen }) {
  const { id, number, title, verb, description, idealFor, tone } = service;

  return (
    <article className={`service-card service-card--${tone}`}>
      <div className="service-card__media">
        <ServiceVisual variant={id} />
      </div>

      <div className="service-card__body">
        <p className="service-card__meta label">
          <span>{number} / Prestation</span>
          <span className="service-card__verb">{verb}</span>
        </p>
        <h3 className="service-card__title">{title}</h3>
        <p className="service-card__text">{description}</p>
        <div className="service-card__ideal">
          <p className="service-card__ideal-label label">Idéal pour</p>
          <p className="service-card__ideal-text">{idealFor}</p>
        </div>
        <button
          className="service-card__toggle"
          type="button"
          aria-haspopup="dialog"
          onClick={() => onOpen(service)}
          data-cursor="link"
        >
          <span className="service-card__toggle-label">
            Voir des exemples<span className="visually-hidden"> : {title}</span>
          </span>
          <span className="service-card__arrow" aria-hidden="true">
            ↗
          </span>
        </button>
      </div>
    </article>
  );
}
