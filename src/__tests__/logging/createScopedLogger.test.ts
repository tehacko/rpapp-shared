import { beforeEach, describe, expect, it, jest } from '@jest/globals';

import type { ClientLogger } from '../../logging/logSchema.js';
import { createScopedLogger } from '../../logging/createScopedLogger.js';

describe('createScopedLogger', () => {
  let base: jest.Mocked<ClientLogger>;

  beforeEach(() => {
    base = {
      info: jest.fn(),
      warn: jest.fn(),
      error: jest.fn(),
      debug: jest.fn(),
    };
  });

  it('merges scope into info calls', () => {
    const logger = createScopedLogger(base, { module: 'test-module', feature: 'kiosks' });
    logger.info('loaded', { operation: 'fetch' });
    expect(base.info).toHaveBeenCalledWith(
      'loaded',
      expect.objectContaining({
        module: 'test-module',
        feature: 'kiosks',
        operation: 'fetch',
      })
    );
  });

  it('prepends scope when first rest arg is not a plain object', () => {
    const logger = createScopedLogger(base, { module: 'sse' });
    const err = new Error('boom');
    logger.error('failed', err);
    expect(base.error).toHaveBeenCalledWith(
      'failed',
      expect.objectContaining({ module: 'sse' }),
      err
    );
  });

  it('passes scope alone when rest is empty', () => {
    const logger = createScopedLogger(base, { module: 'm', feature: 'f' });
    logger.warn('alone');
    expect(base.warn).toHaveBeenCalledWith('alone', {
      module: 'm',
      feature: 'f',
    });
  });
});
