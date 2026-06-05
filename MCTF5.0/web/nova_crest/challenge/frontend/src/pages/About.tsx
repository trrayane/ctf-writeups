import type { OfficeLocation } from '../types';
import './About.css';

function About() {
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

  const values = [
    {
      title: 'Precision',
      body: 'We operate at the level of individual base pairs.',
    },
    {
      title: 'Transparency',
      body: 'Every trial, every outcome, every data point.',
    },
    {
      title: 'Patient First',
      body: 'Therapies that matter to the people who need them most.',
    },
  ];

  return (
    <>
      <section className="page-hero">
        <div className="container">
          <p className="eyebrow">Company</p>
          <h1 className="page-hero__title">About NovaCrest</h1>
          <p className="page-hero__subline">
            Built in Zurich and operating globally, NovaCrest pairs genome engineering with
            clinical discipline to move from molecular insight to patient impact.
          </p>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="page-card about-story">
            <p>
              Founded in 2011 in Zurich, Switzerland, NovaCrest Biosciences is a clinical-stage
              gene therapy company with a singular mission: to eliminate hereditary and genetic
              disease at the source. We combine advances in CRISPR-based editing, viral vector
              delivery, and computational genomics to design therapies that work at the level of
              the genome itself. Our platform is built on the belief that every disease has a
              genetic fingerprint — and that fingerprint can be changed. We are not a traditional
              pharmaceutical company. We do not treat symptoms. We rewrite causes.
            </p>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <p className="eyebrow">Global Footprint</p>
          <h2 className="section-title">A clinical and computational presence across three hubs.</h2>
          <div className="about-offices">
            {offices.map((office) => (
              <article key={office.city} className="page-card about-office">
                <h3>{office.city}</h3>
                <div className="about-office__address">
                  {office.address.map((line) => (
                    <p key={line}>{line}</p>
                  ))}
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <p className="eyebrow">Values</p>
          <h2 className="section-title">Operating principles for every platform, program, and trial.</h2>
          <div className="about-values">
            {values.map((value) => (
              <article key={value.title} className="page-card about-value">
                <h3>{value.title}</h3>
                <p>{value.body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}

export default About;
