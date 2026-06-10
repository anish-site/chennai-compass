import { describe, expect, it, vi } from 'vitest';
import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import InstallButton from '../components/InstallButton';

function fireBeforeInstallPrompt() {
  const event = new Event('beforeinstallprompt');
  const prompt = vi.fn().mockResolvedValue(undefined);
  Object.assign(event, { prompt, userChoice: Promise.resolve({ outcome: 'accepted' }) });
  act(() => {
    window.dispatchEvent(event);
  });
  return prompt;
}

describe('InstallButton', () => {
  it('triggers the native install prompt when the browser offers one', async () => {
    render(<InstallButton />);
    const prompt = fireBeforeInstallPrompt();
    await userEvent.click(screen.getByRole('button', { name: /install/i }));
    expect(prompt).toHaveBeenCalledTimes(1);
  });

  it('falls back to add-to-home-screen instructions when no prompt is available', async () => {
    render(<InstallButton />);
    await userEvent.click(screen.getByRole('button', { name: /install/i }));
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /add to your phone/i })).toBeInTheDocument();
    expect(screen.getAllByText(/add to home screen/i).length).toBeGreaterThan(0);
  });

  it('hides itself after the app is installed', () => {
    render(<InstallButton />);
    act(() => {
      window.dispatchEvent(new Event('appinstalled'));
    });
    expect(screen.queryByRole('button', { name: /install/i })).not.toBeInTheDocument();
  });
});
