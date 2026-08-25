import {
  contrastRatio,
  directoryMonogramColors,
  directoryMonogramLabel,
  hashDirectoryMonogramId,
  hashDirectoryMonogramKey,
  resolveDirectoryMonogram,
  resolveDirectoryMonogramEntityId,
} from '../directoryMonogram.js';

function parseHex(hex: string): { r: number; g: number; b: number } {
  const normalized = hex.replace('#', '');
  return {
    r: Number.parseInt(normalized.slice(0, 2), 16),
    g: Number.parseInt(normalized.slice(2, 4), 16),
    b: Number.parseInt(normalized.slice(4, 6), 16),
  };
}

describe('directoryMonogram', () => {
  it('builds 1–2 graphemes from display name (name-first)', () => {
    expect(directoryMonogramLabel('Railway Cafe', 'other-code')).toBe('RC');
    expect(directoryMonogramLabel('Acme', 'zzz')).toBe('AC');
    expect(directoryMonogramLabel('  Café  ', null)).toBe('CA');
  });

  it('falls back to code when display name is empty', () => {
    expect(directoryMonogramLabel('', 'railway-cafe')).toBe('RC');
    expect(directoryMonogramLabel('   ', 'default')).toBe('DE');
    expect(directoryMonogramLabel('', '')).toBe('?');
  });

  it('hashes id stably and keeps WCAG AA text contrast', () => {
    expect(hashDirectoryMonogramId(42)).toBe(hashDirectoryMonogramId(42));
    expect(hashDirectoryMonogramId(1)).not.toBe(hashDirectoryMonogramId(2));

    for (const id of [0, 1, 7, 42, 99, 1001, 2_147_483_647]) {
      const colors = directoryMonogramColors(id);
      const ratio = contrastRatio(parseHex(colors.backgroundColor), parseHex(colors.textColor));
      expect(ratio).toBeGreaterThanOrEqual(4.5);
    }
  });

  it('resolveDirectoryMonogramEntityId prefers tenantId and hashes tenantCode stably', () => {
    expect(resolveDirectoryMonogramEntityId({ tenantId: 99, tenantCode: 'x' })).toBe(99);
    expect(hashDirectoryMonogramKey('railway-cafe')).toBe(
      hashDirectoryMonogramKey('railway-cafe'),
    );
    expect(
      resolveDirectoryMonogramEntityId({ tenantId: null, tenantCode: 'railway-cafe' }),
    ).toBe(hashDirectoryMonogramKey('railway-cafe'));
    expect(
      resolveDirectoryMonogramEntityId({ tenantId: null, tenantCode: 'railway-cafe' }),
    ).not.toBe(
      resolveDirectoryMonogramEntityId({ tenantId: null, tenantCode: 'railway-bookstore' }),
    );
  });

  it('resolveDirectoryMonogram combines label and colors', () => {
    const result = resolveDirectoryMonogram({
      id: 9,
      displayName: 'Railway Cafe',
      code: 'railway-cafe',
    });
    expect(result.label).toBe('RC');
    expect(result.backgroundColor).toMatch(/^#[0-9a-f]{6}$/);
    expect(result.textColor).toMatch(/^#[0-9a-f]{6}$/);
    expect(
      contrastRatio(parseHex(result.backgroundColor), parseHex(result.textColor)),
    ).toBeGreaterThanOrEqual(4.5);
  });
});
