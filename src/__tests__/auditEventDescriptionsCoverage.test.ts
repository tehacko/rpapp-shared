import { AUDIT_EVENT_CODES } from '../auditEventCodes.js';
import { AUDIT_EVENT_DESCRIPTIONS } from '../auditEventDescriptions.js';

describe('auditEventDescriptionsCoverage', () => {
  it('covers every audit event code with non-empty cs and en descriptions', () => {
    for (const code of AUDIT_EVENT_CODES) {
      const desc = AUDIT_EVENT_DESCRIPTIONS[code];
      expect(desc).toBeDefined();
      expect(desc.cs.trim().length).toBeGreaterThan(20);
      expect(desc.en.trim().length).toBeGreaterThan(20);
    }
    expect(Object.keys(AUDIT_EVENT_DESCRIPTIONS).length).toBe(AUDIT_EVENT_CODES.length);
  });
});
