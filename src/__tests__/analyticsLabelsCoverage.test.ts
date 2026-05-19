import { ANALYTICS_EVENT_NAMES } from '../analyticsEvents.js';
import { ANALYTICS_EVENT_LABELS } from '../analyticsEventLabels.js';

describe('analytics event labels coverage', () => {
  it('has a label for every analytics event name', () => {
    for (const name of ANALYTICS_EVENT_NAMES) {
      expect(ANALYTICS_EVENT_LABELS[name]).toBeDefined();
      expect(ANALYTICS_EVENT_LABELS[name].en.length).toBeGreaterThan(0);
      expect(ANALYTICS_EVENT_LABELS[name].cs.length).toBeGreaterThan(0);
    }
    expect(Object.keys(ANALYTICS_EVENT_LABELS).length).toBe(ANALYTICS_EVENT_NAMES.length);
  });
});
