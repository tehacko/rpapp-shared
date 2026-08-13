/**
 * Incremental shared build for local dev / E2E — never runs `rimraf dist`.
 * Avoids wiping dist while Vite is serving (root cause of blank Playwright pages).
 *
 * Always compiles with `npx tsc` (no-rimraf; do not only-build-when-missing).
 * Then overlays `package.json` + `dist` (+ `src/tokens` when listed in `files`)
 * into each consumer's `node_modules/pi-kiosk-shared/` — local monorepo overlay
 * so Node/tsx/tsc see Node-safe barrel without waiting on npm publish.
 *
 * CONCURRENCY: never spawn multiple ensureDist processes in parallel (e.g. parallel
 * consumer `prepare`/`postinstall`, Promise.all prove --all, or multi-agent prove).
 * Each run writes the same shared/dist via tsc and replaceDir-overlays every
 * consumer — concurrent PIDs race → missing-dist / half-deleted overlays. Callers
 * (prove:cold-overlay --all, install waves) must run SERIAL only.
 *
 * Opt-out: ENSURE_DIST_ALLOW_MISSING_CONSUMERS=1 — warn + exit 0 when consumer node_modules is missing (default: hard fail).
 *
 * ENSURE_DIST_EXTRA_CONSUMERS — optional comma-separated consumer dirs (relative to
 * repo root) appended to the built-in list for local probes / one-off overlays.
 *
 * replaceDir is Windows-safe: stage to a tmp sibling, rm dest with retries, rename;
 * on EPERM/EEXIST/ENOTEMPTY fall back to cpSync into dest then rm tmp. Mid-failure
 * restores dest from tmp when possible so consumers never keep a half-deleted dist.
 */
import { execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const sharedRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const repoRoot = path.resolve(sharedRoot, '..');
const packageName = 'pi-kiosk-shared';

const CONSUMERS = [
  'up-backend',
  'admin-app',
  'rpapp-kiosk',
  'rpapp-customer',
  'rpapp-pickup',
];

/** Optional comma-separated extra consumer dirs (for local probes only). */
const extraConsumers = (process.env.ENSURE_DIST_EXTRA_CONSUMERS ?? '')
  .split(',')
  .map((s) => s.trim())
  .filter(Boolean);
const allConsumers = [...CONSUMERS, ...extraConsumers];

execSync('npx tsc', { cwd: sharedRoot, stdio: 'inherit' });

const packageJsonSrc = path.join(sharedRoot, 'package.json');
const distSrc = path.join(sharedRoot, 'dist');
const tokensSrc = path.join(sharedRoot, 'src', 'tokens');
const publishedFiles = JSON.parse(fs.readFileSync(packageJsonSrc, 'utf8')).files ?? [];
const includeTokens = publishedFiles.some(
  (entry) => entry === 'src/tokens' || entry.startsWith('src/tokens/')
);

const RM_OPTS = { recursive: true, force: true, maxRetries: 15, retryDelay: 100 };

function isRenameFallbackError(err) {
  const code = err && typeof err === 'object' ? err.code : undefined;
  return code === 'EPERM' || code === 'EEXIST' || code === 'ENOTEMPTY';
}

/**
 * Best-effort restore of `dest` from staged `tmp` after a mid-swap failure.
 * Prefer a complete overlay over a half-deleted tree.
 */
function restoreDestFromTmp(tmp, dest) {
  if (!fs.existsSync(tmp)) {
    return;
  }
  try {
    try {
      fs.rmSync(dest, RM_OPTS);
    } catch {
      // ignore — copy may still fill gaps over a partial tree
    }
    fs.cpSync(tmp, dest, { recursive: true });
    fs.rmSync(tmp, { recursive: true, force: true, maxRetries: 5, retryDelay: 50 });
  } catch (restoreErr) {
    console.error(
      `[ensureDist] WARNING: failed to restore ${dest} from tmp after overlay error.`,
      'Retry ensureDist after closing IDE locks / antivirus on node_modules.',
      restoreErr
    );
  }
}

/**
 * Replace `dest` with contents of `src` in a Windows-safe way.
 * Stages to a sibling tmp, rm dest with retries, rename; on lock errors
 * falls back to cpSync into dest. Mid-failure restores dest from tmp.
 */
function replaceDir(src, dest) {
  const tmp = `${dest}.__ensureDist_tmp_${process.pid}`;
  fs.rmSync(tmp, RM_OPTS);
  fs.cpSync(src, tmp, { recursive: true });

  try {
    fs.rmSync(dest, RM_OPTS);
  } catch {
    // Dest may still exist (locked). Rename or copy fallback handles it.
  }

  try {
    fs.renameSync(tmp, dest);
    return;
  } catch (renameErr) {
    if (!isRenameFallbackError(renameErr)) {
      restoreDestFromTmp(tmp, dest);
      throw renameErr;
    }
  }

  // Windows: dest often locked by IDE/antivirus — copy into place instead of rename.
  try {
    if (fs.existsSync(dest)) {
      fs.rmSync(dest, RM_OPTS);
    }
    fs.cpSync(tmp, dest, { recursive: true });
    fs.rmSync(tmp, RM_OPTS);
  } catch (copyErr) {
    restoreDestFromTmp(tmp, dest);
    throw copyErr;
  }
}

const skippedConsumers = [];

for (const consumer of allConsumers) {
  const nodeModules = path.join(repoRoot, consumer, 'node_modules');
  if (!fs.existsSync(nodeModules)) {
    skippedConsumers.push(consumer);
    continue;
  }

  const destRoot = path.join(nodeModules, packageName);
  fs.mkdirSync(destRoot, { recursive: true });
  fs.copyFileSync(packageJsonSrc, path.join(destRoot, 'package.json'));

  if (fs.existsSync(distSrc)) {
    replaceDir(distSrc, path.join(destRoot, 'dist'));
  }

  if (includeTokens && fs.existsSync(tokensSrc)) {
    replaceDir(tokensSrc, path.join(destRoot, 'src', 'tokens'));
  }

  console.log(`[ensureDist] overlaid ${packageName} into ${consumer}/node_modules`);
}

if (skippedConsumers.length > 0) {
  const skippedList = skippedConsumers.join(', ');
  const allowMissing = process.env.ENSURE_DIST_ALLOW_MISSING_CONSUMERS === '1';

  if (allowMissing) {
    console.warn(
      `[ensureDist] WARNING: skipped overlay for consumers missing node_modules: ${skippedList}`
    );
  } else {
    console.error(
      `[ensureDist] ERROR: skipped overlay for consumers missing node_modules: ${skippedList}`
    );
    console.error(
      '[ensureDist] Recovery: install deps for each skipped consumer, then re-run ensureDist.'
    );
    for (const consumer of skippedConsumers) {
      console.error(`  cd ${consumer} && npm install`);
    }
    console.error(
      '  Or install all five: up-backend, admin-app, rpapp-kiosk, rpapp-customer, rpapp-pickup'
    );
    console.error(
      '[ensureDist] Opt-out (warn only): set ENSURE_DIST_ALLOW_MISSING_CONSUMERS=1'
    );
    process.exit(1);
  }
}
