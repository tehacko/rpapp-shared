import {
  resolveLocalizedLabel,
  type LabelLocale,
  type LocalizedLabel,
} from '../labels/localizedLabel.js';

export type PermissionLevel = 'view' | 'manage';

export const PERMISSION_LEVEL_LABELS: Record<PermissionLevel, LocalizedLabel> = {
  view: { en: 'View', cs: 'Zobrazení', sk: 'Zobrazenie' },
  manage: { en: 'Manage', cs: 'Správa', sk: 'Správa' },
};

export const PERMISSION_DOMAIN_LABELS: Record<string, LocalizedLabel> = {
  principal: { en: 'Account access', cs: 'Přístup k účtu', sk: 'Prístup k účtu' },
  account: { en: 'Account', cs: 'Účet', sk: 'Účet' },
  permissions: { en: 'Permissions catalog', cs: 'Katalog oprávnění', sk: 'Katalóg oprávnení' },
  tenant: { en: 'Tenant operations', cs: 'Provoz organizace', sk: 'Prevádzka organizácie' },
  platform: { en: 'Platform administration', cs: 'Správa platformy', sk: 'Správa platformy' },
  exceptions: { en: 'Exceptions', cs: 'Výjimky', sk: 'Výnimky' },
  compliance: { en: 'Compliance', cs: 'Compliance', sk: 'Compliance' },
};

/**
 * Short resource titles keyed by displayKey path after domain + view/manage strip.
 * Example: tenant.products.view → products; tenant.adminEvents.subscribe → adminEvents.subscribe
 */
