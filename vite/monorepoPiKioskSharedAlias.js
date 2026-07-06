var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
import fs from 'node:fs';
import path from 'node:path';
function toPosixPath(filePath) {
    return filePath.split(path.sep).join('/');
}
function resolveExportPath(packageRoot, importPath) {
    return path.resolve(packageRoot, importPath.replace(/^\.\//, ''));
}
/**
 * Pin pi-kiosk-shared subpaths to monorepo sibling shared/ when dist exists.
 * Main entry uses exact-match alias so subpaths (sentry, ui, css) are not swallowed.
 */
export function buildMonorepoPiKioskSharedAlias(appRoot) {
    var _a;
    var siblingPackageRoot = path.resolve(appRoot, '../shared');
    var siblingDistIndex = path.join(siblingPackageRoot, 'dist', 'index.js');
    var nodePackageRoot = path.resolve(appRoot, 'node_modules/pi-kiosk-shared');
    var nodeDistIndex = path.join(nodePackageRoot, 'dist', 'index.js');
    var packageRoot = fs.existsSync(siblingDistIndex)
        ? siblingPackageRoot
        : fs.existsSync(nodeDistIndex)
            ? nodePackageRoot
            : null;
    if (packageRoot === null) {
        return { alias: [], enabled: false, excludeDeps: [] };
    }
    var sharedDist = path.join(packageRoot, 'dist');
    var alias = [];
    var excludeDeps = new Set();
    var pkgPath = path.join(packageRoot, 'package.json');
    if (fs.existsSync(pkgPath)) {
        var pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
        var exportAliases = Object.entries((_a = pkg.exports) !== null && _a !== void 0 ? _a : {})
            .filter(function (_a) {
            var subpath = _a[0];
            return subpath !== '.';
        })
            .map(function (_a) {
            var subpath = _a[0], target = _a[1];
            var importPath = typeof target === 'string'
                ? target
                : typeof target === 'object' && target !== null && 'import' in target
                    ? target.import
                    : undefined;
            if (importPath === undefined || importPath.endsWith('.css')) {
                return null;
            }
            var replacement = resolveExportPath(packageRoot, importPath);
            if (!fs.existsSync(replacement)) {
                return null;
            }
            return {
                find: "pi-kiosk-shared/".concat(subpath.slice(2)),
                replacement: toPosixPath(replacement),
            };
        })
            .filter(function (entry) { return entry !== null; })
            .sort(function (left, right) { return right.find.length - left.find.length; });
        for (var _i = 0, exportAliases_1 = exportAliases; _i < exportAliases_1.length; _i++) {
            var entry = exportAliases_1[_i];
            alias.push(entry);
            excludeDeps.add(entry.find);
        }
    }
    var rootIndex = path.join(sharedDist, 'index.js');
    if (fs.existsSync(rootIndex)) {
        alias.push({
            find: /^pi-kiosk-shared$/,
            replacement: toPosixPath(rootIndex),
        });
        excludeDeps.add('pi-kiosk-shared');
    }
    return { alias: alias, enabled: alias.length > 0, excludeDeps: __spreadArray([], excludeDeps, true) };
}
