import type { LabelLocale, LocalizedLabel } from '../labels/localizedLabel.js';

export type PermissionLevel = 'view' | 'manage';

export const PERMISSION_LEVEL_LABELS: Record<PermissionLevel, LocalizedLabel> = {
  view: { en: 'View', cs: 'Zobrazení' },
  manage: { en: 'Manage', cs: 'Správa' },
};

export const PERMISSION_DOMAIN_LABELS: Record<string, LocalizedLabel> = {
  principal: { en: 'Account access', cs: 'Přístup k účtu' },
  account: { en: 'Account', cs: 'Účet' },
  permissions: { en: 'Permissions catalog', cs: 'Katalog oprávnění' },
  tenant: { en: 'Tenant operations', cs: 'Provoz tenantu' },
  platform: { en: 'Platform administration', cs: 'Správa platformy' },
  exceptions: { en: 'High-risk exceptions', cs: 'Vysoce rizikové výjimky' },
  compliance: { en: 'Compliance', cs: 'Compliance' },
};

export function getPermissionLevelLabel(level: PermissionLevel, locale: LabelLocale): string {
  return PERMISSION_LEVEL_LABELS[level][locale];
}

export function getPermissionDomainLabel(domain: string, locale: LabelLocale): string {
  const known = PERMISSION_DOMAIN_LABELS[domain];
  if (known !== undefined) {
    return known[locale];
  }
  const fallback = domain
    .split(/[._-]/)
    .filter(Boolean)
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
    .join(' ');
  return fallback.length > 0 ? fallback : 'Permissions';
}
