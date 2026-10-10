import logoUrl from '../../assets/logos/thp-logo.svg';
import './Logo.css';

/** Logo officiel THP (fichier vectoriel exporté du Figma, non redessiné). */
export default function Logo({ className = '', decorative = false }) {
  return (
    <img
      className={`logo ${className}`.trim()}
      src={logoUrl}
      width="1090"
      height="414"
      alt={decorative ? '' : 'THP'}
      decoding="async"
    />
  );
}
