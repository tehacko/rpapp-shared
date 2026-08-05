#!/usr/bin/env node
/**
 * Inventory contract drift gate — Prisma enum sets vs shared exports + FE fork ban.
 *
 * SoT: up-backend/prisma/schema.prisma
 * Shared artifact: shared/src/contracts/inventory/enums.ts (hand-synced / generator output for v1)
 *
 * Fails when:
 *   1) any compared Prisma enum value set diverges from shared const arrays
 *   2) admin-app / rpapp-pickup invent parallel inventory enum type/const declarations
 *
 * Usage:
 *   npm run gate:inventory-contract-drift   (from shared/ or up-backend/)
 *   node shared/scripts/check-inventory-contract-drift.mjs
 *
 * @see shared/src/contracts/inventory/README.md
 */
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { dirname, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const SHARED_ROOT = join(__dirname, '..');
const REPO_ROOT = join(SHARED_ROOT, '..');

const SCHEMA_PATH = join(REPO_ROOT, 'up-backend', 'prisma', 'schema.prisma');
const ENUMS_PATH = join(
  SHARED_ROOT,
  'src',
  'contracts',
  'inventory',
  'enums.ts',
);

/**
 * Prisma-backed enums that must match shared const arrays.
 * Wire-only placeholders (severity, concurrency, scope) are intentionally omitted
 * from the Prisma comparison (severity is still FE-fork-banned via shared name).
 *
 * @type {{ prismaName: string, sharedConst: string }[]}
 */
const ENUM_CHECKS = [
  { prismaName: 'ShrinkageReason', sharedConst: 'SHRINKAGE_REASONS' },
  { prismaName: 'RestockBatchStatus', sharedConst: 'RESTOCK_BATCH_STATUSES' },
  {
    prismaName: 'InventoryCheckupStatus',
    sharedConst: 'INVENTORY_CHECKUP_STATUSES',
  },
  {
    prismaName: 'InventoryIncidentStatus',
    sharedConst: 'INVENTORY_INCIDENT_STATUSES',
  },
  {
    prismaName: 'InventoryLedgerSourceType',
    sharedConst: 'INVENTORY_LEDGER_SOURCE_TYPES',
  },
  {
    prismaName: 'InventoryLedgerReasonCode',
    sharedConst: 'INVENTORY_LEDGER_REASON_CODES',
  },
];

/** FE apps that must import inventory enums from pi-kiosk-shared — not redefine them. */
const FE_SCAN_ROOTS = [
  join(REPO_ROOT, 'admin-app', 'src'),
  join(REPO_ROOT, 'rpapp-pickup', 'src'),
];

/**
 * Named inventory wire enums / const arrays that must not be declared in FE.
 * Re-exports from pi-kiosk-shared are allowed.
 */
const FE_FORBIDDEN_DECL_NAMES = [
  'ShrinkageReason',
  'RestockBatchStatus',
  'InventoryCheckupStatus',
  'InventoryIncidentStatus',
  'InventoryIncidentSeverity',
  'InventoryLedgerSourceType',
  'InventoryLedgerReasonCode',
  'CheckupConcurrencyPolicy',
  'CheckupScopeMode',
  'SHRINKAGE_REASONS',
  'RESTOCK_BATCH_STATUSES',
  'INVENTORY_CHECKUP_STATUSES',
  'INVENTORY_INCIDENT_STATUSES',
  'INVENTORY_INCIDENT_SEVERITIES',
  'INVENTORY_LEDGER_SOURCE_TYPES',
  'INVENTORY_LEDGER_REASON_CODES',
  'CHECKUP_CONCURRENCY_POLICIES',
  'CHECKUP_SCOPE_MODES',
];

/**
 * @param {string} schema
 * @param {string} enumName
 * @returns {string[]}
 */
function extractPrismaEnumValues(schema, enumName) {
  const re = new RegExp(
    `enum\\s+${enumName}\\s*\\{([\\s\\S]*?)\\n\\}`,
    'm',
  );
  const match = re.exec(schema);
  if (!match) {
    throw new Error(`Prisma enum ${enumName} not found in schema.prisma`);
  }
  const body = match[1];
  /** @type {string[]} */
  const values = [];
  for (const line of body.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('//') || trimmed.startsWith('@@')) {
      continue;
    }
    const token = trimmed.split(/\s+/)[0];
    if (token && /^[A-Za-z_][A-Za-z0-9_]*$/.test(token)) {
      values.push(token);
    }
  }
  return values;
}

/**
 * @param {string} source
 * @param {string} constName
 * @returns {string[]}
 */
function extractSharedConstArray(source, constName) {
  const re = new RegExp(
    `export const ${constName}\\s*=\\s*\\[([\\s\\S]*?)\\]\\s*as const`,
    'm',
  );
  const match = re.exec(source);
  if (!match) {
    throw new Error(
      `Shared const ${constName} not found in contracts/inventory/enums.ts`,
    );
  }
  /** @type {string[]} */
  const values = [];
  const litRe = /'([A-Z][A-Z0-9_]*)'/g;
  let lit = litRe.exec(match[1]);
  while (lit) {
    values.push(lit[1]);
    lit = litRe.exec(match[1]);
  }
  if (values.length === 0) {
    throw new Error(`Shared const ${constName} has no string literals`);
  }
  return values;
}

