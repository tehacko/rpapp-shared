import { memo } from 'react';

export const PROVIDER_ICON_ASSET_IDS = ['fio', 'thepay', 'stripe', 'generic-bank'] as const;

export type ProviderIconAssetId = (typeof PROVIDER_ICON_ASSET_IDS)[number];

const SIZE_PX = {
  sm: 16,
  md: 20,
  lg: 24,
} as const;

export type ProviderIconSize = keyof typeof SIZE_PX | number;

export interface ProviderIconProps {
  readonly providerId: string;
  readonly size?: ProviderIconSize;
  readonly className?: string;
  /** Public URL prefix for provider SVG assets (trailing slash optional). */
  readonly assetBasePath?: string;
  readonly title?: string;
}

export function resolveProviderIconAssetId(providerId: string): ProviderIconAssetId {
  const normalized = providerId.trim().toLowerCase();

  if (normalized === 'fio') {
    return 'fio';
  }

  if (normalized === 'thepay') {
    return 'thepay';
  }

  if (normalized === 'stripe' || normalized.startsWith('stripe_') || normalized.startsWith('stripe-')) {
    return 'stripe';
  }

  return 'generic-bank';
}

function resolveSizePx(size: ProviderIconSize | undefined): number {
  if (typeof size === 'number') {
    return size;
  }

  return SIZE_PX[size ?? 'md'];
}

function resolveAssetBasePath(assetBasePath: string): string {
  return assetBasePath.endsWith('/') ? assetBasePath : `${assetBasePath}/`;
}

export const ProviderIcon = memo<ProviderIconProps>(function ProviderIcon({
  providerId,
  size = 'md',
  className,
  assetBasePath = '/providers/',
  title,
}) {
  const assetId = resolveProviderIconAssetId(providerId);
  const dimension = resolveSizePx(size);
  const src = `${resolveAssetBasePath(assetBasePath)}${assetId}.svg`;
  const accessibleName = title ?? (assetId === 'generic-bank' ? providerId : assetId);

  return (
    <img
      src={src}
      alt=""
      width={dimension}
      height={dimension}
      className={className}
      title={title}
      data-testid="provider-icon"
      data-provider-id={providerId}
      data-provider-asset={assetId}
      role="img"
      aria-label={accessibleName}
    />
  );
});

ProviderIcon.displayName = 'ProviderIcon';
