import { useCallback, useEffect, useState } from 'react';
import { decodePassport } from '../utils/passport';
import { readStorage, STORAGE_KEYS, writeStorage } from '../utils/storage';

function load(): string[] {
  try {
    const raw = readStorage(STORAGE_KEYS.visited);
    const parsed: unknown = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed.filter((x): x is string => typeof x === 'string') : [];
  } catch {
    return [];
  }
}

/**
 * The visitor's passport stamps. Persisted in localStorage; a `#p=<code>`
 * backup link in the URL is imported (merged) once on load, so opening a
 * saved passport link on a new phone restores the stamps.
 */
export function useVisited(): { visited: string[]; toggle: (id: string) => void } {
  const [visited, setVisited] = useState<string[]>(load);

  useEffect(() => {
    const match = /#p=([0-9a-z-]+)/i.exec(window.location.hash);
    if (!match) return;
    const imported = decodePassport(match[1]);
    if (imported.length > 0) {
      setVisited((current) => [...new Set([...current, ...imported])]);
    }
    history.replaceState(null, '', window.location.pathname + window.location.search);
  }, []);

  useEffect(() => {
    writeStorage(STORAGE_KEYS.visited, JSON.stringify(visited));
  }, [visited]);

  const toggle = useCallback((id: string) => {
    setVisited((current) =>
      current.includes(id) ? current.filter((x) => x !== id) : [...current, id]
    );
  }, []);

  return { visited, toggle };
}
