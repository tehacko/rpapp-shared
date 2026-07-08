import {
  ANALYTICS_ALREADY_LIVE_EVENT_NAMES,
  ANALYTICS_EMITTER_BE_REFERENCE_PATHS,
  ANALYTICS_EMITTER_FE_REFERENCE_PATHS,
  ANALYTICS_EMITTER_MANIFEST,
  requiredManifestCellsForEvent,
} from '../analyticsEmitterManifest.js';

describe('analyticsEmitterManifest already-live slice (phase 4)', () => {
  it('declares four grep-verified already-live events', () => {
    expect([...ANALYTICS_ALREADY_LIVE_EVENT_NAMES]).toEqual([
      'tenant_switched',
      'slug_legacy_redirect',
      'recurring_payment_missed',
      'retail_pickup_slot_missed',
    ]);
  });

  for (const eventName of ANALYTICS_ALREADY_LIVE_EVENT_NAMES) {
    it(`${eventName} has required manifest cells in ANALYTICS_EMITTER_MANIFEST`, () => {
      const cells = requiredManifestCellsForEvent(eventName);
      expect(cells.length).toBeGreaterThan(0);

      for (const cell of cells) {
        const manifestCell = ANALYTICS_EMITTER_MANIFEST.find(
          (entry) =>
            entry.eventName === cell.eventName &&
            entry.surface === cell.surface &&
            entry.layer === cell.layer &&
            entry.reference === cell.reference,
        );
        expect(manifestCell).toBeDefined();
        expect(manifestCell?.required).toBe(true);
      }
    });
  }

  it('maps already-live manifest references to repo paths', () => {
    for (const eventName of ANALYTICS_ALREADY_LIVE_EVENT_NAMES) {
      for (const cell of requiredManifestCellsForEvent(eventName)) {
        if (cell.layer === 'FE') {
          expect(ANALYTICS_EMITTER_FE_REFERENCE_PATHS[cell.reference]).toBeDefined();
        } else {
          expect(ANALYTICS_EMITTER_BE_REFERENCE_PATHS[cell.reference]).toBeDefined();
        }
      }
    }
  });
});
