/**
 * Shared SSOT catalog drift guard (SoT catalogHash.test.ts 65/v15).
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

const EXPECTED_CATALOG_VERSION = 15;
const EXPECTED_BLOCK_COUNT = 65;
const EXPECTED_CATALOG_CONTENT_HASH =
  'c822b1d52baa1e1f0f623b304eb27748e89dd3438af544719defbd9c2fec2bfa';

function computeSharedCatalogContentHash(
  catalogVersion: number,
  blockKeys: readonly string[],
): string {
  return createHash('sha256')
    .update(`${String(catalogVersion)}:${blockKeys.join(',')}`)
    .digest('hex');
}

describe('tenant entitlement catalog hash (shared SSOT)', () => {
  it('pins catalog version 15', () => {
    expect(TENANT_ENTITLEMENT_CATALOG_VERSION).toBe(EXPECTED_CATALOG_VERSION);
  });

  it('contains exactly 65 block keys (count + unique + catalog rows)', () => {
    expect(TENANT_ENTITLEMENT_BLOCK_COUNT).toBe(EXPECTED_BLOCK_COUNT);
    expect(ENTITLEMENT_BLOCK_KEYS).toHaveLength(EXPECTED_BLOCK_COUNT);
    expect(TENANT_ENTITLEMENT_BLOCK_CATALOG).toHaveLength(EXPECTED_BLOCK_COUNT);
    expect(new Set(ENTITLEMENT_BLOCK_KEYS).size).toBe(EXPECTED_BLOCK_COUNT);
  });

  it('computes a stable content hash for catalog version 15 (fails on key/order drift)', () => {
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
