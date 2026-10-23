import { useState } from 'react';

const VERDICT = { a_refaire: 'À refaire', a_verifier: 'À vérifier', correct: 'Correct' };
const euros = (value) => value.toLocaleString('fr-FR');

/** Un prospect : société, email, score d'analyse, maquette et actions selon l'étape. */
export default function ProspectCard({ prospect: p, figmaEnabled, onEmailChange, onCreateMockup, onRetryFigma, onStatus, onMail, onDevelop, onOpenFolder }) {
  const [open, setOpen] = useState(false);
  const [showLog, setShowLog] = useState(false);
  const [editing, setEditing] = useState(false);
  const [email, setEmail] = useState(p.email ?? '');
  const working = p.mockup_status === 'pending' || p.mockup_status === 'figma';

  return (
    <article className={`prospect-card${p.status === 'ecarte' ? ' prospect-card--discarded' : ''}`}>
      <div className="prospect-card__main">
        <div className="prospect-card__company">
          <h3 className="prospect-card__name">{p.name}</h3>
          <a className="admin-link" href={p.url} target="_blank" rel="noreferrer">
            {p.domain} ↗
          </a>
          <span className="prospect-card__meta">{[p.activity, p.city].filter(Boolean).join(' · ')}</span>
        </div>

        <div className="prospect-card__email">
          {editing ? (
            <form
              className="prospect-card__email-form"
              onSubmit={(event) => {
                event.preventDefault();
                onEmailChange(email);
                setEditing(false);
              }}
            >
              <input className="admin-input" list={`emails-${p.id}`} value={email} onChange={(e) => setEmail(e.target.value)} aria-label="Email du prospect" autoFocus />
              <datalist id={`emails-${p.id}`}>
                {p.emails.map((item) => (
                  <option key={item} value={item} />
                ))}
              </datalist>
              <button className="admin-button admin-button--small">OK</button>
            </form>
          ) : (
            <button type="button" className="prospect-card__email-button" onClick={() => setEditing(true)} title="Modifier l’email">
              {p.email || '— ajouter un email'}
              {p.emails.length > 1 && <span className="admin-muted"> +{p.emails.length - 1}</span>}
            </button>
          )}
        </div>

        <button type="button" className="prospect-card__score" onClick={() => setOpen(!open)} aria-expanded={open} title="Voir l’analyse">
          <span className={`prospect-card__score-value prospect-card__score-value--${p.verdict ?? 'none'}`}>{p.score ?? '?'}</span>
          <span className="prospect-card__verdict">{VERDICT[p.verdict] ?? '—'}</span>
        </button>

        <div className="prospect-card__mockup">
          {p.mockup_status === 'pending' && <span className="prospect-card__working">V{p.mockup_version + 1} en génération…</span>}
          {p.mockup_status === 'figma' && <span className="prospect-card__working">Import de la V{p.mockup_version} dans Figma…</span>}
          {p.mockup_status === 'none' && (
            <button type="button" className="admin-button" onClick={onCreateMockup}>
              Créer la maquette
            </button>
          )}
          {p.mockup_status === 'error' && (
            <div className="prospect-card__stack">
              <span className="admin-error" title={p.mockup_error ?? ''}>Échec de la maquette</span>
              <button type="button" className="admin-button admin-button--small" onClick={onCreateMockup}>
                Réessayer
              </button>
            </div>
          )}
          {p.mockup_status === 'done' && (
            <div className="prospect-card__stack">
              {p.figma_url && (
                <a className="admin-button admin-button--small admin-button--primary" href={p.figma_url} target="_blank" rel="noreferrer">
                  Ouvrir la V{p.mockup_version} dans Figma ↗
                </a>
              )}
              {p.estimate && (
                <span className="prospect-card__estimate" title={p.estimate.summary}>
                  {p.estimate.priceLow === p.estimate.priceHigh
                    ? `${euros(p.estimate.priceLow)} €`
                    : `${euros(p.estimate.priceLow)} – ${euros(p.estimate.priceHigh)} €`}{' '}
                  · {p.estimate.delay.replace(/^environ /, '~').replace(/semaines?/, 'sem.')}
                </span>
              )}
              {figmaEnabled && (p.figma_error || !p.figma_url) && (
                <button type="button" className="admin-link prospect-card__error-link" onClick={onRetryFigma} title={p.figma_error ?? ''}>
                  Import Figma en échec — réessayer
                </button>
              )}
              {(p.status === 'nouveau' || p.status === 'maquette') && (
                <button type="button" className="admin-link admin-link--muted" onClick={onCreateMockup}>
                  Faire une V{p.mockup_version + 1}
                </button>
              )}
            </div>
          )}
        </div>

        <div className="prospect-card__actions">
          <Actions p={p} working={working} showLog={showLog} onMail={onMail} onStatus={onStatus} onDevelop={onDevelop} onOpenFolder={onOpenFolder} onToggleLog={() => setShowLog(!showLog)} />
        </div>
      </div>

      {showLog && (
        <div className="prospect-card__details">
          {p.dev_dir && (
            <p className="admin-muted">
              Dossier : <code>{p.dev_dir}</code>
            </p>
          )}
          {p.dev_error && <p className="admin-error">{p.dev_error}</p>}
          {p.dev_summary && <p className="prospect-card__summary">{p.dev_summary}</p>}
          <pre className="admin-log">{p.dev_log.length ? [...p.dev_log].reverse().join('\n') : '…'}</pre>
        </div>
      )}

      {open && (
        <div className="prospect-card__details">
          <p>{p.summary}</p>
          <ul className="prospect-card__issues">
            {p.issues.map((issue) => (
              <li key={issue}>{issue}</li>
            ))}
          </ul>
          {p.estimate && (
            <p>
              <strong>Estimation :</strong> {p.estimate.summary} Délai {p.estimate.delay}, budget {p.estimate.price}.
            </p>
          )}
          {p.mockup_error && <p className="admin-error">Maquette : {p.mockup_error}</p>}
          {p.figma_error && <p className="admin-error">Figma : {p.figma_error}</p>}
        </div>
      )}
    </article>
  );
}

