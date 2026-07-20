import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { buildAgentBriefing, type AgentInsight, type InsightTone } from './agentBriefing';
import type { AnalyticsData, LogBucket } from './analyticsTypes';
import type { UsageData } from './types';

function fmt(n: number | null | undefined): string {
  if (n == null) return '—';
  return n.toLocaleString('es-CO');
}

function useDeckNavigation(total: number) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === 'PageDown' || e.key === ' ') {
        e.preventDefault();
        setIndex((i) => Math.min(total - 1, i + 1));
      }
      if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
        e.preventDefault();
        setIndex((i) => Math.max(0, i - 1));
      }
      if (e.key === 'Home') setIndex(0);
      if (e.key === 'End') setIndex(total - 1);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [total]);

  return {
    index,
    setIndex,
    next: () => setIndex((i) => Math.min(total - 1, i + 1)),
    prev: () => setIndex((i) => Math.max(0, i - 1)),
  };
}

function HBars({
  items,
  tone = 'cyan',
}: {
  items: LogBucket[];
  tone?: 'cyan' | 'rose' | 'amber';
}) {
  const max = items[0]?.units || 1;
  return (
    <div className="hbar-list">
      {items.map((it) => (
        <div className="hbar-row" key={it.name}>
          <span className="hbar-label" title={it.name}>
            {it.flag ? `${it.flag} ` : ''}
            {it.name}
          </span>
          <div className={`hbar-track ${tone === 'cyan' ? '' : tone}`}>
            <i style={{ width: `${Math.max(3, (it.units / max) * 100)}%` }} />
          </div>
          <span className="hbar-val">{fmt(it.units)}</span>
        </div>
      ))}
    </div>
  );
}

function Spark({ days }: { days: { day: string; units: number }[] }) {
  const max = Math.max(1, ...days.map((d) => d.units));
  const avg = days.reduce((s, d) => s + d.units, 0) / Math.max(1, days.length);
  return (
    <div className="spark" title="Units por día">
      {days.map((d) => (
        <span
          key={d.day}
          className={d.units > avg * 1.4 ? 'hot' : undefined}
          style={{ height: `${Math.max(8, (d.units / max) * 100)}%` }}
          title={`${d.day}: ${fmt(d.units)}`}
        />
      ))}
    </div>
  );
}

const TONE_LABEL: Record<InsightTone, string> = {
  calm: 'Lectura tranquila',
  watch: 'Ojo con esto',
  alert: 'Prioridad alta',
};

function AgentCard({ insight }: { insight: AgentInsight }) {
  return (
    <article className={`agent-card ${insight.tone}`}>
      <div className="agent-card-head">
        <div className="agent-avatar">AO</div>
        <div className="agent-meta">
          <span className="who">Analista Orbit</span>
          <span className="tone">{TONE_LABEL[insight.tone]}</span>
        </div>
      </div>
      <h3>{insight.title}</h3>
      <p>{insight.body}</p>
    </article>
  );
}

function insightsFor(briefing: AgentInsight[], slide: string): AgentInsight[] {
  return briefing.filter((i) => i.slide === slide);
}

export default function App() {
  const [data, setData] = useState<UsageData | null>(null);
  const [logs, setLogs] = useState<AnalyticsData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([
      fetch('/data/apis-usage.json').then((r) => {
        if (!r.ok) throw new Error(`apis-usage.json (${r.status})`);
        return r.json();
      }),
      fetch('/data/ahrefs-api-log-analytics.json').then((r) => {
        if (!r.ok) throw new Error(`ahrefs-api-log-analytics.json (${r.status})`);
        return r.json();
      }),
    ])
      .then(([usage, analytics]) => {
        setData(usage);
        setLogs(analytics);
      })
      .catch((e: Error) => setError(e.message));
  }, []);

  const slides = useMemo(() => {
    if (!data || !logs) return [] as { id: string; title: string; node: ReactNode }[];
    return buildSlides(data, logs);
  }, [data, logs]);

  const nav = useDeckNavigation(slides.length || 1);
  const current = slides[nav.index];

  if (error) return <div className="error">{error}</div>;
  if (!data || !current) return <div className="loading">Cargando datos de APIs…</div>;

  return (
    <div className="deck">
      <header className="topbar">
        <div className="brand">
          <span className="brand-mark" />
          <span>Orbit · Control de APIs</span>
        </div>
        <div>
          {nav.index + 1} / {slides.length} · {current.title}
        </div>
      </header>

      <main className="slide-shell" key={current.id}>
        {current.node}
      </main>

      <footer className="bottombar">
        <span className="hint-keys">← → espacio · Home/End</span>
        <div className="progress">
          {slides.map((s, i) => (
            <button
              key={s.id}
              className={`dot${i === nav.index ? ' on' : ''}`}
              aria-label={`Ir a ${s.title}`}
              onClick={() => nav.setIndex(i)}
            />
          ))}
        </div>
        <div className="footer-nav">
          <button className="nav-btn" onClick={nav.prev} disabled={nav.index === 0}>
            Anterior
          </button>
          <button className="nav-btn" onClick={nav.next} disabled={nav.index === slides.length - 1}>
            Siguiente
          </button>
        </div>
      </footer>
    </div>
  );
}

