import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { buildPhotoUrl, fetchPlacePhoto } from '../utils/placePhotos';

const KEY = 'test-key';

const photoResponse = (id: string) => ({
  ok: true,
  json: async () => ({
    places: [
      {
        id,
        photos: [
          {
            name: `places/${id}/photos/abc123`,
            authorAttributions: [{ displayName: 'A Local Photographer' }],
          },
        ],
      },
    ],
  }),
});

const fetchMock = vi.fn();

beforeEach(() => {
  localStorage.clear();
  fetchMock.mockReset();
  vi.stubGlobal('fetch', fetchMock);
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.useRealTimers();
});

describe('buildPhotoUrl', () => {
  it('builds the photo media URL with width and key', () => {
    expect(buildPhotoUrl('places/PID/photos/xyz', KEY)).toBe(
      'https://places.googleapis.com/v1/places/PID/photos/xyz/media?maxWidthPx=900&key=test-key'
    );
  });
});

describe('fetchPlacePhoto', () => {
  it('resolves a place by text search when there is no placeId', async () => {
    fetchMock.mockResolvedValue(photoResponse('PID1'));
    const result = await fetchPlacePhoto({ id: 'marina', name: 'Marina Beach' }, KEY);

    expect(fetchMock).toHaveBeenCalledWith(
      'https://places.googleapis.com/v1/places:searchText',
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({
          'X-Goog-Api-Key': KEY,
          'X-Goog-FieldMask': 'places.id,places.photos',
        }),
        body: JSON.stringify({ textQuery: 'Marina Beach Chennai' }),
      })
    );
    expect(result).toEqual({
      photoUrl: 'https://places.googleapis.com/v1/places/PID1/photos/abc123/media?maxWidthPx=900&key=test-key',
      attribution: 'A Local Photographer',
    });
  });

  it('prefers the googleQuery override in the text search', async () => {
    fetchMock.mockResolvedValue(photoResponse('PID1'));
    await fetchPlacePhoto(
      { id: 'bessie', name: 'Bessie', googleQuery: 'Elliots Beach Chennai' },
      KEY
    );
    expect(fetchMock).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({ body: JSON.stringify({ textQuery: 'Elliots Beach Chennai' }) })
    );
  });

  it('uses Place Details directly when a placeId is set', async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      json: async () => ({ photos: [{ name: 'places/PID2/photos/p1' }] }),
    });
    const result = await fetchPlacePhoto(
      { id: 'temple', name: 'Kapaleeshwarar Temple', placeId: 'PID2' },
      KEY
    );

    expect(fetchMock).toHaveBeenCalledWith(
      'https://places.googleapis.com/v1/places/PID2',
      expect.objectContaining({
        headers: expect.objectContaining({ 'X-Goog-FieldMask': 'photos' }),
      })
    );
    expect(result?.photoUrl).toContain('places/PID2/photos/p1/media');
    expect(result?.attribution).toBeUndefined();
  });

  it('returns null when the place has no photos', async () => {
    fetchMock.mockResolvedValue({ ok: true, json: async () => ({ places: [{ id: 'PID3' }] }) });
    expect(await fetchPlacePhoto({ id: 'x', name: 'X' }, KEY)).toBeNull();
  });

  it('returns null on HTTP errors and network failures', async () => {
    fetchMock.mockResolvedValueOnce({ ok: false, json: async () => ({}) });
    expect(await fetchPlacePhoto({ id: 'x', name: 'X' }, KEY)).toBeNull();

    fetchMock.mockRejectedValueOnce(new Error('offline'));
    expect(await fetchPlacePhoto({ id: 'x', name: 'X' }, KEY)).toBeNull();
  });

  it('serves repeat lookups from the cache without refetching', async () => {
    fetchMock.mockResolvedValue(photoResponse('PID1'));
    const first = await fetchPlacePhoto({ id: 'marina', name: 'Marina Beach' }, KEY);
    expect(fetchMock).toHaveBeenCalledTimes(1);

    const second = await fetchPlacePhoto({ id: 'marina', name: 'Marina Beach' }, KEY);
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(second).toEqual(first);
  });

  it('refetches after the photo TTL expires, reusing the cached place ID', async () => {
    vi.useFakeTimers();
    fetchMock.mockResolvedValue(photoResponse('PID1'));
    await fetchPlacePhoto({ id: 'marina', name: 'Marina Beach' }, KEY);
    expect(fetchMock).toHaveBeenLastCalledWith(
      'https://places.googleapis.com/v1/places:searchText',
      expect.anything()
    );

    vi.advanceTimersByTime(8 * 24 * 60 * 60 * 1000);
    fetchMock.mockResolvedValue({
      ok: true,
      json: async () => ({ photos: [{ name: 'places/PID1/photos/fresh' }] }),
    });
    const result = await fetchPlacePhoto({ id: 'marina', name: 'Marina Beach' }, KEY);

    // Second round goes straight to Place Details with the remembered ID.
    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(fetchMock).toHaveBeenLastCalledWith(
      'https://places.googleapis.com/v1/places/PID1',
      expect.anything()
    );
    expect(result?.photoUrl).toContain('photos/fresh');
  });
});
