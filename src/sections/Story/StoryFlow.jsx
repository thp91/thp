import Hero from '../Hero/Hero';
import BrandExperience from '../BrandExperience/BrandExperience';
import WebsiteBuilder from '../WebsiteBuilder/WebsiteBuilder';
import WebsitePreview from '../WebsitePreview/WebsitePreview';

/** Scènes 01 à 04 en sections classiques, sans animation (préférence « réduire les animations »). */
export default function StoryFlow() {
  return (
    <div className="story-flow">
      <Hero />
      <BrandExperience />
      <WebsiteBuilder />
      <WebsitePreview />
    </div>
  );
}