export const PERMISSION_RESOURCE_LABELS: Record<string, LocalizedLabel> = {
  // Principal / account / catalog
  principal: { en: 'Account access', cs: 'Přístup k účtu', sk: 'Prístup k účtu' },
  self: { en: 'Own account', cs: 'Vlastní účet', sk: 'Vlastný účet' },
  permissionsCatalog: {
    en: 'Permissions catalog',
    cs: 'Katalog oprávnění',
    sk: 'Katalóg oprávnení',
  },

  // Tenant — payments & bank
  paymentCredentials: { en: 'Payment credentials', cs: 'Platební údaje', sk: 'Platobné údaje' },
  paymentPreferences: {
    en: 'Payment preferences',
    cs: 'Platební preference',
    sk: 'Platobné preferencie',
  },
  paymentsIntegration: {
    en: 'Payments integration',
    cs: 'Platební integrace',
    sk: 'Platobná integrácia',
  },
  bankAccounts: { en: 'Bank accounts', cs: 'Bankovní účty', sk: 'Bankové účty' },
  'bankAccounts.read': {
    en: 'Bank accounts — read',
    cs: 'Bankovní účty — čtení',
    sk: 'Bankové účty — čítanie',
  },
  bankInbox: { en: 'Bank inbox', cs: 'Bankovní schránka', sk: 'Banková schránka' },
  'bankInbox.read': {
    en: 'Bank inbox — read',
    cs: 'Bankovní schránka — čtení',
    sk: 'Banková schránka — čítanie',
  },
  'paymentClaims.approve': {
    en: 'Payment claims — approve',
    cs: 'Platební nároky — schválení',
    sk: 'Platobné nároky — schválenie',
  },
  'reconciliation.read': {
    en: 'Reconciliation — read',
    cs: 'Párování plateb — čtení',
    sk: 'Párovanie platieb — čítanie',
  },
  'comms.credentials.read': {
    en: 'Comms credentials — read',
    cs: 'Komunikační údaje — čtení',
    sk: 'Komunikačné údaje — čítanie',
  },
  'comms.credentials.write': {
    en: 'Comms credentials — write',
    cs: 'Komunikační údaje — zápis',
    sk: 'Komunikačné údaje — zápis',
  },

  // Tenant — users & ops
  adminUsers: { en: 'Admin users', cs: 'Administrátoři', sk: 'Administrátori' },
  adminUserCapabilities: {
    en: 'Admin user capabilities',
    cs: 'Oprávnění administrátorů',
    sk: 'Oprávnenia administrátorov',
  },
  products: { en: 'Products', cs: 'Produkty', sk: 'Produkty' },
  kiosks: { en: 'Sales points', cs: 'Prodejní místa', sk: 'Platobné miesta' },
  inventory: { en: 'Inventory', cs: 'Sklad', sk: 'Sklad' },
  transactions: { en: 'Transactions', cs: 'Transakce', sk: 'Transakcie' },
  donationProjects: { en: 'Donation projects', cs: 'Dárkové projekty', sk: 'Darčekové projekty' },
  donationTemplates: { en: 'Donation templates', cs: 'Šablony darů', sk: 'Šablóny darov' },
  branding: { en: 'Branding', cs: 'Branding', sk: 'Branding' },
  kioskDonationAssign: {
    en: 'Sales point donation assign',
    cs: 'Přiřazení darů na prodejní místo',
    sk: 'Priradenie darov na predajné miesto',
  },
  kioskDonationAmounts: {
    en: 'Sales point donation amounts',
    cs: 'Částky darů na prodejním místě',
    sk: 'Sumy darov na predajnom mieste',
  },
  'orders.complete': {
    en: 'Orders — complete',
    cs: 'Objednávky — dokončení',
    sk: 'Objednávky — dokončenie',
  },
  'orders.fulfill.read': {
    en: 'Orders — fulfill — read',
    cs: 'Objednávky — výdej — čtení',
    sk: 'Objednávky — výdaj — čítanie',
  },
  'orders.fulfill.update': {
    en: 'Orders — fulfill — update',
    cs: 'Objednávky — výdej — úprava',
    sk: 'Objednávky — výdaj — úprava',
  },
  'orders.pickup.scan': {
    en: 'Orders — pickup — scan',
    cs: 'Objednávky — výdej — sken',
    sk: 'Objednávky — výdaj — sken',
  },
  'orders.pickup.refuse': {
    en: 'Orders — pickup — refuse',
    cs: 'Objednávky — výdej — odmítnutí',
    sk: 'Objednávky — výdaj — odmietnutie',
  },
  'orders.pickup.hold': {
    en: 'Orders — pickup — hold',
    cs: 'Objednávky — výdej — pozastavení',
    sk: 'Objednávky — výdaj — pozastavenie',
  },
  'orders.pickup.reprint': {
    en: 'Orders — pickup — reprint',
    cs: 'Objednávky — výdej — tisk',
    sk: 'Objednávky — výdaj — tlač',
  },
  pickupPoints: { en: 'Pickup points', cs: 'Výdejní místa', sk: 'Výdajné miesta' },
  'pickupPoints.read': {
    en: 'Pickup points — read',
    cs: 'Výdejní místa — čtení',
    sk: 'Výdajné miesta — čítanie',
  },
  pickupDevices: { en: 'Pickup devices', cs: 'Výdejní zařízení', sk: 'Výdajné zariadenia' },
  'pickupDevices.read': {
    en: 'Pickup devices — read',
    cs: 'Výdejní zařízení — čtení',
    sk: 'Výdajné zariadenia — čítanie',
  },
  outbox: { en: 'Outbox', cs: 'Outbox', sk: 'Outbox' },
  'adminEvents.subscribe': {
    en: 'Admin events — subscribe',
    cs: 'Admin události — odběr',
    sk: 'Admin udalosti — odber',
  },
  policyApproval: { en: 'Policy approval', cs: 'Schválení politiky', sk: 'Schválenie politiky' },

  // Tenant — analytics
  analyticsSummary: { en: 'Analytics summary', cs: 'Souhrnná analytika', sk: 'Súhrnná analytika' },
  analyticsDetailed: {
    en: 'Analytics detailed',
    cs: 'Detailní analytika',
    sk: 'Detailná analytika',
  },
  analyticsPii: { en: 'Analytics PII', cs: 'Analytika — osobní údaje', sk: 'Analytika — osobné údaje' },
  analyticsBenchmark: {
    en: 'Analytics benchmark',
    cs: 'Analytický benchmark',
    sk: 'Analytický benchmark',
  },

  // Tenant — finance
  financeView: { en: 'Finance view', cs: 'Finance — přehled', sk: 'Finance — prehľad' },
  financeDetailed: { en: 'Finance detailed', cs: 'Finance — detail', sk: 'Finance — detail' },
  financePii: { en: 'Finance PII', cs: 'Finance — osobní údaje', sk: 'Finance — osobné údaje' },
  financeExport: { en: 'Finance export', cs: 'Finance — export', sk: 'Finance — export' },
  financeSettlements: {
    en: 'Finance settlements',
    cs: 'Finance — vyúčtování',
    sk: 'Finance — vyúčtovanie',
  },
  financeRefunds: { en: 'Finance refunds', cs: 'Finance — refundace', sk: 'Finance — refundácie' },
  financeApproveSettlement: {
    en: 'Finance approve settlement',
    cs: 'Finance — schválení vyúčtování',
    sk: 'Finance — schválenie vyúčtovania',
  },

  // Tenant — system & config
  systemHealth: { en: 'System health', cs: 'Stav systému', sk: 'Stav systému' },
  systemLogs: { en: 'System logs', cs: 'Systémové záznamy', sk: 'Systémové záznamy' },
  systemPii: { en: 'System PII', cs: 'Systém — osobní údaje', sk: 'Systém — osobné údaje' },
  systemFeatureFlags: {
    en: 'System feature flags',
    cs: 'Přepínače funkcí',
    sk: 'Prepínače funkcií',
  },
  systemSecrets: { en: 'System secrets', cs: 'Systémová tajemství', sk: 'Systémové tajomstvá' },
  configPricing: { en: 'Config pricing', cs: 'Cenotvorba', sk: 'Cenotvorba' },
  pricingKioskOverride: {
    en: 'Pricing sales point override',
    cs: 'Přepsání DPH u prodejního místa',
    sk: 'Prepísanie DPH u predajného miesta',
  },
  configTenant: { en: 'Config tenant', cs: 'Nastavení organizace', sk: 'Nastavenie organizácie' },

  // Exceptions
  crossTenantReplayExecute: {
    en: 'Cross-tenant replay execute',
    cs: 'Spuštění přehrání napříč organizacemi',
    sk: 'Spustenie prehratia naprieč organizáciami',
  },
  tenantPermanentDelete: {
    en: 'Tenant permanent delete',
    cs: 'Trvalé smazání organizace',
    sk: 'Trvalé zmazanie organizácie',
  },
  refundResolve: { en: 'Refund resolve', cs: 'Vyřešení refundace', sk: 'Vyriešenie refundácie' },
  complianceSensitiveAccess: {
    en: 'Compliance-sensitive access',
    cs: 'Citlivý compliance přístup',
    sk: 'Citlivý compliance prístup',
  },

  // Platform (short titles for rare advanced UI)
  users: { en: 'Platform users', cs: 'Uživatelé platformy', sk: 'Používatelia platformy' },
  tenants: { en: 'Platform tenants', cs: 'Organizace platformy', sk: 'Organizácie platformy' },
  tenantPayments: {
    en: 'Tenant payments defaults',
    cs: 'Výchozí platby organizací',
    sk: 'Predvolené platby organizácií',
  },
  userTenantAssignments: {
    en: 'User–tenant assignments',
    cs: 'Přiřazení uživatelů k organizacím',
    sk: 'Priradenie používateľov k organizáciám',
  },
  userCapabilities: {
    en: 'User capabilities',
    cs: 'Oprávnění uživatelů',
    sk: 'Oprávnenia používateľov',
  },
  retentionWorkers: { en: 'Retention workers', cs: 'Retention workery', sk: 'Retention workery' },
  'outboxReplay.dryRun': {
    en: 'Outbox replay — dry run',
    cs: 'Přehrání outboxu — nácvik',
    sk: 'Prehratie outboxu — nácvik',
  },
  'outboxReplay.approvalRequestCreate': {
    en: 'Outbox replay — request approval',
    cs: 'Přehrání outboxu — žádost o schválení',
    sk: 'Prehratie outboxu — žiadosť o schválenie',
  },
  'outboxReplay.approvalRequestApprove': {
    en: 'Outbox replay — approve',
    cs: 'Přehrání outboxu — schválení',
    sk: 'Prehratie outboxu — schválenie',
  },
  'outboxReplay.approvalRequestRevoke': {
    en: 'Outbox replay — revoke',
    cs: 'Přehrání outboxu — odvolání',
    sk: 'Prehratie outboxu — odvolanie',
  },
  'outboxReplay.execute': {
    en: 'Outbox replay — execute',
    cs: 'Přehrání outboxu — spuštění',
    sk: 'Prehratie outboxu — spustenie',
  },
  aggregates: { en: 'Aggregates', cs: 'Agregace', sk: 'Agregácie' },
  successIncident: { en: 'Success incident', cs: 'Centrum událostí', sk: 'Centrum udalostí' },
  hardeningMetrics: { en: 'Hardening metrics', cs: 'Hardening metriky', sk: 'Hardening metriky' },
  overview: { en: 'Platform overview', cs: 'Přehled platformy', sk: 'Prehľad platformy' },
  reconciliation: {
    en: 'Platform reconciliation',
    cs: 'Párování platformy',
    sk: 'Párovanie platformy',
  },
  retention: { en: 'Retention', cs: 'Retence', sk: 'Retencia' },
  devUsers: { en: 'Dev users', cs: 'Dev uživatelé', sk: 'Dev používatelia' },
  analyticsPipeline: {
    en: 'Analytics pipeline',
    cs: 'Analytický pipeline',
    sk: 'Analytický pipeline',
  },
  analyticsExplore: { en: 'Analytics explore', cs: 'Průzkum analytiky', sk: 'Prieskum analytiky' },
  complianceAudit: { en: 'Compliance audit', cs: 'Compliance audit', sk: 'Compliance audit' },
  complianceGdpr: { en: 'Compliance GDPR', cs: 'Compliance GDPR', sk: 'Compliance GDPR' },
  auditFinalizeIncident: {
    en: 'Audit finalize incident',
    cs: 'Uzavření auditního incidentu',
    sk: 'Uzavretie auditného incidentu',
  },
  complianceRetentionDelete: {
    en: 'Compliance retention delete',
    cs: 'Smazání retention dat',
    sk: 'Zmazanie retention dát',
  },
};

export function getPermissionLevelLabel(level: PermissionLevel, locale: LabelLocale): string {
  return resolveLocalizedLabel(PERMISSION_LEVEL_LABELS[level], locale);
}

export function getPermissionDomainLabel(domain: string, locale: LabelLocale): string {
  const known = PERMISSION_DOMAIN_LABELS[domain];
  if (known !== undefined) {
    return resolveLocalizedLabel(known, locale);
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
    return resolveLocalizedLabel(known, locale);
  }
  return null;
}
