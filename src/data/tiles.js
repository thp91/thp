/**
 * Grille de composition de la scène 03 (Figma 7:57 → 7:81) :
 * 5 × 5 tuiles de 84px, pas de 99px, origine (825, 186) dans le repère 1440 × 900.
 * `piece` : tuile occupée par une forme issue du logo ou destinée à l'interface.
 */
const ROWS = [
  ['ink-round', 'lavender', 'coral', 'line-round', 'ink'],
  ['lavender-faint', 'coral-round', 'line', 'ink', 'ink-round'],
  ['coral', 'line-faint', 'ink-round', 'ink', 'lavender'],
  ['line-round', 'ink', 'ink', 'lavender-round', 'coral-faint'],
  ['ink', 'ink-round', 'lavender', 'coral', 'line-round'],
];

const PIECE_CELLS = {
  '0-0': 't-bar',
  '0-4': 't-stem',
  '0-1': 'h-left',
  '2-4': 'h-right',
  '0-2': 'p',
  '4-3': 'card',
};

export const GRID = { originX: 825, originY: 186, step: 99, size: 84 };

export const TILES = ROWS.flatMap((row, rowIndex) =>
  row.map((style, colIndex) => {
    const [tone, variant] = style.split('-');
    return {
      id: `${rowIndex}-${colIndex}`,
      row: rowIndex,
      col: colIndex,
      tone,
      round: variant === 'round',
      faint: variant === 'faint',
      piece: PIECE_CELLS[`${rowIndex}-${colIndex}`] ?? null,
    };
  }),
);
