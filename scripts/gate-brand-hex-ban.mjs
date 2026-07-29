#!/usr/bin/env node
/**
 * Phase 1 CI — ban stray brand hex outside SSOT + raw slate-as-brand.
 *
 * Admin Option C violet (`#7C3AED` `#6366F1` `#1E1B4B`) is **allowed only** in
 * `shared/src/tokens/brand-bridge.css` (DECISION-1 Option C admin rail/CTA).
 * Elsewhere: use `--brand-admin-*` / `--brand-rail-*` tokens.
 *
 * Always banned: `#00203F` `#ADEFD1` `#1F5F78` (legacy Canva / primary-drift).
 * Raw slate `#0F172A` / `#F1F5F9` / `#E2E8F0` fail unless the same line
 * declares `--color-neutral-*` or `--brand-rail-*`.
 *
 * @see ADR-FE-BRAND-002 · brand-palette.md Option C · plan §A CI hex ban
 */
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { dirname, extname, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const SHARED_ROOT = join(__dirname, '..');
const REPO_ROOT = join(SHARED_ROOT, '..');

const TOKENS_ROOT = join(REPO_ROOT, 'shared', 'src', 'tokens');

const ALL_SCAN_ROOTS = [
  join(REPO_ROOT, 'shared', 'src'),
  join(REPO_ROOT, 'admin-app', 'src'),
  join(REPO_ROOT, 'rpapp-customer', 'src'),
  join(REPO_ROOT, 'rpapp-kiosk', 'src'),
  join(REPO_ROOT, 'rpapp-pickup', 'src'),
];

/** Phase 1 default = token SSOT only; `--all` expands to app surfaces (Phase 5). */
const scanAll = process.argv.includes('--all');
const SCAN_ROOTS = scanAll ? ALL_SCAN_ROOTS : [TOKENS_ROOT];

const SCAN_EXTS = new Set(['.css', '.ts', '.tsx', '.js', '.jsx', '.mjs', '.cjs']);

const SKIP_DIR_NAMES = new Set([
  'node_modules',
  'dist',
  'build',
  'coverage',
  '.git',
  '__snapshots__',
  '__tests__',
]);

/**
 * @param {string} fileName
 */
function isTestFile(fileName) {
  return (
    /\.(?:test|spec)\.(?:[cm]?[jt]sx?|mjs|cjs)$/i.test(fileName) ||
    fileName.endsWith('.test.mjs') ||
    fileName.endsWith('.spec.mjs')
  );
}

/** Absolute ban — never allowed in scanned sources */
const BANNED_HEX = ['#00203F', '#ADEFD1', '#1F5F78'];

/**
 * Admin Option C violet — SSOT in brand-bridge.css; also allowed in
 * admin-app design-tokens.css so admin can pin rail/CTA if a stale
 * package copy remaps `--brand-admin-*` onto consumer teal.
 */
const ADMIN_OPTION_C_HEX = ['#7C3AED', '#6366F1', '#1E1B4B'];
const ADMIN_OPTION_C_ALLOW_RE =
  /(?:^|\/)(?:brand-bridge\.css|admin-app\/src\/shared\/styles\/design-tokens\.css)$/;

/** Slate — allowed only via `--color-neutral-*` or `--brand-rail-*` on the same line */
const SLATE_HEX = ['#0F172A', '#F1F5F9', '#E2E8F0'];

const OFFICIAL_GRADIENT_NEEDLES = [
  'linear-gradient(135deg, #174b52 0%, #58a9b5 100%)',
  'linear-gradient(135deg, #0f3036 0%, #1f6f78 100%)',
  'linear-gradient(180deg, #eef6f7 0%, #ffffff 100%)',
];

const HEX_RE = /#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})\b/g;
const NEUTRAL_ALLOW_RE = /--color-neutral-(?:950|100|200)\b|--brand-rail-/;
const LINEAR_GRADIENT_RE = /linear-gradient\s*\([^)]+\)/gi;

/**
 * @param {string} dir
 * @param {(filePath: string) => void} visit
 */
function walk(dir, visit) {
  let entries;
  try {
    entries = readdirSync(dir, { withFileTypes: true });
  } catch {
    return;
  }
  for (const entry of entries) {
    if (entry.name.startsWith('.') && entry.name !== '.') continue;
    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      if (SKIP_DIR_NAMES.has(entry.name)) continue;
      walk(full, visit);
      continue;
    }
    if (!entry.isFile()) continue;
    if (isTestFile(entry.name)) continue;
    if (!SCAN_EXTS.has(extname(entry.name))) continue;
    visit(full);
  }
}

