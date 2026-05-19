import { AUDIT_EVENT_CODES } from '../auditEventCodes.js';
import {
  AUDIT_METADATA_DISPLAY_FIELDS,
  getAuditMetadataDisplayFields,
} from '../auditMetadataDisplayFields.js';

describe('audit metadata display fields coverage', () => {
  it('maps only valid audit event codes', () => {
    const mapped = Object.keys(AUDIT_METADATA_DISPLAY_FIELDS);
    for (const code of mapped) {
      expect(AUDIT_EVENT_CODES).toContain(code);
    }
  });

  it('each mapped code has at least one highlight with key and labelKey', () => {
    for (const [code, fields] of Object.entries(AUDIT_METADATA_DISPLAY_FIELDS)) {
      expect(fields?.length).toBeGreaterThan(0);
      for (const field of fields ?? []) {
        expect(field.key.length).toBeGreaterThan(0);
        expect(field.labelKey.length).toBeGreaterThan(0);
      }
      expect(getAuditMetadataDisplayFields(code).length).toBe(fields?.length ?? 0);
    }
  });

  it('has AUTH and GDPR highlights (Phase 2 minimum)', () => {
    const authWithHighlights = AUDIT_EVENT_CODES.filter(
      (code) => code.startsWith('auth.') && (AUDIT_METADATA_DISPLAY_FIELDS[code]?.length ?? 0) > 0,
    );
    const gdprWithHighlights = AUDIT_EVENT_CODES.filter(
      (code) => code.startsWith('gdpr.') && (AUDIT_METADATA_DISPLAY_FIELDS[code]?.length ?? 0) > 0,
    );
    expect(authWithHighlights.length).toBeGreaterThan(0);
    expect(gdprWithHighlights.length).toBeGreaterThan(0);
  });
});
