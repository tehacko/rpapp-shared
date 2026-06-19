/**
 * Retail order fulfillment analytics events (Order Fulfillment plan §16).
 */
export const RETAIL_ORDER_EVENTS = {
  RETAIL_ORDER_PREPARED: 'retail_order_prepared',
  RETAIL_ORDER_READY: 'retail_order_ready',
  RETAIL_ORDER_COLLECTED: 'retail_order_collected',
  RETAIL_TICKET_CREATED: 'retail_ticket_created',
  RETAIL_PICKUP_SCHEDULED: 'retail_pickup_scheduled',
  RETAIL_PICKUP_SLOT_MISSED: 'retail_pickup_slot_missed',
  CHECKOUT_MODE_SELECTED: 'checkout_mode_selected',
  SELF_SERVICE_SLA_ACK_SHOWN: 'self_service_sla_ack_shown',
  SELF_SERVICE_SLA_ACK_CHECKED: 'self_service_sla_ack_checked',
  PICKUP_QR_ISSUED: 'pickup_qr_issued',
  PICKUP_QR_SCANNED: 'pickup_qr_scanned',
  PICKUP_STAFF_MARK_PAID: 'pickup_staff_mark_paid',
  SLUG_LEGACY_REDIRECT: 'slug_legacy_redirect',
  TENANT_SWITCHED: 'tenant_switched',
} as const;

export type RetailOrderEventName = (typeof RETAIL_ORDER_EVENTS)[keyof typeof RETAIL_ORDER_EVENTS];

export const RETAIL_ORDER_EVENT_NAMES = Object.values(RETAIL_ORDER_EVENTS) as RetailOrderEventName[];
