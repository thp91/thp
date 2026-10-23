import { useState } from 'react';
import { prospectApi } from '../api';
import Modal from './Modal';

/** Lancement (ou reprise) du développement du site client par Claude Code. */
export default function DevModal({ prospect: p, onClose, onStarted }) {
  const [figmaUrl, setFigmaUrl] = useState(p.figma_url ?? '');
  const [siteDomain, setSiteDomain] = useState(p.site_domain ?? p.domain);
  const [notes, setNotes] = useState('');
  const [starting, setStarting] = useState(false);
  const [error, setError] = useState('');
  const resuming = p.dev_status !== 'none';

  const start = async () => {
    setStarting(true);
    setError('');
    try {
      onStarted(await prospectApi.develop(p.id, figmaUrl, siteDomain, notes));
    } catch (startError) {
      setError(startError.message);
      setStarting(false);
    }
  };

  return (
    <Modal
      title={resuming ? 'Relancer le développement' : 'Lancer le développement'}
      subtitle={p.name}
      onClose={onClose}
      footer={
        <>
          <span className="admin-modal__spacer" />
          <button type="button" className="admin-button" onClick={onClose}>
            Annuler
          </button>
          <button type="button" className="admin-button admin-button--primary" onClick={start} disabled={starting || !figmaUrl || !siteDomain}>
            {starting ? 'Lancement…' : resuming ? 'Relancer' : 'Lancer le développement'}
          </button>
        </>
      }
    >
      <p className="admin-muted">
        Claude Code va lire la maquette Figma et développer le site (React, CSS classique, images WebP, animations au scroll,
        responsive et SEO complet). Comptez de 30 minutes à plus d’une heure, avec une bonne part du quota de votre abonnement.
        {resuming && ' Le travail déjà fait est conservé : Claude reprend là où il s’est arrêté.'}
      </p>
      <label className="admin-field">
        Lien Figma de la page d’accueil validée
        <input className="admin-input" value={figmaUrl} onChange={(e) => setFigmaUrl(e.target.value)} placeholder="https://www.figma.com/design/…?node-id=…" />
        <span className="admin-field__hint">Les autres pages sont les autres cadres du fichier (« Services », « Contact »…). Les anciennes versions « V1 — … » sont ignorées.</span>
      </label>
      <label className="admin-field">
        Nom de domaine du nouveau site
        <input className="admin-input" value={siteDomain} onChange={(e) => setSiteDomain(e.target.value)} placeholder="exemple.fr" />
        <span className="admin-field__hint">Sert aux canonical, au sitemap et à Open Graph. L’ancien site ({p.domain}) sert aux redirections 301.</span>
      </label>
      <label className="admin-field">
        <span>
          Consignes particulières <span className="admin-field__hint">(facultatif)</span>
        </span>
        <textarea
          className="admin-input"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={5}
          placeholder={resuming ? 'Ex. : corrige le menu mobile, ajoute une page FAQ…' : 'Ex. : ajoute une page FAQ, horaires du lundi au vendredi 8h-18h…'}
        />
      </label>
      {error && <p className="admin-error">{error}</p>}
    </Modal>
  );
}
