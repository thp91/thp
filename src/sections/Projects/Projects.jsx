import { useRef } from 'react';
import { gsap, MOTION_QUERIES, useGSAP } from '../../lib/gsap';
import { PROJECTS } from '../../data/projects';
import SectionHeading from '../../components/SectionHeading/SectionHeading';
import ProjectCard from '../../components/ProjectCard/ProjectCard';
import { createProjectsTimeline } from '../../animations/projectAnimations';
import { revealFade, revealLines } from '../../animations/reveal';
import './Projects.css';

/** Scène 07 — Projets et réalisations. */
export default function Projects() {
  const rootRef = useRef(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      const q = gsap.utils.selector(rootRef.current);

      mm.add(MOTION_QUERIES.motion, () => createProjectsTimeline(rootRef.current));
      mm.add(MOTION_QUERIES.light, () => {
        revealLines(q('.section-heading__title .line-mask__inner'), rootRef.current);
        q('.projects__slide').forEach((slide) => revealFade(slide, slide));
      });

      return () => mm.revert();
    },
    { scope: rootRef },
  );

  return (
    <section ref={rootRef} className="projects" id="projets" data-scene="7" aria-labelledby="projects-title">
      <div className="projects__intro container">
        <SectionHeading
          id="projects-title"
          label="05 / Projets et contributions"
          lines={['Du concret.', 'Des travaux à découvrir.']}
          accentIndex={1}
        />
        <p className="projects__note">
          Projets personnels, missions en freelance et contributions réalisées en agence : chaque fiche précise
          le contexte et le travail réellement effectué.
        </p>
      </div>

      <div className="projects__stage">
        <ol className="projects__track">
          {PROJECTS.map((project) => (
            <li key={project.id} className="projects__slide" data-tint={project.tint}>
              <span className="projects__ghost" aria-hidden="true">
                {project.number}
              </span>
              <ProjectCard project={project} />
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
