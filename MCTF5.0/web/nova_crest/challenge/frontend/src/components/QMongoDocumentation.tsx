import ReactMarkdown from 'react-markdown';
import qmongoDocumentation from '../content/qmongo-documentation.md?raw';

export function QMongoDocumentation() {
  return (
    <section className="qmongo-docs panel">
      <div className="panel__header">
        <h2>QMongo Documentation</h2>
        <p className="muted">Reference guide for syntax, statements, expressions, and practical query patterns.</p>
      </div>
      <article className="qmongo-docs__content">
        <ReactMarkdown>{qmongoDocumentation}</ReactMarkdown>
      </article>
    </section>
  );
}
