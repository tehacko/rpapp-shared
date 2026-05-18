/**
 * Analytics explore caps — shared across backend and admin UI.
 *
 * Single source of truth for date-span limits, export row caps, and
 * drilldown pagination defaults (plan v1.3.1).
 */

export type ExploreCallerKind =
  | 'admin_default'
  | 'admin_detailed_manage'
  | 'dev_single_tenant'
  | 'dev_scope_all';

export interface ExploreCapsForCaller {
  readonly maxDateSpanDays: number;
  readonly maxExportRows: number;
  readonly clampLast5Years: boolean;
}

export const ANALYTICS_EXPLORE_CAPS = Object.freeze({
  admin_default: Object.freeze({
    maxDateSpanDays: 90,
    maxExportRows: 50_000,
    clampLast5Years: true,
  }),
  admin_detailed_manage: Object.freeze({
    maxDateSpanDays: 1825,
    maxExportRows: 50_000,
    clampLast5Years: false,
  }),
  dev_single_tenant: Object.freeze({
    maxDateSpanDays: 1825,
    maxExportRows: 50_000,
    clampLast5Years: false,
  }),
  dev_scope_all: Object.freeze({
    maxDateSpanDays: 31,
    maxExportRows: 10_000,
    clampLast5Years: true,
  }),
} as const) satisfies Readonly<Record<ExploreCallerKind, ExploreCapsForCaller>>;

export const ANALYTICS_MAX_DISTINCT_EVENT_NAMES_PER_SESSION = 40 as const;
export const ANALYTICS_DRILLDOWN_DEFAULT_PAGE_SIZE = 50 as const;
export const ANALYTICS_DRILLDOWN_MAX_PAGE_SIZE = 200 as const;
export const ANALYTICS_EXPLORE_SLOW_QUERY_MS = 800 as const;
export const ANALYTICS_EXPLORE_STATEMENT_TIMEOUT_MS = 20_000 as const;

export function computeUtcDateSpanDaysInclusive(
  startDate: string,
  endDate: string,
): number {
  const start = Date.parse(`${startDate}T00:00:00.000Z`);
  const end = Date.parse(`${endDate}T00:00:00.000Z`);
  if (!Number.isFinite(start) || !Number.isFinite(end) || end < start) {
    return Number.POSITIVE_INFINITY;
  }
  return Math.floor((end - start) / 86_400_000) + 1;
}
