/** Appels de l'espace admin : fonctions /api/admin (en ligne) et /api/prospect (local uniquement). */

async function request(url, init = {}) {
  const response = await fetch(url, {
    credentials: 'same-origin',
    ...init,
    headers: { 'Content-Type': 'application/json', ...init.headers },
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const error = new Error(data.error || `Erreur ${response.status}`);
    error.status = response.status;
    throw error;
  }
  return data;
}

const post = (url, body) => request(url, { method: 'POST', body: JSON.stringify(body ?? {}) });

export const adminApi = {
  session: () => request('/api/admin/session'),
  login: (password) => post('/api/admin/login', { password }),
  logout: () => post('/api/admin/logout'),
  stats: (days) => request(`/api/admin/stats?days=${days}`),
};

const P = '/api/prospect';

export const prospectApi = {
  config: () => request(`${P}/config`),
  prospects: () => request(`${P}/prospects`),
  searches: () => request(`${P}/searches`),
  startSearch: (activity, city, count) => post(`${P}/searches`, { activity, city, count }),
  update: (id, fields) => request(`${P}/prospects/${id}`, { method: 'PATCH', body: JSON.stringify(fields) }),
  createMockup: (id) => post(`${P}/prospects/${id}/mockup`),
  retryFigma: (id) => post(`${P}/prospects/${id}/figma`),
  draftEmail: (id) => post(`${P}/prospects/${id}/email/draft`),
  sendEmail: (id, to, subject, body) => post(`${P}/prospects/${id}/email/send`, { to, subject, body }),
  develop: (id, figmaUrl, siteDomain, notes) => post(`${P}/prospects/${id}/develop`, { figmaUrl, siteDomain, notes }),
  openFolder: (id) => post(`${P}/prospects/${id}/open-folder`),
};
