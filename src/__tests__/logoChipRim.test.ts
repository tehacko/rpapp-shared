import { describe, expect, it } from '@jest/globals';
import {
  DEFAULT_LOGO_CHIP_RIM_COLOR_DARK,
  DEFAULT_LOGO_CHIP_RIM_COLOR_LIGHT,
  DEFAULT_LOGO_CHIP_RIM_SETTINGS,
  isLogoChipRimColor,
  normalizeLogoChipRimSettings,
  resolveLogoChipRimForTheme,
} from '../branding/logoChipRim.js';

describe('isLogoChipRimColor', () => {
  it('accepts #RRGGBB', () => {
    expect(isLogoChipRimColor('#737373')).toBe(true);
    expect(isLogoChipRimColor('#AABBCC')).toBe(true);
  });

  it('rejects non-#RRGGBB', () => {
    expect(isLogoChipRimColor('#fff')).toBe(false);
    expect(isLogoChipRimColor('737373')).toBe(false);
    expect(isLogoChipRimColor(null)).toBe(false);
  });
});

describe('normalizeLogoChipRimSettings', () => {
  it('returns defaults for null/non-object/absent fields', () => {
    expect(normalizeLogoChipRimSettings(null)).toEqual(DEFAULT_LOGO_CHIP_RIM_SETTINGS);
    expect(normalizeLogoChipRimSettings(undefined)).toEqual(DEFAULT_LOGO_CHIP_RIM_SETTINGS);
    expect(normalizeLogoChipRimSettings({})).toEqual(DEFAULT_LOGO_CHIP_RIM_SETTINGS);
  });

  it('preserves valid wire values', () => {
    expect(
      normalizeLogoChipRimSettings({
        showLogoChipRimLight: true,
        showLogoChipRimDark: false,
        logoChipRimColorLight: '#010203',
        logoChipRimColorDark: '#fefefe',
      }),
    ).toEqual({
      showLogoChipRimLight: true,
      showLogoChipRimDark: false,
      logoChipRimColorLight: '#010203',
      logoChipRimColorDark: '#fefefe',
    });
  });

  it('coerces invalid slots to defaults', () => {
    expect(
      normalizeLogoChipRimSettings({
        showLogoChipRimLight: true,
        showLogoChipRimDark: 'no',
        logoChipRimColorLight: '#gg0000',
        logoChipRimColorDark: DEFAULT_LOGO_CHIP_RIM_COLOR_DARK,
      }),
    ).toEqual({
      showLogoChipRimLight: true,
      showLogoChipRimDark: false,
      logoChipRimColorLight: DEFAULT_LOGO_CHIP_RIM_COLOR_LIGHT,
      logoChipRimColorDark: DEFAULT_LOGO_CHIP_RIM_COLOR_DARK,
    });
  });
});

describe('resolveLogoChipRimForTheme', () => {
  const settings = {
    showLogoChipRimLight: true,
    showLogoChipRimDark: false,
    logoChipRimColorLight: '#111111',
    logoChipRimColorDark: '#eeeeee',
  };

  it('returns light show/color', () => {
    expect(resolveLogoChipRimForTheme(settings, 'light')).toEqual({
      show: true,
      color: '#111111',
    });
  });

  it('returns dark show/color', () => {
    expect(resolveLogoChipRimForTheme(settings, 'dark')).toEqual({
      show: false,
      color: '#eeeeee',
    });
  });
});
