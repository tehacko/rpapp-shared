import { readFileSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { test } from 'node:test';
import assert from 'node:assert/strict';

const tokensDir = join(dirname(fileURLToPath(import.meta.url)), '..');

test('theme.css and admin-theme.css exist and export @theme tokens', () => {
  const theme = readFileSync(join(tokensDir, 'theme.css'), 'utf8');
  const admin = readFileSync(join(tokensDir, 'admin-theme.css'), 'utf8');
  assert.match(theme, /@theme/);
  assert.match(theme, /--color-surface/);
  assert.match(admin, /--color-an-bg/);
  assert.match(admin, /--color-rail-sidebar-bg/);
});

test('package.json exports token CSS paths', () => {
  const pkgPath = join(tokensDir, '..', '..', 'package.json');
  const pkg = JSON.parse(readFileSync(pkgPath, 'utf8'));
  assert.ok(pkg.exports['./theme.css']);
  assert.ok(pkg.exports['./admin-theme.css']);
  assert.ok(existsSync(join(tokensDir, 'theme.css')));
});
