import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import AboutModal from '../components/AboutModal';
import App from '../App';

describe('AboutModal', () => {
  it('renders nothing when closed', () => {
    render(<AboutModal open={false} onClose={() => {}} />);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('shows About me and About Chennai sections when open', () => {
    render(<AboutModal open onClose={() => {}} />);
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText('About me')).toBeInTheDocument();
    expect(screen.getByText('About Chennai')).toBeInTheDocument();
  });

  it('closes via the X button', async () => {
    const onClose = vi.fn();
    render(<AboutModal open onClose={onClose} />);
    await userEvent.click(screen.getByRole('button', { name: /close about/i }));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('closes via a backdrop click but not a click inside the dialog', async () => {
    const onClose = vi.fn();
    render(<AboutModal open onClose={onClose} />);
    await userEvent.click(screen.getByText('About me'));
    expect(onClose).not.toHaveBeenCalled();
    await userEvent.click(screen.getByTestId('modal-backdrop'));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('closes on Escape', async () => {
    const onClose = vi.fn();
    render(<AboutModal open onClose={onClose} />);
    await userEvent.keyboard('{Escape}');
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});

describe('About button in the app', () => {
  it('is hidden by default and opens from the header About button', async () => {
    render(<App />);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: /about/i }));
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText('About Chennai')).toBeInTheDocument();
  });
});
