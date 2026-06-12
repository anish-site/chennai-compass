// Local solar calculation (NOAA/Wikipedia sunrise equation) — no API, no
// network. Accurate to a minute or two, which is plenty for a countdown.
const CHENNAI = { lat: 13.0827, lng: 80.2707 };

const DAY_MS = 86400000;
const J2000_MS = Date.UTC(2000, 0, 1, 12); // Julian date 2451545.0
const rad = Math.PI / 180;

function julianToDate(j: number): Date {
  return new Date((j - 2451545) * DAY_MS + J2000_MS);
}

export interface SunTimes {
  sunrise: Date;
  sunset: Date;
}

/** Sunrise/sunset for the given date (defaults to Chennai). */
export function sunTimes(date: Date, lat = CHENNAI.lat, lng = CHENNAI.lng): SunTimes {
  const n = Math.round((date.getTime() - J2000_MS) / DAY_MS);
  const jStar = n - lng / 360;
  const M = ((357.5291 + 0.98560028 * jStar) % 360) * rad; // solar mean anomaly
  const C = 1.9148 * Math.sin(M) + 0.02 * Math.sin(2 * M) + 0.0003 * Math.sin(3 * M);
  const L = (M / rad + C + 180 + 102.9372) * rad; // ecliptic longitude
  const jTransit = 2451545 + jStar + 0.0053 * Math.sin(M) - 0.0069 * Math.sin(2 * L);
  const sinDecl = Math.sin(L) * Math.sin(23.4397 * rad);
  const cosHourAngle =
    (Math.sin(-0.833 * rad) - Math.sin(lat * rad) * sinDecl) /
    (Math.cos(lat * rad) * Math.cos(Math.asin(sinDecl)));
  const hourAngle = Math.acos(Math.min(1, Math.max(-1, cosHourAngle))) / rad;
  return {
    sunrise: julianToDate(jTransit - hourAngle / 360),
    sunset: julianToDate(jTransit + hourAngle / 360),
  };
}

export interface NextSunEvent {
  kind: 'sunrise' | 'sunset';
  at: Date;
}

/** The next sun event after `now`: today's sunrise/sunset or tomorrow's sunrise. */
export function nextSunEvent(now: Date): NextSunEvent {
  const today = sunTimes(now);
  if (now < today.sunrise) return { kind: 'sunrise', at: today.sunrise };
  if (now < today.sunset) return { kind: 'sunset', at: today.sunset };
  const tomorrow = sunTimes(new Date(now.getTime() + DAY_MS));
  return { kind: 'sunrise', at: tomorrow.sunrise };
}

/** "1h 12m" / "43m" until the given time. */
export function formatCountdown(from: Date, to: Date): string {
  const minutes = Math.max(0, Math.round((to.getTime() - from.getTime()) / 60000));
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
}
