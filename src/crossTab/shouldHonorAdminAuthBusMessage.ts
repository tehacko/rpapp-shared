/**
 * Structural admin auth-bus message shape for honor filtering (G21 / XT-G12).
 * Kept local so this module does not circular-import `./index.js`.
 * Compatible with `AdminAuthCrossTabMessage`.
 */
export type AdminAuthHonorMessage = {
  readonly type: string;
  readonly tenantCode: string;
  readonly scope?: 'platform' | 'tenant';
};

/**
 * Session context for admin auth-bus filtering (G21 / XT-G12).
 * Pure inputs — callers supply session state; no JWT/cookie reads here
 * and bus payloads must never carry JWTs.
 */
export interface ShouldHonorAdminAuthBusMessageContext {
  /** True when this tab has an authenticated admin session. */
  readonly hasSession: boolean;
  /**
   * Home / scoped tenant code when known.
   * `null` while authenticated but home is still pending (write race).
   */
  readonly homeTenantCode: string | null;
}

/**
 * G21 — admin auth-bus filter (port of customer `shouldHonorAuthBusMessage`):
 * - `scope: 'platform'` always honored (not dropped by stale tenant filter)
 * - pending (session + homeTenantCode missing): honor login/session-refreshed
 *   for URL tenant; ignore other tenant-scoped messages
 * - home set: honor only messages whose tenantCode === homeTenantCode
 * - guest (no session): honor messages for the URL tenant
 */
export function shouldHonorAdminAuthBusMessage(
  message: AdminAuthHonorMessage,
  urlTenantCode: string,
  context: ShouldHonorAdminAuthBusMessageContext
): boolean {
  if (message.scope === 'platform') {
    return true;
  }

  const { hasSession, homeTenantCode } = context;

  if (hasSession && homeTenantCode === null) {
    if (message.type === 'login' || message.type === 'session-refreshed') {
      return message.tenantCode === urlTenantCode;
    }
    return false;
  }

  const scopeTenant = homeTenantCode ?? urlTenantCode;
  return message.tenantCode === scopeTenant;
}