/**
 * @param {string[]} a
 * @param {string[]} b
 */
function sameSet(a, b) {
  const sa = [...a].sort().join('\0');
  const sb = [...b].sort().join('\0');
  return sa === sb;
}

/**
 * @param {string} dir
 * @param {(filePath: string) => void} visit
 */
function walkTsFiles(dir, visit) {
  let entries;
  try {
    entries = readdirSync(dir);
  } catch {
    return;
  }
  for (const name of entries) {
    if (name === 'node_modules' || name === 'dist' || name === 'coverage') {
      continue;
    }
    const full = join(dir, name);
    let st;
    try {
      st = statSync(full);
    } catch {
      continue;
    }
    if (st.isDirectory()) {
      walkTsFiles(full, visit);
      continue;
    }
    if (/\.(ts|tsx)$/.test(name) && !name.endsWith('.d.ts')) {
      visit(full);
    }
  }
}

/**
 * True when the declaration is a re-export from pi-kiosk-shared (allowed).
 * @param {string} line
 */
function isSharedReexport(line) {
  return (
    /from\s+['"]pi-kiosk-shared(?:\/[^'"]*)?['"]/.test(line) ||
    /from\s+['"]pi-kiosk-shared\/contracts\/inventory['"]/.test(line)
  );
}

/**
 * @param {string} filePath
 * @param {string} source
 * @returns {string[]}
 */
function findFeParallelEnumDecls(filePath, source) {
  /** @type {string[]} */
  const hits = [];
  const lines = source.split(/\r?\n/);
  for (let i = 0; i < lines.length; i += 1) {
    const line = lines[i];
    const trimmed = line.trim();
    if (trimmed.startsWith('//') || trimmed.startsWith('*') || trimmed.startsWith('/*')) {
      continue;
    }
    for (const name of FE_FORBIDDEN_DECL_NAMES) {
      const typeDecl = new RegExp(
        `^(?:export\\s+)?type\\s+${name}\\s*=`,
      );
      const constDecl = new RegExp(
        `^(?:export\\s+)?const\\s+${name}\\s*=`,
      );
      if (!typeDecl.test(trimmed) && !constDecl.test(trimmed)) {
        continue;
      }
      // Multi-line: `export type Foo =` then next lines; or `export type { Foo } from '…'`
      if (/^export\s+type\s*\{/.test(trimmed) && isSharedReexport(trimmed)) {
        continue;
      }
      if (isSharedReexport(trimmed)) {
        continue;
      }
      // `export type { X } from 'pi-kiosk-shared...'` may span one line
      if (/^export\s+type\s*\{/.test(trimmed)) {
        const window = lines.slice(i, i + 3).join(' ');
        if (isSharedReexport(window)) {
          continue;
        }
      }
      hits.push(
        `${relative(REPO_ROOT, filePath)}:${String(i + 1)} invents parallel ${name}`,
      );
    }
  }
  return hits;
}

function checkPrismaSharedAlignment() {
  const schema = readFileSync(SCHEMA_PATH, 'utf8');
  const enumsSource = readFileSync(ENUMS_PATH, 'utf8');

  /** @type {string[]} */
  const failures = [];

  for (const { prismaName, sharedConst } of ENUM_CHECKS) {
    let prismaValues;
    let sharedValues;
    try {
      prismaValues = extractPrismaEnumValues(schema, prismaName);
      sharedValues = extractSharedConstArray(enumsSource, sharedConst);
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      failures.push(`${prismaName}: ${message}`);
      continue;
    }
    if (!sameSet(prismaValues, sharedValues)) {
      failures.push(
        `${prismaName}: prisma=[${[...prismaValues].sort().join(',')}] shared=[${[...sharedValues].sort().join(',')}]`,
      );
    }
  }

  return failures;
}

function checkFeParallelEnums() {
  /** @type {string[]} */
  const failures = [];
  for (const root of FE_SCAN_ROOTS) {
    walkTsFiles(root, (filePath) => {
      const source = readFileSync(filePath, 'utf8');
      failures.push(...findFeParallelEnumDecls(filePath, source));
    });
  }
  return failures;
}

function main() {
  /** @type {string[]} */
  const failures = [];

  failures.push(...checkPrismaSharedAlignment());
  failures.push(...checkFeParallelEnums());

  if (failures.length > 0) {
    console.error(
      'check-inventory-contract-drift FAIL — sync shared/src/contracts/inventory and import enums from pi-kiosk-shared/contracts/inventory:',
    );
    for (const line of failures) {
      console.error(`  - ${line}`);
    }
    process.exit(1);
  }

  console.log(
    `check-inventory-contract-drift PASS (${String(ENUM_CHECKS.length)} Prisma enums + FE fork scan clean)`,
  );
  process.exit(0);
}

main();
