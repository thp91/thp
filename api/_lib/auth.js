import crypto from 'node:crypto';
import { parseCookies } from './http.js';

/**
 * Session administrateur : cookie HttpOnly signé (HMAC-SHA256), sans base de données.
 * Variables : ADMIN_PASSWORD (obligatoire), ADMIN_SESSION_SECRET (recommandé, sinon dérivé du mot de passe).
 */
const COOKIE = 'thp_admin';
const MAX_AGE = 60 * 60 * 24 * 7; // 7 jours

const secret = () => process.env.ADMIN_SESSION_SECRET || `thp-admin:${process.env.ADMIN_PASSWORD || ''}`;
const sign = (value) => crypto.createHmac('sha256', secret()).update(value).digest('base64url');

const safeEqual = (a, b) => {
  const ha = crypto.createHash('sha256').update(String(a)).digest();
  const hb = crypto.createHash('sha256').update(String(b)).digest();
  return crypto.timingSafeEqual(ha, hb);
};

export const adminConfigured = () => Boolean(process.env.ADMIN_PASSWORD);

export const checkPassword = (password) => adminConfigured() && safeEqual(password, process.env.ADMIN_PASSWORD);

const cookie = (value, maxAge) =>
  [
    `${COOKIE}=${value}`,
    'Path=/',
    'HttpOnly',
    'SameSite=Strict',
    `Max-Age=${maxAge}`,
    process.env.NODE_ENV === 'production' || process.env.VERCEL ? 'Secure' : '',
  ]
    .filter(Boolean)
    .join('; ');

export function startSession(res) {
  const expires = Math.floor(Date.now() / 1000) + MAX_AGE;
  res.setHeader('Set-Cookie', cookie(`${expires}.${sign(String(expires))}`, MAX_AGE));
}

export function endSession(res) {
  res.setHeader('Set-Cookie', cookie('', 0));
}

export function isAuthenticated(req) {
  if (!adminConfigured()) return false;
  const [expires, signature] = String(parseCookies(req)[COOKIE] || '').split('.');
  if (!expires || !signature || Number(expires) < Date.now() / 1000) return false;
  return safeEqual(signature, sign(expires));
}

/** À appeler en tête de chaque route protégée : renvoie false (et répond 401) si non connecté. */
export function requireAdmin(req, res) {
  if (isAuthenticated(req)) return true;
  res.status(401).json({ error: 'Session expirée : reconnectez-vous.' });
  return false;
}
