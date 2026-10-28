/**
 * Package F — structured client access deny kinds (Spec F v1.1 §3.1–§3.3).
 * Wire values for `details.entitlementDenials[].kind` and Option A `blockDenyKinds`.
 * Catalog stays v14/60 — this module adds no block keys and does not change ENFORCE.
 */

export const CLIENT_ACCESS_DENY_KINDS = [
  'COMMERCIAL',
  'READINESS',
  'TECHNICAL',
  'HARD_OFF',
] as const;

export type ClientAccessDenyKind = (typeof CLIENT_ACCESS_DENY_KINDS)[number];

/**
 * Full client presentation axes (Spec §3.1).
 * Wire kinds are a subset; RBAC / SECURITY / TENANT_SCOPE / TRANSIENT / UNKNOWN
 * remain separate auth/error axes and are never collapsed into COMMERCIAL.
 */
export type ClientAccessPresentationState =
  | 'AVAILABLE'
  | 'COMMERCIAL'
  | 'RBAC'
  | 'READINESS'
  | 'TECHNICAL'
  | 'HARD_OFF'
  | 'TENANT_SCOPE'
  | 'SECURITY'
  | 'TRANSIENT'
  | 'UNKNOWN';

export function isClientAccessDenyKind(value: unknown): value is ClientAccessDenyKind {
  return (
    typeof value === 'string' &&
    (CLIENT_ACCESS_DENY_KINDS as readonly string[]).includes(value)
  );
}

/** Explain-only wire item (HTTP 403 details / snapshot metadata). */
export interface EntitlementDenialItem {
  readonly blockKey: string;
  readonly kind: ClientAccessDenyKind;
}

export interface ResolveClientAccessPresentationInput {
  /**
   * Structured entitlement denial kinds from wire/snapshot (may be empty).
   * Accepts raw strings so parsers can pass wire values without casting;
   * unrecognized non-empty strings poison sole-COMMERCIAL (no upgrade).
   */
  readonly entitlementDenyKinds?: readonly string[] | null;
  /** True when error code is INSUFFICIENT_PERMISSIONS / clipped capability. */
  readonly rbacDenied?: boolean;
  /** True when MFA / step-up required. */
  readonly securityDenied?: boolean;
  /** True when URL tenant outside session / unresolved scope. */
  readonly tenantScopeDenied?: boolean;
  /** True for network/5xx / unclassified transport failure. */
  readonly transientFailure?: boolean;
  /**
   * When access is allowed (entitled + no blocking axis).
   * If true, presentation is AVAILABLE regardless of residual metadata.
   */
  readonly available?: boolean;
}

/**
 * Collect recognized wire kinds from denial items (order preserved, deduped).
 */
export function collectClientAccessDenyKinds(
  denials: readonly EntitlementDenialItem[] | null | undefined,
): readonly ClientAccessDenyKind[] {
  if (denials === null || denials === undefined || denials.length === 0) {
    return [];
  }
  const seen = new Set<ClientAccessDenyKind>();
  const out: ClientAccessDenyKind[] = [];
  for (const item of denials) {
    if (!isClientAccessDenyKind(item.kind) || seen.has(item.kind)) {
      continue;
    }
    seen.add(item.kind);
    out.push(item.kind);
  }
  return out;
}

/**
 * Maps structured deny axes → client presentation state (Spec §3.1 + §3.3).
 *
 * Precedence:
 * 1. `available` → AVAILABLE
 * 2. Auth/error axes when flagged: SECURITY → TENANT_SCOPE → RBAC → TRANSIENT
 *    (existing codes; F must not reclassify them as commercial)
 * 3. Among recognized wire kinds: HARD_OFF → READINESS → TECHNICAL → sole COMMERCIAL
 * 4. Missing metadata / unrecognized kinds / mixed COMMERCIAL+other → UNKNOWN
 *
 * Upgrade CTA only when result is authoritatively COMMERCIAL alone
 * (`shouldShowCommercialUpgradeCta`).
 */
export function resolveClientAccessPresentation(
  input: ResolveClientAccessPresentationInput,
): ClientAccessPresentationState {
  if (input.available === true) {
    return 'AVAILABLE';
  }
  if (input.securityDenied === true) {
    return 'SECURITY';
  }
  if (input.tenantScopeDenied === true) {
    return 'TENANT_SCOPE';
  }
  if (input.rbacDenied === true) {
    return 'RBAC';
  }
  if (input.transientFailure === true) {
    return 'TRANSIENT';
  }

  const raw = input.entitlementDenyKinds ?? [];
  const kindSet = new Set<ClientAccessDenyKind>();
  let hasUnrecognizedKind = false;
  for (const value of raw) {
    if (isClientAccessDenyKind(value)) {
      kindSet.add(value);
    } else if (typeof value === 'string' && value.length > 0) {
      hasUnrecognizedKind = true;
    }
  }

  if (kindSet.size === 0) {
    return 'UNKNOWN';
  }
  if (kindSet.has('HARD_OFF')) {
    return 'HARD_OFF';
  }
  if (kindSet.has('READINESS')) {
    return 'READINESS';
  }
  if (kindSet.has('TECHNICAL')) {
    return 'TECHNICAL';
  }
  if (kindSet.has('COMMERCIAL') && kindSet.size === 1 && !hasUnrecognizedKind) {
    return 'COMMERCIAL';
  }
  // COMMERCIAL mixed with unrecognized wire noise, or empty commercial-only path failed.
  return 'UNKNOWN';
}

/** True only when presentation is authoritatively COMMERCIAL-alone (Spec §3.3). */
export function shouldShowCommercialUpgradeCta(
  state: ClientAccessPresentationState,
): boolean {
  return state === 'COMMERCIAL';
}
