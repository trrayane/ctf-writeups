import type { OfficeLocation } from '../types';
import './Contact.css';

function Contact() {
  const offices: OfficeLocation[] = [
    {
      city: 'Zurich HQ',
      address: ['Zurich Innovation Park, Building 7', 'Wagistrasse 21', '8952 Schlieren'],
    },
    {
      city: 'Boston',
      address: ['200 Cambridge Street', 'Suite 400', 'Boston MA 02114'],
    },
    {
      city: 'Singapore',
      address: ['Biopolis Street 11', 'Helios Building', 'Singapore 138667'],
    },
  ];

  return (
    <>
      <section className="page-hero">
        <div className="container">
          <p className="eyebrow">Contact</p>
          <h1 className="page-hero__title">Reach NovaCrest teams across research, clinical, and platform operations.</h1>
          <p className="page-hero__subline">
            General inquiries and platform conversations are handled directly by the teams closest
            to the work. Email is the preferred channel for all external contact.
          </p>
        </div>
      </section>

      <section className="section">
        <div className="container contact-grid">
          <div className="page-card contact-channel">
            <p className="eyebrow">Email</p>
            <div className="contact-channel__links">
              <div>
                <h2>General Contact</h2>
                <a href="mailto:info@novacrest-bio.com">info@novacrest-bio.com</a>
              </div>
              <div>
                <h2>Platform Engineering</h2>
                <a href="mailto:platform-eng@novacrest-bio.com">platform-eng@novacrest-bio.com</a>
              </div>
            </div>
          </div>

          <div className="contact-offices">
            {offices.map((office) => (
              <article key={office.city} className="page-card contact-office">
                <h2>{office.city}</h2>
                <div className="contact-office__address">
                  {office.address.map((line) => (
                    <p key={line}>{line}</p>
                  ))}
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}

export default Contact;
