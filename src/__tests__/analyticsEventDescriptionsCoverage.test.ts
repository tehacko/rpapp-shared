import { ANALYTICS_EVENT_NAMES } from '../analyticsEvents.js';
import { ANALYTICS_EVENT_DESCRIPTIONS } from '../analyticsEventDescriptions.js';

describe('analyticsEventDescriptionsCoverage', () => {
  it('covers every analytics event with non-empty cs and en descriptions', () => {
    for (const name of ANALYTICS_EVENT_NAMES) {
      const desc = ANALYTICS_EVENT_DESCRIPTIONS[name];
      expect(desc).toBeDefined();
      expect(desc.cs.trim().length).toBeGreaterThan(20);
      expect(desc.en.trim().length).toBeGreaterThan(20);
    }
    expect(Object.keys(ANALYTICS_EVENT_DESCRIPTIONS).length).toBe(ANALYTICS_EVENT_NAMES.length);
  });
});
