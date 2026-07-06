import fs from 'node:fs';
import path from 'node:path';
import type { Alias, AliasOptions } from 'vite';

interface PackageExportTarget {
  readonly import?: string;
}

function toPosixPath(filePath: string): string {
  return filePath.split(path.sep).join('/');
}

function resolveExportPath(packageRoot: string, importPath: string): string {
  return path.resolve(packageRoot, importPath.replace(/^\.\//, ''));
}

/**
 * Pin pi-kiosk-shared subpaths to monorepo sibling shared/ when dist exists.
 * Main entry uses exact-match alias so subpaths (sentry, ui, css) are not swallowed.
 */
export function buildMonorepoPiKioskSharedAlias(
  appRoot: string,
): { readonly alias: AliasOptions; readonly enabled: boolean; readonly excludeDeps: string[] } {
  const siblingPackageRoot = path.resolve(appRoot, '../shared');
  const siblingDistIndex = path.join(siblingPackageRoot, 'dist', 'index.js');
  const nodePackageRoot = path.resolve(appRoot, 'node_modules/pi-kiosk-shared');
  const nodeDistIndex = path.join(nodePackageRoot, 'dist', 'index.js');

  const packageRoot = fs.existsSync(siblingDistIndex)
    ? siblingPackageRoot
    : fs.existsSync(nodeDistIndex)
      ? nodePackageRoot
      : null;

  if (packageRoot === null) {
    return { alias: [], enabled: false, excludeDeps: [] };
  }

  const sharedDist = path.join(packageRoot, 'dist');
  const alias: Alias[] = [];
  const excludeDeps = new Set<string>();

  const pkgPath = path.join(packageRoot, 'package.json');
  if (fs.existsSync(pkgPath)) {
    const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8')) as {
      readonly exports?: Record<string, string | PackageExportTarget>;
    };

    const exportAliases = Object.entries(pkg.exports ?? {})
      .filter(([subpath]) => subpath !== '.')
      .map(([subpath, target]) => {
        const importPath =
          typeof target === 'string'
            ? target
            : typeof target === 'object' && target !== null && 'import' in target
              ? target.import
              : undefined;
        if (importPath === undefined || importPath.endsWith('.css')) {
          return null;
        }
        const replacement = resolveExportPath(packageRoot, importPath);
        if (!fs.existsSync(replacement)) {
          return null;
        }
        return {
          find: `pi-kiosk-shared/${subpath.slice(2)}`,
          replacement: toPosixPath(replacement),
        };
      })
      .filter((entry): entry is { find: string; replacement: string } => entry !== null)
      .sort((left, right) => right.find.length - left.find.length);

    for (const entry of exportAliases) {
      alias.push(entry);
      excludeDeps.add(entry.find);
    }
  }

  const rootIndex = path.join(sharedDist, 'index.js');
  if (fs.existsSync(rootIndex)) {
    alias.push({
      find: /^pi-kiosk-shared$/,
      replacement: toPosixPath(rootIndex),
    });
    excludeDeps.add('pi-kiosk-shared');
  }

  return { alias, enabled: alias.length > 0, excludeDeps: [...excludeDeps] };
}
