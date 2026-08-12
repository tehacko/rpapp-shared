/**
 * G8 — LocalizedNameMap / normalizeNameLocales contract parity.
 *
 * Locks the shared shape + normalize semantics used by Product, Category,
 * DonationProject, SalesPoint, PickupPoint, and PromoEvent (route/use-case layers).
 */
import {
  LOCALIZED_NAME_MAP_KEYS,
  NAME_LOCALES_PLAIN_SHAPE,
  normalizeNameLocales,
  type LocalizedNameMap,
  type NameLocale,
} from './localizedNameMap.js';

describe('LocalizedNameMap contract parity (G8)', () => {
  it('exposes exactly cs/en/sk keys in LOCALIZED_NAME_MAP_KEYS and PLAIN_SHAPE', () => {
    expect(LOCALIZED_NAME_MAP_KEYS).toEqual(['cs', 'en', 'sk']);
    expect(Object.keys(NAME_LOCALES_PLAIN_SHAPE).sort()).toEqual(['cs', 'en', 'sk']);
    for (const key of LOCALIZED_NAME_MAP_KEYS) {
      expect(NAME_LOCALES_PLAIN_SHAPE[key]).toBe('string');
    }
  });

  it('LocalizedNameMap accepts optional string overrides only for NameLocale keys', () => {
    const map: LocalizedNameMap = { cs: 'Káva', en: 'Coffee', sk: 'Káva SK' };
    const locales: NameLocale[] = ['cs', 'en', 'sk'];
    for (const locale of locales) {
      expect(typeof map[locale]).toBe('string');
    }
  });

  it('normalizeNameLocales: universal-only (null/undefined) → null', () => {
    expect(normalizeNameLocales(null, 'Coffee')).toBeNull();
    expect(normalizeNameLocales(undefined, 'Coffee')).toBeNull();
    expect(normalizeNameLocales({}, 'Coffee')).toBeNull();
  });

  it('normalizeNameLocales: partial normalize (trim + drop empties)', () => {
    expect(
      normalizeNameLocales({ cs: '  Káva  ', en: '   ', sk: '' }, 'Coffee'),
    ).toEqual({ cs: 'Káva' });
  });

  it('normalizeNameLocales: omit locale values equal to universal name', () => {
    expect(
      normalizeNameLocales(
        { cs: 'Coffee', en: '  Coffee  ', sk: 'Káva' },
        'Coffee',
      ),
    ).toEqual({ sk: 'Káva' });
  });

  it('re-exports contract symbols from package entry', async () => {
    const mod = await import('../index.js');
    expect(mod.LOCALIZED_NAME_MAP_KEYS).toEqual(LOCALIZED_NAME_MAP_KEYS);
    expect(mod.NAME_LOCALES_PLAIN_SHAPE).toEqual(NAME_LOCALES_PLAIN_SHAPE);
    expect(typeof mod.normalizeNameLocales).toBe('function');
    expect(mod.normalizeNameLocales({ cs: 'Coffee' }, 'Coffee')).toBeNull();
  });
});
