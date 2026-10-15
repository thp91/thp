/**
 * Fonction serveur (Vercel) : envoie les messages du formulaire de contact via Resend.
 * La clé API reste côté serveur (variable d'environnement), jamais dans le code du site.
 *
 * Variables d'environnement :
 * - RESEND_API_KEY (obligatoire)
 * - CONTACT_TO     (destinataire, par défaut thp.development.pro@gmail.com)
 * - CONTACT_FROM   (expéditeur ; par défaut l'adresse de test de Resend, à remplacer
 *                   par une adresse de votre domaine une fois celui-ci vérifié dans Resend)
 */
const DEFAULT_TO = 'thp.development.pro@gmail.com';
const DEFAULT_FROM = 'THP Development <onboarding@resend.dev>';
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

const escapeHtml = (value) =>
  value.replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]);

/** Contrôle des champs ; renvoie un message d'erreur lisible ou null. */
export function validate({ name, email, message }) {
  if (!name || name.length > 100) return 'Merci d’indiquer votre nom.';
  if (!email || email.length > 200 || !EMAIL_PATTERN.test(email)) return 'Merci d’indiquer une adresse e-mail valide.';
  if (!message || message.length < 10) return 'Votre message est un peu court : décrivez votre projet en quelques mots.';
  if (message.length > 5000) return 'Votre message est trop long (5 000 caractères maximum).';
  return null;
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Méthode non autorisée.' });
  }

  const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : req.body || {};
  const name = String(body.name ?? '').trim();
  const email = String(body.email ?? '').trim();
  const message = String(body.message ?? '').trim();

  // Champ piège invisible : rempli uniquement par les robots → on fait semblant d'accepter
  if (body.company) return res.status(200).json({ ok: true });

  const error = validate({ name, email, message });
  if (error) return res.status(400).json({ error });

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return res.status(500).json({ error: 'Envoi indisponible pour le moment.' });

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      from: process.env.CONTACT_FROM || DEFAULT_FROM,
      to: [process.env.CONTACT_TO || DEFAULT_TO],
      reply_to: email,
      subject: `Nouveau projet — ${name}`,
      text: `${message}\n\n—\n${name}\n${email}`,
      html: `
        <p style="font-family:system-ui,sans-serif;font-size:15px;line-height:1.5;white-space:pre-wrap">${escapeHtml(message)}</p>
        <hr style="border:0;border-top:1px solid #eae6e1;margin:24px 0">
        <p style="font-family:system-ui,sans-serif;font-size:14px;color:#5b5a58">
          <strong>${escapeHtml(name)}</strong><br>
          <a href="mailto:${escapeHtml(email)}">${escapeHtml(email)}</a>
        </p>`,
    }),
  });

  if (!response.ok) {
    console.error('Resend :', response.status, await response.text());
    return res.status(502).json({ error: 'L’envoi a échoué. Vous pouvez m’écrire directement par e-mail.' });
  }

  return res.status(200).json({ ok: true });
}
