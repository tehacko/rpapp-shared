import { AUDIT_EVENT_CODES } from '../auditEventCodes.js';
import { AUDIT_EVENT_LABELS } from '../auditEventLabels.js';

describe('audit event labels coverage', () => {
  it('has a label for every audit event code', () => {
    for (const code of AUDIT_EVENT_CODES) {
      expect(AUDIT_EVENT_LABELS[code]).toBeDefined();
      expect(AUDIT_EVENT_LABELS[code].en.length).toBeGreaterThan(0);
      expect(AUDIT_EVENT_LABELS[code].cs.length).toBeGreaterThan(0);
      expect(AUDIT_EVENT_LABELS[code].cs).not.toBe(AUDIT_EVENT_LABELS[code].en);
    }
    expect(Object.keys(AUDIT_EVENT_LABELS).length).toBe(AUDIT_EVENT_CODES.length);
  });
});
