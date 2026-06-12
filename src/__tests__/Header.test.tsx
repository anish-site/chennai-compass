import { afterEach, describe, expect, it, vi } from 'vitest';
import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Header from '../components/Header';
import TipsBar from '../components/TipsBar';
import { tips } from '../data/tips';

describe('Header menu', () => {
  it('keeps everything tucked away until the menu is opened', async () => {
    render(<Header onOpen={() => {}} theme="light" onToggleTheme={() => {}} />);
    expect(screen.queryByRole('menu')).not.toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: /menu/i }));
    expect(screen.getByRole('menuitem', { name: /about this guide/i })).toBeInTheDocument();
    expect(screen.getByRole('menuitem', { name: /tips for chennai/i })).toBeInTheDocument();
    expect(screen.getByRole('menuitem', { name: /talk like a local/i })).toBeInTheDocument();
    expect(screen.getByRole('menuitem', { name: /city map for geeks/i })).toBeInTheDocument();
    expect(screen.getByRole('menuitem', { name: /chennai metro map/i })).toBeInTheDocument();
    expect(screen.getByRole('menuitem', { name: /my passport/i })).toBeInTheDocument();
    expect(screen.getByRole('menuitem', { name: /install as app/i })).toBeInTheDocument();
  });

  it('reports the chosen modal and closes the menu', async () => {
    const onOpen = vi.fn();
    render(<Header onOpen={onOpen} theme="light" onToggleTheme={() => {}} />);

    await userEvent.click(screen.getByRole('button', { name: /menu/i }));
    await userEvent.click(screen.getByRole('menuitem', { name: /chennai metro map/i }));
    expect(onOpen).toHaveBeenCalledWith('metro');
    expect(screen.queryByRole('menu')).not.toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: /menu/i }));
    await userEvent.click(screen.getByRole('menuitem', { name: /city map for geeks/i }));
    expect(onOpen).toHaveBeenCalledWith('cityMap');
  });

  it('closes on Escape', async () => {
    render(<Header onOpen={() => {}} theme="light" onToggleTheme={() => {}} />);
    await userEvent.click(screen.getByRole('button', { name: /menu/i }));
    await userEvent.keyboard('{Escape}');
    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
  });
});

describe('TipsBar carousel', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it('shows one tip at a time and advances with the arrows', async () => {
    render(<TipsBar />);
    expect(screen.getByText(tips[0].text)).toBeInTheDocument();
    expect(screen.queryByText(tips[1].text)).not.toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: /next tip/i }));
    expect(screen.getByText(tips[1].text)).toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: /previous tip/i }));
    expect(screen.getByText(tips[0].text)).toBeInTheDocument();
  });

  it('wraps around from the last tip to the first', async () => {
    render(<TipsBar />);
    await userEvent.click(screen.getByRole('button', { name: /previous tip/i }));
    expect(screen.getByText(tips[tips.length - 1].text)).toBeInTheDocument();
  });

  it('auto-advances every 5 seconds', () => {
    vi.useFakeTimers();
    render(<TipsBar />);
    expect(screen.getByText(tips[0].text)).toBeInTheDocument();

    act(() => {
      vi.advanceTimersByTime(5000);
    });
    expect(screen.getByText(tips[1].text)).toBeInTheDocument();

    act(() => {
      vi.advanceTimersByTime(5000);
    });
    expect(screen.getByText(tips[2].text)).toBeInTheDocument();
  });
});
