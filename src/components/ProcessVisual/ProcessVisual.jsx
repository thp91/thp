import './ProcessVisual.css';

/**
 * Illustration de « l'idée au site en ligne », en quatre états superposés :
 * 1. l'échange (bulles de conversation) ;
 * 2. la conception (maquette en pointillés, palette) ;
 * 3. le développement (les blocs se remplissent, balise de code) ;
 * 4. la mise en ligne (navigateur, adresse, pastille « En ligne », téléphone).
 * Sans animation, l'état final (site en ligne) est affiché.
 */
export default function ProcessVisual() {
  return (
    <div className="process-visual" aria-hidden="true">
      <div className="process-visual__frame">
        <span className="process-visual__chrome" data-step="4">
          <span className="process-visual__dot" />
          <span className="process-visual__dot" />
          <span className="process-visual__dot" />
          <span className="process-visual__address">votre-site.fr</span>
        </span>

        <span className="process-visual__layout">
          {['header', 'hero', 'card-a', 'card-b', 'card-c'].map((zone) => (
            <span key={zone} className={`process-visual__zone process-visual__zone--${zone}`}>
              <span className="process-visual__outline" data-step="2" />
              <span className={`process-visual__fill process-visual__fill--${zone}`} data-step="3" />
            </span>
          ))}
        </span>

        <span className="process-visual__bubble process-visual__bubble--client" data-step="1">
          <span className="process-visual__typing" />
          <span className="process-visual__typing" />
          <span className="process-visual__typing" />
        </span>
        <span className="process-visual__bubble process-visual__bubble--me" data-step="1">
          <span className="process-visual__bar" />
          <span className="process-visual__bar process-visual__bar--short" />
        </span>

        <span className="process-visual__swatches" data-step="2">
          <span className="process-visual__swatch process-visual__swatch--ink" />
          <span className="process-visual__swatch process-visual__swatch--lavender" />
          <span className="process-visual__swatch process-visual__swatch--coral" />
        </span>

        <span className="process-visual__code" data-step="3">
          &lt;/&gt;
        </span>

        <span className="process-visual__live" data-step="4">
          <span className="process-visual__pulse" />
          En ligne
        </span>
        <span className="process-visual__phone" data-step="4">
          <span className="process-visual__phone-screen" />
        </span>
      </div>
    </div>
  );
}
