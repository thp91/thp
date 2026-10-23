import { adminConfigured, isAuthenticated } from '../_lib/auth.js';
import { redisConfigured } from '../_lib/redis.js';

export default function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  return res.status(200).json({
    configured: adminConfigured(),
    authenticated: isAuthenticated(req),
    analytics: redisConfigured(),
  });
}
