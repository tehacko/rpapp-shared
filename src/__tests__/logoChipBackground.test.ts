import { describe, expect, it } from '@jest/globals';
import {
  DEFAULT_LOGO_CHIP_BACKGROUND_COLOR_DARK,
  DEFAULT_LOGO_CHIP_BACKGROUND_COLOR_LIGHT,
  DEFAULT_LOGO_CHIP_BACKGROUND_SETTINGS,
  isLogoChipBackgroundColor,
  normalizeLogoChipBackgroundSettings,
  resolveLogoChipBackgroundForTheme,
} from '../branding/logoChipBackground.js';

describe('isLogoChipBackgroundColor', () => {
  it('accepts #RRGGBB', () => {
    expect(isLogoChipBackgroundColor('#ffffff')).toBe(true);
    expect(isLogoChipBackgroundColor('#18181B')).toBe(true);
  });

  it('rejects non-#RRGGBB', () => {
    expect(isLogoChipBackgroundColor('#fff')).toBe(false);
    expect(isLogoChipBackgroundColor('ffffff')).toBe(false);
    expect(isLogoChipBackgroundColor(null)).toBe(false);
  });
});

describe('normalizeLogoChipBackgroundSettings', () => {
  it('returns defaults for null/non-object/absent fields', () => {
    expect(normalizeLogoChipBackgroundSettings(null)).toEqual(DEFAULT_LOGO_CHIP_BACKGROUND_SETTINGS);
    expect(normalizeLogoChipBackgroundSettings(undefined)).toEqual(
      DEFAULT_LOGO_CHIP_BACKGROUND_SETTINGS,
    );
    expect(normalizeLogoChipBackgroundSettings({})).toEqual(DEFAULT_LOGO_CHIP_BACKGROUND_SETTINGS);
  });

  it('preserves valid wire values', () => {
    expect(
      normalizeLogoChipBackgroundSettings({
        showLogoChipBackgroundLight: true,
        showLogoChipBackgroundDark: false,
        logoChipBackgroundColorLight: '#010203',
        logoChipBackgroundColorDark: '#fefefe',
      }),
    ).toEqual({
      showLogoChipBackgroundLight: true,
      showLogoChipBackgroundDark: false,
      logoChipBackgroundColorLight: '#010203',
      logoChipBackgroundColorDark: '#fefefe',
    });
  });

  it('coerces invalid slots to defaults', () => {
    expect(
      normalizeLogoChipBackgroundSettings({
        showLogoChipBackgroundLight: true,
        showLogoChipBackgroundDark: 'no',
        logoChipBackgroundColorLight: '#gg0000',
        logoChipBackgroundColorDark: DEFAULT_LOGO_CHIP_BACKGROUND_COLOR_DARK,
      }),
    ).toEqual({
      showLogoChipBackgroundLight: true,
      showLogoChipBackgroundDark: false,
      logoChipBackgroundColorLight: DEFAULT_LOGO_CHIP_BACKGROUND_COLOR_LIGHT,
      logoChipBackgroundColorDark: DEFAULT_LOGO_CHIP_BACKGROUND_COLOR_DARK,
    });
  });
});

describe('resolveLogoChipBackgroundForTheme', () => {
  const settings = {
    showLogoChipBackgroundLight: true,
    showLogoChipBackgroundDark: false,
    logoChipBackgroundColorLight: '#ffffff',
    logoChipBackgroundColorDark: '#18181b',
  };

  it('returns light show/color', () => {
    expect(resolveLogoChipBackgroundForTheme(settings, 'light')).toEqual({
      show: true,
      color: '#ffffff',
    });
  });

  it('returns dark show/color', () => {
    expect(resolveLogoChipBackgroundForTheme(settings, 'dark')).toEqual({
      show: false,
      color: '#18181b',
    });
  });
});
