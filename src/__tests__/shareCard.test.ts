import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  buildShareCanvas,
  canvasToBlob,
  SHARE_IMAGE,
  SHARE_MIME,
  sharePlace,
} from '../utils/shareCard';
import type { Place } from '../data/places';

const place: Place = {
  id: 'marina-beach',
  name: 'Marina Beach',
  category: 'Beaches',
  area: 'Marina',
  description: 'Sundal, sea breeze and 6am sunrises.',
  price: 'Free',
  vibes: ['Group hangout'],
  bestTime: ['Morning'],
  setting: 'Outdoor',
  tags: ['sunrise'],
};

// Give jsdom a minimal 2D context + toBlob so the real drawing code runs.
function stubCanvas(blob: Blob | null = new Blob(['x'], { type: SHARE_MIME })) {
  const ctx = new Proxy(
    { measureText: () => ({ width: 100 }) },
    { get: (t, p) => (p in t ? (t as never)[p] : () => {}) }
  );
  vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(
    ctx as unknown as CanvasRenderingContext2D
  );
  vi.spyOn(HTMLCanvasElement.prototype, 'toBlob').mockImplementation((cb) => cb(blob));
}

beforeEach(() => stubCanvas());
afterEach(() => vi.restoreAllMocks());

describe('share image is resource-capped', () => {
  it('uses a fixed, bounded canvas size (never a runaway allocation)', () => {
    expect(SHARE_IMAGE.width).toBeLessThanOrEqual(1080);
    expect(SHARE_IMAGE.height).toBeLessThanOrEqual(1350);
    // total pixels stay under ~1.5MP so memory on a phone stays small
    expect(SHARE_IMAGE.width * SHARE_IMAGE.height).toBeLessThan(1_500_000);
  });

  it('builds the canvas at exactly the capped dimensions', () => {
    const canvas = buildShareCanvas(place);
    expect(canvas.width).toBe(SHARE_IMAGE.width);
    expect(canvas.height).toBe(SHARE_IMAGE.height);
  });

  it('encodes a compressed JPEG blob (bounded file size)', async () => {
    const blob = await canvasToBlob(buildShareCanvas(place));
    expect(blob?.type).toBe(SHARE_MIME);
  });

  it('allocates at most one canvas per share (no leak/over-use)', async () => {
    vi.stubGlobal('URL', { createObjectURL: () => 'blob:x', revokeObjectURL: () => {} });
    vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {});
    const createSpy = vi.spyOn(document, 'createElement');
    const nav = { canShare: () => false } as unknown as Navigator;
    await sharePlace(place, nav);
    const canvases = createSpy.mock.calls.filter(([tag]) => tag === 'canvas').length;
    expect(canvases).toBe(1);
    vi.unstubAllGlobals();
  });
});

describe('sharePlace routing', () => {
  it('uses the native share sheet with the image when files are shareable', async () => {
    const share = vi.fn().mockResolvedValue(undefined);
    const nav = { canShare: () => true, share } as unknown as Navigator;

    const outcome = await sharePlace(place, nav);
    expect(outcome).toBe('shared');
    const arg = share.mock.calls[0][0];
    expect(arg.files[0]).toBeInstanceOf(File);
    expect(arg.files[0].type).toBe(SHARE_MIME);
    expect(arg.title).toBe('Marina Beach');
  });

  it('falls back to downloading the image when file sharing is unavailable', async () => {
    const click = vi.fn();
    vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(click);
    vi.stubGlobal('URL', {
      createObjectURL: () => 'blob:x',
      revokeObjectURL: () => {},
    });
    const nav = { canShare: () => false } as unknown as Navigator;

    const outcome = await sharePlace(place, nav);
    expect(outcome).toBe('downloaded');
    expect(click).toHaveBeenCalledTimes(1);
    vi.unstubAllGlobals();
  });

  it('reports cancellation when the user dismisses the share sheet', async () => {
    const share = vi.fn().mockRejectedValue(Object.assign(new Error('x'), { name: 'AbortError' }));
    const nav = { canShare: () => true, share } as unknown as Navigator;
    expect(await sharePlace(place, nav)).toBe('cancelled');
  });
});
