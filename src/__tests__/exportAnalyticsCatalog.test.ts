import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { ANALYTICS_EVENT_NAMES, ANALYTICS_TELEMETRY_CLASSES } from '../analyticsEvents.js';
import { resolveAnalyticsCatalogVersion } from '../analyticsCatalogVersion.js';

const CATALOG_YAML_PATH = join(process.cwd(), 'catalog', 'analytics-catalog.yaml');

interface CatalogYamlRow {
  readonly event: string;
  readonly catalogVersion: number;
  readonly telemetryClass: string;
}

function parseAnalyticsCatalogYaml(content: string): CatalogYamlRow[] {
  const rows: CatalogYamlRow[] = [];
  const blocks = content.split(/\n\s+- event: /);
  for (let i = 1; i < blocks.length; i += 1) {
    const block = blocks[i];
    const eventMatch = /^([a-z0-9_]+)/.exec(block);
    const catalogVersionMatch = /catalogVersion:\s*(\d+)/.exec(block);
    const telemetryClassMatch = /telemetryClass:\s*(\w+)/.exec(block);
    if (eventMatch === null || catalogVersionMatch === null || telemetryClassMatch === null) {
      throw new Error(`invalid catalog YAML block: ${block.slice(0, 80)}`);
    }
    rows.push({
      event: eventMatch[1],
      catalogVersion: Number(catalogVersionMatch[1]),
      telemetryClass: telemetryClassMatch[1],
    });
  }
  return rows;
}

function expectedCatalogEventNames(): string[] {
  return [...ANALYTICS_EVENT_NAMES].sort((a, b) => a.localeCompare(b));
}

describe('exportAnalyticsCatalog', () => {
  const yamlContent = readFileSync(CATALOG_YAML_PATH, 'utf8');
  const rows = parseAnalyticsCatalogYaml(yamlContent);
  const expectedNames = expectedCatalogEventNames();

  it('lists every v1 catalog event from analyticsEvents', () => {
    expect(rows.map((row) => row.event)).toEqual(expectedNames);
  });

  it('has one YAML row per catalog event', () => {
    const eventFieldCount = (yamlContent.match(/^\s+- event:/gm) ?? []).length;
    expect(rows).toHaveLength(expectedNames.length);
    expect(eventFieldCount).toBe(expectedNames.length);
  });

  it('assigns catalogVersion via resolveAnalyticsCatalogVersion', () => {
    for (const row of rows) {
      expect(row.catalogVersion).toBe(resolveAnalyticsCatalogVersion(row.event));
    }
  });

  it('defaults telemetryClass to OPERATIONAL', () => {
    for (const row of rows) {
      expect(row.telemetryClass).toBe(ANALYTICS_TELEMETRY_CLASSES.OPERATIONAL);
    }
  });

  it('is sorted alphabetically by event name', () => {
    const sorted = [...rows].sort((a, b) => a.event.localeCompare(b.event));
    expect(rows.map((row) => row.event)).toEqual(sorted.map((row) => row.event));
  });
});
