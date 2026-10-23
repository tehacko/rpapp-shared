import { ENTITLEMENT_BLOCK_KEYS } from '../types.js';
import {
  CAPABILITY_ENTITLEMENT_REQUIREMENTS,
  NEVER_REQUIRED_BLOCK_KEYS,
  capabilitiesRequiringBlock,
  evaluateCapabilityEntitlement,
  expandAuthoringTokens,
  requiredBlocksForCapability,
} from '../capabilityEntitlementRequirements.js';

const FIXTURE_LIVE_IDS = [
  'finance:view:read',
  'finance:view:manage',
  'finance:detailed:read',
  'finance:detailed:manage',
  'finance:pii:read',
  'finance:pii:manage',
  'finance:export:read',
  'finance:export:manage',
  'system:health:read',
  'system:health:manage',
  'system:feature-flags:read',
  'system:feature-flags:manage',
  'system:secrets:read',
  'system:secrets:manage',
  'tenant.products.view',
  'tenant.products.manage',
  'ops:products:read',
  'ops:products:manage',
  'ops:inventory:read',
  'ops:inventory:manage',
  'ops:inventory:incident_review_high_impact',
  'config:pricing:read',
  'config:pricing:manage',
  'config:pricing:kiosk:override',
  'tenant.orders.pickup.scan',
  'tenant.orders.pickup.refuse',
  'loyalty:platform-campaigns:manage',
] as const;

describe('expandAuthoringTokens', () => {
  it('expands PIPE fully-qualified unions', () => {
    expect(
      expandAuthoringTokens(
        ['finance:view:*|finance:detailed:*|finance:pii:*|finance:export:*'],
        FIXTURE_LIVE_IDS,
      ),
    ).toEqual([
      'finance:detailed:manage',
      'finance:detailed:read',
      'finance:export:manage',
      'finance:export:read',
      'finance:pii:manage',
      'finance:pii:read',
      'finance:view:manage',
      'finance:view:read',
    ]);
  });

  it('expands SLASH last-segment forks against liveIds', () => {
    expect(expandAuthoringTokens(['ops:products:read/manage'], FIXTURE_LIVE_IDS)).toEqual([
      'ops:products:manage',
      'ops:products:read',
    ]);
    expect(expandAuthoringTokens(['tenant.products.view/manage'], FIXTURE_LIVE_IDS)).toEqual([
      'tenant.products.manage',
      'tenant.products.view',
    ]);
  });

  it('expands GLOB one-level only (never recursive)', () => {
    expect(expandAuthoringTokens(['config:pricing:*'], FIXTURE_LIVE_IDS)).toEqual([
      'config:pricing:manage',
      'config:pricing:read',
    ]);
    expect(expandAuthoringTokens(['tenant.products.*'], FIXTURE_LIVE_IDS)).toEqual([
      'tenant.products.manage',
      'tenant.products.view',
    ]);
  });

  it('expands LITERAL when present in liveIds', () => {
    expect(
      expandAuthoringTokens(['config:pricing:kiosk:override'], FIXTURE_LIVE_IDS),
    ).toEqual(['config:pricing:kiosk:override']);
  });

  it('rejects missing literal, empty glob, mixed slash+glob, and illegal pipe shorthand', () => {
    expect(() => expandAuthoringTokens(['not:in:live'], FIXTURE_LIVE_IDS)).toThrow(
      /literal .* not in liveIds/,
    );
    expect(() => expandAuthoringTokens(['missing:glob:*'], FIXTURE_LIVE_IDS)).toThrow(
      /matched no liveIds/,
    );
    expect(() => expandAuthoringTokens(['ops:products:read/*'], FIXTURE_LIVE_IDS)).toThrow(
      /mixed \/ and glob/,
    );
    expect(() =>
      expandAuthoringTokens(['finance:view|detailed|pii|export:*'], FIXTURE_LIVE_IDS),
    ).toThrow(/illegal pipe shorthand/);
  });

  it('forbids ops:inventory:* authoring glob', () => {
    expect(() => expandAuthoringTokens(['ops:inventory:*'], FIXTURE_LIVE_IDS)).toThrow(
      /forbids ops:inventory:\*/,
    );
  });
});

