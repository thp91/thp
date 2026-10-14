import { useId, useState } from 'react';
import { FAQ_ITEMS } from '../../data/faq';
import './FAQ.css';

/** FAQ accessible : boutons aria-expanded, une réponse ouverte à la fois. */
export default function FAQ() {
  const [openId, setOpenId] = useState(FAQ_ITEMS[0].id);
  const baseId = useId();

  return (
    <div className="faq">
      <div className="faq__intro">
        <p className="faq__label label">Questions fréquentes</p>
        <h3 className="faq__title">Les questions que vous vous posez.</h3>
        <p className="faq__more">
          Une autre question ?{' '}
          <a className="faq__more-link" href="#contact" data-cursor="link">
            Écrivez-moi
          </a>
          .
        </p>
      </div>
      <ul className="faq__list">
        {FAQ_ITEMS.map((item, index) => {
          const isOpen = openId === item.id;
          const buttonId = `${baseId}-${item.id}-button`;
          const panelId = `${baseId}-${item.id}-panel`;
          return (
            <li key={item.id} className={`faq__item${isOpen ? ' faq__item--open' : ''}`}>
              <h4 className="faq__heading">
                <button
                  id={buttonId}
                  className="faq__question"
                  type="button"
                  aria-expanded={isOpen}
                  aria-controls={panelId}
                  onClick={() => setOpenId(isOpen ? null : item.id)}
                >
                  <span className="faq__index label">{String(index + 1).padStart(2, '0')}</span>
                  <span className="faq__question-text">{item.question}</span>
                  <span className="faq__icon" aria-hidden="true" />
                </button>
              </h4>
              <div id={panelId} className="faq__panel" role="region" aria-labelledby={buttonId}>
                <div className="faq__panel-inner" inert={!isOpen}>
                  <p className="faq__answer">{item.answer}</p>
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