function buildSlides(data: UsageData, logs: AnalyticsData) {
  const report = data.trigger_case.report;
  const { compare, current: cur, previous: prev } = logs;
  const maxUserPrev = Math.max(compare.previous.accesos, compare.previous.orbit, 1);
  const briefing = buildAgentBriefing(data, logs);

  return [
    {
      id: 'title',
      title: 'Portada',
      node: (
        <section className="slide">
          <span className="kicker">20 minutos · resumen y propuesta</span>
          <h1>
            Uso responsable de <span className="neon">APIs</span>
          </h1>
          <p className="lead">
            Qué aprendimos de los datos, cómo Orbit reduce consultas repetidas y qué podemos hacer
            juntos para aprovechar mejor el presupuesto.
          </p>
          <div className="hero-meta">
            <span>
              Presenta <strong>{data.meta.presenter}</strong>
            </span>
            <span>
              Gestión <strong>{data.meta.gestion}</strong>
            </span>
            <span>
              Docs <strong>{data.meta.docs_home}</strong>
            </span>
          </div>
        </section>
      ),
    },
    {
      id: 'summary',
      title: 'Resumen de datos',
      node: (
        <section className="slide">
          <span className="kicker">01 · Lo que encontramos</span>
          <h2>
            Resumen <span className="neon">breve</span>
          </h2>
          <div className="grid-2">
            <div className="stack">
              <div className="panel stat">
                <span className="label">Semrush · incidente</span>
                <span className="value neon-rose">
                  {fmt(report?.balance_start)} → 0
                </span>
                <span className="hint">Tres días · gran parte sin trazabilidad interna</span>
              </div>
              <div className="panel stat">
                <span className="label">Ahrefs · mes anterior</span>
                <span className="value">{fmt(compare.previous.units)}</span>
                <span className="hint">
                  {fmt(compare.previous.per_day)} unidades por día
                </span>
              </div>
              <div className="panel stat">
                <span className="label">Ahrefs · ciclo actual</span>
                <span className="value neon">{fmt(compare.current.units)}</span>
                <span className="hint">
                  {compare.current.days} días · {fmt(compare.current.per_day)} por día
                </span>
              </div>
            </div>
            <div className="stack" style={{ gap: '1rem' }}>
              {insightsFor(briefing, 'summary').map((i) => (
                <AgentCard key={i.id} insight={i} />
              ))}
            </div>
          </div>
        </section>
      ),
    },
    {
      id: 'data',
      title: 'Lectura del consumo',
      node: (
        <section className="slide">
          <span className="kicker">02 · Comparativo</span>
          <h2>
            Dos tipos de <span className="neon">consumo</span>
          </h2>
          <div className="grid-2">
            <div className="panel stack">
              <h3>Mes anterior · {prev.period.label}</h3>
              <div className="big-number" style={{ fontSize: '2.5rem' }}>
                {fmt(compare.previous.units)}
              </div>
              <div className="hbar-list">
                <div className="hbar-row">
                  <span className="hbar-label">Consultas desde asistentes</span>
                  <div className="hbar-track amber">
                    <i
                      style={{
                        width: `${(compare.previous.accesos / maxUserPrev) * 100}%`,
                      }}
                    />
                  </div>
                  <span className="hbar-val">{fmt(compare.previous.accesos)}</span>
                </div>
                <div className="hbar-row">
                  <span className="hbar-label">Módulos de Orbit</span>
                  <div className="hbar-track">
                    <i
                      style={{
                        width: `${(compare.previous.orbit / maxUserPrev) * 100}%`,
                      }}
                    />
                  </div>
                  <span className="hbar-val">{fmt(compare.previous.orbit)}</span>
                </div>
              </div>
              <Spark days={prev.by_day} />
              <p className="lead" style={{ fontSize: '0.9rem' }}>
                Las consultas de asistentes fueron el componente más grande; Orbit también realizó
                descargas para preparar módulos y datos reutilizables.
              </p>
            </div>
            <div className="panel stack">
              <h3>Ciclo actual · {cur.period.label}</h3>
              <div className="big-number neon" style={{ fontSize: '2.5rem' }}>
                {fmt(compare.current.units)}
              </div>
              <HBars
                items={[
                  { name: 'Módulos de Orbit', units: compare.current.orbit, calls: 0 },
                  { name: 'Consultas desde asistentes', units: compare.current.accesos, calls: 0 },
                ]}
              />
              <Spark days={cur.by_day} />
              <p className="lead" style={{ fontSize: '0.9rem' }}>
                El ritmo bajó, pero todavía conviene coordinar qué se consulta y qué se almacena
                para no pagar varias veces por la misma información.
              </p>
            </div>
          </div>
        </section>
      ),
    },
    {
      id: 'orbit',
      title: 'Cómo trabaja Orbit',
      node: (
        <section className="slide">
          <span className="kicker">03 · Reutilización</span>
          <h2>
            Orbit: descargar, guardar y <span className="neon">reutilizar</span>
          </h2>
          <div className="grid-2">
            <div className="stack" style={{ gap: '1rem' }}>
              {insightsFor(briefing, 'orbit').map((i) => (
                <AgentCard key={i.id} insight={i} />
              ))}
            </div>
            <div className="panel stack">
              <h3>Ciclo de bajo costo</h3>
              <ul className="list" style={{ gap: '1rem' }}>
                {[
                  ['01', 'Se incorpora un módulo o una nueva necesidad'],
                  ['02', 'Se descargan los datos necesarios una primera vez'],
                  ['03', 'La información se guarda en Supabase'],
                  ['04', 'El equipo consulta Orbit sin repetir la descarga'],
                  ['05', 'Solo se actualiza cuando el dato realmente cambia'],
                ].map(([n, text]) => (
                  <li key={n}>
                    <span className="n">{n}</span>
                    <span>{text}</span>
                  </li>
                ))}
              </ul>
              <div className="alert">
                El costo puede subir durante una nueva incorporación. Después, el almacenamiento y
                la reutilización ayudan a mantenerlo bajo.
              </div>
            </div>
          </div>
        </section>
      ),
    },
    {
      id: 'recommendations',
      title: 'Recomendaciones',
      node: (
        <section className="slide">
          <span className="kicker">04 · Opciones para el equipo</span>
          <h2>
            Mejorar <span className="neon">trabajando juntos</span>
          </h2>
          <div className="grid-2">
            <div className="stack" style={{ gap: '1rem' }}>
              {insightsFor(briefing, 'recommendations').map((i) => (
                <AgentCard key={i.id} insight={i} />
              ))}
            </div>
            <div className="panel stack">
              <h3>Acuerdos propuestos</h3>
              <ul className="list" style={{ gap: '0.9rem' }}>
                {[
                  'Antes de buscar, revisar si Orbit ya tiene el dato.',
                  'Si falta información, pedirla para almacenarla y compartirla.',
                  'Hacer consultas pequeñas y específicas desde los asistentes.',
                  'Definir límites preventivos por conexión, sin bloquear el trabajo.',
                  'Revisar semanalmente el consumo y aprender de los picos.',
                  'Documentar excepciones o descargas grandes antes de ejecutarlas.',
                ].map((text, i) => (
                  <li key={text}>
                    <span className="n">{String(i + 1).padStart(2, '0')}</span>
                    <span>{text}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>
      ),
    },
    {
      id: 'plan',
      title: 'Plan conjunto',
      node: (
        <section className="slide">
          <span className="kicker">05 · Próximos pasos</span>
          <h2>
            Una propuesta <span className="neon-lime">simple</span>
          </h2>
          <div className="agent-inline" style={{ marginBottom: '1rem' }}>
            {insightsFor(briefing, 'plan').map((i) => (
              <AgentCard key={i.id} insight={i} />
            ))}
          </div>
          <div className="grid-3">
            {[
              {
                t: 'Esta semana',
                d: 'Inventariar conexiones, activar alertas y acordar límites preventivos.',
              },
              {
                t: 'En cada necesidad nueva',
                d: 'Revisar qué existe y decidir juntos qué conviene guardar en Orbit.',
              },
              {
                t: 'Cada viernes',
                d: 'Revisión breve del consumo: qué funcionó, qué se repitió y qué podemos almacenar.',
              },
            ].map((item) => (
              <div className="panel stack" key={item.t}>
                <h3>{item.t}</h3>
                <p className="lead" style={{ fontSize: '1rem' }}>
                  {item.d}
                </p>
              </div>
            ))}
          </div>
        </section>
      ),
    },
    {
      id: 'close',
      title: 'Cierre',
      node: (
        <section className="slide">
          <span className="kicker">06 · Cierre</span>
          <h1>
            Descargar una vez. <span className="neon">Aprovechar entre todos.</span>
          </h1>
          <div style={{ maxWidth: '42rem', marginTop: '0.5rem' }}>
            {insightsFor(briefing, 'close').map((i) => (
                <AgentCard key={i.id} insight={i} />
            ))}
          </div>
          <div className="hero-meta">
            <span>
              Preguntas → <strong>{data.meta.presenter}</strong>
            </span>
            <span>
              Gestión → <strong>{data.meta.gestion}</strong>
            </span>
            <span>
              Docs → <strong>{data.meta.docs_home}</strong>
            </span>
          </div>
        </section>
      ),
    },
  ];
}
