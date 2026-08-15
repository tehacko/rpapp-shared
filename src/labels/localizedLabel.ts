export type LabelLocale = 'cs' | 'en' | 'sk';

export type LabelAudience = 'operator' | 'technical';

export interface LocalizedLabel {
  readonly cs: string;
  readonly en: string;
  /** Optional; when omitted, `resolveLocalizedLabel` falls back sk → cs → en. */
  readonly sk?: string;
}

/**
 * Resolve a localized string. Fallback chain for missing entries: sk → cs → en.
 */
export function resolveLocalizedLabel(label: LocalizedLabel, locale: LabelLocale): string {
  if (locale === 'sk') {
    return label.sk ?? label.cs ?? label.en;
  }
  if (locale === 'cs') {
    return label.cs ?? label.en;
  }
  return label.en ?? label.cs;
}

/**
 * Map an i18n language / BCP-47 tag to a LabelLocale.
 * Trim + case-insensitive; unknown / missing → `cs` (platform default).
 * Must stay identical to backend `pickLocalizedApiMessage` locale normalize (G5).
 */
export function normalizeLabelLocale(language: string | undefined): LabelLocale {
  const primary = (language ?? 'cs').trim().toLowerCase();
  if (primary.startsWith('sk')) {
    return 'sk';
  }
  if (primary.startsWith('en')) {
    return 'en';
  }
  return 'cs';
}

export function dotNotationToLabel(code: string): LocalizedLabel {
  const en = code
    .split('.')
    .map((segment) =>
      segment
        .split('_')
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' '),
    )
    .join(' — ');
  return { en, cs: en, sk: en };
}

export function snakeCaseToLabel(name: string): LocalizedLabel {
  const en = name
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
  return { en, cs: en, sk: en };
}
