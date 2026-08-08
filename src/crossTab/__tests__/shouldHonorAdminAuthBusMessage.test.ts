import { describe, expect, it } from '@jest/globals';
import { shouldHonorAdminAuthBusMessage } from '../shouldHonorAdminAuthBusMessage.js';

describe('shouldHonorAdminAuthBusMessage (G21 / XT-G12)', () => {
  it('always honors platform-scoped messages', () => {
    expect(
      shouldHonorAdminAuthBusMessage(
        { type: 'logout', tenantCode: 'tenant-a', scope: 'platform' },
        'tenant-b',
        { hasSession: true, homeTenantCode: 'tenant-b' }
      )
    ).toBe(true);
    expect(
      shouldHonorAdminAuthBusMessage(
        { type: 'login', tenantCode: 'other', scope: 'platform' },
        'tenant-b',
        { hasSession: true, homeTenantCode: null }
      )
    ).toBe(true);
  });

  it('pending (session + home missing): honors login/session-refreshed for URL tenant', () => {
    const pending = { hasSession: true, homeTenantCode: null as string | null };
    expect(
      shouldHonorAdminAuthBusMessage(
        { type: 'login', tenantCode: 'tenant-b' },
        'tenant-b',
        pending
      )
    ).toBe(true);
    expect(
      shouldHonorAdminAuthBusMessage(
        { type: 'session-refreshed', tenantCode: 'tenant-b' },
        'tenant-b',
        pending
      )
    ).toBe(true);
    expect(
      shouldHonorAdminAuthBusMessage(
        { type: 'logout', tenantCode: 'tenant-b', scope: 'tenant' },
        'tenant-b',
        pending
      )
    ).toBe(false);
    expect(
      shouldHonorAdminAuthBusMessage(
        { type: 'login', tenantCode: 'other' },
        'tenant-b',
        pending
      )
    ).toBe(false);
  });

  it('home set: honors only messages for homeTenantCode (not URL B)', () => {
    const ctx = { hasSession: true, homeTenantCode: 'tenant-a' };
    expect(
      shouldHonorAdminAuthBusMessage(
        { type: 'login', tenantCode: 'tenant-a' },
        'tenant-b',
        ctx
      )
    ).toBe(true);
    expect(
      shouldHonorAdminAuthBusMessage(
        { type: 'login', tenantCode: 'tenant-b' },
        'tenant-b',
        ctx
      )
    ).toBe(false);
  });

  it('guest (no session): honors messages for the URL tenant', () => {
    expect(
      shouldHonorAdminAuthBusMessage(
        { type: 'login', tenantCode: 'tenant-b' },
        'tenant-b',
        { hasSession: false, homeTenantCode: null }
      )
    ).toBe(true);
    expect(
      shouldHonorAdminAuthBusMessage(
        { type: 'login', tenantCode: 'other' },
        'tenant-b',
        { hasSession: false, homeTenantCode: null }
      )
    ).toBe(false);
  });
});
