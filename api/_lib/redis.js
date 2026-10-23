/**
 * Client minimal pour Upstash Redis (API REST), sans dépendance.
 * Variables fournies par l'intégration Vercel « Upstash for Redis » :
 * KV_REST_API_URL / KV_REST_API_TOKEN (ou UPSTASH_REDIS_REST_URL / UPSTASH_REDIS_REST_TOKEN).
 */
const url = () => process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
const token = () => process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;

export const redisConfigured = () => Boolean(url() && token());

async function call(path, body) {
  const response = await fetch(`${url()}${path}`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token()}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!response.ok) throw new Error(`Redis : ${response.status} ${await response.text()}`);
  return response.json();
}

/** Une commande : redis(['INCR', 'clé']) → résultat. */
export async function redis(command) {
  const data = await call('', command);
  if (data.error) throw new Error(`Redis : ${data.error}`);
  return data.result;
}

/** Plusieurs commandes en un seul aller-retour → tableau des résultats. */
export async function pipeline(commands) {
  if (!commands.length) return [];
  const data = await call('/pipeline', commands);
  return data.map((item) => {
    if (item.error) throw new Error(`Redis : ${item.error}`);
    return item.result;
  });
}
