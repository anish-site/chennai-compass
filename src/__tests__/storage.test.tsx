import { beforeEach, describe, expect, it } from 'vitest';
import { render } from '@testing-library/react';
import App from '../App';
import { appStorageFootprint, STORAGE_KEYS } from '../utils/storage';
import { useTheme } from '../hooks/useTheme';
import { renderHook, act } from '@testing-library/react';

// Phones have limited storage and quotas; the app must keep a tiny,
// known footprint and never sprawl localStorage with junk keys.
const STORAGE_BUDGET_BYTES = 1024; // 1 KB is plenty for our single setting

describe('localStorage budget', () => {
  beforeEach(() => localStorage.clear());

  it('only writes keys from the known allowlist', () => {
    render(<App />);
    const allowed = new Set<string>(Object.values(STORAGE_KEYS));
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)!;
      expect(allowed.has(key), `unexpected localStorage key: ${key}`).toBe(true);
    }
  });

  it('stays well under the storage budget even after toggling the theme repeatedly', () => {
    const { result } = renderHook(() => useTheme());
    for (let i = 0; i < 25; i++) {
      act(() => result.current.toggle());
    }
    expect(appStorageFootprint()).toBeLessThan(STORAGE_BUDGET_BYTES);
    // A toggle overwrites, never accumulates.
    expect(localStorage.getItem(STORAGE_KEYS.theme)).toMatch(/^(light|dark)$/);
  });
});
