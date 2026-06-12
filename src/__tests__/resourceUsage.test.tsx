import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { render } from '@testing-library/react';
import TipsBar from '../components/TipsBar';
import Modal from '../components/Modal';
import { tips } from '../data/tips';

// These tests guard battery & memory: no leaked timers or listeners, and
// no runaway intervals. On a phone, a stuck setInterval or unremoved
// listener drains battery and leaks memory across navigations.

describe('battery: timers are bounded and paused when appropriate', () => {
  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it('TipsBar runs exactly one auto-advance interval, cleared on unmount', () => {
    const setSpy = vi.spyOn(globalThis, 'setInterval');
    const clearSpy = vi.spyOn(globalThis, 'clearInterval');

    const { unmount } = render(<TipsBar />);
    expect(setSpy).toHaveBeenCalledTimes(1); // not one-per-tip

    unmount();
    expect(clearSpy).toHaveBeenCalledTimes(1); // no orphaned timer left ticking
  });

  it('TipsBar does NOT spin a timer when the user prefers reduced motion', () => {
    vi.spyOn(window, 'matchMedia').mockReturnValue({
      matches: true,
      media: '(prefers-reduced-motion: reduce)',
      addEventListener: () => {},
      removeEventListener: () => {},
    } as unknown as MediaQueryList);
    const setSpy = vi.spyOn(globalThis, 'setInterval');

    render(<TipsBar />);
    expect(setSpy).not.toHaveBeenCalled();
  });
});

describe('memory: event listeners are cleaned up', () => {
  beforeEach(() => vi.restoreAllMocks());

  it('Modal removes its keydown listener on unmount (no leak)', () => {
    const addSpy = vi.spyOn(document, 'addEventListener');
    const removeSpy = vi.spyOn(document, 'removeEventListener');

    const { unmount } = render(
      <Modal titleId="t" onClose={() => {}}>
        <h2 id="t">hi</h2>
      </Modal>
    );
    const added = addSpy.mock.calls.filter(([type]) => type === 'keydown').length;
    unmount();
    const removed = removeSpy.mock.calls.filter(([type]) => type === 'keydown').length;

    expect(added).toBeGreaterThan(0);
    expect(removed).toBe(added); // every listener added is also removed
  });

  it('repeated TipsBar mount/unmount cycles do not accumulate timers', () => {
    const setSpy = vi.spyOn(globalThis, 'setInterval');
    const clearSpy = vi.spyOn(globalThis, 'clearInterval');
    for (let i = 0; i < 5; i++) {
      const { unmount } = render(<TipsBar />);
      unmount();
    }
    // one created and one cleared per cycle — balanced, nothing leaks
    expect(setSpy).toHaveBeenCalledTimes(5);
    expect(clearSpy).toHaveBeenCalledTimes(5);
  });

  it('sanity: there are tips to rotate through', () => {
    expect(tips.length).toBeGreaterThan(2);
  });
});
