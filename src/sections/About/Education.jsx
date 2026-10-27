import { EDUCATION } from '../../data/education';
import EducationScene from './EducationScene';
import './Education.css';

/**
 * Formation : une ligne du DESIGN au CODE. Au défilement, un curseur la parcourt
 * (année affichée), passe du rond lavande au carré corail ; à son passage, chaque
 * école s'allume et son bâtiment illustré se construit.
 * L'animation est dans aboutAnimations.js ; sans animation, tout est visible.
 */
export default function Education() {
  return (
    <div className="education">
      <div className="education__head">
        <p className="education__label label">Formation</p>
        <h3 className="education__title">
          <span className="line-mask">
            <span className="line-mask__inner education__title-design">Du design</span>
          </span>
          <span className="line-mask">
            <span className="line-mask__inner education__title-code">au code.</span>
          </span>
        </h3>
      </div>

      <div className="education__track">
        <span className="education__end education__end--design" aria-hidden="true">
          Design
        </span>
        <span className="education__end education__end--code" aria-hidden="true">
          × Code
        </span>

        <span className="education__line" aria-hidden="true">
          <span className="education__fill" />
        </span>
        <span className="education__cursor" aria-hidden="true">
          <span className="education__cursor-year">2025</span>
        </span>

        <ol className="education__list">
          {EDUCATION.map((item) => (
            <li key={item.id} className="education__stop education__stop--active" data-year={item.year}>
              <span className="education__dot" aria-hidden="true" />
              <EducationScene id={item.id} />
              <p className="education__period label">{item.period}</p>
              <h4 className="education__school">{item.school}</h4>
              <p className="education__diploma">{item.diploma}</p>
              <p className="education__text">{item.text}</p>
              <span className="education__tag">{item.tag}</span>
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}
