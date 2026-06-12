import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from '../App';

// User standing at Kapaleeshwarar Temple, Mylapore.
const MYLAPORE = { latitude: 13.0337, longitude: 80.2698 };

function stubGeolocation(impl: 'grant' | 'deny') {
  Object.defineProperty(navigator, 'geolocation', {
    configurable: true,
    value: {
      getCurrentPosition: (
        ok: (pos: { coords: typeof MYLAPORE }) => void,
        err: (e: Error) => void
      ) => (impl === 'grant' ? ok({ coords: MYLAPORE }) : err(new Error('denied'))),
    },
  });
}

beforeEach(() => localStorage.clear());
afterEach(() => {
  // remove the stub so other suites see jsdom's default (no geolocation)
  delete (navigator as { geolocation?: unknown }).geolocation;
});

describe('near me', () => {
  it('sorts by distance and shows distances on cards when granted', async () => {
    stubGeolocation('grant');
    render(<App />);
    await userEvent.click(screen.getByRole('button', { name: /near me/i }));

    const cards = screen.getAllByRole('link');
    // Standing at the temple, the temple is the closest card.
    expect(within(cards[0]).getByText('Kapaleeshwarar Temple')).toBeInTheDocument();
    expect(within(cards[0]).getByText(/~\d+ m/)).toBeInTheDocument();
    // Day trips are far away and sort last.
    expect(within(cards[cards.length - 1]).getByText(/~\d+ km/)).toBeInTheDocument();
  });

  it('offers distance chips that filter out far places', async () => {
    stubGeolocation('grant');
    render(<App />);
    await userEvent.click(screen.getByRole('button', { name: /near me/i }));
    await userEvent.click(screen.getByRole('button', { name: /^filters$/i }));
    await userEvent.click(screen.getByRole('button', { name: /under 3 km/i }));

    expect(screen.getByText('Kapaleeshwarar Temple')).toBeInTheDocument();
    expect(screen.queryByText('Mahabalipuram')).not.toBeInTheDocument(); // ~55 km away
  });

  it('turning near me off restores the curated order and clears the distance filter', async () => {
    stubGeolocation('grant');
    render(<App />);
    const nearMe = screen.getByRole('button', { name: /near me/i });
    await userEvent.click(nearMe);
    await userEvent.click(screen.getByRole('button', { name: /^filters$/i }));
    await userEvent.click(screen.getByRole('button', { name: /under 3 km/i }));
    await userEvent.click(nearMe);

    const cards = screen.getAllByRole('link');
    expect(within(cards[0]).getByText('Marina Beach')).toBeInTheDocument();
    expect(screen.getByText('Mahabalipuram')).toBeInTheDocument();
    expect(screen.queryByText(/~\d/)).not.toBeInTheDocument();
  });

  it('shows "Location off" and keeps the full list when permission is denied', async () => {
    stubGeolocation('deny');
    render(<App />);
    await userEvent.click(screen.getByRole('button', { name: /near me/i }));
    expect(await screen.findByRole('button', { name: /location off/i })).toBeInTheDocument();
    expect(screen.getByText('Marina Beach')).toBeInTheDocument();
  });
});
