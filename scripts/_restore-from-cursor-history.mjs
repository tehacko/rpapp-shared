import { readdirSync, readFileSync, writeFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const HIST = join(process.env.APPDATA || '', 'Cursor', 'User', 'History');
const ADMIN_SRC = 'c:/Users/corne/Desktop/rpapp1/rpapp/admin-app/src';

function decodeResource(resource) {
  return decodeURIComponent(resource.replace(/^file:\/\/\//, '').replace(/^([a-zA-Z])%3A/i, '$1:'));
}

function walk(dir, out = []) {
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    const p = join(dir, e.name);
    if (e.isDirectory()) {
      if (['node_modules', 'dist', 'build', 'coverage', '.git'].includes(e.name)) continue;
      walk(p, out);
      continue;
    }
    if (e.isFile()) out.push(p);
  }
  return out;
}

function isCorrupted(content) {
  return /var\(\s*\)/.test(content);
}

function scoreGood(content) {
  if (isCorrupted(content)) return -1;
  return 1;
}

/** @type {Map<string, { id: string, timestamp: number, path: string }[]>} */
const byPath = new Map();

for (const dirEnt of readdirSync(HIST, { withFileTypes: true })) {
  if (!dirEnt.isDirectory()) continue;
  const dir = join(HIST, dirEnt.name);
  const ej = join(dir, 'entries.json');
  if (!existsSync(ej)) continue;
  let meta;
  try {
    meta = JSON.parse(readFileSync(ej, 'utf8'));
  } catch {
    continue;
  }
  const resource = String(meta.resource || '');
  const lower = resource.toLowerCase();
  if (!lower.includes('admin-app') || !lower.includes('rpapp1')) continue;
  let abs;
  try {
    abs = decodeResource(resource).replace(/\\/g, '/');
  } catch {
    continue;
  }
  if (!abs.toLowerCase().includes('/admin-app/src/')) continue;
  const entries = Array.isArray(meta.entries) ? meta.entries : [];
  /** @type {{ id: string, timestamp: number, path: string }[]} */
  const versions = [];
  for (const ent of entries) {
    const id = ent.id;
    if (!id) continue;
    const vp = join(dir, id);
    if (!existsSync(vp)) continue;
    versions.push({ id, timestamp: ent.timestamp || 0, path: vp });
  }
  versions.sort((a, b) => b.timestamp - a.timestamp);
  if (versions.length) byPath.set(abs.toLowerCase(), versions);
}

console.log(`history_indexed=${String(byPath.size)}`);

let restored = 0;
let noHistory = 0;
let alreadyOk = 0;
let failed = 0;
/** @type {string[]} */
const missing = [];

for (const file of walk(ADMIN_SRC)) {
  const cur = readFileSync(file, 'utf8');
  if (!isCorrupted(cur)) {
    alreadyOk += 1;
    continue;
  }
  const key = file.replace(/\\/g, '/').toLowerCase();
  const versions = byPath.get(key);
  if (!versions) {
    noHistory += 1;
    missing.push(file.replace(/\\/g, '/'));
    continue;
  }
  let best = null;
  for (const v of versions) {
    let content;
    try {
      content = readFileSync(v.path, 'utf8');
    } catch {
      continue;
    }
    if (scoreGood(content) >= 0) {
      best = content;
      break;
    }
  }
  if (!best) {
    failed += 1;
    missing.push(`${file.replace(/\\/g, '/')} (no good history)`);
    continue;
  }
  writeFileSync(file, best, 'utf8');
  restored += 1;
}

console.log(
  JSON.stringify(
    {
      restored,
      alreadyOk,
      noHistory,
      failed,
      missingCount: missing.length,
      missingSample: missing.slice(0, 40),
    },
    null,
    2,
  ),
);
