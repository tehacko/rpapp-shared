import { describe, expect, it } from '@jest/globals';
import {
  buildPromoApplyAcceptLanguage,
  resolveApplyPromoEventDisplayName,
} from './resolveApplyPromoEventDisplayName.js';

describe('resolveApplyPromoEventDisplayName', () => {
  it('prefers client locale when nameLocales present', () => {
    expect(
      resolveApplyPromoEventDisplayName(
        {
          name: 'Summer deal',
          nameLocales: { cs: 'Letní akce', en: 'Summer deal EN' },
          eventName: 'Summer deal',
        },
        'cs',
      ),
    ).toBe('Letní akce');
  });

  it('falls back to server eventName when nameLocales null', () => {
    expect(
      resolveApplyPromoEventDisplayName(
        {
          name: 'Summer deal',
          nameLocales: null,
          eventName: 'Summer deal',
        },
        'sk',
      ),
    ).toBe('Summer deal');
  });
});

describe('buildPromoApplyAcceptLanguage', () => {
  it('maps BCP-47 tags to primary NameLocale', () => {
    expect(buildPromoApplyAcceptLanguage('en-GB')).toBe('en');
    expect(buildPromoApplyAcceptLanguage('cs-CZ')).toBe('cs');
  });
});
