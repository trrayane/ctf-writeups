import { useEffect, useState } from 'react';
import { apiRequest } from '../lib/api';
import type { PipelineProgram } from '../types';
import './Pipeline.css';

function Pipeline() {
  const [programs, setPrograms] = useState<PipelineProgram[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const stages: PipelineProgram['stage'][] = [
    'Preclinical',
    'Phase I',
    'Phase II',
    'Phase III',
    'FDA Review',
  ];

  useEffect(() => {
    let cancelled = false;

    apiRequest<{ items: Record<string, unknown>[] }>('/public/pipeline-programs')
      .then((data) => {
        if (cancelled) return;

        setPrograms(
          data.items.map((item) => ({
            id: String(item._id || item.id),
            compound: String(item.compound || 'Unknown'),
            condition: String(item.condition || 'Unknown'),
            modality: String(item.modality || 'Unknown'),
            stage: (item.stage as PipelineProgram['stage']) || 'Preclinical',
            highlight: Boolean(item.highlight),
          })),
        );
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        setError(err instanceof Error ? err.message : 'Failed to load pipeline programs');
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
          <p className="eyebrow">Clinical Pipeline</p>
          <h1 className="page-hero__title">Programs moving across the development continuum.</h1>
          <p className="page-hero__subline">
            NovaCrest prioritizes genetically defined diseases where editing precision, delivery
            control, and translational speed can materially change patient outcomes.
          </p>
        </div>
      </section>

      <section className="section">
        <div className="container">
          {loading ? <div className="page-card">Loading clinical pipeline...</div> : null}
          {error ? <div className="page-card">{error}</div> : null}
          {!loading && !error && programs.length === 0 ? (
            <div className="page-card">No published pipeline programs available.</div>
          ) : null}
          <div className="pipeline-table">
            <div className="pipeline-table__inner">
              <div className="pipeline-table__header">
                <span>Compound</span>
                <span>Condition</span>
                <span>Modality</span>
                {stages.map((stage) => (
                  <span key={stage}>{stage}</span>
                ))}
              </div>

              {programs.map((program) => {
                const stageIndex = stages.indexOf(program.stage);

                return (
                  <article
                    key={program.id}
                    id={program.id}
                    className={`pipeline-row page-card${program.highlight ? ' pipeline-row--highlight' : ''}`}
                  >
                    <div className="pipeline-row__compound">
                      <div className="pipeline-row__compound-top">
                        <h2>{program.compound}</h2>
                        {program.highlight ? (
                          <span className="pipeline-row__badge">FDA Review Pending</span>
                        ) : null}
                      </div>
                      <p>Current stage: {program.stage}</p>
                    </div>
                    <div className="pipeline-row__condition">{program.condition}</div>
                    <div className="pipeline-row__modality">{program.modality}</div>
                    {stages.map((stage, index) => {
                      let state = 'pipeline-stage';

                      if (stage === 'FDA Review' && program.highlight) {
                        state += ' pipeline-stage--pending';
                      } else if (index < stageIndex) {
                        state += ' pipeline-stage--complete';
                      } else if (stage === program.stage) {
                        state += ' pipeline-stage--current';
                      }

                      return (
                        <div key={stage} className={state}>
                          <span>{stage}</span>
                        </div>
                      );
                    })}
                  </article>
                );
              })}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

export default Pipeline;
