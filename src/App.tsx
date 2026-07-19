import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { buildAgentBriefing, type AgentInsight, type InsightTone } from './agentBriefing';
import type { AnalyticsData, LogBucket } from './analyticsTypes';
import type { ApiBlock, UsageData } from './types';

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

  const ahrefs = useMemo(
    () => data?.apis.find((a) => a.id === 'ahrefs') ?? null,
    [data],
  );

  const slides = useMemo(() => {
    if (!data || !ahrefs || !logs) return [] as { id: string; title: string; node: ReactNode }[];
    return buildSlides(data, ahrefs, logs);
  }, [data, ahrefs, logs]);

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

function buildSlides(data: UsageData, _ahrefs: ApiBlock, logs: AnalyticsData) {
  const mcp = data.mcp_policy;
  const report = data.trigger_case.report;
  const { compare, current: cur, previous: prev } = logs;
  const maxUserPrev = Math.max(compare.previous.accesos, compare.previous.orbit, 1);
  const briefing = buildAgentBriefing(data, logs);
  const boardInsights = briefing.filter((i) =>
    ['prev-month', 'orbit-vs-mcp', 'openai-burn', 'what-to-do'].includes(i.id),
  );

  return [
    {
      id: 'title',
      title: 'Portada',
      node: (
        <section className="slide">
          <span className="kicker">Exposición · con Analista Orbit</span>
          <h1>
            El gasto ya tiene <span className="neon-rose">nombre</span>
          </h1>
          <p className="lead">
            Semrush nos despertó. Ahrefs nos mostró el detalle. Hoy separamos lo que se evapora en
            chats de lo que Orbit guarda para reutilizar.
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
      id: 'agent',
      title: 'Analista',
      node: (
        <section className="slide">
          <span className="kicker">Agente · lectura humanizada</span>
          <h2>
            Lo que importa, <span className="neon">en claro</span>
          </h2>
          <div className="agent-board">
            {boardInsights.map((insight) => (
              <AgentCard key={insight.id} insight={insight} />
            ))}
          </div>
        </section>
      ),
    },
    {
      id: 'semrush',
      title: 'Caso Semrush',
      node: (
        <section className="slide">
          <span className="kicker">Detonante · 13 jul 2026</span>
          <h2>
            <span className="neon-rose">{fmt(report?.balance_start)}</span>
            {' → 0'}
          </h2>
          <div className="grid-2">
            <div className="stack">
              <div className="split-metric">
                {(report?.drops ?? []).map((d) => (
                  <div className="panel stat" key={d.label}>
                    <span className="label">{d.label}</span>
                    <span className="value neon-rose" style={{ fontSize: '1.5rem' }}>
                      {fmt(d.delta)}
                    </span>
                    <span className="hint">{d.window}</span>
                  </div>
                ))}
              </div>
              <div className="agent-inline">
                {insightsFor(briefing, 'semrush').slice(0, 1).map((i) => (
                  <AgentCard key={i.id} insight={i} />
                ))}
              </div>
            </div>
            <div className="stack" style={{ gap: '1rem' }}>
              {insightsFor(briefing, 'semrush')
                .slice(1)
                .map((i) => (
                  <AgentCard key={i.id} insight={i} />
                ))}
            </div>
          </div>
        </section>
      ),
    },
    {
      id: 'csv-compare',
      title: 'CSV comparativo',
      node: (
        <section className="slide">
          <span className="kicker">Dos ciclos · mismos bolsillo</span>
          <h2>
            Antes y <span className="neon">ahora</span>
          </h2>
          <div className="grid-2">
            <div className="panel stack">
              <h3>Mes anterior · {prev.period.label}</h3>
              <div className="big-number neon-rose" style={{ fontSize: '2.6rem' }}>
                {fmt(compare.previous.units)}
              </div>
              <span className="hint" style={{ color: 'var(--muted)' }}>
                {fmt(compare.previous.per_day)} al día · chats {compare.previous.mcp_pct}%
              </span>
              <div className="hbar-list" style={{ marginTop: '0.6rem' }}>
                <div className="hbar-row">
                  <span className="hbar-label">Chats (Accesos)</span>
                  <div className="hbar-track rose">
                    <i
                      style={{
                        width: `${(compare.previous.accesos / maxUserPrev) * 100}%`,
                      }}
                    />
                  </div>
                  <span className="hbar-val">{fmt(compare.previous.accesos)}</span>
                </div>
                <div className="hbar-row">
                  <span className="hbar-label">Orbit (módulos)</span>
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
            </div>
            <div className="stack" style={{ gap: '0.85rem' }}>
              <div className="panel stack">
                <h3>Ciclo actual · {cur.period.label}</h3>
                <div className="big-number neon" style={{ fontSize: '2.2rem' }}>
                  {fmt(compare.current.units)}
                </div>
                <span className="hint" style={{ color: 'var(--muted)' }}>
                  {fmt(compare.current.per_day)} al día · {compare.current.days} días
                </span>
                <div className="hbar-list" style={{ marginTop: '0.45rem' }}>
                  <div className="hbar-row">
                    <span className="hbar-label">Chats (Accesos)</span>
                    <div className="hbar-track rose">
                      <i
                        style={{
                          width: `${(compare.current.accesos / Math.max(compare.current.accesos, compare.current.orbit, 1)) * 100}%`,
                        }}
                      />
                    </div>
                    <span className="hbar-val">{fmt(compare.current.accesos)}</span>
                  </div>
                  <div className="hbar-row">
                    <span className="hbar-label">Orbit (módulos)</span>
                    <div className="hbar-track">
                      <i
                        style={{
                          width: `${(compare.current.orbit / Math.max(compare.current.accesos, compare.current.orbit, 1)) * 100}%`,
                        }}
                      />
                    </div>
                    <span className="hbar-val">{fmt(compare.current.orbit)}</span>
                  </div>
                </div>
                <Spark days={cur.by_day} />
              </div>
              {insightsFor(briefing, 'csv-compare')
                .filter((i) => i.id === 'orbit-vs-mcp')
                .map((i) => (
                  <AgentCard key={i.id} insight={i} />
                ))}
            </div>
          </div>
        </section>
      ),
    },
    {
      id: 'users-agents',
      title: 'Usuarios y canales',
      node: (
        <section className="slide">
          <span className="kicker">Quién abre cada puerta</span>
          <h2>
            Mismo bolsillo, <span className="neon">dos formas de gastar</span>
          </h2>
          <div className="grid-2">
            <div className="stack" style={{ gap: '1rem' }}>
              {insightsFor(briefing, 'users-agents').map((i) => (
                <AgentCard key={i.id} insight={i} />
              ))}
            </div>
            <div className="panel stack">
              <h3>De dónde vino el gasto (mes anterior)</h3>
              <HBars
                items={prev.by_agent.slice(0, 4).map((a) => ({
                  ...a,
                  name: a.name
                    .replace('MCP · ', 'Chat · ')
                    .replace('Orbit · ', 'Orbit · '),
                }))}
                tone="rose"
              />
              <p className="lead" style={{ fontSize: '0.9rem', marginTop: '0.75rem' }}>
                Accesos → {logs.meta.users.accesos.email}
                <br />
                Orbit / Esteban → {logs.meta.users.esteban.email}
              </p>
            </div>
          </div>
        </section>
      ),
    },
    {
      id: 'endpoints-geo',
      title: 'Dónde duele',
      node: (
        <section className="slide">
          <span className="kicker">Consultas caras · origen</span>
          <h2>
            Qué preguntamos y <span className="neon-rose">cuánto cuesta</span>
          </h2>
          <div className="grid-2">
            <div className="stack" style={{ gap: '1rem' }}>
              {insightsFor(briefing, 'endpoints-geo').map((i) => (
                <AgentCard key={i.id} insight={i} />
              ))}
            </div>
            <div className="panel stack">
              <h3>Lo más caro este ciclo</h3>
              <HBars
                items={cur.by_endpoint.slice(0, 5).map((e) => ({
                  ...e,
                  name: e.name
                    .replace('keywords-explorer/', 'keywords · ')
                    .replace('site-explorer/', 'sitio · '),
                }))}
                tone="rose"
              />
              <h3 style={{ marginTop: '0.85rem' }}>Desde dónde</h3>
              <HBars items={cur.by_region.slice(0, 4)} />
            </div>
          </div>
        </section>
      ),
    },
    {
      id: 'mcp',
      title: 'Cómo usar chats',
      node: (
        <section className="slide">
          <span className="kicker">Reglas simples</span>
          <h2>
            Los chats ayudan — <span className="neon-rose">con límite</span>
          </h2>
          <div className="grid-2">
            <div className="stack" style={{ gap: '1rem' }}>
              <AgentCard
                insight={{
                  id: 'mcp-human',
                  tone: 'watch',
                  title: 'Cómo pedir datos sin vaciar el tanque',
                  body: 'Una pregunta = un dominio o unas pocas keywords. No “dame todo el mercado”. Si Orbit ya tiene el módulo, ábrelo ahí: ya pagamos esa información una vez.',
                }}
              />
              <AgentCard
                insight={{
                  id: 'mcp-cap',
                  tone: 'alert',
                  title: 'Lo que hay que hacer ya',
                  body: 'Poner un tope mensual a la llave de Accesos. Separar quién usa Claude, OpenAI o Codex. Sin techo, el mes pasado se puede repetir.',
                }}
              />
            </div>
            <div className="panel stack">
              <h3>Acuerdos del equipo</h3>
              <ul className="list">
                {(mcp?.rules ?? []).slice(0, 5).map((r, i) => (
                  <li key={r}>
                    <span className="n">0{i + 1}</span>
                    <span>{r}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>
      ),
    },
    {
      id: 'actions',
      title: 'Acciones',
      node: (
        <section className="slide">
          <span className="kicker">Esta semana</span>
          <h2>
            Decisiones con <span className="neon-lime">dueño</span>
          </h2>
          <div className="agent-inline" style={{ marginBottom: '0.85rem' }}>
            {insightsFor(briefing, 'actions').map((i) => (
              <AgentCard key={i.id} insight={i} />
            ))}
          </div>
          <div className="grid-3">
            {[
              {
                t: 'Tope a la llave de Accesos',
                d: 'Así un chat no se puede comer el mes entero otra vez.',
                o: 'Osward + Esteban',
              },
              {
                t: 'No barrer keywords a lo loco',
                d: 'Listas cortas. Una consulta de 13 mil unidades no es investigar: es un incendio.',
                o: 'Equipo',
              },
              {
                t: 'Preferir Orbit',
                d: 'El trabajo de clientes vive donde ya guardamos datos en Supabase.',
                o: 'Equipo',
              },
              {
                t: 'Revisar quién tiene chats conectados',
                d: 'Claude, OpenAI, Codex: quién, para qué, y apagar lo que no se use.',
                o: 'Esteban',
              },
              {
                t: 'Cerrar el caso Semrush',
                d: 'Preguntar en Semrush qué pasó esos tres días y quién más tenía la llave.',
                o: 'Gestión',
              },
              {
                t: 'Cuidar Orbit sin frenarlo',
                d: 'Avisar si un sync se dispara de más; la preparación de módulos sigue siendo bienvenida.',
                o: 'Osward',
              },
            ].map((a, i) => (
              <div className="panel stack" key={a.t}>
                <span className="mono neon" style={{ fontSize: '0.8rem' }}>
                  0{i + 1}
                </span>
                <h3>{a.t}</h3>
                <p className="lead" style={{ fontSize: '0.92rem' }}>
                  {a.d}
                </p>
                <span className="chip hot" style={{ width: 'fit-content' }}>
                  {a.o}
                </span>
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
          <span className="kicker">Cierre</span>
          <div style={{ maxWidth: '40rem', display: 'grid', gap: '1.25rem' }}>
            {insightsFor(briefing, 'close').map((i) => (
              <AgentCard key={i.id} insight={i} />
            ))}
          </div>
          <div className="hero-meta" style={{ marginTop: '1.5rem' }}>
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
