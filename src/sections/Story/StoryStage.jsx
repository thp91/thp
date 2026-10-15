import { useEffect, useRef } from 'react';
import { gsap, useGSAP } from '../../lib/gsap';
import { emitScene } from '../../lib/events';
import { LOGO_PIECES } from '../../assets/logos/thpLetters';
import LogoPiece from '../../components/LogoPiece/LogoPiece';
import TileGrid from '../../components/TileGrid/TileGrid';
import BrowserMockup from '../../components/BrowserMockup/BrowserMockup';
import PhoneMockup from '../../components/PhoneMockup/PhoneMockup';
import Hero from '../Hero/Hero';
import BrandExperience from '../BrandExperience/BrandExperience';
import WebsiteBuilder from '../WebsiteBuilder/WebsiteBuilder';
import WebsitePreview from '../WebsitePreview/WebsitePreview';
import { createHeroIntro, bindLogoPointer } from '../../animations/heroAnimations';
import { addBrandScene } from '../../animations/brandAnimations';
import { addBuildScene, addRevealScene, addResponsiveScene } from '../../animations/websiteAnimations';
import { getPieceStates, STORY_LAYOUTS } from '../../animations/storyGeometry';
import './Story.css';

const PARALLAX_DEPTH = { 't-bar': 14, 't-stem': 10, 'h-left': -12, 'h-right': -16, p: 22 };

/** Seuils (en temps de timeline) des scènes, pour l'indicateur de progression. */
const SCENE_MARKERS = [
  { at: 0, scene: 1 },
  { at: 0.35, scene: 2 },
  { at: 1.65, scene: 3 },
  { at: 3.3, scene: 4 },
];

/**
 * Scène épinglée des scènes 01 à 04.
 * `layout` : 'landscape' (repère Figma 1440 × 900) ou 'portrait' (repère mobile 390 × 700).
 */
export default function StoryStage({ layout: layoutName }) {
  const rootRef = useRef(null);
  const layout = STORY_LAYOUTS[layoutName];

  // Mise à l'échelle du repère pour tenir dans la fenêtre.
  // La hauteur de référence est 100svh (stable quand la barre d'adresse mobile se replie).
  useEffect(() => {
    const root = rootRef.current;
    const probe = root.querySelector('.story__probe');
    const fit = () => {
      const scale = Math.min(window.innerWidth / layout.size.width, probe.offsetHeight / layout.size.height);
      root.style.setProperty('--stage-scale', scale.toFixed(4));
    };
    fit();
    window.addEventListener('resize', fit);
    return () => window.removeEventListener('resize', fit);
  }, [layout]);

  useGSAP(
    () => {
      const root = rootRef.current;
      const q = gsap.utils.selector(root);
      const states = getPieceStates(layout);
      const pieces = LOGO_PIECES.map(({ id }) => ({ id, element: root.querySelector(`[data-piece-id="${id}"]`) }));
      const cardPiece = root.querySelector('[data-piece-id="card"]');

      // États initiaux
      pieces.forEach(({ id, element }) => gsap.set(element, states[id].hero));
      const { borderRadius: cardRadius, ...cardRect } = states.card.tile;
      gsap.set(cardPiece, { ...cardRect, autoAlpha: 0 });
      gsap.set(cardPiece.querySelector('.story-piece__block'), { borderRadius: cardRadius });
      gsap.set(q('.brand, .builder, .preview'), { autoAlpha: 1 });
      gsap.set(q('.story__browser .browser-mockup__block, .story__browser .browser-mockup__content'), { autoAlpha: 0 });
      gsap.set(q('.story__phone, .story__morph'), { autoAlpha: 0 });
      gsap.set(q('.brand__label, .brand__title > *, .brand__text, .brand__hint, .builder__label, .builder__text, .builder__actions, .preview__label, .preview__text, .preview__caption'), { autoAlpha: 0 });

      const intro = createHeroIntro(root);

      let currentScene = 1;
      const tl = gsap.timeline({
        defaults: { ease: 'power2.out' },
        scrollTrigger: {
          trigger: root,
          start: 'top top',
          end: '+=430%',
          pin: root.querySelector('.story__viewport'),
          scrub: 0.8,
          anticipatePin: 1,
          onUpdate: () => {
            const time = tl.time();
            const marker = SCENE_MARKERS.filter((item) => time >= item.at).pop();
            if (marker.scene !== currentScene) {
              currentScene = marker.scene;
              emitScene(marker.scene);
            }
          },
        },
      });

      // Si l'utilisateur fait défiler avant la fin de l'intro, on la termine aussitôt
      tl.eventCallback('onUpdate', () => {
        if (intro.isActive() && tl.progress() > 0.01) intro.progress(1);
      });

      // Rectangle d'un élément dans le repère de la scène (indépendant de la mise à l'échelle)
      const canvas = root.querySelector('.story__canvas');
      const measure = (selector) => {
        const element = root.querySelector(selector);
        const box = canvas.getBoundingClientRect();
        const rect = element.getBoundingClientRect();
        const ratio = layout.size.width / box.width;
        return {
          x: (rect.left - box.left) * ratio,
          y: (rect.top - box.top) * ratio,
          width: rect.width * ratio,
          height: rect.height * ratio,
          // Toujours 4 valeurs, pour une interpolation propre entre formes différentes
          borderRadius: ['TopLeft', 'TopRight', 'BottomRight', 'BottomLeft']
            .map((corner) => getComputedStyle(element)[`border${corner}Radius`].split(' ')[0])
            .join(' '),
        };
      };

      const ctx = { q, pieces, cardPiece, states, layout, measure };
      let time = addBrandScene(tl, ctx);
      time = addBuildScene(tl, ctx, time);
      time = addRevealScene(tl, ctx, time);
      time = addResponsiveScene(tl, ctx, time);
      tl.to({}, { duration: 0.3 }, time); // court temps de lecture avant de libérer la scène

      const unbindPointer = window.matchMedia('(pointer: fine)').matches ? bindLogoPointer(root) : null;
      return () => unbindPointer?.();
    },
    { scope: rootRef, dependencies: [layout] },
  );

  return (
    <section ref={rootRef} className={`story story--${layoutName}`} id="top" aria-label="Présentation">
      <span className="story__probe" aria-hidden="true" />
      <div className="story__viewport">
        <div className="story__night" data-surface aria-hidden="true" />
        <div className="story__canvas">
          <div className="story__visuals" aria-hidden="true">
            <TileGrid className="story__grid" hidePieces />
            <div className="story__morph" />
            <BrowserMockup className="story__browser" />
            <PhoneMockup className="story__phone" />

            {LOGO_PIECES.map((piece) => (
              <div key={piece.id} className="story-piece" data-piece-id={piece.id}>
                <div className="story-piece__parallax" data-parallax={PARALLAX_DEPTH[piece.id]}>
                  <div className="story-piece__reveal" data-intro="logo" data-piece={piece.id}>
                    <LogoPiece piece={piece} className="story-piece__shape" />
                    <div className={`story-piece__block story-piece__block--${piece.id}`} />
                  </div>
                </div>
              </div>
            ))}
            <div className="story-piece" data-piece-id="card">
              <div className="story-piece__block story-piece__block--card" />
            </div>
          </div>

          <Hero variant="stage" />
          <BrandExperience variant="stage" />
          <WebsiteBuilder variant="stage" />
          <WebsitePreview variant="stage" />
        </div>
      </div>
    </section>
  );
}
