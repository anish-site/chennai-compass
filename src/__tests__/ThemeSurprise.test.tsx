import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from '../App';
import { places } from '../data/places';
import { STORAGE_KEYS } from '../utils/storage';

beforeEach(() => {
  localStorage.clear();
  document.documentElement.removeAttribute('data-theme');
});

describe('dark mode', () => {
  it('defaults to light and toggles to dark, persisting the choice', async () => {
    render(<App />);
    expect(document.documentElement.dataset.theme).toBe('light');

    await userEvent.click(screen.getByRole('button', { name: /switch to dark mode/i }));
    expect(document.documentElement.dataset.theme).toBe('dark');
    expect(localStorage.getItem(STORAGE_KEYS.theme)).toBe('dark');

    // Toggle label flips so it can switch back.
    await userEvent.click(screen.getByRole('button', { name: /switch to light mode/i }));
    expect(document.documentElement.dataset.theme).toBe('light');
  });
});

describe('surprise me', () => {
  afterEach(() => vi.restoreAllMocks());

  it('opens a single random recommendation from the hero button', async () => {
    vi.spyOn(Math, 'random').mockReturnValue(0); // deterministic -> first place
    render(<App />);

    await userEvent.click(screen.getByRole('button', { name: /surprise me/i }));
    const dialog = screen.getByRole('dialog');
    const pick = within(dialog).getByTestId('surprise-pick');
    expect(within(pick).getByText(places[0].name)).toBeInTheDocument();
  });

  it('re-rolls to a different place with "Surprise me again"', async () => {
    const randoms = [0, 0.999]; // first pick, then last of the remaining pool
    let i = 0;
    vi.spyOn(Math, 'random').mockImplementation(() => randoms[Math.min(i++, randoms.length - 1)]);
    render(<App />);

    await userEvent.click(screen.getByRole('button', { name: /surprise me/i }));
    const first = within(screen.getByTestId('surprise-pick')).getByRole('heading').textContent;

    await userEvent.click(screen.getByRole('button', { name: /surprise me again/i }));
    const second = within(screen.getByTestId('surprise-pick')).getByRole('heading').textContent;
    expect(second).not.toBe(first);
  });
});
