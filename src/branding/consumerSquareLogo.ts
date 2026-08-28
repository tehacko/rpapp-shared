/**
 * Live consumer chrome (customer PWA + pickup) — square logo URLs only.
 *
 * Backend may send additive `wordmarkUrl` on customer-tenants / memberships DTOs;
 * live directory thumbs and tenant chips must ignore it. `applyToCustomerPwa`
 * gating is server-side (null `logoUrl` / `tenantLogoUrl` when flag off).
 *
 * Logo chip rim: see `logoChipRim.ts` — wire may omit rim fields; normalize
 * always fills the four required slots (defaults when absent/invalid).
 */

import { normalizeLogoChipBackgroundSettings, type LogoChipBackgroundSettings } from './logoChipBackground.js';
import { normalizeLogoChipRimSettings, type LogoChipRimSettings } from './logoChipRim.js';

/** Normalize a square logo stream URL for consumer thumbs/chips; null when absent/blank. */
export function resolveConsumerSquareLogoUrl(value: unknown): string | null {
  if (typeof value !== 'string') {
    return null;
  }
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

export type ConsumerSquareLogoTheme = 'light' | 'dark';

export interface ConsumerSquareLogoSettings {
  readonly logoUrl: string | null;
  readonly logoUrlDark: string | null;
}

export interface ConsumerPublicTenantRow extends LogoChipRimSettings, LogoChipBackgroundSettings {
  readonly tenantId: number;
  readonly code: string;
  readonly name: string;
  /** Square tenant logo only — never wordmark. */
  readonly logoUrl: string | null;
  /** Optional dark-regime square logo; falls back to {@link logoUrl} when absent. */
  readonly logoUrlDark: string | null;
}

/**
 * Resolve the square logo URL for the active theme.
 * Light theme: `logoUrl` → `logoUrlDark` → null.
 * Dark theme: `logoUrlDark` → `logoUrl` → null.
 */
export function resolveConsumerSquareLogoForTheme(
  settings: ConsumerSquareLogoSettings,
  theme: ConsumerSquareLogoTheme,
): string | null {
  const light = resolveConsumerSquareLogoUrl(settings.logoUrl);
  const dark = resolveConsumerSquareLogoUrl(settings.logoUrlDark);
  if (theme === 'dark') {
    return dark ?? light ?? null;
  }
  return light ?? dark ?? null;
}

/**
 * Pick public tenant-directory fields from a wire row.
 * Ignores additive `wordmarkUrl` even when present on the payload.
 * Preserves logo-chip rim fields (coerce invalid → defaults; never strip).
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
  const rim = normalizeLogoChipRimSettings(row);
  const background = normalizeLogoChipBackgroundSettings(row);
  return {
    tenantId,
    code,
    name,
    logoUrl: resolveConsumerSquareLogoUrl(row.logoUrl),
    logoUrlDark: resolveConsumerSquareLogoUrl(row.logoUrlDark),
    showLogoChipRimLight: rim.showLogoChipRimLight,
    showLogoChipRimDark: rim.showLogoChipRimDark,
    logoChipRimColorLight: rim.logoChipRimColorLight,
    logoChipRimColorDark: rim.logoChipRimColorDark,
    showLogoChipBackgroundLight: background.showLogoChipBackgroundLight,
    showLogoChipBackgroundDark: background.showLogoChipBackgroundDark,
    logoChipBackgroundColorLight: background.logoChipBackgroundColorLight,
    logoChipBackgroundColorDark: background.logoChipBackgroundColorDark,
  };
}
