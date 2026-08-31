/**
 * G8 — LocalizedNameMap / normalizeNameLocales contract parity.
 *
 * Locks the shared shape + normalize semantics used by Product, Category,
 * DonationProject, SalesPoint (nameLocales + descriptionLocales), PickupPoint,
 * and PromoEvent (route/use-case layers).
 */
import {
  LOCALIZED_NAME_MAP_KEYS,
  LOCALIZED_TEXT_MAP_KEYS,
  NAME_LOCALES_PLAIN_SHAPE,
  TEXT_LOCALES_PLAIN_SHAPE,
  normalizeDescriptionLocales,
  normalizeNameLocales,
  resolveLocalizedDescription,
  type LocalizedNameMap,
  type LocalizedTextMap,
  type NameLocale,
} from './localizedNameMap.js';
import type { SalesPoint } from '../types.js';

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
    expect(mod.LOCALIZED_TEXT_MAP_KEYS).toEqual(LOCALIZED_TEXT_MAP_KEYS);
    expect(mod.NAME_LOCALES_PLAIN_SHAPE).toEqual(NAME_LOCALES_PLAIN_SHAPE);
    expect(mod.TEXT_LOCALES_PLAIN_SHAPE).toEqual(TEXT_LOCALES_PLAIN_SHAPE);
    expect(typeof mod.normalizeNameLocales).toBe('function');
    expect(typeof mod.normalizeDescriptionLocales).toBe('function');
    expect(typeof mod.resolveLocalizedDescription).toBe('function');
    expect(mod.normalizeNameLocales({ cs: 'Coffee' }, 'Coffee')).toBeNull();
    expect(mod.normalizeDescriptionLocales({ cs: 'Desc' }, 'Desc')).toBeNull();
  });

  it('SalesPoint accepts optional descriptionLocales (LocalizedTextMap)', () => {
    const sp: Pick<SalesPoint, 'description' | 'descriptionLocales'> = {
      description: 'Universal copy',
      descriptionLocales: { cs: 'Popis', en: 'Description' } satisfies LocalizedTextMap,
    };
    expect(sp.descriptionLocales?.cs).toBe('Popis');
    const nameOnly: LocalizedNameMap = sp.descriptionLocales ?? {};
    expect(nameOnly.en).toBe('Description');
  });

  it('description helpers share normalize/resolve semantics with name helpers', () => {
    const raw: LocalizedTextMap = { cs: '  Popis  ', en: 'Universal', sk: '' };
    expect(normalizeDescriptionLocales(raw, 'Universal')).toEqual({ cs: 'Popis' });
    expect(resolveLocalizedDescription('Universal', { cs: 'Popis' }, 'cs')).toBe('Popis');
  });
});
