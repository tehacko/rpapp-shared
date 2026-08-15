import { normalizeLabelLocale } from './localizedLabel.js';

describe('normalizeLabelLocale (G5 parity with backend)', () => {
  it.each([
    [undefined, 'cs'],
    ['', 'cs'],
    ['cs', 'cs'],
    ['CS', 'cs'],
    ['en', 'en'],
    ['EN', 'en'],
    ['en-US', 'en'],
    ['sk', 'sk'],
    ['SK', 'sk'],
    ['sk-SK', 'sk'],
    [' en', 'en'],
    [' EN ', 'en'],
    [' sk', 'sk'],
    [' SK ', 'sk'],
    ['de', 'cs'],
    [' fr-FR ', 'cs'],
  ] as const)('normalizeLabelLocale(%j) → %s', (input, expected) => {
    expect(normalizeLabelLocale(input)).toBe(expected);
  });
});
