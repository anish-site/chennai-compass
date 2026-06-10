import { describe, expect, it } from 'vitest';
import { CATEGORIES, places } from '../data/places';

describe('places data', () => {
  it('has unique ids', () => {
    const ids = places.map((p) => p.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('has every required field filled in', () => {
    for (const place of places) {
      expect(place.name, place.id).not.toBe('');
      expect(place.area, place.id).not.toBe('');
      expect(place.description, place.id).not.toBe('');
      expect(place.vibes.length, place.id).toBeGreaterThan(0);
      expect(place.bestTime.length, place.id).toBeGreaterThan(0);
      expect(place.tags.length, place.id).toBeGreaterThan(0);
      expect(CATEGORIES).toContain(place.category);
    }
  });

  it('covers every category with at least one place', () => {
    for (const category of CATEGORIES) {
      expect(
        places.some((p) => p.category === category),
        `no places in ${category}`
      ).toBe(true);
    }
  });
});
