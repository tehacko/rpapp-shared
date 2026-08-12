/**
 * Optional per-locale display-name overrides for catalog entities
 * (products, categories, etc.) that also have a universal `name`.
 *
 * Distinct from {@link LocalizedLabel} (required cs/en UI copy maps).
 */

export type NameLocale = 'cs' | 'en' | 'sk';

export type LocalizedNameMap = {
  cs?: string;
  en?: string;
  sk?: string;
};

/** Keys accepted on {@link LocalizedNameMap}; useful for Zod / form iteration. */
export const LOCALIZED_NAME_MAP_KEYS = ['cs', 'en', 'sk'] as const satisfies readonly NameLocale[];

/**
 * Zod-friendly plain shape description (shared has no zod dependency).
 * Backend can build:
 * `z.object({ cs: z.string(), en: z.string(), sk: z.string() }).partial().optional().nullable()`
 * then `.transform((v) => normalizeNameLocales(v, universalName))`.
 */
export const NAME_LOCALES_PLAIN_SHAPE = {
  cs: 'string',
  en: 'string',
  sk: 'string',
} as const;

function isNameLocale(value: string): value is NameLocale {
  return value === 'cs' || value === 'en' || value === 'sk';
}

/** Map an i18n language / BCP-47 tag (or exact NameLocale) to a NameLocale. */
export function toNameLocale(locale: NameLocale | string): NameLocale | null {
  if (isNameLocale(locale)) {
    return locale;
  }
  if (locale.startsWith('sk')) {
    return 'sk';
  }
  if (locale.startsWith('cs')) {
    return 'cs';
  }
  if (locale.startsWith('en')) {
    return 'en';
  }
  return null;
}

/**
 * Trim, drop empties, omit locale values that equal the universal name.
 * Returns `null` when nothing remains (including null/undefined input).
 */
export function normalizeNameLocales(
  nameLocales: LocalizedNameMap | null | undefined,
  universalName: string,
): LocalizedNameMap | null {
  if (nameLocales == null) {
    return null;
  }

  const universalTrimmed = universalName.trim();
  const out: LocalizedNameMap = {};
  let hasAny = false;

  for (const locale of LOCALIZED_NAME_MAP_KEYS) {
    const raw = nameLocales[locale];
    if (raw == null) {
      continue;
    }
    const trimmed = String(raw).trim();
    if (trimmed.length === 0) {
      continue;
    }
    if (trimmed === universalTrimmed) {
      continue;
    }
    out[locale] = trimmed;
    hasAny = true;
  }

  return hasAny ? out : null;
}

/**
 * Prefer a non-empty locale override from `nameLocales`; otherwise the universal `name`.
 */
export function resolveLocalizedName(
  name: string,
  nameLocales: LocalizedNameMap | null | undefined,
  locale: NameLocale | string,
): string {
  if (nameLocales == null) {
    return name;
  }

  const key = toNameLocale(locale);
  if (key == null) {
    return name;
  }

  const override = nameLocales[key];
  if (override == null) {
    return name;
  }

  const trimmed = String(override).trim();
  return trimmed.length > 0 ? trimmed : name;
}
