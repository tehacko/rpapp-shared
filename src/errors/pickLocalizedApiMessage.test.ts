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
});
