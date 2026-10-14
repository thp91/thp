import { useRef } from 'react';
import { addLayoutAnimation, gsap, LAYOUT_QUERIES, useGSAP } from '../../lib/gsap';
import { PROCESS_STEPS } from '../../data/process';
import SectionHeading from '../../components/SectionHeading/SectionHeading';
import ProcessVisual from '../../components/ProcessVisual/ProcessVisual';
import FAQ from '../FAQ/FAQ';
import { createProcessTimeline } from '../../animations/processAnimations';
import './Process.css';

/**
 * Scène 08 — Comment se passe un projet ?
 * L'illustration reste visible (sticky) et évolue de l'idée au site en ligne
 * pendant que les quatre étapes défilent. La FAQ suit, en pleine largeur.
 */
export default function Process() {
  const rootRef = useRef(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      const q = gsap.utils.selector(rootRef.current);

      const animate = () => createProcessTimeline(rootRef.current);
      addLayoutAnimation(mm, { wide: animate, narrow: animate });
      mm.add(LAYOUT_QUERIES.reduce, () => {
        q('.process__step').forEach((step) => step.classList.add('process__step--active'));
      });

      return () => mm.revert();
    },
    { scope: rootRef },
  );

  return (
    <section ref={rootRef} className="process" id="process" data-scene="8" aria-labelledby="process-title">
      <div className="process__inner container">
        <SectionHeading
          id="process-title"
          label="06 / Comment ça se passe ?"
          lines={['Simple pour vous.']}
          className="process__heading"
        />

        <div className="process__story">
          <div className="process__visual">
            <ProcessVisual />
          </div>

          <ol className="process__steps">
            {PROCESS_STEPS.map((step) => (
              <li key={step.id} className="process__step">
                <span className="process__number">{step.number}</span>
                <div className="process__content">
                  <h3 className="process__title">{step.title}</h3>
                  <p className="process__text">{step.text}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>

        <FAQ />
      </div>
    </section>
  );
}
