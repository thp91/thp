import { LAYOUT_QUERIES } from '../../lib/gsap';
import useMediaQuery from '../../hooks/useMediaQuery';
import StoryStage from './StoryStage';
import StoryFlow from './StoryFlow';

/**
 * Scènes 01 à 04 : une seule scène épinglée où le logo se transforme en site,
 * composée pour le paysage (desktop, tablette) ou le portrait (mobile).
 * Si l'utilisateur réduit les animations : les mêmes contenus en sections classiques.
 */
export default function Story() {
  const wide = useMediaQuery(LAYOUT_QUERIES.wide);
  const reduce = useMediaQuery(LAYOUT_QUERIES.reduce);
  const layout = wide ? 'landscape' : 'portrait';

  // Conteneur stable : ScrollTrigger enveloppe la scène épinglée, React ne doit pas en dépendre
  return (
    <div className="story-root">
      {reduce ? <StoryFlow /> : <StoryStage key={layout} layout={layout} />}
    </div>
  );
}
