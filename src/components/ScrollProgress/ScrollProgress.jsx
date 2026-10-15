import { useEffect, useRef, useState } from 'react';
import { gsap, ScrollTrigger, useGSAP } from '../../lib/gsap';
import { onScene } from '../../lib/events';
import useSurfaceTheme from '../../hooks/useSurfaceTheme';
import { SCENE_COUNT } from '../../data/site';
import './ScrollProgress.css';

const pad = (value) => String(value).padStart(2, '0');

/**
 * Indicateur discret « 0X / 09 » et barre de progression du parcours.
 * Les scènes sont signalées par les sections ([data-scene]) ou par la timeline principale.
 */
export default function ScrollProgress() {
  const rootRef = useRef(null);
  const [scene, setScene] = useState(1);
  // Contraste adapté au fond situé sous l'indicateur
  const theme = useSurfaceTheme(rootRef, (rect) => [rect.left + rect.width / 2, rect.top + rect.height / 2]);

  useEffect(() => onScene(setScene), []);

  useGSAP(
    () => {
      const bar = rootRef.current.querySelector('.scroll-progress__bar');
      const setProgress = gsap.quickSetter(bar, 'scaleX');
      setProgress(0);

      ScrollTrigger.create({
        start: 0,
        end: 'max',
        onUpdate: (self) => setProgress(self.progress),
      });

      // Sélecteurs hors du scope du composant : on interroge le document
      gsap.utils.toArray(document.querySelectorAll('[data-scene]')).forEach((section) => {
        ScrollTrigger.create({
          trigger: section,
          start: 'top center',
          end: 'bottom center',
          onToggle: (self) => self.isActive && setScene(Number(section.dataset.scene)),
        });
      });

    },
    { scope: rootRef },
  );

  return (
    <div ref={rootRef} className={`scroll-progress scroll-progress--${theme}`} aria-hidden="true">
      <span className="scroll-progress__count">
        <span className="scroll-progress__current">{pad(scene)}</span> / {pad(SCENE_COUNT)}
      </span>
      <span className="scroll-progress__track">
        <span className="scroll-progress__bar" />
      </span>
    </div>
  );
}
