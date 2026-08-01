/**
 * @jest-environment node
 *
 * Guards that every app locale catalog exposes shell.language.sk so the
 * shared LocaleFlagToggle never falls back to a raw "SK" code label.
 */
import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from '@jest/globals';

const repoRoot = path.resolve(__dirname, '../../../..');

const CATALOGS = [
  'admin-app/src/shared/i18n/locales/en/admin.json',
  'admin-app/src/shared/i18n/locales/cs/admin.json',
  'admin-app/src/shared/i18n/locales/sk/admin.json',
  'rpapp-customer/src/locales/en/customer.json',
  'rpapp-customer/src/locales/cs/customer.json',
  'rpapp-customer/src/locales/sk/customer.json',
  'rpapp-kiosk/src/locales/en/kiosk.json',
  'rpapp-kiosk/src/locales/cs/kiosk.json',
  'rpapp-kiosk/src/locales/sk/kiosk.json',
  'rpapp-pickup/src/locales/en/pickup.json',
  'rpapp-pickup/src/locales/cs/pickup.json',
  'rpapp-pickup/src/locales/sk/pickup.json',
] as const;

describe('shell.language.sk catalog parity', () => {
  it.each(CATALOGS)('%s defines shell.language.sk', (relativePath) => {
    const absolute = path.join(repoRoot, relativePath);
    expect(fs.existsSync(absolute)).toBe(true);
    const json = JSON.parse(fs.readFileSync(absolute, 'utf8')) as {
      shell?: { language?: { sk?: string; cs?: string; en?: string } };
      dev?: { wizard?: { languages?: { 'sk-SK'?: string } } };
    };
    expect(typeof json.shell?.language?.sk).toBe('string');
    expect((json.shell?.language?.sk ?? '').length).toBeGreaterThan(0);
    expect(typeof json.shell?.language?.cs).toBe('string');
    expect(typeof json.shell?.language?.en).toBe('string');
  });

  it('admin catalogs expose sk-SK tenant language option label', () => {
    for (const relativePath of [
      'admin-app/src/shared/i18n/locales/en/admin.json',
      'admin-app/src/shared/i18n/locales/cs/admin.json',
      'admin-app/src/shared/i18n/locales/sk/admin.json',
    ] as const) {
      const json = JSON.parse(
        fs.readFileSync(path.join(repoRoot, relativePath), 'utf8')
      ) as { dev?: { wizard?: { languages?: { 'sk-SK'?: string } } } };
      expect(typeof json.dev?.wizard?.languages?.['sk-SK']).toBe('string');
      expect((json.dev?.wizard?.languages?.['sk-SK'] ?? '').length).toBeGreaterThan(0);
    }
  });
});
