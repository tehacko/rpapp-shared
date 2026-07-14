import {
  buildPaymentSurfaceReadiness,
  countCustomerPayableVerifiedMethods,
  countKioskPayableVerifiedMethods,
  derivePaymentSurfaceMethodVerified,
  isMethodPayableForCount,
  type PaymentSurfaceMethodReadiness,
} from '../PaymentSurfaceReadiness.js';

function method(
  partial: Partial<PaymentSurfaceMethodReadiness> & Pick<PaymentSurfaceMethodReadiness, 'enabled'>,
): PaymentSurfaceMethodReadiness {
  return {
    ready: partial.ready ?? false,
    verified: partial.verified ?? false,
    enabled: partial.enabled,
  };
}

describe('PaymentSurfaceReadiness — Phase E counting (§10.E.2)', () => {
  it('counts customer QR + CARD when ready and verification not required', () => {
    const count = countCustomerPayableVerifiedMethods(
      {
        bankTransfer: method({ enabled: true, ready: true, verified: true }),
        gateway: method({ enabled: true, ready: true, verified: true }),
      },
      { requireVerified: false, walletPaymentsEnabled: false },
    );
    expect(count).toBe(2);
  });

  it('E-AC-3: omits WALLET when customerWalletPaymentsV1_1 flag is off', () => {
    const count = countCustomerPayableVerifiedMethods(
      {
        bankTransfer: method({ enabled: true, ready: true, verified: true }),
        gateway: method({ enabled: false, ready: false, verified: false }),
        wallet: method({ enabled: true, ready: true, verified: true }),
      },
      { requireVerified: false, walletPaymentsEnabled: false },
    );
    expect(count).toBe(1);
  });

  it('includes WALLET when v1.1 flag on and wallet rail is payable', () => {
    const count = countCustomerPayableVerifiedMethods(
      {
        bankTransfer: method({ enabled: false, ready: false, verified: false }),
        gateway: method({ enabled: false, ready: false, verified: false }),
        wallet: method({ enabled: true, ready: true, verified: true }),
      },
      { requireVerified: false, walletPaymentsEnabled: true },
    );
    expect(count).toBe(1);
  });

  it('requires verified when PAYMENT_WIRING_RUNTIME_REQUIRE_VERIFIED is true', () => {
    expect(
      isMethodPayableForCount(
        method({ enabled: true, ready: true, verified: false }),
        true,
      ),
    ).toBe(false);
    expect(
      isMethodPayableForCount(
        method({ enabled: true, ready: true, verified: true }),
        true,
      ),
    ).toBe(true);
  });

  it('counts kiosk qr + handoff + terminal + cash per rail rules', () => {
    const count = countKioskPayableVerifiedMethods(
      {
        bankTransfer: method({ enabled: true, ready: true, verified: true }),
        gateway: method({ enabled: false, ready: false, verified: false }),
        gatewayHandoff: method({ enabled: true, ready: true, verified: true }),
        terminal: method({ enabled: true, ready: true, verified: true }),
        cash: method({ enabled: true, ready: true, verified: false }),
      },
      false,
    );
    expect(count).toBe(4);
  });

  it('derivePaymentSurfaceMethodVerified treats NOT_VERIFIED as unverified', () => {
    expect(derivePaymentSurfaceMethodVerified({ ready: false, notVerified: true })).toBe(false);
    expect(derivePaymentSurfaceMethodVerified({ ready: true, notVerified: false })).toBe(true);
  });

  it('buildPaymentSurfaceReadiness preserves count and methods', () => {
    const methods = {
      bankTransfer: method({ enabled: true, ready: true, verified: true }),
      gateway: method({ enabled: false, ready: false, verified: false }),
    };
    const readiness = buildPaymentSurfaceReadiness({ methods, payableVerifiedMethodCount: 1 });
    expect(readiness.payableVerifiedMethodCount).toBe(1);
    expect(readiness.methods).toBe(methods);
  });
});
