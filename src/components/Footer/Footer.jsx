import { CONTACT } from '../../data/site';
import './Footer.css';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer__inner container">
        <p className="footer__signature">
          {CONTACT.name} — {CONTACT.role}
        </p>
        <p className="footer__copyright label">THP Development © {new Date().getFullYear()}</p>
      </div>
    </footer>
  );
}