describe('CAPABILITY_ENTITLEMENT_REQUIREMENTS shape', () => {
  it('stores expanded literals only (no * | / in capabilityKeys)', () => {
    for (const row of CAPABILITY_ENTITLEMENT_REQUIREMENTS) {
      expect(row.capabilityKeys.length).toBeGreaterThan(0);
      for (const key of row.capabilityKeys) {
        expect(key).not.toMatch(/[*|/]/);
      }
    }
  });

  it('uses valid EntitlementBlockKey values on requiredBlockKeys', () => {
    const allowed = new Set<string>(ENTITLEMENT_BLOCK_KEYS);
    for (const row of CAPABILITY_ENTITLEMENT_REQUIREMENTS) {
      if (row.entitlementExempt === true) {
        expect(row.requiredBlockKeys).toBeUndefined();
        continue;
      }
      expect(row.requiredBlockKeys?.length).toBeGreaterThan(0);
      for (const block of row.requiredBlockKeys ?? []) {
        expect(allowed.has(block)).toBe(true);
      }
    }
  });

  it('uses ALL or ANY match on every grant row', () => {
    for (const row of CAPABILITY_ENTITLEMENT_REQUIREMENTS) {
      expect(['ALL', 'ANY']).toContain(row.match);
    }
  });

  it('never lists NEVER_REQUIRED_BLOCK_KEYS on any grant row', () => {
    const denylist = new Set<string>(NEVER_REQUIRED_BLOCK_KEYS);
    for (const row of CAPABILITY_ENTITLEMENT_REQUIREMENTS) {
      for (const block of row.requiredBlockKeys ?? []) {
        expect(denylist.has(block)).toBe(false);
      }
    }
  });

  it('maps config:pricing:manage/read to product_vending (not tax_management) — G1 SP price /me clip', () => {
    expect(requiredBlocksForCapability('config:pricing:manage')).toEqual({
      kind: 'blocks',
      blockKeys: ['product_vending'],
      match: 'ALL',
    });
    expect(requiredBlocksForCapability('config:pricing:read')).toEqual({
      kind: 'blocks',
      blockKeys: ['product_vending'],
      match: 'ALL',
    });
    expect(requiredBlocksForCapability('config:pricing:kiosk:override')).toEqual({
      kind: 'blocks',
      blockKeys: ['tax_management'],
      match: 'ALL',
    });
  });

  it('B2: accounting export caps require transactions; Hub finance caps stay on Hub ALL_OF', () => {
    const exportCaps = [
      'tenant.accountingExport.view',
      'tenant.accountingExport.create',
      'ops:accounting-export:read',
      'ops:accounting-export:create',
    ] as const;
    for (const cap of exportCaps) {
      expect(requiredBlocksForCapability(cap)).toEqual({
        kind: 'blocks',
        blockKeys: ['transactions'],
        match: 'ALL',
      });
    }
    expect(capabilitiesRequiringBlock('transactions')).toEqual(
      expect.arrayContaining([...exportCaps]),
    );

    const hubFinanceCaps = [
      'tenant.financeView.view',
      'tenant.financeView.manage',
      'tenant.financeDetailed.view',
      'tenant.financeDetailed.manage',
      'tenant.financePii.view',
      'tenant.financePii.manage',
      'tenant.financeExport.view',
      'tenant.financeExport.manage',
      'finance:view:read',
      'finance:view:manage',
      'finance:detailed:read',
      'finance:detailed:manage',
      'finance:pii:read',
      'finance:pii:manage',
      'finance:export:read',
      'finance:export:manage',
    ] as const;
    const hubAllOf = {
      kind: 'blocks' as const,
      blockKeys: ['payments_hub_ui', 'bank_inbox_claims_api'],
      match: 'ALL' as const,
    };
    for (const cap of hubFinanceCaps) {
      expect(requiredBlocksForCapability(cap)).toEqual(hubAllOf);
    }
    for (const cap of exportCaps) {
      expect(requiredBlocksForCapability(cap)).not.toEqual(hubAllOf);
    }
  });

  it('G1: bankAccounts.* commercial path is CORE bank_account_administration (not payment_rails)', () => {
    expect(requiredBlocksForCapability('tenant.bankAccounts.read')).toEqual({
      kind: 'blocks',
      blockKeys: ['bank_account_administration'],
      match: 'ALL',
    });
    expect(requiredBlocksForCapability('tenant.bankAccounts.manage')).toEqual({
      kind: 'blocks',
      blockKeys: ['bank_account_administration'],
      match: 'ALL',
    });
    // paymentCredentials / config:payments stay on payment_rails — not required for banks CORE
    expect(requiredBlocksForCapability('tenant.paymentCredentials.view')).toEqual({
      kind: 'blocks',
      blockKeys: ['payment_rails_strategy'],
      match: 'ALL',
    });
    expect(requiredBlocksForCapability('config:payments:read')).toEqual({
      kind: 'blocks',
      blockKeys: ['payment_rails_strategy'],
      match: 'ALL',
    });
    expect(capabilitiesRequiringBlock('bank_account_administration')).toEqual(
      expect.arrayContaining(['tenant.bankAccounts.read', 'tenant.bankAccounts.manage']),
    );
    expect(capabilitiesRequiringBlock('bank_account_administration')).not.toEqual(
      expect.arrayContaining(['tenant.paymentCredentials.view', 'config:payments:read']),
    );
  });

  it('does not denylist CONDITIONAL incident_centre_ui (must be requirable)', () => {
    expect(NEVER_REQUIRED_BLOCK_KEYS).not.toContain('incident_centre_ui');
  });

  it('maps pickup scan/refuse/hold/reprint to staff_pickup_scan leaf only', () => {
    const pickupCaps = [
      'tenant.orders.pickup.scan',
      'tenant.orders.pickup.refuse',
      'tenant.orders.pickup.hold',
      'tenant.orders.pickup.reprint',
    ];
    for (const cap of pickupCaps) {
      expect(requiredBlocksForCapability(cap)).toEqual({
        kind: 'blocks',
        blockKeys: ['staff_pickup_scan'],
        match: 'ALL',
      });
    }
    for (const row of CAPABILITY_ENTITLEMENT_REQUIREMENTS) {
      expect(row.requiredBlockKeys ?? []).not.toContain('order_pickup_infrastructure');
    }
  });

  it('keeps commercial outbox caps entitlementExempt (Události tab ≠ outbox grant ceiling)', () => {
    expect(requiredBlocksForCapability('admin:outbox:read')).toEqual({ kind: 'exempt' });
    expect(requiredBlocksForCapability('admin:outbox:manage')).toEqual({ kind: 'exempt' });
    expect(requiredBlocksForCapability('tenant.outbox.view')).toEqual({ kind: 'exempt' });
    expect(requiredBlocksForCapability('tenant.outbox.manage')).toEqual({ kind: 'exempt' });
    // No ANY(SIC|notifications) reverse index — packs do not own outbox grant ceiling
    expect(capabilitiesRequiringBlock('incident_centre_ui')).toEqual([]);
    const notificationCaps = capabilitiesRequiringBlock('admin_notifications');
    for (const cap of [
      'admin:outbox:manage',
      'admin:outbox:read',
      'tenant.outbox.manage',
      'tenant.outbox.view',
    ] as const) {
      expect(notificationCaps).not.toContain(cap);
    }
    for (const row of CAPABILITY_ENTITLEMENT_REQUIREMENTS) {
      expect(row.match).not.toBe('ANY');
      expect(row.requiredBlockKeys ?? []).not.toContain('incident_centre_ui');
    }
  });

  it('keeps platform successIncident/outbox and dev:outbox entitlementExempt', () => {
    expect(requiredBlocksForCapability('platform.successIncident.view')).toEqual({
      kind: 'exempt',
    });
    expect(requiredBlocksForCapability('platform.successIncident.manage')).toEqual({
      kind: 'exempt',
    });
    expect(requiredBlocksForCapability('platform.outbox.view')).toEqual({ kind: 'exempt' });
    expect(requiredBlocksForCapability('platform.outbox.manage')).toEqual({ kind: 'exempt' });
    expect(requiredBlocksForCapability('dev:outbox:read')).toEqual({ kind: 'exempt' });
    expect(requiredBlocksForCapability('dev:outbox:manage')).toEqual({ kind: 'exempt' });
  });

  it('marks loyalty:platform-campaigns:manage as entitlementExempt', () => {
    expect(requiredBlocksForCapability('loyalty:platform-campaigns:manage')).toEqual({
      kind: 'exempt',
    });
  });

  it('exposes other exempt rows via requiredBlocksForCapability', () => {
    expect(requiredBlocksForCapability('tenant.policyApproval.manage')).toEqual({
      kind: 'exempt',
    });
    expect(requiredBlocksForCapability('principal.view')).toEqual({ kind: 'exempt' });
  });
});

