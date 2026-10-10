import { TILES } from '../../data/tiles';
import './TileGrid.css';

/** Grille de composition 5 × 5 (Figma 7:57 → 7:81). */
export default function TileGrid({ className = '', hidePieces = false }) {
  return (
    <div className={`tile-grid ${className}`.trim()} aria-hidden="true">
      <div className="tile-grid__inner">
        {TILES.map((tile) => {
          if (hidePieces && tile.piece) return null;
          const classes = [
            'tile-grid__tile',
            `tile-grid__tile--${tile.tone}`,
            tile.round && 'tile-grid__tile--round',
            tile.faint && 'tile-grid__tile--faint',
          ]
            .filter(Boolean)
            .join(' ');
          return (
            <span
              key={tile.id}
              className={classes}
              style={{ '--row': tile.row, '--col': tile.col }}
              data-tile={tile.id}
            />
          );
        })}
      </div>
    </div>
  );
}
