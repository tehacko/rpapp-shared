/**
 * @jest-environment jsdom
 */
import { describe, expect, it } from '@jest/globals';
import { setBackgroundInert } from './overlayFocus.js';

describe('setBackgroundInert', () => {
  it('marks page siblings inert and clears on cleanup', () => {
    const page = document.createElement('div');
    page.setAttribute('data-testid', 'page');
    const overlay = document.createElement('div');
    overlay.setAttribute('data-testid', 'overlay');
    document.body.append(page, overlay);

    const clear = setBackgroundInert(overlay);

    expect(page.hasAttribute('inert')).toBe(true);
    expect(overlay.hasAttribute('inert')).toBe(false);

    clear();

    expect(page.hasAttribute('inert')).toBe(false);
    expect(overlay.hasAttribute('inert')).toBe(false);

    page.remove();
    overlay.remove();
  });

  it('inerts siblings along the ancestor path, not ancestors themselves', () => {
    const root = document.createElement('div');
    const sibling = document.createElement('div');
    sibling.setAttribute('data-testid', 'sibling');
    const branch = document.createElement('div');
    const keepAlive = document.createElement('div');
    keepAlive.setAttribute('data-testid', 'keep-alive');
    branch.append(keepAlive);
    root.append(sibling, branch);
    document.body.append(root);

    const clear = setBackgroundInert(keepAlive);

    expect(sibling.hasAttribute('inert')).toBe(true);
    expect(root.hasAttribute('inert')).toBe(false);
    expect(branch.hasAttribute('inert')).toBe(false);
    expect(keepAlive.hasAttribute('inert')).toBe(false);

    clear();

    expect(sibling.hasAttribute('inert')).toBe(false);

    root.remove();
  });
});
