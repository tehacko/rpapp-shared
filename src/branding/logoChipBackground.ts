/**
 * Logo chip background (fill behind square tenant marks).
 *
 * Consumers apply the active theme via CSS custom property `--logo-chip-background`:
 * set to `color` when `show` is true; omit/unset when hide.
 */

export interface LogoChipBackgroundSettings {
  readonly showLogoChipBackgroundLight: boolean;
  readonly showLogoChipBackgroundDark: boolean;
  readonly logoChipBackgroundColorLight: string; // #RRGGBB
  readonly logoChipBackgroundColorDark: string;
}

export const DEFAULT_LOGO_CHIP_BACKGROUND_COLOR_LIGHT = '#ffffff';
export const DEFAULT_LOGO_CHIP_BACKGROUND_COLOR_DARK = '#18181b';

export const DEFAULT_LOGO_CHIP_BACKGROUND_SETTINGS: LogoChipBackgroundSettings = {
  showLogoChipBackgroundLight: false,
  showLogoChipBackgroundDark: false,
  logoChipBackgroundColorLight: DEFAULT_LOGO_CHIP_BACKGROUND_COLOR_LIGHT,
  logoChipBackgroundColorDark: DEFAULT_LOGO_CHIP_BACKGROUND_COLOR_DARK,
};

export type LogoChipBackgroundTheme = 'light' | 'dark';

const HEX_RRGGBB = /^#[0-9A-Fa-f]{6}$/;

/** True when value is a `#RRGGBB` (case-insensitive hex digits). */
export function isLogoChipBackgroundColor(value: unknown): value is string {
  return typeof value === 'string' && HEX_RRGGBB.test(value);
}

function coerceBackgroundShow(value: unknown, fallback: boolean): boolean {
  return typeof value === 'boolean' ? value : fallback;
}

function coerceBackgroundColor(value: unknown, fallback: string): string {
  return isLogoChipBackgroundColor(value) ? value : fallback;
}

/**
 * Coerce wire/partial background fields to a full {@link LogoChipBackgroundSettings}.
 * Invalid or absent values become {@link DEFAULT_LOGO_CHIP_BACKGROUND_SETTINGS} slots —
 * fields are never stripped.
 */
export function normalizeLogoChipBackgroundSettings(raw: unknown): LogoChipBackgroundSettings {
  const row =
    raw !== null && typeof raw === 'object' ? (raw as Record<string, unknown>) : {};
  return {
    showLogoChipBackgroundLight: coerceBackgroundShow(
      row.showLogoChipBackgroundLight,
      DEFAULT_LOGO_CHIP_BACKGROUND_SETTINGS.showLogoChipBackgroundLight,
    ),
    showLogoChipBackgroundDark: coerceBackgroundShow(
      row.showLogoChipBackgroundDark,
      DEFAULT_LOGO_CHIP_BACKGROUND_SETTINGS.showLogoChipBackgroundDark,
    ),
    logoChipBackgroundColorLight: coerceBackgroundColor(
      row.logoChipBackgroundColorLight,
      DEFAULT_LOGO_CHIP_BACKGROUND_SETTINGS.logoChipBackgroundColorLight,
    ),
    logoChipBackgroundColorDark: coerceBackgroundColor(
      row.logoChipBackgroundColorDark,
      DEFAULT_LOGO_CHIP_BACKGROUND_SETTINGS.logoChipBackgroundColorDark,
    ),
  };
}

/**
 * Returns `{ show, color }` for the active theme.
 *
 * Consumers: when `show` is true, set CSS `--logo-chip-background` to `color`;
 * when hide, omit/unset `--logo-chip-background`.
 */
export function resolveLogoChipBackgroundForTheme(
  settings: LogoChipBackgroundSettings,
  theme: LogoChipBackgroundTheme,
): { readonly show: boolean; readonly color: string } {
  if (theme === 'dark') {
    return {
      show: settings.showLogoChipBackgroundDark,
      color: settings.logoChipBackgroundColorDark,
    };
  }
  return {
    show: settings.showLogoChipBackgroundLight,
    color: settings.logoChipBackgroundColorLight,
  };
}
