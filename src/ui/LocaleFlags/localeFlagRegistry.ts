import {
  CzechFlagSvg,
  EnglishFlagSvg,
  SlovakFlagSvg,
  type LocaleFlagSvgComponent,
} from './flagSvgs.js';

export interface LocaleFlagOption {
  /** i18n language code passed to `i18n.changeLanguage` (e.g. `cs`, `en`, `sk`). */
  readonly code: string;
  readonly Flag: LocaleFlagSvgComponent;
  /** When omitted, matches `lng === code` or `lng.startsWith(code)`. */
  readonly matchesLanguage?: (lng: string) => boolean;
  /** Value for `document.documentElement.lang` when this locale is active. */
  readonly documentLang?: string;
}

function defaultMatchesLanguage(code: string, lng: string): boolean {
  return lng === code || lng.startsWith(`${code}-`) || lng.startsWith(code);
}

export const DEFAULT_LOCALE_FLAGS: readonly LocaleFlagOption[] = [
  {
    code: 'cs',
    Flag: CzechFlagSvg,
    matchesLanguage: (lng) => defaultMatchesLanguage('cs', lng),
    documentLang: 'cs',
  },
  {
    code: 'en',
    Flag: EnglishFlagSvg,
    matchesLanguage: (lng) => defaultMatchesLanguage('en', lng),
    documentLang: 'en',
  },
  {
    code: 'sk',
    Flag: SlovakFlagSvg,
    matchesLanguage: (lng) => defaultMatchesLanguage('sk', lng),
    documentLang: 'sk',
  },
] as const;

export function mergeLocaleFlags(
  base: readonly LocaleFlagOption[],
  extra: readonly LocaleFlagOption[],
): readonly LocaleFlagOption[] {
  const merged = new Map<string, LocaleFlagOption>();
  for (const option of base) {
    merged.set(option.code, option);
  }
  for (const option of extra) {
    merged.set(option.code, option);
  }
  return [...merged.values()];
}

export function resolveActiveLocaleCode(
  lng: string | undefined,
  locales: readonly LocaleFlagOption[],
): string {
  if (lng != null && lng !== '') {
    const matched = locales.find((option) =>
      option.matchesLanguage ? option.matchesLanguage(lng) : defaultMatchesLanguage(option.code, lng),
    );
    if (matched) {
      return matched.code;
    }
  }
  return locales[0]?.code ?? 'cs';
}

export function resolveDocumentLang(
  localeCode: string,
  locales: readonly LocaleFlagOption[],
): string {
  const option = locales.find((entry) => entry.code === localeCode);
  return option?.documentLang ?? localeCode;
}

export function buildLocaleLabelKey(code: string): string {
  return `shell.language.${code}`;
}
