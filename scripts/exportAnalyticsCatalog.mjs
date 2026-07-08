#!/usr/bin/env node
/**
 * G-CAT-02 / AN-006 — export analytics-catalog.yaml from pi-kiosk-shared TS catalogs.
 *
 * Reads event names from dist/analyticsEvents.js,
 * uses canonical catalogVersion from dist/analyticsEvents.js, and writes
 * catalog/analytics-catalog.yaml (event, catalogVersion, telemetryClass).
 *
 * Usage: npm run export:catalog  (runs build first)
 */
import { existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';

const SCRIPT_DIR = dirname(fileURLToPath(import.meta.url));
const PACKAGE_ROOT = join(SCRIPT_DIR, '..');
const DIST_DIR = join(PACKAGE_ROOT, 'dist');
const OUTPUT_PATH = join(PACKAGE_ROOT, 'catalog', 'analytics-catalog.yaml');

const TELEMETRY_CLASS_OPERATIONAL = 'OPERATIONAL';

function ensureBuilt() {
  const required = [
    join(DIST_DIR, 'analyticsEvents.js'),
  ];
  if (required.every((path) => existsSync(path))) {
    return;
  }
  const build = spawnSync('npm', ['run', 'build'], {
    cwd: PACKAGE_ROOT,
    stdio: 'inherit',
    shell: true,
  });
  if (build.status !== 0) {
    process.exit(build.status ?? 1);
  }
}

/**
 * @param {Array<{ event: string; catalogVersion: number; telemetryClass: string }>} events
 */
export function serializeAnalyticsCatalogYaml(events) {
  const lines = [
    '# Analytics event catalog — generated from pi-kiosk-shared TypeScript sources.',
    '# Regenerate: npm run export:catalog',
    '',
    'events:',
  ];

  for (const row of events) {
    lines.push(`  - event: ${row.event}`);
    lines.push(`    catalogVersion: ${row.catalogVersion}`);
    lines.push(`    telemetryClass: ${row.telemetryClass}`);
  }

  return `${lines.join('\n')}\n`;
}

/**
 * @param {{
 *   analyticsEventNames: readonly string[];
 *   v2ExtensionEventNames: readonly string[];
 *   catalogVersion: number;
 * }} input
 */
export function buildAnalyticsCatalogEntries(input) {
  const seen = new Set();
  /** @type {Array<{ event: string; catalogVersion: number; telemetryClass: string }>} */
  const entries = [];

  const allNames = [...input.analyticsEventNames, ...input.v2ExtensionEventNames];
  for (const eventName of allNames) {
    if (seen.has(eventName)) {
      continue;
    }
    seen.add(eventName);
    entries.push({
      event: eventName,
      catalogVersion: input.catalogVersion,
      telemetryClass: TELEMETRY_CLASS_OPERATIONAL,
    });
  }

  entries.sort((a, b) => a.event.localeCompare(b.event));
  return entries;
}

export async function loadCatalogEntriesFromDist() {
  const { ANALYTICS_EVENT_NAMES, ANALYTICS_EVENT_CATALOG_VERSION } = await import(
    '../dist/analyticsEvents.js'
  );

  return buildAnalyticsCatalogEntries({
    analyticsEventNames: ANALYTICS_EVENT_NAMES,
    v2ExtensionEventNames: [],
    catalogVersion: ANALYTICS_EVENT_CATALOG_VERSION,
  });
}

export async function exportAnalyticsCatalog(outputPath = OUTPUT_PATH) {
  ensureBuilt();
  const entries = await loadCatalogEntriesFromDist();
  const yaml = serializeAnalyticsCatalogYaml(entries);
  mkdirSync(dirname(outputPath), { recursive: true });
  writeFileSync(outputPath, yaml, 'utf8');
  return { path: outputPath, eventCount: entries.length, entries };
}

const isMain = process.argv[1] !== undefined
  && fileURLToPath(import.meta.url) === process.argv[1];

if (isMain) {
  const result = await exportAnalyticsCatalog();
  console.log(`exportAnalyticsCatalog: wrote ${result.eventCount} events → ${result.path}`);
}
