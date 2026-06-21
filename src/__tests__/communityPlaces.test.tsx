import { afterEach, describe, expect, it, vi } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { fetchCommunityPlaces, parseCsv, rowsToPlaces } from '../utils/communityPlaces';
import { useCommunityPlaces } from '../hooks/useCommunityPlaces';

const HEADER = 'Timestamp,Name,Area,Category,Best time,Tags,Latitude,Longitude,Approved';

const row = (overrides: Partial<Record<string, string>> = {}) => {
  const r = {
    Timestamp: '1/1/2026',
    Name: 'Kovalam Beach',
    Area: 'Kovalam',
    Category: 'Beaches',
    'Best time': 'Morning, Evening',
    Tags: 'sunset, food-stalls',
    Latitude: '',
    Longitude: '',
    Approved: 'TRUE',
    ...overrides,
  };
  return Object.values(r)
    .map((v) => (v.includes(',') ? `"${v}"` : v))
    .join(',');
};

describe('parseCsv', () => {
  it('handles quoted commas, escaped quotes and CRLF', () => {
    const rows = parseCsv('a,"b, with comma","say ""hi"""\r\nx,y,z\n');
    expect(rows).toEqual([
      ['a', 'b, with comma', 'say "hi"'],
      ['x', 'y', 'z'],
    ]);
  });

  it('handles newlines inside quoted fields', () => {
    const rows = parseCsv('a,"line1\nline2",c');
    expect(rows).toEqual([['a', 'line1\nline2', 'c']]);
  });
});

describe('rowsToPlaces', () => {
  const parse = (...lines: string[]) => rowsToPlaces(parseCsv([HEADER, ...lines].join('\n')));

  it('maps an approved row to a community place with an auto-written description', () => {
    const [place] = parse(row());
    expect(place).toMatchObject({
      id: 'community-kovalam-beach',
      name: 'Kovalam Beach',
      category: 'Beaches',
      area: 'Kovalam',
      bestTime: ['Morning', 'Evening'],
      tags: ['sunset', 'food-stalls'],
      community: true,
    });
    // description is generated from the tags
    expect(place.description).toBe('A sunset, food stalls beach in Kovalam.');
    // simplified sheet carries no price/vibes/setting, and never a top pick
    expect(place.price).toBeUndefined();
    expect(place.vibes).toBeUndefined();
    expect(place.setting).toBeUndefined();
    expect(place.topPick).toBeUndefined();
  });

  it('drops rows that are not approved', () => {
    expect(parse(row({ Approved: 'FALSE' }), row({ Approved: '' }))).toHaveLength(0);
    expect(parse(row({ Approved: 'yes' }))).toHaveLength(1);
  });

  it('skips rows with an unknown category or missing name/area', () => {
    expect(parse(row({ Category: 'Nightlife' }))).toHaveLength(0);
    expect(parse(row({ Name: '' }))).toHaveLength(0);
    expect(parse(row({ Area: '' }))).toHaveLength(0);
  });

  it('defaults best time to Evening and survives no tags', () => {
    const [place] = parse(row({ 'Best time': 'Noon', Tags: '' }));
    expect(place.bestTime).toEqual(['Evening']);
    expect(place.tags).toEqual([]);
    expect(place.description).toBe('A beach in Kovalam.');
  });

  it('parses optional coordinates so community places work with near-me', () => {
    const [place] = parse(row({ Latitude: '12.7886', Longitude: '80.2541' }));
    expect(place.coords).toEqual({ lat: 12.7886, lng: 80.2541 });
  });

  it('leaves coords undefined for missing, garbled or impossible values', () => {
    expect(parse(row())[0].coords).toBeUndefined();
    expect(parse(row({ Latitude: 'near the beach', Longitude: '80.2' }))[0].coords).toBeUndefined();
    expect(parse(row({ Latitude: '12.7', Longitude: '' }))[0].coords).toBeUndefined();
    expect(parse(row({ Latitude: '99', Longitude: '80.2' }))[0].coords).toBeUndefined();
  });

  it('returns nothing for an empty sheet', () => {
    expect(rowsToPlaces(parseCsv(HEADER))).toHaveLength(0);
    expect(rowsToPlaces([])).toHaveLength(0);
  });
});

describe('fetchCommunityPlaces', () => {
  afterEach(() => vi.unstubAllGlobals());

  it('is a no-op without a configured URL (no network call)', async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);
    expect(await fetchCommunityPlaces('')).toEqual([]);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('parses approved places from the published CSV', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({ ok: true, text: async () => [HEADER, row()].join('\n') })
    );
    const places = await fetchCommunityPlaces('https://docs.google.com/pub?output=csv');
    expect(places).toHaveLength(1);
    expect(places[0].name).toBe('Kovalam Beach');
  });

  it('never throws: bad responses and network errors yield no places', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false }));
    expect(await fetchCommunityPlaces('https://x')).toEqual([]);
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('offline')));
    expect(await fetchCommunityPlaces('https://x')).toEqual([]);
  });
});

describe('useCommunityPlaces', () => {
  afterEach(() => vi.unstubAllGlobals());

  it('returns [] immediately when no sheet is configured', () => {
    const fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);
    const { result } = renderHook(() => useCommunityPlaces(''));
    expect(result.current).toEqual([]);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('loads community places once the sheet resolves', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({ ok: true, text: async () => [HEADER, row()].join('\n') })
    );
    const { result } = renderHook(() => useCommunityPlaces('https://sheet'));
    await waitFor(() => expect(result.current).toHaveLength(1));
    expect(result.current[0].community).toBe(true);
  });
});
