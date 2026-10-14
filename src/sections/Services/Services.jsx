import { useRef, useState } from 'react';
import { addLayoutAnimation, gsap, useGSAP } from '../../lib/gsap';
import { SERVICES } from '../../data/services';
import SectionHeading from '../../components/SectionHeading/SectionHeading';
import ServiceCard from '../../components/ServiceCard/ServiceCard';
import ServiceDialog from '../../components/ServiceDialog/ServiceDialog';
import { createServicesGallery } from '../../animations/servicesAnimations';
import './Services.css';

/** Scène 05 — Les prestations, en galerie horizontale. */
export default function Services() {
  const rootRef = useRef(null);
  const [activeService, setActiveService] = useState(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      const animate = () => createServicesGallery(rootRef.current);
      addLayoutAnimation(mm, { wide: animate, narrow: animate });
      return () => mm.revert();
    },
    { scope: rootRef },
  );

  return (
    <section ref={rootRef} className="services" id="services" data-scene="5" aria-labelledby="services-title">
      <div className="services__intro container">
        <SectionHeading
          id="services-title"
          label="03 / Ce que je peux créer pour vous"
          lines={['Le bon site.', 'Pour le bon besoin.']}
        />
        <p className="services__note">
          Trois formules selon ce que votre site doit faire : présenter votre activité, s’enrichir avec le temps
          ou vendre en ligne.
        </p>
      </div>

      <div className="services__stage">
        <ol className="services__track">
          {SERVICES.map((service) => (
            <li key={service.id} className="services__slide" data-tint={service.tint}>
              <span className="services__ghost" aria-hidden="true">
                {service.number}
              </span>
              <ServiceCard service={service} onOpen={setActiveService} />
            </li>
          ))}
        </ol>
      </div>

      <ServiceDialog service={activeService} onSelect={setActiveService} onClose={() => setActiveService(null)} />
    </section>
  );
}
