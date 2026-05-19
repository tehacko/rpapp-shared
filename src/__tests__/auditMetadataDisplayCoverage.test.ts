import { AUDIT_EVENT_CODES } from '../auditEventCodes.js';
import { AUDIT_METADATA_DISPLAY_FIELDS } from '../auditMetadataDisplayFields.js';

const AUTH_GDPR_CODES = AUDIT_EVENT_CODES.filter(
  (code) => code.startsWith('auth.') || code.startsWith('gdpr.'),
);

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
    }
  });

  it('every AUTH and GDPR catalog code has at least one display field (S14)', () => {
    for (const code of AUTH_GDPR_CODES) {
      const fields = AUDIT_METADATA_DISPLAY_FIELDS[code];
      expect(fields?.length ?? 0).toBeGreaterThanOrEqual(1);
    }
  });
});
