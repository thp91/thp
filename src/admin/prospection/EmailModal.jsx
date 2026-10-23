import { useEffect, useRef, useState } from 'react';
import { prospectApi } from '../api';
import Modal from './Modal';

/** Rédaction (par Claude) et envoi (via Resend) du mail de prospection. */
export default function EmailModal({ prospect: p, onClose, onSent }) {
  const [to, setTo] = useState(p.email ?? '');
  const [subject, setSubject] = useState(p.email_subject ?? '');
  const [body, setBody] = useState(p.email_body ?? '');
  const [link, setLink] = useState(p.figma_url);
  const [drafting, setDrafting] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');

  const draft = async () => {
    setDrafting(true);
    setError('');
    try {
      const d = await prospectApi.draftEmail(p.id);
      setSubject(d.subject);
      setBody(d.body);
      setLink(d.mockupLink);
    } catch (draftError) {
      setError(draftError.message);
    } finally {
      setDrafting(false);
    }
  };

  // À la première ouverture, Claude rédige le mail s'il n'existe pas encore
  const drafted = useRef(false);
  useEffect(() => {
    if (drafted.current || p.email_body) return;
    drafted.current = true;
    draft();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const send = async () => {
    setSending(true);
    setError('');
    try {
      onSent(await prospectApi.sendEmail(p.id, to, subject, body));
    } catch (sendError) {
      setError(sendError.message);
      setSending(false);
    }
  };

  const missingLink = body.includes('[LIEN DE LA MAQUETTE]');

  return (
    <Modal
      title="Mail de prospection"
      subtitle={
        <>
          {p.name} ·{' '}
          <a className="admin-link" href={p.url} target="_blank" rel="noreferrer">
            {p.domain}
          </a>
          {link && (
            <>
              {' '}·{' '}
              <a className="admin-link" href={link} target="_blank" rel="noreferrer">
                maquette ↗
              </a>
            </>
          )}
        </>
      }
      onClose={onClose}
      footer={
        <>
          <button type="button" className="admin-button" onClick={draft} disabled={drafting || sending}>
            {drafting ? 'Rédaction…' : 'Régénérer avec Claude'}
          </button>
          <span className="admin-modal__spacer" />
          <button type="button" className="admin-button" onClick={onClose}>
            Annuler
          </button>
          <button type="button" className="admin-button admin-button--primary" onClick={send} disabled={drafting || sending || !to || !subject || !body || missingLink}>
            {sending ? 'Envoi…' : 'Envoyer'}
          </button>
        </>
      }
    >
      <label className="admin-field">
        Destinataire
        <input className="admin-input" list="modal-emails" value={to} onChange={(e) => setTo(e.target.value)} />
        <datalist id="modal-emails">
          {p.emails.map((item) => (
            <option key={item} value={item} />
          ))}
        </datalist>
      </label>
      <label className="admin-field">
        Objet
        <input className="admin-input" value={subject} onChange={(e) => setSubject(e.target.value)} disabled={drafting} />
      </label>
      <label className="admin-field">
        Message
        <textarea className="admin-input" value={drafting ? 'Claude rédige le mail…' : body} onChange={(e) => setBody(e.target.value)} disabled={drafting} rows={14} />
      </label>
      {missingLink && <p className="admin-error">Aucun lien de maquette disponible : remplacez [LIEN DE LA MAQUETTE] par le lien Figma partagé.</p>}
      {error && <p className="admin-error">{error}</p>}
    </Modal>
  );
}