/**
 * @param {string} hex
 */
function normalizeHex(hex) {
  const raw = hex.toUpperCase();
  if (raw.length === 4) {
    const r = raw[1];
    const g = raw[2];
    const b = raw[3];
    return `#${r}${r}${g}${g}${b}${b}`;
  }
  return raw;
}

/**
 * @param {string} line
 * @param {string} hexNorm
 */
function slateAllowed(line, hexNorm) {
  if (!SLATE_HEX.includes(hexNorm)) return true;
  return NEUTRAL_ALLOW_RE.test(line);
}

/**
 * @param {string} filePath
 * @param {string} content
 * @returns {{ file: string, line: number, hex: string, reason: string }[]}
 */
function scanFile(filePath, content) {
  /** @type {{ file: string, line: number, hex: string, reason: string }[]} */
  const hits = [];
  const rel = relative(REPO_ROOT, filePath).replace(/\\/g, '/');
  const isAdminOptionCAllow = ADMIN_OPTION_C_ALLOW_RE.test(rel);
  const lines = content.split(/\r?\n/);

  for (let i = 0; i < lines.length; i += 1) {
    const line = lines[i];
    const lineNo = i + 1;

    HEX_RE.lastIndex = 0;
    let match = HEX_RE.exec(line);
    while (match) {
      const hexNorm = normalizeHex(match[0]);
      if (BANNED_HEX.includes(hexNorm)) {
        hits.push({
          file: rel,
          line: lineNo,
          hex: hexNorm,
          reason: 'banned legacy Canva / primary-drift brand hex',
        });
      } else if (ADMIN_OPTION_C_HEX.includes(hexNorm) && !isAdminOptionCAllow) {
        hits.push({
          file: rel,
          line: lineNo,
          hex: hexNorm,
          reason:
            'admin Option C violet hex outside brand-bridge.css / admin design-tokens.css — use --brand-admin-* / --brand-rail-*',
        });
      } else if (SLATE_HEX.includes(hexNorm) && !slateAllowed(line, hexNorm)) {
        hits.push({
          file: rel,
          line: lineNo,
          hex: hexNorm,
          reason:
            'raw slate hex as brand — allow only on lines with --color-neutral-* or --brand-rail-*',
        });
      }
      match = HEX_RE.exec(line);
    }

    LINEAR_GRADIENT_RE.lastIndex = 0;
    let grad = LINEAR_GRADIENT_RE.exec(line);
    while (grad) {
      const g = grad[0].replace(/\s+/g, ' ').toLowerCase();
      const isOfficial = OFFICIAL_GRADIENT_NEEDLES.some((n) => g.includes(n));
      const usesBanned = BANNED_HEX.some((h) => g.includes(h.toLowerCase()));
      const usesAdminOptionC =
        !isAdminOptionCAllow && ADMIN_OPTION_C_HEX.some((h) => g.includes(h.toLowerCase()));
      const usesSlateBrand = SLATE_HEX.some(
        (h) => g.includes(h.toLowerCase()) && !NEUTRAL_ALLOW_RE.test(line),
      );
      if (!isOfficial && (usesBanned || usesAdminOptionC || usesSlateBrand)) {
        hits.push({
          file: rel,
          line: lineNo,
          hex: grad[0].slice(0, 64),
          reason: 'non-official brand gradient (banned hex inside linear-gradient)',
        });
      }
      grad = LINEAR_GRADIENT_RE.exec(line);
    }
  }

  return hits;
}

/** @type {{ file: string, line: number, hex: string, reason: string }[]} */
const allHits = [];

for (const root of SCAN_ROOTS) {
  try {
    if (!statSync(root).isDirectory()) continue;
  } catch {
    continue;
  }
  walk(root, (filePath) => {
    const content = readFileSync(filePath, 'utf8');
    allHits.push(...scanFile(filePath, content));
  });
}

if (allHits.length > 0) {
  console.error('gate-brand-hex-ban: FAILED — banned brand / slate hex found:\n');
  for (const hit of allHits) {
    console.error(`  ${hit.file}:${String(hit.line)}  ${hit.hex}  — ${hit.reason}`);
  }
  console.error(
    `\nRecovery: use Adriatic --color-brand-* (consumer) or Option C --brand-admin-* / --brand-rail-* (admin SSOT in brand-bridge.css). See brand-palette.md.`,
  );
  process.exit(1);
}

console.log(
  `gate-brand-hex-ban: ok (${scanAll ? 'all surfaces' : 'tokens SSOT only'}; Option C violet only in brand-bridge; no stray brand hex)`,
);
process.exit(0);
