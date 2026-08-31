import {
  LOCALIZED_TEXT_MAP_KEYS,
  normalizeDescriptionLocales,
  normalizeNameLocales,
  resolveLocalizedDescription,
  resolveLocalizedName,
  TEXT_LOCALES_PLAIN_SHAPE,
  toNameLocale,
  type LocalizedTextMap,
} from './localizedNameMap.js';

describe('normalizeNameLocales', () => {
  it('returns null for null/undefined input', () => {
    expect(normalizeNameLocales(null, 'Coffee')).toBeNull();
    expect(normalizeNameLocales(undefined, 'Coffee')).toBeNull();
  });

  it('trims values and drops empties', () => {
    expect(
      normalizeNameLocales({ cs: '  Káva  ', en: '   ', sk: '' }, 'Coffee'),
    ).toEqual({ cs: 'Káva' });
  });

  it('omits locale values equal to the universal name (trimmed)', () => {
    expect(
      normalizeNameLocales(
        { cs: 'Coffee', en: '  Coffee  ', sk: 'Káva' },
        '  Coffee  ',
      ),
    ).toEqual({ sk: 'Káva' });
  });

  it('returns null when every locale is empty or equals universal name', () => {
    expect(
      normalizeNameLocales({ cs: 'Coffee', en: ' ', sk: undefined }, 'Coffee'),
    ).toBeNull();
  });
});

describe('resolveLocalizedName', () => {
  const locales = { cs: 'Káva', en: 'Coffee EN', sk: '  ' };

  it('returns universal name when no locales or missing override', () => {
    expect(resolveLocalizedName('Coffee', null, 'cs')).toBe('Coffee');
    expect(resolveLocalizedName('Coffee', {}, 'cs')).toBe('Coffee');
    expect(resolveLocalizedName('Coffee', { en: 'Coffee EN' }, 'cs')).toBe('Coffee');
  });

  it('returns non-empty locale override', () => {
    expect(resolveLocalizedName('Coffee', locales, 'cs')).toBe('Káva');
    expect(resolveLocalizedName('Coffee', locales, 'en')).toBe('Coffee EN');
  });

  it('falls back to universal name for whitespace-only override', () => {
    expect(resolveLocalizedName('Coffee', locales, 'sk')).toBe('Coffee');
  });

  it('accepts BCP-47-ish locale tags via toNameLocale', () => {
    expect(resolveLocalizedName('Coffee', locales, 'cs-CZ')).toBe('Káva');
    expect(resolveLocalizedName('Coffee', locales, 'en-US')).toBe('Coffee EN');
  });
});

describe('toNameLocale', () => {
  it('maps exact and prefixed locales', () => {
    expect(toNameLocale('cs')).toBe('cs');
    expect(toNameLocale('sk-SK')).toBe('sk');
    expect(toNameLocale('de')).toBeNull();
  });
});

describe('LocalizedTextMap / description locale helpers', () => {
  it('TEXT_LOCALES_PLAIN_SHAPE and LOCALIZED_TEXT_MAP_KEYS mirror name contract', () => {
    expect(LOCALIZED_TEXT_MAP_KEYS).toEqual(['cs', 'en', 'sk']);
    expect(TEXT_LOCALES_PLAIN_SHAPE).toEqual({ cs: 'string', en: 'string', sk: 'string' });
  });

  it('normalizeDescriptionLocales delegates to normalizeNameLocales semantics', () => {
    expect(normalizeDescriptionLocales({ cs: 'Popis', en: 'Description' }, 'Default')).toEqual({
      cs: 'Popis',
      en: 'Description',
    });
    expect(normalizeDescriptionLocales({ cs: 'Default' }, 'Default')).toBeNull();
  });

  it('resolveLocalizedDescription delegates to resolveLocalizedName semantics', () => {
    const locales: LocalizedTextMap = { cs: 'Popis CS', en: 'Description EN' };
    expect(resolveLocalizedDescription('Default', locales, 'cs')).toBe('Popis CS');
    expect(resolveLocalizedDescription('Default', null, 'en')).toBe('Default');
  });
});
