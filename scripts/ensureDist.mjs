/**
 * Incremental shared build for local dev / E2E — never runs `rimraf dist`.
 * Avoids wiping dist while Vite is serving (root cause of blank Playwright pages).
 */
import { execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const sharedRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const distIndex = path.join(sharedRoot, 'dist', 'index.js');
const distSentry = path.join(sharedRoot, 'dist', 'sentry', 'initSentry.js');

if (!fs.existsSync(distIndex) || !fs.existsSync(distSentry)) {
  execSync('npx tsc', { cwd: sharedRoot, stdio: 'inherit' });
}
