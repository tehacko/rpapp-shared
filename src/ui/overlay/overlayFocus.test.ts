/**
 * @jest-environment jsdom
 */
import { afterEach, describe, expect, it } from '@jest/globals';
import { lockBodyScroll, setBackgroundInert } from './overlayFocus.js';

describe('lockBodyScroll', () => {
  afterEach(() => {
    document.documentElement.style.overflow = '';
    document.body.style.overflow = '';
    document.documentElement.style.overscrollBehavior = '';
    document.body.style.overscrollBehavior = '';
  });

  it('locks html+body overflow and overscroll on first lock and restores on unlock', () => {
    document.documentElement.style.overflow = 'auto';
    document.body.style.overflow = 'scroll';
    document.documentElement.style.overscrollBehavior = 'contain';
    document.body.style.overscrollBehavior = 'auto';

    const unlock = lockBodyScroll();

    expect(document.documentElement.style.overflow).toBe('hidden');
    expect(document.body.style.overflow).toBe('hidden');
    expect(document.documentElement.style.overscrollBehavior).toBe('none');
    expect(document.body.style.overscrollBehavior).toBe('none');

    unlock();

    expect(document.documentElement.style.overflow).toBe('auto');
    expect(document.body.style.overflow).toBe('scroll');
    expect(document.documentElement.style.overscrollBehavior).toBe('contain');
    expect(document.body.style.overscrollBehavior).toBe('auto');
  });

  it('nests refcount: unlock restores only when count reaches zero', () => {
    document.documentElement.style.overflow = 'visible';
    document.body.style.overflow = 'visible';
    document.documentElement.style.overscrollBehavior = '';
    document.body.style.overscrollBehavior = '';

    const unlock1 = lockBodyScroll();
    const unlock2 = lockBodyScroll();

    expect(document.documentElement.style.overflow).toBe('hidden');
    expect(document.body.style.overflow).toBe('hidden');

    unlock1();
    expect(document.documentElement.style.overflow).toBe('hidden');
    expect(document.body.style.overflow).toBe('hidden');
    expect(document.documentElement.style.overscrollBehavior).toBe('none');
    expect(document.body.style.overscrollBehavior).toBe('none');

    unlock2();
    expect(document.documentElement.style.overflow).toBe('visible');
    expect(document.body.style.overflow).toBe('visible');
    expect(document.documentElement.style.overscrollBehavior).toBe('');
    expect(document.body.style.overscrollBehavior).toBe('');
  });
});

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
