/**
 * Retail commerce / fulfillment extension events (V7+).
 * Order must match `up-backend/.../analyticsEventCatalog.ts`.
 */
export const RETAIL_COMMERCE_EVENTS = {
  CHECKOUT_MODE_SELECTED: 'checkout_mode_selected',
  PICKUP_QR_ISSUED: 'pickup_qr_issued',
  PICKUP_QR_SCANNED: 'pickup_qr_scanned',
  PICKUP_STAFF_MARK_PAID: 'pickup_staff_mark_paid',
  CHECKOUT_HANDOFF_CREATED: 'checkout_handoff_created',
  CHECKOUT_HANDOFF_EXPIRED: 'checkout_handoff_expired',
  CHECKOUT_HANDOFF_COMPLETED: 'checkout_handoff_completed',
  BUY_AGAIN_STARTED: 'buy_again_started',
  BUY_AGAIN_TRIMMED: 'buy_again_trimmed',
  BUY_AGAIN_FAILED_STOCK: 'buy_again_failed_stock',
  SELF_SERVICE_SLA_NOTICE_SHOWN: 'self_service_sla_notice_shown',
  CUSTOMER_PICKUP_ACK_INFORMATIONAL: 'customer_pickup_ack_informational',
  PICKUP_PARTIAL_CONFIRM: 'pickup_partial_confirm',
  PICKUP_FULFILLMENT_REFUSED: 'pickup_fulfillment_refused',
  PICKUP_FULFILLMENT_HELD: 'pickup_fulfillment_held',
  PICKUP_FULFILLMENT_HOLD_RELEASED: 'pickup_fulfillment_hold_released',
  KIOSK_CASH_COMPLETE: 'kiosk_cash_complete',
  CHECKOUT_COLLECT_CONFIGURED: 'checkout_collect_configured',
  SLUG_LEGACY_REDIRECT: 'slug_legacy_redirect',
  TENANT_SWITCHED: 'tenant_switched',
} as const;

export type RetailCommerceEventName =
  (typeof RETAIL_COMMERCE_EVENTS)[keyof typeof RETAIL_COMMERCE_EVENTS];
