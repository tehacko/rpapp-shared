import type { AliasOptions } from 'vite';
/**
 * Pin pi-kiosk-shared subpaths to monorepo sibling shared/ when dist exists.
 * Main entry uses exact-match alias so subpaths (sentry, ui, css) are not swallowed.
 */
export declare function buildMonorepoPiKioskSharedAlias(appRoot: string): {
    readonly alias: AliasOptions;
    readonly enabled: boolean;
    readonly excludeDeps: string[];
};
