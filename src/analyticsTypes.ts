export interface LogBucket {
  name: string;
  units: number;
  calls: number;
  paid_calls?: number;
  flag?: string;
  country?: string;
}

export interface TopCall {
  units: number;
  scope: string;
  creator: string;
  agent: string;
  endpoint: string;
  ip: string | null;
  ip_hint: { label: string; region: string; flag: string; country: string };
  at: string;
}

export interface PeriodAnalytics {
  period: { id: string; label: string; from: string; to: string };
  rows: number;
  total_units: number;
  mcp_units: number;
  api_units: number;
  mcp_pct: number;
  days: number;
  per_day: number;
  by_user: LogBucket[];
  by_scope: LogBucket[];
  by_endpoint: LogBucket[];
  by_agent: LogBucket[];
  by_day: { day: string; units: number; calls: number }[];
  by_region: LogBucket[];
  top_calls: TopCall[];
}

export interface AnalyticsData {
  meta: {
    generated_at: string;
    users: {
      accesos: { token: string; email: string; role: string; channel: string };
      esteban: { token: string; email: string; role: string; channel: string };
    };
  };
  attack: { title: string; bullets: string[] };
  compare: {
    previous: {
      units: number;
      mcp_units: number;
      mcp_pct: number;
      per_day: number;
      days: number;
      accesos: number;
      orbit: number;
    };
    current: {
      units: number;
      mcp_units: number;
      mcp_pct: number;
      per_day: number;
      days: number;
      accesos: number;
      orbit: number;
    };
    burn_ratio: number;
  };
  current: PeriodAnalytics;
  previous: PeriodAnalytics;
}
