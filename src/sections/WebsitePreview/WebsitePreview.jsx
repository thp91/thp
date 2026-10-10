import BrowserMockup from '../../components/BrowserMockup/BrowserMockup';
import PhoneMockup from '../../components/PhoneMockup/PhoneMockup';
import './WebsitePreview.css';

/** Scène 04 — Le site prend vie, sur ordinateur puis sur mobile. */
export default function WebsitePreview({ variant = 'flow' }) {
  const isFlow = variant === 'flow';

  return (
    <section className={`preview preview--${variant}`} data-scene={isFlow ? 4 : undefined} aria-labelledby="preview-title">
      <p className="preview__label label">02 / Un vrai site, pas juste une jolie page</p>
      <h2 className="preview__title" id="preview-title">
        <span className="line-mask">
          <span className="line-mask__inner">Visible.</span>
        </span>
        <span className="line-mask">
          <span className="line-mask__inner">Mémorable.</span>
        </span>
      </h2>
      <p className="preview__text">
        Une vitrine claire, rapide et adaptée aux mobiles, conçue pour donner envie de vous contacter.
      </p>
      <p className="preview__caption label">
        <span className="preview__caption-item preview__caption-item--desktop">Design / Performance / Clarté</span>
        <span className="preview__caption-item preview__caption-item--mobile">Sur ordinateur comme sur téléphone</span>
      </p>

      {isFlow && (
        <div className="preview__devices">
          <BrowserMockup className="preview__browser" />
          <PhoneMockup className="preview__phone" />
        </div>
      )}
    </section>
  );
}
