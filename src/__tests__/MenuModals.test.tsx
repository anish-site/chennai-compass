import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from '../App';

async function openMenuItem(name: RegExp) {
  await userEvent.click(screen.getByRole('button', { name: /menu/i }));
  await userEvent.click(screen.getByRole('menuitem', { name }));
}

describe('menu modals', () => {
  it('opens the all-tips modal from the menu', async () => {
    render(<App />);
    await openMenuItem(/tips for chennai/i);
    const dialog = screen.getByRole('dialog');
    expect(dialog).toHaveTextContent(/tips for chennai/i);
    expect(dialog).toHaveTextContent(/filter coffee/i);
  });

  it('opens the city map modal with the main roads', async () => {
    render(<App />);
    await openMenuItem(/city map for geeks/i);
    const dialog = screen.getByRole('dialog');
    expect(dialog).toHaveTextContent(/Anna Salai/);
    expect(dialog).toHaveTextContent(/East Coast Road/);
  });

  it('opens the metro modal with both operational lines and the official link', async () => {
    render(<App />);
    await openMenuItem(/chennai metro map/i);
    const dialog = screen.getByRole('dialog');
    expect(dialog).toHaveTextContent('Blue Line');
    expect(dialog).toHaveTextContent('Green Line');
    expect(screen.getByRole('link', { name: /official cmrl route map/i })).toHaveAttribute(
      'href',
      'https://chennaimetrorail.org/route-map/'
    );
  });

  it('has a Book ticket button that opens the Chennai Metro WhatsApp chat', async () => {
    render(<App />);
    await openMenuItem(/chennai metro map/i);
    const book = screen.getByRole('link', { name: /book ticket/i });
    expect(book).toHaveAttribute('href', expect.stringContaining('wa.me/918300086000'));
    expect(book).toHaveAttribute('target', '_blank');
  });

  it('closes via the close button', async () => {
    render(<App />);
    await openMenuItem(/chennai metro map/i);
    await userEvent.click(screen.getByRole('button', { name: /^close$/i }));
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });
});
