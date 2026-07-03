import { describe, it, expect } from '@jest/globals';
import {
  ANALYTICS_METADATA_SCHEMA_VERSIONS,
  DEFAULT_ANALYTICS_METADATA_SCHEMA_VERSION,
  isSupportedAnalyticsMetadataSchemaVersion,
} from '../analyticsEvents.js';

describe('schemaVersion', () => {
  it('exposes supported metadata schema versions', () => {
    expect(ANALYTICS_METADATA_SCHEMA_VERSIONS).toEqual([1, 2]);
    expect(DEFAULT_ANALYTICS_METADATA_SCHEMA_VERSION).toBe(1);
  });

  it('accepts only known schema versions', () => {
    expect(isSupportedAnalyticsMetadataSchemaVersion(1)).toBe(true);
    expect(isSupportedAnalyticsMetadataSchemaVersion(2)).toBe(true);
    expect(isSupportedAnalyticsMetadataSchemaVersion(3)).toBe(false);
  });
});
