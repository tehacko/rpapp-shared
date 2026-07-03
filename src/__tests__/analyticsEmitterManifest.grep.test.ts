import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import {
  ANALYTICS_EMITTER_BE_REFERENCE_PATHS,
  ANALYTICS_EMITTER_MANIFEST,
  ANALYTICS_EMITTER_FE_REFERENCE_PATHS,
} from '../analyticsEmitterManifest.js';

const REPO_ROOT = join(__dirname, '..', '..', '..');

function readSource(relPath: string): string {
  const abs = join(REPO_ROOT, relPath);
  if (!existsSync(abs)) {
    throw new Error(`emitter grep: missing file ${relPath}`);
  }
  return readFileSync(abs, 'utf8');
}

function eventPatterns(
  eventName: string,
  reference: string
): RegExp[] {
  if (eventName === 'session_completed') {
    return [/completeSession\s*\(/];
  }
  if (eventName === 'session_abandoned' && reference === 'useKioskOrchestration') {
    return [/abandonSession\s*\(/];
  }
  const snake = eventName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return [
    new RegExp(`eventName:\\s*['"]${snake}['"]`),
    new RegExp(`ANALYTICS_V2_EXTENSION_EVENTS\\.${snake.toUpperCase().replace(/-/g, '_')}`),
    new RegExp(`ANALYTICS_[A-Z0-9_]+\\.${snake.toUpperCase().replace(/-/g, '_')}`, 'i'),
    new RegExp(`['"]${snake}['"]`),
  ];
}

describe('analyticsEmitterManifest grep wiring', () => {
  describe('BE path map (emit grep in up-backend)', () => {
    for (const cell of ANALYTICS_EMITTER_MANIFEST) {
      if (!cell.required || cell.layer !== 'BE') {
        continue;
      }
      it(`maps ${cell.reference} for ${cell.eventName}`, () => {
        expect(ANALYTICS_EMITTER_BE_REFERENCE_PATHS[cell.reference]).toBeDefined();
      });
    }
  });

  for (const cell of ANALYTICS_EMITTER_MANIFEST) {
    if (!cell.required || cell.layer !== 'FE') {
      continue;
    }
    const relPath = ANALYTICS_EMITTER_FE_REFERENCE_PATHS[cell.reference];
    if (relPath === undefined) {
      throw new Error(`missing FE path map for ${cell.reference}`);
    }

    it(`${cell.reference} wires ${cell.eventName}`, () => {
      const source = readSource(relPath);
      const matched = eventPatterns(cell.eventName, cell.reference).some((re) =>
        re.test(source)
      );
      expect(matched).toBe(true);
    });
  }
});
