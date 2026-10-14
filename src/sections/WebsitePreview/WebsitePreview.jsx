import BrowserMockup from '../../components/BrowserMockup/BrowserMockup';
import PhoneMockup from '../../components/PhoneMockup/PhoneMockup';
import './WebsitePreview.css';

const TITLE_LINES = [
  { from: 'Visible.', to: 'Adapté.' },
  { from: 'Mémorable.', to: 'Partout.', accent: true },
];

/** Un mot découpé en lettres, pour les faire basculer une à une. */
function Chars({ word, className }) {
  return (
    <span className={className}>
      {[...word].map((char, index) => (
        <span className="preview__char" key={`${char}-${index}`}>
          {char}
        </span>
      ))}
    </span>
  );
}

/** Scène 04 — Le site prend vie, sur ordinateur puis sur mobile. */
export default function WebsitePreview({ variant = 'flow' }) {
  const isFlow = variant === 'flow';

  return (
    <section className={`preview preview--${variant}`} data-scene={isFlow ? 4 : undefined} aria-labelledby="preview-title">
      <p className="preview__label label">02 / Un vrai site, pas juste une jolie page</p>
      {/* Le titre lu par les moteurs et lecteurs d'écran reste « Visible. Mémorable. » ;
          les mots de remplacement n'apparaissent qu'avec l'animation (passage au mobile). */}
      <h2 className="preview__title" id="preview-title" aria-label="Visible. Mémorable.">
        {TITLE_LINES.map(({ from, to, accent }) => (
          <span className="line-mask preview__line" key={from} aria-hidden="true">
            <span className="line-mask__inner">
              <Chars word={from} className="preview__word preview__word--from" />
              <Chars word={to} className={`preview__word preview__word--to${accent ? ' preview__word--accent' : ''}`} />
            </span>
          </span>
        ))}
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
