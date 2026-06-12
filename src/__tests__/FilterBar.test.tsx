import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from '../App';

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
