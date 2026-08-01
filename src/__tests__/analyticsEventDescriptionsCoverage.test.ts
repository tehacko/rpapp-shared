import { ANALYTICS_EVENT_NAMES } from '../analyticsEvents.js';
import { ANALYTICS_EVENT_DESCRIPTIONS } from '../analyticsEventDescriptions.js';

/** Czech leftovers that must not appear in sk operator copy. */
const CZECH_MARKERS_IN_SK = [
  /když/i,
  /(?<!\p{L})nebo(?!\p{L})/iu,
  /(?<!\p{L})jen(?!\p{L})/iu,
  /(?<!\p{L})také(?!\p{L})/iu,
  /kter[éýá]/i,
  /ještě/i,
  /(?<!\p{L})již(?!\p{L})/iu,
  /může/i,
  /(?<!\p{L})jsou(?!\p{L})/iu,
  /(?<!\p{L})pouze(?!\p{L})/iu,
  /(?<!\p{L})znovu(?!\p{L})/iu,
  /zvlášť/i,
  /protože/i,
  /(?<!\p{L})při(?!\p{L})/iu,
  /[řěů]/,
  /Počítá se/,
  /Jednou za/,
  /Není totéž/,
  /(?<!\p{L})se(?!\p{L})/iu,
];

describe('analyticsEventDescriptionsCoverage', () => {
  it('covers every analytics event with non-empty cs, en, and sk descriptions', () => {
    for (const name of ANALYTICS_EVENT_NAMES) {
      const desc = ANALYTICS_EVENT_DESCRIPTIONS[name];
      expect(desc).toBeDefined();
      expect(desc.cs.trim().length).toBeGreaterThan(20);
      expect(desc.en.trim().length).toBeGreaterThan(20);
      expect(desc.sk).toBeDefined();
      expect(desc.sk!.trim().length).toBeGreaterThan(20);
      expect(desc.sk).not.toBe(desc.en);
      expect(desc.sk).not.toBe(desc.cs);
      for (const marker of CZECH_MARKERS_IN_SK) {
        expect(desc.sk).not.toMatch(marker);
      }
    }
    expect(Object.keys(ANALYTICS_EVENT_DESCRIPTIONS).length).toBe(ANALYTICS_EVENT_NAMES.length);
  });
});
