export type AlertLevel = 'ok' | 'info' | 'warning' | 'critical';

export interface UsageAlert {
  level: AlertLevel;
  message: string;
}

export interface ApiBlock {
  id: string;
  name: string;
  status: string;
  priority: number;
  billing_model: string;
  controlled_by: string;
  orbit_module?: string;
  why_monitored: string;
  subscription?: {
    plan: string;
    next_billing_date?: string;
    usage_reset_date?: string;
    pay_as_you_go?: boolean;
  };
  api: {
    source?: string;
    fetched_at?: string;
    units_limit_workspace?: number | null;
    units_usage_workspace?: number | null;
    units_remaining_workspace?: number | null;
    pct_workspace?: number;
    units_usage_api_key?: number;
    units_usage_other_keys_or_ui?: number;
    pct_this_key_of_workspace?: number;
    units_limit_api_key?: number | null;
    api_key_expiration_date?: string;
    endpoint?: string;
    note?: string;
  } | null;
  ui_panel?: {
    source: string;
    captured_at: string;
    credits_by_user: { user: string; used: number; limit: number | null }[];
    brand_radar_prompt_checks?: { used_approx: number; limit: number; over_limit: boolean };
    rank_tracker_keywords?: { used: number; limit: number; update_frequency: string };
    site_audit_crawl_credits?: { used: number; limit: number };
    api_units?: { used: number; limit: number };
    projects?: { verified: number; unverified: number; unverified_limit: number };
  };
  breakdown?: {
    source: string;
    label: string;
    units: number;
    share_pct: number;
    notes: string;
  }[];
  traffic_hints?: {
    ip_country_available: boolean;
    planned_enrichment: string;
    samples: unknown[];
  };
  alerts: UsageAlert[];
}

export interface UsageData {
  meta: {
    title: string;
    presenter: string;
    gestion: string;
    duration_minutes: number;
    generated_at: string;
    docs_home: string;
    notes: string;
  };
  trigger_case: {
    provider: string;
    name: string;
    headline: string;
    summary: string;
    billing_model: string;
    orbit_module: string;
    orbit_tables: string[];
    orbit_gateway: string;
    lessons: string[];
  };
  apis: ApiBlock[];
  policy: {
    goals: string[];
    exceptions: { allowed: boolean; approver: string; process: string };
    mcp: { rule: string; docs: string };
    third_party_tools: { owner_discussion: string; topics: string[] };
    monitoring: {
      owner: string;
      channels: string[];
      thresholds_ahrefs_api_pct: { moderate: number; warning: number; critical: number };
      unidentified_spend_protocol: string[];
    };
  };
}
