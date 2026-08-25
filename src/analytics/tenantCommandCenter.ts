/**
 * Tenant Command Center admin API — shared wire contract (§6.0b / §6.0c).
 */

import type { MissionControlFunnelSummary } from './missionControl.js';

/** Payment-flow stacked-bar lane ids (PAYMENT_LANE_COLORS keys). */
export type TenantCommandCenterLaneId =
  | 'created'
  | 'paid'
  | 'pending'
  | 'actionRequired'
  | 'finished';

/** Alias for plan `LaneId` naming. */
export type LaneId = TenantCommandCenterLaneId;

export type TenantCommandCenterAccessTier = 'summary' | 'full';

export type TenantCommandCenterHealthStatus = 'healthy' | 'degraded' | 'critical';

export type TenantCommandCenterIncidentSeverity = 'high' | 'medium' | 'low';

export type TenantCommandCenterActivityTone = 'success' | 'warn' | 'danger' | 'info';

export type TenantCommandCenterFreshnessStatus = 'ok' | 'warn' | 'error';

/** Money KPI / table cell — cents + display string for UI. */
export interface MoneyMetric {
  readonly valueCents: number;
  readonly currency: string;
  readonly displayValue: string;
}

/** Integer count KPI. */
export interface CountMetric {
  readonly value: number;
  readonly displayValue: string;
}

/** Percentage KPI (0–100 scale unless noted by consumer). */
export interface PercentMetric {
  readonly value: number;
  readonly displayValue: string;
}

export interface TenantCommandCenterHealth {
  readonly status: TenantCommandCenterHealthStatus;
  readonly message: string;
}

export interface TenantCommandCenterKpis {
  readonly revenueToday: MoneyMetric;
  readonly pendingPayments: CountMetric;
  readonly pendingRefunds: CountMetric;
  readonly kiosksOnlinePct: PercentMetric;
  /** Human label e.g. "126 z 128 online" for tcc-kpi-kiosks. */
  readonly kiosksOnlineLabel: string;
  /**
   * Active sales-point count (virtual identities). Kept on the wire for
   * drill-downs; Overview strip always uses paidOrders / avgOrder (not online %).
   */
  readonly activeSalesPoints: CountMetric;
  /** Paid / completed orders in the selected TCC window (commerce rollup). */
  readonly paidOrders: CountMetric;
  /** Average order value for the window (revenue ÷ paidOrders; 0 when no orders). */
  readonly avgOrderValue: MoneyMetric;
  readonly conversionRate: PercentMetric;
}

export interface TenantCommandCenterPaymentLane {
  readonly id: TenantCommandCenterLaneId;
  readonly label: string;
  readonly count: number;
  readonly pct: number;
  readonly pctLabel: string;
}

export interface TenantCommandCenterPaymentFlowSummary {
  readonly conversionRatePct: string;
  readonly conversionDeltaLabel: string;
}

export interface TenantCommandCenterIncident {
  readonly id: string;
  readonly severity: TenantCommandCenterIncidentSeverity;
  readonly title: string;
  readonly ageLabel: string;
  /**
   * Deep link into commercial Události (`/:tenant/success-incident-centre/...`).
   * Omitted when `incident_centre_ui` is not entitled (default OFF) so operators
   * are not sent into a dead route — platform DEV uses `/dev/success-incident-centre`.
   */
  readonly href?: string;
}

export interface TenantCommandCenterTopKiosk {
  readonly rank: number;
  readonly salesPointId: number;
  readonly name: string;
  readonly revenue: MoneyMetric;
  readonly deltaPct: number;
}

export interface TenantCommandCenterActivityItem {
  readonly id: string;
  readonly time: string;
  readonly kind: string;
  readonly title: string;
  readonly detail: string;
  readonly tone: TenantCommandCenterActivityTone;
}

export interface TenantCommandCenterFreshness {
  readonly status: TenantCommandCenterFreshnessStatus;
  readonly lastUpdatedAt: string;
  readonly refreshMinutes: number;
}

/** Daily GMV point for Tržby v čase (same window as payment lanes / KPIs). */
export interface TenantCommandCenterRevenueDay {
  readonly date: string;
  readonly revenueCents: number;
  readonly orderCount: number;
}

/** Ranked product for Top produkty card. */
export interface TenantCommandCenterTopProduct {
  readonly productId: number;
  readonly name: string;
  readonly revenueCents: number;
  readonly orderCount: number;
  readonly quantity: number;
}

/** Funnel aggregate — same shape as Mission Control for FE adapter reuse. */
export type TenantCommandCenterFunnelSummary = MissionControlFunnelSummary;

/**
 * Aggregate wire for `GET /api/{tenant}/v1/admin/command-center/tenant`.
 * Field checklist: plan §6.0c; exact DTO: §6.1.
 * Chart fields (funnel / revenueByDay / topProducts) share the request date window.
 */
export interface TenantCommandCenterWire {
  readonly accessTier: TenantCommandCenterAccessTier;
  readonly health: TenantCommandCenterHealth;
  readonly kpis: TenantCommandCenterKpis;
  readonly paymentLanes: readonly TenantCommandCenterPaymentLane[];
  readonly paymentFlowSummary: TenantCommandCenterPaymentFlowSummary;
  readonly incidents: readonly TenantCommandCenterIncident[];
  /**
   * Active SIC attention-queue total (§6.0.2). Tenant full tier is P0 only
   * (urgent after “I paid”). Summary tier: `0` (queue not loaded).
   * `GetSuccessIncidentAttentionQueueSummaryUseCase.activeTotal` with audience tenant.
   */
  readonly activeIncidentTotal: number;
  readonly topKiosks: readonly TenantCommandCenterTopKiosk[];
  readonly recentActivity: readonly TenantCommandCenterActivityItem[];
  readonly freshness: TenantCommandCenterFreshness;
  /** Summary-grade: conversion funnel for the selected range (null when unavailable). */
  readonly funnelSummary: TenantCommandCenterFunnelSummary | null;
  /** Summary-grade: daily revenue series for Tržby v čase. */
  readonly revenueByDay: readonly TenantCommandCenterRevenueDay[];
  /** Summary-grade: top products by revenue (empty when no product rollups). */
  readonly topProducts: readonly TenantCommandCenterTopProduct[];
}
