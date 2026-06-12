// All localStorage keys the app is allowed to use, in one place — so the
// storage test can assert we never sprawl beyond a tiny, known footprint.
export const STORAGE_KEYS = {
  theme: 'cc-theme',
} as const;

export type StorageKey = (typeof STORAGE_KEYS)[keyof typeof STORAGE_KEYS];

export function readStorage(key: StorageKey): string | null {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

export function writeStorage(key: StorageKey, value: string): void {
  try {
    localStorage.setItem(key, value);
  } catch {
    // Storage can be full or blocked (private mode) — never let it break the app.
  }
}

/** Total bytes the app currently occupies in localStorage (for the budget test). */
export function appStorageFootprint(): number {
  let bytes = 0;
  for (const key of Object.values(STORAGE_KEYS)) {
    const value = readStorage(key);
    if (value !== null) bytes += key.length + value.length;
  }
  return bytes;
}
