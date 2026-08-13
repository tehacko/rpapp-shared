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
 * consumer — concurrent PIDs race → missing-dist / half-deleted overlays / Windows
 * ESRCH on cpSync. Callers should run SERIAL; this script also takes a file lock.
 *
 * Opt-out: ENSURE_DIST_ALLOW_MISSING_CONSUMERS=1 — warn + exit 0 when consumer node_modules is missing (default: hard fail).
 *
 * ENSURE_DIST_EXTRA_CONSUMERS — optional comma-separated consumer dirs (relative to
 * repo root) appended to the built-in list for local probes / one-off overlays.
 *
 * replaceDir is Windows-safe: stage under os.tmpdir(), rm dest with retries, rename;
 * on EPERM/EEXIST/ENOTEMPTY/ESRCH fall back / retry. Mid-failure restores dest from
 * tmp when possible so consumers never keep a half-deleted dist.
 */
import { execSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const sharedRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const repoRoot = path.resolve(sharedRoot, '..');
const packageName = 'pi-kiosk-shared';
const lockPath = path.join(sharedRoot, '.ensureDist.lock');

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

const RM_OPTS = { recursive: true, force: true, maxRetries: 15, retryDelay: 100 };
const LOCK_WAIT_MS = 120_000;
const LOCK_STALE_MS = 180_000;

/**
 * @param {number} ms
 */
function sleepSync(ms) {
  Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, ms);
}

/**
 * @param {unknown} err
 */
function isTransientFsError(err) {
  const code = err && typeof err === 'object' ? /** @type {{ code?: string }} */ (err).code : undefined;
  return (
    code === 'EPERM' ||
    code === 'EEXIST' ||
    code === 'ENOTEMPTY' ||
    code === 'ESRCH' ||
    code === 'ENOENT' ||
    code === 'EBUSY' ||
    code === 'EAGAIN'
  );
}

/**
 * Cross-process mutex so overlapping predev/prepare/postinstall cannot race overlays.
 * @template T
 * @param {() => T} fn
 * @returns {T}
 */
function withEnsureDistLock(fn) {
  const started = Date.now();
  /** @type {number | undefined} */
  let fd;
  for (;;) {
    try {
      fd = fs.openSync(lockPath, 'wx');
      fs.writeFileSync(fd, `${process.pid}\n${new Date().toISOString()}\n`);
      break;
    } catch (err) {
      const code = err && typeof err === 'object' ? /** @type {{ code?: string }} */ (err).code : undefined;
      if (code !== 'EEXIST') {
        throw err;
      }
      try {
        const ageMs = Date.now() - fs.statSync(lockPath).mtimeMs;
        if (ageMs > LOCK_STALE_MS) {
          console.warn(
            `[ensureDist] WARNING: stale lock ${lockPath} (age ${Math.round(ageMs / 1000)}s); removing and retrying.`
          );
          fs.rmSync(lockPath, { force: true });
          continue;
        }
      } catch {
        // lock vanished between EEXIST and stat — retry acquire
      }
      if (Date.now() - started > LOCK_WAIT_MS) {
        throw new Error(
          `[ensureDist] timed out after ${LOCK_WAIT_MS}ms waiting for ${lockPath}. ` +
            'Recovery: stop overlapping npm run ensure-shared / prepare / postinstall, ' +
            `delete ${lockPath} if no ensureDist is running, then retry.`
        );
      }
      sleepSync(200);
    }
  }

  try {
    return fn();
  } finally {
    if (fd !== undefined) {
      try {
        fs.closeSync(fd);
      } catch {
        // ignore
      }
    }
    try {
      fs.rmSync(lockPath, { force: true });
    } catch {
      // ignore
    }
  }
}

/**
 * @param {string} src
 * @param {string} dest
 * @param {number} [attempts]
 */
function cpSyncRetry(src, dest, attempts = 6) {
  /** @type {unknown} */
  let lastErr;
  for (let i = 0; i < attempts; i += 1) {
    try {
      if (fs.existsSync(dest)) {
        fs.rmSync(dest, RM_OPTS);
      }
      fs.mkdirSync(path.dirname(dest), { recursive: true });
      fs.cpSync(src, dest, { recursive: true });
      return;
    } catch (err) {
      lastErr = err;
      if (!isTransientFsError(err) || i === attempts - 1) {
        throw err;
      }
      try {
        fs.rmSync(dest, RM_OPTS);
      } catch {
        // ignore partial tree
      }
      sleepSync(50 * (i + 1) * (i + 1));
    }
  }
  throw lastErr;
}

/**
 * Best-effort restore of `dest` from staged `tmp` after a mid-swap failure.
 * Prefer a complete overlay over a half-deleted tree.
 * @param {string} tmp
 * @param {string} dest
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
 * Stages under os.tmpdir() (not a node_modules sibling) to avoid concurrent
 * rm/cp races deleting a mid-copy tree (ESRCH on Windows).
 * @param {string} src
 * @param {string} dest
 */
function replaceDir(src, dest) {
  const tmp = path.join(
    os.tmpdir(),
    `piks-ensureDist-${process.pid}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
  );
  try {
    fs.rmSync(tmp, RM_OPTS);
  } catch {
    // ignore
  }
  cpSyncRetry(src, tmp);

  try {
    fs.rmSync(dest, RM_OPTS);
  } catch {
    // Dest may still exist (locked). Rename or copy fallback handles it.
  }

  try {
    fs.renameSync(tmp, dest);
    return;
  } catch (renameErr) {
    if (!isTransientFsError(renameErr)) {
      restoreDestFromTmp(tmp, dest);
      throw renameErr;
    }
  }

  // Windows: dest often locked / cross-device rename fails — copy into place.
  try {
    cpSyncRetry(tmp, dest);
    fs.rmSync(tmp, RM_OPTS);
  } catch (copyErr) {
    restoreDestFromTmp(tmp, dest);
    throw copyErr;
  }
}

/**
 * @returns {number} process exit code
 */
function runEnsureDist() {
  execSync('npx tsc', { cwd: sharedRoot, stdio: 'inherit' });

  const packageJsonSrc = path.join(sharedRoot, 'package.json');
  const distSrc = path.join(sharedRoot, 'dist');
  const tokensSrc = path.join(sharedRoot, 'src', 'tokens');
  const publishedFiles = JSON.parse(fs.readFileSync(packageJsonSrc, 'utf8')).files ?? [];
  const includeTokens = publishedFiles.some(
    (entry) => entry === 'src/tokens' || entry.startsWith('src/tokens/')
  );

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
      return 1;
    }
  }

  return 0;
}

const exitCode = withEnsureDistLock(runEnsureDist);
process.exit(exitCode);
