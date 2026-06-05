import { Link } from 'react-router-dom';
import type { PipelineProgram } from '../types';
import './Home.css';

function HelixIcon() {
  return (
    <svg viewBox="0 0 64 64" aria-hidden="true">
      <path
        d="M16 8C28 16 36 24 48 32C36 40 28 48 16 56"
        fill="none"
        stroke="currentColor"
        strokeWidth="4"
        strokeLinecap="round"
      />
      <path
        d="M48 8C36 16 28 24 16 32C28 40 36 48 48 56"
        fill="none"
        stroke="currentColor"
        strokeWidth="4"
        strokeLinecap="round"
      />
      <path d="M22 20H42M22 32H42M22 44H42" fill="none" stroke="currentColor" strokeWidth="4" />
    </svg>
  );
}

function VectorIcon() {
  return (
    <svg viewBox="0 0 64 64" aria-hidden="true">
      <rect x="10" y="18" width="44" height="28" rx="14" fill="none" stroke="currentColor" strokeWidth="4" />
      <path d="M20 32H44" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
      <path d="M32 12V52" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
      <circle cx="18" cy="18" r="4" fill="currentColor" />
      <circle cx="46" cy="46" r="4" fill="currentColor" />
    </svg>
  );
}

function ChipIcon() {
  return (
    <svg viewBox="0 0 64 64" aria-hidden="true">
      <rect x="18" y="18" width="28" height="28" rx="6" fill="none" stroke="currentColor" strokeWidth="4" />
      <path d="M26 26H38V38H26z" fill="none" stroke="currentColor" strokeWidth="4" />
      <path
        d="M8 24H18M8 40H18M46 24H56M46 40H56M24 8V18M40 8V18M24 46V56M40 46V56"
        fill="none"
        stroke="currentColor"
        strokeWidth="4"
        strokeLinecap="round"
      />
    </svg>
  );
}

function Home() {
  const capabilities = [
    {
      title: 'Gene Editing',
      body:
        'Using CRISPR-Nx, we deliver precise edits to disease-causing gene sequences with an off-target rate below 0.003%.',
      icon: <HelixIcon />,
    },
    {
      title: 'Viral Vector Engineering',
      body:
        'Our AAV and lentiviral delivery systems are engineered from scratch for tissue specificity, immune evasion, and long-term expression.',
      icon: <VectorIcon />,
    },
    {
      title: 'Computational Genomics',
      body:
        "One of Europe's largest private genomic compute clusters — processing petabytes of sequencing data before a single experiment begins.",
      icon: <ChipIcon />,
    },
  ];

  const teaserPrograms: PipelineProgram[] = [
    {
      id: 'nvc-119',
      compound: 'NVC-119',
      condition: 'Acute Myeloid Leukemia (refractory)',
      modality: 'CRISPR-Nx somatic editing',
      stage: 'Phase III',
      highlight: true,
    },
    {
      id: 'nvc-041',
      compound: 'NVC-041',
      condition: 'Duchenne Muscular Dystrophy',
      modality: 'Exon skipping / AAV9',
      stage: 'Phase II',
      highlight: false,
    },
    {
      id: 'nvc-088',
      compound: 'NVC-088',
      condition: 'Hereditary Transthyretin Amyloidosis',
      modality: 'siRNA silencing',
      stage: 'Phase II',
      highlight: false,
    },
  ];

  return (
    <>
      <section className="home-hero">
        <div className="home-hero__grid" aria-hidden="true" />
        <div className="home-hero__particles" aria-hidden="true" />
        <div className="container home-hero__layout">
          <div className="home-hero__content">
            <p className="eyebrow">Clinical-Stage Gene Editing</p>
            <h1 className="home-hero__title">Rewriting the code of disease.</h1>
            <p className="home-hero__subtitle">
              NovaCrest Biosciences develops next-generation gene therapies that target the
              genetic origin of disease — not just the symptoms.
            </p>
            <div className="button-row">
              <Link className="button button--filled" to="/pipeline">
                View Pipeline
              </Link>
              <Link className="button button--outline" to="/science">
                Our Science
              </Link>
            </div>
          </div>

          <div className="home-hero__visual" aria-hidden="true">
            <div className="home-hero__signal">
              <span>CRISPR-Nx</span>
              <span>Target specificity below 0.003%</span>
            </div>
            <svg className="home-hero__helix" viewBox="0 0 320 480" role="presentation">
              <path
                d="M96 24C176 72 200 120 224 168C248 216 272 264 224 312C176 360 128 408 96 456"
                fill="none"
                stroke="rgba(0, 230, 118, 0.32)"
                strokeWidth="8"
                strokeLinecap="round"
              />
              <path
                d="M224 24C144 72 120 120 96 168C72 216 48 264 96 312C144 360 192 408 224 456"
                fill="none"
                stroke="rgba(232, 245, 233, 0.24)"
                strokeWidth="8"
                strokeLinecap="round"
              />
              <path
                d="M128 88H192M120 168H200M120 248H200M128 328H192M136 408H184"
                fill="none"
                stroke="rgba(232, 245, 233, 0.44)"
                strokeWidth="6"
                strokeLinecap="round"
              />
              <circle cx="160" cy="168" r="16" fill="rgba(0, 230, 118, 0.18)" />
              <circle cx="160" cy="328" r="16" fill="rgba(0, 230, 118, 0.14)" />
            </svg>
          </div>
        </div>
      </section>

      <section className="section home-stats">
        <div className="container">
          <div className="home-stats__bar">
            <div className="home-stats__item">1,200+ Scientists &amp; Engineers</div>
            <div className="home-stats__item">4 Active Therapy Programs</div>
            <div className="home-stats__item">Founded 2011 · Zurich</div>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <p className="eyebrow">What We Do</p>
          <h2 className="section-title">A translational engine built from code, biology, and scale.</h2>
          <div className="home-capabilities">
            {capabilities.map((capability) => (
              <article key={capability.title} className="page-card home-capability">
                <div className="home-capability__icon">{capability.icon}</div>
                <h3>{capability.title}</h3>
                <p>{capability.body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="home-pipeline__header">
            <div>
              <p className="eyebrow">Our Pipeline</p>
              <h2 className="section-title">Programs advancing from genomic insight to regulatory review.</h2>
            </div>
            <Link className="button button--outline" to="/pipeline">
              View Full Pipeline
            </Link>
          </div>

          <div className="home-pipeline">
            <article className="page-card home-pipeline__featured">
              <p className="home-pipeline__status">Phase III — FDA Review</p>
              <h3>{teaserPrograms[0].compound}</h3>
              <p className="home-pipeline__condition">{teaserPrograms[0].condition}</p>
              <p className="home-pipeline__modality">{teaserPrograms[0].modality}</p>
              <p className="home-pipeline__copy">
                The lead hematology program for refractory AML now advances through late-stage
                review with multi-site enrollment complete and submission packages underway.
              </p>
            </article>

            <div className="home-pipeline__list">
              {teaserPrograms.slice(1).map((program) => (
                <article key={program.id} className="page-card home-pipeline__card">
                  <p className="home-pipeline__stage">{program.stage}</p>
                  <h3>{program.compound}</h3>
                  <p className="home-pipeline__condition">{program.condition}</p>
                  <p className="home-pipeline__modality">{program.modality}</p>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="home-cta page-card">
            <div>
              <p className="eyebrow">People Behind The Platform</p>
              <h2 className="home-cta__title">
                The genetic code of disease can be rewritten. We are doing it.
              </h2>
            </div>
            <Link className="button button--filled" to="/team">
              Meet the Team
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}

export default Home;
