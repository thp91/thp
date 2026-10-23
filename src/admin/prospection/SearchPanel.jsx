import { useState } from 'react';

/** Lancement d'une prospection + état de la dernière recherche (avec journal). */
export default function SearchPanel({ searches, disabled, onStart }) {
  const [activity, setActivity] = useState('');
  const [city, setCity] = useState('');
  const [count, setCount] = useState(20);
  const [submitting, setSubmitting] = useState(false);
  const [showLog, setShowLog] = useState(false);
  const latest = searches[0];

  return (
    <section className="admin-panel search-panel">
      <form
        className="search-panel__form"
        onSubmit={async (event) => {
          event.preventDefault();
          setSubmitting(true);
          await onStart(activity, city, count);
          setSubmitting(false);
        }}
      >
        <label className="admin-field">
          Activité
          <input className="admin-input" value={activity} onChange={(e) => setActivity(e.target.value)} placeholder="plombier, restaurant, ostéopathe…" required />
        </label>
        <label className="admin-field">
          <span>
            Ville <span className="admin-field__hint">(facultatif)</span>
          </span>
          <input className="admin-input" value={city} onChange={(e) => setCity(e.target.value)} placeholder="Toute la France" />
        </label>
        <label className="admin-field search-panel__count">
          Nombre
          <input className="admin-input" type="number" min={1} max={100} value={count} onChange={(e) => setCount(Number(e.target.value))} />
        </label>
        <button className="admin-button admin-button--primary search-panel__submit" disabled={disabled || submitting}>
          {submitting ? 'Lancement…' : 'Lancer la prospection'}
        </button>
      </form>

      {latest && (
        <div className="search-panel__status">
          <div className="search-panel__status-head">
            <span className={`search-panel__dot search-panel__dot--${latest.status}`} aria-hidden="true" />
            <span>
              <strong>
                {latest.activity} · {latest.city === 'France' ? 'Toute la France' : latest.city}
              </strong>{' '}
              — {latest.found}/{latest.target} prospects
              {latest.status === 'running' ? ' · recherche en cours…' : latest.status === 'error' ? ' · interrompue' : ' · terminée'}
            </span>
            <span className="search-panel__progress" aria-hidden="true">
              <span style={{ width: `${Math.min(100, (latest.found / latest.target) * 100)}%` }} />
            </span>
            <button type="button" className="admin-link" onClick={() => setShowLog(!showLog)}>
              {showLog ? 'Masquer le journal' : 'Voir le journal'}
            </button>
          </div>
          {showLog && <pre className="admin-log">{latest.log.length ? [...latest.log].reverse().join('\n') : '…'}</pre>}
        </div>
      )}
    </section>
  );
}
