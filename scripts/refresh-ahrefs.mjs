/**
 * Refresh Ahrefs usage into public/data/apis-usage.json
 * Usage: set AHREFS_API_KEY in .env.local then: npm run refresh:ahrefs
 */
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '..');
const dataPath = resolve(root, 'public/data/apis-usage.json');

function loadEnvLocal() {
  const envPath = resolve(root, '.env.local');
  if (!existsSync(envPath)) return;
  for (const line of readFileSync(envPath, 'utf8').split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (!m) continue;
    const key = m[1];
    let val = m[2].replace(/^['"]|['"]$/g, '');
    if (!process.env[key]) process.env[key] = val;
  }
}

loadEnvLocal();

const key = process.env.AHREFS_API_KEY;
if (!key) {
  console.error('Missing AHREFS_API_KEY. Copy .env.example → .env.local and set the key.');
  process.exit(1);
}

const res = await fetch('https://api.ahrefs.com/v3/subscription-info/limits-and-usage', {
  headers: {
    Authorization: `Bearer ${key}`,
    Accept: 'application/json',
  },
});

if (!res.ok) {
  console.error(`Ahrefs HTTP ${res.status}: ${await res.text()}`);
  process.exit(1);
}

const payload = await res.json();
const u = payload.limits_and_usage;
const now = new Date().toISOString();
const limit = u.units_limit_workspace ?? 0;
const usedWs = u.units_usage_workspace ?? 0;
const usedKey = u.units_usage_api_key ?? 0;
const other = Math.max(0, usedWs - usedKey);
const pctWs = limit ? Number(((usedWs / limit) * 100).toFixed(2)) : 0;
const pctKey = usedWs ? Number(((usedKey / usedWs) * 100).toFixed(2)) : 0;

const data = JSON.parse(readFileSync(dataPath, 'utf8'));
data.meta.generated_at = now;

const ahrefs = data.apis.find((a) => a.id === 'ahrefs');
if (!ahrefs) {
  console.error('ahrefs block missing in apis-usage.json');
  process.exit(1);
}

ahrefs.subscription = {
  ...ahrefs.subscription,
  plan: u.subscription,
  usage_reset_date: u.usage_reset_date,
};

ahrefs.api = {
  source: 'ahrefs_v3_subscription_info',
  fetched_at: now,
  units_limit_workspace: u.units_limit_workspace,
  units_usage_workspace: usedWs,
  units_remaining_workspace: limit ? limit - usedWs : null,
  pct_workspace: pctWs,
  units_usage_api_key: usedKey,
  units_usage_other_keys_or_ui: other,
  pct_this_key_of_workspace: pctKey,
  units_limit_api_key: u.units_limit_api_key,
  api_key_expiration_date: u.api_key_expiration_date,
  endpoint: 'GET /v3/subscription-info/limits-and-usage',
};

ahrefs.breakdown = [
  {
    source: 'api_key_orbit_primary',
    label: 'API key principal (Orbit / proxy)',
    units: usedKey,
    share_pct: pctKey,
    notes: 'Consumo atribuible a la key usada por el ecosistema Orbit',
  },
  {
    source: 'other_keys_ui_mcp',
    label: 'Otras keys / UI / MCP / integraciones',
    units: other,
    share_pct: Number((100 - pctKey).toFixed(2)),
    notes: 'Diferencia workspace − esta key. Incluye panel Ahrefs, otras keys y posibles clientes MCP',
  },
];

if (ahrefs.ui_panel?.api_units) {
  ahrefs.ui_panel.api_units = { used: usedWs, limit };
}

writeFileSync(dataPath, `${JSON.stringify(data, null, 2)}\n`, 'utf8');
console.log('Updated public/data/apis-usage.json');
console.log(`Workspace: ${usedWs.toLocaleString()} / ${limit.toLocaleString()} (${pctWs}%)`);
console.log(`This key:  ${usedKey.toLocaleString()} (${pctKey}% of workspace)`);
console.log(`Other:     ${other.toLocaleString()}`);
