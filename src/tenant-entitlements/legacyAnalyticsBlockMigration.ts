import type { SimpleEntitlementState } from './types.js';

/** Retired v6 analytics cluster keys — read for one-release DB/policy migration only. */
export const RETIRED_ANALYTICS_ENTITLEMENT_BLOCK_KEYS = [
  'analytics_summary',
  'analytics_detailed',
  'mission_control',
  'analytics_pii',
  'customer_behavior_funnels',
  'analytics_benchmark',
] as const;

export type RetiredAnalyticsEntitlementBlockKey =
  (typeof RETIRED_ANALYTICS_ENTITLEMENT_BLOCK_KEYS)[number];

export function isRetiredAnalyticsEntitlementBlockKey(
  blockKey: string,
): blockKey is RetiredAnalyticsEntitlementBlockKey {
  return (RETIRED_ANALYTICS_ENTITLEMENT_BLOCK_KEYS as readonly string[]).includes(blockKey);
}

function isLegacyActiveSimpleState(state: SimpleEntitlementState | undefined): boolean {
  return state === 'on' || state === 'softOffVisible' || state === 'softOffHidden';
}

function isLegacyActiveRuntimeMode(runtimeMode: string): boolean {
  return runtimeMode === 'ALWAYS_ON' || runtimeMode === 'ENABLED';
}

/** Přehled tab — preserves legacy OR gate (analytics_summary ∨ mission_control). */
export function shouldEnableAnalyticsOverviewFromLegacySimpleStates(
  legacyStates: Partial<Record<string, SimpleEntitlementState>>,
): boolean {
  return (
    isLegacyActiveSimpleState(legacyStates.mission_control) ||
    isLegacyActiveSimpleState(legacyStates.analytics_summary)
  );
}

/** Analytika tab — any legacy analytics explore/summary/detailed child. */
export function shouldEnableAnalyticsExploreFromLegacySimpleStates(
  legacyStates: Partial<Record<string, SimpleEntitlementState>>,
): boolean {
  return (
    isLegacyActiveSimpleState(legacyStates.analytics_summary) ||
    isLegacyActiveSimpleState(legacyStates.analytics_detailed) ||
    isLegacyActiveSimpleState(legacyStates.analytics_pii) ||
    isLegacyActiveSimpleState(legacyStates.customer_behavior_funnels) ||
    isLegacyActiveSimpleState(legacyStates.analytics_benchmark)
  );
}

/** Policy-row migration for resolver/backfill (runtimeMode axes). */
export function shouldEnableAnalyticsOverviewFromLegacyPolicyRows(
  rowsByKey: ReadonlyMap<string, { readonly runtimeMode: string }>,
): boolean {
  const missionControl = rowsByKey.get('mission_control');
  const summary = rowsByKey.get('analytics_summary');
  return (
    (missionControl !== undefined && isLegacyActiveRuntimeMode(missionControl.runtimeMode)) ||
    (summary !== undefined && isLegacyActiveRuntimeMode(summary.runtimeMode))
  );
}

export function shouldEnableAnalyticsExploreFromLegacyPolicyRows(
  rowsByKey: ReadonlyMap<string, { readonly runtimeMode: string }>,
): boolean {
  for (const key of [
    'analytics_summary',
    'analytics_detailed',
    'analytics_pii',
    'customer_behavior_funnels',
    'analytics_benchmark',
  ] as const) {
    const row = rowsByKey.get(key);
    if (row !== undefined && isLegacyActiveRuntimeMode(row.runtimeMode)) {
      return true;
    }
  }
  return false;
}
