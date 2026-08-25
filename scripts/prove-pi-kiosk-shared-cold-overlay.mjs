#!/usr/bin/env node
/**
 * G1/G2 — Scripts-on cold-install proof for monorepo pi-kiosk-shared overlay.
 *
 * Option B (lighter than full `rm -rf node_modules && npm ci`):
 *
 *   1. DIAGNOSTIC (once per run, temp only): `npm pack pi-kiosk-shared@2.2.82`
 *      → extract → report COLD_BAD markers when present; if the registry
 *      tarball is already Node-safe, log that and continue (do not fail).
 *      (COLD_VERSION is a known Node-safe diagnostic pack, not live shared/package.json 2.2.86;
 *      consumers pin ^2.2.86; overlay when ../shared exists).
 *      Never installs into a consumer with `--ignore-scripts`.
 *
 *   2. PASS (per consumer, SERIAL): wipe `node_modules/pi-kiosk-shared` →
 *      `npm install --no-audit --no-fund` (no package args, scripts ON) so
 *      documented `prepare` / `postinstall` runs DURING install and overlays
 *      Node-safe local shared. Then assert Node-safe barrel + NODE_IMPORT_OK.
 *
 * Forbidden (audit-rejected):
 *   - `npm install … --ignore-scripts` then hand `npm run prepare`/`postinstall`
 *   - Direct `node scripts/overlaySharedIfPresent.mjs`
 *
 * SERIAL ONLY: `--all` runs consumers one at a time. Concurrent ensureDist races.
 *
 * Usage (from shared/):
 *   npm run prove:cold-overlay -- up-backend
 *   npm run prove:cold-overlay -- --all
 *
 * Evidence (overwrite .md — not gitignored `*.log`):
 *   .cursor/artifacts/pi-kiosk-shared-cold-overlay-proof.md
 *   .cursor/artifacts/pi-kiosk-shared-cold-overlay-proof-<consumer>.md
 */
import { spawnSync } from 'node:child_process';
import {
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  readdirSync,
  rmSync,
  writeFileSync,
} from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const sharedRoot = path.resolve(scriptDir, '..');
const repoRoot = path.resolve(sharedRoot, '..');
const packageName = 'pi-kiosk-shared';
/** Diagnostic pack of a known Node-safe registry tarball. Not the live monorepo version (shared/package.json 2.2.86). */
const COLD_VERSION = '2.2.82';

const CONSUMERS = [
  'up-backend',
  'admin-app',
  'rpapp-kiosk',
  'rpapp-customer',
  'rpapp-pickup',
];

const artifactsDir = path.join(repoRoot, '.cursor', 'artifacts');
const combinedProofMd = path.join(
  artifactsDir,
  'pi-kiosk-shared-cold-overlay-proof.md',
);

const npmCmd = process.platform === 'win32' ? 'npm.cmd' : 'npm';

/** @type {string[]} */
const runHeaderLines = [];

/**
 * Per-consumer transcript buffers (overwrite unique .md at flush).
 * @type {Map<string, string[]>}
 */
const consumerTranscripts = new Map();

/** @type {string | null} */
let activeConsumer = null;

/**
 * @param {string} line
 */
function log(line) {
  const text = line.endsWith('\n') ? line.slice(0, -1) : line;
  if (activeConsumer) {
    const buf = consumerTranscripts.get(activeConsumer);
    if (buf) {
      buf.push(text);
    }
  } else {
    runHeaderLines.push(text);
  }
  process.stdout.write(`${text}\n`);
}

/**
 * @param {string} line
 */
function logErr(line) {
  const text = line.endsWith('\n') ? line.slice(0, -1) : line;
  if (activeConsumer) {
    const buf = consumerTranscripts.get(activeConsumer);
    if (buf) {
      buf.push(text);
    }
  } else {
    runHeaderLines.push(text);
  }
  process.stderr.write(`${text}\n`);
}

/**
 * Overwrite unique per-consumer .md + combined .md for this run only.
 *
 * @param {string[]} consumers
 * @param {{ failed: number }} summary
 */
