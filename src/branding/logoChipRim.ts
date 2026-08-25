/**
 * Logo chip rim (thin border around square tenant marks).
 *
 * Consumers apply the active theme via CSS custom property `--logo-chip-rim`:
 * set to `color` when `show` is true; omit/unset when hide.
 */

export interface LogoChipRimSettings {
  readonly showLogoChipRimLight: boolean;
  readonly showLogoChipRimDark: boolean;
  readonly logoChipRimColorLight: string; // #RRGGBB
  readonly logoChipRimColorDark: string;
}

export const DEFAULT_LOGO_CHIP_RIM_COLOR_LIGHT = '#737373';
export const DEFAULT_LOGO_CHIP_RIM_COLOR_DARK = '#a3a3a3';

export const DEFAULT_LOGO_CHIP_RIM_SETTINGS: LogoChipRimSettings = {
  showLogoChipRimLight: false,
  showLogoChipRimDark: false,
  logoChipRimColorLight: DEFAULT_LOGO_CHIP_RIM_COLOR_LIGHT,
  logoChipRimColorDark: DEFAULT_LOGO_CHIP_RIM_COLOR_DARK,
};

export type LogoChipRimTheme = 'light' | 'dark';

const HEX_RRGGBB = /^#[0-9A-Fa-f]{6}$/;

/** True when value is a `#RRGGBB` (case-insensitive hex digits). */
export function isLogoChipRimColor(value: unknown): value is string {
  return typeof value === 'string' && HEX_RRGGBB.test(value);
}

function coerceRimShow(value: unknown, fallback: boolean): boolean {
  return typeof value === 'boolean' ? value : fallback;
}

function coerceRimColor(value: unknown, fallback: string): string {
  return isLogoChipRimColor(value) ? value : fallback;
}

/**
 * Coerce wire/partial rim fields to a full {@link LogoChipRimSettings}.
 * Invalid or absent values become {@link DEFAULT_LOGO_CHIP_RIM_SETTINGS} slots —
 * fields are never stripped.
 */
export function normalizeLogoChipRimSettings(raw: unknown): LogoChipRimSettings {
  const row =
    raw !== null && typeof raw === 'object' ? (raw as Record<string, unknown>) : {};
  return {
    showLogoChipRimLight: coerceRimShow(
      row.showLogoChipRimLight,
      DEFAULT_LOGO_CHIP_RIM_SETTINGS.showLogoChipRimLight,
    ),
    showLogoChipRimDark: coerceRimShow(
      row.showLogoChipRimDark,
      DEFAULT_LOGO_CHIP_RIM_SETTINGS.showLogoChipRimDark,
    ),
    logoChipRimColorLight: coerceRimColor(
      row.logoChipRimColorLight,
      DEFAULT_LOGO_CHIP_RIM_SETTINGS.logoChipRimColorLight,
    ),
    logoChipRimColorDark: coerceRimColor(
      row.logoChipRimColorDark,
      DEFAULT_LOGO_CHIP_RIM_SETTINGS.logoChipRimColorDark,
    ),
  };
}

/**
 * Returns `{ show, color }` for the active theme.
 *
 * Consumers: when `show` is true, set CSS `--logo-chip-rim` to `color`;
 * when hide, omit/unset `--logo-chip-rim`.
 */
export function resolveLogoChipRimForTheme(
  settings: LogoChipRimSettings,
  theme: LogoChipRimTheme,
): { readonly show: boolean; readonly color: string } {
  if (theme === 'dark') {
    return {
      show: settings.showLogoChipRimDark,
      color: settings.logoChipRimColorDark,
    };
  }
  return {
    show: settings.showLogoChipRimLight,
    color: settings.logoChipRimColorLight,
  };
}
