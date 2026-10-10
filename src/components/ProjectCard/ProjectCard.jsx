import { useRef } from 'react';
import { gsap, useGSAP } from '../../lib/gsap';
import { PROJECT_KINDS } from '../../data/projects';
import TileGrid from '../TileGrid/TileGrid';
import './ProjectCard.css';

/**
 * Carte projet : aperçu dans un cadre de navigateur + fiche (besoin, travail, résultat).
 * Réagit légèrement au pointeur (inclinaison) sur les appareils à pointeur précis.
 */
export default function ProjectCard({ project }) {
  const rootRef = useRef(null);
  const { name, number, type, kind, agency, need, work, result, image, url, placeholder } = project;

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add('(pointer: fine) and (prefers-reduced-motion: no-preference)', () => {
        const media = rootRef.current.querySelector('.project-card__media');
        const rotateX = gsap.quickTo(media, 'rotationX', { duration: 0.6, ease: 'power3.out' });
        const rotateY = gsap.quickTo(media, 'rotationY', { duration: 0.6, ease: 'power3.out' });

        const handleMove = (event) => {
          const rect = media.getBoundingClientRect();
          rotateY(((event.clientX - rect.left) / rect.width - 0.5) * 6);
          rotateX(-((event.clientY - rect.top) / rect.height - 0.5) * 6);
        };
        const handleLeave = () => {
          rotateX(0);
          rotateY(0);
        };
        media.addEventListener('pointermove', handleMove);
        media.addEventListener('pointerleave', handleLeave);
        return () => {
          media.removeEventListener('pointermove', handleMove);
          media.removeEventListener('pointerleave', handleLeave);
        };
      });
      return () => mm.revert();
    },
    { scope: rootRef },
  );

  const MediaTag = url ? 'a' : 'div';
  const mediaProps = url
    ? { href: url, target: '_blank', rel: 'noreferrer', 'data-cursor': 'view', 'aria-label': `Voir le site ${name} (nouvel onglet)` }
    : {};

  return (
    <article ref={rootRef} className={`project-card${placeholder ? ' project-card--placeholder' : ''}`}>
      <div className="project-card__stage">
        <MediaTag className="project-card__media" {...mediaProps}>
          <span className="project-card__chrome" aria-hidden="true">
            <span className="project-card__dot" />
            <span className="project-card__dot" />
            <span className="project-card__dot" />
          </span>
          {image ? (
            <img className="project-card__image" src={image} alt={`Capture du site ${name}`} loading="lazy" decoding="async" />
          ) : (
            <span className="project-card__artwork">
              <TileGrid className="project-card__tiles" />
              {placeholder && <span className="project-card__badge label">Visuel à venir</span>}
            </span>
          )}
        </MediaTag>
      </div>

      <div className="project-card__body">
        <p className="project-card__meta label">
          <span>{number} / Projet</span>
          <span className={`project-card__kind project-card__kind--${kind}`}>{PROJECT_KINDS[kind]}</span>
        </p>
        <h3 className="project-card__title">{name}</h3>
        <p className="project-card__type">
          {type}
          {agency && <span className="project-card__agency"> — {agency}</span>}
        </p>
        <dl className="project-card__details">
          <div className="project-card__detail">
            <dt className="label">Besoin</dt>
            <dd>{need}</dd>
          </div>
          <div className="project-card__detail">
            <dt className="label">Travail réalisé</dt>
            <dd>{work}</dd>
          </div>
          <div className="project-card__detail">
            <dt className="label">Livré</dt>
            <dd>{result}</dd>
          </div>
        </dl>
      </div>
    </article>
  );
}
