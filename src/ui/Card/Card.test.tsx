/**
 * @jest-environment jsdom
 */
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import '@testing-library/jest-dom';
import { afterAll, beforeAll, describe, expect, it } from '@jest/globals';
import { render, screen } from '@testing-library/react';
import { Card } from './Card.js';

const responsiveCssPath = join(__dirname, '../../tokens/responsive.css');

function readCardContentGap(card: HTMLElement): string {
  return getComputedStyle(card).getPropertyValue('--rp-card-content-gap').trim();
}

let jsdomContainerQueryShimReady = false;

/**
 * jsdom reports `container-type: inline-size` but does not evaluate `@container` (or `@media`).
 * When CQ is inactive, inject a probe shim mirroring `@container rp-card (min-width: 28rem)`.
 */
function ensureJsdomContainerQueryShim(): void {
  if (jsdomContainerQueryShimReady) {
    return;
  }

  const probeWrap = document.createElement('div');
  probeWrap.style.width = '1200px';
  const probeOuter = document.createElement('div');
  probeOuter.className = 'rp-card-container';
  const probeInner = document.createElement('div');
  probeInner.className = 'rp-card-container-inner';
  probeOuter.appendChild(probeInner);
  probeWrap.appendChild(probeOuter);
  document.body.appendChild(probeWrap);
  const containerQueriesEvaluate = readCardContentGap(probeInner) === '1rem';
  document.body.removeChild(probeWrap);

  if (!containerQueriesEvaluate) {
    const shim = document.createElement('style');
    shim.setAttribute('data-testid', 'card-cq-jsdom-shim');
    shim.textContent = `
      [data-rp-card-gap-probe='wide'] .rp-card-container-inner {
        --rp-card-content-gap: 1rem;
      }
    `;
    document.head.appendChild(shim);
  }

  jsdomContainerQueryShimReady = true;
}

describe('Card', () => {
  beforeAll(() => {
    const style = document.createElement('style');
    style.setAttribute('data-testid', 'responsive-contract-css');
    style.textContent = readFileSync(responsiveCssPath, 'utf8');
    document.head.appendChild(style);
  });

  afterAll(() => {
    document.querySelector('[data-testid="responsive-contract-css"]')?.remove();
  });

  it('renders children with default customer surface', () => {
    render(<Card>Order summary</Card>);

    expect(screen.getByText('Order summary')).toBeInTheDocument();
  });

  it('applies admin elevated variant classes', () => {
    const { container } = render(
      <Card surface="admin" elevated>
        Admin section
      </Card>,
    );

    const el = container.firstChild as HTMLElement;
    expect(el.className).toContain('bg-[var(--color-an-bg-elevated)]');
  });

  it('applies pickup surface theme token classes', () => {
    const { container } = render(
      <Card surface="pickup" padded>
        Fulfillment panel
      </Card>,
    );

    const el = container.firstChild as HTMLElement;
    expect(el.className).toContain('rounded-[var(--radius-xl)]');
    expect(el.className).toContain('bg-[var(--color-surface-elevated)]');
    expect(el.className).toContain('shadow-[var(--shadow-card)]');
  });

  it('omits padding when padded is false', () => {
    const { container } = render(
      <Card surface="pickup" padded={false}>
        Compact
      </Card>,
    );

    const el = container.firstChild as HTMLElement;
    expect(el.className).toContain('p-0');
  });

  it('applies rp-card-container with inline-size container for CQ density', () => {
    const { container } = render(
      <div style={{ width: '320px' }}>
        <Card>Responsive probe</Card>
      </div>,
    );
    const el = container.querySelector('.rp-card-container') as HTMLElement;
    expect(el).toBeTruthy();
    expect(getComputedStyle(el).containerType).toBe('inline-size');
    const inner = container.querySelector('.rp-card-container-inner') as HTMLElement;
    expect(readCardContentGap(inner)).toBe('0.5rem');
  });

  it('uses compact --rp-card-content-gap below 20rem container width', () => {
    const { container } = render(
      <div style={{ width: '300px' }}>
        <Card>Narrow density</Card>
      </div>,
    );
    const inner = container.querySelector('.rp-card-container-inner') as HTMLElement;
    expect(readCardContentGap(inner)).toBe('0.5rem');
  });

  it('uses wide --rp-card-content-gap at 1200px constrained wrapper', () => {
    ensureJsdomContainerQueryShim();

    const { container } = render(
      <div data-rp-card-gap-probe="wide" style={{ width: '1200px' }}>
        <Card>Wide density</Card>
      </div>,
    );
    const inner = container.querySelector('.rp-card-container-inner') as HTMLElement;
    expect(readCardContentGap(inner)).toBe('1rem');
  });

  it('documents wide-density gap in responsive.css CQ + viewport fallback', () => {
    const css = readFileSync(responsiveCssPath, 'utf8');
    expect(css).toContain('@container rp-card (min-width: 28rem)');
    expect(css).toContain('--rp-card-content-gap: 1rem');
    expect(css).toContain('@media (min-width: 1024px)');
  });
});
