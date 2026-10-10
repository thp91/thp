import { useEffect, useRef, useState } from 'react';
import { gsap } from '../../lib/gsap';
import useMediaQuery from '../../hooks/useMediaQuery';
import './CustomCursor.css';

const LABELS = { view: 'Voir', drag: 'Glisser' };

/**
 * Curseur personnalisé : uniquement avec un pointeur précis et sans réduction des animations.
 * États pilotés par l'attribut data-cursor des éléments survolés : link | view | drag.
 */
export default function CustomCursor() {
  const enabled = useMediaQuery('(pointer: fine) and (hover: hover) and (prefers-reduced-motion: no-preference)');
  const dotRef = useRef(null);
  const ringRef = useRef(null);
  const [state, setState] = useState(null);

  useEffect(() => {
    if (!enabled) return undefined;

    const root = document.documentElement;
    const dot = dotRef.current;
    const ring = ringRef.current;
    root.classList.add('has-custom-cursor');

    gsap.set([dot, ring], { xPercent: -50, yPercent: -50, autoAlpha: 0 });
    const dotX = gsap.quickTo(dot, 'x', { duration: 0.08, ease: 'power3.out' });
    const dotY = gsap.quickTo(dot, 'y', { duration: 0.08, ease: 'power3.out' });
    const ringX = gsap.quickTo(ring, 'x', { duration: 0.45, ease: 'power3.out' });
    const ringY = gsap.quickTo(ring, 'y', { duration: 0.45, ease: 'power3.out' });

    let visible = false;
    const handleMove = (event) => {
      if (!visible) {
        visible = true;
        gsap.set([dot, ring], { x: event.clientX, y: event.clientY });
        gsap.to([dot, ring], { autoAlpha: 1, duration: 0.3 });
      }
      dotX(event.clientX);
      dotY(event.clientY);
      ringX(event.clientX);
      ringY(event.clientY);
    };

    const handleOver = (event) => {
      const target = event.target.closest('[data-cursor], a, button, summary, label');
      if (!target) {
        setState(null);
        return;
      }
      setState(target.dataset.cursor || 'link');
    };

    const handleLeave = () => {
      visible = false;
      gsap.to([dot, ring], { autoAlpha: 0, duration: 0.3 });
    };

    window.addEventListener('pointermove', handleMove, { passive: true });
    document.addEventListener('pointerover', handleOver, { passive: true });
    document.documentElement.addEventListener('pointerleave', handleLeave);

    return () => {
      root.classList.remove('has-custom-cursor');
      window.removeEventListener('pointermove', handleMove);
      document.removeEventListener('pointerover', handleOver);
      document.documentElement.removeEventListener('pointerleave', handleLeave);
      gsap.killTweensOf([dot, ring]);
    };
  }, [enabled]);

  if (!enabled) return null;

  const modifier = state ? ` cursor--${state}` : '';

  return (
    <div className={`cursor${modifier}`} aria-hidden="true">
      <div ref={ringRef} className="cursor__ring">
        <span className="cursor__label">{LABELS[state] ?? ''}</span>
      </div>
      <div ref={dotRef} className="cursor__dot" />
    </div>
  );
}
