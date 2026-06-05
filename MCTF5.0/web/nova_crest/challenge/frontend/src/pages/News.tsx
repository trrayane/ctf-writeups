import { useEffect, useState } from 'react';
import { apiRequest } from '../lib/api';
import type { NewsItem } from '../types';
import './News.css';

function News() {
  const [items, setItems] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;

    apiRequest<{ items: Record<string, unknown>[] }>(
      '/public/articles',
      {},
      { category: 'news' },
    )
      .then((data) => {
        if (cancelled) return;
        setItems(
          data.items.map((item) => ({
            id: String(item._id || item.id),
            date: new Date(String(item.publishedAt || item.createdAt || Date.now())).toLocaleDateString(),
            headline: String(item.title || 'Untitled'),
            body: String(item.excerpt || item.body || ''),
            slug: String(item.slug || ''),
          })),
        );
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        setError(err instanceof Error ? err.message : 'Failed to load news');
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <>
      <section className="page-hero">
        <div className="container">
          <p className="eyebrow">News</p>
          <h1 className="page-hero__title">Program milestones, platform recognition, and corporate updates.</h1>
          <p className="page-hero__subline">
            A running view of how NovaCrest advances the CRISPR-Nx platform and its clinical
            portfolio across regulatory, scientific, and operational milestones.
          </p>
        </div>
      </section>

      <section className="section">
        <div className="container">
          {loading ? <div className="page-card">Loading latest news...</div> : null}
          {error ? <div className="page-card">{error}</div> : null}
          {!loading && !error && items.length === 0 ? (
            <div className="page-card">No news articles published yet.</div>
          ) : null}
          <div className="news-timeline">
            {items.map((item) => (
              <article key={item.id} className="news-item">
                <div className="news-item__date">{item.date}</div>
                <div className="page-card news-item__card">
                  <h2>{item.headline}</h2>
                  <p>{item.body}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}

export default News;
