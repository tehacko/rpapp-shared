#!/usr/bin/env node
/**
 * Phase 1 — DIFF gate for shared/src/tokens/tokens.sync.json vs CSS token sources.
 *
 * Default (CI): extract props from brand-bridge.css, theme.css, admin-theme.css,
 * compare to committed tokens.sync.json, exit 1 on mismatch (does NOT write).
 *
 * Intentional regenerate: `node scripts/gate-tokens-sync.mjs --write`
 *   or `npm run gate:tokens-sync:write`
 *
 * @see plan §A JSON→CSS sync · ADR-FE-BRAND-002
 */
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const SHARED_ROOT = join(__dirname, '..');
const TOKENS_DIR = join(SHARED_ROOT, 'src', 'tokens');

const INPUTS = ['brand-bridge.css', 'theme.css', 'admin-theme.css'];
const OUT_PATH = join(TOKENS_DIR, 'tokens.sync.json');

const writeMode = process.argv.includes('--write') || process.argv.includes('--regenerate');

const PROP_RE = /(--[a-zA-Z0-9-]+)\s*:\s*([^;]+);/g;

/**
 * @param {string} source
 * @param {string} fileName
 */
function extractProps(source, fileName) {
  /** @type {Record<string, string>} */
  const props = {};
  PROP_RE.lastIndex = 0;
  let match = PROP_RE.exec(source);
  while (match) {
    const name = match[1];
    const value = match[2].trim().replace(/\s+/g, ' ');
    // Last declaration wins within a file (dark/light overrides still listed)
    props[name] = value;
    match = PROP_RE.exec(source);
  }
  return { file: fileName, properties: props, count: Object.keys(props).length };
}

/**
 * Stable compare payload — drop generatedAt so clock skew never fails CI.
 * @param {unknown} artifact
 */
function normalizeForCompare(artifact) {
  if (!artifact || typeof artifact !== 'object') return artifact;
  const clone = structuredClone(artifact);
  if (clone && typeof clone === 'object' && 'generatedAt' in clone) {
    delete clone.generatedAt;
  }
  return clone;
}

/** @type {{ file: string, properties: Record<string, string>, count: number }[]} */
const files = [];

for (const name of INPUTS) {
  const path = join(TOKENS_DIR, name);
  const source = readFileSync(path, 'utf8');
  files.push(extractProps(source, name));
}

/** @type {Record<string, { file: string, value: string }>} */
const merged = {};
for (const file of files) {
  for (const [name, value] of Object.entries(file.properties)) {
    merged[name] = { file: file.file, value };
  }
}

const generatedAt = new Date().toISOString();
const artifact = {
  schemaVersion: 1,
  generatedAt,
  source: 'shared/scripts/gate-tokens-sync.mjs',
  inputs: INPUTS,
  files,
  mergedPropertyCount: Object.keys(merged).length,
  // Compact lookup for CI: property → owning file + value
  properties: merged,
};

if (writeMode) {
  writeFileSync(OUT_PATH, `${JSON.stringify(artifact, null, 2)}\n`, 'utf8');
  console.log(
    `gate-tokens-sync: wrote ${OUT_PATH.replace(/\\/g, '/')} (${String(artifact.mergedPropertyCount)} properties from ${String(INPUTS.length)} files)`,
  );
  process.exit(0);
}

if (!existsSync(OUT_PATH)) {
  console.error(
    `gate-tokens-sync: FAILED — missing ${OUT_PATH.replace(/\\/g, '/')}. Run: npm run gate:tokens-sync:write`,
  );
  process.exit(1);
}

let committed;
try {
  committed = JSON.parse(readFileSync(OUT_PATH, 'utf8'));
} catch (err) {
  console.error(
    `gate-tokens-sync: FAILED — cannot parse ${OUT_PATH.replace(/\\/g, '/')}: ${err instanceof Error ? err.message : String(err)}`,
  );
  process.exit(1);
}

const expected = JSON.stringify(normalizeForCompare(artifact), null, 2);
const actual = JSON.stringify(normalizeForCompare(committed), null, 2);

if (expected !== actual) {
  /** @type {string[]} */
  const diffs = [];
  const expProps = /** @type {Record<string, { file: string, value: string }>} */ (
    artifact.properties ?? {}
  );
  const actProps = /** @type {Record<string, { file: string, value: string }>} */ (
    committed?.properties ?? {}
  );
  const allKeys = new Set([...Object.keys(expProps), ...Object.keys(actProps)]);
  for (const key of [...allKeys].sort()) {
    const a = actProps[key];
    const e = expProps[key];
    if (!a) {
      diffs.push(`  + ${key} (missing in committed; expected from ${e?.file ?? '?'})`);
    } else if (!e) {
      diffs.push(`  - ${key} (in committed but not in CSS sources)`);
    } else if (a.value !== e.value || a.file !== e.file) {
      diffs.push(
        `  ~ ${key}: committed=${a.file}/${a.value}  expected=${e.file}/${e.value}`,
      );
    }
  }
  if (
    Number(committed?.mergedPropertyCount) !== Number(artifact.mergedPropertyCount)
  ) {
    diffs.unshift(
      `  mergedPropertyCount: committed=${String(committed?.mergedPropertyCount)} expected=${String(artifact.mergedPropertyCount)}`,
    );
  }

  console.error('gate-tokens-sync: FAILED — tokens.sync.json drift vs CSS sources:\n');
  for (const line of diffs.slice(0, 40)) {
    console.error(line);
  }
  if (diffs.length > 40) {
    console.error(`  … and ${String(diffs.length - 40)} more`);
  }
  console.error(
    `\nRecovery: update CSS to match committed artifact, or regenerate intentionally:\n  npm run gate:tokens-sync:write`,
  );
  process.exit(1);
}

console.log(
  `gate-tokens-sync: ok (${String(artifact.mergedPropertyCount)} properties; no drift)`,
);
process.exit(0);
