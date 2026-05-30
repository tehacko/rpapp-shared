import { redactClientLogMeta, redactStringSecrets } from '../clientLogRedaction.js';

describe('clientLogRedaction', () => {
  it('redacts sensitive keys in metadata', () => {
    const out = redactClientLogMeta({
      operation: 'pay',
      customerEmail: 'buyer@example.com',
      token: 'secret-token-value',
      nested: { accountSlug: 'acme', ok: true },
    });

    expect(out).toEqual({
      operation: 'pay',
      customerEmail: '[REDACTED]',
      token: '[REDACTED]',
      nested: { accountSlug: '[REDACTED]', ok: true },
    });
  });

  it('redacts emails and bearer tokens in free-text strings', () => {
    const text = redactStringSecrets('User buyer@example.com failed Bearer abcdefghijklmnopqrst');
    expect(text).toContain('[REDACTED_EMAIL]');
    expect(text).toContain('Bearer [REDACTED]');
    expect(text).not.toContain('buyer@example.com');
  });
});
