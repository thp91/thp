/**
 * Compte une page vue (analytics de l'espace admin).
 * Sans cookie : le serveur ne garde que des compteurs agrégés par jour.
 * Ignoré en local et dans l'espace admin.
 */
export function trackPageview() {
  const { hostname, pathname, search } = window.location;
  if (/^(localhost|127\.|\[::1\])/.test(hostname) || pathname.startsWith('/admin')) return;

  const payload = JSON.stringify({
    path: pathname,
    referrer: document.referrer,
    utm_source: new URLSearchParams(search).get('utm_source') || '',
  });
  const blob = new Blob([payload], { type: 'application/json' });
  if (!navigator.sendBeacon?.('/api/track', blob)) {
    fetch('/api/track', { method: 'POST', body: payload, headers: { 'Content-Type': 'application/json' }, keepalive: true }).catch(() => {});
  }
}
