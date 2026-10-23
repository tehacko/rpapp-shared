import {
  ENTITLEMENT_BLOCK_KEYS,
  TENANT_ENTITLEMENT_BLOCK_CATALOG,
  TENANT_ENTITLEMENT_BLOCK_COUNT,
  TENANT_ENTITLEMENT_CATALOG_VERSION,
  getEntitlementBlockCatalogEntry,
  isEntitlementBlockKey,
} from '../catalog.js';

describe('tenant entitlement catalog', () => {
  it('contains exactly 51 blocks', () => {
    expect(TENANT_ENTITLEMENT_BLOCK_COUNT).toBe(51);
    expect(TENANT_ENTITLEMENT_BLOCK_CATALOG).toHaveLength(51);
    expect(ENTITLEMENT_BLOCK_KEYS).toHaveLength(51);
  });

  it('uses catalog version 11 after analytics_basic', () => {
    expect(TENANT_ENTITLEMENT_CATALOG_VERSION).toBe(11);
  });

  it('has unique blockKeys matching ENTITLEMENT_BLOCK_KEYS order', () => {
    const keysFromCatalog = TENANT_ENTITLEMENT_BLOCK_CATALOG.map((entry) => entry.blockKey);
    expect(keysFromCatalog).toEqual([...ENTITLEMENT_BLOCK_KEYS]);
    expect(new Set(keysFromCatalog).size).toBe(51);
  });

  it('includes tenant_brand_kit as CONDITIONAL default-off under tenant_ops_settings', () => {
    const brandKit = getEntitlementBlockCatalogEntry('tenant_brand_kit');
    expect(brandKit.blockClass).toBe('CONDITIONAL');
    expect(brandKit.parentKeys).toEqual(['tenant_ops_settings']);
    expect(brandKit.capabilityHint).toBe('account.self.manage');
  });

  it('includes product_barcode_administration as CONDITIONAL purpose-locked under product_vending', () => {
    const barcode = getEntitlementBlockCatalogEntry('product_barcode_administration');
    expect(barcode.blockClass).toBe('CONDITIONAL');
    expect(barcode.parentKeys).toEqual(['product_vending']);
    expect(barcode.notes).toMatch(/purpose-locked ON/i);
    expect(barcode.notes).toMatch(/not operator-toggleable/i);
    expect(barcode.notes).toMatch(/not default-off/i);
  });

  it('includes sales_point_individual_settings as CONDITIONAL default-off under sales_point_management', () => {
    const individual = getEntitlementBlockCatalogEntry('sales_point_individual_settings');
    expect(individual.blockClass).toBe('CONDITIONAL');
    expect(individual.parentKeys).toEqual(['sales_point_management']);
  });

  it('includes inventory_incidents as CONDITIONAL child of inventory_management', () => {
    const incidents = getEntitlementBlockCatalogEntry('inventory_incidents');
    expect(incidents.blockClass).toBe('CONDITIONAL');
    expect(incidents.parentKeys).toEqual(['inventory_management']);
    expect(incidents.adminNavSectionId).toBe('inventory-incidents');
    expect(incidents.capabilityHint).toBe('ops:inventory:read');
  });

  it('gdpr_consent_admin_ui has no tenant adminNavSectionId (platform DEV UI)', () => {
    const gdpr = getEntitlementBlockCatalogEntry('gdpr_consent_admin_ui');
    expect(gdpr.adminNavSectionId).toBeUndefined();
    expect(gdpr.notes).toMatch(/dev\/compliance/i);
  });

  it('audit_logs_admin_ui is CONDITIONAL (DEV Feature Policy allow/deny)', () => {
    const audit = getEntitlementBlockCatalogEntry('audit_logs_admin_ui');
    expect(audit.blockClass).toBe('CONDITIONAL');
    expect(audit.immutableDefaults).toBeUndefined();
    expect(audit.adminNavSectionId).toBe('audit-logs');
  });

  it('includes payment_cash as CONDITIONAL under payment_rails_strategy', () => {
    const paymentCash = getEntitlementBlockCatalogEntry('payment_cash');
    expect(paymentCash.blockClass).toBe('CONDITIONAL');
    expect(paymentCash.parentKeys).toEqual(['payment_rails_strategy']);
  });

  it('includes payment_multi_currency as CONDITIONAL under payment_rails_strategy', () => {
    const multi = getEntitlementBlockCatalogEntry('payment_multi_currency');
    expect(multi.blockClass).toBe('CONDITIONAL');
    expect(multi.parentKeys).toEqual(['payment_rails_strategy']);
    expect(multi.notes).toContain('EUR');
  });

  it('includes admin_notifications as CONDITIONAL default-off inbox block', () => {
    const notifications = getEntitlementBlockCatalogEntry('admin_notifications');
    expect(notifications.blockClass).toBe('CONDITIONAL');
    expect(notifications.parentKeys).toEqual([]);
    expect(notifications.routeSuffix).toBe('inbox');
  });

  it('includes incident_centre_ui as CONDITIONAL default-off Události block', () => {
    const incidentCentre = getEntitlementBlockCatalogEntry('incident_centre_ui');
    expect(incidentCentre.blockClass).toBe('CONDITIONAL');
    expect(incidentCentre.parentKeys).toEqual([]);
    expect(incidentCentre.routeSuffix).toBe('success-incident-centre');
    // G2: no capabilityHint equating outbox grants with Události
    expect(incidentCentre.capabilityHint).toBeUndefined();
    expect(incidentCentre.immutableDefaults).toBeUndefined();
    expect(incidentCentre.notes).toMatch(/default OFF/i);
    expect(incidentCentre.notes).toMatch(/Události|tab\/nav\/SIC/i);
    expect(incidentCentre.notes).toMatch(/not an outbox grant ceiling/i);
    expect(incidentCentre.notes).toMatch(/dev\/success-incident-centre/i);
    expect(incidentCentre.notes).toMatch(/capability-only|capability-gated/i);
    expect(incidentCentre.notes).toMatch(/dev\/inbox/i);
    expect(incidentCentre.notes).toMatch(/not (tenant-grant|commercial Feature Policy)/i);
    expect(incidentCentre.notes).toMatch(/FULL_DEMO_ALWAYS_OFF|not DEFAULT_OFF_ROLLOUT/i);
  });

  it('keeps admin_notifications inbox notes without outbox=Události claim', () => {
    const notifications = getEntitlementBlockCatalogEntry('admin_notifications');
    expect(notifications.capabilityHint).toBe('admin:outbox:read');
    expect(notifications.notes).toMatch(/inbox/i);
    expect(notifications.notes).toMatch(/Not Události|incident_centre_ui/i);
  });

  it('includes admin_mfa as CONDITIONAL default-off TOTP block under tenant_ops_settings', () => {
    const adminMfa = getEntitlementBlockCatalogEntry('admin_mfa');
    expect(adminMfa.blockClass).toBe('CONDITIONAL');
    expect(adminMfa.parentKeys).toEqual(['tenant_ops_settings']);
    expect(adminMfa.capabilityHint).toBe('account.self.manage');
  });

  it('chains analytics → basic → overview → explore with Package C metadata', () => {
    const basic = getEntitlementBlockCatalogEntry('analytics_basic');
    expect(basic.parentKeys).toEqual(['analytics']);
    expect(basic.adminNavSectionId).toBe('analytics');
    expect(basic.capabilityHint).toBe('analytics:basic:read');

    const overview = getEntitlementBlockCatalogEntry('analytics_overview');
    expect(overview.parentKeys).toEqual(['analytics_basic']);
    expect(overview.adminNavSectionId).toBe('mission-control');
    expect(overview.capabilityHint).toBe('analytics:summary:read');
    // C-AC-20: overview notes = PRO/Command Center + trend/AOV/refunds/breakdown/funnel
    expect(overview.notes).toMatch(/PRO|Command Center/i);
    expect(overview.notes).toMatch(/trend/i);
    expect(overview.notes).toMatch(/AOV/i);
    expect(overview.notes).toMatch(/refund/i);
    expect(overview.notes).toMatch(/breakdown/i);
    expect(overview.notes).toMatch(/funnel/i);

    const explore = getEntitlementBlockCatalogEntry('analytics_explore');
    expect(explore.parentKeys).toEqual(['analytics_overview']);
    expect(explore.adminNavSectionId).toBe('customer-explore');
    expect(explore.capabilityHint).toBe('analytics:detailed:read');
    // C-AC-20: explore notes = advanced/expert/benchmark/cohorts/baskets/event-governance; no funnel claim
    expect(explore.notes).toMatch(/advanced|expert/i);
    expect(explore.notes).toMatch(/benchmark/i);
    expect(explore.notes).toMatch(/cohort/i);
    expect(explore.notes).toMatch(/basket/i);
    expect(explore.notes).toMatch(/event-governance/i);
    expect(explore.notes).not.toMatch(/funnel/i);
  });

  it('includes customer_auth_pwa as CORE_REQUIRED under surface_customer', () => {
    const customerAuth = getEntitlementBlockCatalogEntry('customer_auth_pwa');
    expect(customerAuth.blockClass).toBe('CORE_REQUIRED');
    expect(customerAuth.parentKeys).toEqual(['surface_customer']);
  });

  it('includes normative loyalty, promotions, and reconciliation blocks', () => {
    const loyalty = getEntitlementBlockCatalogEntry('loyalty_program');
    expect(loyalty.parentKeys).toEqual(['product_vending']);

    const promotions = getEntitlementBlockCatalogEntry('promotions_program');
    expect(promotions.parentKeys).toEqual(['product_vending']);
    expect(promotions.capabilityHint).toBe('promo:rewards:read');

    const tenantOps = getEntitlementBlockCatalogEntry('tenant_ops_settings');
    expect(tenantOps.blockClass).toBe('CORE_REQUIRED');

    const bankAdmin = getEntitlementBlockCatalogEntry('bank_account_administration');
    expect(bankAdmin.blockClass).toBe('CORE_REQUIRED');
    expect(bankAdmin.parentKeys).toEqual([]);
    expect(bankAdmin.adminNavSectionId).toBe('bank-accounts');
    expect(bankAdmin.capabilityHint).toBe('tenant.bankAccounts.read');

    const reconciliation = getEntitlementBlockCatalogEntry('payment_reconciliation');
    expect(reconciliation.blockClass).toBe('STRATEGY');
    expect(reconciliation.defaultStrategy).toEqual({
      allowedModes: ['MODE_1', 'MODE_2'],
    });
  });

  it('lists staff_pickup_scan OR parents + required infra in catalog as SSOT (ENT-PR-03)', () => {
    const staffPickupScan = getEntitlementBlockCatalogEntry('staff_pickup_scan');
    expect(staffPickupScan.parentKeys).toEqual(['pickup_points', 'immediate_self_pickup']);
    expect(staffPickupScan.parentOperator).toBe('OR');
    expect(staffPickupScan.requiredParentKeys).toEqual(['order_pickup_infrastructure']);
  });

  it('keeps immediate_self_pickup independent of order_pickup_infrastructure', () => {
    const immediate = getEntitlementBlockCatalogEntry('immediate_self_pickup');
    expect(immediate.parentKeys).toEqual([]);
  });

  it('gates customer_self_collect on immediate_self_pickup AND order_pickup_infrastructure', () => {
    const selfCollect = getEntitlementBlockCatalogEntry('customer_self_collect');
    expect(selfCollect.parentKeys).toEqual(['immediate_self_pickup', 'order_pickup_infrastructure']);
  });

  it('reparents receipt_delivery under transactions (Wave 6 / Comms A)', () => {
    const receiptDelivery = getEntitlementBlockCatalogEntry('receipt_delivery');
    expect(receiptDelivery.blockClass).toBe('CONDITIONAL');
    expect(receiptDelivery.parentKeys).toEqual(['transactions']);
  });

  it('guards isEntitlementBlockKey for known and unknown keys', () => {
    expect(isEntitlementBlockKey('product_vending')).toBe(true);
    expect(isEntitlementBlockKey('platform_dev')).toBe(false);
    expect(isEntitlementBlockKey('surface_admin_tenant_ops')).toBe(false);
  });
});
