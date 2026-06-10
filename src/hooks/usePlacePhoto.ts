import { useEffect, useState } from 'react';
import type { Place } from '../data/places';
import { fetchPlacePhoto, getApiKey } from '../utils/placePhotos';

export interface ResolvedPhoto {
  src: string;
  attribution?: string;
}

/**
 * Starts with the bundled image and swaps in the real Google Maps photo
 * once it resolves. Without an API key this is a no-op.
 */
export function usePlacePhoto(place: Place): ResolvedPhoto {
  const [photo, setPhoto] = useState<ResolvedPhoto>({ src: place.image });

  useEffect(() => {
    const key = getApiKey();
    if (!key) return;
    let cancelled = false;
    void fetchPlacePhoto(place, key).then((result) => {
      if (result && !cancelled) {
        setPhoto({ src: result.photoUrl, attribution: result.attribution });
      }
    });
    return () => {
      cancelled = true;
    };
  }, [place]);

  return photo;
}