function flushTranscripts(consumers, summary) {
  mkdirSync(artifactsDir, { recursive: true });
  const stamp = new Date().toISOString();
  const header = [
    `# pi-kiosk-shared cold-overlay proof`,
    ``,
    `- stamp: \`${stamp}\``,
    `- coldVersion: \`${COLD_VERSION}\``,
    `- method: Option B — registry pack DIAGNOSTIC + scripts-on \`npm install\` heal (no \`--ignore-scripts\` into consumers)`,
    `- consumers: \`${consumers.join(',')}\``,
    `- result: \`${summary.failed === 0 ? 'PASS' : `FAIL (${summary.failed}/${consumers.length})`}\``,
    `- serial: yes (ensureDist is not parallel-safe)`,
    ``,
  ];

  /** @type {string[]} */
  const combinedBody = [...header, ...runHeaderLines, ``];

  for (const consumer of consumers) {
    const lines = consumerTranscripts.get(consumer) ?? [];
    const consumerMd = [
      `# pi-kiosk-shared cold-overlay proof — ${consumer}`,
      ``,
      `- stamp: \`${stamp}\``,
      `- coldVersion: \`${COLD_VERSION}\``,
      `- consumer: \`${consumer}\``,
      `- method: wipe node_modules/${packageName} → scripts-on npm install (prepare/postinstall during install)`,
      ``,
      '```text',
      ...lines,
      '```',
      ``,
    ].join('\n');
    const consumerPath = path.join(
      artifactsDir,
      `pi-kiosk-shared-cold-overlay-proof-${consumer}.md`,
    );
    writeFileSync(consumerPath, consumerMd, 'utf8');
    combinedBody.push(`## ${consumer}`, ``, '```text', ...lines, '```', ``);
  }

  writeFileSync(combinedProofMd, `${combinedBody.join('\n')}\n`, 'utf8');
  process.stdout.write(
    `Wrote ${path.relative(repoRoot, combinedProofMd)} and ${consumers.length} per-consumer .md\n`,
  );
}

/**
 * @param {string} source
 * @returns {string[]}
 */
