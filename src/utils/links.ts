import type { Place } from '../data/places';

type Linkable = Pick<Place, 'name' | 'googleQuery'>;

function queryFor(place: Linkable): string {
  return place.googleQuery ?? `${place.name} Chennai`;
}

export function buildGoogleSearchUrl(place: Linkable): string {
  return `https://www.google.com/search?q=${encodeURIComponent(queryFor(place))}`;
}

export function buildDirectionsUrl(place: Linkable): string {
  return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(queryFor(place))}`;
}
