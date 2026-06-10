import type { Place } from '../data/places';

const API_BASE = 'https://places.googleapis.com/v1';
const PHOTO_TTL_MS = 7 * 24 * 60 * 60 * 1000; // photo names are short-lived per Google ToS
const CACHE_PREFIX = 'cc-photo:';

export interface PlacePhoto {
  photoUrl: string;
  attribution?: string;
}

interface PhotoResource {
  name?: string;
  authorAttributions?: { displayName?: string }[];
}

interface CacheEntry {
  placeId?: string; // place IDs may be cached indefinitely
  photoName?: string;
  attribution?: string;
  fetchedAt: number;
}

type Lookup = Pick<Place, 'id' | 'name' | 'googleQuery' | 'placeId'>;

export function getApiKey(): string | undefined {
  const key = import.meta.env.VITE_GOOGLE_MAPS_API_KEY as string | undefined;
  return key && key.trim() !== '' ? key : undefined;
}

export function buildPhotoUrl(photoName: string, key: string, maxWidthPx = 900): string {
  return `${API_BASE}/${photoName}/media?maxWidthPx=${maxWidthPx}&key=${key}`;
}

function readCache(id: string): CacheEntry | null {
  try {
    const raw = localStorage.getItem(CACHE_PREFIX + id);
    return raw ? (JSON.parse(raw) as CacheEntry) : null;
  } catch {
    return null;
  }
}

function writeCache(id: string, entry: CacheEntry): void {
  try {
    localStorage.setItem(CACHE_PREFIX + id, JSON.stringify(entry));
  } catch {
    // cache is best-effort
  }
}

function firstPhoto(photos: PhotoResource[] | undefined) {
  const photo = photos?.[0];
  if (!photo?.name) return null;
  return { name: photo.name, attribution: photo.authorAttributions?.[0]?.displayName };
}

async function lookupPhoto(place: Lookup, key: string) {
  if (place.placeId) {
    const res = await fetch(`${API_BASE}/places/${place.placeId}`, {
      headers: { 'X-Goog-Api-Key': key, 'X-Goog-FieldMask': 'photos' },
    });
    if (!res.ok) return null;
    const data = (await res.json()) as { photos?: PhotoResource[] };
    const photo = firstPhoto(data.photos);
    return photo ? { placeId: place.placeId, ...photo } : null;
  }

  const res = await fetch(`${API_BASE}/places:searchText`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Goog-Api-Key': key,
      'X-Goog-FieldMask': 'places.id,places.photos',
    },
    body: JSON.stringify({ textQuery: place.googleQuery ?? `${place.name} Chennai` }),
  });
  if (!res.ok) return null;
  const data = (await res.json()) as { places?: { id?: string; photos?: PhotoResource[] }[] };
  const top = data.places?.[0];
  const photo = firstPhoto(top?.photos);
  return photo ? { placeId: top?.id, ...photo } : null;
}

/**
 * Resolves the real Google Maps photo for a place (owner/representative
 * photos come first in the API's ordering). Returns null when the place
 * can't be resolved — callers fall back to the bundled image.
 */
export async function fetchPlacePhoto(place: Lookup, key: string): Promise<PlacePhoto | null> {
  const cached = readCache(place.id);
  if (cached?.photoName && Date.now() - cached.fetchedAt < PHOTO_TTL_MS) {
    return { photoUrl: buildPhotoUrl(cached.photoName, key), attribution: cached.attribution };
  }

  try {
    // A cached place ID outlives the photo TTL and skips the text search.
    const target = cached?.placeId ? { ...place, placeId: cached.placeId } : place;
    const result = await lookupPhoto(target, key);
    if (!result) return null;
    writeCache(place.id, {
      placeId: result.placeId,
      photoName: result.name,
      attribution: result.attribution,
      fetchedAt: Date.now(),
    });
    return { photoUrl: buildPhotoUrl(result.name, key), attribution: result.attribution };
  } catch {
    return null;
  }
}
