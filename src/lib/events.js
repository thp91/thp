/**
 * Petit bus d'événements pour synchroniser l'indicateur de progression
 * avec les timelines, sans état React global.
 */
const SCENE_EVENT = 'thp:scene';

export const emitScene = (scene) => {
  window.dispatchEvent(new CustomEvent(SCENE_EVENT, { detail: scene }));
};

export const onScene = (callback) => {
  const handler = (event) => callback(event.detail);
  window.addEventListener(SCENE_EVENT, handler);
  return () => window.removeEventListener(SCENE_EVENT, handler);
};
