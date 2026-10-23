import { lazy, StrictMode, Suspense } from 'react';
import { createRoot } from 'react-dom/client';
import '@fontsource-variable/inter/wght.css';
import './styles/reset.css';
import './styles/variables.css';
import './styles/typography.css';
import './styles/global.css';
import App from './App';
import { trackPageview } from './lib/analytics';

// L'espace admin est chargé à part : il n'alourdit pas le site public
const AdminApp = lazy(() => import('./admin/AdminApp'));
const isAdmin = window.location.pathname.startsWith('/admin');

if (!isAdmin) trackPageview();

createRoot(document.getElementById('root')).render(
  <StrictMode>
    {isAdmin ? (
      <Suspense fallback={null}>
        <AdminApp />
      </Suspense>
    ) : (
      <App />
    )}
  </StrictMode>,
);
