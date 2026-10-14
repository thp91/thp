import { useRef } from 'react';
import { addLayoutAnimation, gsap, useGSAP } from '../../lib/gsap';
import { PROJECTS } from '../../data/projects';
import SectionHeading from '../../components/SectionHeading/SectionHeading';
import ProjectCard from '../../components/ProjectCard/ProjectCard';
import { createProjectsStack } from '../../animations/projectAnimations';
import './Projects.css';

/** Scène 07 — Projets et réalisations : une pile de fiches qui se recouvrent au défilement. */
export default function Projects() {
  const rootRef = useRef(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      const animate = () => createProjectsStack(rootRef.current);
      addLayoutAnimation(mm, { wide: animate, narrow: animate });
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

      <ol className="projects__stack container">
        {PROJECTS.map((project, index) => (
          <li
            key={project.id}
            className="projects__item"
            data-tint={project.tint}
            style={{ '--index': index }}
          >
            <div className="projects__card">
              <span className="projects__ghost" aria-hidden="true">
                {project.number}
              </span>
              <ProjectCard project={project} />
              <span className="projects__shade" aria-hidden="true" />
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}
