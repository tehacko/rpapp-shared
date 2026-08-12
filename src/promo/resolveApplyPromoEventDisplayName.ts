import { resolveLocalizedName, toNameLocale } from '../labels/localizedNameMap.js';
import type { ApplyPromoCodeResponse } from './ApplyPromoCodeResponse.js';

type ApplyPromoNameSlice = Pick<ApplyPromoCodeResponse, 'eventName' | 'name' | 'nameLocales'>;

/**
 * Prefer client-side locale resolution when apply response includes nameLocales;
 * otherwise fall back to server-resolved `eventName`.
 */
export function resolveApplyPromoEventDisplayName(
  response: ApplyPromoNameSlice,
  locale: string,
): string {
  if (response.nameLocales != null) {
    const universal = response.name.trim().length > 0 ? response.name : response.eventName;
    return resolveLocalizedName(universal, response.nameLocales, locale);
  }
  return response.eventName;
}

/** Primary NameLocale tag for POST apply-code Accept-Language (matches backend `readApplyPromoUiLocale`). */
export function buildPromoApplyAcceptLanguage(language: string | undefined): string {
  return toNameLocale(language ?? 'cs') ?? 'cs';
}