describe('evaluateCapabilityEntitlement fail-closed / exempt', () => {
  it('returns not allowed for unmapped capabilities', () => {
    expect(
      evaluateCapabilityEntitlement('totally.unmapped.capability', {
        isWriteAllowed: () => true,
      }),
    ).toEqual({ allowed: false, missingBlockKeys: [] });
    expect(requiredBlocksForCapability('totally.unmapped.capability')).toEqual({
      kind: 'unmapped',
    });
  });

  it('allows exempt capabilities regardless of write-ALLOW predicate', () => {
    expect(
      evaluateCapabilityEntitlement('loyalty:platform-campaigns:manage', {
        isWriteAllowed: () => false,
      }),
    ).toEqual({ allowed: true, missingBlockKeys: [] });
  });

  it('requires every block write-ALLOW for ALL match', () => {
    expect(
      evaluateCapabilityEntitlement('ops:products:read', {
        isWriteAllowed: (block) => block === 'product_vending',
      }),
    ).toEqual({ allowed: true, missingBlockKeys: [] });
    expect(
      evaluateCapabilityEntitlement('ops:products:read', {
        isWriteAllowed: () => false,
      }),
    ).toEqual({ allowed: false, missingBlockKeys: ['product_vending'] });
  });

  it('treats commercial outbox grants as exempt regardless of SIC write-ALLOW', () => {
    expect(
      evaluateCapabilityEntitlement('admin:outbox:read', {
        isWriteAllowed: () => false,
      }),
    ).toEqual({ allowed: true, missingBlockKeys: [] });
    expect(
      evaluateCapabilityEntitlement('admin:outbox:manage', {
        isWriteAllowed: () => false,
      }),
    ).toEqual({ allowed: true, missingBlockKeys: [] });
    expect(
      evaluateCapabilityEntitlement('platform.successIncident.view', {
        isWriteAllowed: () => false,
      }),
    ).toEqual({ allowed: true, missingBlockKeys: [] });
  });
});

