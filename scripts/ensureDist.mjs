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
 * ENSURE_DIST_ONLY_CONSUMERS — optional comma-separated consumer dirs to overlay
 * (instead of every built-in consumer). Consumer predev/prepare/postinstall MUST
 * set this to themselves so parallel `npm run dev` cannot tear each other's
 * node_modules/pi-kiosk-shared/dist. Bare `node scripts/ensureDist.mjs` still
 * overlays all consumers (ops / prove / manual heal).
 *
 * replaceDir is Windows-safe: stage under os.tmpdir(), then in-place cpSync into
 * dest only (never wipe dest before new bytes). Mid-failure restores dest from
 * tmp when possible. After each overlay, assert dist/index.js exists.
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

/** Optional: overlay only these consumers (consumer hooks set this to self). */
const onlyConsumers = (process.env.ENSURE_DIST_ONLY_CONSUMERS ?? '')
  .split(',')
  .map((s) => s.trim())
  .filter(Boolean);
const consumersToOverlay =
  onlyConsumers.length > 0 ? onlyConsumers : allConsumers;

const RM_OPTS = { recursive: true, force: true, maxRetries: 15, retryDelay: 100 };
const LOCK_WAIT_MS = 120_000;
const LOCK_STALE_MS = 180_000;
const LOCK_HEARTBEAT_MS = 15_000;

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
 * @param {number} pid
 * @returns {boolean}
 */
function isPidAlive(pid) {
  if (!Number.isInteger(pid) || pid <= 0) {
    return false;
  }
  try {
    process.kill(pid, 0);
    return true;
  } catch (err) {
    const code = err && typeof err === 'object' ? /** @type {{ code?: string }} */ (err).code : undefined;
    // EPERM: process exists but we cannot signal it — treat as alive.
    return code === 'EPERM';
  }
}

/**
 * @returns {{ pid: number | null, ageMs: number } | null}
 */
function readLockMeta() {
  try {
    const stat = fs.statSync(lockPath);
    const raw = fs.readFileSync(lockPath, 'utf8');
    const firstLine = raw.split(/\r?\n/, 1)[0]?.trim() ?? '';
    const pid = Number.parseInt(firstLine, 10);
    return {
      pid: Number.isInteger(pid) ? pid : null,
      ageMs: Date.now() - stat.mtimeMs,
    };
  } catch {
    return null;
  }
}

/**
 * Cross-process mutex so overlapping predev/prepare/postinstall cannot race overlays.
 * Stale locks are removed only when the holder PID is dead (or age exceeds LOCK_STALE_MS
 * and the PID cannot be read) — never while a live holder is still compiling/overlaying.
 * @template T
 * @param {() => T} fn
 * @returns {T}
 */
