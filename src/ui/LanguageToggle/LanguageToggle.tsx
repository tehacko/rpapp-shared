import { useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  DEFAULT_LOCALE_FLAGS,
  LocaleFlagToggle,
  buildLocaleLabelKey,
  mergeLocaleFlags,
  resolveActiveLocaleCode,
  resolveDocumentLang,
  type LocaleFlagOption,
  type LocaleFlagTogglePlacement,
  type LocaleFlagToggleSurface,
} from '../LocaleFlags/index.js';

export type LanguageToggleSurface = LocaleFlagToggleSurface;
export type LanguageToggleNamespace = 'admin' | 'kiosk' | 'customer' | 'pickup';
export type LanguageTogglePlacement = LocaleFlagTogglePlacement;

export interface LanguageToggleProps {
  readonly surface: LanguageToggleSurface;
  readonly i18nNamespace: LanguageToggleNamespace;
  readonly placement?: LanguageTogglePlacement;
  /** Extra locale flags appended after defaults; same `code` overrides a default entry. */
  readonly locales?: readonly LocaleFlagOption[];
  readonly dataTestId?: string;
}

export function LanguageToggle({
  surface,
  i18nNamespace,
  placement = 'floating',
  locales,
  dataTestId,
}: LanguageToggleProps): JSX.Element {
  const { t, i18n } = useTranslation(i18nNamespace);
  const availableLocales = useMemo(
    () => (locales ? mergeLocaleFlags(DEFAULT_LOCALE_FLAGS, locales) : DEFAULT_LOCALE_FLAGS),
    [locales],
  );
  const activeLocale = resolveActiveLocaleCode(i18n.language, availableLocales);

  useEffect(() => {
    document.documentElement.lang = resolveDocumentLang(activeLocale, availableLocales);
  }, [activeLocale, availableLocales]);

  const select = (code: string): void => {
    if (code === activeLocale) {
      return;
    }
    void i18n.changeLanguage(code);
  };

  const getLabel = (code: string): string =>
    t(buildLocaleLabelKey(code), { defaultValue: code.toUpperCase() });

  return (
    <LocaleFlagToggle
      locales={availableLocales}
      activeLocale={activeLocale}
      onSelect={select}
      getLabel={getLabel}
      groupLabel={t('shell.language.groupLabel', { defaultValue: 'Interface language' })}
      surface={surface}
      placement={placement}
      dataTestId={dataTestId}
    />
  );
}
