import {
  ENTITLEMENT_BLOCK_KEYS,
  TENANT_ENTITLEMENT_BLOCK_CATALOG,
  TENANT_ENTITLEMENT_BLOCK_COUNT,
  TENANT_ENTITLEMENT_CATALOG_VERSION,
  getEntitlementBlockCatalogEntry,
  isEntitlementBlockKey,
} from '../catalog.js';

describe('tenant entitlement catalog', () => {
  it('contains exactly 48 blocks', () => {
    expect(TENANT_ENTITLEMENT_BLOCK_COUNT).toBe(48);
    expect(TENANT_ENTITLEMENT_BLOCK_CATALOG).toHaveLength(48);
    expect(ENTITLEMENT_BLOCK_KEYS).toHaveLength(48);
  });

  it('uses catalog version 7 after analytics tab simplification', () => {
    expect(TENANT_ENTITLEMENT_CATALOG_VERSION).toBe(7);
  });

  it('has unique blockKeys matching ENTITLEMENT_BLOCK_KEYS order', () => {
    const keysFromCatalog = TENANT_ENTITLEMENT_BLOCK_CATALOG.map((entry) => entry.blockKey);
    expect(keysFromCatalog).toEqual([...ENTITLEMENT_BLOCK_KEYS]);
    expect(new Set(keysFromCatalog).size).toBe(48);
  });

  it('includes tenant_brand_kit as CONDITIONAL default-off under tenant_ops_settings', () => {
    const brandKit = getEntitlementBlockCatalogEntry('tenant_brand_kit');
    expect(brandKit.blockClass).toBe('CONDITIONAL');
    expect(brandKit.parentKeys).toEqual(['tenant_ops_settings']);
    expect(brandKit.capabilityHint).toBe('account.self.manage');
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

  it('includes analytics_overview and analytics_explore under analytics umbrella', () => {
    const overview = getEntitlementBlockCatalogEntry('analytics_overview');
    expect(overview.parentKeys).toEqual(['analytics']);
    expect(overview.adminNavSectionId).toBe('mission-control');
    expect(overview.capabilityHint).toBe('analytics:mission-control:read');

    const explore = getEntitlementBlockCatalogEntry('analytics_explore');
    expect(explore.parentKeys).toEqual(['analytics']);
    expect(explore.adminNavSectionId).toBe('analytics');
    expect(explore.capabilityHint).toBe('analytics:summary:read');
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
