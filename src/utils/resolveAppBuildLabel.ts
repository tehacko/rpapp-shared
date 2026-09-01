export interface ResolveAppBuildLabelOptions {
  readonly appVersion?: string | undefined;
  readonly buildId?: string | undefined;
  readonly fallback?: string;
}

/** Display build/version label — prefer explicit app version, then build id, then fallback. */
export function resolveAppBuildLabel(options: ResolveAppBuildLabelOptions): string {
  const { appVersion, buildId, fallback = 'dev' } = options;
  if (typeof appVersion === 'string' && appVersion.trim().length > 0) {
    return appVersion.trim();
  }
  if (typeof buildId === 'string' && buildId.trim().length > 0) {
    return buildId.trim();
  }
  return fallback;
}
