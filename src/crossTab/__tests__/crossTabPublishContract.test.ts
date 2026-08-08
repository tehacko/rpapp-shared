/** @jest-environment node */

import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import { describe, expect, it } from '@jest/globals';
import type { AdminAuthCrossTabMessage, KioskTabCrossTabMessage } from '../index.js';

const JWT_LIKE = /eyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}/;
const BEARER_IN_STRING = /Bearer\s+[A-Za-z0-9._-]{16,}/i;
const TOKEN_JWT_KEYS = /^(token|accessToken|refreshToken|idToken|jwt)$/i;

const KIOSK_TAB_SIGNALS: readonly KioskTabCrossTabMessage[] = [
  { type: 'kiosk-reset' },
  { type: 'session-rotate' },
  { type: 'kiosk-customer-session-changed' },
  { type: 'staff-logout' },
];

/** XT-G12 / G32 — publishAdminAuth-shaped bus payloads must never carry JWT/token fields. */
const ADMIN_AUTH_PUBLISH_PAYLOADS: readonly AdminAuthCrossTabMessage[] = [
  { type: 'login', tenantCode: 'acme', scope: 'tenant' },
  { type: 'login', tenantCode: 'platform', scope: 'platform' },
  { type: 'logout', tenantCode: 'acme', scope: 'tenant' },
  { type: 'session-refreshed', tenantCode: 'acme', scope: 'tenant' },
  { type: 'session-refreshed', tenantCode: 'platform', scope: 'platform' },
  { type: 'tenant-changed', tenantCode: 'acme', previousTenantCode: 'beta', scope: 'tenant' },
];

const REPO_ROOT = join(__dirname, '..', '..', '..', '..');

function collectSourceFiles(dir: string, acc: string[] = []): string[] {
  for (const entry of readdirSync(dir)) {
    const fullPath = join(dir, entry);
    const stat = statSync(fullPath);
    if (stat.isDirectory()) {
      if (entry === 'node_modules' || entry === 'dist' || entry === '__tests__') {
        continue;
      }
      collectSourceFiles(fullPath, acc);
      continue;
    }
    if (/\.(ts|tsx)$/.test(entry) && !entry.endsWith('.test.ts') && !entry.endsWith('.test.tsx')) {
      acc.push(fullPath);
    }
  }
  return acc;
}

function readPublishCustomerAuthBlocks(source: string): string[] {
  const blocks: string[] = [];
  const needle = 'publishCustomerAuth(';
  let index = 0;
  while (index < source.length) {
    const start = source.indexOf(needle, index);
    if (start === -1) {
      break;
    }
    const openParen = start + needle.length - 1;
    let depth = 0;
    let end = openParen;
    for (; end < source.length; end += 1) {
      const char = source[end];
      if (char === '(') {
        depth += 1;
      } else if (char === ')') {
        depth -= 1;
        if (depth === 0) {
          end += 1;
          break;
        }
      }
    }
    blocks.push(source.slice(start, end));
    index = end;
  }
  return blocks;
}

describe('crossTab publish contract (T-FE-31 / GAP-2-01)', () => {
  it('kiosk tab signals never embed bearer or JWT-shaped strings', () => {
    for (const message of KIOSK_TAB_SIGNALS) {
      const serialized = JSON.stringify(message);
      expect(serialized).not.toMatch(JWT_LIKE);
      expect(serialized).not.toMatch(BEARER_IN_STRING);
      expect(serialized).not.toMatch(/accessToken|refreshToken/i);
    }
  });

  it('publishAdminAuth payloads have no token/jwt fields (XT-G12 / G32)', () => {
    for (const message of ADMIN_AUTH_PUBLISH_PAYLOADS) {
      const serialized = JSON.stringify(message);
      expect(serialized).not.toMatch(JWT_LIKE);
      expect(serialized).not.toMatch(BEARER_IN_STRING);
      for (const key of Object.keys(message)) {
        expect(key).not.toMatch(TOKEN_JWT_KEYS);
      }
    }
  });

  it('customer publishCustomerAuth call sites never pass session snapshot on the bus (GAP-2-01)', () => {
    const customerSrc = join(REPO_ROOT, 'rpapp-customer/src');
    const offenders: string[] = [];

    for (const filePath of collectSourceFiles(customerSrc)) {
      const source = readFileSync(filePath, 'utf8');
      for (const block of readPublishCustomerAuthBlocks(source)) {
        if (/\bsession\s*:/.test(block)) {
          offenders.push(relative(REPO_ROOT, filePath));
        }
      }
    }

    expect(offenders).toEqual([]);
  });
});
