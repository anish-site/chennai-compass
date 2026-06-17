import type { BestTime, Category, Place } from '../data/places';

export interface Filters {
  search: string;
  categories: Category[];
  /** Category-specific tags (e.g. Cafés → rustic, luxury). */
  tags: string[];
  bestTimes: BestTime[];
  areas: string[];
  /** Max straight-line distance (km) when "near me" is active. */
  maxKm: number | null;
  /** Show only the curator's top picks. */
  topOnly: boolean;
}

export const EMPTY_FILTERS: Filters = {
  search: '',
  categories: [],
  tags: [],
  bestTimes: [],
  areas: [],
  maxKm: null,
  topOnly: false,
};

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
      (filters.tags.length === 0 || place.tags.some((t) => filters.tags.includes(t))) &&
      (filters.bestTimes.length === 0 ||
        place.bestTime.some((t) => filters.bestTimes.includes(t))) &&
      (filters.areas.length === 0 || filters.areas.includes(place.area)) &&
      (filters.maxKm === null ||
        (place.distanceKm !== undefined && place.distanceKm <= filters.maxKm)) &&
      (!filters.topOnly || place.topPick === true)
  );
}

/** Number of active selections in the advanced panel (excludes search & categories). */
export function countPanelFilters(filters: Filters): number {
  return (
    filters.tags.length +
    filters.bestTimes.length +
    filters.areas.length +
    (filters.maxKm !== null ? 1 : 0)
  );
}

export function uniqueAreas(places: Place[]): string[] {
  return [...new Set(places.map((p) => p.area))].sort((a, b) => a.localeCompare(b));
}
