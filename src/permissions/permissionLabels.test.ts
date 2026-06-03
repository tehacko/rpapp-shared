import {
  getPermissionDomainLabel,
  getPermissionLevelLabel,
  PERMISSION_LEVEL_LABELS,
} from './permissionLabels.js';

describe('permissionLabels', () => {
  it('exposes View/Manage labels in EN and CS', () => {
    expect(PERMISSION_LEVEL_LABELS.view.en).toBe('View');
    expect(PERMISSION_LEVEL_LABELS.view.cs).toBe('Zobrazení');
    expect(PERMISSION_LEVEL_LABELS.manage.en).toBe('Manage');
    expect(PERMISSION_LEVEL_LABELS.manage.cs).toBe('Správa');
  });

  it('resolves known domain labels', () => {
    expect(getPermissionDomainLabel('tenant', 'en')).toBe('Tenant operations');
    expect(getPermissionDomainLabel('tenant', 'cs')).toBe('Provoz tenantu');
  });

  it('falls back for unknown domains', () => {
    expect(getPermissionLevelLabel('view', 'en')).toBe('View');
    expect(getPermissionDomainLabel('customDomain', 'en')).toBe('CustomDomain');
  });
});
