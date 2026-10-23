import { useCallback, useEffect, useMemo, useState } from 'react';
import { prospectApi } from '../api';
import SearchPanel from './SearchPanel';
import ProspectCard from './ProspectCard';
import EmailModal from './EmailModal';
import DevModal from './DevModal';
import './Prospection.css';

const TABS = [
  { key: 'nouveau', label: 'À vérifier' },
  { key: 'maquette', label: 'Maquette prête' },
  { key: 'mail_envoye', label: 'Mail envoyé' },
  { key: 'validation', label: 'Validation' },
  { key: 'developpement', label: 'Développement' },
  { key: 'ecarte', label: 'Écartés' },
  { key: 'tous', label: 'Tous' },
];

/**
 * Prospection : fonctionne uniquement en local (`npm run dev`), car elle s'appuie sur
 * Claude Code (abonnement), Figma et des fichiers locaux. En ligne, un message l'indique.
 */
export default function Prospection() {
  const [available, setAvailable] = useState(null);
  const [config, setConfig] = useState(null);
  const [prospects, setProspects] = useState([]);
  const [searches, setSearches] = useState([]);
  const [tab, setTab] = useState('nouveau');
  const [mailing, setMailing] = useState(null);
  const [developing, setDeveloping] = useState(null);
  const [toast, setToast] = useState(null);

  const notify = useCallback((text, error = false) => {
    setToast({ text, error });
    setTimeout(() => setToast(null), 4500);
  }, []);

  const refresh = useCallback(async () => {
    const [p, s] = await Promise.all([prospectApi.prospects(), prospectApi.searches()]);
    setProspects(p);
    setSearches(s);
  }, []);

  useEffect(() => {
    prospectApi
      .config()
      .then((data) => {
        setConfig(data);
        setAvailable(true);
        return refresh();
      })
      .catch(() => setAvailable(false));
  }, [refresh]);

  // Rafraîchit tant qu'une recherche, une maquette ou un développement tourne
  const busy =
    searches.some((s) => s.status === 'running') ||
    prospects.some((p) => p.mockup_status === 'pending' || p.mockup_status === 'figma' || p.dev_status === 'running');
  useEffect(() => {
    if (!busy) return undefined;
    const timer = setInterval(() => refresh().catch(() => {}), 3000);
    return () => clearInterval(timer);
  }, [busy, refresh]);

  const replace = (p) => setProspects((list) => list.map((x) => (x.id === p.id ? p : x)));
  const run = async (fn, ok) => {
    try {
      replace(await fn());
      if (ok) notify(ok);
    } catch (runError) {
      notify(runError.message, true);
    }
  };

  const counts = useMemo(() => {
    const c = { tous: prospects.length };
    for (const p of prospects) c[p.status] = (c[p.status] ?? 0) + 1;
    return c;
  }, [prospects]);

  if (available === null) return <p className="admin-muted">Connexion à l’outil de prospection…</p>;

  if (!available) {
    return (
      <section className="prospection">
        <div className="admin-panel prospection__offline">
          <p className="label prospection__label">Prospection</p>
          <h1 className="prospection__title">Disponible en local</h1>
          <p className="admin-muted">
            La prospection utilise Claude Code (votre abonnement), Figma et des fichiers stockés sur votre Mac : elle ne
            tourne pas en ligne. Lancez le site en local avec <code>npm run dev</code>, puis ouvrez{' '}
            <code>http://localhost:5173/admin#prospection</code>.
          </p>
        </div>
      </section>
    );
  }

  const visible = prospects.filter((p) => tab === 'tous' || p.status === tab);
  const warnings = [
    !config.aiConfigured && 'Claude Code n’est pas connecté à votre abonnement : lancez `claude` dans un terminal et connectez-vous. Prospection, maquettes et mails IA sont désactivés en attendant.',
    !config.mailConfigured && 'Envoi des mails non configuré : renseignez RESEND_API_KEY et PROSPECT_FROM (domaine vérifié dans Resend) dans .env.local.',
    config.figmaEnabled && !config.figmaProjectSet && 'FIGMA_PROJECT_ID vide : les maquettes seront créées dans vos brouillons Figma au lieu du dossier « prospects ».',
  ].filter(Boolean);

  return (
    <section className="prospection" aria-labelledby="prospection-title">
      <div className="prospection__head">
        <div>
          <p className="label prospection__label">Sites vitrines à refondre</p>
          <h1 className="prospection__title" id="prospection-title">
            Prospection
          </h1>
        </div>
        <dl className="prospection__stats">
          {[
            ['Prospects', counts.tous],
            ['Maquettes', counts.maquette],
            ['Mails envoyés', counts.mail_envoye],
            ['En développement', counts.developpement],
          ].map(([label, value]) => (
            <div className="prospection__stat" key={label}>
              <dt>{label}</dt>
              <dd>{value ?? 0}</dd>
            </div>
          ))}
        </dl>
      </div>

      {warnings.length > 0 && (
        <div className="prospection__warnings" role="note">
          {warnings.map((w) => (
            <p key={w}>{w}</p>
          ))}
        </div>
      )}

      <SearchPanel
        searches={searches}
        disabled={!config.aiConfigured}
        onStart={async (activity, city, count) => {
          try {
            await prospectApi.startSearch(activity, city, count);
            await refresh();
            notify(`Recherche lancée : ${count} ${activity} — ${city || 'toute la France'}`);
          } catch (startError) {
            notify(startError.message, true);
          }
        }}
      />

      <nav className="prospection__tabs" aria-label="Étapes">
        {TABS.map((t) => (
          <button
            key={t.key}
            type="button"
            className={`prospection__tab${tab === t.key ? ' prospection__tab--active' : ''}`}
            aria-pressed={tab === t.key}
            onClick={() => setTab(t.key)}
          >
            {t.label}
            <span className="prospection__tab-count">{counts[t.key] ?? 0}</span>
          </button>
        ))}
      </nav>

      <div className="prospection__list">
        {visible.length === 0 && (
          <p className="prospection__empty">
            {prospects.length === 0 ? 'Aucun prospect pour l’instant. Lancez une recherche ci-dessus.' : 'Rien dans cette étape.'}
          </p>
        )}
        {visible.map((p) => (
          <ProspectCard
            key={p.id}
            prospect={p}
            figmaEnabled={config.figmaEnabled}
            onEmailChange={(email) => run(() => prospectApi.update(p.id, { email }), 'Email mis à jour')}
            onCreateMockup={() => run(() => prospectApi.createMockup(p.id), 'Génération de la maquette lancée…')}
            onRetryFigma={() => run(() => prospectApi.retryFigma(p.id), 'Import Figma relancé…')}
            onStatus={(status) => run(() => prospectApi.update(p.id, { status }))}
            onMail={() => setMailing(p)}
            onDevelop={() => setDeveloping(p)}
            onOpenFolder={() => prospectApi.openFolder(p.id).catch((folderError) => notify(folderError.message, true))}
          />
        ))}
      </div>

      {mailing && (
        <EmailModal
          prospect={mailing}
          onClose={() => setMailing(null)}
          onSent={(p) => {
            replace(p);
            setMailing(null);
            notify(`Mail envoyé à ${p.email}`);
          }}
        />
      )}
      {developing && (
        <DevModal
          prospect={developing}
          onClose={() => setDeveloping(null)}
          onStarted={(p) => {
            replace(p);
            setDeveloping(null);
            setTab('developpement');
            notify(`Développement du site de ${p.name} lancé`);
          }}
        />
      )}

      {toast && (
        <div className={`prospection__toast${toast.error ? ' prospection__toast--error' : ''}`} role="status">
          {toast.text}
        </div>
      )}
    </section>
  );
}