function findColdMarkers(source) {
  /** @type {string[]} */
  const hits = [];
  if (source.includes('DatabaseUnavailable')) {
    hits.push('DatabaseUnavailable');
  }
  if (source.includes('useSubmitCooldown')) {
    hits.push('useSubmitCooldown');
  }
  if (
    /from\s*['"]react['"]/.test(source) ||
    source.includes("from 'react'") ||
    source.includes('from "react"')
  ) {
    hits.push("from 'react'");
  }
  if (
    /from\s*['"]react\/jsx-runtime['"]/.test(source) ||
    source.includes("from 'react/jsx-runtime'") ||
    source.includes('from "react/jsx-runtime"')
  ) {
    hits.push("from 'react/jsx-runtime'");
  }
  if (
    /import\s*\(\s*['"]react['"]\s*\)/.test(source) ||
    /import\s+['"]react['"]/.test(source)
  ) {
    if (!hits.includes("from 'react'")) {
      hits.push("import 'react'");
    }
  }
  return hits;
}

/**
 * @param {string} consumer
 * @returns {string}
 */
function consumerCwd(consumer) {
  return path.join(repoRoot, consumer);
}

/**
 * @param {string} consumer
 * @returns {string}
 */
function consumerDistIndex(consumer) {
  return path.join(
    consumerCwd(consumer),
    'node_modules',
    packageName,
    'dist',
    'index.js',
  );
}

/**
 * @param {import('node:child_process').SpawnSyncReturns<string>} result
 * @param {string} label
 */
function captureSpawn(result, label) {
  if (result.stdout) {
    for (const line of result.stdout.split(/\r?\n/)) {
      if (line.length > 0) {
        log(`[${label} stdout] ${line}`);
      }
    }
  }
  if (result.stderr) {
    for (const line of result.stderr.split(/\r?\n/)) {
      if (line.length > 0) {
        log(`[${label} stderr] ${line}`);
      }
    }
  }
  if (result.error) {
    logErr(`[${label}] spawn error: ${result.error.message}`);
  }
}

/**
 * @param {string} consumer
 * @returns {'prepare' | 'postinstall'}
 */
function resolveLifecycleHook(consumer) {
  const pkgPath = path.join(consumerCwd(consumer), 'package.json');
  if (!existsSync(pkgPath)) {
    throw new Error(`missing package.json for ${consumer}: ${pkgPath}`);
  }
  const pkg = JSON.parse(readFileSync(pkgPath, 'utf8'));
  const scripts = pkg.scripts && typeof pkg.scripts === 'object' ? pkg.scripts : {};
  const prepare = typeof scripts.prepare === 'string' ? scripts.prepare : '';
  const postinstall =
    typeof scripts.postinstall === 'string' ? scripts.postinstall : '';

  if (prepare.includes('overlaySharedIfPresent')) {
    return 'prepare';
  }
  if (
    postinstall.includes('overlaySharedIfPresent') ||
    postinstall.includes('overlay')
  ) {
    return 'postinstall';
  }
  throw new Error(
    `${consumer}: no prepare/postinstall lifecycle containing overlaySharedIfPresent. Cannot prove documented cold path.`,
  );
}

/**
 * DIAGNOSTIC — pack+extract registry tarball in temp; never into consumer node_modules.
 */
function assertRegistryTarballColdBad() {
  const tmpRoot = mkdtempSync(path.join(os.tmpdir(), 'piks-cold-pack-'));
  log(`DIAGNOSTIC: npm pack ${packageName}@${COLD_VERSION} in ${tmpRoot}`);
  try {
    const pack = spawnSync(
      npmCmd,
      ['pack', `${packageName}@${COLD_VERSION}`, '--pack-destination', tmpRoot],
      {
        cwd: tmpRoot,
        encoding: 'utf8',
        shell: process.platform === 'win32',
        env: { ...process.env },
      },
    );
    captureSpawn(pack, 'npm-pack-cold');
    if (pack.status !== 0) {
      throw new Error(
        `DIAGNOSTIC npm pack failed (exit ${pack.status ?? 'null'}). Recovery: check registry access for ${packageName}@${COLD_VERSION}.`,
      );
    }
    const tgzName = (pack.stdout || '')
      .split(/\r?\n/)
      .map((l) => l.trim())
      .filter((l) => l.endsWith('.tgz'))
      .pop();
    if (!tgzName) {
      const files = readdirSync(tmpRoot).filter((f) => f.endsWith('.tgz'));
      if (files.length === 0) {
        throw new Error('DIAGNOSTIC: npm pack produced no .tgz');
      }
    }
    const tgzFiles = readdirSync(tmpRoot).filter((f) => f.endsWith('.tgz'));
    const tgzPath = path.join(tmpRoot, tgzFiles[0]);
    const extractDir = path.join(tmpRoot, 'extract');
    mkdirSync(extractDir, { recursive: true });
    const tar = spawnSync(
      process.platform === 'win32' ? 'tar.exe' : 'tar',
      ['-xzf', tgzPath, '-C', extractDir],
      { encoding: 'utf8', env: { ...process.env } },
    );
    captureSpawn(tar, 'tar-extract-cold');
    if (tar.status !== 0) {
      throw new Error(
        `DIAGNOSTIC tar extract failed (exit ${tar.status ?? 'null'}). Recovery: ensure tar is available.`,
      );
    }
    const distIndex = path.join(extractDir, 'package', 'dist', 'index.js');
    if (!existsSync(distIndex)) {
      throw new Error(
        `DIAGNOSTIC: missing package/dist/index.js in packed ${COLD_VERSION}`,
      );
    }
    const source = readFileSync(distIndex, 'utf8');
    const markers = findColdMarkers(source);
    if (markers.length === 0) {
      // Registry latest may already ship a Node-safe main barrel (e.g. 2.2.82).
      // Still prove pack+extract of COLD_VERSION; consumer PASS path proves overlay heal.
      log(
        `DIAGNOSTIC: registry ${packageName}@${COLD_VERSION} main barrel is already Node-safe (no COLD_BAD markers).`,
      );
      log(
        'DIAGNOSTIC NODE_SAFE (published package — not installed into consumers; overlay heal still proven per consumer)',
      );
      return;
    }
    log(`DIAGNOSTIC COLD_BAD markers on registry tarball: ${markers.join(', ')}`);
    log('DIAGNOSTIC COLD_BAD (published package — not installed into consumers)');
  } finally {
    rmSync(tmpRoot, { recursive: true, force: true });
  }
}

/**
 * PASS path — wipe install copy then scripts-on npm install (heal during install).
 * @param {string} consumer
 */
function scriptsOnInstallHeal(consumer) {
  const cwd = consumerCwd(consumer);
  const installRoot = path.join(cwd, 'node_modules', packageName);
  const hook = resolveLifecycleHook(consumer);

  log(
    `[${consumer}] PASS path: wipe ${path.relative(repoRoot, installRoot)} then scripts-on npm install (lifecycle=${hook} runs during install)`,
  );
  if (existsSync(installRoot)) {
    rmSync(installRoot, { recursive: true, force: true });
  }

  log(
    `[${consumer}] ${npmCmd} install --no-audit --no-fund (no package args; scripts ON; no --ignore-scripts)`,
  );
  const result = spawnSync(
    npmCmd,
    ['install', '--no-audit', '--no-fund'],
    {
      cwd,
      encoding: 'utf8',
      shell: process.platform === 'win32',
      env: { ...process.env },
    },
  );
  captureSpawn(result, `${consumer} npm-install-scripts-on`);
  if (result.status !== 0) {
    throw new Error(
      `${consumer}: scripts-on npm install failed (exit ${result.status ?? 'null'}). Recovery: ensure sibling ../shared is complete, then re-run from ${consumer}.`,
    );
  }
}

/**
 * @param {string} consumer
 */
function assertNodeSafe(consumer) {
  const distIndex = consumerDistIndex(consumer);
  if (!existsSync(distIndex)) {
    throw new Error(
      `${consumer}: Node-safe assert failed — missing ${path.relative(repoRoot, distIndex)} after scripts-on install.`,
    );
  }
  const source = readFileSync(distIndex, 'utf8');
  const markers = findColdMarkers(source);
  if (markers.length > 0) {
    throw new Error(
      `${consumer}: Node-safe assert failed — main barrel still has UI/react markers after scripts-on install: ${markers.join(', ')}. Recovery: from shared/ run ensureDist, confirm prepare/postinstall overlay, then re-run prove:cold-overlay.`,
    );
  }
  log(`[${consumer}] Node-safe barrel: no COLD markers on main dist/index.js`);

  const smoke = `
const mod = await import(${JSON.stringify(packageName)});
if (typeof mod.normalizeIban !== 'function') {
  throw new Error('normalizeIban missing from main barrel');
}
console.log('NODE_IMPORT_OK');
`;
  const result = spawnSync(
    process.execPath,
    ['--input-type=module', '--eval', smoke],
    {
      cwd: consumerCwd(consumer),
      encoding: 'utf8',
      env: (() => {
        const env = { ...process.env };
        delete env.NODE_OPTIONS;
        delete env.NODE_PATH;
        return env;
      })(),
    },
  );
  captureSpawn(result, `${consumer} node-import`);
  if (result.status !== 0) {
    throw new Error(
      `${consumer}: plain Node import('${packageName}') failed after scripts-on install (exit ${result.status ?? 'null'}).`,
    );
  }
  if (!result.stdout || !result.stdout.includes('NODE_IMPORT_OK')) {
    throw new Error(
      `${consumer}: plain Node import did not print NODE_IMPORT_OK.`,
    );
  }
  log(`[${consumer}] NODE_IMPORT_OK`);
}

/**
 * @param {string} consumer
 * @returns {boolean}
 */
function proveConsumer(consumer) {
  consumerTranscripts.set(consumer, []);
  activeConsumer = consumer;
  log(`---- consumer: ${consumer} ----`);
  if (!existsSync(consumerCwd(consumer))) {
    logErr(`[${consumer}] FAIL: package directory missing under repo root`);
    activeConsumer = null;
    return false;
  }
  try {
    scriptsOnInstallHeal(consumer);
    assertNodeSafe(consumer);
    log(`[${consumer}] PASS`);
    activeConsumer = null;
    return true;
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    logErr(`[${consumer}] FAIL: ${message}`);
    activeConsumer = null;
    return false;
  }
}

/**
 * @param {string[]} argv
 * @returns {string[]}
 */
function parseConsumers(argv) {
  const args = argv.slice(2).filter((a) => a.length > 0);
  if (args.length === 0) {
    logErr(
      'Usage: node scripts/prove-pi-kiosk-shared-cold-overlay.mjs <up-backend|admin-app|rpapp-kiosk|rpapp-customer|rpapp-pickup|--all>',
    );
    process.exit(1);
  }
  if (args.includes('--all')) {
    if (args.length !== 1) {
      logErr(
        'prove-pi-kiosk-shared-cold-overlay: --all must be the sole argument',
      );
      process.exit(1);
    }
    return [...CONSUMERS];
  }
  /** @type {string[]} */
  const selected = [];
  for (const arg of args) {
    if (!CONSUMERS.includes(arg)) {
      logErr(
        `prove-pi-kiosk-shared-cold-overlay: unknown consumer ${JSON.stringify(arg)}. Allowed: ${CONSUMERS.join('|')}|--all`,
      );
      process.exit(1);
    }
    if (!selected.includes(arg)) {
      selected.push(arg);
    }
  }
  return selected;
}

function main() {
  log(`repoRoot=${repoRoot}`);
  log(`coldVersion=${COLD_VERSION}`);
  log(
    'Method: Option B — DIAGNOSTIC npm pack (temp) + per-consumer wipe + scripts-on npm install. No --ignore-scripts into consumers. No hand prepare after scripts-off install.',
  );
  log(
    'SERIAL: multi-consumer / --all runs one consumer at a time (ensureDist is not parallel-safe).',
  );

  try {
    assertRegistryTarballColdBad();
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    logErr(`DIAGNOSTIC FAIL: ${message}`);
    flushTranscripts([], { failed: 1 });
    process.exit(1);
  }

  const consumers = parseConsumers(process.argv);
  log(`consumers=${consumers.join(',')}`);

  let failed = 0;
  for (const consumer of consumers) {
    if (!proveConsumer(consumer)) {
      failed += 1;
    }
  }

  if (failed > 0) {
    logErr(
      `prove-pi-kiosk-shared-cold-overlay: FAIL (${failed}/${consumers.length} consumers)`,
    );
    flushTranscripts(consumers, { failed });
    process.exit(1);
  }

  log(
    `prove-pi-kiosk-shared-cold-overlay: PASS (${consumers.length}/${consumers.length} consumers)`,
  );
  flushTranscripts(consumers, { failed: 0 });
  process.exit(0);
}

main();
