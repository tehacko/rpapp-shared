#!/usr/bin/env node
/**
 * Fail prepublish when dist/*.d.ts files referenced by the main barrel are missing.
 * npm 2.3.3 shipped index.d.ts re-exports without several declaration files (Railway tsc failures).
 */
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const sharedRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const distRoot = path.join(sharedRoot, 'dist');
const indexDts = path.join(distRoot, 'index.d.ts');

if (!existsSync(indexDts)) {
  console.error('[gate-publish-dist-declarations] missing dist/index.d.ts — run npm run build:clean first');
  process.exit(1);
}

const REQUIRED = [
  'api.d.ts',
  'labels/localizedNameMap.d.ts',
  'checkout/sessionMetadataV3.d.ts',
  'checkout/sessionMetadataV4.d.ts',
  'checkout/sessionMetadataV5.d.ts',
];

const missing = REQUIRED.filter((rel) => !existsSync(path.join(distRoot, rel)));
if (missing.length > 0) {
  console.error('[gate-publish-dist-declarations] missing declaration files in dist/:');
  for (const rel of missing) {
    console.error(`  - ${rel}`);
  }
  process.exit(1);
}

const indexSource = readFileSync(indexDts, 'utf8');
const exportFromRe = /export\s+\*\s+from\s+'\.\/([^']+\.js)'/g;
const unresolved = [];
for (const match of indexSource.matchAll(exportFromRe)) {
  const relJs = match[1];
  const relDts = relJs.replace(/\.js$/, '.d.ts');
  const abs = path.join(distRoot, relDts);
  if (!existsSync(abs)) {
    unresolved.push(relDts);
  }
}

if (unresolved.length > 0) {
  console.error('[gate-publish-dist-declarations] index.d.ts re-exports missing .d.ts targets:');
  for (const rel of unresolved) {
    console.error(`  - ${rel}`);
  }
  process.exit(1);
}

console.log('[gate-publish-dist-declarations] ok');
