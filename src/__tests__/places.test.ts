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

  it('has coordinates in the greater Chennai region for every place', () => {
    for (const place of places) {
      expect(place.coords, `${place.id} is missing coords`).toBeDefined();
      // Bounding box: greater Chennai + ECR day trips (Mahabalipuram) + Pulicat
      expect(place.coords!.lat, place.id).toBeGreaterThan(12.5);
      expect(place.coords!.lat, place.id).toBeLessThan(13.6);
      expect(place.coords!.lng, place.id).toBeGreaterThan(80.0);
      expect(place.coords!.lng, place.id).toBeLessThan(80.5);
    }
  });

  it('has at least one top pick, and every top pick is a real place', () => {
    const topPicks = places.filter((p) => p.topPick);
    expect(topPicks.length).toBeGreaterThan(0);
    // top picks should spread across categories, not all in one
    expect(new Set(topPicks.map((p) => p.category)).size).toBeGreaterThan(1);
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
