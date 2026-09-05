/**
 * Catalog `<img>` 404s are terminal for that media identity while the HMAC
 * signature is still valid. Invalidating the catalog on every `onError` remints
 * `sig`/`exp` (or remounts cards), which retriggers the request and creates a
 * customer/kiosk ↔ API retry storm.
 *
 * Expired signed URLs get exactly one remint retry: the identity is held in
 * `remintPendingKeys` (hiding the expired URL) until a fresh unexpired URL is
 * seen; a second failure then moves the identity to `brokenCatalogImageKeys`.
 *
 * Identity ignores `sig`, `exp`, and cache-bust `v` so a reminted URL for the
 * same blob cannot bypass the terminal broken set.
 */

import { classifyCatalogImageUrl, hashCatalogImagePath } from './catalogImageTelemetry.js';

/** Terminal broken identities — never remount / never refresh again. */
const brokenCatalogImageKeys = new Set<string>();

/** Identities awaiting exactly one reminted-URL attempt after an expired failure. */
const remintPendingKeys = new Set<string>();

export function catalogImageFailureKey(url: string): string {
  const path = hashCatalogImagePath(url);
  try {
    const parsed = new URL(url, 'https://catalog.invalid');
    const imageId = parsed.searchParams.get('imageId') ?? '';
    const size = parsed.searchParams.get('size') ?? '';
    const variantId = parsed.searchParams.get('variantId') ?? '';
    return `${path}|i=${imageId}|s=${size}|v=${variantId}`;
  } catch {
    return path;
  }
}

export function isCatalogImageSignatureExpired(url: string, nowMs: number = Date.now()): boolean {
  try {
    const parsed = new URL(url, 'https://catalog.invalid');
    const expRaw = parsed.searchParams.get('exp');
    if (expRaw === null || expRaw.length === 0) {
      return false;
    }
    const expSec = Number.parseInt(expRaw, 10);
    if (!Number.isFinite(expSec) || expSec <= 0) {
      return false;
    }
    return expSec * 1000 <= nowMs;
  } catch {
    return false;
  }
}

export function isBrokenCatalogImageUrl(
  url: string | null | undefined,
  nowMs: number = Date.now(),
): boolean {
  if (url === null || url === undefined || url.length === 0) {
    return false;
  }
  const key = catalogImageFailureKey(url);
  if (brokenCatalogImageKeys.has(key)) {
    return true;
  }
  if (remintPendingKeys.has(key)) {
    if (isCatalogImageSignatureExpired(url, nowMs)) {
      // Hide the expired URL while catalog refresh remints sig/exp.
      return true;
    }
    // Fresh reminted URL — allow exactly one fetch attempt.
    // Keep remintPending until noteCatalogImageLoadFailure so a second 404
    // is terminal (not treated as a brand-new first failure).
    return false;
  }
  return false;
}

/**
 * Record a catalog image load failure.
 * - `emitTelemetry` once per media identity (avoids analytics 422 storms).
 * - `refreshCatalog` only on the first expired signed failure — reminted URLs
 *   get one attempt; a second failure is terminal.
 */
export function noteCatalogImageLoadFailure(
  url: string,
  nowMs: number = Date.now(),
): { refreshCatalog: boolean; emitTelemetry: boolean } {
  const key = catalogImageFailureKey(url);
  if (brokenCatalogImageKeys.has(key)) {
    return { refreshCatalog: false, emitTelemetry: false };
  }
  if (remintPendingKeys.has(key)) {
    // Second failure (after remint or same expired URL again) → terminal.
    remintPendingKeys.delete(key);
    brokenCatalogImageKeys.add(key);
    return { refreshCatalog: false, emitTelemetry: false };
  }
  if (
    classifyCatalogImageUrl(url) === 'signed_api' &&
    isCatalogImageSignatureExpired(url, nowMs)
  ) {
    remintPendingKeys.add(key);
    return { refreshCatalog: true, emitTelemetry: true };
  }
  brokenCatalogImageKeys.add(key);
  return { refreshCatalog: false, emitTelemetry: true };
}

/** Test-only — session guard must not leak across specs. */
export function clearCatalogImageLoadGuardForTests(): void {
  brokenCatalogImageKeys.clear();
  remintPendingKeys.clear();
}
