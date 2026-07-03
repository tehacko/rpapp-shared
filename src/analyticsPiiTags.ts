/**
 * PII classification tags for analytics metadata fields (plan G-CAT-04 / AN-008).
 */
export type AnalyticsPiiClass = 'none' | 'pseudonymous' | 'direct' | 'financial';

export const ANALYTICS_PII_FIELD_TAGS: Readonly<
  Record<string, Readonly<Record<string, AnalyticsPiiClass>>>
> = {
  qr_displayed: {
    screen_name: 'none',
    previous_screen_name: 'none',
    payment_id: 'pseudonymous',
    surface: 'none',
  },
  menu_opened: {
    screen_name: 'none',
    previous_screen_name: 'none',
    product_count: 'none',
  },
  product_selected: {
    screen_name: 'none',
    previous_screen_name: 'none',
    product_id: 'pseudonymous',
    interaction_type: 'none',
  },
  auth_flow_started: {
    screen_name: 'none',
    previous_screen_name: 'none',
  },
  login_success: {
    screen_name: 'none',
    previous_screen_name: 'none',
  },
  account_created: {
    screen_name: 'none',
    previous_screen_name: 'none',
  },
  identity_completed: {
    screen_name: 'none',
    previous_screen_name: 'none',
  },
  account_logged_out: {
    screen_name: 'none',
    previous_screen_name: 'none',
    logout_scope: 'none',
  },
  profile_updated: {
    screen_name: 'none',
    previous_screen_name: 'none',
    fields_changed: 'none',
  },
  receipt_opened: {
    screen_name: 'none',
    previous_screen_name: 'none',
    receipt_format: 'none',
  },
  receipt_downloaded: {
    screen_name: 'none',
    previous_screen_name: 'none',
    receipt_format: 'none',
  },
  payment_started: {
    screen_name: 'none',
    previous_screen_name: 'none',
    paymentMethod: 'none',
    amountMinor: 'financial',
    itemCount: 'none',
    amount_cents: 'financial',
  },
  payment_confirmed: {
    screen_name: 'none',
    previous_screen_name: 'none',
    amount_cents: 'financial',
    journey_code: 'none',
  },
  identity_recognized: {
    screen_name: 'none',
    previous_screen_name: 'none',
  },
  identity_linked: {
    screen_name: 'none',
    previous_screen_name: 'none',
  },
  identity_deleted: {
    screen_name: 'none',
    previous_screen_name: 'none',
  },
  customer_deleted: {
    screen_name: 'none',
    previous_screen_name: 'none',
  },
};

export function getAnalyticsPiiTagsForEvent(
  eventName: string,
): Readonly<Record<string, AnalyticsPiiClass>> | undefined {
  return ANALYTICS_PII_FIELD_TAGS[eventName];
}
