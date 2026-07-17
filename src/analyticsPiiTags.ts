/**
 * PII classification tags for analytics metadata fields (plan G-CAT-04 / AN-008).
 */
import { ANALYTICS_EVENT_NAMES, type AnalyticsEventName } from './analyticsEvents.js';

export type AnalyticsPiiClass = 'none' | 'pseudonymous' | 'direct' | 'financial';

type AnalyticsPiiTagsByField = Readonly<Record<string, AnalyticsPiiClass>>;

const DEFAULT_CLIENT_SCREEN_TAGS: AnalyticsPiiTagsByField = {
  screen_name: 'none',
  previous_screen_name: 'none',
};

const EVENT_TAG_OVERRIDES: Partial<Record<AnalyticsEventName, AnalyticsPiiTagsByField>> = {
  qr_displayed: {
    ...DEFAULT_CLIENT_SCREEN_TAGS,
    payment_id: 'pseudonymous',
    surface: 'none',
  },
  menu_opened: {
    ...DEFAULT_CLIENT_SCREEN_TAGS,
    product_count: 'none',
  },
  product_selected: {
    ...DEFAULT_CLIENT_SCREEN_TAGS,
    product_id: 'pseudonymous',
    interaction_type: 'none',
  },
  account_logged_out: {
    ...DEFAULT_CLIENT_SCREEN_TAGS,
    logout_scope: 'none',
  },
  profile_updated: {
    ...DEFAULT_CLIENT_SCREEN_TAGS,
    fields_changed: 'none',
  },
  receipt_opened: {
    ...DEFAULT_CLIENT_SCREEN_TAGS,
    receipt_format: 'none',
  },
  receipt_created: {
    ...DEFAULT_CLIENT_SCREEN_TAGS,
    receipt_format: 'none',
    receipt_kind: 'none',
  },
  receipt_downloaded: {
    ...DEFAULT_CLIENT_SCREEN_TAGS,
    receipt_format: 'none',
    receipt_kind: 'none',
  },
  payment_started: {
    ...DEFAULT_CLIENT_SCREEN_TAGS,
    paymentMethod: 'none',
    amountMinor: 'financial',
    itemCount: 'none',
    amount_cents: 'financial',
  },
  payment_method_viewed: {
    ...DEFAULT_CLIENT_SCREEN_TAGS,
    available_methods: 'none',
    available_method_count: 'none',
    has_qr: 'none',
    has_card: 'none',
  },
  payment_confirmed: {
    ...DEFAULT_CLIENT_SCREEN_TAGS,
    amount_cents: 'financial',
    journey_code: 'none',
  },
  // PWA lifecycle — no PII fields (outcome/version are non-PII ops metadata)
  pwa_install_accepted: {},
  pwa_install_dismissed: {},
  pwa_update_shown: {},
  pwa_update_deferred: {},
  pwa_update_applied: {},
};

const SERVER_SIDE_EVENTS = new Set<AnalyticsEventName>([
  'product_barcode_assigned',
  'product_barcode_cleared',
  'product_barcode_alt_added',
  'product_barcode_alt_removed',
  'product_barcode_alt_promoted',
  'product_barcode_assign_conflict',
  'product_barcode_lookup_hit',
  'product_barcode_lookup_miss',
  'physical_card_issued',
  'physical_card_revoked',
  'promo_preview_evaluated',
  'promo_reward_activated',
  'promo_reward_redeemed',
  'promo_reward_rolled_back',
  'promo_progress_threshold_reached',
  'promo_stacking_rejected',
  'promo_budget_soft_stop',
  'promo_budget_exhausted',
  'recurring_payment_missed',
  'recurring_payment_received',
]);

function buildAnalyticsPiiFieldTags(): Readonly<Record<AnalyticsEventName, AnalyticsPiiTagsByField>> {
  const tags = {} as Record<AnalyticsEventName, AnalyticsPiiTagsByField>;
  for (const eventName of ANALYTICS_EVENT_NAMES) {
    if (EVENT_TAG_OVERRIDES[eventName] !== undefined) {
      tags[eventName] = EVENT_TAG_OVERRIDES[eventName];
      continue;
    }
    tags[eventName] = SERVER_SIDE_EVENTS.has(eventName)
      ? {}
      : DEFAULT_CLIENT_SCREEN_TAGS;
  }
  return tags;
}

export const ANALYTICS_PII_FIELD_TAGS: Readonly<
  Record<string, AnalyticsPiiTagsByField>
> = buildAnalyticsPiiFieldTags();

export function getAnalyticsPiiTagsForEvent(
  eventName: string,
): Readonly<Record<string, AnalyticsPiiClass>> | undefined {
  return ANALYTICS_PII_FIELD_TAGS[eventName];
}
