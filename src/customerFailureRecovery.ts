/**
 * Customer PWA failure recovery deep-link URL builder (D6, D9).
 *
 * Canonical shape: `/:tenantCode/post-kiosk-failure?token=…&reason=…`
 * Route name is historical; consumers include kiosk QR and phone-first shareable links.
 */

export type FailureRecoveryReason =
  | 'EXPIRED'
  | 'CANCELLED'
  | 'GATEWAY_ERROR'
  | 'NETWORK_ERROR'
  | 'UNKNOWN';

export interface BuildFailureRecoveryUrlInput {
  readonly customerPwaBaseUrl: string;
  readonly tenantCode: string;
  readonly reason: FailureRecoveryReason;
  /** Opaque recovery token — never include raw paymentId in query. */
  readonly token?: string;
}

function joinBaseAndTenant(baseUrl: string, tenantCode: string): string {
  const cleaned = baseUrl.replace(/\/+$/, '');
  return `${cleaned}/${encodeURIComponent(tenantCode)}`;
}

export function buildFailureRecoveryUrl(input: BuildFailureRecoveryUrlInput): string {
  const base = joinBaseAndTenant(input.customerPwaBaseUrl, input.tenantCode);
  const qs = new URLSearchParams();
  qs.set('reason', input.reason);
  if (input.token !== undefined && input.token.length > 0) {
    qs.set('token', input.token);
  }
  return `${base}/post-kiosk-failure?${qs.toString()}`;
}
