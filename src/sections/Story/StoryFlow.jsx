import { useRef } from 'react';
import { gsap, MOTION_QUERIES, useGSAP } from '../../lib/gsap';
import { createHeroIntro } from '../../animations/heroAnimations';
import { revealClip, revealFade, revealLines } from '../../animations/reveal';
import Hero from '../Hero/Hero';
import BrandExperience from '../BrandExperience/BrandExperience';
import WebsiteBuilder from '../WebsiteBuilder/WebsiteBuilder';
import WebsitePreview from '../WebsitePreview/WebsitePreview';

/** Scènes 01 à 04 en sections classiques, avec des alternatives légères aux scènes épinglées. */
export default function StoryFlow() {
  const rootRef = useRef(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();

      mm.add(MOTION_QUERIES.light, () => {
        const q = gsap.utils.selector(rootRef.current);
        createHeroIntro(q('.hero')[0]);

        const brand = q('.brand')[0];
        revealClip(q('.brand__visual'), brand, 'inset(0% 100% 0% 0%)');
        revealFade(q('.brand__word, .brand__text'), brand);

        const builder = q('.builder')[0];
        revealLines(q('.builder__title .line-mask__inner'), builder);
        gsap.from(q('.builder__grid .tile-grid__tile'), {
          scale: 0,
          rotation: -20,
          duration: 0.6,
          ease: 'back.out(1.6)',
          stagger: { each: 0.025, from: 'random' },
          scrollTrigger: { trigger: q('.builder__grid')[0], start: 'top 85%', once: true },
        });

        const preview = q('.preview')[0];
        revealLines(q('.preview__title .line-mask__inner'), preview);
        revealClip(q('.preview__browser .browser-mockup__frame'), q('.preview__devices')[0]);
        gsap.from(q('.preview__phone'), {
          yPercent: 30,
          autoAlpha: 0,
          duration: 0.9,
          ease: 'power3.out',
          scrollTrigger: { trigger: q('.preview__devices')[0], start: 'top 75%', once: true },
        });
      });

      return () => mm.revert();
    },
    { scope: rootRef },
  );

  return (
    <div ref={rootRef} className="story-flow">
      <Hero />
      <BrandExperience />
      <WebsiteBuilder />
      <WebsitePreview />
    </div>
  );
}
