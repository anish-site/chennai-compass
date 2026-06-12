import { beforeEach, describe, expect, it, vi } from 'vitest';
import { act, render, renderHook, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useVisited } from '../hooks/useVisited';
import { encodePassport } from '../utils/passport';
import { STORAGE_KEYS } from '../utils/storage';
import { places } from '../data/places';
import App from '../App';

beforeEach(() => {
  localStorage.clear();
  history.replaceState(null, '', '/');
});

describe('useVisited', () => {
  it('toggles stamps and persists them across reloads', () => {
    const { result } = renderHook(() => useVisited());
    act(() => result.current.toggle('marina-beach'));
    act(() => result.current.toggle('buhari'));
    act(() => result.current.toggle('buhari')); // un-stamp
    expect(result.current.visited).toEqual(['marina-beach']);

    // a fresh mount (≈ new visit) reads from storage
    const { result: reloaded } = renderHook(() => useVisited());
    expect(reloaded.current.visited).toEqual(['marina-beach']);
    expect(localStorage.getItem(STORAGE_KEYS.visited)).toBe('["marina-beach"]');
  });

  it('imports a #p= backup link, merges with local stamps, and clears the hash', () => {
    localStorage.setItem(STORAGE_KEYS.visited, JSON.stringify(['buhari']));
    const code = encodePassport(['marina-beach', 'kapaleeshwarar']);
    history.replaceState(null, '', `/#p=${code}`);

    const { result } = renderHook(() => useVisited());
    expect([...result.current.visited].sort()).toEqual(
      ['buhari', 'kapaleeshwarar', 'marina-beach'].sort()
    );
    expect(window.location.hash).toBe('');
  });

  it('ignores a garbled backup link', () => {
    history.replaceState(null, '', '/#p=1-zz-nothex');
    const { result } = renderHook(() => useVisited());
    expect(result.current.visited).toEqual([]);
  });
});

describe('passport in the app', () => {
  it('stamps a card and shows it in the passport modal with progress', async () => {
    render(<App />);
    await userEvent.click(
      screen.getAllByRole('button', { name: /stamp .* as visited/i })[0]
    );
    expect(screen.getByText('Visited ✓')).toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: /menu/i }));
    await userEvent.click(screen.getByRole('menuitem', { name: /my passport/i }));
    const dialog = screen.getByRole('dialog');
    expect(dialog).toHaveTextContent(`1 / ${places.length} spots stamped`);
    expect(within(dialog).getByRole('button', { name: /copy backup link/i })).toBeInTheDocument();
    expect(within(dialog).getByRole('button', { name: /share passport/i })).toBeInTheDocument();
  });

  it('copies a working backup link', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, 'clipboard', { value: { writeText }, configurable: true });

    render(<App />);
    await userEvent.click(screen.getByRole('button', { name: /menu/i }));
    await userEvent.click(screen.getByRole('menuitem', { name: /my passport/i }));
    await userEvent.click(screen.getByRole('button', { name: /copy backup link/i }));
    expect(writeText).toHaveBeenCalledWith(expect.stringContaining('#p=1-'));
  });
});
