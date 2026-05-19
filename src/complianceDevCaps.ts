/**
 * Dev compliance scope caps — shared across backend and admin UI.
 */
export type ComplianceDevScopeKind = 'dev_single_tenant' | 'dev_scope_all';

export interface ComplianceDevCapsForScope {
  readonly maxDateSpanDays: number;
  readonly maxPageSize: number;
}

export const COMPLIANCE_DEV_CAPS = Object.freeze({
  dev_single_tenant: Object.freeze({
    maxDateSpanDays: 1825,
    maxPageSize: 100,
  }),
  dev_scope_all: Object.freeze({
    maxDateSpanDays: 31,
    maxPageSize: 50,
  }),
} as const) satisfies Readonly<Record<ComplianceDevScopeKind, ComplianceDevCapsForScope>>;
