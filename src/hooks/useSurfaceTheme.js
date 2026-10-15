import { useState } from 'react';
import { gsap, ScrollTrigger, useGSAP } from '../lib/gsap';
import { getSurfaceAt, isDark } from '../lib/surface';

/**
 * Suit la surface de la page située sous un élément fixe (en-tête, indicateur…)
 * et renvoie 'light' ou 'dark' selon sa luminosité.
 * Vérifié pendant le défilement, puis un court instant après (le temps que
 * les fonds animés terminent leur transition).
 * `getPoint(rect)` : point à examiner, à partir du rectangle de l'élément.
 * `onSurface(color)` : appelé quand la couleur de la surface change (optionnel).
 */
export default function useSurfaceTheme(ref, getPoint, onSurface) {
  const [theme, setTheme] = useState('light');

  useGSAP(() => {
    const element = ref.current;
    let activeUntil = 0;
    let lastColor = '';

    const update = () => {
      const [x, y] = getPoint(element.getBoundingClientRect());
      const surface = getSurfaceAt(x, y, element);
      if (surface.color === lastColor) return;
      lastColor = surface.color;
      onSurface?.(surface.color);
      setTheme(surface.rgb && isDark(surface.rgb) ? 'dark' : 'light');
    };

    const tick = () => {
      if (performance.now() < activeUntil) update();
    };
    const wake = () => {
      activeUntil = performance.now() + 1500;
    };

    ScrollTrigger.create({ start: 0, end: 'max', onUpdate: wake });
    ScrollTrigger.addEventListener('refresh', wake);
    gsap.ticker.add(tick);
    wake();
    update();

    return () => {
      gsap.ticker.remove(tick);
      ScrollTrigger.removeEventListener('refresh', wake);
    };
  });

  return theme;
}
