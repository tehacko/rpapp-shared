import { getAuditMetadataDisplayFields } from './auditMetadataDisplayFields.js';

describe('getAuditMetadataDisplayFields', () => {
  it('returns mapped fields for known code and empty fallback for unknown code', () => {
    expect(getAuditMetadataDisplayFields('auth.admin.login.success').length).toBeGreaterThan(0);
    expect(getAuditMetadataDisplayFields('unknown.code')).toEqual([]);
  });
});
