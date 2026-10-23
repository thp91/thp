import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

/**
 * En développement, sert les fonctions de api/ (identiques à celles déployées sur Vercel)
 * pour tester le formulaire, l'analytics et l'espace admin avec `npm run dev`.
 * /api/contact → api/contact.js, /api/admin/stats → api/admin/stats.js…
 * Les variables d'environnement viennent de .env.local.
 * /api/prospect est exclu : il est relayé vers le serveur local de prospection (proxy ci-dessous).
 */
const devApi = (env) => ({
  name: 'thp-dev-api',
  configureServer(server) {
    Object.assign(process.env, env);
    server.middlewares.use(async (req, res, next) => {
      const url = new URL(req.url, 'http://localhost');
      if (!url.pathname.startsWith('/api/') || url.pathname.startsWith('/api/prospect')) return next();

      const name = url.pathname.slice('/api/'.length).replace(/\/$/, '');
      const file = path.resolve('api', `${name}.js`);
      if (name.split('/').some((part) => part.startsWith('_') || part === '..') || !fs.existsSync(file)) return next();

      let raw = '';
      req.on('data', (chunk) => {
        raw += chunk;
      });
      req.on('end', async () => {
        const shim = {
          setHeader: (key, value) => res.setHeader(key, value),
          status(code) {
            res.statusCode = code;
            return shim;
          },
          json(payload) {
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify(payload));
            return shim;
          },
          end(body) {
            res.end(body);
            return shim;
          },
        };
        try {
          // Rechargé à chaque appel : les modifications sont prises en compte sans redémarrer
          const { default: handler } = await import(`${pathToFileURL(file).href}?t=${Date.now()}`);
          await handler(
            { method: req.method, headers: req.headers, body: raw, query: Object.fromEntries(url.searchParams), socket: req.socket },
            shim,
          );
        } catch (error) {
          console.error(error);
          if (!res.writableEnded) shim.status(500).json({ error: 'Erreur interne.' });
        }
      });
    });
  },
});

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  return {
    plugins: [react(), devApi(env)],
    server: {
      // Le serveur de prospection ne tourne qu'en local (npm run dev le lance avec le site)
      proxy: {
        '/api/prospect': `http://127.0.0.1:${env.PROSPECT_PORT || 3001}`,
      },
      watch: { ignored: ['**/prospect/data/**'] },
    },
  };
});