function withEnsureDistLock(fn) {
  const started = Date.now();
  /** @type {number | undefined} */
  let fd;
  /** @type {ReturnType<typeof setInterval> | undefined} */
  let heartbeat;
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
      const meta = readLockMeta();
      if (meta) {
        const holderAlive = meta.pid !== null && isPidAlive(meta.pid);
        const staleByAge = meta.ageMs > LOCK_STALE_MS && !holderAlive;
        const staleDeadHolder = meta.pid !== null && !holderAlive;
        if (staleDeadHolder || staleByAge) {
          console.warn(
            `[ensureDist] WARNING: stale lock ${lockPath} ` +
              `(pid=${meta.pid ?? 'unknown'}, age ${Math.round(meta.ageMs / 1000)}s, alive=${holderAlive}); ` +
              'removing and retrying.'
          );
          try {
            fs.rmSync(lockPath, { force: true });
          } catch {
            // retry acquire
          }
          continue;
        }
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

  // Keep mtime fresh so waiters never treat a long tsc/overlay as stale.
  heartbeat = setInterval(() => {
    try {
      const now = new Date();
      fs.utimesSync(lockPath, now, now);
    } catch {
      // lock may already be released
    }
  }, LOCK_HEARTBEAT_MS);
  if (typeof heartbeat.unref === 'function') {
    heartbeat.unref();
  }

  try {
    return fn();
  } finally {
    if (heartbeat !== undefined) {
      clearInterval(heartbeat);
    }
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
 * @param {{ wipeDest?: boolean }} [opts] wipeDest=true only for disposable tmp dirs —
 *   never wipe a live consumer dist (empty-window race with tsx/vite).
 */
function cpSyncRetry(src, dest, attempts = 6, opts = {}) {
  const wipeDest = opts.wipeDest !== false;
  /** @type {unknown} */
  let lastErr;
  for (let i = 0; i < attempts; i += 1) {
    try {
      if (wipeDest && fs.existsSync(dest)) {
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
      if (wipeDest) {
        try {
          fs.rmSync(dest, RM_OPTS);
        } catch {
          // ignore partial tree
        }
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
 * Remove files/dirs under `dest` that are not present under `src` (same relative path).
 * @param {string} src
 * @param {string} dest
 */
function pruneExtras(src, dest) {
  if (!fs.existsSync(dest)) {
    return;
  }
  /** @type {string[]} */
  const stack = [dest];
  while (stack.length > 0) {
    const current = stack.pop();
    if (current === undefined) {
      break;
    }
    let entries;
    try {
      entries = fs.readdirSync(current, { withFileTypes: true });
    } catch {
      continue;
    }
    for (const entry of entries) {
      const destPath = path.join(current, entry.name);
      const rel = path.relative(dest, destPath);
      const srcPath = path.join(src, rel);
      if (!fs.existsSync(srcPath)) {
        try {
          fs.rmSync(destPath, RM_OPTS);
        } catch {
          // ignore locked leftovers
        }
        continue;
      }
      if (entry.isDirectory()) {
        stack.push(destPath);
      }
    }
  }
}

/**
 * Replace `dest` with contents of `src` in a Windows-safe way.
 * Stages under os.tmpdir(), then merges in place — never deletes `dest` first
 * (that empty window races concurrent `tsx`/`vite` imports of dist/index.js).
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
  // tmp is disposable — wipe+copy OK.
  cpSyncRetry(src, tmp, 6, { wipeDest: true });

  /** @type {unknown} */
  let lastErr;
  for (let attempt = 0; attempt < 8; attempt += 1) {
    try {
      fs.mkdirSync(dest, { recursive: true });
      fs.cpSync(tmp, dest, { recursive: true });
      pruneExtras(tmp, dest);
      fs.rmSync(tmp, RM_OPTS);
      return;
    } catch (err) {
      lastErr = err;
      if (!isTransientFsError(err) || attempt === 7) {
        break;
      }
      sleepSync(50 * (attempt + 1) * (attempt + 1));
    }
  }

  // Last resort: still merge-only (wipeDest: false) — never empty dest.
  try {
    cpSyncRetry(tmp, dest, 6, { wipeDest: false });
    pruneExtras(tmp, dest);
    fs.rmSync(tmp, RM_OPTS);
  } catch (copyErr) {
    restoreDestFromTmp(tmp, dest);
    throw copyErr ?? lastErr;
  }
}

/**
 * Fail closed if overlay left a consumer without a resolvable main entry.
 * @param {string} destRoot
 * @param {string} consumer
 */
function assertConsumerOverlay(destRoot, consumer) {
  const indexJs = path.join(destRoot, 'dist', 'index.js');
  if (!fs.existsSync(indexJs)) {
    throw new Error(
      `[ensureDist] overlay incomplete for ${consumer}: missing ${indexJs}. ` +
        'Likely a concurrent ensureDist or antivirus lock. Recovery: stop other ' +
        '`npm run dev` / ensure-shared processes, delete shared/.ensureDist.lock if ' +
        'stale, then re-run ensureDist from this package.'
    );
  }
  if (fs.statSync(indexJs).size < 1) {
    throw new Error(
      `[ensureDist] overlay incomplete for ${consumer}: empty ${indexJs}. ` +
        'Recovery: re-run ensureDist after closing IDE/antivirus locks on node_modules.'
    );
  }
  assertBarcodeScannerWasmExports(path.join(destRoot, 'dist'), consumer);
}

/**
 * G11 — `pi-kiosk-shared/barcode-scanner` must export setZXingWasmUrl after build/overlay.
 * Prevents silent green from hand-copying a stale registry dist into node_modules.
 * @param {string} distRoot
 * @param {string} label
 */
function assertBarcodeScannerWasmExports(distRoot, label) {
  const jsPath = path.join(distRoot, 'barcode-scanner.js');
  const dtsPath = path.join(distRoot, 'barcode-scanner.d.ts');
  for (const filePath of [jsPath, dtsPath]) {
    if (!fs.existsSync(filePath)) {
      throw new Error(
        `[ensureDist] ${label}: missing ${filePath}. ` +
          'Recovery: from shared/ run `npx tsc` then re-run ensureDist; do not hand-copy registry dist.'
      );
    }
    const source = fs.readFileSync(filePath, 'utf8');
    if (!/\bsetZXingWasmUrl\b/.test(source)) {
      throw new Error(
        `[ensureDist] ${label}: ${path.basename(filePath)} missing setZXingWasmUrl export. ` +
          'Registry pi-kiosk-shared@2.2.88 tarball lacks this export — monorepo SoT is local shared/src + ensureDist. ' +
          'Recovery: rebuild from shared/src (barcode-scanner.ts exports setZXingWasmUrl), then ensureDist overlay; ' +
          'app-only clones need a published shared version that includes the export.'
      );
    }
  }
}

/**
 * @returns {number} process exit code
 */
function runEnsureDist() {
  execSync('npx tsc', { cwd: sharedRoot, stdio: 'inherit' });

  const packageJsonSrc = path.join(sharedRoot, 'package.json');
  const distSrc = path.join(sharedRoot, 'dist');
  assertBarcodeScannerWasmExports(distSrc, 'shared/dist');
  const tokensSrc = path.join(sharedRoot, 'src', 'tokens');
  const publishedFiles = JSON.parse(fs.readFileSync(packageJsonSrc, 'utf8')).files ?? [];
  const includeTokens = publishedFiles.some(
    (entry) => entry === 'src/tokens' || entry.startsWith('src/tokens/')
  );

  const skippedConsumers = [];

  for (const consumer of consumersToOverlay) {
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

    assertConsumerOverlay(destRoot, consumer);
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