/** Boutons selon l'étape du prospect. */
function Actions({ p, working, showLog, onMail, onStatus, onDevelop, onOpenFolder, onToggleLog }) {
  const logButton = (
    <button type="button" className="admin-link admin-link--muted" onClick={onToggleLog}>
      {showLog ? 'Masquer le journal' : 'Voir le journal'}
    </button>
  );

  switch (p.status) {
    case 'mail_envoye':
      return (
        <>
          <span className="prospect-card__done">Mail envoyé le {new Date(p.sent_at).toLocaleDateString('fr-FR')}</span>
          <button type="button" className="admin-button" onClick={() => onStatus('validation')}>
            Passer en validation
          </button>
        </>
      );
    case 'validation':
      return (
        <>
          <span className="admin-muted prospect-card__note">Maquette en cours de validation</span>
          <button type="button" className="admin-button admin-button--primary" onClick={onDevelop}>
            Lancer le développement
          </button>
        </>
      );
    case 'developpement':
      return (
        <>
          {p.dev_status === 'running' && <span className="prospect-card__working">Développement en cours…</span>}
          {p.dev_status === 'done' && <span className="prospect-card__done">Site développé</span>}
          {p.dev_status === 'error' && <span className="admin-error">Développement interrompu</span>}
          {p.dev_dir && p.dev_status !== 'running' && (
            <button type="button" className="admin-button admin-button--small" onClick={onOpenFolder}>
              Ouvrir le dossier
            </button>
          )}
          {p.dev_status !== 'running' && (
            <button type="button" className="admin-link" onClick={onDevelop}>
              {p.dev_status === 'error' ? 'Relancer' : 'Relancer (corrections)'}
            </button>
          )}
          {logButton}
        </>
      );
    case 'ecarte':
      return (
        <button type="button" className="admin-link" onClick={() => onStatus(p.mockup_preview ? 'maquette' : 'nouveau')}>
          Restaurer
        </button>
      );
    default:
      return (
        <>
          <button
            type="button"
            className="admin-button admin-button--accent"
            disabled={p.mockup_status !== 'done' || working}
            onClick={onMail}
            title={p.mockup_status !== 'done' ? 'Créez d’abord la maquette' : ''}
          >
            Envoyer le mail
          </button>
          <button type="button" className="admin-link admin-link--muted" onClick={() => onStatus('ecarte')}>
            Écarter
          </button>
        </>
      );
  }
}
