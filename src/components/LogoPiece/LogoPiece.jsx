/** Une pièce du logo officiel, dessinée dans sa propre boîte (voir thpLetters.js). */
export default function LogoPiece({ piece, className = '' }) {
  const { box, d, fill } = piece;
  return (
    <svg
      className={className}
      viewBox={`${box.x} ${box.y} ${box.width} ${box.height}`}
      preserveAspectRatio="none"
      aria-hidden="true"
      focusable="false"
    >
      <path d={d} fill={fill} />
    </svg>
  );
}
