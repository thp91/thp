import { useRef } from 'react';
import { addLayoutAnimation, gsap, LAYOUT_QUERIES, useGSAP } from '../../lib/gsap';
import { PROCESS_STEPS } from '../../data/process';
import SectionHeading from '../../components/SectionHeading/SectionHeading';
import FAQ from '../FAQ/FAQ';
import { createProcessTimeline } from '../../animations/processAnimations';
import './Process.css';

/** Scène 08 — Comment se passe un projet ? + FAQ. */
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

        <div className="process__steps">
          <svg className="process__path" viewBox="0 0 24 400" preserveAspectRatio="none" aria-hidden="true">
            <line className="process__path-base" x1="12" y1="0" x2="12" y2="400" />
            <line className="process__path-line" x1="12" y1="0" x2="12" y2="400" pathLength="1" />
          </svg>
          <ol className="process__list">
            {PROCESS_STEPS.map((step, index) => (
              <li key={step.id} className={`process__step process__step--${index + 1}`}>
                <span className="process__glyph" aria-hidden="true" />
                <span className="process__number label">{step.number}</span>
                <h3 className="process__title">{step.title}</h3>
                <p className="process__text">{step.text}</p>
              </li>
            ))}
          </ol>
        </div>

        <FAQ />
      </div>
    </section>
  );
}
