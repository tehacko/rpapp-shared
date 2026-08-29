import { describe, expect, it } from '@jest/globals';
import {
  shouldEnableAnalyticsExploreFromLegacyPolicyRows,
  shouldEnableAnalyticsExploreFromLegacySimpleStates,
  shouldEnableAnalyticsOverviewFromLegacyPolicyRows,
  shouldEnableAnalyticsOverviewFromLegacySimpleStates,
} from '../legacyAnalyticsBlockMigration.js';

function policyRows(
  entries: ReadonlyArray<[string, string]>,
): ReadonlyMap<string, { readonly runtimeMode: string }> {
  return new Map(entries.map(([key, runtimeMode]) => [key, { runtimeMode }]));
}

describe('legacyAnalyticsBlockMigration', () => {
  it('overview ON for legacy mission_control OR analytics_summary (Přehled OR gate)', () => {
    expect(shouldEnableAnalyticsOverviewFromLegacySimpleStates({ mission_control: 'on' })).toBe(true);
    expect(shouldEnableAnalyticsOverviewFromLegacySimpleStates({ analytics_summary: 'on' })).toBe(
      true,
    );
    expect(
      shouldEnableAnalyticsOverviewFromLegacySimpleStates({
        mission_control: 'off',
        analytics_summary: 'off',
      }),
    ).toBe(false);
  });

  it('explore ON for legacy summary or any detailed-cluster child', () => {
    expect(shouldEnableAnalyticsExploreFromLegacySimpleStates({ analytics_summary: 'on' })).toBe(
      true,
    );
    expect(shouldEnableAnalyticsExploreFromLegacySimpleStates({ analytics_detailed: 'on' })).toBe(
      true,
    );
    expect(
      shouldEnableAnalyticsExploreFromLegacySimpleStates({ customer_behavior_funnels: 'on' }),
    ).toBe(true);
    expect(shouldEnableAnalyticsExploreFromLegacySimpleStates({ analytics_benchmark: 'on' })).toBe(
      true,
    );
    expect(
      shouldEnableAnalyticsExploreFromLegacySimpleStates({
        mission_control: 'on',
        analytics_summary: 'off',
      }),
    ).toBe(false);
  });

  it('overview ON for legacy mission_control OR analytics_summary policy rows (ENABLED runtimeMode)', () => {
    expect(
      shouldEnableAnalyticsOverviewFromLegacyPolicyRows(
        policyRows([['mission_control', 'ENABLED']]),
      ),
    ).toBe(true);
    expect(
      shouldEnableAnalyticsOverviewFromLegacyPolicyRows(
        policyRows([['analytics_summary', 'ENABLED']]),
      ),
    ).toBe(true);
    expect(
      shouldEnableAnalyticsOverviewFromLegacyPolicyRows(
        policyRows([
          ['mission_control', 'DISABLED'],
          ['analytics_summary', 'DISABLED'],
        ]),
      ),
    ).toBe(false);
    expect(
      shouldEnableAnalyticsOverviewFromLegacyPolicyRows(
        policyRows([['analytics_detailed', 'ENABLED']]),
      ),
    ).toBe(false);
  });

  it('explore ON when any legacy analytics-cluster policy row is ENABLED', () => {
    expect(
      shouldEnableAnalyticsExploreFromLegacyPolicyRows(
        policyRows([['analytics_summary', 'ENABLED']]),
      ),
    ).toBe(true);
    expect(
      shouldEnableAnalyticsExploreFromLegacyPolicyRows(
        policyRows([['analytics_detailed', 'ENABLED']]),
      ),
    ).toBe(true);
    expect(
      shouldEnableAnalyticsExploreFromLegacyPolicyRows(
        policyRows([['customer_behavior_funnels', 'ENABLED']]),
      ),
    ).toBe(true);
    expect(
      shouldEnableAnalyticsExploreFromLegacyPolicyRows(
        policyRows([['analytics_benchmark', 'ENABLED']]),
      ),
    ).toBe(true);
    expect(
      shouldEnableAnalyticsExploreFromLegacyPolicyRows(
        policyRows([
          ['mission_control', 'ENABLED'],
          ['analytics_summary', 'DISABLED'],
          ['analytics_detailed', 'DISABLED'],
        ]),
      ),
    ).toBe(false);
    expect(
      shouldEnableAnalyticsExploreFromLegacyPolicyRows(
        policyRows([
          ['analytics_summary', 'DISABLED'],
          ['analytics_pii', 'DISABLED'],
        ]),
      ),
    ).toBe(false);
  });
});
