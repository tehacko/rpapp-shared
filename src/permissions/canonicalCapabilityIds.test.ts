/**
 * ADM-TKT-0206 / EVID-0206 — shared package exports canonical capability IDs (LOCKED SSOT).
 * Does not assert CapabilityMap drift (CI gate MISSING — ADV-CI-SCRIPTS-001).
 */
import {
  TENANT_ADMIN_EVENTS_SUBSCRIBE,
  TENANT_ADMIN_USERS_MANAGE,
  TENANT_ADMIN_USERS_VIEW,
  TENANT_BANK_INBOX_MANAGE,
  TENANT_PAYMENT_CLAIMS_APPROVE,
  TENANT_RECONCILIATION_READ,
} from './canonicalCapabilityIds.js';

describe('canonicalCapabilityIds shared export (ADM-TKT-0206)', () => {
  it('exports stable string IDs for CERT_SCOPE / payments / SSE pins', () => {
    expect(TENANT_ADMIN_EVENTS_SUBSCRIBE).toBe('tenant.adminEvents.subscribe');
    expect(TENANT_ADMIN_USERS_VIEW).toBe('tenant.adminUsers.view');
    expect(TENANT_ADMIN_USERS_MANAGE).toBe('tenant.adminUsers.manage');
    expect(TENANT_RECONCILIATION_READ).toBe('tenant.reconciliation.read');
    expect(TENANT_BANK_INBOX_MANAGE).toBe('tenant.bankInbox.manage');
    expect(TENANT_PAYMENT_CLAIMS_APPROVE).toBe('tenant.paymentClaims.approve');
  });

  it('re-exports from package root (pi-kiosk-shared barrel)', async () => {
    const root = await import('../index.js');
    expect(root.TENANT_ADMIN_EVENTS_SUBSCRIBE).toBe(TENANT_ADMIN_EVENTS_SUBSCRIBE);
    expect(root.TENANT_ADMIN_USERS_VIEW).toBe(TENANT_ADMIN_USERS_VIEW);
    expect(root.TENANT_ADMIN_USERS_MANAGE).toBe(TENANT_ADMIN_USERS_MANAGE);
    expect(root.TENANT_RECONCILIATION_READ).toBe(TENANT_RECONCILIATION_READ);
    expect(root.TENANT_BANK_INBOX_MANAGE).toBe(TENANT_BANK_INBOX_MANAGE);
    expect(root.TENANT_PAYMENT_CLAIMS_APPROVE).toBe(TENANT_PAYMENT_CLAIMS_APPROVE);
  });
});
