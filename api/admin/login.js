import { adminConfigured, checkPassword, startSession } from '../_lib/auth.js';
import { clientIp, methodNotAllowed, parseBody } from '../_lib/http.js';
import { pipeline, redisConfigured } from '../_lib/redis.js';

const MAX_ATTEMPTS = 10; // par adresse IP et par quart d'heure

export default async function handler(req, res) {
  if (req.method !== 'POST') return methodNotAllowed(res, 'POST');
  if (!adminConfigured()) {
    return res.status(503).json({ error: 'Espace admin non configuré : définissez ADMIN_PASSWORD.' });
  }

  // Limite les essais de mot de passe (si Redis est disponible)
  if (redisConfigured()) {
    const attemptsKey = `a:login:${clientIp(req)}`;
    const [attempts] = await pipeline([['INCR', attemptsKey], ['EXPIRE', attemptsKey, 900]]);
    if (attempts > MAX_ATTEMPTS) {
      return res.status(429).json({ error: 'Trop de tentatives. Réessayez dans un quart d’heure.' });
    }
  }

  if (!checkPassword(String(parseBody(req).password || ''))) {
    await new Promise((resolve) => setTimeout(resolve, 600));
    return res.status(401).json({ error: 'Mot de passe incorrect.' });
  }

  startSession(res);
  return res.status(200).json({ authenticated: true });
}
