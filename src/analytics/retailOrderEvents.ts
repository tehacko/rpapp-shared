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
} as const;

export type RetailOrderEventName = (typeof RETAIL_ORDER_EVENTS)[keyof typeof RETAIL_ORDER_EVENTS];

export const RETAIL_ORDER_EVENT_NAMES = Object.values(RETAIL_ORDER_EVENTS) as RetailOrderEventName[];
