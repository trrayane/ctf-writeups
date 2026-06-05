import { useEffect, useState } from 'react';
import { apiRequest } from '../lib/api';
import type { JobListing } from '../types';
import './Careers.css';

function Careers() {
  const [jobs, setJobs] = useState<JobListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;

    apiRequest<{ items: Record<string, unknown>[] }>('/public/job-postings')
      .then((data) => {
        if (cancelled) return;
        setJobs(
          data.items.map((item) => ({
            id: String(item._id || item.id),
            title: String(item.title || 'Untitled role'),
            location: String(item.location || 'TBD'),
            department: String(item.department || 'General'),
            summary: String(item.summary || ''),
          })),
        );
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        setError(err instanceof Error ? err.message : 'Failed to load careers');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <>
      <section className="page-hero">
        <div className="container">
          <p className="eyebrow">Careers</p>
          <h1 className="page-hero__title">Build the systems that rewrite genetic disease.</h1>
          <p className="page-hero__subline">
            We are building the team that will rewrite genetic disease. Join 1,200 scientists,
            engineers, and clinicians across Zurich, Boston, and Singapore.
          </p>
        </div>
      </section>

      <section className="section">
        <div className="container">
          {loading ? <div className="page-card">Loading open roles...</div> : null}
          {error ? <div className="page-card">{error}</div> : null}
          {!loading && !error && jobs.length === 0 ? (
            <div className="page-card">No published job postings available.</div>
          ) : null}
          <div className="careers-list">
            {jobs.map((job) => (
              <article key={job.id} className="page-card careers-card">
                <div className="careers-card__content">
                  <h2>{job.title}</h2>
                  <div className="careers-card__meta">
                    <span>{job.location}</span>
                    <span>{job.department}</span>
                  </div>
                </div>
                <a className="button button--filled careers-card__apply" href="mailto:careers@novacrest-bio.com">
                  Apply
                </a>
              </article>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}

export default Careers;
