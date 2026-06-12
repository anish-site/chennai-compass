import { useEffect, useState } from 'react';
import type { Place } from '../data/places';
import { fetchCommunityPlaces, mergeCommunity } from '../utils/communityPlaces';
import { SHEET_CSV_URL } from '../data/config';

async function fetchBakedSnapshot(): Promise<Place[]> {
  try {
    const res = await fetch(`${import.meta.env.BASE_URL}community.json`);
    if (!res.ok) return [];
    const data: unknown = await res.json();
    return Array.isArray(data) ? (data as Place[]) : [];
  } catch {
    return [];
  }
}

/**
 * Loads friend-recommended places: the build-time snapshot (with geocoded
 * coords) merged with the live sheet (for rows approved since the last
 * deploy). One round of fetches per page load; with no sheet configured
 * it's a no-op.
 */
export function useCommunityPlaces(url: string = SHEET_CSV_URL): Place[] {
  const [community, setCommunity] = useState<Place[]>([]);

  useEffect(() => {
    if (!url) return;
    let cancelled = false;
    void Promise.all([fetchBakedSnapshot(), fetchCommunityPlaces(url)]).then(([baked, live]) => {
      const merged = mergeCommunity(baked, live);
      if (!cancelled && merged.length > 0) setCommunity(merged);
    });
    return () => {
      cancelled = true;
    };
  }, [url]);

  return community;
}
