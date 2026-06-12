import type { BestTime, Category, Place, Price, Setting, Vibe } from '../data/places';

/** 'Paid' matches any place whose price is not 'Free'. */
export type PriceFilter = Price | 'Paid';

export interface Filters {
  search: string;
  categories: Category[];
  prices: PriceFilter[];
  vibes: Vibe[];
  bestTimes: BestTime[];
  areas: string[];
  settings: Setting[];
  /** Max straight-line distance (km) when "near me" is active. */
  maxKm: number | null;
}

export const EMPTY_FILTERS: Filters = {
  search: '',
  categories: [],
  prices: [],
  vibes: [],
  bestTimes: [],
  areas: [],
  settings: [],
  maxKm: null,
};

function matchesPrice(place: Place, prices: PriceFilter[]): boolean {
  if (prices.length === 0) return true;
  return prices.some((p) => (p === 'Paid' ? place.price !== 'Free' : place.price === p));
}

function matchesSearch(place: Place, search: string): boolean {
  const q = search.trim().toLowerCase();
  if (!q) return true;
  return (
    place.name.toLowerCase().includes(q) ||
    place.area.toLowerCase().includes(q) ||
    place.tags.some((t) => t.toLowerCase().includes(q))
  );
}

/**
 * OR within each filter group, AND across groups.
 * Empty groups are treated as "no restriction".
 */
export function filterPlaces(places: Place[], filters: Filters): Place[] {
  return places.filter(
    (place) =>
      matchesSearch(place, filters.search) &&
      (filters.categories.length === 0 || filters.categories.includes(place.category)) &&
      matchesPrice(place, filters.prices) &&
      (filters.vibes.length === 0 || place.vibes.some((v) => filters.vibes.includes(v))) &&
      (filters.bestTimes.length === 0 ||
        place.bestTime.some((t) => filters.bestTimes.includes(t))) &&
      (filters.areas.length === 0 || filters.areas.includes(place.area)) &&
      (filters.settings.length === 0 || filters.settings.includes(place.setting)) &&
      (filters.maxKm === null ||
        (place.distanceKm !== undefined && place.distanceKm <= filters.maxKm))
  );
}

/** Number of active selections in the advanced panel (excludes search & categories). */
export function countPanelFilters(filters: Filters): number {
  return (
    filters.prices.length +
    filters.vibes.length +
    filters.bestTimes.length +
    filters.areas.length +
    filters.settings.length +
    (filters.maxKm !== null ? 1 : 0)
  );
}

export function uniqueAreas(places: Place[]): string[] {
  return [...new Set(places.map((p) => p.area))].sort((a, b) => a.localeCompare(b));
}
