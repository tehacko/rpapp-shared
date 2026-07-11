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
