import { describe, expect, it } from '@jest/globals';
import { buildLogoChipMarkStyle } from '../branding/logoChipMarkStyle.js';

describe('buildLogoChipMarkStyle', () => {
  it('returns undefined when rim and background are off', () => {
    expect(
      buildLogoChipMarkStyle({
        rim: { show: false, color: '#000000' },
        background: { show: false, color: '#ffffff' },
      }),
    ).toBeUndefined();
  });

  it('orgPicker variant sets rim shadow without login drop shadow', () => {
    expect(
      buildLogoChipMarkStyle({
        rim: { show: true, color: '#112233' },
        background: { show: false, color: '#ffffff' },
      }),
    ).toEqual({
      '--logo-chip-rim': '#112233',
      boxShadow: '0 0 0 1px var(--logo-chip-rim)',
    });
  });

  it('loginHero variant adds soft drop shadow with rim', () => {
    expect(
      buildLogoChipMarkStyle(
        {
          rim: { show: true, color: '#112233' },
          background: { show: false, color: '#ffffff' },
        },
        'loginHero',
      ),
    ).toEqual({
      '--logo-chip-rim': '#112233',
      boxShadow: '0 0 0 1px var(--logo-chip-rim), 0 4px 12px rgba(0,0,0,0.16)',
    });
  });

  it('background sets CSS var and backgroundColor', () => {
    expect(
      buildLogoChipMarkStyle({
        rim: { show: false, color: '#112233' },
        background: { show: true, color: '#f3f4f6' },
      }),
    ).toEqual({
      '--logo-chip-background': '#f3f4f6',
      backgroundColor: 'var(--logo-chip-background)',
      backgroundImage: 'none',
    });
  });
});
