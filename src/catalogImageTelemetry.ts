/**
 * Helpers for catalog_image_load_failed analytics (DON-PR-08).
 * No PII — path-only classification; callers supply entity ids separately.
 */

import { isBrandingCatalogImagePath } from './catalogImageUrl.js';

export type CatalogImageUrlClass = 'signed_api' | 'external' | 'legacy_path';

export function classifyCatalogImageUrl(url: string | null | undefined): CatalogImageUrlClass {
  if (url === null || url === undefined || url.trim().length === 0) {
    return 'external';
  }
  const trimmed = url.trim();
  // Tenant logo / SP branding streams are HMAC-signed APIs (paths may use /logo, not /image).
  if (isBrandingCatalogImagePath(hashCatalogImagePath(trimmed))) {
    return 'signed_api';
  }
  if (trimmed.includes('sig=') && trimmed.includes('/image')) {
    return 'signed_api';
  }
  if (
    LEGACY_PRODUCT_PATH.test(trimmed) ||
    LEGACY_DONATION_PATH.test(trimmed)
  ) {
    return 'legacy_path';
  }
  if (trimmed.includes('/api/') && trimmed.includes('/image')) {
    return 'signed_api';
  }
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    return 'external';
  }
  if (trimmed.startsWith('/api/')) {
    return 'legacy_path';
  }
  return 'external';
}

const LEGACY_PRODUCT_PATH = /\/api\/products\/\d+\/image/;
const LEGACY_DONATION_PATH = /\/api\/donation-projects\/\d+\/image/;

export function hashCatalogImagePath(url: string): string {
  const withoutQuery = url.split('?')[0] ?? url;
  if (withoutQuery.startsWith('http://') || withoutQuery.startsWith('https://')) {
    try {
      return new URL(withoutQuery).pathname;
    } catch {
      return 'unknown';
    }
  }
  return withoutQuery;
}

export function httpStatusClassFromCode(status: number | undefined): string {
  if (status === undefined || status <= 0) {
    return 'unknown';
  }
  const bucket = Math.floor(status / 100);
  return `${bucket}xx`;
}
