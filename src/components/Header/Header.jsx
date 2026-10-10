import { useEffect, useRef, useState } from 'react';
import { gsap, ScrollTrigger, useGSAP } from '../../lib/gsap';
import { getSurfaceAt, isDark } from '../../lib/surface';
import { useScrollTo } from '../../hooks/useLenis';
import { NAV_LINKS } from '../../data/site';
import Logo from '../Logo/Logo';
import './Header.css';

export default function Header() {
  const rootRef = useRef(null);
  const [theme, setTheme] = useState('light');
  const [menuOpen, setMenuOpen] = useState(false);
  const scrollTo = useScrollTo();

  // Fond et contraste suivent la surface située juste sous l'en-tête.
  // Vérification pendant le défilement, et un court instant après
  // (le temps que les scènes animées finissent leur transition).
  useGSAP(() => {
    const header = rootRef.current;
    let activeUntil = 0;
    let lastColor = '';

    const update = () => {
      const { bottom } = header.getBoundingClientRect();
      const surface = getSurfaceAt(4, bottom + 2, header);
      if (surface.color === lastColor) return;
      lastColor = surface.color;
      header.style.setProperty('--header-surface', surface.color);
      setTheme(surface.rgb && isDark(surface.rgb) ? 'dark' : 'light');
    };

    const tick = () => {
      if (performance.now() < activeUntil) update();
    };
    const wake = () => {
      activeUntil = performance.now() + 1500;
    };

    ScrollTrigger.create({ start: 0, end: 'max', onUpdate: wake });
    ScrollTrigger.addEventListener('refresh', wake);
    gsap.ticker.add(tick);
    wake();
    update();

    return () => {
      gsap.ticker.remove(tick);
      ScrollTrigger.removeEventListener('refresh', wake);
    };
  });

  useEffect(() => {
    if (!menuOpen) return undefined;
    const handleKey = (event) => event.key === 'Escape' && setMenuOpen(false);
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [menuOpen]);

  const handleNavigate = (event, href) => {
    event.preventDefault();
    setMenuOpen(false);
    scrollTo(href);
  };

  const classes = ['header', `header--${theme}`, menuOpen && 'header--menu-open'].filter(Boolean).join(' ');

  return (
    <header ref={rootRef} className={classes}>
      <div className="header__inner">
        <a className="header__brand" href="#top" onClick={(event) => handleNavigate(event, '#top')} data-cursor="link">
          <Logo className="header__logo" />
          <span className="header__brand-name">Development</span>
        </a>

        <button
          className="header__toggle"
          type="button"
          aria-expanded={menuOpen}
          aria-controls="header-nav"
          onClick={() => setMenuOpen((open) => !open)}
        >
          <span className="header__toggle-label">{menuOpen ? 'Fermer' : 'Menu'}</span>
          <span className="header__toggle-icon" aria-hidden="true" />
        </button>

        <nav className="header__nav" id="header-nav" aria-label="Navigation principale">
          <ul className="header__list">
            {NAV_LINKS.map((link) => (
              <li className="header__item" key={link.href}>
                <a
                  className={`header__link${link.external ? ' header__link--cta' : ''}`}
                  href={link.href}
                  onClick={(event) => handleNavigate(event, link.href)}
                  data-cursor="link"
                >
                  <span className="header__link-text">{link.label}</span>
                  {link.external && (
                    <span className="header__link-arrow" aria-hidden="true">
                      ↗
                    </span>
                  )}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </div>
      <span className="header__rule" aria-hidden="true" />
    </header>
  );
}
