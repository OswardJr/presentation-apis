import { PRESENTER_GUIDES, PRESENTER_NOTES_PATH } from './presenterGuides';

export default function PresenterNotes() {
  return (
    <div className="notes-page">
      <header className="notes-hero">
        <span className="kicker">Privado · solo expositor</span>
        <h1>
          Apoyo de <span className="neon">exposición</span>
        </h1>
        <p className="lead">
          Notas, tips y fuentes por pantalla. Úsalo en una segunda ventana o en el móvil mientras
          proyectas la deck pública.
        </p>
        <p className="notes-path mono">
          URL: <code>{PRESENTER_NOTES_PATH}</code>
        </p>
      </header>

      <div className="notes-grid">
        {PRESENTER_GUIDES.map((guide, index) => (
          <article className="notes-card" key={guide.id}>
            <div className="notes-card-top">
              <span className="mono neon">
                {String(index + 1).padStart(2, '0')}
              </span>
              <h2>{guide.title}</h2>
            </div>

            <section>
              <span>Qué decir</span>
              <p>{guide.say}</p>
            </section>

            <section>
              <span>Tip</span>
              <p>{guide.tip}</p>
            </section>

            {guide.links.length > 0 && (
              <section>
                <span>Fuentes</span>
                <div className="presenter-links">
                  {guide.links.map((link) => (
                    <a href={link.url} target="_blank" rel="noreferrer" key={link.url}>
                      {link.label} ↗
                    </a>
                  ))}
                </div>
              </section>
            )}
          </article>
        ))}
      </div>
    </div>
  );
}
