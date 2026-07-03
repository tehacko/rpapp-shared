/**
 * Catalog version resolution + v2 funnel metadata builders (Retail V1 Analytics P0).
 */
import {
  ANALYTICS_EVENT_CATALOG_VERSION,
  type AnalyticsEventName,
} from './analyticsEvents.js';
import {
  ANALYTICS_CATALOG_V2_VERSION,
  isAnalyticsV2ExtensionEventName,
  type AnalyticsV2ExtensionEventName,
} from './analyticsCatalogV2.js';

export { isAnalyticsV2ExtensionEventName };

export type AnalyticsTrackEventName = AnalyticsEventName | AnalyticsV2ExtensionEventName;

export interface ResolveClientAnalyticsCatalogVersionOptions {
  readonly catalogV2Enabled?: boolean;
}

export function resolveClientAnalyticsCatalogVersion(
  eventName: string,
  options: ResolveClientAnalyticsCatalogVersionOptions = {},
): 1 | 2 {
  if (options.catalogV2Enabled !== true) {
    return ANALYTICS_EVENT_CATALOG_VERSION;
  }
  return resolveAnalyticsCatalogVersion(eventName);
}

export function resolveAnalyticsCatalogVersion(eventName: string): 1 | 2 {
  if (isAnalyticsV2ExtensionEventName(eventName)) {
    return ANALYTICS_CATALOG_V2_VERSION;
  }
  return ANALYTICS_EVENT_CATALOG_VERSION;
}

export interface AnalyticsV2ScreenMetadataInput {
  readonly screenName?: string;
  readonly previousScreenName?: string;
}

export function buildAnalyticsV2ScreenMetadata(
  input: AnalyticsV2ScreenMetadataInput,
): Record<string, string> {
  const out: Record<string, string> = {};
  if (input.screenName !== undefined && input.screenName.length > 0) {
    out.screen_name = input.screenName;
  }
  if (input.previousScreenName !== undefined && input.previousScreenName.length > 0) {
    out.previous_screen_name = input.previousScreenName;
  }
  return out;
}

export function buildMenuOpenedMetadata(
  input: AnalyticsV2ScreenMetadataInput & { productCount?: number },
): Record<string, string | number> {
  return {
    ...buildAnalyticsV2ScreenMetadata(input),
    ...(input.productCount !== undefined ? { product_count: input.productCount } : {}),
  };
}

export function buildProductSelectedMetadata(
  input: AnalyticsV2ScreenMetadataInput & {
    productId: number | string;
    interactionType?: string;
  },
): Record<string, string | number> {
  return {
    ...buildAnalyticsV2ScreenMetadata(input),
    product_id: String(input.productId),
    ...(input.interactionType !== undefined ? { interaction_type: input.interactionType } : {}),
  };
}

export function buildQrDisplayedMetadata(
  input: AnalyticsV2ScreenMetadataInput & {
    paymentId?: string;
    surface?: string;
  },
): Record<string, string> {
  return {
    ...buildAnalyticsV2ScreenMetadata(input),
    ...(input.paymentId !== undefined ? { payment_id: input.paymentId } : {}),
    ...(input.surface !== undefined ? { surface: input.surface } : {}),
  };
}
