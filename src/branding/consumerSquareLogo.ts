/**
 * Live consumer chrome (customer PWA + pickup) — square logo URLs only.
 *
 * Backend may send additive `wordmarkUrl` on customer-tenants / memberships DTOs;
 * live directory thumbs and tenant chips must ignore it. `applyToCustomerPwa`
 * gating is server-side (null `logoUrl` / `tenantLogoUrl` when flag off).
 */

/** Normalize a square logo stream URL for consumer thumbs/chips; null when absent/blank. */
export function resolveConsumerSquareLogoUrl(value: unknown): string | null {
  if (typeof value !== 'string') {
    return null;
  }
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

export interface ConsumerPublicTenantRow {
  readonly tenantId: number;
  readonly code: string;
  readonly name: string;
  /** Square tenant logo only — never wordmark. */
  readonly logoUrl: string | null;
}

/**
 * Pick public tenant-directory fields from a wire row.
 * Ignores additive `wordmarkUrl` even when present on the payload.
 */
export function normalizeConsumerPublicTenantRow(raw: unknown): ConsumerPublicTenantRow | null {
  if (raw === null || typeof raw !== 'object') {
    return null;
  }
  const row = raw as Record<string, unknown>;
  const { tenantId, code, name } = row;
  if (typeof tenantId !== 'number' || typeof code !== 'string' || typeof name !== 'string') {
    return null;
  }
  return {
    tenantId,
    code,
    name,
    logoUrl: resolveConsumerSquareLogoUrl(row.logoUrl),
  };
}
