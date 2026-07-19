/**
 * Analyze Ahrefs API usage CSV exports → public/data/ahrefs-api-log-analytics.json
 * Usage: node scripts/analyze-ahrefs-csv.mjs
 */
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const files = {
  current: resolve(root, '2026-07-11_2026-07-19_2026-07-19_02-56-59.csv'),
  previous: resolve(root, '2026-06-11_2026-07-11_2026-07-19_02-57-54.csv'),
};

function parseCsv(text) {
  const lines = text.trim().split(/\r?\n/);
  const rows = [];
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];
    if (!line.trim()) continue;
    const tsMatch = line.match(/,(\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2})$/);
    if (!tsMatch) continue;
    const timestamp = tsMatch[1];
    let rest = line.slice(0, -tsMatch[0].length);
    const methodMatch = rest.match(/,(GET|POST),(.+)$/);
    if (!methodMatch) continue;
    const method = methodMatch[1];
    const userAgent = methodMatch[2];
    rest = rest.slice(0, -methodMatch[0].length);
    let tokenCreator = '';
    if (rest.endsWith('Accesos SeoLab')) {
      tokenCreator = 'Accesos SeoLab';
      rest = rest.slice(0, -',Accesos SeoLab'.length);
    } else if (rest.endsWith('Online Enterprises LLC')) {
      tokenCreator = 'Online Enterprises LLC';
      rest = rest.slice(0, -',Online Enterprises LLC'.length);
    } else {
      const lastComma = rest.lastIndexOf(',');
      tokenCreator = rest.slice(lastComma + 1);
      rest = rest.slice(0, lastComma);
    }
    const parts = rest.split(',');
    let scopeIdx = -1;
    for (let j = parts.length - 1; j >= 0; j--) {
      if (parts[j] === 'apiv3' || parts[j] === 'apiv3-mcp') {
        scopeIdx = j;
        break;
      }
    }
    if (scopeIdx < 0) continue;
    rows.push({
      path: parts.slice(0, scopeIdx).join(','),
      scope: parts[scopeIdx],
      units: Number(parts[scopeIdx + 1] || 0),
      ip: parts.slice(scopeIdx + 2).join(',') || '',
      tokenCreator,
      method,
      userAgent,
      timestamp,
    });
  }
  return rows;
}

