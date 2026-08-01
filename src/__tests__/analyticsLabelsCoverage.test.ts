import { ANALYTICS_EVENT_NAMES } from '../analyticsEvents.js';
import { ANALYTICS_EVENT_LABELS } from '../analyticsEventLabels.js';

/** Czech leftovers that must not appear in sk operator labels. */
const CZECH_MARKERS_IN_SK = [
  /když/i,
  /(?<!\p{L})nebo(?!\p{L})/iu,
  /(?<!\p{L})jen(?!\p{L})/iu,
  /(?<!\p{L})také(?!\p{L})/iu,
  /kter[éýá]/i,
  /ještě/i,
  /[řěů]/,
  /platební/i,
  /vyzvednut/i,
  /uživatel/i,
  /odměn/i,
  /slevov/i,
  /věrnostní/i,
  /čárov/i,
  /tlačítk/i,
  /(?<!\p{L})znovu(?!\p{L})/iu,
];

describe('analytics event labels coverage', () => {
  it('has a cs, en, and sk label for every analytics event name', () => {
    for (const name of ANALYTICS_EVENT_NAMES) {
      const label = ANALYTICS_EVENT_LABELS[name];
      expect(label).toBeDefined();
      expect(label.en.length).toBeGreaterThan(0);
      expect(label.cs.length).toBeGreaterThan(0);
      expect(label.sk).toBeDefined();
      expect(label.sk!.length).toBeGreaterThan(0);
      expect(label.cs).not.toBe(label.en);
      expect(label.sk).not.toBe(label.en);
      expect(label.sk).not.toBe(label.cs);
      expect(label.en).not.toMatch(/_/);
      expect(label.cs).not.toMatch(/_/);
      expect(label.sk).not.toMatch(/_/);
      for (const marker of CZECH_MARKERS_IN_SK) {
        expect(label.sk).not.toMatch(marker);
      }
    }
    expect(Object.keys(ANALYTICS_EVENT_LABELS).length).toBe(ANALYTICS_EVENT_NAMES.length);
  });
});
