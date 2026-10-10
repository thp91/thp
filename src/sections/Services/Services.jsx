import { useRef } from 'react';
import { addLayoutAnimation, gsap, useGSAP } from '../../lib/gsap';
import { SERVICES } from '../../data/services';
import SectionHeading from '../../components/SectionHeading/SectionHeading';
import { createServicesDeck, createServicesTimeline } from '../../animations/servicesAnimations';
import './Services.css';

/** Scène 05 — Les prestations. */
export default function Services() {
  const rootRef = useRef(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      addLayoutAnimation(mm, {
        wide: () => createServicesTimeline(rootRef.current),
        narrow: () => createServicesDeck(rootRef.current),
      });

      return () => mm.revert();
    },
    { scope: rootRef },
  );

  return (
    <section ref={rootRef} className="services" id="services" data-scene="5" aria-labelledby="services-title">
      <div className="services__viewport">
        <div className="services__inner container">
          <SectionHeading
            id="services-title"
            label="03 / Ce que je peux créer pour vous"
            lines={['Le bon site.', 'Pour le bon besoin.']}
          />

          <ul className="services__list">
            {SERVICES.map((service) => (
              <li key={service.id} className={`service-card service-card--${service.tone}`}>
                <div className="service-card__top">
                  <p className="service-card__number label">{service.number} / Prestation</p>
                  <span className="service-card__arrow" aria-hidden="true">
                    ↗
                  </span>
                </div>
                <h3 className="service-card__title">{service.title}</h3>
                <p className="service-card__text">{service.description}</p>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
