import { useCallback, useState } from 'react';
import type { LatLng } from '../utils/geo';

export type GeoStatus = 'idle' | 'locating' | 'granted' | 'denied' | 'unsupported';

export interface Geolocation {
  status: GeoStatus;
  coords: LatLng | null;
  request: () => void;
}

/** One-shot geolocation: nothing happens until request() is called. */
export function useGeolocation(): Geolocation {
  const [status, setStatus] = useState<GeoStatus>('idle');
  const [coords, setCoords] = useState<LatLng | null>(null);

  const request = useCallback(() => {
    if (!('geolocation' in navigator)) {
      setStatus('unsupported');
      return;
    }
    setStatus('locating');
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setCoords({ lat: position.coords.latitude, lng: position.coords.longitude });
        setStatus('granted');
      },
      () => setStatus('denied'),
      { enableHighAccuracy: false, timeout: 10000, maximumAge: 300000 }
    );
  }, []);

  return { status, coords, request };
}
