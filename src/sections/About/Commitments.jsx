import { COMMITMENTS, QUOTE_LINES, ACCESS_ITEMS } from '../../data/commitments';
import { EXPERIENCES } from '../../data/experience';
import './Commitments.css';

const Check = () => (
  <svg className="commitments__check" viewBox="0 0 16 16" aria-hidden="true" focusable="false">
    <path d="M3 8.5l3.2 3L13 4.5" pathLength="1" />
  </svg>
);

/** Devis : les lignes apparaissent, se cochent, puis le tampon « Sans surprise ». */
const QuoteVisual = () => (
  <div className="quote-sketch">
    <span className="quote-sketch__head">
      <span className="quote-sketch__title">Devis</span>
      <span className="quote-sketch__ref" />
    </span>
    {QUOTE_LINES.map((width, index) => (
      <span className="quote-sketch__row" key={index}>
        <Check />
        <span className="quote-sketch__label" style={{ '--width': `${width}%` }} />
        <span className="quote-sketch__amount" />
      </span>
    ))}
    <span className="quote-sketch__total">
      <span className="quote-sketch__total-label">Total</span>
      <span className="quote-sketch__total-amount" />
    </span>
    <span className="quote-sketch__stamp">Sans surprise</span>
  </div>
);

/** Interrupteur : l'abonnement obligatoire se désactive, le choix vous revient. */
const SwitchVisual = () => (
  <div className="switch-sketch">
    <span className="switch-sketch__row">
      <span className="switch-sketch__label">Maintenance obligatoire</span>
      <span className="switch-sketch__track">
        <span className="switch-sketch__knob" />
      </span>
    </span>
    <span className="switch-sketch__state">
      <span className="switch-sketch__state-item switch-sketch__state-item--on">Activée</span>
      <span className="switch-sketch__state-item switch-sketch__state-item--off">Désactivée</span>
    </span>
    <span className="switch-sketch__choice">Vous choisissez</span>
  </div>
);

/** Anneau qui se remplit pendant que chaque accès est remis. */
const AccessVisual = () => (
  <div className="access-sketch">
    <svg className="access-sketch__ring" viewBox="0 0 120 120" aria-hidden="true" focusable="false">
      <circle className="access-sketch__ring-base" cx="60" cy="60" r="52" />
      <circle className="access-sketch__ring-fill" cx="60" cy="60" r="52" pathLength="1" />
    </svg>
    <ul className="access-sketch__list">
      {ACCESS_ITEMS.map((item) => (
        <li className="access-sketch__item" key={item}>
          <Check />
          {item}
        </li>
      ))}
    </ul>
  </div>
);

/** Frise du parcours. */
const TimelineVisual = () => (
  <div className="timeline-sketch">
    <span className="timeline-sketch__line" />
    <ol className="timeline-sketch__list">
      {EXPERIENCES.map((experience) => (
        <li className="timeline-sketch__item" key={experience.id}>
          <span className="timeline-sketch__dot" />
          <span className="timeline-sketch__name">{experience.name}</span>
        </li>
      ))}
    </ol>
  </div>
);

const VISUALS = { quote: QuoteVisual, switch: SwitchVisual, access: AccessVisual, timeline: TimelineVisual };

/** Engagements chiffrés : grille de tuiles, chacune avec sa petite scène animée au défilement. */
export default function Commitments() {
  return (
    <div className="commitments">
      <div className="commitments__head">
        <p className="commitments__label label">Ma façon de travailler</p>
        <h3 className="commitments__title">
          <span className="line-mask">
            <span className="line-mask__inner">Transparence</span>
          </span>
          <span className="line-mask">
            <span className="line-mask__inner commitments__title-accent">&amp; autonomie.</span>
          </span>
        </h3>
        <p className="commitments__intro">
          Vous savez ce que vous payez, vous gardez la main sur votre site, et vous n’êtes lié à aucun contrat que
          vous n’avez pas choisi.
        </p>
      </div>

      <ul className="commitments__grid">
        {COMMITMENTS.map((item) => {
          const Visual = VISUALS[item.visual];
          return (
            <li key={item.id} className={`commitment commitment--${item.tone} commitment--${item.id}`}>
              <div className="commitment__visual" aria-hidden="true">
                <Visual />
              </div>
              <div className="commitment__body">
                <p className="commitment__figure">
                  <span className="visually-hidden">
                    {item.prefix}
                    {item.value}
                    {item.suffix ? ` ${item.suffix}` : ''}
                  </span>
                  <span aria-hidden="true">
                    {item.prefix}
                    <span className="commitment__value" data-from={item.from} data-to={item.value}>
                      {item.value}
                    </span>
                    {item.suffix && <span className="commitment__suffix">{item.suffix}</span>}
                  </span>
                </p>
                <h4 className="commitment__title">{item.title}</h4>
                <p className="commitment__text">{item.text}</p>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
