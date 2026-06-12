import { useEffect, useState } from 'react';
import type { Place } from '../data/places';
import { fetchCommunityPlaces } from '../utils/communityPlaces';
import { SHEET_CSV_URL } from '../data/config';

/**
 * Loads friend-recommended places from the published Google Sheet.
 * One fetch per page load; with no sheet configured it's a no-op.
 */
export function useCommunityPlaces(url: string = SHEET_CSV_URL): Place[] {
  const [community, setCommunity] = useState<Place[]>([]);

  useEffect(() => {
    if (!url) return;
    let cancelled = false;
    void fetchCommunityPlaces(url).then((loaded) => {
      if (!cancelled && loaded.length > 0) setCommunity(loaded);
    });
    return () => {
      cancelled = true;
    };
  }, [url]);

  return community;
}
