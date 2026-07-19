import { useEffect, useMemo, useState, type ReactNode } from 'react';
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

function Bar({ value, max, warn = false }: { value: number; max: number; warn?: boolean }) {
  const width = max > 0 ? Math.min(100, (value / max) * 100) : 0;
  return (
    <div className={`bar${warn ? ' warn' : ''}`}>
      <span style={{ width: `${width}%` }} />
    </div>
  );
}

export default function App() {
  const [data, setData] = useState<UsageData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch('/data/apis-usage.json')
      .then((r) => {
        if (!r.ok) throw new Error(`No se pudo cargar apis-usage.json (${r.status})`);
        return r.json();
      })
      .then(setData)
      .catch((e: Error) => setError(e.message));
  }, []);

  const ahrefs = useMemo(
    () => data?.apis.find((a) => a.id === 'ahrefs') ?? null,
    [data],
  );

  const slides = useMemo(() => {
    if (!data || !ahrefs) return [] as { id: string; title: string; node: ReactNode }[];
    return buildSlides(data, ahrefs);
  }, [data, ahrefs]);

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

function buildSlides(data: UsageData, ahrefs: ApiBlock) {
  const api = ahrefs.api!;
  const ui = ahrefs.ui_panel!;
  const brandRadar = ui.brand_radar_prompt_checks;
  const report = data.trigger_case.report;
  const spend = data.spend_analysis;
  const mcp = data.mcp_policy;

  return [
    {
      id: 'title',
      title: 'Portada',
      node: (
        <section className="slide">
          <span className="kicker">Exposición · {data.meta.duration_minutes} min · 8 slides</span>
          <h1>
            Uso y control de las <span className="neon">APIs</span>
          </h1>
          <p className="lead">
            Semrush nos avisó. Ahrefs todavía tiene margen. Hoy: qué pasó, por qué se gasta, cómo
            usar MCP, y reglas claras en Orbit.
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
                    <span className="hint">
                      {d.window} · sin llamadas en log
                    </span>
                  </div>
                ))}
              </div>
              <div className="alert critical">
                Explicadas: {fmt(report?.explained_units)} (pruebas + verificación). El resto solo
                conocemos extremos. Hipótesis: Position Tracking (no confirmada).
              </div>
            </div>
            <div className="panel stack">
              <h3>Lo que obliga a cambiar</h3>
              <ul className="list">
                {data.trigger_case.lessons.slice(0, 3).map((l, i) => (
                  <li key={l}>
                    <span className="n">0{i + 1}</span>
                    <span>{l}</span>
                  </li>
                ))}
              </ul>
              <div className="chips">
                <span className="chip danger">0 units ahora</span>
                <span className="chip">Solo vía proxy = visible</span>
              </div>
            </div>
          </div>
        </section>
      ),
    },
    {
      id: 'ahrefs-spend',
      title: 'Gasto Ahrefs',
      node: (
        <section className="slide">
          <span className="kicker">Por qué tanto gasto · ciclo actual</span>
          <h2>
            <span className="neon">{fmt(api.units_usage_workspace)}</span>
            <span style={{ color: 'var(--muted)', fontSize: '0.4em', fontWeight: 500 }}>
              {' '}
              / {fmt(api.units_limit_workspace)} · {pct(api.pct_workspace)}
            </span>
          </h2>
          <div className="grid-2">
            <div className="stack">
              {(ahrefs.breakdown ?? []).map((b) => (
                <div className="panel" key={b.source}>
                  <div className="stat">
                    <span className="label">{b.label}</span>
                    <span className="value" style={{ fontSize: '1.45rem' }}>
                      {fmt(b.units)}{' '}
                      <span style={{ color: 'var(--muted)', fontSize: '0.85rem' }}>
                        ({b.share_pct}%)
                      </span>
                    </span>
                    <Bar value={b.share_pct} max={100} />
                  </div>
                </div>
              ))}
              <div className="alert warning">
                Brand Radar UI: ~{fmt(brandRadar?.used_approx)} / {fmt(brandRadar?.limit)} — otro
                cupo, mismo síntoma de uso sin dueño.
              </div>
            </div>
            <div className="panel stack">
              <h3>Dónde se va (Orbit + fuera)</h3>
              <ul className="list">
                {(spend?.drivers ?? []).map((d, i) => (
                  <li key={d.title}>
                    <span className="n">0{i + 1}</span>
                    <span>
                      <strong style={{ color: 'var(--ink)' }}>{d.title}</strong> — {d.detail}
                    </span>
                  </li>
                ))}
              </ul>
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
          <span className="kicker">Recomendaciones MCP · Ahrefs</span>
          <h2>
            MCP útil, <span className="neon-rose">con techo</span>
          </h2>
          <p className="lead" style={{ marginTop: '-0.35rem' }}>
            {mcp?.principle}
          </p>
          <div className="grid-2">
            <div className="panel">
              <h3>Reglas para el equipo</h3>
              <ul className="list">
                {(mcp?.rules ?? []).map((r, i) => (
                  <li key={r}>
                    <span className="n">0{i + 1}</span>
                    <span>{r}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="stack">
              <div className="panel">
                <h3>Acciones inmediatas</h3>
                <ul className="list">
                  {(mcp?.actions ?? []).map((a, i) => (
                    <li key={a}>
                      <span className="n">0{i + 1}</span>
                      <span>{a}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="alert">
                Docs Ahrefs: MCP gasta el mismo cupo de API units. Cada conexión crea una key con
                scope MCP — se puede limitar por key.
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
          <span className="kicker">Control · costo · excepciones · fuentes</span>
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
        </section>
      ),
    },
    {
      id: 'ops',
      title: 'Operación',
      node: (
        <section className="slide">
          <span className="kicker">Rol · terceros · protocolo</span>
          <h2>
            Cómo respondemos al <span className="neon-rose">gasto fantasma</span>
          </h2>
          <div className="grid-3">
            <div className="panel stack">
              <h3>Osward (monitoreo)</h3>
              <ul className="list">
                {(data.ops?.owner_duties ?? []).map((x, i) => (
                  <li key={x}>
                    <span className="n">0{i + 1}</span>
                    <span>{x}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="panel stack">
              <h3>Esteban · tools / IDEs</h3>
              <ul className="list">
                {data.policy.third_party_tools.topics.map((t, i) => (
                  <li key={t}>
                    <span className="n">0{i + 1}</span>
                    <span>{t}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="panel stack">
              <h3>Si cae el saldo y el log está vacío</h3>
              <ul className="list">
                {data.policy.monitoring.unidentified_spend_protocol.map((s, i) => (
                  <li key={s}>
                    <span className="n">0{i + 1}</span>
                    <span>{s}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <div className="alert">
            Umbrales Ahrefs API: {data.policy.monitoring.thresholds_ahrefs_api_pct.moderate}% ·{' '}
            {data.policy.monitoring.thresholds_ahrefs_api_pct.warning}% ·{' '}
            {data.policy.monitoring.thresholds_ahrefs_api_pct.critical}% — hoy{' '}
            <strong className="neon">{pct(api.pct_workspace)}</strong>
          </div>
        </section>
      ),
    },
    {
      id: 'actions',
      title: 'Acciones',
      node: (
        <section className="slide">
          <span className="kicker">Qué pedimos cerrar esta semana</span>
          <h2>
            Decisiones, no <span className="neon-lime">más slides</span>
          </h2>
          <div className="grid-3">
            {(data.next_actions ?? []).map((a, i) => (
              <div className="panel stack" key={a.title}>
                <span className="mono neon" style={{ fontSize: '0.8rem' }}>
                  0{i + 1}
                </span>
                <h3>{a.title}</h3>
                <p className="lead" style={{ fontSize: '0.92rem' }}>
                  {a.detail}
                </p>
                {a.owner && (
                  <span className="chip hot" style={{ width: 'fit-content' }}>
                    {a.owner}
                  </span>
                )}
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
            Proxy + techos + <span className="neon">dueños</span>
          </h1>
          <p className="lead">
            Semrush: casi todo el gasto fue invisible. Ahrefs: ~54% Orbit, ~46% fuera de esa key
            (UI / otras keys / MCP). La regla: si gasta units, debe tener dueño, límite y log.
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