function endpointFamily(path) {
  try {
    let raw = path;
    // Only parse as absolute URL when it really is one (query can contain https%3A)
    if (raw.startsWith('http://') || raw.startsWith('https://')) {
      const u = new URL(raw);
      raw = u.pathname;
    } else {
      raw = raw.split('?')[0];
    }
    try {
      raw = decodeURIComponent(raw);
    } catch {
      /* keep */
    }
    raw = raw.replace(/^\/v3\//, '').replace(/^\//, '');
    const seg = raw.split('/').filter(Boolean);
    if (seg.length >= 2) return `${seg[0]}/${seg[1]}`;
    return seg[0] || 'unknown';
  } catch {
    return 'unknown';
  }
}

function agentFamily(ua) {
  const s = (ua || '').toLowerCase();
  if (s.includes('openai-mcp') && s.includes('codex')) return 'MCP · Codex';
  if (s.includes('openai-mcp')) return 'MCP · OpenAI';
  if (s.includes('claude')) return 'MCP · Claude';
  if (s.includes('supabase')) return 'Orbit · Supabase Edge';
  if (s.includes('axios')) return 'Monitor · axios';
  if (s.includes('powershell')) return 'Script · PowerShell';
  if (s.includes('deno')) return 'Orbit · Deno/Edge';
  if (s === 'node' || s.startsWith('node')) return 'Orbit · node';
  return (ua || 'unknown').slice(0, 40);
}

function ipHint(ip) {
  if (!ip) {
    return { label: 'Sin IP · MCP remoto Ahrefs', region: 'mcp', flag: '🛰️', country: 'n/a' };
  }
  if (ip.startsWith('2600:1f18:') || ip.startsWith('2600:1f1e:')) {
    return { label: 'AWS US-East · Supabase Edge', region: 'us', flag: '🇺🇸', country: 'US' };
  }
  if (/^(3\.|18\.|34\.|44\.|52\.|54\.|98\.)/.test(ip)) {
    return { label: 'AWS US · node/EC2', region: 'us', flag: '🇺🇸', country: 'US' };
  }
  if (ip.startsWith('195.26.')) {
    return { label: 'Monitor cron (EU ASN)', region: 'eu', flag: '🇪🇺', country: 'EU' };
  }
  if (/^(45\.225\.|186\.14\.|190\.|200\.|201\.)/.test(ip)) {
    return { label: 'LatAm (VE/CO)', region: 'latam', flag: '🇻🇪', country: 'LATAM' };
  }
  return { label: ip.slice(0, 28), region: 'other', flag: '🌐', country: '??' };
}

function analyze(rows, period) {
  const totalUnits = rows.reduce((s, r) => s + r.units, 0);
  const byUser = {};
  const byScope = {};
  const byEndpoint = {};
  const byAgent = {};
  const byDay = {};
  const byIp = {};
  const byRegion = {};

  const bump = (map, key, units) => {
    map[key] = map[key] || { units: 0, calls: 0, paid_calls: 0 };
    map[key].units += units;
    map[key].calls++;
    if (units > 0) map[key].paid_calls++;
  };

  for (const r of rows) {
    bump(byUser, r.tokenCreator, r.units);
    bump(byScope, r.scope, r.units);
    bump(byEndpoint, endpointFamily(r.path), r.units);
    bump(byAgent, agentFamily(r.userAgent), r.units);
    bump(byDay, r.timestamp.slice(0, 10), r.units);
    const hint = ipHint(r.ip);
    const ipKey = r.ip || '(mcp-blank)';
    byIp[ipKey] = byIp[ipKey] || { units: 0, calls: 0, ...hint };
    byIp[ipKey].units += r.units;
    byIp[ipKey].calls++;
    const regionKey = `${hint.flag} ${hint.label}`;
    byRegion[regionKey] = byRegion[regionKey] || {
      units: 0,
      calls: 0,
      flag: hint.flag,
      country: hint.country,
    };
    byRegion[regionKey].units += r.units;
    byRegion[regionKey].calls++;
  }

  const sortObj = (o) =>
    Object.entries(o)
      .map(([k, v]) => ({ name: k, ...v }))
      .sort((a, b) => b.units - a.units);

  const days = Math.max(1, new Set(rows.map((r) => r.timestamp.slice(0, 10))).size);
  const mcpUnits = byScope['apiv3-mcp']?.units || 0;

  return {
    period,
    rows: rows.length,
    paid_rows: rows.filter((r) => r.units > 0).length,
    total_units: totalUnits,
    mcp_units: mcpUnits,
    api_units: byScope['apiv3']?.units || 0,
    mcp_pct: totalUnits ? Number(((mcpUnits / totalUnits) * 100).toFixed(1)) : 0,
    days,
    per_day: Math.round(totalUnits / days),
    by_user: sortObj(byUser),
    by_scope: sortObj(byScope),
    by_endpoint: sortObj(byEndpoint)
      .filter((x) => x.units > 0)
      .slice(0, 8),
    by_agent: sortObj(byAgent).filter((x) => x.units > 0 || x.calls > 5),
    by_day: Object.entries(byDay)
      .map(([day, v]) => ({ day, ...v }))
      .sort((a, b) => a.day.localeCompare(b.day)),
    by_region: sortObj(byRegion),
    by_ip: sortObj(byIp).slice(0, 8),
    top_calls: [...rows]
      .sort((a, b) => b.units - a.units)
      .slice(0, 8)
      .map((r) => ({
        units: r.units,
        scope: r.scope,
        creator: r.tokenCreator,
        agent: agentFamily(r.userAgent),
        endpoint: endpointFamily(r.path),
        ip: r.ip || null,
        ip_hint: ipHint(r.ip),
        at: r.timestamp,
      })),
  };
}

for (const [k, f] of Object.entries(files)) {
  if (!existsSync(f)) {
    console.error(`Missing ${k}: ${f}`);
    process.exit(1);
  }
}

const current = analyze(parseCsv(readFileSync(files.current, 'utf8')), {
  id: 'current',
  label: '11–19 jul 2026',
  from: '2026-07-11',
  to: '2026-07-19',
});
const previous = analyze(parseCsv(readFileSync(files.previous, 'utf8')), {
  id: 'previous',
  label: '11 jun – 11 jul 2026',
  from: '2026-06-11',
  to: '2026-07-11',
});

const u = (period, part) =>
  period.by_user.find((x) => x.name.includes(part))?.units || 0;

const out = {
  meta: {
    generated_at: new Date().toISOString(),
    source_files: Object.values(files).map((f) => f.split(/[/\\]/).pop()),
    users: {
      accesos: {
        token: 'Accesos SeoLab',
        email: 'accesos@seolabagency.com',
        role: 'Miembro',
        channel: 'MCP (Claude / OpenAI / Codex)',
      },
      esteban: {
        token: 'Online Enterprises LLC',
        email: 'info@seolabagency.com',
        role: 'Propietario',
        channel: 'Orbit · sync módulos · cache Supabase',
      },
    },
  },
  attack: {
    title: 'MCP ad-hoc vs Orbit que cachea',
    bullets: [
      `Ciclo anterior: Accesos SeoLab (MCP) gastó ${u(previous, 'Accesos').toLocaleString('es-CO')} units (${previous.mcp_pct}% del mes) — OpenAI MCP lideró, sin persistir en Orbit.`,
      'Orbit (Esteban/info@) también gasta: preparación de módulos cuyos resultados muchos ya viven en Supabase para no reconsultar.',
      `Ciclo actual: Orbit ${u(current, 'Online').toLocaleString('es-CO')} vs MCP Accesos ${u(current, 'Accesos').toLocaleString('es-CO')} — no comparar 1:1; Orbit es inversión reutilizable, MCP es ad-hoc.`,
      'matching-terms MCP a 13.250 units/call (13 jul ×2 = 26.500) es el patrón a cortar.',
      'MCP sin IP; Orbit deja AWS US (Supabase Edge) + log. Monitorear Orbit, techar MCP.',
    ],
  },
  compare: {
    previous: {
      units: previous.total_units,
      mcp_units: previous.mcp_units,
      mcp_pct: previous.mcp_pct,
      per_day: previous.per_day,
      days: previous.days,
      accesos: u(previous, 'Accesos'),
      orbit: u(previous, 'Online'),
    },
    current: {
      units: current.total_units,
      mcp_units: current.mcp_units,
      mcp_pct: current.mcp_pct,
      per_day: current.per_day,
      days: current.days,
      accesos: u(current, 'Accesos'),
      orbit: u(current, 'Online'),
    },
    burn_ratio: Number((current.per_day / previous.per_day).toFixed(2)),
  },
  current,
  previous,
};

const outPath = resolve(root, 'public/data/ahrefs-api-log-analytics.json');
writeFileSync(outPath, `${JSON.stringify(out, null, 2)}\n`);
console.log('Wrote', outPath);
console.log('Prev', previous.total_units, 'Cur', current.total_units);
console.log('Endpoints cur', current.by_endpoint.slice(0, 5));
