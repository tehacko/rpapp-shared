/**
 * Platform currency registry (v1: CZK + EUR, all exponent 2).
 * Extensible via this module + seed — not a Prisma enum.
 */

export const CURRENCY_CODES = ['CZK', 'EUR'] as const;

export type CurrencyCode = (typeof CURRENCY_CODES)[number];

export const PLATFORM_DEFAULT_CURRENCY: CurrencyCode = 'CZK';

export const CURRENCY_MINOR_EXPONENT = 2 as const;

export type CurrencyAcceptanceMode = 'SINGLE' | 'MULTI';

export function isCurrencyCode(value: unknown): value is CurrencyCode {
  return typeof value === 'string' && (CURRENCY_CODES as readonly string[]).includes(value);
}

/** Runtime shopper initial: CZK if allowed, else sole allow-list currency. */
export function resolveRuntimeDefaultCurrency(
  allowedCurrencies: readonly string[],
): CurrencyCode | null {
  const allowed = allowedCurrencies.filter(isCurrencyCode);
  if (allowed.length === 0) {
    return null;
  }
  if (allowed.includes('CZK')) {
    return 'CZK';
  }
  return allowed[0] ?? null;
}

export function assertCurrencyCode(value: string): CurrencyCode {
  if (!isCurrencyCode(value)) {
    throw new Error(`Unsupported currency code: ${value}`);
  }
  return value;
}

/** Normalize SP/tenant accepted list to registry codes (deduped, uppercased). */
export function normalizeAcceptedCurrencies(
  acceptedCurrencies: readonly string[] | null | undefined,
): CurrencyCode[] {
  const out: CurrencyCode[] = [];
  const seen = new Set<CurrencyCode>();
  for (const raw of acceptedCurrencies ?? []) {
    const trimmed = typeof raw === 'string' ? raw.trim().toUpperCase() : '';
    if (!isCurrencyCode(trimmed) || seen.has(trimmed)) {
      continue;
    }
    seen.add(trimmed);
    out.push(trimmed);
  }
  return out;
}

/**
 * Prefer tenant defaultCurrency if registry (+ ⊆ allow when allow non-empty); else runtime-default of allow; else PLATFORM_DEFAULT_CURRENCY.
 */
export function resolveHealPreferredDefault(input: {
  readonly defaultCurrency?: string | null;
  readonly allowedCurrencies?: readonly string[] | null;
}): CurrencyCode {
  const allow = normalizeAcceptedCurrencies(input.allowedCurrencies);
  const raw = typeof input.defaultCurrency === 'string' ? input.defaultCurrency.trim().toUpperCase() : '';
  if (isCurrencyCode(raw) && (allow.length === 0 || allow.includes(raw))) {
    return raw;
  }
  return resolveRuntimeDefaultCurrency(allow) ?? PLATFORM_DEFAULT_CURRENCY;
}

/**
 * Non-empty accepted list for public shop/checkout.
 * Prefer SP accepted when non-empty (preferredDefault ignored — only used when accepted empty);
 * else preferredDefault if registry; else CZK.
 */
export function ensureAcceptedCurrenciesForCheckout(
  acceptedCurrencies: readonly string[] | null | undefined,
  preferredDefault?: string | null,
): CurrencyCode[] {
  const accepted = normalizeAcceptedCurrencies(acceptedCurrencies);
  if (accepted.length > 0) return accepted;
  const pref = typeof preferredDefault === 'string' ? preferredDefault.trim().toUpperCase() : '';
  if (isCurrencyCode(pref)) return [pref];
  return [PLATFORM_DEFAULT_CURRENCY];
}

/**
 * Show checkout currency picker when SP is MULTI and ≥2 accepted currencies.
 */
export function shouldShowCheckoutCurrencyPicker(
  mode: string | null | undefined,
  acceptedCurrencies: readonly string[] | null | undefined,
): boolean {
  if (mode !== 'MULTI') {
    return false;
  }
  return normalizeAcceptedCurrencies(acceptedCurrencies).length >= 2;
}

export interface CatalogPriceRowLike {
  readonly currency: string;
  readonly amountMajor: number;
}

/**
 * Dual list prices: prefer ProductPrice-shaped row matching session currency.
 * When session currency is set: never soft-fall back to Product.price for a
 * missing currency (esp. EUR) — that would show a CZK-shaped amount.
 * Legacy `price` fallback only when session currency is absent/empty, or when
 * prices[] was never projected and session is CZK (admin/list convenience).
 */
export function resolveCatalogUnitPriceMajor(
  product: {
    readonly price: number;
    readonly prices?: readonly CatalogPriceRowLike[] | null;
  },
  sessionCurrency: string | null | undefined,
): number {
  const code =
    typeof sessionCurrency === 'string' ? sessionCurrency.trim().toUpperCase() : '';
  if (code.length > 0) {
    if (product.prices !== undefined && product.prices !== null) {
      for (const row of product.prices) {
        if (
          row.currency.trim().toUpperCase() === code &&
          Number.isFinite(row.amountMajor)
        ) {
          return row.amountMajor;
        }
      }
      // prices[] projected but no row for session currency — fail closed (0).
      return 0;
    }
    // No prices[] projection: allow legacy Product.price only for CZK sessions.
    if (code !== 'CZK') {
      return 0;
    }
  }
  return Number.isFinite(product.price) ? product.price : 0;
}
