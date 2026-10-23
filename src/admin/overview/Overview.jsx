import { useEffect, useState } from 'react';
import { adminApi } from '../api';
import VisitsChart from './VisitsChart';
import './Overview.css';

const RANGES = [
  { days: 7, label: '7 jours' },
  { days: 30, label: '30 jours' },
  { days: 90, label: '90 jours' },
];

const number = (value) => value.toLocaleString('fr-FR');
const percent = (part, total) => (total ? Math.round((part / total) * 100) : 0);

/** Évolution par rapport à la période précédente. */
function Trend({ current, previous }) {
  if (!previous) return <span className="kpi__trend">Pas de période précédente</span>;
  const change = Math.round(((current - previous) / previous) * 100);
  const direction = change > 0 ? 'up' : change < 0 ? 'down' : 'flat';
  return (
    <span className={`kpi__trend kpi__trend--${direction}`}>
      {direction === 'up' ? '↑' : direction === 'down' ? '↓' : '→'} {Math.abs(change)} % vs période précédente
    </span>
  );
}

/** Barres horizontales simples : une seule teinte (la longueur porte la valeur). */
function BarList({ items, total, label, value = (item) => item.count }) {
  return (
    <ul className="bar-list">
      {items.map((item) => (
        <li key={label(item)} className="bar-list__item">
          <span className="bar-list__label">{label(item)}</span>
          <span className="bar-list__value">
            {number(value(item))} <span className="admin-muted">· {percent(value(item), total)} %</span>
          </span>
          <span className="bar-list__track" aria-hidden="true">
            <span className="bar-list__bar" style={{ width: `${percent(value(item), total)}%` }} />
          </span>
        </li>
      ))}
    </ul>
  );
}

/** Vue d'ensemble de la fréquentation (Upstash Redis). */
export default function Overview({ analyticsConfigured, onUnauthorized }) {
  const [days, setDays] = useState(30);
  const [stats, setStats] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!analyticsConfigured) return;
    setError('');
    adminApi
      .stats(days)
      .then(setStats)
      .catch((statsError) => (statsError.status === 401 ? onUnauthorized() : setError(statsError.message)));
  }, [days, analyticsConfigured, onUnauthorized]);

  if (!analyticsConfigured) {
    return (
      <section className="overview">
        <div className="admin-panel">
          <h1 className="overview__title">Vue d’ensemble</h1>
          <p className="admin-muted">
            Analytics non configuré : reliez la base Upstash for Redis au projet Vercel (variables KV_REST_API_URL et
            KV_REST_API_TOKEN), puis redéployez. En local, récupérez-les avec <code>vercel env pull .env.local</code>.
          </p>
        </div>
      </section>
    );
  }

  const totalSources = stats?.sources.reduce((sum, s) => sum + s.count, 0) ?? 0;
  const iaShare = stats ? percent(stats.groups.find((g) => g.group === 'ia')?.count ?? 0, totalSources) : 0;
  const totalPages = stats?.pages.reduce((sum, p) => sum + p.count, 0) ?? 0;
  const totalDevices = stats?.devices.reduce((sum, d) => sum + d.count, 0) ?? 0;

  return (
    <section className="overview" aria-labelledby="overview-title">
      <div className="overview__head">
        <div>
          <p className="overview__label label">Analytics</p>
          <h1 className="overview__title" id="overview-title">
            Vue d’ensemble
          </h1>
        </div>
        <div className="overview__ranges" role="group" aria-label="Période">
          {RANGES.map((range) => (
            <button
              key={range.days}
              type="button"
              className={`overview__range${days === range.days ? ' overview__range--active' : ''}`}
              aria-pressed={days === range.days}
              onClick={() => setDays(range.days)}
            >
              {range.label}
            </button>
          ))}
        </div>
      </div>

      {error && <p className="admin-error">{error}</p>}
      {!stats && !error && <p className="admin-muted">Chargement…</p>}

      {stats && (
        <>
          <div className="overview__kpis">
            <article className="kpi">
              <h2 className="kpi__label">Visiteurs uniques</h2>
              <p className="kpi__value">{number(stats.totals.visitors)}</p>
              <Trend current={stats.totals.visitors} previous={stats.totals.previousVisitors} />
            </article>
            <article className="kpi">
              <h2 className="kpi__label">Pages vues</h2>
              <p className="kpi__value">{number(stats.totals.pageviews)}</p>
              <Trend current={stats.totals.pageviews} previous={stats.totals.previousPageviews} />
            </article>
            <article className="kpi">
              <h2 className="kpi__label">Pages par visiteur</h2>
              <p className="kpi__value">
                {stats.totals.visitors ? (stats.totals.pageviews / stats.totals.visitors).toLocaleString('fr-FR', { maximumFractionDigits: 1 }) : '0'}
              </p>
              <span className="kpi__trend">Sur la période</span>
            </article>
            <article className="kpi kpi--accent">
              <h2 className="kpi__label">Venus d’une IA</h2>
              <p className="kpi__value">{iaShare} %</p>
              <span className="kpi__trend">ChatGPT, Perplexity, Claude, Gemini…</span>
            </article>
          </div>

          <div className="admin-panel overview__chart">
            <h2 className="admin-panel__title">Visiteurs uniques par jour</h2>
            <VisitsChart series={stats.series} />
          </div>

          <div className="overview__grid">
            <div className="admin-panel">
              <h2 className="admin-panel__title">D’où viennent les visiteurs</h2>
              {totalSources ? (
                <>
                  <BarList items={stats.groups.filter((g) => g.count)} total={totalSources} label={(g) => g.label} />
                  <h3 className="overview__subtitle">Détail des sources</h3>
                  <BarList items={stats.sources.slice(0, 10)} total={totalSources} label={(s) => s.label} />
                </>
              ) : (
                <p className="admin-muted">Aucune visite enregistrée sur la période.</p>
              )}
            </div>

            <div className="overview__stack">
              <div className="admin-panel">
                <h2 className="admin-panel__title">Pages les plus vues</h2>
                {totalPages ? (
                  <BarList items={stats.pages} total={totalPages} label={(p) => p.path} />
                ) : (
                  <p className="admin-muted">Aucune page vue sur la période.</p>
                )}
              </div>
              <div className="admin-panel">
                <h2 className="admin-panel__title">Appareils</h2>
                {totalDevices ? (
                  <BarList items={stats.devices} total={totalDevices} label={(d) => d.label} />
                ) : (
                  <p className="admin-muted">Aucune donnée sur la période.</p>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </section>
  );
}
