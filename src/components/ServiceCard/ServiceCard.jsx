import ServiceVisual from '../ServiceVisual/ServiceVisual';
import './ServiceCard.css';

/** Carte d'une prestation : esquisse de l'interface + fiche. */
export default function ServiceCard({ service }) {
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
      </div>
    </article>
  );
}
