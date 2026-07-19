import { useEffect, useMemo, useState, type ReactNode } from 'react';
import type { AnalyticsData, LogBucket } from './analyticsTypes';
import type { ApiBlock, UsageData } from './types';

function fmt(n: number | null | undefined): string {
  if (n == null) return '—';
  return n.toLocaleString('es-CO');
}

function pct(n: number | null | undefined): string {
  if (n == null) return '—';
  return `${n.toFixed(1)}%`;
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

function buildSlides(data: UsageData, ahrefs: ApiBlock, logs: AnalyticsData) {
  const api = ahrefs.api!;
  const credits = data.credits_model;
  const mcp = data.mcp_policy;
  const report = data.trigger_case.report;
  const { compare, current: cur, previous: prev } = logs;
  const maxUserPrev = Math.max(compare.previous.accesos, compare.previous.orbit, 1);

  return [
    {
      id: 'title',
      title: 'Portada',
      node: (
        <section className="slide">
          <span className="kicker">Exposición · CSV Ahrefs · forense</span>
          <h1>
            El gasto ya tiene <span className="neon-rose">nombre</span>
          </h1>
          <p className="lead">
            Semrush fue el detonante. El CSV de Ahrefs separa dos mundos: MCP bajo Accesos (gasto
            ad-hoc) vs Orbit bajo Esteban (inversión en módulos que cachean en Supabase).
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
      id: 'semrush',
      title: 'Caso Semrush',
      node: (
        <section className="slide">
          <span className="kicker">Detonante · informe 13 jul 2026</span>
          <h2>
            <span className="neon-rose">{fmt(report?.balance_start)}</span>
            {' → 0 '}
            <span style={{ color: 'var(--muted)', fontSize: '0.42em', fontWeight: 500 }}>
              · 98,7% sin rastro
            </span>
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
                    <span className="hint">{d.window} · sin log</span>
                  </div>
                ))}
              </div>
              <div className="alert critical">
                Lección: fuera del proxy = invisible. En Ahrefs el CSV sí deja Token creator +
                scope MCP.
              </div>
            </div>
            <div className="panel stack">
              <h3>Dos modelos de riesgo</h3>
              <ul className="list">
                <li>
                  <span className="n">SM</span>
                  <span>Semrush: prepago sin reset → se apaga en 0.</span>
                </li>
                <li>
                  <span className="n">AH</span>
                  <span>
                    Ahrefs: créditos UI + API units. Y además scope <span className="mono">apiv3-mcp</span>.
                  </span>
                </li>
                <li>
                  <span className="n">!!</span>
                  <span>{credits?.key_point}</span>
                </li>
              </ul>
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
          <span className="kicker">Exports Ahrefs · API log</span>
          <h2>
            Ciclo anterior vs <span className="neon">actual</span>
          </h2>
          <div className="grid-2">
            <div className="panel stack">
              <h3>Mes anterior · {prev.period.label}</h3>
              <div className="big-number neon-rose" style={{ fontSize: '2.6rem' }}>
                {fmt(compare.previous.units)}
              </div>
              <span className="hint" style={{ color: 'var(--muted)' }}>
                {fmt(compare.previous.per_day)}/día · MCP {compare.previous.mcp_pct}%
              </span>
              <div className="hbar-list" style={{ marginTop: '0.6rem' }}>
                <div className="hbar-row">
                  <span className="hbar-label">Accesos · MCP ad-hoc</span>
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
                  <span className="hbar-label">Orbit · módulos + cache</span>
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
            <div className="panel stack">
              <h3>Ciclo actual · {cur.period.label}</h3>
              <div className="big-number neon" style={{ fontSize: '2.6rem' }}>
                {fmt(compare.current.units)}
              </div>
              <span className="hint" style={{ color: 'var(--muted)' }}>
                {fmt(compare.current.per_day)}/día · MCP {compare.current.mcp_pct}% ·{' '}
                {compare.current.days} días
              </span>
              <div className="hbar-list" style={{ marginTop: '0.6rem' }}>
                <div className="hbar-row">
                  <span className="hbar-label">Accesos · MCP ad-hoc</span>
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
                  <span className="hbar-label">Orbit · módulos + cache</span>
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
              <div className="alert">
                Orbit puede liderar units este ciclo: es <strong>preparación de módulos</strong> que
                guardan en Supabase para no reconsultar. El problema a atacar es MCP ad-hoc sin
                cache ni techo.
              </div>
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
          <span className="kicker">Token creator · user agent · scope</span>
          <h2>
            Mismo cupo, <span className="neon">dos lógicas</span>
          </h2>
          <div className="grid-3">
            <div className="panel stack">
              <h3>Cuentas Ahrefs</h3>
              <div className="alert warning" style={{ fontSize: '0.82rem' }}>
                <strong>Accesos SeoLab</strong>
                <br />
                {logs.meta.users.accesos.email} · {logs.meta.users.accesos.role}
                <br />
                MCP ad-hoc · sin persistir en Orbit
              </div>
              <div className="alert" style={{ fontSize: '0.82rem' }}>
                <strong>Online Enterprises LLC</strong> (Esteban)
                <br />
                {logs.meta.users.esteban.email} · {logs.meta.users.esteban.role}
                <br />
                Orbit · sync a Supabase · reutilizable
              </div>
              <h3>Scope ciclo actual</h3>
              <HBars items={cur.by_scope} tone="amber" />
            </div>
            <div className="panel stack">
              <h3>Agentes · mes anterior</h3>
              <HBars items={prev.by_agent.slice(0, 5)} tone="rose" />
            </div>
            <div className="panel stack">
              <h3>Agentes · ciclo actual</h3>
              <HBars items={cur.by_agent.slice(0, 5)} />
              <div className="alert critical">
                OpenAI MCP: {fmt(prev.by_agent.find((a) => a.name.includes('OpenAI'))?.units)} units
                el mes pasado — gasto que no quedó en BD de Orbit.
              </div>
            </div>
          </div>
        </section>
      ),
    },
    {
      id: 'endpoints-geo',
      title: 'Endpoints e IP',
      node: (
        <section className="slide">
          <span className="kicker">Endpoints caros · origen de red</span>
          <h2>
            Dónde pega y <span className="neon">desde dónde</span>
          </h2>
          <div className="grid-2">
            <div className="panel stack">
              <h3>Top endpoints · ciclo actual</h3>
              <HBars items={cur.by_endpoint} tone="rose" />
              <h3 style={{ marginTop: '0.4rem' }}>Región / IP (units)</h3>
              <HBars items={cur.by_region} />
            </div>
            <div className="panel stack">
              <h3>Top llamadas (units)</h3>
              <table className="mini-table">
                <thead>
                  <tr>
                    <th>Units</th>
                    <th>Quién</th>
                    <th>Canal</th>
                    <th>Endpoint</th>
                    <th>Origen</th>
                  </tr>
                </thead>
                <tbody>
                  {cur.top_calls.slice(0, 6).map((c, i) => (
                    <tr key={`${c.at}-${i}`}>
                      <td className="danger">{fmt(c.units)}</td>
                      <td>{c.creator.includes('Accesos') ? 'Accesos' : 'Orbit'}</td>
                      <td>{c.agent.replace('MCP · ', '').replace('Orbit · ', '')}</td>
                      <td className="mono" style={{ fontSize: '0.7rem' }}>
                        {c.endpoint}
                      </td>
                      <td>
                        {c.ip_hint.flag} {c.ip_hint.country}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="alert warning">
                matching-terms a 13.250 × 2 el 13 jul = 26.500 units en segundos · scope{' '}
                <span className="mono">apiv3-mcp</span> · sin IP.
              </div>
            </div>
          </div>
        </section>
      ),
    },
    {
      id: 'mcp',
      title: 'MCP',
      node: (
        <section className="slide">
          <span className="kicker">Reglas con datos reales</span>
          <h2>
            MCP: útil, <span className="neon-rose">ya demostrado caro</span>
          </h2>
          <div className="grid-2">
            <div className="panel stack">
              <h3>Hechos del CSV</h3>
              <ul className="list">
                {logs.attack.bullets.map((b, i) => (
                  <li key={b}>
                    <span className="n">0{i + 1}</span>
                    <span>{b}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="stack">
              <div className="panel">
                <h3>Reglas inmediatas</h3>
                <ul className="list">
                  {(mcp?.rules ?? []).slice(0, 5).map((r, i) => (
                    <li key={r}>
                      <span className="n">0{i + 1}</span>
                      <span>{r}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="alert critical">
                Acción: tope en key MCP Accesos + preferir Orbit (cache Supabase). Orbit se
                monitorea, no se criminaliza: es inversión de plataforma.
              </div>
            </div>
          </div>
        </section>
      ),
    },
    {
      id: 'policy',
      title: 'Política',
      node: (
        <section className="slide">
          <span className="kicker">Control · costo · MCP · monitoreo</span>
          <h2>
            Un marco, <span className="neon">cuatro pilares</span>
          </h2>
          <div className="grid-2">
            {(data.policy_groups ?? []).map((g) => (
              <div className="panel stack" key={g.title}>
                <h3>{g.title}</h3>
                <ul className="list">
                  {g.items.map((item, i) => (
                    <li key={item}>
                      <span className="n">0{i + 1}</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="alert">
            Créditos UI hoy: SeoLab 41 → Casual ~$20 · Online Ent. 12 → Casual ~$20 · API{' '}
            {pct(api.pct_workspace)} del cupo · pay-as-you-go off.
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
          <div className="grid-3">
            {[
              {
                t: 'Tope key Accesos MCP',
                d: 'Cap mensual duro en Ahrefs → API keys para Accesos SeoLab. Sin techo = otro mes a 400k.',
                o: 'Osward + Esteban',
              },
              {
                t: 'Prohibir matching-terms masivo',
                d: 'limit bajo + keywords acotadas. 13k units/call no es investigación: es incendio.',
                o: 'Equipo MCP',
              },
              {
                t: 'Orbit = vía preferida',
                d: 'Módulos ya persisten en Supabase. Trabajo de clientes por Orbit; MCP solo si Orbit no cubre el caso.',
                o: 'Equipo',
              },
              {
                t: 'Inventario de MCP clients',
                d: 'Claude / OpenAI / Codex en Accesos — quién, para qué, revocar huérfanos.',
                o: 'Esteban',
              },
              {
                t: 'Cerrar Semrush',
                d: 'Panel actividad + soporte con saldos 36k / 20,3k / 100.',
                o: 'Gestión',
              },
              {
                t: 'Techo Orbit (salud)',
                d: 'Alertas si un sync de módulo se dispara sin necesidad; no frenar preparación legítima.',
                o: 'Osward',
              },
            ].map((a, i) => (
              <div className="panel stack" key={a.t}>
                <span className="mono neon" style={{ fontSize: '0.8rem' }}>
                  0{i + 1}
                </span>
                <h3>{a.t}</h3>
                <p className="lead" style={{ fontSize: '0.88rem' }}>
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
          <h1>
            Atacar MCP ad-hoc. <span className="neon">Orbit invierte y cachea</span>.
          </h1>
          <p className="lead">
            Units en Orbit preparan módulos y viven en Supabase. Units en MCP Accesos se evaporan
            sin reutilizar. Techo al MCP; Orbit como vía preferida.
          </p>
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
