import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import contactHandler from './api/contact.js';

/**
 * En développement, sert la fonction /api/contact (identique à celle déployée sur Vercel)
 * pour tester le formulaire avec `npm run dev`. Les variables viennent de .env.local.
 */
const devApi = (env) => ({
  name: 'thp-dev-api',
  configureServer(server) {
    Object.assign(process.env, env);
    server.middlewares.use('/api/contact', (req, res) => {
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
        };
        try {
          await contactHandler({ method: req.method, body: raw }, shim);
        } catch (error) {
          console.error(error);
          shim.status(500).json({ error: 'Erreur interne.' });
        }
      });
    });
  },
});

export default defineConfig(({ mode }) => ({
  plugins: [react(), devApi(loadEnv(mode, process.cwd(), ''))],
}));
