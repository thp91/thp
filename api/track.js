import { key, dayKey, RETENTION_SECONDS, visitorId } from './_lib/analytics.js';
import { classifySource, deviceOf, isBot } from './_lib/sources.js';
import { clientIp, methodNotAllowed, parseBody } from './_lib/http.js';
import { pipeline, redisConfigured } from './_lib/redis.js';

/**
 * Enregistre une page vue (appelé par le site à chaque chargement, via sendBeacon).
 * Aucune donnée personnelle stockée : compteurs agrégés par jour + identifiant de visiteur
 * haché et renouvelé chaque jour (pas de cookie, pas de bandeau de consentement nécessaire).
 */
export default async function handler(req, res) {
  if (req.method !== 'POST') return methodNotAllowed(res, 'POST');
  if (!redisConfigured()) return res.status(204).end();

  const userAgent = String(req.headers['user-agent'] || '');
  if (isBot(userAgent)) return res.status(204).end();

  const body = parseBody(req);
  const path = String(body.path || '/').split('?')[0].slice(0, 120) || '/';
  if (path.startsWith('/admin')) return res.status(204).end();

  const day = dayKey();
  const source = classifySource({
    referrer: String(body.referrer || ''),
    utmSource: String(body.utm_source || ''),
    ownHost: String(req.headers.host || '').split(':')[0],
  });

  const commands = [
    ['INCR', key.pageviews(day)],
    ['PFADD', key.visitors(day), visitorId({ ip: clientIp(req), userAgent, day })],
    ['HINCRBY', key.pages(day), path, 1],
    ['HINCRBY', key.devices(day), deviceOf(userAgent), 1],
  ];
  // La navigation interne (référent = le site lui-même) ne compte pas comme une provenance
  if (source) commands.push(['HINCRBY', key.sources(day), `${source.group}|${source.label}`, 1]);
  for (const name of ['pageviews', 'visitors', 'pages', 'devices', 'sources']) {
    commands.push(['EXPIRE', key[name](day), RETENTION_SECONDS]);
  }

  try {
    await pipeline(commands);
  } catch (error) {
    console.error(error);
  }
  return res.status(204).end();
}
