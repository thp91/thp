import { LOGO_PIECES } from '../assets/logos/thpLetters';
import { GRID, TILES } from '../data/tiles';

/**
 * Géométrie des pièces du logo dans le repère de la scène (1440 × 900),
 * pour chaque état de l'histoire. Valeurs relevées dans le Figma.
 */
const HERO_LOGO = { x: 990, y: 204, scale: 405 / 1090 }; // frame 10:7
const BRAND_LOGO = { x: 164, y: 177, scale: 1 }; // frame 10:12
export const BROWSER = { x: 626, y: 125, width: 741, height: 634 }; // frame 7:89
export const PHONE = { x: 930, y: 140, width: 300, height: 620 };

/** Écartement des lettres lorsqu'elles « se détachent » (scène 02). */
const DETACH = {
  't-bar': { dx: -70, dy: -18, grow: 1 },
  't-stem': { dx: -70, dy: 14, grow: 1 },
  'h-left': { dx: -22, dy: 0, grow: 1.04 },
  'h-right': { dx: 22, dy: 0, grow: 1.04 },
  p: { dx: 74, dy: -24, grow: 1.1 },
};

/** Blocs d'interface qui prennent le relais des formes (positions relatives au navigateur). */
const UI = {
  't-bar': { x: 0, y: 0, width: 741, height: 58, radius: '16px 16px 0px 0px' },
  'h-left': { x: 37, y: 146, width: 667, height: 321, radius: '16px 16px 16px 16px' },
  p: { x: 71, y: 385, width: 237, height: 44, radius: '22px 22px 22px 22px' },
  't-stem': { x: 37, y: 503, width: 205, height: 85, radius: '12px 12px 12px 12px' },
  'h-right': { x: 264, y: 503, width: 205, height: 85, radius: '12px 12px 12px 12px' },
  card: { x: 491, y: 503, width: 213, height: 85, radius: '12px 12px 12px 12px' },
};

const fromLogo = (box, logo) => ({
  x: logo.x + box.x * logo.scale,
  y: logo.y + box.y * logo.scale,
  width: box.width * logo.scale,
  height: box.height * logo.scale,
});

const tileFor = (pieceId) => TILES.find((tile) => tile.piece === pieceId);

export const getPieceStates = () => {
  const states = {};

  LOGO_PIECES.forEach(({ id, box }) => {
    const brand = fromLogo(box, BRAND_LOGO);
    const { dx, dy, grow } = DETACH[id];
    states[id] = {
      hero: fromLogo(box, HERO_LOGO),
      brand,
      detached: {
        x: brand.x + dx - (brand.width * (grow - 1)) / 2,
        y: brand.y + dy - (brand.height * (grow - 1)) / 2,
        width: brand.width * grow,
        height: brand.height * grow,
      },
    };
  });

  states.card = {};

  Object.keys(UI).forEach((id) => {
    const tile = tileFor(id);
    const ui = UI[id];
    const tileRadius = tile.round ? 40 : 8;
    states[id].tile = {
      x: GRID.originX + tile.col * GRID.step,
      y: GRID.originY + tile.row * GRID.step,
      width: GRID.size,
      height: GRID.size,
      borderRadius: `${tileRadius}px ${tileRadius}px ${tileRadius}px ${tileRadius}px`,
    };
    states[id].ui = {
      x: BROWSER.x + ui.x,
      y: BROWSER.y + ui.y,
      width: ui.width,
      height: ui.height,
      borderRadius: ui.radius,
    };
  });

  return states;
};
