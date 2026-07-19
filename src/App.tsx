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

  return [
    {
      id: 'title',
      title: 'Portada',
      node: (
        <section className="slide">
          <span className="kicker">Exposición interna · {data.meta.duration_minutes} min</span>
          <h1>
            Uso y control de las <span className="neon">APIs</span>
          </h1>
          <p className="lead">
            Cómo vamos a controlar, optimizar y reducir el consumo de APIs de pago — empezando por
            Ahrefs, con el caso Semrush como detonante.
          </p>
          <div className="hero-meta">
            <span>
              Presenta <strong>{data.meta.presenter}</strong>
            </span>
            <span>
              Gestión <strong>{data.meta.gestion}</strong>
            </span>
            <span>
              Docs en <strong>{data.meta.docs_home}</strong>
            </span>
          </div>
        </section>
      ),
    },
    {
      id: 'why',
      title: 'Caso Semrush',
      node: (
        <section className="slide">
          <span className="kicker">{data.trigger_case.headline}</span>
          <h2>
            <span className="neon-rose">{fmt(data.trigger_case.report?.balance_start)}</span>
            {' → '}
            <span className="neon-rose">0</span>
            <span style={{ color: 'var(--muted)', fontSize: '0.45em', fontWeight: 500 }}>
              {' '}
              en 3 días
            </span>
          </h2>
          <div className="grid-3">
            <div className="panel stat">
              <span className="label">Explicadas (logs agencia)</span>
              <span className="value neon-lime">
                {fmt(data.trigger_case.report?.explained_units)}
              </span>
              <span className="hint">1,3% · pruebas vie + verificación lun</span>
            </div>
            <div className="panel stat">
              <span className="label">Sin rastro interno</span>
              <span className="value neon-rose">
                {fmt(data.trigger_case.report?.unexplained_units)}
              </span>
              <span className="hint">
                {data.trigger_case.report?.unexplained_pct}% del total perdido
              </span>
            </div>
            <div className="panel stack">
              <h3>Informe</h3>
              <p className="lead" style={{ fontSize: '0.92rem' }}>
                {data.trigger_case.report?.prepared_for}
              </p>
              <div className="chips">
                <span className="chip danger">Prepago · sin reset</span>
                <span className="chip">Horas Bogotá</span>
              </div>
            </div>
          </div>
          <div className="alert critical">{data.trigger_case.summary}</div>
        </section>
      ),
    },
    {
      id: 'semrush-drops',
      title: 'Dos golpes',
      node: (
        <section className="slide">
          <span className="kicker">Cronología · lecturas reales countapiunits</span>
          <h2>
            Dos caídas <span className="neon-rose">sin llamadas registradas</span>
          </h2>
          <div className="grid-2">
            {(data.trigger_case.report?.drops ?? []).map((d) => (
              <div className="panel stack" key={d.label}>
                <div className="chips">
                  <span className="chip danger">{d.label}</span>
                  <span className="chip">{d.window}</span>
                </div>
                <div className="big-number neon-rose">{fmt(d.delta)}</div>
                <p className="lead" style={{ fontSize: '0.95rem' }}>
                  {fmt(d.from)} → {fmt(d.to)}
                </p>
                <span className="mono" style={{ color: 'var(--dim)', fontSize: '0.78rem' }}>
                  {d.from_at} → {d.to_at}
                </span>
              </div>
            ))}
          </div>
          <div className="alert warning">
            Tramo explicado: 360 (pruebas) + 100 (verificación directa lun) = 460. El resto solo
            conocemos los extremos — no qué pasó adentro.
          </div>
        </section>
      ),
    },
    {
      id: 'semrush-hypothesis',
      title: 'Hipótesis Semrush',
      node: (
        <section className="slide">
          <span className="kicker">Hipótesis de trabajo · no confirmada</span>
          <h2>
            {data.trigger_case.report?.hypothesis.title ?? 'Position Tracking'}
          </h2>
          <div className="grid-2">
            <div className="panel stack">
              <h3>Por qué encaja</h3>
              <p className="lead" style={{ fontSize: '0.98rem' }}>
                {data.trigger_case.report?.hypothesis.detail}
              </p>
              <div className="alert critical">
                {data.trigger_case.report?.hypothesis.why_invisible}
              </div>
            </div>
            <div className="panel stack">
              <h3>Descartado (lado agencia)</h3>
              <ul className="list">
                {(data.trigger_case.report?.ruled_out ?? []).map((x, i) => (
                  <li key={x}>
                    <span className="n">0{i + 1}</span>
                    <span>{x}</span>
                  </li>
                ))}
              </ul>
              <h3 style={{ marginTop: '0.5rem' }}>Siguiente</h3>
              <ul className="list">
                {(data.trigger_case.report?.next_steps ?? []).map((x, i) => (
                  <li key={x}>
                    <span className="n">0{i + 1}</span>
                    <span>{x}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>
      ),
    },
    {
      id: 'lessons',
      title: 'Aprendizajes',
      node: (
        <section className="slide">
          <span className="kicker">De Semrush a la política</span>
          <h2>
            Lo que esto <span className="neon">obliga</span> a cambiar
          </h2>
          <ul className="list" style={{ flex: 1, fontSize: '1.05rem' }}>
            {data.trigger_case.lessons.map((l, i) => (
              <li key={l}>
                <span className="n">0{i + 1}</span>
                <span>{l}</span>
              </li>
            ))}
          </ul>
        </section>
      ),
    },
    {
      id: 'agenda',
      title: 'Agenda',
      node: (
        <section className="slide">
          <span className="kicker">20 minutos</span>
          <h2>
            Ocho puntos <span className="neon">accionables</span>
          </h2>
          <ol className="list two-col-list" style={{ flex: 1 }}>
            {data.policy.goals.map((g, i) => (
              <li key={g}>
                <span className="n">{String(i + 1).padStart(2, '0')}</span>
                <span>{g}</span>
              </li>
            ))}
          </ol>
        </section>
      ),
    },
    {
      id: 'ahrefs-live',
      title: 'Ahrefs ahora',
      node: (
        <section className="slide">
          <span className="kicker">Ahrefs · datos vivos</span>
          <h2>
            Cupo API: <span className="neon">{pct(api.pct_workspace)}</span> del mes
          </h2>
          <div className="grid-4">
            <div className="panel stat">
              <span className="label">Units usadas</span>
              <span className="value neon">{fmt(api.units_usage_workspace)}</span>
              <span className="hint">de {fmt(api.units_limit_workspace)}</span>
              <Bar value={api.units_usage_workspace ?? 0} max={api.units_limit_workspace ?? 1} />
            </div>
            <div className="panel stat">
              <span className="label">Restantes</span>
              <span className="value">{fmt(api.units_remaining_workspace)}</span>
              <span className="hint">
                Reset {ahrefs.subscription?.usage_reset_date?.slice(0, 10) ?? '—'}
              </span>
            </div>
            <div className="panel stat">
              <span className="label">Esta API key</span>
              <span className="value neon-lime">{fmt(api.units_usage_api_key)}</span>
              <span className="hint">{pct(api.pct_this_key_of_workspace)} del workspace</span>
            </div>
            <div className="panel stat">
              <span className="label">Otras keys / UI / MCP</span>
              <span className="value">{fmt(api.units_usage_other_keys_or_ui)}</span>
              <span className="hint">
                {pct(100 - (api.pct_this_key_of_workspace ?? 0))} del workspace
              </span>
            </div>
          </div>
          <div className="alert info">
            Plan <strong className="mono">{ahrefs.subscription?.plan}</strong> · Pago por uso{' '}
            <strong>deshabilitado</strong> · Snapshot API gratis via{' '}
            <span className="mono">/subscription-info/limits-and-usage</span>
          </div>
        </section>
      ),
    },
    {
      id: 'breakdown',
      title: 'Quién consume',
      node: (
        <section className="slide">
          <span className="kicker">Desglose Ahrefs</span>
          <h2>
            Separar <span className="neon">Orbit</span> del resto
          </h2>
          <div className="grid-2">
            <div className="stack">
              {(ahrefs.breakdown ?? []).map((b) => (
                <div className="panel" key={b.source}>
                  <div className="stat">
                    <span className="label">{b.label}</span>
                    <span className="value">{fmt(b.units)}</span>
                    <span className="hint">{b.share_pct}% · {b.notes}</span>
                    <Bar value={b.share_pct} max={100} />
                  </div>
                </div>
              ))}
            </div>
            <div className="panel stack">
              <h3>Créditos UI (panel Ahrefs)</h3>
              {ui.credits_by_user.map((u) => (
                <div key={u.user} className="stat">
                  <span className="label">{u.user}</span>
                  <span className="value" style={{ fontSize: '1.4rem' }}>
                    {fmt(u.used)}
                    {u.limit != null ? ` / ${fmt(u.limit)}` : ''}
                  </span>
                  {u.limit != null && <Bar value={u.used} max={u.limit} />}
                </div>
              ))}
              <div className="chips" style={{ marginTop: '0.5rem' }}>
                <span className="chip">Proyectos verif. {ui.projects?.verified}</span>
                <span className="chip">
                  Rank Tracker {fmt(ui.rank_tracker_keywords?.used)} /{' '}
                  {fmt(ui.rank_tracker_keywords?.limit)}
                </span>
                <span className="chip">
                  Site Audit {fmt(ui.site_audit_crawl_credits?.used)} /{' '}
                  {fmt(ui.site_audit_crawl_credits?.limit)}
                </span>
              </div>
            </div>
          </div>
        </section>
      ),
    },
    {
      id: 'alerts',
      title: 'Señales',
      node: (
        <section className="slide">
          <span className="kicker">Alertas actuales</span>
          <h2>
            Lo que hay que <span className="neon-lime">mirar ya</span>
          </h2>
          <div className="grid-3">
            <div className="panel stack">
              <h3>API units</h3>
              <div className="big-number neon">{pct(api.pct_workspace)}</div>
              <p className="lead" style={{ fontSize: '0.95rem' }}>
                Holgado hoy. El riesgo no es el % actual: es un pico sin dueño, como Semrush.
              </p>
            </div>
            <div className="panel stack">
              <h3>Brand Radar</h3>
              <div className="big-number neon-rose">
                {fmt(brandRadar?.used_approx)}
                <span style={{ fontSize: '1rem', color: 'var(--muted)' }}>
                  {' '}
                  / {fmt(brandRadar?.limit)}
                </span>
              </div>
              <Bar
                value={brandRadar?.used_approx ?? 0}
                max={brandRadar?.limit ?? 1}
                warn
              />
              <p className="lead" style={{ fontSize: '0.95rem' }}>
                Muy por encima del plan base. Revisar quién lo dispara y con qué frecuencia.
              </p>
            </div>
            <div className="panel stack">
              <h3>IP / país</h3>
              <p className="lead" style={{ fontSize: '0.95rem' }}>
                Ahrefs no entrega geo en este endpoint. Lo vamos a enriquecer desde logs de Orbit
                (endpoint, label, IP, país) cuando el proxy lo registre.
              </p>
              <div className="chips">
                <span className="chip hot">JSON listo para samples[]</span>
                <span className="chip">Extensible a otras APIs</span>
              </div>
            </div>
          </div>
        </section>
      ),
    },
    {
      id: 'cost',
      title: 'Reducción de costos',
      node: (
        <section className="slide">
          <span className="kicker">Punto 01</span>
          <h2>
            Reducir costo = <span className="neon">menos queries inútiles</span>
          </h2>
          <div className="grid-3">
            {[
              ['Cache primero', 'Reutilizar resultados 24h+ en sell-tools / reportes. Mismo dominio, mismo día = 0 gasto extra.'],
              ['Targets de prueba', 'Desarrollo contra targets gratis de Ahrefs. Nunca barridos masivos en prod keys.'],
              ['Campos mínimos', 'Pedir solo campos necesarios: cada field suma al costo por fila (mín. 50 units/request).'],
              ['Límites por key', 'Cap mensual por API key en Ahrefs. Separar key de prod vs experimentos.'],
              ['Pay-as-you-go off', 'Mantener deshabilitado. Si hace falta más cupo, decisión de gestión, no automática.'],
              ['UI vs API', 'Créditos de interfaz ≠ units API. Ambos se monitorean, reglas distintas.'],
            ].map(([t, d], i) => (
              <div className="panel" key={t}>
                <h3>
                  <span className="mono neon" style={{ marginRight: '0.4rem' }}>
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  {t}
                </h3>
                <p className="lead" style={{ fontSize: '0.92rem' }}>
                  {d}
                </p>
              </div>
            ))}
          </div>
        </section>
      ),
    },
    {
      id: 'sources',
      title: 'Fuentes de datos',
      node: (
        <section className="slide">
          <span className="kicker">Punto 02</span>
          <h2>
            Todo el consumo se lee en <span className="neon">Orbit</span>
          </h2>
          <div className="grid-2">
            <div className="panel">
              <h3>Monitores Leaders</h3>
              <ul className="list">
                <li>
                  <span className="n">AH</span>
                  <span>
                    Ahrefs → <span className="mono">{ahrefs.orbit_module}</span>
                  </span>
                </li>
                <li>
                  <span className="n">SM</span>
                  <span>
                    Semrush → <span className="mono">{data.trigger_case.orbit_module}</span>
                  </span>
                </li>
                <li>
                  <span className="n">OR</span>
                  <span>OpenRouter / contenido → logs en Supabase (próximo en esta deck)</span>
                </li>
              </ul>
            </div>
            <div className="panel stack">
              <h3>Fuera de foco de costo</h3>
              <p className="lead" style={{ fontSize: '1rem' }}>
                GSC y GA4 se siguen usando, pero no impulsan esta política: son casi gratis frente a
                Ahrefs / Semrush / LLMs.
              </p>
              <div className="chips">
                <span className="chip">Documentación en Orbit</span>
                <span className="chip hot">Snapshot JSON en esta web</span>
              </div>
            </div>
          </div>
        </section>
      ),
    },
    {
      id: 'exceptions',
      title: 'Excepciones',
      node: (
        <section className="slide">
          <span className="kicker">Punto 03</span>
          <h2>
            Sí hay excepciones — <span className="neon-lime">con dueño</span>
          </h2>
          <div className="grid-2">
            <div className="panel stack">
              <h3>Quién autoriza</h3>
              <p className="lead">{data.policy.exceptions.approver}</p>
              <div className="alert">Proceso: {data.policy.exceptions.process}</div>
            </div>
            <div className="panel">
              <h3>Cuándo pedir excepción</h3>
              <ul className="list">
                {[
                  'Auditoría puntual de muchos dominios',
                  'Demo / pitch con volumen alto',
                  'Backfill histórico justificado',
                  'Investigación de incidente SEO',
                ].map((x, i) => (
                  <li key={x}>
                    <span className="n">0{i + 1}</span>
                    <span>{x}</span>
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
      title: 'Uso de MCP',
      node: (
        <section className="slide">
          <span className="kicker">Punto 04</span>
          <h2>
            MCP útil, no <span className="neon-rose">voraz</span>
          </h2>
          <div className="grid-3">
            <div className="panel stack">
              <h3>Regla</h3>
              <p className="lead" style={{ fontSize: '1rem' }}>
                {data.policy.mcp.rule}
              </p>
            </div>
            <div className="panel stack">
              <h3>Buenas prácticas</h3>
              <ul className="list">
                {[
                  'Una pregunta = una consulta acotada',
                  'No encadenar scrapes masivos desde el IDE',
                  'Preferir datos ya cacheados en Orbit',
                ].map((x, i) => (
                  <li key={x}>
                    <span className="n">0{i + 1}</span>
                    <span>{x}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="panel stack">
              <h3>Dónde documentar</h3>
              <p className="lead" style={{ fontSize: '1rem' }}>
                Guías y límites de MCP viven en <strong>{data.policy.mcp.docs}</strong>. Esta
                presentación no reemplaza esa fuente.
              </p>
            </div>
          </div>
        </section>
      ),
    },
    {
      id: 'control',
      title: 'Control directo',
      node: (
        <section className="slide">
          <span className="kicker">Punto 05</span>
          <h2>
            Qué controla <span className="neon">la empresa</span>
          </h2>
          <div className="grid-3">
            {data.apis
              .filter((a) => a.status !== 'out_of_scope')
              .map((a) => (
                <div className="panel stack" key={a.id}>
                  <div className="chips">
                    <span className={`chip${a.status === 'watch' ? ' danger' : ' hot'}`}>
                      {a.status}
                    </span>
                  </div>
                  <h3>{a.name}</h3>
                  <p className="lead" style={{ fontSize: '0.92rem' }}>
                    {a.why_monitored}
                  </p>
                  <span className="mono" style={{ color: 'var(--dim)', fontSize: '0.8rem' }}>
                    {a.billing_model}
                  </span>
                </div>
              ))}
          </div>
        </section>
      ),
    },
    {
      id: 'third-party',
      title: 'Terceros',
      node: (
        <section className="slide">
          <span className="kicker">Punto 06</span>
          <h2>
            IDEs y tools de terceros · <span className="neon">Esteban</span>
          </h2>
          <div className="grid-2">
            <div className="panel">
              <h3>Temas a alinear</h3>
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
              <h3>Posición</h3>
              <p className="lead" style={{ fontSize: '1.05rem' }}>
                Si una herramienta puede gastar units con una key compartida, entra en el mismo
                régimen de control: dueño, límite y log. No hay “zona gris” por ser un IDE.
              </p>
            </div>
          </div>
        </section>
      ),
    },
    {
      id: 'role',
      title: 'Rol Osward',
      node: (
        <section className="slide">
          <span className="kicker">Punto 07</span>
          <h2>
            Rol de monitoreo: <span className="neon">{data.policy.monitoring.owner}</span>
          </h2>
          <div className="grid-2">
            <div className="panel">
              <h3>Responsabilidades</h3>
              <ul className="list">
                {[
                  'Vigilar monitores Ahrefs / Semrush en Orbit',
                  'Mantener snapshots y alertas',
                  'Investigar picos y gasto no identificado',
                  'Proponer límites y rotar keys si hace falta',
                  'Reportar a gestión (Sebastian) con datos',
                ].map((x, i) => (
                  <li key={x}>
                    <span className="n">0{i + 1}</span>
                    <span>{x}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="panel stack">
              <h3>Canales</h3>
              {data.policy.monitoring.channels.map((c) => (
                <div className="alert" key={c}>
                  {c}
                </div>
              ))}
            </div>
          </div>
        </section>
      ),
    },
    {
      id: 'protocol',
      title: 'Protocolo',
      node: (
        <section className="slide">
          <span className="kicker">Punto 08</span>
          <h2>
            Alertas y protocolo ante <span className="neon-rose">gasto fantasma</span>
          </h2>
          <div className="grid-2">
            <div className="panel stack">
              <h3>Umbrales Ahrefs (API %)</h3>
              <div className="split-metric">
                <div className="stat">
                  <span className="label">Moderado</span>
                  <span className="value">{data.policy.monitoring.thresholds_ahrefs_api_pct.moderate}%</span>
                </div>
                <div className="stat">
                  <span className="label">Atención</span>
                  <span className="value" style={{ color: 'var(--amber)' }}>
                    {data.policy.monitoring.thresholds_ahrefs_api_pct.warning}%
                  </span>
                </div>
                <div className="stat">
                  <span className="label">Crítico</span>
                  <span className="value neon-rose">
                    {data.policy.monitoring.thresholds_ahrefs_api_pct.critical}%
                  </span>
                </div>
                <div className="stat">
                  <span className="label">Hoy</span>
                  <span className="value neon">{pct(api.pct_workspace)}</span>
                </div>
              </div>
            </div>
            <div className="panel">
              <h3>Si aparece gasto no identificado</h3>
              <ul className="list">
                {data.policy.monitoring.unidentified_spend_protocol.map((step, i) => (
                  <li key={step}>
                    <span className="n">0{i + 1}</span>
                    <span>{step}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>
      ),
    },
    {
      id: 'roadmap',
      title: 'Siguiente',
      node: (
        <section className="slide">
          <span className="kicker">Extensible</span>
          <h2>
            Hoy Ahrefs — <span className="neon-lime">después el resto</span>
          </h2>
          <div className="grid-3">
            <div className="panel stack">
              <h3>Ya en deck</h3>
              <div className="chips">
                <span className="chip hot">Ahrefs live</span>
                <span className="chip danger">Semrush case</span>
                <span className="chip">Política 8 puntos</span>
              </div>
            </div>
            <div className="panel stack">
              <h3>Próximo JSON</h3>
              <div className="chips">
                <span className="chip">OpenRouter tokens</span>
                <span className="chip">Call logs IP/país</span>
                <span className="chip">Más providers Orbit</span>
              </div>
            </div>
            <div className="panel stack">
              <h3>Cómo actualizar</h3>
              <p className="lead" style={{ fontSize: '0.95rem' }}>
                <span className="mono">npm run refresh:ahrefs</span> con{' '}
                <span className="mono">AHREFS_API_KEY</span> en{' '}
                <span className="mono">.env.local</span> — nunca en el repo.
              </p>
            </div>
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
            Controlar APIs es <span className="neon">proteger presupuesto</span>
          </h1>
          <p className="lead">
            Semrush: 36.370 → 0, y el 98,7% fue invisible para nuestros logs. Ahrefs todavía tiene
            margen — usémoslo para instalar el hábito: todo por proxy, inventario de keys, Orbit
            como fuente de verdad.
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
