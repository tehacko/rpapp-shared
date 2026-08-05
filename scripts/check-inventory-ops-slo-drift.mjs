#!/usr/bin/env node
/**
 * Inventory ops SLO threshold drift gate — shared contracts vs backend metrics module.
 *
 * SoT: shared/src/contracts/inventory/slo.ts
 * Backend: up-backend/src/shared/observability/inventoryOpsMetrics.ts
 *
 * Fails when numeric Part 10 rollout SLO thresholds diverge (no subjective bypass).
 *
 * Usage:
 *   npm run gate:inventory-ops-slo-drift   (from shared/ or up-backend/)
 */
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const SHARED_ROOT = join(__dirname, '..');
const REPO_ROOT = join(SHARED_ROOT, '..');

const SHARED_SLO_PATH = join(
  SHARED_ROOT,
  'src',
  'contracts',
  'inventory',
  'slo.ts',
);
const BACKEND_METRICS_PATH = join(
  REPO_ROOT,
  'up-backend',
  'src',
  'shared',
  'observability',
  'inventoryOpsMetrics.ts',
);

/**
 * @type {{ name: string, expected: number }[]}
 */
const THRESHOLDS = [
  { name: 'INVENTORY_OPS_APPLY_P95_MAX_MS', expected: 1200 },
  { name: 'INVENTORY_OPS_IDEMPOTENCY_CONFLICT_RATE_MAX', expected: 0.01 },
  { name: 'INVENTORY_OPS_HOLD_FLOOR_CONFLICT_RATE_MAX', expected: 0.05 },
];

/**
 * @param {string} source
 * @param {string} constName
 * @returns {number}
 */
function extractNumericConst(source, constName) {
  const re = new RegExp(
    `export const ${constName}\\s*=\\s*([0-9]+(?:\\.[0-9]+)?)\\s*as const`,
    'm',
  );
  const match = re.exec(source);
  if (!match) {
    throw new Error(`${constName} not found (expected \`export const ${constName} = <n> as const\`)`);
  }
  return Number(match[1]);
}

function main() {
  const sharedSource = readFileSync(SHARED_SLO_PATH, 'utf8');
  const backendSource = readFileSync(BACKEND_METRICS_PATH, 'utf8');

  /** @type {string[]} */
  const failures = [];

  for (const { name, expected } of THRESHOLDS) {
    let sharedVal;
    let backendVal;
    try {
      sharedVal = extractNumericConst(sharedSource, name);
      backendVal = extractNumericConst(backendSource, name);
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      failures.push(`${name}: ${message}`);
      continue;
    }
    if (sharedVal !== expected) {
      failures.push(
        `${name}: shared=${String(sharedVal)} does not match plan SoT ${String(expected)}`,
      );
    }
    if (backendVal !== expected) {
      failures.push(
        `${name}: backend=${String(backendVal)} does not match plan SoT ${String(expected)}`,
      );
    }
    if (sharedVal !== backendVal) {
      failures.push(
        `${name}: shared=${String(sharedVal)} backend=${String(backendVal)} (must match)`,
      );
    }
  }

  if (failures.length > 0) {
    console.error(
      'check-inventory-ops-slo-drift FAIL — sync shared/src/contracts/inventory/slo.ts and up-backend inventoryOpsMetrics.ts:',
    );
    for (const line of failures) {
      console.error(`  - ${line}`);
    }
    process.exit(1);
  }

  console.log(
    `check-inventory-ops-slo-drift PASS (${String(THRESHOLDS.length)} objective SLO thresholds aligned; no subjective bypass)`,
  );
  process.exit(0);
}

main();
