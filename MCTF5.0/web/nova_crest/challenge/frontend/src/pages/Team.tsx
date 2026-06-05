import type { TeamMember } from '../types';
import './Team.css';

function Team() {
  const members: TeamMember[] = [
    {
      id: 'brauer',
      name: 'Dr. Henrik Brauer',
      title: 'Co-Founder & Chief Scientific Officer',
      initials: 'HB',
      bio: "A molecular biologist by training, Henrik co-founded NovaCrest after 12 years at ETH Zurich's Institute for Molecular Systems Biology. He has authored over 60 peer-reviewed publications in gene regulation and CRISPR delivery mechanisms.",
    },
    {
      id: 'yip',
      name: 'Sandra Yip',
      title: 'Chief Executive Officer',
      initials: 'SY',
      bio: 'Sandra joined NovaCrest in 2019 bringing 15 years of experience in life sciences strategy and corporate development. Previously Managing Director at Meridian Capital Health Ventures.',
    },
    {
      id: 'karimi',
      name: 'Dr. Reza Karimi',
      title: 'Chief Medical Officer',
      initials: 'RK',
      bio: "Dr. Karimi leads NovaCrest's clinical development and regulatory strategy. He oversees all IND applications, FDA interactions, and patient safety protocols across active programs. Joined 2023.",
    },
    {
      id: 'williams',
      name: 'Marcus Williams',
      title: 'VP of Engineering',
      initials: 'MW',
      bio: 'Marcus leads the internal platform and infrastructure engineering team. His team builds and maintains the software backbone that connects lab, clinic, and compliance across all NovaCrest programs.',
    },
  ];

  return (
    <>
      <section className="page-hero">
        <div className="container">
          <p className="eyebrow">Leadership</p>
          <h1 className="page-hero__title">Scientific, clinical, and engineering leadership in one team.</h1>
          <p className="page-hero__subline">
            NovaCrest is led by operators who have built gene-editing science, navigated
            regulatory review, and scaled the infrastructure required to connect platform and
            clinic.
          </p>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="team-grid">
            {members.map((member) => (
              <article key={member.id} className="page-card team-card">
                <div className="team-card__avatar">{member.initials}</div>
                <h2>{member.name}</h2>
                <p className="team-card__title">{member.title}</p>
                <p className="team-card__bio">{member.bio}</p>
              </article>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}

export default Team;
