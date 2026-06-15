import { describe, expect, it } from 'vitest';
import type { Place } from '../data/places';
import {
  countPanelFilters,
  EMPTY_FILTERS,
  filterPlaces,
  uniqueAreas,
  type Filters,
} from '../utils/filterPlaces';

const make = (overrides: Partial<Place> & { id: string }): Place => ({
  name: overrides.id,
  category: 'Cafés',
  area: 'Mylapore',
  description: 'A test place',
  price: '₹',
  vibes: ['Solo / study'],
  bestTime: ['Morning'],
  setting: 'Indoor',
  tags: [],
  ...overrides,
});

const beach = make({
  id: 'beach',
  name: 'Marina Beach',
  category: 'Beaches',
  area: 'Marina',
  price: 'Free',
  vibes: ['Group hangout', 'Family'],
  bestTime: ['Evening', 'Night'],
  setting: 'Outdoor',
  tags: ['sunrise', 'sundal'],
});

const cafe = make({
  id: 'cafe',
  name: "Writer's Café",
  category: 'Cafés',
  area: 'Royapettah',
  price: '₹₹',
  vibes: ['Solo / study', 'Date spot'],
  bestTime: ['Evening'],
  setting: 'Indoor',
  tags: ['books', 'study spot'],
});

const temple = make({
  id: 'temple',
  name: 'Kapaleeshwarar Temple',
  category: 'Heritage',
  area: 'Mylapore',
  price: 'Free',
  vibes: ['Family'],
  bestTime: ['Morning', 'Evening'],
  setting: 'Outdoor',
  tags: ['gopuram'],
});

const mall = make({
  id: 'mall',
  name: 'Phoenix MarketCity',
  category: 'Shopping',
  area: 'Velachery',
  price: '₹₹₹',
  vibes: ['Group hangout'],
  bestTime: ['Night'],
  setting: 'Indoor',
  tags: ['movies'],
});

const all = [beach, cafe, temple, mall];

const filters = (overrides: Partial<Filters>): Filters => ({ ...EMPTY_FILTERS, ...overrides });

describe('filterPlaces', () => {
  it('returns all places when no filters are active', () => {
    expect(filterPlaces(all, EMPTY_FILTERS)).toEqual(all);
  });

  it('filters by a single category', () => {
    expect(filterPlaces(all, filters({ categories: ['Beaches'] }))).toEqual([beach]);
  });

  it('ORs multiple categories together', () => {
    expect(filterPlaces(all, filters({ categories: ['Beaches', 'Shopping'] }))).toEqual([
      beach,
      mall,
    ]);
  });

  it('filters free places', () => {
    expect(filterPlaces(all, filters({ prices: ['Free'] }))).toEqual([beach, temple]);
  });

  it('shows only top picks when topOnly is set, and ANDs with category', () => {
    const picks = [
      make({ id: 'p1', category: 'Cafés', topPick: true }),
      make({ id: 'p2', category: 'Cafés' }),
      make({ id: 'p3', category: 'Beaches', topPick: true }),
    ];
    expect(filterPlaces(picks, filters({ topOnly: true })).map((p) => p.id)).toEqual(['p1', 'p3']);
    expect(
      filterPlaces(picks, filters({ topOnly: true, categories: ['Cafés'] })).map((p) => p.id)
    ).toEqual(['p1']);
  });

  it("treats 'Paid' as any non-free price", () => {
    expect(filterPlaces(all, filters({ prices: ['Paid'] }))).toEqual([cafe, mall]);
  });

  it('filters by a specific price level', () => {
    expect(filterPlaces(all, filters({ prices: ['₹₹₹'] }))).toEqual([mall]);
  });

  it('filters by vibe', () => {
    expect(filterPlaces(all, filters({ vibes: ['Date spot'] }))).toEqual([cafe]);
  });

  it('filters by best time', () => {
    expect(filterPlaces(all, filters({ bestTimes: ['Morning'] }))).toEqual([temple]);
  });

  it('filters by area', () => {
    expect(filterPlaces(all, filters({ areas: ['Mylapore'] }))).toEqual([temple]);
  });

  it('filters by indoor/outdoor setting', () => {
    expect(filterPlaces(all, filters({ settings: ['Outdoor'] }))).toEqual([beach, temple]);
  });

  it('ANDs different filter groups together', () => {
    expect(
      filterPlaces(all, filters({ prices: ['Free'], settings: ['Outdoor'], bestTimes: ['Evening'] }))
    ).toEqual([beach, temple]);
    expect(
      filterPlaces(
        all,
        filters({ prices: ['Free'], settings: ['Outdoor'], bestTimes: ['Night'] })
      )
    ).toEqual([beach]);
  });

  it('matches search against name, case-insensitively', () => {
    expect(filterPlaces(all, filters({ search: 'marina beach' }))).toEqual([beach]);
  });

  it('matches search against area and tags', () => {
    expect(filterPlaces(all, filters({ search: 'velachery' }))).toEqual([mall]);
    expect(filterPlaces(all, filters({ search: 'GOPURAM' }))).toEqual([temple]);
  });

  it('combines search with other filters', () => {
    expect(filterPlaces(all, filters({ search: 'beach', prices: ['Paid'] }))).toEqual([]);
  });

  it('returns an empty array when nothing matches', () => {
    expect(filterPlaces(all, filters({ search: 'pondicherry' }))).toEqual([]);
  });
});

describe('countPanelFilters', () => {
  it('counts only the advanced-panel selections', () => {
    expect(countPanelFilters(EMPTY_FILTERS)).toBe(0);
    expect(
      countPanelFilters(
        filters({
          search: 'beach',
          categories: ['Cafés'],
          prices: ['Free', 'Paid'],
          vibes: ['Family'],
          areas: ['Marina'],
        })
      )
    ).toBe(4);
  });
});

describe('uniqueAreas', () => {
  it('returns sorted unique areas', () => {
    expect(uniqueAreas(all)).toEqual(['Marina', 'Mylapore', 'Royapettah', 'Velachery']);
  });
});
