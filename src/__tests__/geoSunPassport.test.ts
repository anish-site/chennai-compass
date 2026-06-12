import { describe, expect, it } from 'vitest';
import { formatDistance, haversineKm } from '../utils/geo';
import { formatCountdown, nextSunEvent, sunTimes } from '../utils/sun';
import { decodePassport, encodePassport, passportUrl } from '../utils/passport';
import { places } from '../data/places';

describe('haversine distance', () => {
  const marina = { lat: 13.05, lng: 80.2824 };
  const bessie = { lat: 13.0003, lng: 80.2718 };

  it('computes a sane Marina → Bessie distance (~5.6 km)', () => {
    const km = haversineKm(marina, bessie);
    expect(km).toBeGreaterThan(5);
    expect(km).toBeLessThan(6.5);
  });

  it('is zero for the same point and symmetric', () => {
    expect(haversineKm(marina, marina)).toBe(0);
    expect(haversineKm(marina, bessie)).toBeCloseTo(haversineKm(bessie, marina), 10);
  });

  it('formats metres, short km and long km', () => {
    expect(formatDistance(0.85)).toBe('~850 m');
    expect(formatDistance(3.21)).toBe('~3.2 km');
    expect(formatDistance(54.7)).toBe('~55 km');
  });
});

describe('sun times for Chennai (local astronomy, no API)', () => {
  it('gives ~13h of daylight in June with an evening sunset', () => {
    const { sunrise, sunset } = sunTimes(new Date('2026-06-12T06:00:00Z'));
    const daylightH = (sunset.getTime() - sunrise.getTime()) / 3600000;
    expect(daylightH).toBeGreaterThan(12.5);
    expect(daylightH).toBeLessThan(13.5);
    // Chennai sunset in June ≈ 18:35 IST = ~13:05 UTC
    const sunsetUtcH = sunset.getUTCHours() + sunset.getUTCMinutes() / 60;
    expect(sunsetUtcH).toBeGreaterThan(12.5);
    expect(sunsetUtcH).toBeLessThan(13.5);
  });

  it('gives ~11.3h of daylight in December', () => {
    const { sunrise, sunset } = sunTimes(new Date('2026-12-12T06:00:00Z'));
    const daylightH = (sunset.getTime() - sunrise.getTime()) / 3600000;
    expect(daylightH).toBeGreaterThan(11);
    expect(daylightH).toBeLessThan(11.7);
  });

  it('picks the right next event through the day', () => {
    const beforeDawn = new Date('2026-06-12T22:00:00Z'); // ~3:30am IST next day
    expect(nextSunEvent(beforeDawn).kind).toBe('sunrise');

    const midday = new Date('2026-06-12T06:30:00Z'); // ~noon IST
    expect(nextSunEvent(midday).kind).toBe('sunset');

    const lateNight = new Date('2026-06-12T17:00:00Z'); // ~10:30pm IST
    const next = nextSunEvent(lateNight);
    expect(next.kind).toBe('sunrise');
    expect(next.at.getTime()).toBeGreaterThan(lateNight.getTime());
  });

  it('formats countdowns', () => {
    const from = new Date('2026-06-12T10:00:00Z');
    expect(formatCountdown(from, new Date('2026-06-12T11:12:00Z'))).toBe('1h 12m');
    expect(formatCountdown(from, new Date('2026-06-12T10:43:00Z'))).toBe('43m');
    expect(formatCountdown(from, new Date('2026-06-12T09:00:00Z'))).toBe('0m');
  });
});

describe('passport backup codes', () => {
  it('round-trips any subset of stamps', () => {
    const some = [places[0].id, places[5].id, places[20].id];
    expect(decodePassport(encodePassport(some)).sort()).toEqual([...some].sort());
  });

  it('round-trips empty and full passports', () => {
    expect(decodePassport(encodePassport([]))).toEqual([]);
    const all = places.map((p) => p.id);
    expect(decodePassport(encodePassport(all)).sort()).toEqual([...all].sort());
  });

  it('ignores unknown ids when encoding and survives garbage when decoding', () => {
    expect(decodePassport(encodePassport(['not-a-place']))).toEqual([]);
    expect(decodePassport('lol-nope')).toEqual([]);
    expect(decodePassport('')).toEqual([]);
    expect(decodePassport('1-zz-XYZ!')).toEqual([]);
  });

  it('builds a compact share URL', () => {
    const url = passportUrl([places[0].id], 'https://chennai-compass.vercel.app');
    expect(url).toMatch(/^https:\/\/chennai-compass\.vercel\.app\/#p=1-[0-9a-z]+-[0-9a-f]+$/);
    expect(url.length).toBeLessThan(60);
  });
});
