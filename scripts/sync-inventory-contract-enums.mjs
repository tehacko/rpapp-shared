#!/usr/bin/env node
/**
 * Sync Prisma-backed inventory enum arrays into shared inventory contracts.
 *
 * Usage:
 *   node scripts/sync-inventory-contract-enums.mjs          # write enums.ts
 *   node scripts/sync-inventory-contract-enums.mjs --check  # fail on drift
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const SHARED_ROOT = join(__dirname, '..');
const REPO_ROOT = join(SHARED_ROOT, '..');

const SCHEMA_PATH = join(REPO_ROOT, 'up-backend', 'prisma', 'schema.prisma');
const ENUMS_PATH = join(SHARED_ROOT, 'src', 'contracts', 'inventory', 'enums.ts');
const checkOnly = process.argv.includes('--check');

const ENUM_SYNC = [
  { prismaName: 'ShrinkageReason', sharedConst: 'SHRINKAGE_REASONS' },
  { prismaName: 'RestockBatchStatus', sharedConst: 'RESTOCK_BATCH_STATUSES' },
  { prismaName: 'InventoryCheckupStatus', sharedConst: 'INVENTORY_CHECKUP_STATUSES' },
  { prismaName: 'InventoryIncidentStatus', sharedConst: 'INVENTORY_INCIDENT_STATUSES' },
  { prismaName: 'InventoryLedgerSourceType', sharedConst: 'INVENTORY_LEDGER_SOURCE_TYPES' },
  { prismaName: 'InventoryLedgerReasonCode', sharedConst: 'INVENTORY_LEDGER_REASON_CODES' },
];

function extractPrismaEnumValues(schemaSource, enumName) {
  const re = new RegExp(`enum\\s+${enumName}\\s*\\{([\\s\\S]*?)\\n\\}`, 'm');
  const match = re.exec(schemaSource);
  if (!match) {
    throw new Error(`Prisma enum ${enumName} not found in schema.prisma`);
  }
  const values = [];
  for (const line of match[1].split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('//') || trimmed.startsWith('@@')) {
      continue;
    }
    const token = trimmed.split(/\s+/)[0];
    if (token && /^[A-Za-z_][A-Za-z0-9_]*$/.test(token)) {
      values.push(token);
    }
  }
  if (values.length === 0) {
    throw new Error(`Prisma enum ${enumName} has no values`);
  }
  return values;
}

function toConstArray(values) {
  return `[\n${values.map((value) => `  '${value}',`).join('\n')}\n]`;
}

function replaceConstArray(source, constName, values) {
  const replacementArray = toConstArray(values);
  const re = new RegExp(
    `(export const ${constName}\\s*=\\s*)\\[([\\s\\S]*?)\\](\\s*as const;)`,
    'm',
  );
  if (!re.test(source)) {
    throw new Error(`Cannot find export const ${constName} in enums.ts`);
  }
  return source.replace(re, `$1${replacementArray}$3`);
}

function main() {
  const schemaSource = readFileSync(SCHEMA_PATH, 'utf8');
  const originalEnumsSource = readFileSync(ENUMS_PATH, 'utf8');

  let updatedSource = originalEnumsSource;
  for (const mapping of ENUM_SYNC) {
    const values = extractPrismaEnumValues(schemaSource, mapping.prismaName);
    updatedSource = replaceConstArray(updatedSource, mapping.sharedConst, values);
  }

  if (updatedSource === originalEnumsSource) {
    console.log(
      `sync-inventory-contract-enums ${checkOnly ? 'check' : 'write'} OK (no changes)`,
    );
    return;
  }

  if (checkOnly) {
    console.error(
      'sync-inventory-contract-enums CHECK FAIL — enums.ts is out of sync with schema.prisma. Run: npm run generate:inventory-contract',
    );
    process.exit(1);
  }

  writeFileSync(ENUMS_PATH, updatedSource, 'utf8');
  console.log('sync-inventory-contract-enums write OK (shared contracts updated)');
}

main();
