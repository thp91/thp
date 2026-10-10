import './SectionHeading.css';

/**
 * Libellé + grand titre sur plusieurs lignes masquées (révélables ligne par ligne).
 * `lines` : tableau de lignes ; `accentIndex` : ligne mise en couleur.
 */
export default function SectionHeading({ id, label, lines, accentIndex = -1, theme = 'light', className = '' }) {
  return (
    <div className={`section-heading section-heading--${theme} ${className}`.trim()}>
      <p className="section-heading__label label">{label}</p>
      <h2 className="section-heading__title" id={id}>
        {lines.map((line, index) => (
          <span className="line-mask" key={line}>
            <span
              className={`line-mask__inner${index === accentIndex ? ' section-heading__accent' : ''}`}
            >
              {line}
            </span>
          </span>
        ))}
      </h2>
    </div>
  );
}
