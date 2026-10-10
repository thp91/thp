import { useRef } from 'react';
import { addLayoutAnimation, gsap, useGSAP } from '../../lib/gsap';
import { EXPERIENCES } from '../../data/experience';
import SectionHeading from '../../components/SectionHeading/SectionHeading';
import { createAboutTimeline } from '../../animations/aboutAnimations';
import './About.css';

/** Scène 06 — Qui va créer mon site ? */
export default function About() {
  const rootRef = useRef(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      const animate = () => createAboutTimeline(rootRef.current);
      addLayoutAnimation(mm, { wide: animate, narrow: animate });

      return () => mm.revert();
    },
    { scope: rootRef },
  );

  return (
    <section
      ref={rootRef}
      className="about"
      id="a-propos"
      data-scene="6"
      data-header-theme="dark"
      aria-labelledby="about-title"
    >
      <div className="about__inner container">
        <SectionHeading
          id="about-title"
          theme="dark"
          label="04 / Derrière THP, il y a un parcours"
          lines={['+7 années', 'à créer pour le web.']}
          accentIndex={0}
        />

        <div className="about__intro">
          <p>
            Je suis Théophile Mazaud, développeur web indépendant, avec une sensibilité forte pour le design.
            J’aime autant soigner l’apparence d’un site que la façon dont il fonctionne.
          </p>
          <p>
            J’ai travaillé aux côtés d’équipes spécialisées dans la création de sites et le digital. Aujourd’hui,
            je vous accompagne directement, de la première idée jusqu’à la mise en ligne.
          </p>
        </div>

        <div className="about__timeline">
          <p className="about__timeline-label label">Parcours professionnel</p>
          <span className="about__axis" aria-hidden="true">
            <span className="about__axis-fill" />
          </span>
          <ol className="about__list">
            {EXPERIENCES.map((experience) => (
              <li key={experience.id} className="about__item">
                <span className="about__marker" aria-hidden="true" />
                <span className="about__number label">{experience.number}</span>
                <span className="about__body">
                  <span className="about__name">
                    <span className="about__name-outline" aria-hidden="true">
                      {experience.name}
                    </span>
                    <span className="about__name-fill">{experience.name}</span>
                  </span>
                  {experience.role && <span className="about__role">{experience.role}</span>}
                </span>
                {experience.url && (
                  <a
                    className="about__link"
                    href={experience.url}
                    target="_blank"
                    rel="noreferrer"
                    aria-label={`Site de ${experience.name} (nouvel onglet)`}
                  >
                    ↗
                  </a>
                )}
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
