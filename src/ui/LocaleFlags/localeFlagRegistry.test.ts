import { describe, expect, it } from '@jest/globals';
import {
  DEFAULT_LOCALE_FLAGS,
  mergeLocaleFlags,
  resolveActiveLocaleCode,
  resolveDocumentLang,
} from './localeFlagRegistry.js';
import { CzechFlagSvg } from './flagSvgs.js';

describe('localeFlagRegistry', () => {
  it('resolves cs, en, and sk from language tags', () => {
    expect(resolveActiveLocaleCode('cs-CZ', DEFAULT_LOCALE_FLAGS)).toBe('cs');
    expect(resolveActiveLocaleCode('en-US', DEFAULT_LOCALE_FLAGS)).toBe('en');
    expect(resolveActiveLocaleCode('sk', DEFAULT_LOCALE_FLAGS)).toBe('sk');
    expect(resolveActiveLocaleCode('sk-SK', DEFAULT_LOCALE_FLAGS)).toBe('sk');
    expect(resolveActiveLocaleCode(undefined, DEFAULT_LOCALE_FLAGS)).toBe('cs');
  });

  it('merges extra locales and lets overrides win by code', () => {
    const merged = mergeLocaleFlags(DEFAULT_LOCALE_FLAGS, [
      {
        code: 'de',
        Flag: CzechFlagSvg,
        documentLang: 'de',
      },
      {
        code: 'en',
        Flag: CzechFlagSvg,
        documentLang: 'en-GB',
      },
    ]);

    expect(merged).toHaveLength(4);
    expect(merged.find((entry) => entry.code === 'en')?.documentLang).toBe('en-GB');
  });

  it('resolves document lang from active locale option', () => {
    expect(resolveDocumentLang('en', DEFAULT_LOCALE_FLAGS)).toBe('en');
    expect(resolveDocumentLang('cs', DEFAULT_LOCALE_FLAGS)).toBe('cs');
    expect(resolveDocumentLang('sk', DEFAULT_LOCALE_FLAGS)).toBe('sk');
  });
});
