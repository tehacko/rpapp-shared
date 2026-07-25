/**
 * Restore corrupted admin-app sources from Jest transform cache source maps
 * (sourcesContent) when available and not empty-var corrupted.
 */
import { readdirSync, readFileSync, writeFileSync, existsSync, statSync } from 'node:fs';
import { join, basename } from 'node:path';

const CACHE =
  'C:/Users/corne/AppData/Local/Temp/jest/jest-transform-cache-0485b0528b6848eb3b168e252882afd5-79ef2876fae7ca75eedb2aa53dc48338';
const ADMIN = 'c:/Users/corne/Desktop/rpapp1/rpapp/admin-app/src';

function isCorrupted(content) {
  return /var\(\s*\)/.test(content);
}

function walk(dir, out = []) {
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    const p = join(dir, e.name);
    if (e.isDirectory()) walk(p, out);
    else if (e.isFile() && e.name.endsWith('.map')) out.push(p);
  }
  return out;
}

function normPath(p) {
  return p.replace(/\\/g, '/').toLowerCase();
}

/** @type {Map<string, string>} */
const byBase = new Map();
/** @type {Map<string, string>} */
const byFull = new Map();

let mapCount = 0;
for (const mapPath of walk(CACHE)) {
  let raw;
  try {
    raw = readFileSync(mapPath, 'utf8');
  } catch {
    continue;
  }
  let map;
  try {
    map = JSON.parse(raw);
  } catch {
    continue;
  }
  const sources = map.sources || [];
  const contents = map.sourcesContent || [];
  for (let i = 0; i < sources.length; i += 1) {
    const src = String(sources[i] || '');
    const content = contents[i];
    if (typeof content !== 'string' || !content) continue;
    if (isCorrupted(content)) continue;
    mapCount += 1;
    const base = basename(src).toLowerCase();
    byBase.set(base, content);
    // try to resolve admin-app relative
    const idx = src.replace(/\\/g, '/').toLowerCase().indexOf('/admin-app/src/');
    if (idx >= 0) {
      const rel = src.replace(/\\/g, '/').slice(idx + '/admin-app/src/'.length);
      byFull.set(normPath(join(ADMIN, rel)), content);
    }
  }
}

console.log(`maps_with_content=${String(mapCount)} unique_base=${String(byBase.size)} unique_full=${String(byFull.size)}`);

function walkSrc(dir, out = []) {
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    const p = join(dir, e.name);
    if (e.isDirectory()) {
      if (['node_modules', 'dist', 'coverage'].includes(e.name)) continue;
      walkSrc(p, out);
    } else if (e.isFile()) out.push(p);
  }
  return out;
}

let restored = 0;
let skipped = 0;
let stillBad = 0;
/** @type {string[]} */
const missing = [];

for (const file of walkSrc(ADMIN)) {
  let cur;
  try {
    cur = readFileSync(file, 'utf8');
  } catch {
    continue;
  }
  if (!isCorrupted(cur)) {
    skipped += 1;
    continue;
  }
  const fullKey = normPath(file);
  let content = byFull.get(fullKey);
  if (!content) {
    content = byBase.get(basename(file).toLowerCase());
  }
  if (!content || isCorrupted(content)) {
    stillBad += 1;
    missing.push(file.replace(/\\/g, '/'));
    continue;
  }
  writeFileSync(file, content, 'utf8');
  restored += 1;
}

console.log(
  JSON.stringify(
    {
      restored,
      skippedOk: skipped,
      stillBad,
      missingCount: missing.length,
      missingSample: missing.slice(0, 30),
    },
    null,
    2,
  ),
);
