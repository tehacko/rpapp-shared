/**
 * Phase E — per-rail payment surface readiness and payable method counting.
 * Shared across backend public-config / customer sales-point APIs and frontends.
 */

export interface PaymentSurfaceMethodReadiness {
  readonly enabled: boolean;
  readonly ready: boolean;
  readonly verified: boolean;
}

export interface PaymentSurfaceReadinessMethods {
  readonly bankTransfer: PaymentSurfaceMethodReadiness;
  readonly gateway: PaymentSurfaceMethodReadiness;
  readonly gatewayHandoff?: PaymentSurfaceMethodReadiness;
  readonly terminal?: PaymentSurfaceMethodReadiness;
  readonly cash?: PaymentSurfaceMethodReadiness;
  /** Customer wallet rails (Apple/Google Pay) — gated client-side by `customerWalletPaymentsV1_1`. */
  readonly wallet?: PaymentSurfaceMethodReadiness;
}

export interface PaymentSurfaceReadiness {
  readonly payableVerifiedMethodCount: number;
  readonly methods: PaymentSurfaceReadinessMethods;
}

export function derivePaymentSurfaceMethodVerified(input: {
  readonly ready: boolean;
  readonly notVerified: boolean;
}): boolean {
  if (input.notVerified) {
    return false;
  }
  return input.ready;
}

/** §10.E.2 — count when enabled, ready, and verified (or ready-only when verification not required). */
export function isMethodPayableForCount(
  method: PaymentSurfaceMethodReadiness,
  requireVerified: boolean,
): boolean {
  if (!method.enabled || !method.ready) {
    return false;
  }
  if (!requireVerified) {
    return true;
  }
  return method.verified;
}

/** Kiosk cash rail — staff mode gate only; no wiring verification requirement. */
export function isCashMethodPayableForCount(method: PaymentSurfaceMethodReadiness): boolean {
  return method.enabled && method.ready;
}

export function countCustomerPayableVerifiedMethods(
  methods: PaymentSurfaceReadinessMethods,
  input: { readonly requireVerified: boolean; readonly walletPaymentsEnabled: boolean },
): number {
  let count = 0;
  if (isMethodPayableForCount(methods.bankTransfer, input.requireVerified)) {
    count += 1;
  }
  if (isMethodPayableForCount(methods.gateway, input.requireVerified)) {
    count += 1;
  }
  if (
    input.walletPaymentsEnabled &&
    methods.wallet !== undefined &&
    isMethodPayableForCount(methods.wallet, input.requireVerified)
  ) {
    count += 1;
  }
  // Customer cash — Approach A only via isMethodPayableForCount (BAN isCashMethodPayableForCount).
  if (methods.cash !== undefined && isMethodPayableForCount(methods.cash, input.requireVerified)) {
    count += 1;
  }
  return count;
}

export function countKioskPayableVerifiedMethods(
  methods: PaymentSurfaceReadinessMethods,
  requireVerified: boolean,
): number {
  let count = 0;
  if (isMethodPayableForCount(methods.bankTransfer, requireVerified)) {
    count += 1;
  }
  if (
    methods.gatewayHandoff !== undefined &&
    isMethodPayableForCount(methods.gatewayHandoff, requireVerified)
  ) {
    count += 1;
  }
  if (
    methods.terminal !== undefined &&
    isMethodPayableForCount(methods.terminal, requireVerified)
  ) {
    count += 1;
  }
  if (methods.cash !== undefined && isCashMethodPayableForCount(methods.cash)) {
    count += 1;
  }
  return count;
}

export function buildPaymentSurfaceReadiness(input: {
  readonly methods: PaymentSurfaceReadinessMethods;
  readonly payableVerifiedMethodCount: number;
}): PaymentSurfaceReadiness {
  return {
    methods: input.methods,
    payableVerifiedMethodCount: input.payableVerifiedMethodCount,
  };
}
