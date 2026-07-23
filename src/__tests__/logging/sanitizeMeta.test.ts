import { describe, expect, it } from '@jest/globals';

import { sanitizeMetaForLogEntry } from '../../logging/sanitizeMeta.js';

describe('sanitizeMetaForLogEntry', () => {
  it('returns undefined for empty / undefined meta', () => {
    expect(sanitizeMetaForLogEntry(undefined)).toBeUndefined();
    expect(sanitizeMetaForLogEntry({})).toBeUndefined();
  });

  it('strips reserved keys and relocates message to logContext', () => {
    const out = sanitizeMetaForLogEntry({
      message: 'ctx',
      level: 'error',
      app: 'spoof',
      timestamp: 't',
      environment: 'e',
      service: 's',
      appEnv: 'x',
      deploymentEnvironment: 'y',
      operation: 'pay',
    });

    expect(out).toEqual({
      logContext: 'ctx',
      operation: 'pay',
    });
  });

  it('preserves non-reserved keys', () => {
    expect(
      sanitizeMetaForLogEntry({
        module: 'm',
        feature: 'f',
        correlationId: 'c',
        errorCode: 'E',
      })
    ).toEqual({
      module: 'm',
      feature: 'f',
      correlationId: 'c',
      errorCode: 'E',
    });
  });
});
