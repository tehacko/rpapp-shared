import {
  getPermissionDomainLabel,
  getPermissionLevelLabel,
  getPermissionResourceTitle,
  PERMISSION_DOMAIN_LABELS,
  PERMISSION_LEVEL_LABELS,
  PERMISSION_RESOURCE_LABELS,
} from './permissionLabels.js';

describe('permissionLabels', () => {
  it('exposes View/Manage labels in EN, CS, and SK', () => {
    expect(PERMISSION_LEVEL_LABELS.view.en).toBe('View');
    expect(PERMISSION_LEVEL_LABELS.view.cs).toBe('Zobrazení');
    expect(PERMISSION_LEVEL_LABELS.view.sk).toBe('Zobrazenie');
    expect(PERMISSION_LEVEL_LABELS.manage.en).toBe('Manage');
    expect(PERMISSION_LEVEL_LABELS.manage.cs).toBe('Správa');
    expect(PERMISSION_LEVEL_LABELS.manage.sk).toBe('Správa');
  });

  it('includes sk on every permission dictionary entry', () => {
    const allLabels = [
      ...Object.values(PERMISSION_LEVEL_LABELS),
      ...Object.values(PERMISSION_DOMAIN_LABELS),
      ...Object.values(PERMISSION_RESOURCE_LABELS),
    ];
    for (const label of allLabels) {
      expect(typeof label.sk).toBe('string');
      expect(label.sk!.length).toBeGreaterThan(0);
    }
  });

  it('resolves known domain labels', () => {
    expect(getPermissionDomainLabel('tenant', 'en')).toBe('Tenant operations');
    expect(getPermissionDomainLabel('tenant', 'cs')).toBe('Provoz organizace');
    expect(getPermissionDomainLabel('tenant', 'sk')).toBe('Prevádzka organizácie');
  });

  it('resolves known resource titles in EN, CS, and SK', () => {
    expect(getPermissionResourceTitle('products', 'en')).toBe('Products');
    expect(getPermissionResourceTitle('products', 'cs')).toBe('Produkty');
    expect(getPermissionResourceTitle('products', 'sk')).toBe('Produkty');
    expect(getPermissionResourceTitle('adminEvents.subscribe', 'cs')).toBe(
      'Admin události — odběr',
    );
    expect(getPermissionResourceTitle('adminEvents.subscribe', 'sk')).toBe(
      'Admin udalosti — odber',
    );
  });

  it('resolves level labels for locale sk', () => {
    expect(getPermissionLevelLabel('view', 'sk')).toBe('Zobrazenie');
    expect(getPermissionLevelLabel('manage', 'sk')).toBe('Správa');
  });

  it('falls back for unknown domains', () => {
    expect(getPermissionLevelLabel('view', 'en')).toBe('View');
    expect(getPermissionDomainLabel('customDomain', 'en')).toBe('CustomDomain');
    expect(getPermissionResourceTitle('unknown.resource', 'cs')).toBeNull();
  });
});
