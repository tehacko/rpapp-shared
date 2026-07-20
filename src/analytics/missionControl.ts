/**
 * Mission Control admin API — shared wire contract (B0).
 */
export type MissionControlScope = 'all' | 'tenant' | 'tenants';

export type MissionControlSuppressionReason = 'K_ANON' | 'MIXED_CURRENCY';

/** Freshness fields echoed on every MC response (B0-5). */
export interface MissionControlFreshnessFields {
  readonly safeThrough: string | null;
  readonly stale: boolean;
}

export interface MissionControlResponseEnvelope extends MissionControlFreshnessFields {
  readonly scope: MissionControlScope;
  readonly tenantId?: number;
  readonly tenantIds?: readonly number[];
  readonly generatedAt: string;
}

export interface MissionControlKpi {
  readonly id: string;
  readonly label: string;
  readonly value: string;
}

/** Cross-tenant funnel aggregate for DEV Mission Control / Platform CC charts. */
export interface MissionControlFunnelSummary {
  readonly sessionsStarted: number;
  readonly sessionsWithMenuOpened: number;
  readonly sessionsWithProductAdded: number;
  readonly sessionsWithCartViewed: number;
  readonly sessionsWithCheckoutStarted: number;
  readonly sessionsWithPaymentStarted: number;
  readonly sessionsWithPaymentConfirmed: number;
  readonly sessionsAbandoned: number;
  readonly sessionsWithQrDisplayed: number;
  readonly sessionsWithProductSelected: number;
  readonly catalogRate: number;
  readonly productAddedRate: number;
  readonly cartViewedRate: number;
  readonly checkoutStartedRate: number;
  readonly paymentStartedRate: number;
  readonly paymentConfirmedRate: number;
  readonly abandonRate: number;
  readonly lastMetricDate: string | null;
}

export interface MissionControlSummaryResponse extends MissionControlResponseEnvelope {
  readonly kpis: readonly MissionControlKpi[];
  readonly funnel?: MissionControlFunnelSummary;
}

export interface MissionControlSeriesPoint {
  readonly date: string;
  readonly value: number;
}

export interface MissionControlTimeseriesSeries {
  readonly id: string;
  readonly label: string;
  readonly points: readonly MissionControlSeriesPoint[];
  readonly suppressed?: boolean;
  readonly suppressionReason?: MissionControlSuppressionReason;
}

export interface MissionControlTimeseriesResponse extends MissionControlResponseEnvelope {
  readonly series: readonly MissionControlTimeseriesSeries[];
}

export interface MissionControlRevenueMetrics {
  readonly gmvCents: number;
  readonly orderCount: number;
  readonly marginCents: number | null;
  readonly suppressed?: boolean;
  readonly suppressionReason?: MissionControlSuppressionReason;
}

export interface MissionControlRevenueResponse extends MissionControlResponseEnvelope {
  readonly revenue: MissionControlRevenueMetrics;
  readonly periodComparison?: {
    readonly gmvDeltaPct: number | null;
    readonly ordersDeltaPct: number | null;
  };
}

export interface MissionControlTenantRow {
  readonly tenantId: number;
  readonly tenantCode: string;
  readonly tenantName: string;
  readonly gmvCents: number;
  readonly orderCount: number;
  readonly sessionsStarted: number;
  /** Daily GMV mini-series for tenant table sparklines (B-P1-04). */
  readonly gmvTrendPoints?: readonly MissionControlSeriesPoint[];
  readonly suppressed?: boolean;
  readonly suppressionReason?: MissionControlSuppressionReason;
}

export interface MissionControlTenantsResponse extends MissionControlResponseEnvelope {
  readonly rows: readonly MissionControlTenantRow[];
}

export interface MissionControlFreshnessResponse extends MissionControlResponseEnvelope {
  readonly lastMetricDate: string | null;
  readonly rollupInitialized: boolean;
  readonly stalenessDays: number | null;
  readonly rollupLagDays: number | null;
}

/** AN-SLO-10 aligned — mission-control summary p95 budget (ms). */
export const MISSION_CONTROL_SUMMARY_API_P95_BUDGET_MS = 500 as const;

/** Shared p95 budget for MC read endpoints (B0-9). */
export const MISSION_CONTROL_API_P95_BUDGET_MS = 500 as const;

/** B0-CACHE — in-memory TTL for cross-tenant rollup reads (`scope=all|tenants`). */
export const MISSION_CONTROL_CROSS_TENANT_CACHE_TTL_MS = 60_000 as const;

/** B2-REFRESH — optional manual poll interval (no SSE) for Mission Control shell. */
export const MISSION_CONTROL_MANUAL_REFRESH_POLL_MS = 60_000 as const;

/** B2-4 — max concurrent MC data fetches in the admin shell. */
export const MISSION_CONTROL_MAX_PARALLEL_FETCHES = 4 as const;
