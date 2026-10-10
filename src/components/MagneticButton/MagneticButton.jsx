import { useRef } from 'react';
import { gsap, useGSAP } from '../../lib/gsap';
import './MagneticButton.css';

/**
 * Bouton / lien avec remplissage au survol et, sur pointeur précis,
 * léger effet magnétique. Rendu en <a> si `href` est fourni.
 */
export default function MagneticButton({
  href,
  children,
  variant = 'dark',
  size = 'medium',
  magnetic = true,
  className = '',
  arrow = true,
  onClick,
  type = 'button',
  ...rest
}) {
  const rootRef = useRef(null);

  useGSAP(
    () => {
      if (!magnetic) return;
      const mm = gsap.matchMedia();

      mm.add('(pointer: fine) and (prefers-reduced-motion: no-preference)', () => {
        const element = rootRef.current;
        const label = element.querySelector('.magnetic-button__label');
        const xTo = gsap.quickTo(element, 'x', { duration: 0.5, ease: 'power3.out' });
        const yTo = gsap.quickTo(element, 'y', { duration: 0.5, ease: 'power3.out' });
        const labelX = gsap.quickTo(label, 'x', { duration: 0.5, ease: 'power3.out' });

        const handleMove = (event) => {
          const rect = element.getBoundingClientRect();
          const dx = event.clientX - (rect.left + rect.width / 2);
          const dy = event.clientY - (rect.top + rect.height / 2);
          xTo(dx * 0.22);
          yTo(dy * 0.3);
          labelX(dx * 0.08);
        };
        const handleLeave = () => {
          xTo(0);
          yTo(0);
          labelX(0);
        };

        element.addEventListener('pointermove', handleMove);
        element.addEventListener('pointerleave', handleLeave);
        return () => {
          element.removeEventListener('pointermove', handleMove);
          element.removeEventListener('pointerleave', handleLeave);
        };
      });

      return () => mm.revert();
    },
    { scope: rootRef, dependencies: [magnetic] },
  );

  const classes = [
    'magnetic-button',
    `magnetic-button--${variant}`,
    `magnetic-button--${size}`,
    className,
  ]
    .filter(Boolean)
    .join(' ');

  const content = (
    <>
      <span className="magnetic-button__fill" aria-hidden="true" />
      <span className="magnetic-button__label">
        {children}
        {arrow && (
          <span className="magnetic-button__arrow" aria-hidden="true">
            ↗
          </span>
        )}
      </span>
    </>
  );

  if (href) {
    return (
      <a ref={rootRef} className={classes} href={href} onClick={onClick} data-cursor="link" {...rest}>
        {content}
      </a>
    );
  }

  return (
    <button ref={rootRef} className={classes} type={type} onClick={onClick} data-cursor="link" {...rest}>
      {content}
    </button>
  );
}
