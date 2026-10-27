/**
 * Une école illustrée par formation (SVG 240 × 160). Chaque élément porte une classe
 * que educationAnimations.js anime au passage du curseur ; sans animation, la scène
 * est affichée terminée. Les tracés `pathLength="1"` se dessinent au défilement.
 */

const Ground = () => <path className="school__ground school__draw" pathLength="1" d="M12 148H228" />;

/* Lycée : fronton, colonnes, horloge et drapeau ; équerre et arc pour les arts appliqués */
const SaintMartin = () => (
  <>
    <Ground />
    <rect className="school__step school__line school__soft" x="58" y="138" width="124" height="10" />
    <rect className="school__step school__line school__soft" x="66" y="130" width="108" height="8" />
    {[76, 100, 130, 154].map((x) => (
      <rect key={x} className="school__column school__line" x={x} y="88" width="10" height="42" />
    ))}
    <path className="school__door school__line school__draw" pathLength="1" d="M112 130V114a8 8 0 0 1 16 0V130" />
    <rect className="school__beam school__line school__fill" x="64" y="80" width="112" height="8" />
    <path className="school__pediment school__line school__draw school__soft" pathLength="1" d="M60 80L120 48L180 80Z" />
    <circle className="school__clock school__line school__fill" cx="120" cy="66" r="8" />
    <path className="school__hands school__line" d="M120 66V61M120 66h4" />
    <path className="school__pole school__line school__draw" pathLength="1" d="M120 48V18" />
    <path className="school__flag school__fill" d="M121 18h20l-5 6 5 6h-20Z" />
    <path className="school__square school__line school__draw" pathLength="1" d="M192 148V114L224 148Z" />
    <path className="school__arc school__accent-line school__draw" pathLength="1" d="M18 148a22 22 0 0 1 44 0" />
  </>
);

/* École d'art : atelier à toit en sheds, chevalet, coups de pinceau et nuancier */
const Lisaa = () => (
  <>
    <Ground />
    <rect className="school__body school__line school__draw" pathLength="1" x="30" y="80" width="120" height="68" />
    <path className="school__roof school__line school__draw" pathLength="1" d="M30 80V60L60 80V60L90 80V60L120 80V60L150 80" />
    {[42, 76, 110].map((x) => (
      <rect key={x} className="school__pane school__line school__soft" x={x} y="94" width="28" height="30" />
    ))}
    <rect className="school__pane school__line school__dark" x="80" y="130" width="20" height="18" />
    <path className="school__leg school__line school__draw" pathLength="1" d="M194 90L178 148" />
    <path className="school__leg school__line school__draw" pathLength="1" d="M194 90L210 148" />
    <path className="school__leg school__line school__draw" pathLength="1" d="M194 90V148" />
    <rect className="school__canvas school__line school__dark" x="166" y="82" width="56" height="42" />
    <path className="school__paint school__paint--lavender school__draw" pathLength="1" d="M174 112c8-14 14 4 22-8s12-6 18-14" />
    <path className="school__paint school__paint--coral school__draw" pathLength="1" d="M176 96c10 4 18-6 28 0" />
    <path className="school__paint school__paint--cream school__draw" pathLength="1" d="M200 116c4-4 8-4 14-2" />
    {[
      ['lavender', 46],
      ['coral', 64],
      ['cream', 82],
    ].map(([color, x], i) => (
      <circle key={color} className={`school__swatch school__swatch--${color}`} cx={x} cy={36 - (i % 2) * 6} r="6" />
    ))}
  </>
);

/* Webdesign et développement en alternance : façade vitrée, navette école ⇄ entreprise */
const Hetic = () => (
  <>
    <Ground />
    <rect className="school__body school__line school__draw" pathLength="1" x="24" y="52" width="96" height="96" />
    {[0, 1, 2, 3].flatMap((row) =>
      [0, 1, 2, 3].map((col) => (
        <rect key={`${row}-${col}`} className="school__window school__fill" x={34 + col * 21} y={62 + row * 18} width="13" height="10" rx="1" />
      )),
    )}
    <rect className="school__line school__dark" x="62" y="134" width="20" height="14" />
    <rect className="school__office school__line school__draw" pathLength="1" x="164" y="96" width="52" height="52" />
    {[
      [172, 104],
      [196, 104],
      [172, 122],
      [196, 122],
    ].map(([x, y]) => (
      <rect key={`${x}-${y}`} className="school__office-window school__line school__soft" x={x} y={y} width="12" height="10" />
    ))}
    <path className="school__bridge school__draw" pathLength="1" d="M124 118H160" />
    <circle className="school__commuter school__fill" cx="126" cy="118" r="4" />
    <text className="school__text" x="72" y="44" textAnchor="middle">École</text>
    <text className="school__text" x="190" y="88" textAnchor="middle">Entreprise</text>
    <g className="school__browser">
      <rect className="school__line school__dark" x="158" y="40" width="64" height="38" rx="4" />
      <path className="school__line" d="M158 50H222" />
      <rect className="school__browser-block school__fill" x="164" y="56" width="30" height="6" rx="1" />
      <rect className="school__browser-block school__soft-solid" x="164" y="66" width="52" height="6" rx="1" />
    </g>
  </>
);

/* Informatique : tour-terminal, lignes de code, voyants, puis le chapeau du master */
const Etna = () => (
  <>
    <Ground />
    <rect className="school__body school__line school__draw" pathLength="1" x="70" y="58" width="100" height="90" rx="6" />
    <rect className="school__screen school__line school__dark" x="80" y="68" width="80" height="44" rx="3" />
    {[
      [86, 30, 'fill'],
      [92, 44, 'cream'],
      [92, 26, 'fill'],
      [86, 18, 'cream'],
    ].map(([x, width, tone], i) => (
      <rect key={i} className={`school__code school__${tone === 'fill' ? 'fill' : 'cream'}`} x={x} y={75 + i * 8} width={width} height="4" rx="1" />
    ))}
    <rect className="school__caret school__fill" x="108" y="99" width="5" height="6" />
    {[0, 1].flatMap((row) =>
      [0, 1, 2, 3, 4].map((col) => (
        <circle key={`${row}-${col}`} className="school__led school__fill" cx={92 + col * 14} cy={124 + row * 12} r="2.5" />
      )),
    )}
    <text className="school__brace" x="36" y="116" textAnchor="middle">{'{'}</text>
    <text className="school__brace school__brace--end" x="204" y="116" textAnchor="middle">{'}'}</text>
    <g className="school__cap">
      <path className="school__line school__fill" d="M90 46L120 34L150 46L120 58Z" />
      <path className="school__line school__dark" d="M104 52V60Q120 66 136 60V52" />
      <path className="school__line" d="M150 46V58" />
      <circle className="school__fill" cx="150" cy="60" r="2.5" />
    </g>
  </>
);

const SCENES = {
  'saint-martin': SaintMartin,
  lisaa: Lisaa,
  hetic: Hetic,
  etna: Etna,
};

export default function EducationScene({ id }) {
  const Scene = SCENES[id];
  if (!Scene) return null;
  return (
    <svg className="education__scene" data-scene-id={id} viewBox="0 0 240 160" aria-hidden="true" focusable="false">
      <Scene />
    </svg>
  );
}
