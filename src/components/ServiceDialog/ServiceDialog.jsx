import { useEffect, useRef } from 'react';
import { gsap } from '../../lib/gsap';
import useLenis, { useScrollTo } from '../../hooks/useLenis';
import useReducedMotion from '../../hooks/useReducedMotion';
import { SERVICES } from '../../data/services';
import './ServiceDialog.css';

/**
 * Détails d'une prestation (exemples, contenu, différence avec les autres offres).
 * <dialog> natif : piège du focus, touche Échap et retour du focus gérés par le navigateur.
 */
export default function ServiceDialog({ service, onClose, onSelect }) {
  const dialogRef = useRef(null);
  const pendingTargetRef = useRef(null);
  const lenis = useLenis();
  const scrollTo = useScrollTo();
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!service) {
      // État et affichage toujours alignés : pas de boîte ouverte sans contenu
      if (dialog.open) dialog.close();
      return undefined;
    }

    if (!dialog.open) dialog.showModal();
    lenis?.stop();

    if (!reducedMotion) {
      gsap.fromTo(
        dialog.querySelector('.service-dialog__panel'),
        { yPercent: 12, autoAlpha: 0 },
        { yPercent: 0, autoAlpha: 1, duration: 0.5, ease: 'power3.out' },
      );
      gsap.fromTo(
        dialog.querySelectorAll('.service-dialog__reveal'),
        { y: 18, autoAlpha: 0 },
        { y: 0, autoAlpha: 1, duration: 0.45, stagger: 0.05, delay: 0.1, ease: 'power2.out' },
      );
    }

    return () => lenis?.start();
  }, [service, lenis, reducedMotion]);

  const close = () => {
    const dialog = dialogRef.current;
    if (reducedMotion) {
      dialog.close();
      return;
    }
    gsap.to(dialog.querySelector('.service-dialog__panel'), {
      yPercent: 8,
      autoAlpha: 0,
      duration: 0.3,
      ease: 'power2.in',
      onComplete: () => dialog.close(),
    });
  };

  // Après fermeture : défilement éventuel vers le contact
  const handleClose = () => {
    onClose();
    if (pendingTargetRef.current) {
      const target = pendingTargetRef.current;
      pendingTargetRef.current = null;
      requestAnimationFrame(() => scrollTo(target));
    }
  };

  const handleContact = (event) => {
    event.preventDefault();
    pendingTargetRef.current = '#contact';
    close();
  };

  // Clic sur le fond (hors du panneau) : fermeture
  const handleClick = (event) => {
    if (event.target === dialogRef.current) close();
  };

  return (
    <dialog
      ref={dialogRef}
      className={`service-dialog${service ? ` service-dialog--${service.tone}` : ''}`}
      aria-labelledby="service-dialog-title"
      onClose={handleClose}
      onCancel={(event) => {
        event.preventDefault();
        close();
      }}
      onClick={handleClick}
    >
      {service && (
        <div className="service-dialog__panel" data-lenis-prevent>
          <div className="service-dialog__header">
            <p className="service-dialog__number label">{service.number} / Prestation</p>
            <button className="service-dialog__close" type="button" onClick={close} data-cursor="link">
              <span className="visually-hidden">Fermer</span>
              <span aria-hidden="true">×</span>
            </button>
          </div>

          <h3 className="service-dialog__title" id="service-dialog-title">
            {service.title}
          </h3>
          <p className="service-dialog__lead service-dialog__reveal">{service.description}</p>

          {/* Repère rapide : à quoi sert chaque offre */}
          <ul className="service-dialog__compare service-dialog__reveal" aria-label="Comparer les prestations">
            {SERVICES.map((item) => (
              <li key={item.id}>
                <button
                  type="button"
                  className={`service-dialog__chip${item.id === service.id ? ' service-dialog__chip--active' : ''}`}
                  aria-current={item.id === service.id ? 'true' : undefined}
                  onClick={() => onSelect(item)}
                  data-cursor="link"
                >
                  <span className="service-dialog__chip-verb">{item.verb}</span>
                  <span className="service-dialog__chip-name">{item.title}</span>
                </button>
              </li>
            ))}
          </ul>

          <div className="service-dialog__grid">
            <section className="service-dialog__block service-dialog__reveal">
              <h4 className="service-dialog__block-title label">Idéal pour</h4>
              <p>{service.idealFor}</p>
            </section>

            <section className="service-dialog__block service-dialog__reveal">
              <h4 className="service-dialog__block-title label">Ce que comprend le site</h4>
              <ul className="service-dialog__list">
                {service.includes.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </section>

            <section className="service-dialog__block service-dialog__block--wide service-dialog__reveal">
              <h4 className="service-dialog__block-title label">Exemples concrets</h4>
              <ul className="service-dialog__examples">
                {service.examples.map((example, index) => (
                  <li key={example} className="service-dialog__example">
                    <span className="service-dialog__example-number label">{String(index + 1).padStart(2, '0')}</span>
                    <span>{example}</span>
                  </li>
                ))}
              </ul>
            </section>
          </div>

          <p className="service-dialog__difference service-dialog__reveal">{service.difference}</p>

          <a className="service-dialog__cta" href="#contact" onClick={handleContact} data-cursor="link">
            Parlons de votre projet <span aria-hidden="true">↗</span>
          </a>
        </div>
      )}
    </dialog>
  );
}
