/**
 * Shared SSOT catalog drift guard (Package E catalogHash.test.ts 57/v13).
 *
 * Pin version + count + SHA-256 of `${catalogVersion}:${blockKeys.join(',')}`.
 * Do not list block keys here — keys come from catalog.ts. When you intentionally
 * bump catalogVersion or change keys, update EXPECTED_* in this file.
 *
 * Backend mirror: up-backend/src/__tests__/unit/tenant-entitlements/catalogHash.test.ts
 */
import { createHash } from 'node:crypto';
import {
  ENTITLEMENT_BLOCK_KEYS,
  TENANT_ENTITLEMENT_BLOCK_CATALOG,
  TENANT_ENTITLEMENT_BLOCK_COUNT,
  TENANT_ENTITLEMENT_CATALOG_VERSION,
  getEntitlementBlockCatalogEntry,
} from '../catalog.js';

const EXPECTED_CATALOG_VERSION = 13;
const EXPECTED_BLOCK_COUNT = 57;
const EXPECTED_CATALOG_CONTENT_HASH =
  '07ec0bfa5f086e5efc1d4212cbdf50af786450e64ddea24765427df8863281ed';

function computeSharedCatalogContentHash(
  catalogVersion: number,
  blockKeys: readonly string[],
): string {
  return createHash('sha256')
    .update(`${String(catalogVersion)}:${blockKeys.join(',')}`)
    .digest('hex');
}

describe('tenant entitlement catalog hash (shared SSOT)', () => {
  it('pins catalog version 13', () => {
    expect(TENANT_ENTITLEMENT_CATALOG_VERSION).toBe(EXPECTED_CATALOG_VERSION);
  });

  it('contains exactly 57 block keys (count + unique + catalog rows)', () => {
    expect(TENANT_ENTITLEMENT_BLOCK_COUNT).toBe(EXPECTED_BLOCK_COUNT);
    expect(ENTITLEMENT_BLOCK_KEYS).toHaveLength(EXPECTED_BLOCK_COUNT);
    expect(TENANT_ENTITLEMENT_BLOCK_CATALOG).toHaveLength(EXPECTED_BLOCK_COUNT);
    expect(new Set(ENTITLEMENT_BLOCK_KEYS).size).toBe(EXPECTED_BLOCK_COUNT);
  });

  it('computes a stable content hash for catalog version 13 (fails on key/order drift)', () => {
    const hash = computeSharedCatalogContentHash(
      TENANT_ENTITLEMENT_CATALOG_VERSION,
      ENTITLEMENT_BLOCK_KEYS,
    );
    expect(hash).toHaveLength(64);
    expect(hash).toBe(EXPECTED_CATALOG_CONTENT_HASH);
  });

  it('keeps incident_centre_ui CONDITIONAL in shared catalog', () => {
    const entry = getEntitlementBlockCatalogEntry('incident_centre_ui');
    expect(entry.blockClass).toBe('CONDITIONAL');
    expect(entry.immutableDefaults).toBeUndefined();
    expect(ENTITLEMENT_BLOCK_KEYS).toContain('incident_centre_ui');
  });
});
