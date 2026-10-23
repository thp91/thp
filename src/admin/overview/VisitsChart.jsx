import { useEffect, useRef, useState } from 'react';

const HEIGHT = 240;
const PAD = { top: 16, right: 12, bottom: 28, left: 40 };
const dateLabel = (iso, long = false) =>
  new Date(`${iso}T12:00:00`).toLocaleDateString('fr-FR', long ? { weekday: 'long', day: 'numeric', month: 'long' } : { day: 'numeric', month: 'short' });

/** Arrondi « propre » du maximum de l'axe (1, 2, 5 × 10^n). */
const niceMax = (value) => {
  if (value <= 4) return 4;
  const power = 10 ** Math.floor(Math.log10(value));
  const step = [1, 2, 5, 10].find((m) => m * power >= value / 4) * power;
  return step * 4;
};

/**
 * Visiteurs uniques par jour : une seule série (pas de légende, le titre la nomme),
 * aire légère + ligne de 2px, réticule et infobulle au survol, table de données accessible.
 */
export default function VisitsChart({ series }) {
  const wrapRef = useRef(null);
  const [width, setWidth] = useState(640);
  const [hover, setHover] = useState(null);

  useEffect(() => {
    const observer = new ResizeObserver(([entry]) => setWidth(Math.max(280, entry.contentRect.width)));
    observer.observe(wrapRef.current);
    return () => observer.disconnect();
  }, []);

  const max = niceMax(Math.max(...series.map((d) => d.visitors), 0));
  const innerW = width - PAD.left - PAD.right;
  const innerH = HEIGHT - PAD.top - PAD.bottom;
  const x = (i) => PAD.left + (series.length > 1 ? (i / (series.length - 1)) * innerW : innerW / 2);
  const y = (v) => PAD.top + innerH - (v / max) * innerH;

  const line = series.map((d, i) => `${i ? 'L' : 'M'}${x(i).toFixed(1)},${y(d.visitors).toFixed(1)}`).join('');
  const area = `${line}L${x(series.length - 1).toFixed(1)},${y(0)}L${x(0).toFixed(1)},${y(0)}Z`;
  const ticks = [0, 1, 2, 3, 4].map((t) => (max / 4) * t);
  const labelIndexes = [...new Set([0, Math.floor((series.length - 1) / 2), series.length - 1])];

  const onMove = (event) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const ratio = (event.clientX - rect.left - PAD.left) / innerW;
    setHover(Math.min(series.length - 1, Math.max(0, Math.round(ratio * (series.length - 1)))));
  };

  const point = hover !== null ? series[hover] : null;

  return (
    <div className="visits-chart" ref={wrapRef}>
      <svg
        className="visits-chart__svg"
        width={width}
        height={HEIGHT}
        role="img"
        aria-label={`Visiteurs uniques par jour, du ${dateLabel(series[0].date)} au ${dateLabel(series.at(-1).date)}`}
        onMouseMove={onMove}
        onMouseLeave={() => setHover(null)}
      >
        {ticks.map((t) => (
          <g key={t}>
            <line className="visits-chart__grid" x1={PAD.left} x2={width - PAD.right} y1={y(t)} y2={y(t)} />
            <text className="visits-chart__tick" x={PAD.left - 10} y={y(t)} dy="0.32em" textAnchor="end">
              {Math.round(t)}
            </text>
          </g>
        ))}
        {labelIndexes.map((i) => (
          <text
            key={i}
            className="visits-chart__tick"
            x={x(i)}
            y={HEIGHT - 8}
            textAnchor={i === 0 ? 'start' : i === series.length - 1 ? 'end' : 'middle'}
          >
            {dateLabel(series[i].date)}
          </text>
        ))}
        <path className="visits-chart__area" d={area} />
        <path className="visits-chart__line" d={line} />
        {point && (
          <g>
            <line className="visits-chart__crosshair" x1={x(hover)} x2={x(hover)} y1={PAD.top} y2={y(0)} />
            <circle className="visits-chart__dot" cx={x(hover)} cy={y(point.visitors)} r="5" />
          </g>
        )}
      </svg>

      {point && (
        <div
          className="visits-chart__tooltip"
          style={{ left: Math.min(width - 170, Math.max(0, x(hover) - 85)), top: Math.max(0, y(point.visitors) - 86) }}
          role="status"
        >
          <span className="visits-chart__tooltip-date">{dateLabel(point.date, true)}</span>
          <span className="visits-chart__tooltip-row">
            <strong>{point.visitors}</strong> visiteur{point.visitors > 1 ? 's' : ''}
          </span>
          <span className="visits-chart__tooltip-row">
            <strong>{point.pageviews}</strong> page{point.pageviews > 1 ? 's' : ''} vue{point.pageviews > 1 ? 's' : ''}
          </span>
        </div>
      )}

      <details className="visits-chart__table">
        <summary>Voir les données</summary>
        <table>
          <thead>
            <tr>
              <th scope="col">Jour</th>
              <th scope="col">Visiteurs</th>
              <th scope="col">Pages vues</th>
            </tr>
          </thead>
          <tbody>
            {[...series].reverse().map((d) => (
              <tr key={d.date}>
                <td>{dateLabel(d.date, true)}</td>
                <td>{d.visitors}</td>
                <td>{d.pageviews}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </details>
    </div>
  );
}
