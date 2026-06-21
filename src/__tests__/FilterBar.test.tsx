import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from '../App';

describe('top picks filter', () => {
  it('narrows the grid to top picks and combines with a category', async () => {
    render(<App />);
    // San Thome is not a top pick; Marina and Kapaleeshwarar are.
    expect(screen.getByText('San Thome Basilica')).toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: /top picks/i }));
    expect(screen.getByText('Marina Beach')).toBeInTheDocument();
    expect(screen.queryByText('San Thome Basilica')).not.toBeInTheDocument();

    // Top picks + Heritage = just the heritage top pick.
    await userEvent.click(screen.getByRole('button', { name: 'Heritage' }));
    expect(screen.getByText('Kapaleeshwarar Temple')).toBeInTheDocument();
    expect(screen.queryByText('Marina Beach')).not.toBeInTheDocument();
  });

  it('clears with Clear all', async () => {
    render(<App />);
    await userEvent.click(screen.getByRole('button', { name: /top picks/i }));
    await userEvent.click(screen.getByRole('button', { name: /clear all/i }));
    expect(screen.getByText('San Thome Basilica')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /top picks/i })).toHaveAttribute(
      'aria-pressed',
      'false'
    );
  });
});

describe('category-aware tag filter', () => {
  it('reveals category tags only after a category is picked, and filters by them', async () => {
    render(<App />);
    await userEvent.click(screen.getByRole('button', { name: /^filters$/i }));
    // no category yet → a hint, no tag chips
    expect(screen.getByText(/pick a category above to filter by tags/i)).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'rustic' })).not.toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: 'Cafés' }));
    // café vocab tags appear
    expect(screen.getByRole('button', { name: 'rustic' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'luxury' })).toBeInTheDocument();

    // 'rustic' keeps Ciclo (rustic), drops Amethyst (luxury)
    await userEvent.click(screen.getByRole('button', { name: 'rustic' }));
    expect(screen.getByText('Ciclo Café')).toBeInTheDocument();
    expect(screen.queryByText('Amethyst Café')).not.toBeInTheDocument();
  });

  it('clears the chosen tags when the category changes', async () => {
    render(<App />);
    await userEvent.click(screen.getByRole('button', { name: 'Cafés' }));
    await userEvent.click(screen.getByRole('button', { name: /^filters$/i }));
    await userEvent.click(screen.getByRole('button', { name: 'rustic' }));
    // switch category → café tags (and the rustic selection) are gone
    await userEvent.click(screen.getByRole('button', { name: 'Beaches' }));
    expect(screen.queryByRole('button', { name: 'rustic' })).not.toBeInTheDocument();
    expect(screen.getByText('Marina Beach')).toBeInTheDocument();
  });
});

// Selecting a category should replace the previous one, not pile on.
describe('category filter is single-select', () => {
  it('shows only the chosen category and switches cleanly between them', async () => {
    render(<App />);

    // Marina Beach (Beaches) and Amethyst Café (Cafés) both start visible.
    expect(screen.getByText('Marina Beach')).toBeInTheDocument();
    expect(screen.getByText('Amethyst Café')).toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: 'Cafés' }));
    expect(screen.getByText('Amethyst Café')).toBeInTheDocument();
    expect(screen.queryByText('Marina Beach')).not.toBeInTheDocument();

    // Picking Beaches replaces Cafés rather than adding to it.
    await userEvent.click(screen.getByRole('button', { name: 'Beaches' }));
    expect(screen.getByText('Marina Beach')).toBeInTheDocument();
    expect(screen.queryByText('Amethyst Café')).not.toBeInTheDocument();

    // Only one category chip is active at a time.
    expect(screen.getByRole('button', { name: 'Beaches' })).toHaveAttribute(
      'aria-pressed',
      'true'
    );
    expect(screen.getByRole('button', { name: 'Cafés' })).toHaveAttribute('aria-pressed', 'false');
  });

  it('clicking the active category again returns to All', async () => {
    render(<App />);
    const cafes = screen.getByRole('button', { name: 'Cafés' });
    await userEvent.click(cafes);
    expect(screen.queryByText('Marina Beach')).not.toBeInTheDocument();

    await userEvent.click(cafes);
    expect(screen.getByText('Marina Beach')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'All' })).toHaveAttribute('aria-pressed', 'true');
  });
});
