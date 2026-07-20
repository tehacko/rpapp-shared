import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { test } from 'node:test';
import assert from 'node:assert/strict';

const tokensDir = join(dirname(fileURLToPath(import.meta.url)), '..');

test('theme.css defines explicit .light override block', () => {
  const theme = readFileSync(join(tokensDir, 'theme.css'), 'utf8');
  assert.match(theme, /\.light\s*\{/);
  assert.match(theme, /\.light[\s\S]*--color-surface:\s*#ffffff/);
});

test('admin-theme.css defines explicit .light override with rail-violet dark neutrals', () => {
  const admin = readFileSync(join(tokensDir, 'admin-theme.css'), 'utf8');
  assert.match(admin, /\.light\s*\{/);
  assert.match(admin, /\.light[\s\S]*--color-an-surface:\s*#ffffff/);
  assert.match(admin, /\.dark[\s\S]*--color-an-bg:\s*#12102a/);
  assert.match(admin, /\.dark[\s\S]*--color-an-surface:\s*#1e1b4b/);
});
