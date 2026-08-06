/**
 * G1 install SoT — prove workspace pi-kiosk-shared exposes compliance bridges + catalog hints.
 */
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import {
  expandCapabilitiesForClientCheck,
  hasEffectiveCapability,
} from './effectiveCapabilities.js';
import { getEntitlementBlockCatalogEntry } from '../tenant-entitlements/catalog.js';

const pkg = JSON.parse(
  readFileSync(resolve(process.cwd(), 'package.json'), 'utf8'),
) as { name: string; version: string };

describe('G1 compliance bridge + catalog install SoT', () => {
  it('package version is publish baseline (2.2.59+)', () => {
    expect(pkg.name).toBe('pi-kiosk-shared');
    const [major, minor, patch] = String(pkg.version).split('.').map(Number);
    expect(major).toBeGreaterThanOrEqual(2);
    expect(minor).toBeGreaterThanOrEqual(2);
    expect(patch).toBeGreaterThanOrEqual(59);
  });

  it('catalog capabilityHints are canonical (not legacy system:*)', () => {
    expect(getEntitlementBlockCatalogEntry('audit_logs_admin_ui')?.capabilityHint).toBe(
      'tenant.systemLogs.view',
    );
    expect(getEntitlementBlockCatalogEntry('gdpr_consent_admin_ui')?.capabilityHint).toBe(
      'tenant.systemPii.view',
    );
  });

  it('forward bridges: legacy logs/pii → canonical', () => {
    expect(hasEffectiveCapability(['system:logs:read'], 'tenant.systemLogs.view')).toBe(true);
    expect(hasEffectiveCapability(['system:pii:read'], 'tenant.systemPii.view')).toBe(true);
    const expanded = expandCapabilitiesForClientCheck(['system:logs:read', 'system:pii:read']);
    expect(expanded.has('tenant.systemLogs.view')).toBe(true);
    expect(expanded.has('tenant.systemPii.view')).toBe(true);
  });
});
