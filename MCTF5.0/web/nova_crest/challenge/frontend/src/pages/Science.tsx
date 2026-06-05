import './Science.css';

function Science() {
  const pillars = [
    {
      title: 'Gene Editing',
      body:
        'Using CRISPR-Nx, we deliver precise edits to disease-causing gene sequences with an off-target rate below 0.003%.',
      extra:
        'Each target is screened against large in-house genomic models before it ever enters a wet-lab validation cycle.',
    },
    {
      title: 'Viral Vector Engineering',
      body:
        'Our AAV and lentiviral delivery systems are engineered from scratch for tissue specificity, immune evasion, and long-term expression.',
      extra:
        'We continuously redesign capsids and payload packaging so delivery performance keeps pace with the complexity of each indication.',
    },
    {
      title: 'Computational Genomics',
      body:
        "One of Europe's largest private genomic compute clusters — processing petabytes of sequencing data before a single experiment begins.",
      extra:
        'That compute backbone lets us rank targets, simulate edits, and compress discovery timelines across every active platform program.',
    },
  ];

  const steps = [
    'Target Identification',
    'Vector Design',
    'Delivery',
    'Genomic Edit',
    'Validation',
  ];

  return (
    <>
      <section className="page-hero">
        <div className="container">
          <p className="eyebrow">Platform Science</p>
          <h1 className="page-hero__title">The CRISPR-Nx Platform</h1>
          <p className="page-hero__subline">
            Traditional CRISPR systems suffer from off-target edits, immune recognition of
            bacterial-derived proteins, and poor tissue penetration. CRISPR-Nx is NovaCrest&apos;s
            answer to all three. Our platform uses a fully humanized Cas variant — engineered
            from human protein scaffolds rather than bacterial ones — combined with a lipid
            nanoparticle delivery system that crosses tissue barriers conventional AAV vectors
            cannot reach. The result is a gene editing platform with a documented off-target rate
            below 0.003% across all validated targets.
          </p>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <p className="eyebrow">Platform Pillars</p>
          <h2 className="section-title">Three systems operating as one translational stack.</h2>
          <div className="science-pillars">
            {pillars.map((pillar) => (
              <article key={pillar.title} className="page-card science-pillar">
                <h3>{pillar.title}</h3>
                <p>{pillar.body}</p>
                <p>{pillar.extra}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <p className="eyebrow">How It Works</p>
          <h2 className="section-title">A closed-loop workflow from target selection to edit validation.</h2>
          <div className="science-diagram page-card">
            {steps.map((step, index) => (
              <div key={step} className="science-diagram__step">
                <div className="science-diagram__node">{index + 1}</div>
                <p>{step}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}

export default Science;
