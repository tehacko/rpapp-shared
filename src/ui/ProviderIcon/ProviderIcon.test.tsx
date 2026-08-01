/**
 * @jest-environment jsdom
 */
import '@testing-library/jest-dom';
import { describe, expect, it } from '@jest/globals';
import { render, screen } from '@testing-library/react';
import { ProviderIcon, resolveProviderIconAssetId } from './ProviderIcon.js';

describe('resolveProviderIconAssetId', () => {
  it('maps known provider slot ids to branded assets', () => {
    expect(resolveProviderIconAssetId('fio')).toBe('fio');
    expect(resolveProviderIconAssetId('thepay')).toBe('thepay');
    expect(resolveProviderIconAssetId('stripe')).toBe('stripe');
    expect(resolveProviderIconAssetId('stripe_eu')).toBe('stripe');
  });

  it('falls back to generic-bank for unknown providers', () => {
    expect(resolveProviderIconAssetId('cash')).toBe('generic-bank');
    expect(resolveProviderIconAssetId('')).toBe('generic-bank');
  });
});

describe('ProviderIcon', () => {
  it('renders an img with resolved asset path and dimensions', () => {
    render(<ProviderIcon providerId="fio" size="lg" title="Fio banka" />);

    const icon = screen.getByRole('img', { name: 'Fio banka' });
    expect(icon).toHaveAttribute('src', '/providers/fio.svg');
    expect(icon).toHaveAttribute('width', '24');
    expect(icon).toHaveAttribute('height', '24');
    expect(icon).toHaveAttribute('data-provider-asset', 'fio');
  });

  it('supports custom asset base paths and numeric sizes', () => {
    render(<ProviderIcon providerId="thepay" assetBasePath="/static/providers" size={18} />);

    const icon = screen.getByTestId('provider-icon');
    expect(icon).toHaveAttribute('src', '/static/providers/thepay.svg');
    expect(icon).toHaveAttribute('width', '18');
    expect(icon).toHaveAttribute('height', '18');
  });

  it('caps numeric size at 64', () => {
    render(<ProviderIcon providerId="stripe" size={128} title="Stripe" />);

    const icon = screen.getByRole('img', { name: 'Stripe' });
    expect(icon).toHaveAttribute('width', '64');
    expect(icon).toHaveAttribute('height', '64');
  });
});
