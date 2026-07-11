/** @jest-environment jsdom */
import { describe, expect, it, beforeEach, afterEach } from '@jest/globals';
import { createThemeApi, THEME_STORAGE_KEYS } from '../themeContract.js';

describe('themeContract light override precedence', () => {
  beforeEach(() => {
    document.documentElement.className = '';
    window.localStorage.clear();
  });

  afterEach(() => {
    document.documentElement.className = '';
    window.localStorage.clear();
  });

  it('adds .light when explicit light preference and override flag is enabled', () => {
    window.localStorage.setItem(THEME_STORAGE_KEYS.customer, 'light');
    createThemeApi(THEME_STORAGE_KEYS.customer, { lightOverrideEnabled: true }).applyInitialTheme();
    expect(document.documentElement.classList.contains('light')).toBe(true);
    expect(document.documentElement.classList.contains('dark')).toBe(false);
  });

  it('does not add .light when override flag is disabled', () => {
    window.localStorage.setItem(THEME_STORAGE_KEYS.customer, 'light');
    createThemeApi(THEME_STORAGE_KEYS.customer, { lightOverrideEnabled: false }).applyInitialTheme();
    expect(document.documentElement.classList.contains('light')).toBe(false);
    expect(document.documentElement.classList.contains('dark')).toBe(false);
  });

  it('adds .dark for explicit dark preference regardless of override flag', () => {
    window.localStorage.setItem(THEME_STORAGE_KEYS.customer, 'dark');
    createThemeApi(THEME_STORAGE_KEYS.customer, { lightOverrideEnabled: true }).applyInitialTheme();
    expect(document.documentElement.classList.contains('dark')).toBe(true);
    expect(document.documentElement.classList.contains('light')).toBe(false);
  });
});
