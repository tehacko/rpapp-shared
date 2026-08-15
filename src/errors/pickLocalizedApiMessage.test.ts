import { pickLocalizedApiMessage } from './pickLocalizedApiMessage.js';

describe('pickLocalizedApiMessage', () => {
  const tri =
    'Neplatné přihlašovací údaje / Neplatné prihlasovacie údaje / Invalid credentials';

  it('picks CS / SK / EN by locale', () => {
    expect(pickLocalizedApiMessage(tri, 'cs')).toBe('Neplatné přihlašovací údaje');
    expect(pickLocalizedApiMessage(tri, 'sk')).toBe('Neplatné prihlasovacie údaje');
    expect(pickLocalizedApiMessage(tri, 'en')).toBe('Invalid credentials');
    expect(pickLocalizedApiMessage(tri, 'en-US')).toBe('Invalid credentials');
  });

  it('normalizes case and padding like backend (G5)', () => {
    expect(pickLocalizedApiMessage(tri, 'EN')).toBe('Invalid credentials');
    expect(pickLocalizedApiMessage(tri, 'SK')).toBe('Neplatné prihlasovacie údaje');
    expect(pickLocalizedApiMessage(tri, ' en')).toBe('Invalid credentials');
    expect(pickLocalizedApiMessage(tri, ' SK ')).toBe('Neplatné prihlasovacie údaje');
    expect(pickLocalizedApiMessage(tri, ' CS ')).toBe('Neplatné přihlašovací údaje');
  });

  it('picks CS / EN bilingual (sk falls back to CS segment)', () => {
    const bi = 'Zdroj nebyl nalezen / Resource not found';
    expect(pickLocalizedApiMessage(bi, 'cs')).toBe('Zdroj nebyl nalezen');
    expect(pickLocalizedApiMessage(bi, 'sk')).toBe('Zdroj nebyl nalezen');
    expect(pickLocalizedApiMessage(bi, 'en')).toBe('Resource not found');
  });

  it('leaves non slash-joined messages unchanged', () => {
    expect(pickLocalizedApiMessage('Toto pole je povinné', 'cs')).toBe('Toto pole je povinné');
    expect(pickLocalizedApiMessage('a / b / c / d', 'en')).toBe('a / b / c / d');
  });

  it('defaults unknown / missing locale to cs (platform default)', () => {
    expect(pickLocalizedApiMessage(tri, undefined)).toBe('Neplatné přihlašovací údaje');
    expect(pickLocalizedApiMessage(tri, '')).toBe('Neplatné přihlašovací údaje');
    expect(pickLocalizedApiMessage(tri, 'de')).toBe('Neplatné přihlašovací údaje');
    expect(pickLocalizedApiMessage(tri, 'fr-FR')).toBe('Neplatné přihlašovací údaje');
  });
});
