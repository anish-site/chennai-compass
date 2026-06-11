import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Header from '../components/Header';
import TipsBar from '../components/TipsBar';
import { tips } from '../data/tips';

describe('Header menu', () => {
  it('keeps About and Install tucked away until the menu is opened', async () => {
    render(<Header onAboutOpen={() => {}} />);
    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
    expect(screen.queryByText(/about this guide/i)).not.toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: /menu/i }));
    expect(screen.getByRole('menu')).toBeInTheDocument();
    expect(screen.getByRole('menuitem', { name: /about this guide/i })).toBeInTheDocument();
    expect(screen.getByRole('menuitem', { name: /install as app/i })).toBeInTheDocument();
  });

  it('fires onAboutOpen and closes the menu when About is chosen', async () => {
    const onAboutOpen = vi.fn();
    render(<Header onAboutOpen={onAboutOpen} />);
    await userEvent.click(screen.getByRole('button', { name: /menu/i }));
    await userEvent.click(screen.getByRole('menuitem', { name: /about this guide/i }));
    expect(onAboutOpen).toHaveBeenCalledTimes(1);
    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
  });

  it('closes on Escape', async () => {
    render(<Header onAboutOpen={() => {}} />);
    await userEvent.click(screen.getByRole('button', { name: /menu/i }));
    await userEvent.keyboard('{Escape}');
    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
  });
});

describe('TipsBar', () => {
  it('renders every tip', () => {
    render(<TipsBar />);
    expect(screen.getByText(/tips for chennai/i)).toBeInTheDocument();
    for (const tip of tips) {
      expect(screen.getByText(tip.text)).toBeInTheDocument();
    }
  });
});
