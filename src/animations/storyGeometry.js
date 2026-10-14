import { LOGO_PIECES } from '../assets/logos/thpLetters';
import { TILES } from '../data/tiles';

/**
 * Géométrie de l'histoire (scènes 01 → 04) pour chaque mise en page.
 * - landscape : repère Figma 1440 × 900 (valeurs relevées dans la maquette) ;
 * - portrait  : repère mobile 390 × 700, composition verticale dédiée.
 */
export const STORY_LAYOUTS = {
  landscape: {
    size: { width: 1440, height: 900 },
    heroLogo: { x: 990, y: 204, scale: 405 / 1090 }, // Figma 10:7
    brandLogo: { x: 164, y: 177, scale: 1 }, // Figma 10:12
    // Lettres détachées : écartement horizontal, le P grandit
    detached: {
      't-bar': { dx: -70, dy: -18, grow: 1 },
      't-stem': { dx: -70, dy: 14, grow: 1 },
      'h-left': { dx: -22, dy: 0, grow: 1.04 },
      'h-right': { dx: 22, dy: 0, grow: 1.04 },
      p: { dx: 74, dy: -24, grow: 1.1 },
    },
    grid: { x: 825, y: 186, step: 99, size: 84, roundRadius: 40, squareRadius: 8 }, // Figma 7:57 → 7:81
    browser: { x: 626, y: 125, width: 741 }, // Figma 7:89
    responsive: {
      zoom: { x: -170, y: -10, scale: 1.12 },
      phone: { x: 930, y: 140, width: 300 },
      hideOnPhone: null,
    },
  },
  portrait: {
    size: { width: 390, height: 700 },
    heroLogo: { x: 20, y: 452, scale: 350 / 1090 },
    brandLogo: { x: 8, y: 150, scale: 374 / 1090 },
    // Lettres détachées : elles se réorganisent en colonne, en zigzag autour des mots
    stacked: {
      scale: 0.42,
      origins: {
        't-bar': { x: 24, y: 118 },
        't-stem': { x: 24, y: 118 },
        'h-left': { x: 210 - 389.978 * 0.42, y: 232 },
        'h-right': { x: 296 - 577.7 * 0.42, y: 232 },
        p: { x: 24 - 767.844 * 0.42, y: 428 },
      },
    },
    grid: { x: 35, y: 326, step: 66, size: 56, roundRadius: 27, squareRadius: 6 },
    browser: { x: 20, y: 318, width: 350 },
    responsive: {
      zoom: { x: 0, y: -110, scale: 1.08 },
      phone: { x: 175, y: 236, width: 195 },
      hideOnPhone: '.preview__text',
    },
  },
};

/** Blocs d'interface qui prennent le relais des formes (repère du navigateur 741 × 634, Figma 7:89). */
const UI = {
  't-bar': { x: 0, y: 0, width: 741, height: 58, radii: [16, 16, 0, 0] },
  'h-left': { x: 37, y: 146, width: 667, height: 321, radii: [16, 16, 16, 16] },
  p: { x: 71, y: 385, width: 237, height: 44, radii: [22, 22, 22, 22] },
  't-stem': { x: 37, y: 503, width: 205, height: 85, radii: [12, 12, 12, 12] },
  'h-right': { x: 264, y: 503, width: 205, height: 85, radii: [12, 12, 12, 12] },
  card: { x: 491, y: 503, width: 213, height: 85, radii: [12, 12, 12, 12] },
};

const radius = (values, factor = 1) => values.map((value) => `${value * factor}px`).join(' ');

const fromLogo = (box, logo) => ({
  x: logo.x + box.x * logo.scale,
  y: logo.y + box.y * logo.scale,
  width: box.width * logo.scale,
  height: box.height * logo.scale,
});

const detachedRect = (layout, id, box, brand) => {
  if (layout.stacked) {
    const { scale, origins } = layout.stacked;
    return fromLogo(box, { ...origins[id], scale });
  }
  const { dx, dy, grow } = layout.detached[id];
  return {
    x: brand.x + dx - (brand.width * (grow - 1)) / 2,
    y: brand.y + dy - (brand.height * (grow - 1)) / 2,
    width: brand.width * grow,
    height: brand.height * grow,
  };
};

export const getPieceStates = (layout) => {
  const states = { card: {} };
  const { grid, browser } = layout;
  const factor = browser.width / 741;

  LOGO_PIECES.forEach(({ id, box }) => {
    const brand = fromLogo(box, layout.brandLogo);
    states[id] = {
      hero: fromLogo(box, layout.heroLogo),
      brand,
      detached: detachedRect(layout, id, box, brand),
    };
  });

  Object.keys(UI).forEach((id) => {
    const tile = TILES.find((item) => item.piece === id);
    const ui = UI[id];
    const tileRadius = tile.round ? grid.roundRadius : grid.squareRadius;

    states[id].tile = {
      x: grid.x + tile.col * grid.step,
      y: grid.y + tile.row * grid.step,
      width: grid.size,
      height: grid.size,
      borderRadius: radius([tileRadius, tileRadius, tileRadius, tileRadius]),
    };
    states[id].ui = {
      x: browser.x + ui.x * factor,
      y: browser.y + ui.y * factor,
      width: ui.width * factor,
      height: ui.height * factor,
      borderRadius: radius(ui.radii, factor),
    };
  });

  return states;
};

/** Proportions des maquettes (BrowserMockup 741 × 634, PhoneMockup 300 × 620). */
const BROWSER_RATIO = 634 / 741;
const PHONE_RATIO = 620 / 300;

/**
 * Étapes du « redimensionnement » navigateur → téléphone :
 * - start : cadre du navigateur après le zoom (même rectangle que le navigateur visible) ;
 * - end   : rectangle et arrondi de la coque du téléphone.
 */
export const getMorphStates = (layout) => {
  const { browser, responsive } = layout;
  const { zoom, phone } = responsive;
  const width = browser.width * zoom.scale;
  const height = browser.width * BROWSER_RATIO * zoom.scale;
  const centerX = browser.x + browser.width / 2 + zoom.x;
  const centerY = browser.y + (browser.width * BROWSER_RATIO) / 2 + zoom.y;

  // Rognage du navigateur (dans son repère local, avant le zoom) qui suit le cadre
  const baseHeight = browser.width * BROWSER_RATIO;
  const toLocal = (px, py) => [
    (px - centerX) / zoom.scale + browser.width / 2,
    (py - centerY) / zoom.scale + baseHeight / 2,
  ];
  const phoneHeight = phone.width * PHONE_RATIO;
  const [left, top] = toLocal(phone.x, phone.y);
  const [right, bottom] = toLocal(phone.x + phone.width, phone.y + phoneHeight);
  const px = (value) => `${Math.max(0, value).toFixed(1)}px`;
  const endRadius = (46 * phone.width) / 300 / zoom.scale;

  return {
    clipStart: `inset(0px 0px 0px 0px round ${((16 * browser.width) / 741).toFixed(1)}px)`,
    clipEnd: `inset(${px(top)} ${px(browser.width - right)} ${px(baseHeight - bottom)} ${px(left)} round ${endRadius.toFixed(1)}px)`,
    start: {
      x: centerX - width / 2,
      y: centerY - height / 2,
      width,
      height,
      borderRadius: (16 * width) / 741,
    },
    end: {
      x: phone.x,
      y: phone.y,
      width: phone.width,
      height: phone.width * PHONE_RATIO,
      borderRadius: (46 * phone.width) / 300,
    },
  };
};
