import { useCallback, useEffect, useState } from 'react';
import Logo from '../components/Logo/Logo';
import { adminApi } from './api';
import AdminLogin from './AdminLogin';
import Overview from './overview/Overview';
import Prospection from './prospection/Prospection';
import './AdminApp.css';

const TABS = [
  { id: 'overview', label: 'Vue d’ensemble' },
  { id: 'prospection', label: 'Prospection' },
];

/** Espace administrateur : analytics (en ligne) et prospection (en local). */
export default function AdminApp() {
  const [session, setSession] = useState(null);
  const [tab, setTab] = useState(() => (window.location.hash === '#prospection' ? 'prospection' : 'overview'));

  const refreshSession = useCallback(() => adminApi.session().then(setSession).catch(() => setSession({ configured: false, authenticated: false })), []);

  useEffect(() => {
    document.title = 'Admin — THP Development';
    // Jamais indexé par les moteurs de recherche
    const robots = document.createElement('meta');
    robots.name = 'robots';
    robots.content = 'noindex, nofollow';
    document.head.appendChild(robots);
    refreshSession();
    return () => robots.remove();
  }, [refreshSession]);

  const selectTab = (id) => {
    setTab(id);
    window.history.replaceState(null, '', id === 'overview' ? '/admin' : `/admin#${id}`);
  };

  const logout = async () => {
    await adminApi.logout().catch(() => {});
    refreshSession();
  };

  // Une requête protégée a expiré : retour à l'écran de connexion
  const onUnauthorized = useCallback(() => setSession((s) => ({ ...s, authenticated: false })), []);

  if (!session) return <div className="admin admin--loading" aria-busy="true" />;
  if (!session.authenticated) return <AdminLogin configured={session.configured} onLogin={refreshSession} />;

  return (
    <div className="admin">
      <header className="admin__header">
        <div className="admin__header-inner">
          <a className="admin__brand" href="/" aria-label="Retour au site">
            <Logo className="admin__logo" />
            <span className="admin__brand-name">Development · Admin</span>
          </a>
          <nav className="admin__tabs" aria-label="Sections de l’admin">
            {TABS.map((item) => (
              <button
                key={item.id}
                type="button"
                className={`admin__tab${tab === item.id ? ' admin__tab--active' : ''}`}
                aria-current={tab === item.id ? 'page' : undefined}
                onClick={() => selectTab(item.id)}
              >
                {item.label}
              </button>
            ))}
          </nav>
          <button type="button" className="admin__logout" onClick={logout}>
            Déconnexion
          </button>
        </div>
      </header>

      <main className="admin__main">
        {tab === 'overview' ? (
          <Overview analyticsConfigured={session.analytics} onUnauthorized={onUnauthorized} />
        ) : (
          <Prospection />
        )}
      </main>
    </div>
  );
}
