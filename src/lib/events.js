/**
 * Petit bus d'événements pour synchroniser l'interface (en-tête, progression)
 * avec les timelines, sans état React global.
 */
const SCENE_EVENT = 'thp:scene';
const HEADER_THEME_EVENT = 'thp:header-theme';

export const emitScene = (scene) => {
  window.dispatchEvent(new CustomEvent(SCENE_EVENT, { detail: scene }));
};

export const onScene = (callback) => {
  const handler = (event) => callback(event.detail);
  window.addEventListener(SCENE_EVENT, handler);
  return () => window.removeEventListener(SCENE_EVENT, handler);
};

export const emitHeaderTheme = (theme) => {
  window.dispatchEvent(new CustomEvent(HEADER_THEME_EVENT, { detail: theme }));
};

export const onHeaderTheme = (callback) => {
  const handler = (event) => callback(event.detail);
  window.addEventListener(HEADER_THEME_EVENT, handler);
  return () => window.removeEventListener(HEADER_THEME_EVENT, handler);
};
