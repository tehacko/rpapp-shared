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
  exceptions: { en: 'Exceptions', cs: 'Výjimky' },
  compliance: { en: 'Compliance', cs: 'Compliance' },
};

/**
 * Short resource titles keyed by displayKey path after domain + view/manage strip.
 * Example: tenant.products.view → products; tenant.adminEvents.subscribe → adminEvents.subscribe
 */
export const PERMISSION_RESOURCE_LABELS: Record<string, LocalizedLabel> = {
  // Principal / account / catalog
  principal: { en: 'Account access', cs: 'Přístup k účtu' },
  'self': { en: 'Own account', cs: 'Vlastní účet' },
  permissionsCatalog: { en: 'Permissions catalog', cs: 'Katalog oprávnění' },

  // Tenant — payments & bank
  paymentCredentials: { en: 'Payment credentials', cs: 'Platební údaje' },
  paymentPreferences: { en: 'Payment preferences', cs: 'Platební preference' },
  paymentsIntegration: { en: 'Payments integration', cs: 'Platební integrace' },
  bankAccounts: { en: 'Bank accounts', cs: 'Bankovní účty' },
  'bankAccounts.read': { en: 'Bank accounts — read', cs: 'Bankovní účty — čtení' },
  bankInbox: { en: 'Bank inbox', cs: 'Bankovní schránka' },
  'bankInbox.read': { en: 'Bank inbox — read', cs: 'Bankovní schránka — čtení' },
  'paymentClaims.approve': { en: 'Payment claims — approve', cs: 'Platební nároky — schválení' },
  'reconciliation.read': { en: 'Reconciliation — read', cs: 'Párování plateb — čtení' },
  'comms.credentials.read': { en: 'Comms credentials — read', cs: 'Komunikační údaje — čtení' },
  'comms.credentials.write': { en: 'Comms credentials — write', cs: 'Komunikační údaje — zápis' },

  // Tenant — users & ops
  adminUsers: { en: 'Admin users', cs: 'Administrátoři' },
  adminUserCapabilities: { en: 'Admin user capabilities', cs: 'Oprávnění administrátorů' },
  products: { en: 'Products', cs: 'Produkty' },
  kiosks: { en: 'Sales points', cs: 'Platební místa' },
  inventory: { en: 'Inventory', cs: 'Sklad' },
  transactions: { en: 'Transactions', cs: 'Transakce' },
  donationProjects: { en: 'Donation projects', cs: 'Dárkové projekty' },
  donationTemplates: { en: 'Donation templates', cs: 'Šablony darů' },
  branding: { en: 'Branding', cs: 'Branding' },
  kioskDonationAssign: { en: 'Sales point donation assign', cs: 'Přiřazení darů na platební místo' },
  kioskDonationAmounts: { en: 'Sales point donation amounts', cs: 'Částky darů na platebním místě' },
  'orders.complete': { en: 'Orders — complete', cs: 'Objednávky — dokončení' },
  'orders.fulfill.read': { en: 'Orders — fulfill — read', cs: 'Objednávky — výdej — čtení' },
  'orders.fulfill.update': { en: 'Orders — fulfill — update', cs: 'Objednávky — výdej — úprava' },
  'orders.pickup.scan': { en: 'Orders — pickup — scan', cs: 'Objednávky — výdej — sken' },
  'orders.pickup.refuse': { en: 'Orders — pickup — refuse', cs: 'Objednávky — výdej — odmítnutí' },
  'orders.pickup.hold': { en: 'Orders — pickup — hold', cs: 'Objednávky — výdej — pozastavení' },
  'orders.pickup.reprint': { en: 'Orders — pickup — reprint', cs: 'Objednávky — výdej — tisk' },
  pickupPoints: { en: 'Pickup points', cs: 'Výdejní místa' },
  'pickupPoints.read': { en: 'Pickup points — read', cs: 'Výdejní místa — čtení' },
  pickupDevices: { en: 'Pickup devices', cs: 'Výdejní zařízení' },
  'pickupDevices.read': { en: 'Pickup devices — read', cs: 'Výdejní zařízení — čtení' },
  outbox: { en: 'Outbox', cs: 'Outbox' },
  'adminEvents.subscribe': { en: 'Admin events — subscribe', cs: 'Admin události — odběr' },
  policyApproval: { en: 'Policy approval', cs: 'Schválení politiky' },

  // Tenant — analytics
  analyticsSummary: { en: 'Analytics summary', cs: 'Souhrnná analytika' },
  analyticsDetailed: { en: 'Analytics detailed', cs: 'Detailní analytika' },
  analyticsPii: { en: 'Analytics PII', cs: 'Analytika — osobní údaje' },
  analyticsBenchmark: { en: 'Analytics benchmark', cs: 'Analytický benchmark' },

  // Tenant — finance
  financeView: { en: 'Finance view', cs: 'Finance — přehled' },
  financeDetailed: { en: 'Finance detailed', cs: 'Finance — detail' },
  financePii: { en: 'Finance PII', cs: 'Finance — osobní údaje' },
  financeExport: { en: 'Finance export', cs: 'Finance — export' },
  financeSettlements: { en: 'Finance settlements', cs: 'Finance — vyúčtování' },
  financeRefunds: { en: 'Finance refunds', cs: 'Finance — refundace' },
  financeApproveSettlement: { en: 'Finance approve settlement', cs: 'Finance — schválení vyúčtování' },

  // Tenant — system & config
  systemHealth: { en: 'System health', cs: 'Stav systému' },
  systemLogs: { en: 'System logs', cs: 'Systémové záznamy' },
  systemPii: { en: 'System PII', cs: 'Systém — osobní údaje' },
  systemFeatureFlags: { en: 'System feature flags', cs: 'Přepínače funkcí' },
  systemSecrets: { en: 'System secrets', cs: 'Systémová tajemství' },
  configPricing: { en: 'Config pricing', cs: 'Cenotvorba' },
  pricingKioskOverride: { en: 'Pricing sales point override', cs: 'Přepsání DPH u platebního místa' },
  configTenant: { en: 'Config tenant', cs: 'Nastavení tenanta' },

  // Exceptions
  crossTenantReplayExecute: {
    en: 'Cross-tenant replay execute',
    cs: 'Spuštění přehrání napříč tenanty',
  },
  tenantPermanentDelete: { en: 'Tenant permanent delete', cs: 'Trvalé smazání tenanta' },
  refundResolve: { en: 'Refund resolve', cs: 'Vyřešení refundace' },
  complianceSensitiveAccess: {
    en: 'Compliance-sensitive access',
    cs: 'Citlivý compliance přístup',
  },

  // Platform (short titles for rare advanced UI)
  users: { en: 'Platform users', cs: 'Uživatelé platformy' },
  tenants: { en: 'Platform tenants', cs: 'Tenanti platformy' },
  tenantPayments: { en: 'Tenant payments defaults', cs: 'Výchozí platby tenantů' },
  userTenantAssignments: {
    en: 'User–tenant assignments',
    cs: 'Přiřazení uživatelů k tenantům',
  },
  userCapabilities: { en: 'User capabilities', cs: 'Oprávnění uživatelů' },
  retentionWorkers: { en: 'Retention workers', cs: 'Retention workery' },
  'outboxReplay.dryRun': { en: 'Outbox replay — dry run', cs: 'Přehrání outboxu — nácvik' },
  'outboxReplay.approvalRequestCreate': {
    en: 'Outbox replay — request approval',
    cs: 'Přehrání outboxu — žádost o schválení',
  },
  'outboxReplay.approvalRequestApprove': {
    en: 'Outbox replay — approve',
    cs: 'Přehrání outboxu — schválení',
  },
  'outboxReplay.approvalRequestRevoke': {
    en: 'Outbox replay — revoke',
    cs: 'Přehrání outboxu — odvolání',
  },
  'outboxReplay.execute': { en: 'Outbox replay — execute', cs: 'Přehrání outboxu — spuštění' },
  aggregates: { en: 'Aggregates', cs: 'Agregace' },
  successIncident: { en: 'Success incident', cs: 'Success incident' },
  hardeningMetrics: { en: 'Hardening metrics', cs: 'Hardening metriky' },
  overview: { en: 'Platform overview', cs: 'Přehled platformy' },
  reconciliation: { en: 'Platform reconciliation', cs: 'Párování platformy' },
  retention: { en: 'Retention', cs: 'Retence' },
  devUsers: { en: 'Dev users', cs: 'Dev uživatelé' },
  analyticsPipeline: { en: 'Analytics pipeline', cs: 'Analytický pipeline' },
  analyticsExplore: { en: 'Analytics explore', cs: 'Průzkum analytiky' },
  complianceAudit: { en: 'Compliance audit', cs: 'Compliance audit' },
  complianceGdpr: { en: 'Compliance GDPR', cs: 'Compliance GDPR' },
  auditFinalizeIncident: {
    en: 'Audit finalize incident',
    cs: 'Uzavření auditního incidentu',
  },
  complianceRetentionDelete: {
    en: 'Compliance retention delete',
    cs: 'Smazání retention dat',
  },
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

/** Resolve a localized short title for a resource key (after domain/level strip). */
export function getPermissionResourceTitle(
  resourceKey: string,
  locale: LabelLocale,
): string | null {
  const known = PERMISSION_RESOURCE_LABELS[resourceKey];
  if (known !== undefined) {
    return known[locale];
  }
  return null;
}
