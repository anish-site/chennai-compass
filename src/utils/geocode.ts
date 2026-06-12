import type { Place } from '../data/places';

// Free OpenStreetMap geocoder — no key, no billing. Called ONLY during
// `vite build` (on the deploy server, never from visitors' phones) and
// throttled to respect Nominatim's 1 request/second policy.
const NOMINATIM = 'https://nominatim.openstreetmap.org/search';
const USER_AGENT = 'chennai-compass (https://github.com/anish-site/chennai-compass)';

// Sanity box: greater Chennai + ECR/Pulicat day-trip range. A "match" in
// Delhi means Nominatim guessed wrong — better no pin than a wrong pin.
const BBOX = { minLat: 12.4, maxLat: 13.7, minLng: 79.9, maxLng: 80.6 };

type Coords = NonNullable<Place['coords']>;

export async function geocodeQuery(query: string): Promise<Coords | undefined> {
  const url = `${NOMINATIM}?format=jsonv2&limit=1&q=${encodeURIComponent(query)}`;
  const res = await fetch(url, { headers: { 'User-Agent': USER_AGENT } });
  if (!res.ok) return undefined;
  const results = (await res.json()) as { lat?: string; lon?: string }[];
  const lat = Number.parseFloat(results?.[0]?.lat ?? '');
  const lng = Number.parseFloat(results?.[0]?.lon ?? '');
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return undefined;
  if (lat < BBOX.minLat || lat > BBOX.maxLat || lng < BBOX.minLng || lng > BBOX.maxLng) {
    return undefined;
  }
  return { lat, lng };
}

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Fills in coords for community places that lack them: tries the exact
 * place first, then falls back to the neighbourhood (good enough for
 * distance sorting). Geocoding failures leave the place untouched —
 * it just shows without a distance.
 */
export async function geocodeCommunityPlaces(
  list: Place[],
  delayMs = 1100
): Promise<Place[]> {
  const out: Place[] = [];
  for (const place of list) {
    if (place.coords) {
      out.push(place);
      continue;
    }
    try {
      let coords = await geocodeQuery(`${place.name}, ${place.area}, Chennai, India`);
      if (!coords) {
        if (delayMs) await sleep(delayMs);
        coords = await geocodeQuery(`${place.area}, Chennai, India`);
      }
      out.push(coords ? { ...place, coords } : place);
    } catch {
      out.push(place);
    }
    if (delayMs) await sleep(delayMs);
  }
  return out;
}
