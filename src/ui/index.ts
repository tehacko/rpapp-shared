/**
 * Shared UI primitives — import from `pi-kiosk-shared/ui`.
 */
export { Button, type ButtonProps } from './Button/Button.js';
export { Card, type CardProps } from './Card/Card.js';
export { FormField, type FormFieldProps } from './FormField/FormField.js';
export {
  LanguageToggle,
  type LanguageToggleProps,
  type LanguageToggleNamespace,
  type LanguageToggleSurface,
  type LanguageTogglePlacement,
} from './LanguageToggle/LanguageToggle.js';
export {
  CzechFlagSvg,
  EnglishFlagSvg,
  DEFAULT_LOCALE_FLAGS,
  LocaleFlagToggle,
  buildLocaleLabelKey,
  mergeLocaleFlags,
  resolveActiveLocaleCode,
  resolveDocumentLang,
  type LocaleFlagOption,
  type LocaleFlagSvgComponent,
  type LocaleFlagSvgProps,
  type LocaleFlagTogglePlacement,
  type LocaleFlagToggleProps,
  type LocaleFlagToggleSurface,
} from './LocaleFlags/index.js';
export { useTurnstileAuth, type UseTurnstileAuthResult } from './Turnstile/useTurnstileAuth.js';
export { TurnstileWidget, type TurnstileWidgetProps } from './Turnstile/TurnstileWidget.js';
export { useTurnstileExecute, type UseTurnstileExecuteResult } from './Turnstile/useTurnstileExecute.js';
export {
  TurnstileExecuteWidget,
  type TurnstileExecuteWidgetProps,
} from './Turnstile/TurnstileExecuteWidget.js';
export {
  ProviderIcon,
  PROVIDER_ICON_ASSET_IDS,
  resolveProviderIconAssetId,
  type ProviderIconAssetId,
  type ProviderIconProps,
  type ProviderIconSize,
} from './ProviderIcon/index.js';