describe('many-to-many (no bijection claim)', () => {
  it('allows multiple capabilities to require the same block', () => {
    const donationCaps = capabilitiesRequiringBlock('donation');
    expect(donationCaps.length).toBeGreaterThan(1);
    for (const cap of donationCaps) {
      const lookup = requiredBlocksForCapability(cap);
      expect(lookup.kind).toBe('blocks');
      if (lookup.kind === 'blocks') {
        expect(lookup.blockKeys).toContain('donation');
      }
    }
  });

  it('allows one capability to require multiple blocks (ALL_OF)', () => {
    const recon = requiredBlocksForCapability('tenant.reconciliation.read');
    expect(recon).toEqual({
      kind: 'blocks',
      blockKeys: ['payments_hub_ui', 'bank_inbox_claims_api'],
      match: 'ALL',
    });
    const explore = requiredBlocksForCapability('analytics:pii:read');
    expect(explore).toEqual({
      kind: 'blocks',
      blockKeys: ['analytics_explore'],
      match: 'ALL',
    });
  });

  it('Package D: team lifecycle → team_management_core; RBAC grants stay permission_management_rbac', () => {
    const teamLifecycleCaps = [
      'tenant.adminUsers.view',
      'tenant.adminUsers.manage',
      'users:view:read',
      'users:view:manage',
      'users:admins:create',
    ] as const;
    for (const cap of teamLifecycleCaps) {
      expect(requiredBlocksForCapability(cap)).toEqual({
        kind: 'blocks',
        blockKeys: ['team_management_core'],
        match: 'ALL',
      });
    }
    expect(capabilitiesRequiringBlock('team_management_core')).toEqual(
      expect.arrayContaining([...teamLifecycleCaps]),
    );

    expect(requiredBlocksForCapability('tenant.adminUserCapabilities.view')).toEqual({
      kind: 'blocks',
      blockKeys: ['permission_management_rbac'],
      match: 'ALL',
    });
    expect(requiredBlocksForCapability('permissionsCatalog.view')).toEqual({
      kind: 'blocks',
      blockKeys: ['permission_management_rbac'],
      match: 'ALL',
    });
  });

  it('Package D: hold_floor override → inventory_operations; core inventory stays management', () => {
    const holdFloorCaps = [
      'tenant.orders.pickup.holdFloorOverride',
      'hold_floor_override',
      'ops:inventory:checkup.hold_floor_override',
    ] as const;
    for (const cap of holdFloorCaps) {
      expect(requiredBlocksForCapability(cap)).toEqual({
        kind: 'blocks',
        blockKeys: ['inventory_operations'],
        match: 'ALL',
      });
    }
    expect(capabilitiesRequiringBlock('inventory_operations')).toEqual(
      expect.arrayContaining([...holdFloorCaps]),
    );

    expect(requiredBlocksForCapability('ops:inventory:read')).toEqual({
      kind: 'blocks',
      blockKeys: ['inventory_management'],
      match: 'ALL',
    });
    expect(requiredBlocksForCapability('ops:inventory:manage')).toEqual({
      kind: 'blocks',
      blockKeys: ['inventory_management'],
      match: 'ALL',
    });
  });

  it('Package C: basic → analytics_basic; summary → analytics_overview (not explore)', () => {
    expect(requiredBlocksForCapability('analytics:basic:read')).toEqual({
      kind: 'blocks',
      blockKeys: ['analytics_basic'],
      match: 'ALL',
    });
    expect(requiredBlocksForCapability('analytics:basic:manage')).toEqual({
      kind: 'blocks',
      blockKeys: ['analytics_basic'],
      match: 'ALL',
    });
    expect(requiredBlocksForCapability('analytics:summary:read')).toEqual({
      kind: 'blocks',
      blockKeys: ['analytics_overview'],
      match: 'ALL',
    });
    expect(requiredBlocksForCapability('analytics:summary:manage')).toEqual({
      kind: 'blocks',
      blockKeys: ['analytics_overview'],
      match: 'ALL',
    });
    expect(requiredBlocksForCapability('analytics:detailed:read')).toEqual({
      kind: 'blocks',
      blockKeys: ['analytics_explore'],
      match: 'ALL',
    });
    expect(capabilitiesRequiringBlock('analytics_basic')).toEqual(
      expect.arrayContaining(['analytics:basic:read', 'analytics:basic:manage']),
    );
    expect(capabilitiesRequiringBlock('analytics_overview')).toEqual(
      expect.arrayContaining(['analytics:summary:read', 'analytics:summary:manage']),
    );
    expect(capabilitiesRequiringBlock('analytics_overview')).not.toEqual(
      expect.arrayContaining(['analytics:detailed:read', 'analytics:pii:read']),
    );
  });

  it('does not claim one-to-one invertibility', () => {
    const forDonation = capabilitiesRequiringBlock('donation');
    const forInventory = capabilitiesRequiringBlock('inventory_management');
    const intersection = forDonation.filter((c) => forInventory.includes(c));
    // Many-to-many: reverse map groups by block; blocks are not unique per capability.
    expect(forDonation.length).toBeGreaterThan(0);
    expect(forInventory.length).toBeGreaterThan(0);
    expect(intersection).toEqual([]);
  });
});
