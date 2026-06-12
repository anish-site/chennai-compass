import { afterEach, describe, expect, it, vi } from 'vitest';
import { geocodeCommunityPlaces, geocodeQuery } from '../utils/geocode';
import { mergeCommunity } from '../utils/communityPlaces';
import type { Place } from '../data/places';

const fetchMock = vi.fn();

const place = (overrides: Partial<Place>): Place => ({
  id: 'community-kovalam-beach',
  name: 'Kovalam Beach',
  category: 'Beaches',
  area: 'Kovalam',
  description: 'Quieter surf beach down ECR.',
  price: 'Free',
  vibes: ['Group hangout'],
  bestTime: ['Morning'],
  setting: 'Outdoor',
  tags: ['surfing'],
  community: true,
  ...overrides,
});

const hit = (lat: number, lon: number) => ({
  ok: true,
  json: async () => [{ lat: String(lat), lon: String(lon) }],
});
const miss = { ok: true, json: async () => [] };

afterEach(() => vi.unstubAllGlobals());

describe('geocodeQuery', () => {
  it('asks Nominatim with a proper User-Agent and returns coords', async () => {
    fetchMock.mockReset().mockResolvedValue(hit(12.7886, 80.2541));
    vi.stubGlobal('fetch', fetchMock);

    const coords = await geocodeQuery('Kovalam Beach, Kovalam, Chennai, India');
    expect(coords).toEqual({ lat: 12.7886, lng: 80.2541 });
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toContain('nominatim.openstreetmap.org/search');
    expect(url).toContain(encodeURIComponent('Kovalam Beach, Kovalam, Chennai, India'));
    expect(init.headers['User-Agent']).toContain('chennai-compass');
  });

  it('rejects matches outside the Chennai region (wrong-city guesses)', async () => {
    fetchMock.mockReset().mockResolvedValue(hit(28.6139, 77.209)); // Delhi
    vi.stubGlobal('fetch', fetchMock);
    expect(await geocodeQuery('Connaught Place')).toBeUndefined();
  });

  it('handles empty results and bad responses', async () => {
    fetchMock.mockReset().mockResolvedValueOnce(miss).mockResolvedValueOnce({ ok: false });
    vi.stubGlobal('fetch', fetchMock);
    expect(await geocodeQuery('x')).toBeUndefined();
    expect(await geocodeQuery('y')).toBeUndefined();
  });
});

describe('geocodeCommunityPlaces', () => {
  it('geocodes places without coords and leaves geocoded ones untouched', async () => {
    fetchMock.mockReset().mockResolvedValue(hit(12.7886, 80.2541));
    vi.stubGlobal('fetch', fetchMock);

    const already = place({ id: 'a', coords: { lat: 13.0, lng: 80.2 } });
    const fresh = place({ id: 'b' });
    const [first, second] = await geocodeCommunityPlaces([already, fresh], 0);

    expect(first.coords).toEqual({ lat: 13.0, lng: 80.2 }); // untouched, no lookup
    expect(second.coords).toEqual({ lat: 12.7886, lng: 80.2541 });
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it('falls back to the neighbourhood when the exact place is unknown', async () => {
    fetchMock.mockReset().mockResolvedValueOnce(miss).mockResolvedValueOnce(hit(12.79, 80.25));
    vi.stubGlobal('fetch', fetchMock);

    const [result] = await geocodeCommunityPlaces([place({})], 0);
    expect(result.coords).toEqual({ lat: 12.79, lng: 80.25 });
    expect(fetchMock.mock.calls[1][0]).toContain(encodeURIComponent('Kovalam, Chennai, India'));
  });

  it('never throws: total geocoder failure leaves places coord-less but intact', async () => {
    fetchMock.mockReset().mockRejectedValue(new Error('offline'));
    vi.stubGlobal('fetch', fetchMock);

    const [result] = await geocodeCommunityPlaces([place({})], 0);
    expect(result.coords).toBeUndefined();
    expect(result.name).toBe('Kovalam Beach');
  });
});

describe('mergeCommunity (baked snapshot + live sheet)', () => {
  it('live rows inherit baked coords; brand-new live rows pass through', () => {
    const baked = [place({ id: 'x', coords: { lat: 12.7, lng: 80.2 } })];
    const live = [place({ id: 'x' }), place({ id: 'y', name: 'New spot' })];
    const merged = mergeCommunity(baked, live);
    expect(merged[0].coords).toEqual({ lat: 12.7, lng: 80.2 });
    expect(merged[1].coords).toBeUndefined();
    expect(merged).toHaveLength(2);
  });

  it('falls back to the snapshot when the live fetch returned nothing', () => {
    const baked = [place({ id: 'x' })];
    expect(mergeCommunity(baked, [])).toEqual(baked);
  });

  it('live sheet is the source of truth for content and removals', () => {
    const baked = [place({ id: 'x', description: 'old text' }), place({ id: 'gone' })];
    const live = [place({ id: 'x', description: 'new text' })];
    const merged = mergeCommunity(baked, live);
    expect(merged).toHaveLength(1);
    expect(merged[0].description).toBe('new text');
  });
});
