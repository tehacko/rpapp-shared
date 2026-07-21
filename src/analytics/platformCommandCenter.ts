/**
 * Platform Command Center (dev) API — shared wire contract (§6.0b / §6.0d).
 */
import type { MissionControlSuppressionReason } from './missionControl.js';

export type PlatformCommandCenterHealthStatus = 'healthy' | 'degraded' | 'critical';

export type PlatformServiceStatus = 'operational' | 'degraded' | 'limited' | 'unavailable';

export type PlatformIncidentSeverity = 'high' | 'medium' | 'low';

export type PlatformQueueStatus = 'ok' | 'warn' | 'danger';

export type PlatformNotificationTone = 'success' | 'warn' | 'danger' | 'info';

export type PlatformRegionStatus = 'operational' | 'degraded' | 'unavailable';

export interface PlatformCommandCenterHealth {
  readonly status: PlatformCommandCenterHealthStatus;
  readonly message?: string;
}

export interface PlatformCommandCenterAvailability {
  readonly pct: number;
  /**
   * Period-over-period change in percentage points.
   * Omit or null when unknown — UI must not invent a trend.
   */
  readonly deltaPct?: number | null;
}

export interface PlatformCommandCenterKiosks {
  readonly activeCount: number;
  /** Absolute count change vs prior window; omit/null when unknown. */
  readonly delta?: number | null;
}

export interface PlatformServiceRow {
  readonly id: string;
  readonly name: string;
  readonly status: PlatformServiceStatus;
  readonly detail: string;
}

export interface PlatformCommandCenterSeriesPoint {
  readonly date: string;
  readonly value: number;
}

/** Single named series; null on wire means stub / ScreenState empty. */
export interface PlatformCommandCenterSeries {
  readonly id: string;
  readonly label: string;
  readonly points: readonly PlatformCommandCenterSeriesPoint[];
}

export interface PlatformActiveIncident {
  readonly id: string;
  readonly severity: PlatformIncidentSeverity;
  readonly title: string;
  readonly ageLabel: string;
  readonly href?: string;
}

export interface PlatformInfraGauges {
  readonly cpuPct: number;
  readonly memoryPct: number;
  /** Honest null when OS disk probe is unavailable (prefer over fake 0). */
  readonly diskPct: number | null;
}

export interface PlatformTopTenantRow {
  readonly tenantId: number;
  readonly tenantCode: string;
  readonly tenantName: string;
  readonly gmvCents: number;
  readonly orderCount: number;
  readonly suppressed?: boolean;
  readonly suppressionReason?: MissionControlSuppressionReason;
}

export interface PlatformPaymentMethodSegment {
  readonly id: string;
  readonly label: string;
  readonly count: number;
  readonly pct: number;
}

export interface PlatformRegionRow {
  readonly id: string;
  readonly name: string;
  readonly status: PlatformRegionStatus;
  readonly detail?: string;
}

export interface PlatformDeploymentRow {
  readonly id: string;
  readonly name: string;
  readonly environment: string;
  readonly status: string;
  readonly deployedAt: string;
}

export interface PlatformQueueRow {
  readonly id: string;
  readonly name: string;
  readonly depth: number;
  readonly status: PlatformQueueStatus;
}

export interface PlatformNotificationRow {
  readonly id: string;
  readonly title: string;
  readonly detail: string;
  readonly time: string;
  readonly tone: PlatformNotificationTone;
}

export interface PlatformCommandCenterOps {
  readonly health: PlatformCommandCenterHealth;
  readonly availability: PlatformCommandCenterAvailability;
  readonly kiosks: PlatformCommandCenterKiosks;
  readonly errors24h: number;
  /** Absolute error-count change vs prior 24h; omit/null when unknown. */
  readonly errors24hDelta?: number | null;
  readonly services: readonly PlatformServiceRow[];
  readonly requestVolumeSeries: PlatformCommandCenterSeries | null;
  readonly errorRateSeries: PlatformCommandCenterSeries | null;
  readonly activeIncidents: readonly PlatformActiveIncident[];
  readonly infra: PlatformInfraGauges;
  readonly topTenants: readonly PlatformTopTenantRow[];
  readonly regions: readonly PlatformRegionRow[] | null;
  readonly deployments: readonly PlatformDeploymentRow[] | null;
  readonly queues: readonly PlatformQueueRow[] | null;
  readonly notifications: readonly PlatformNotificationRow[] | null;
}

export interface PlatformCommandCenterTenants {
  readonly activeCount: number;
  /** Absolute count change vs prior window; omit/null when unknown. */
  readonly delta?: number | null;
}

export interface PlatformCommandCenterOverview {
  /** Order count for the MC-aligned 7-day UTC window — UI label is operator-facing "Orders (last 7 days)". */
  readonly transactions24h: number;
  /** Absolute transaction-count change vs prior 24h; omit/null when unknown. */
  readonly transactions24hDelta?: number | null;
  readonly paymentMethodMix: readonly PlatformPaymentMethodSegment[];
}

/**
 * Aggregate wire for `GET /api/v1/dev/platform/command-center`.
 * Field checklist: plan §6.0d; widget map: §7.2.
 */
export interface PlatformCommandCenterWire {
  readonly ops: PlatformCommandCenterOps;
  readonly tenants: PlatformCommandCenterTenants;
  readonly overview: PlatformCommandCenterOverview;
}
