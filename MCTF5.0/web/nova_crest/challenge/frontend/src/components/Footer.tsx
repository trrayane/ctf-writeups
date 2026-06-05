import { Link } from 'react-router-dom';
import './Footer.css';

const companyLinks = [
  { label: 'About', to: '/about' },
  { label: 'Science', to: '/science' },
  { label: 'Careers', to: '/careers' },
  { label: 'Contact', to: '/contact' },
] as const;

const programLinks = ['NVC-041', 'NVC-088', 'NVC-119'] as const;

function Footer() {
  return (
    <footer className="footer">
      <div className="container footer__content">
        <div className="footer__hero">
          <div>
            <p className="footer__eyebrow">NovaCrest Biosciences</p>
            <h2 className="footer__title">
              Clinical-stage gene editing built for precision, delivery, and scale.
            </h2>
            <p className="footer__intro">
              NovaCrest combines CRISPR-Nx, vector engineering, and computational genomics to
              design therapies that address disease at its genetic origin.
            </p>
          </div>

          <div className="footer__pills" aria-label="Company highlights">
            <span>Founded 2011</span>
            <span>Zurich HQ</span>
            <span>4 Active Programs</span>
          </div>
        </div>

        <div className="footer__grid">
          <section className="footer__panel">
            <p className="footer__heading">Company</p>
            <ul className="footer__list">
              {companyLinks.map((link) => (
                <li key={link.to}>
                  <Link to={link.to}>{link.label}</Link>
                </li>
              ))}
            </ul>
          </section>

          <section className="footer__panel">
            <p className="footer__heading">Programs</p>
            <ul className="footer__list">
              {programLinks.map((program) => (
                <li key={program}>
                  <Link to="/pipeline">{program}</Link>
                </li>
              ))}
            </ul>
          </section>

          <section className="footer__panel footer__panel--contact">
            <p className="footer__heading">Contact</p>
            <div className="footer__contact">
              <p className="footer__contact-city">Zurich Innovation Park</p>
              <p>Building 7, Wagistrasse 21</p>
              <p>8952 Schlieren</p>
              <a href="mailto:info@novacrest-bio.com">info@novacrest-bio.com</a>
            </div>
          </section>
        </div>
      </div>

      <div className="container footer__bottom">
        <p>&copy; 2025 NovaCrest Biosciences. All rights reserved.</p>
      </div>
    </footer>
  );
}

export default Footer;
