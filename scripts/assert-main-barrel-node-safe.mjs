#!/usr/bin/env node
/**
 * G3 / G6 — Node-without-React regression gate for the compiled main barrel.
 *
 * Asserts BOTH:
 *   1. `shared/dist/index.js` (workspace build output)
 *   2. Each existing consumer install copy under
 *      `repoRoot/{up-backend,admin-app,rpapp-kiosk,rpapp-customer,rpapp-pickup}/node_modules/pi-kiosk-shared/dist/index.js`
 *
 * For each barrel: walks relative `from './…'` / `from "../…"` / `export … from`
 * edges under that package's `dist/`. Fails if the graph pulls in React (or the
 * old UI barrel names). Then smokes with plain Node ESM (`node --input-type=module`
 * — not tsx): file-URL smoke for shared/dist, plus `import('pi-kiosk-shared')`
 * from `up-backend` cwd when that consumer install is present.
 *
 * Missing consumer policy:
 *   - Consumer package folder missing entirely → skip that consumer
 *   - Consumer folder exists but `node_modules/pi-kiosk-shared` (or its
 *     `package.json` / `dist/index.js`) missing → FAIL
 *     (unless ENSURE_DIST_SKIP_MISSING_CONSUMERS=1, GATE_ALLOW_MISSING_CONSUMERS=1,
 *      or ENSURE_DIST_ALLOW_MISSING_CONSUMERS=1 — warn + continue)
 *
 * Plain Node smoke clears NODE_OPTIONS / NODE_PATH so a parent tsx loader cannot
 * masquerade as native ESM.
 *
 * Usage: `npm run gate:main-barrel-node-safe` (from shared/).
 * Recovery: `node scripts/ensureDist.mjs` (or `npm ci` + prepare in each consumer).
 */
import { spawnSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const sharedRoot = path.resolve(scriptDir, '..');
const repoRoot = path.resolve(sharedRoot, '..');
const packageName = 'pi-kiosk-shared';

const CONSUMERS = [
  'up-backend',
  'admin-app',
  'rpapp-kiosk',
  'rpapp-customer',
  'rpapp-pickup',
];

const BANNED_EXACT = new Set([
  'react',
  'react/jsx-runtime',
  'react-dom',
  'lucide-react',
  '@tanstack/react-query',
]);

const OLD_BARREL_EXPORT_NAMES = [
  'DatabaseUnavailable',
  'useDatabaseHealth',
  'useSubmitCooldown',
  'CatalogImagePlaceholder',
  'ProviderIcon',
];

/**
 * `from'…'` / `from '…'` / `import('…')` / side-effect `import '…'` /
 * `require('…')` (defense if a CJS-shaped file ever lands in the graph).
 * `\s*` after `from` so minified `from'react'` still matches.
 */
const SPECIFIER_RE =
  /(?:import\s*\(\s*['"]([^'"]+)['"]|\brequire\s*\(\s*['"]([^'"]+)['"]|\bfrom\s*['"]([^'"]+)['"]|\bimport\s+['"]([^'"]+)['"])/g;

/** Relative assets that are not part of the JS graph (do not treat as unresolved). */
const NON_JS_RELATIVE_EXT = /\.(?:json|css|scss|sass|less|svg|png|jpe?g|gif|webp|ico|wasm|node|map)$/i;

/**
 * @returns {boolean}
 */
function allowMissingConsumers() {
  return (
    process.env.ENSURE_DIST_SKIP_MISSING_CONSUMERS === '1' ||
    process.env.GATE_ALLOW_MISSING_CONSUMERS === '1' ||
    process.env.ENSURE_DIST_ALLOW_MISSING_CONSUMERS === '1'
  );
}

/**
 * Strip query/hash suffixes (`react?commonjs-proxy`) before ban checks.
 * @param {string} spec
 */
function normalizeSpecifier(spec) {
  return spec.replace(/[?#].*$/, '');
}

/**
 * @param {string} spec
 */
function isBannedSpecifier(spec) {
  const bare = normalizeSpecifier(spec);
  if (BANNED_EXACT.has(bare)) {
    return true;
  }
  return (
    bare.startsWith('react/') ||
    bare.startsWith('react-dom/') ||
    bare.startsWith('lucide-react/') ||
    bare.startsWith('@tanstack/react-query/')
  );
}

/**
 * Strip // and /* * / comments without touching string / template contents
 * so commented `import from 'react'` is ignored.
 *
 * @param {string} source
 */
function stripComments(source) {
  let out = '';
  let i = 0;
  const n = source.length;
  while (i < n) {
    const c = source[i];
    const next = source[i + 1];

    if (c === '"' || c === "'" || c === '`') {
      const quote = c;
      out += c;
      i += 1;
      while (i < n) {
        const ch = source[i];
        out += ch;
        if (ch === '\\') {
          if (i + 1 < n) {
            out += source[i + 1];
            i += 2;
            continue;
          }
        } else if (ch === quote) {
          i += 1;
          break;
        } else if (quote === '`' && ch === '$' && source[i + 1] === '{') {
          out += '{';
          i += 2;
          let depth = 1;
          while (i < n && depth > 0) {
            const inner = source[i];
            out += inner;
            if (inner === '{') {
              depth += 1;
            } else if (inner === '}') {
              depth -= 1;
            } else if (inner === '\\' && i + 1 < n) {
              out += source[i + 1];
              i += 1;
            }
            i += 1;
          }
          continue;
        }
        i += 1;
      }
      continue;
    }

    if (c === '/' && next === '/') {
      i += 2;
      while (i < n && source[i] !== '\n') {
        i += 1;
      }
      continue;
    }

    if (c === '/' && next === '*') {
      i += 2;
      while (i + 1 < n && !(source[i] === '*' && source[i + 1] === '/')) {
        i += 1;
      }
      i += 2;
      continue;
    }

    out += c;
    i += 1;
  }
  return out;
}

/**
 * @param {string} distRoot
 * @param {string} filePath
 */
function isInsideDist(distRoot, filePath) {
  const rel = path.relative(distRoot, path.resolve(filePath));
  return rel !== '' && !rel.startsWith('..') && !path.isAbsolute(rel);
}

/**
 * @param {string} distRoot
 * @param {string} fromFile
 * @param {string} spec
 * @returns {string | { missing: string, spec: string } | null}
 */
function resolveRelativeJs(distRoot, fromFile, spec) {
  if (!spec.startsWith('./') && !spec.startsWith('../')) {
    return null;
  }
  const dest = path.resolve(path.dirname(fromFile), spec);
  /** @type {string[]} */
  const candidates = dest.endsWith('.js')
    ? [dest]
    : [dest, `${dest}.js`, path.join(dest, 'index.js')];

  for (const candidate of candidates) {
    if (
      existsSync(candidate) &&
      candidate.endsWith('.js') &&
      isInsideDist(distRoot, candidate)
    ) {
      return candidate;
    }
  }

  if (NON_JS_RELATIVE_EXT.test(dest) || NON_JS_RELATIVE_EXT.test(spec)) {
    return null;
  }

  return { missing: dest, spec };
}

/**
 * @param {string} source
 * @returns {string[]}
 */
function extractSpecifiers(source) {
  const stripped = stripComments(source);
  /** @type {string[]} */
  const specs = [];
  SPECIFIER_RE.lastIndex = 0;
  let match = SPECIFIER_RE.exec(stripped);
  while (match) {
    const spec = match[1] ?? match[2] ?? match[3] ?? match[4];
    if (spec) {
      specs.push(spec);
    }
    match = SPECIFIER_RE.exec(stripped);
  }
  return specs;
}

/**
 * @param {string} indexSource
 * @returns {string[]}
 */
function findOldBarrelExportNames(indexSource) {
  const stripped = stripComments(indexSource);
  /** @type {string[]} */
  const hits = [];
  for (const name of OLD_BARREL_EXPORT_NAMES) {
    const namedExport = new RegExp(`\\bexport\\s*\\{[^}]*\\b${name}\\b`);
    const fromPath = new RegExp(
      `\\b(?:import|export)\\b[^;]*\\bfrom\\s*['"][^'"]*\\b${name}\\b[^'"]*['"]`,
    );
    if (namedExport.test(stripped) || fromPath.test(stripped)) {
      hits.push(name);
    }
  }
  return hits;
}

function failMissingDist() {
  console.error(
    'assert-main-barrel-node-safe: missing shared/dist/index.js. Run `npm run build` in the shared package (or `node scripts/ensureDist.mjs`), then re-run this gate.',
  );
  process.exit(1);
}

/**
 * Static graph assert for one main barrel under a package dist root.
 *
 * @param {{ label: string, distRoot: string, distIndex: string, relBase: string }} target
 * @returns {{ errors: string[], visitedCount: number }}
 */
function assertBarrelGraph(target) {
  const { label, distRoot, distIndex, relBase } = target;
  /** @type {string[]} */
  const errors = [];
  /** @type {Set<string>} */
  const visited = new Set();
  /** @type {string[]} */
  const queue = [path.resolve(distIndex)];

  while (queue.length > 0) {
    const filePath = queue.pop();
    if (!filePath || visited.has(filePath)) {
      continue;
    }
    if (!existsSync(filePath)) {
      errors.push(
        `[${label}] missing file in graph: ${path.relative(relBase, filePath)}`,
      );
      continue;
    }
    visited.add(filePath);

    const source = readFileSync(filePath, 'utf8');
    const specifiers = extractSpecifiers(source);

    for (const spec of specifiers) {
      if (isBannedSpecifier(spec)) {
        errors.push(
          `[${label}] ${path.relative(relBase, filePath)} imports banned specifier ${JSON.stringify(spec)}`,
        );
        continue;
      }

      const resolved = resolveRelativeJs(distRoot, filePath, spec);
      if (resolved === null) {
        continue;
      }
      if (typeof resolved === 'object' && 'missing' in resolved) {
        errors.push(
          `[${label}] ${path.relative(relBase, filePath)} unresolved relative import ${JSON.stringify(spec)}`,
        );
        continue;
      }
      if (!visited.has(resolved)) {
        queue.push(resolved);
      }
    }
  }

  const indexSource = readFileSync(distIndex, 'utf8');
  const oldNames = findOldBarrelExportNames(indexSource);
  for (const name of oldNames) {
    errors.push(
      `[${label}] dist/index.js re-exports old UI barrel name ${name} (use pi-kiosk-shared/ui)`,
    );
  }

  return { errors, visitedCount: visited.size };
}

/**
 * Env for plain Node smoke — drop loader injectors so NODE_OPTIONS=-r tsx/tsx
 * cannot turn this into a tsx/register smoke (G3 requires native Node ESM).
 */
function plainNodeSmokeEnv() {
  const env = { ...process.env };
  delete env.NODE_OPTIONS;
  delete env.NODE_PATH;
  return env;
}

/**
 * @param {string} importSource — file URL or bare package name
 * @param {string} cwd
 * @param {string} label
 */
function runPlainNodeSmoke(importSource, cwd, label) {
  const bannedNamesLiteral = JSON.stringify(OLD_BARREL_EXPORT_NAMES);
  const smoke = `
const mod = await import(${JSON.stringify(importSource)});
if (typeof mod.normalizeIban !== 'function') {
  throw new Error(${JSON.stringify(`${label}: normalizeIban is not exported`)});
}
if (typeof mod.buildPaymentSurfaceReadiness !== 'function') {
  throw new Error(${JSON.stringify(`${label}: buildPaymentSurfaceReadiness is not exported`)});
}
const banned = ${bannedNamesLiteral};
for (const name of banned) {
  if (name in mod) {
    throw new Error(${JSON.stringify(`${label}: main barrel exports UI name `)} + name);
  }
}
const compact = mod.normalizeIban('cz65 0800');
if (compact !== 'CZ650800') {
  throw new Error(${JSON.stringify(`${label}: normalizeIban returned `)} + JSON.stringify(compact));
}
mod.buildPaymentSurfaceReadiness({
  payableVerifiedMethodCount: 0,
  methods: {
    bankTransfer: { enabled: false, ready: false, verified: false },
    gateway: { enabled: false, ready: false, verified: false },
  },
});
console.log(${JSON.stringify(`assert-main-barrel-node-safe: smoke ok (${label})`)});
`;

  const result = spawnSync(
    process.execPath,
    ['--input-type=module', '--eval', smoke],
    {
      encoding: 'utf8',
      cwd,
      env: plainNodeSmokeEnv(),
    },
  );

  if (result.status !== 0) {
    console.error(
      `assert-main-barrel-node-safe: plain Node ESM smoke failed for ${label} (React on the main barrel, missing export, or incomplete pi-kiosk-shared dist overlay). Do not use tsx for this check. Recovery: from shared/ run \`node scripts/ensureDist.mjs\`, then re-run this gate.`,
    );
    if (result.stderr) {
      console.error(result.stderr.trim());
    }
    if (result.stdout) {
      console.error(result.stdout.trim());
    }
    process.exit(1);
  }

  if (result.stdout) {
    process.stdout.write(result.stdout);
  }
}

/**
 * @returns {{ label: string, distRoot: string, distIndex: string, relBase: string }[]}
 */
function collectConsumerTargets() {
  /** @type {{ label: string, distRoot: string, distIndex: string, relBase: string }[]} */
  const targets = [];
  /** @type {string[]} */
  const missingInstalls = [];
  const skipMissing = allowMissingConsumers();

  for (const consumer of CONSUMERS) {
    const consumerDir = path.join(repoRoot, consumer);
    if (!existsSync(consumerDir)) {
      console.log(
        `assert-main-barrel-node-safe: skip ${consumer} (package folder missing)`,
      );
      continue;
    }

    const installRoot = path.join(consumerDir, 'node_modules', packageName);
    const packageJson = path.join(installRoot, 'package.json');
    const distIndex = path.join(installRoot, 'dist', 'index.js');

    // Install present = package.json + dist/index.js (partial overlay ≠ present).
    if (
      !existsSync(installRoot) ||
      !existsSync(packageJson) ||
      !existsSync(distIndex)
    ) {
      missingInstalls.push(consumer);
      continue;
    }

    targets.push({
      label: `${consumer}/node_modules/${packageName}`,
      distRoot: path.join(installRoot, 'dist'),
      distIndex,
      relBase: consumerDir,
    });
  }

  if (missingInstalls.length > 0) {
    const list = missingInstalls.join(', ');
    if (skipMissing) {
      console.warn(
        `assert-main-barrel-node-safe: WARNING: skipping consumers missing ${packageName} install: ${list}`,
      );
      console.warn(
        'assert-main-barrel-node-safe: Recovery: run `node scripts/ensureDist.mjs` from shared/, or `npm ci` + prepare in each consumer.',
      );
    } else {
      console.error(
        `assert-main-barrel-node-safe: FAIL — consumer package folder exists but node_modules/${packageName} install is incomplete (need package.json + dist/index.js): ${list}`,
      );
      console.error(
        'assert-main-barrel-node-safe: Recovery: from shared/ run `node scripts/ensureDist.mjs` (builds + overlays all five consumers). Or per consumer: `npm ci` then re-run ensureDist.',
      );
      for (const consumer of missingInstalls) {
        console.error(`  cd ${consumer} && npm ci`);
      }
      console.error(
        'assert-main-barrel-node-safe: Opt-out (warn only): set ENSURE_DIST_SKIP_MISSING_CONSUMERS=1, GATE_ALLOW_MISSING_CONSUMERS=1, or ENSURE_DIST_ALLOW_MISSING_CONSUMERS=1',
      );
      process.exit(1);
    }
  }

  return targets;
}

function main() {
  const sharedDistRoot = path.join(sharedRoot, 'dist');
  const sharedDistIndex = path.join(sharedDistRoot, 'index.js');

  if (!existsSync(sharedDistIndex)) {
    failMissingDist();
  }

  /** @type {string[]} */
  const allErrors = [];

  const sharedTarget = {
    label: 'shared/dist',
    distRoot: sharedDistRoot,
    distIndex: sharedDistIndex,
    relBase: sharedRoot,
  };

  const sharedResult = assertBarrelGraph(sharedTarget);
  allErrors.push(...sharedResult.errors);
  console.log(
    `assert-main-barrel-node-safe: [${sharedTarget.label}] visited ${sharedResult.visitedCount} files`,
  );

  const consumerTargets = collectConsumerTargets();
  for (const target of consumerTargets) {
    const result = assertBarrelGraph(target);
    allErrors.push(...result.errors);
    console.log(
      `assert-main-barrel-node-safe: [${target.label}] visited ${result.visitedCount} files`,
    );
  }

  if (allErrors.length > 0) {
    console.error('assert-main-barrel-node-safe: FAIL');
    for (const err of allErrors) {
      console.error(`  - ${err}`);
    }
    process.exit(1);
  }

  runPlainNodeSmoke(
    pathToFileURL(sharedDistIndex).href,
    sharedRoot,
    'shared/dist file URL',
  );

  const upBackendTarget = consumerTargets.find((t) =>
    t.label.startsWith('up-backend/'),
  );
  if (upBackendTarget) {
    runPlainNodeSmoke(
      packageName,
      path.join(repoRoot, 'up-backend'),
      `up-backend import('${packageName}')`,
    );
  } else {
    console.log(
      `assert-main-barrel-node-safe: skip up-backend package-resolution smoke (no ${packageName} install)`,
    );
  }

  console.log('assert-main-barrel-node-safe: PASS');
  process.exit(0);
}

main();
