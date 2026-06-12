import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import PlaceCard from '../components/PlaceCard';
import type { Place } from '../data/places';
import { sharePlace } from '../utils/shareCard';

vi.mock('../utils/shareCard', () => ({
  sharePlace: vi.fn().mockResolvedValue('shared'),
}));

const place: Place = {
  id: 'bessie',
  name: 'Bessie Beach',
  category: 'Beaches',
  area: 'Besant Nagar',
  description: 'Sunsets and street food.',
  price: 'Free',
  vibes: ['Group hangout'],
  bestTime: ['Evening'],
  setting: 'Outdoor',
  tags: ['sunset'],
  googleQuery: 'Elliots Beach Besant Nagar Chennai',
};

describe('PlaceCard (postcard)', () => {
  beforeEach(() => {
    vi.stubGlobal('open', vi.fn());
  });

  it('renders the postcard: name, route, stamp, fare, ticket number and message', () => {
    render(<PlaceCard place={place} index={0} />);
    expect(screen.getByText('Bessie Beach')).toBeInTheDocument();
    expect(screen.getByText(/via Besant Nagar/)).toBeInTheDocument();
    expect(screen.getByText('🌊')).toBeInTheDocument();
    expect(screen.getByText('Beaches')).toBeInTheDocument();
    expect(screen.getByText(/fare/i)).toHaveTextContent('Free');
    expect(screen.getByText(/Nº \d+/)).toBeInTheDocument();
    expect(screen.getByText(/sunsets and street food/i)).toBeInTheDocument();
    expect(screen.getByText('#sunset')).toBeInTheDocument();
  });

  it('shows nearest transit when provided and hides the row otherwise', () => {
    const { rerender } = render(
      <PlaceCard
        place={{
          ...place,
          transit: { metro: 'Thirumayilai', rail: 'Mambalam', bus: 'Mylapore Tank' },
        }}
        index={0}
      />
    );
    expect(screen.getByLabelText('Nearest public transport')).toBeInTheDocument();
    expect(screen.getByText('Thirumayilai')).toBeInTheDocument();
    expect(screen.getByText('Mambalam')).toBeInTheDocument();
    expect(screen.getByText('Mylapore Tank')).toBeInTheDocument();

    rerender(<PlaceCard place={place} index={0} />);
    expect(screen.queryByLabelText('Nearest public transport')).not.toBeInTheDocument();
  });

  it("marks community places with a friend's pick tag", () => {
    const { rerender } = render(<PlaceCard place={{ ...place, community: true }} index={0} />);
    expect(screen.getByText(/friend's pick/i)).toBeInTheDocument();

    rerender(<PlaceCard place={place} index={0} />);
    expect(screen.queryByText(/friend's pick/i)).not.toBeInTheDocument();
  });

  it('shows an icon per best-time slot', () => {
    render(<PlaceCard place={{ ...place, bestTime: ['Morning', 'Night'] }} index={0} />);
    expect(screen.getByLabelText('Best in the morning')).toBeInTheDocument();
    expect(screen.getByLabelText('Best at night')).toBeInTheDocument();
  });

  it('opens the Google search page when the card is clicked', async () => {
    render(<PlaceCard place={place} index={0} />);
    await userEvent.click(screen.getByRole('link', { name: /bessie beach/i }));
    expect(window.open).toHaveBeenCalledTimes(1);
    expect(window.open).toHaveBeenCalledWith(
      'https://www.google.com/search?q=Elliots%20Beach%20Besant%20Nagar%20Chennai',
      '_blank',
      'noopener,noreferrer'
    );
  });

  it('opens the Google search page exactly once from the Google it button', async () => {
    render(<PlaceCard place={place} index={0} />);
    await userEvent.click(screen.getByRole('button', { name: /google it/i }));
    expect(window.open).toHaveBeenCalledTimes(1);
    expect(window.open).toHaveBeenCalledWith(
      expect.stringContaining('google.com/search'),
      '_blank',
      'noopener,noreferrer'
    );
  });

  it('opens Google search on Enter for keyboard users', async () => {
    render(<PlaceCard place={place} index={0} />);
    screen.getByRole('link', { name: /bessie beach/i }).focus();
    await userEvent.keyboard('{Enter}');
    expect(window.open).toHaveBeenCalledWith(
      expect.stringContaining('google.com/search'),
      '_blank',
      'noopener,noreferrer'
    );
  });

  it('shares the postcard from the share button without opening Google', async () => {
    render(<PlaceCard place={place} index={0} />);
    await userEvent.click(screen.getByRole('button', { name: /share bessie beach/i }));
    expect(sharePlace).toHaveBeenCalledWith(place);
    expect(window.open).not.toHaveBeenCalled();
  });

  it('opens Maps directions from the directions button without triggering the card click', async () => {
    render(<PlaceCard place={place} index={0} />);
    await userEvent.click(screen.getByRole('button', { name: /directions to bessie beach/i }));
    expect(window.open).toHaveBeenCalledTimes(1);
    expect(window.open).toHaveBeenCalledWith(
      'https://www.google.com/maps/dir/?api=1&destination=Elliots%20Beach%20Besant%20Nagar%20Chennai',
      '_blank',
      'noopener,noreferrer'
    );
  });
});
