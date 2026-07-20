/**
 * Dev Analytika admin API — shared wire contract (Phase 1.1).
 */
export type DevAnalyticsViewsScope = 'all' | 'tenant' | 'tenants';

export interface DevAnalyticsFeaturesWire {
  readonly rollupViewsEnabled: boolean;
  readonly overviewRevampEnabled: boolean;
  readonly benchmarkModuleEnabled: boolean;
  readonly advancedExploreEnabled: boolean;
  readonly missionControlEnabled?: boolean;
  readonly funnelSessionBannerEnabled?: boolean;
}

export interface DevAnalyticsKpiDelta {
  readonly current: number;
  readonly previous: number | null;
  readonly deltaPct: number | null;
}

export interface DevAnalyticsOverviewKpis {
  readonly sessionsStarted: DevAnalyticsKpiDelta | number;
  readonly orders: DevAnalyticsKpiDelta | number;
  readonly gmvCents: DevAnalyticsKpiDelta | number;
  readonly paymentConfirmedRate: DevAnalyticsKpiDelta | number;
  readonly currencyCode: string | null;
  readonly revenueSuppressed?: boolean;
  readonly suppressionReason?: 'MIXED_CURRENCY' | 'K_ANON';
}

export interface DevAnalyticsTimeseriesPoint {
  readonly date: string; // YYYY-MM-DD
  readonly value: number;
  readonly previousValue?: number | null;
}

export interface DevAnalyticsTopTenantRow {
  readonly tenantId: number;
  readonly tenantName: string;
  readonly revenueCents: number;
  readonly orderCount: number;
  readonly currencyCode: string | null;
}

export interface DevAnalyticsOverviewWire {
  readonly scope: DevAnalyticsViewsScope;
  readonly tenantId?: number;
  readonly tenantIds?: readonly number[];
  readonly from: string;
  readonly to: string;
  readonly generatedAt: string;
  readonly kpis: DevAnalyticsOverviewKpis;
  readonly revenueSeries: readonly DevAnalyticsTimeseriesPoint[];
  readonly funnelMini?: {
    readonly sessionsStarted: number;
    readonly paymentConfirmedRate: number;
    readonly abandonRate: number;
  };
  readonly topTenants: readonly DevAnalyticsTopTenantRow[];
  readonly byCategory?: readonly {
    readonly name: string;
    readonly amountCents: number;
    readonly count: number;
  }[];
  readonly safeThrough?: string | null;
}

export interface DevAnalyticsFunnelSummaryWire {
  readonly scope: DevAnalyticsViewsScope;
  readonly from: string;
  readonly to: string;
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
  readonly periodComparison?: {
    readonly sessionsStarted: {
      readonly current: number;
      readonly previous: number;
      readonly deltaPct: number | null;
    };
    readonly paymentConfirmedRate: {
      readonly current: number;
      readonly previous: number;
      readonly deltaPct: number | null;
    };
    readonly abandonRate: {
      readonly current: number;
      readonly previous: number;
      readonly deltaPct: number | null;
    };
  };
  readonly steps?: readonly {
    readonly id: string;
    readonly label: string;
    readonly count: number;
    readonly rate: number;
  }[];
}

export interface DevAnalyticsCommerceWire {
  readonly scope: DevAnalyticsViewsScope;
  readonly from: string;
  readonly to: string;
  readonly currencyCode: string | null;
  readonly revenueSuppressed?: boolean;
  readonly suppressionReason?: 'MIXED_CURRENCY';
  readonly points: readonly DevAnalyticsTimeseriesPoint[];
  readonly totals: {
    readonly orderCount: number;
    readonly gmvCents: number;
    readonly donationCount: number;
    readonly donationTotalCents: number;
  };
}

export interface DevAnalyticsSnapshotRow {
  readonly tenantId: number;
  readonly tenantName?: string;
  readonly salesPointId: number | null;
  readonly salesPointName?: string;
  readonly productId?: number | null;
  readonly metricKey: string;
  readonly metricValue: number;
  readonly metricDate: string;
}

export interface DevAnalyticsSnapshotsWire {
  readonly scope: DevAnalyticsViewsScope;
  readonly from: string;
  readonly to: string;
  readonly rows: readonly DevAnalyticsSnapshotRow[];
}

export interface DevAnalyticsPaymentMixRow {
  readonly method: string;
  readonly count: number;
  readonly amountCents: number;
  readonly share: number;
}

export interface DevAnalyticsPaymentMixWire {
  readonly scope: DevAnalyticsViewsScope;
  readonly from: string;
  readonly to: string;
  readonly rows: readonly DevAnalyticsPaymentMixRow[];
  readonly currencyCode: string | null;
}

export interface DevAnalyticsFreshnessWire {
  readonly scope: DevAnalyticsViewsScope;
  readonly safeThrough: string | null;
  readonly lagMs: number | null;
  readonly status: 'ok' | 'warn' | 'error';
  readonly perTenant?: readonly {
    readonly tenantId: number;
    readonly safeThrough: string | null;
    readonly lagMs: number | null;
  }[];
}

export interface DevAnalyticsIngestQualityWire {
  readonly scope: DevAnalyticsViewsScope;
  readonly windowHours: number;
  readonly total: number;
  readonly rejectionsByReason: Readonly<Record<string, number>>;
  readonly rows: readonly {
    readonly reason: string;
    readonly count: number;
    readonly lastSeenAt: string;
    readonly fieldPath?: string;
  }[];
}

export interface DevAnalyticsEventGovernanceCatalogWire {
  readonly scope: DevAnalyticsViewsScope;
  readonly events: readonly {
    readonly name: string;
    readonly tier: string;
    readonly piiTags: readonly string[];
  }[];
}

export interface DevAnalyticsBenchmarkWire {
  readonly scope: DevAnalyticsViewsScope;
  readonly from: string;
  readonly to: string;
  readonly cohorts: readonly {
    readonly id: string;
    readonly label: string;
    readonly value: number;
    readonly suppressed: boolean;
    readonly suppressionReason?: 'K_ANON' | 'MIXED_CURRENCY';
  }[];
}

export interface DevAnalyticsTransactionRow {
  readonly id: string;
  readonly tenantId?: number;
  readonly amountMinor: number;
  readonly status: string;
  readonly kioskLabel?: string | null;
  readonly customerEmail?: string | null;
  readonly customerPhone?: string | null;
  readonly customerName?: string | null;
  readonly createdAt?: string;
}

export interface DevAnalyticsTransactionsWire {
  readonly scope: DevAnalyticsViewsScope;
  readonly rows: readonly DevAnalyticsTransactionRow[];
  readonly piiRedacted: boolean;
  readonly rowCap: number;
  readonly transactionsPolicy: {
    readonly allowPiiColumns: boolean;
    readonly rowCap: number;
  };
  readonly tenantPickerCap: number;
}

export interface DevAnalyticsScopeBadge {
  readonly kind: DevAnalyticsViewsScope;
  readonly label: string;
  readonly tenantCount?: number;
}
