import { evaluateNavEntitlement, evaluateNavEntitlementFromVisible } from '../evaluateNavEntitlement.js';

const VISIBLE_READ_ONLY = {
  runtimeMode: 'ENABLED',
  visibilityMode: 'VISIBLE',
  mutationMode: 'READ_ONLY',
} as const;

describe('evaluateNavEntitlement', () => {
  it('returns true when entitlement visible and grant satisfies cap', () => {
    expect(
      evaluateNavEntitlement({
        blockAxes: VISIBLE_READ_ONLY,
        grants: ['ops:products:read'],
        requiredCapability: 'ops:products:read',
      }),
    ).toBe(true);
  });

  it('returns false when entitlement hidden even with cap', () => {
    expect(
      evaluateNavEntitlement({
        blockAxes: {
          runtimeMode: 'ENABLED',
          visibilityMode: 'HIDDEN',
          mutationMode: 'READ_ONLY',
        },
        grants: ['ops:products:read'],
        requiredCapability: 'ops:products:read',
      }),
    ).toBe(false);
  });

  it('returns false when entitlement visible but cap missing', () => {
    expect(
      evaluateNavEntitlement({
        blockAxes: VISIBLE_READ_ONLY,
        grants: ['analytics:summary:read'],
        requiredCapability: 'ops:products:read',
      }),
    ).toBe(false);
  });

  it('returns false when both entitlement hidden and cap missing', () => {
    expect(
      evaluateNavEntitlement({
        blockAxes: {
          runtimeMode: 'DISABLED',
          visibilityMode: 'HIDDEN',
          mutationMode: 'READ_ONLY',
        },
        grants: [],
        requiredCapability: 'ops:products:read',
      }),
    ).toBe(false);
  });

  it('honors capability bridge when evaluating nav (users:admins:create → tenant.adminUsers.manage)', () => {
    expect(
      evaluateNavEntitlement({
        blockAxes: VISIBLE_READ_ONLY,
        grants: ['users:admins:create'],
        requiredCapability: 'tenant.adminUsers.manage',
      }),
    ).toBe(true);
  });

  it('evaluateNavEntitlementFromVisible matches blockAxes helper', () => {
    expect(
      evaluateNavEntitlementFromVisible({
        entitlementVisible: true,
        grants: ['ops:inventory:read'],
        requiredCapability: 'ops:inventory:read',
      }),
    ).toBe(true);
    expect(
      evaluateNavEntitlementFromVisible({
        entitlementVisible: false,
        grants: ['ops:inventory:read'],
        requiredCapability: 'ops:inventory:read',
      }),
    ).toBe(false);
  });
});
