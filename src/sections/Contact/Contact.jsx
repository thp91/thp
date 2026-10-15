import { useRef, useState } from 'react';
import { addLayoutAnimation, gsap, useGSAP } from '../../lib/gsap';
import { CONTACT } from '../../data/site';
import { LOGO_PIECES } from '../../assets/logos/thpLetters';
import Logo from '../../components/Logo/Logo';
import LogoPiece from '../../components/LogoPiece/LogoPiece';
import MagneticButton from '../../components/MagneticButton/MagneticButton';
import Footer from '../../components/Footer/Footer';
import { createContactTimeline } from '../../animations/contactAnimations';
import './Contact.css';

const TITLE_LINES = [['Votre', 'prochain'], ['site', 'commence'], ['ici.']];
const curveLeft = LOGO_PIECES.find((piece) => piece.id === 'h-left');
const curveRight = LOGO_PIECES.find((piece) => piece.id === 'h-right');

const STATUS_MESSAGES = {
  idle: 'Je vous réponds personnellement.',
  sending: 'Envoi en cours…',
  sent: 'Merci ! Votre message est bien arrivé, je reviens vers vous très vite.',
};

/** Scène 09 — Contact final. */
export default function Contact() {
  const rootRef = useRef(null);
  const [status, setStatus] = useState('idle');
  const [error, setError] = useState('');

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      const animate = () => createContactTimeline(rootRef.current);
      addLayoutAnimation(mm, { wide: animate, narrow: animate });

      return () => mm.revert();
    },
    { scope: rootRef },
  );

  // Envoi via la fonction serveur /api/contact (Resend) ; la clé API ne quitte jamais le serveur
  const handleSubmit = async (event) => {
    event.preventDefault();
    const form = event.currentTarget;
    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }

    setStatus('sending');
    setError('');
    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(Object.fromEntries(new FormData(form))),
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(result.error || 'L’envoi a échoué.');
      form.reset();
      setStatus('sent');
    } catch (submitError) {
      setError(submitError.message);
      setStatus('error');
    }
  };

  return (
    <section
      ref={rootRef}
      className="contact"
      id="contact"
      data-scene="9"
      aria-labelledby="contact-title"
    >
      <span className="contact__curve contact__curve--left" aria-hidden="true">
        <LogoPiece piece={curveLeft} className="contact__curve-shape" />
      </span>
      <span className="contact__curve contact__curve--right" aria-hidden="true">
        <LogoPiece piece={curveRight} className="contact__curve-shape" />
      </span>

      <div className="contact__inner container">
        <div className="contact__top">
          <p className="contact__label label">07 / Et si on créait quelque chose ensemble ?</p>
          <div className="contact__logo">
            <Logo />
          </div>
        </div>

        <h2 className="contact__title" id="contact-title">
          {TITLE_LINES.map((line) => (
            <span className="contact__line" key={line.join('-')}>
              {line.map((word) => (
                <span className="line-mask contact__word-mask" key={word}>
                  <span className={`contact__word${word === 'ici.' ? ' contact__word--accent' : ''}`}>{word}</span>
                </span>
              ))}
            </span>
          ))}
        </h2>

        <span className="contact__rule" aria-hidden="true" />

        <a className="contact__cta" href={`mailto:${CONTACT.email}`} data-cursor="link">
          <span className="contact__cta-text">Parlons de votre projet</span>
          <span className="contact__cta-arrow" aria-hidden="true">
            ↗
          </span>
        </a>

        <div className="contact__grid">
          <div className="contact__direct">
            <p className="contact__direct-text">
              Un projet, une question, une simple idée ? Écrivez-moi, je vous réponds personnellement.
            </p>
            <a className="contact__email" href={`mailto:${CONTACT.email}`} data-cursor="link">
              {CONTACT.email}
            </a>
          </div>

          <form className="contact__form" onSubmit={handleSubmit} noValidate>
            <div className="contact__field">
              <label className="contact__field-label label" htmlFor="contact-name">
                Votre nom
              </label>
              <input className="contact__input" id="contact-name" name="name" type="text" autoComplete="name" required />
            </div>
            <div className="contact__field">
              <label className="contact__field-label label" htmlFor="contact-email">
                Votre e-mail
              </label>
              <input className="contact__input" id="contact-email" name="email" type="email" autoComplete="email" required />
            </div>
            <div className="contact__field contact__field--wide">
              <label className="contact__field-label label" htmlFor="contact-message">
                Votre projet en quelques mots
              </label>
              <textarea className="contact__input contact__input--textarea" id="contact-message" name="message" rows="4" required />
            </div>
            {/* Champ piège pour les robots : invisible et ignoré par les visiteurs */}
            <div className="contact__trap" aria-hidden="true">
              <label htmlFor="contact-company">Société</label>
              <input id="contact-company" name="company" type="text" tabIndex={-1} autoComplete="off" />
            </div>
            <div className="contact__submit">
              <MagneticButton type="submit" variant="coral" size="large" disabled={status === 'sending'}>
                {status === 'sending' ? 'Envoi…' : 'Envoyer mon message'}
              </MagneticButton>
              <p className={`contact__status contact__status--${status}`} role="status" aria-live="polite">
                {status === 'error' ? (
                  <>
                    {error}{' '}
                    <a className="contact__status-link" href={`mailto:${CONTACT.email}`}>
                      {CONTACT.email}
                    </a>
                  </>
                ) : (
                  STATUS_MESSAGES[status]
                )}
              </p>
            </div>
          </form>
        </div>
      </div>

      <Footer />
    </section>
  );
}
