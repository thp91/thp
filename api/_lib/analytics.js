import crypto from 'node:crypto';

/** Clés Redis de l'analytics, une série par jour (fuseau Europe/Paris), conservées ~13 mois. */
export const RETENTION_SECONDS = 60 * 60 * 24 * 400;

export const key = {
  pageviews: (day) => `a:pv:${day}`,
  visitors: (day) => `a:uv:${day}`,
  sources: (day) => `a:src:${day}`,
  pages: (day) => `a:page:${day}`,
  devices: (day) => `a:dev:${day}`,
};

const dayFormat = new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/Paris', year: 'numeric', month: '2-digit', day: '2-digit' });

/** Date du jour (ou décalée de `offset` jours) au format AAAA-MM-JJ, heure de Paris. */
export const dayKey = (offset = 0) => dayFormat.format(new Date(Date.now() + offset * 86400000));

/**
 * Identifiant de visiteur anonyme, sans cookie : empreinte (IP + navigateur) salée et
 * renouvelée chaque jour. Impossible de retrouver l'IP ni de suivre quelqu'un d'un jour à l'autre.
 */
export const visitorId = ({ ip, userAgent, day }) =>
  crypto
    .createHash('sha256')
    .update(`${day}|${ip}|${userAgent}|${process.env.ANALYTICS_SALT || process.env.ADMIN_SESSION_SECRET || 'thp'}`)
    .digest('hex')
    .slice(0, 32);
