import type { CheckoutSubModeV3, PickupHandoffModeV3 } from '../checkout/sessionMetadataV3.js';

const HANDOFF_MODES = new Set<PickupHandoffModeV3>([
  'AUTO_ON_PAYMENT',
  'CUSTOMER_TAP',
  'SCAN_AT_STAND',
  'STAFF_SCAN',
]);

export function resolvePickupHandoffModeForCheckout(
  checkoutSubMode: CheckoutSubModeV3,
  commerceConfigJson?: Record<string, unknown> | null
): PickupHandoffModeV3 {
  const handoffDefaults = (commerceConfigJson?.handoffDefaults ?? {}) as Record<string, string>;
  const configured = handoffDefaults[checkoutSubMode];
  if (configured !== undefined && HANDOFF_MODES.has(configured as PickupHandoffModeV3)) {
    return configured as PickupHandoffModeV3;
  }
  if (checkoutSubMode === 'PREPAY_COLLECT_LATER' || checkoutSubMode === 'PAY_NOW_STAFF_HANDOFF') {
    return 'STAFF_SCAN';
  }
  return 'AUTO_ON_PAYMENT';
}
