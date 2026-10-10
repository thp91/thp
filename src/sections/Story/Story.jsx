import { MOTION_QUERIES } from '../../lib/gsap';
import useMediaQuery from '../../hooks/useMediaQuery';
import StoryStage from './StoryStage';
import StoryFlow from './StoryFlow';

/**
 * Scènes 01 à 04.
 * Desktop avec animations : une seule scène épinglée où le logo se transforme en site.
 * Sinon : les mêmes contenus en sections classiques, avec des animations légères (ou aucune).
 */
export default function Story() {
  const motion = useMediaQuery(MOTION_QUERIES.motion);
  // Conteneur stable : ScrollTrigger enveloppe la scène épinglée, React ne doit pas en dépendre
  return <div className="story-root">{motion ? <StoryStage /> : <StoryFlow />}</div>;
}
