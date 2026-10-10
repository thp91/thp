/**
 * Détecte la couleur de la surface visible sous un point de l'écran.
 * Surfaces : les <section> et les éléments [data-surface] (calques de couleur animés).
 * Les calques transparents, masqués ou à moins de 50 % d'opacité sont ignorés.
 */
const parseRgb = (value) => {
  const match = value.match(/rgba?\(([^)]+)\)/);
  if (!match) return null;
  const [r, g, b, a = 1] = match[1].split(/[\s,/]+/).filter(Boolean).map(Number);
  return { r, g, b, a };
};

export function getSurfaceAt(x, y, ignore) {
  const elements = document.elementsFromPoint(x, y);

  for (const element of elements) {
    if (ignore?.contains(element) || !element.matches('section, [data-surface]')) continue;
    const style = getComputedStyle(element);
    const color = parseRgb(style.backgroundColor);
    if (!color || color.a < 0.5 || Number(style.opacity) < 0.5) continue;
    return { color: style.backgroundColor, rgb: color };
  }

  const bodyColor = getComputedStyle(document.body).backgroundColor;
  return { color: bodyColor, rgb: parseRgb(bodyColor) };
}

/** Luminance relative (WCAG) : < 0.4 → fond sombre. */
export const isDark = ({ r, g, b }) => {
  const channel = (value) => {
    const c = value / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b) < 0.4;
};
