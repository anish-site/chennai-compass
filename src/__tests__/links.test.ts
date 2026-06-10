import { describe, expect, it } from 'vitest';
import { buildDirectionsUrl, buildGoogleSearchUrl } from '../utils/links';

describe('buildGoogleSearchUrl', () => {
  it("appends 'Chennai' to the place name by default", () => {
    expect(buildGoogleSearchUrl({ name: 'Marina Beach' })).toBe(
      'https://www.google.com/search?q=Marina%20Beach%20Chennai'
    );
  });

  it('uses the googleQuery override when present', () => {
    expect(
      buildGoogleSearchUrl({ name: 'Bessie', googleQuery: 'Elliots Beach Besant Nagar Chennai' })
    ).toBe('https://www.google.com/search?q=Elliots%20Beach%20Besant%20Nagar%20Chennai');
  });

  it('URL-encodes special characters', () => {
    expect(buildGoogleSearchUrl({ name: "Writer's Café & Co" })).toBe(
      "https://www.google.com/search?q=Writer's%20Caf%C3%A9%20%26%20Co%20Chennai"
    );
  });
});

describe('buildDirectionsUrl', () => {
  it('builds a Google Maps directions deep link', () => {
    expect(buildDirectionsUrl({ name: 'Marina Beach' })).toBe(
      'https://www.google.com/maps/dir/?api=1&destination=Marina%20Beach%20Chennai'
    );
  });

  it('uses the googleQuery override when present', () => {
    expect(buildDirectionsUrl({ name: 'Bessie', googleQuery: 'Elliots Beach Chennai' })).toBe(
      'https://www.google.com/maps/dir/?api=1&destination=Elliots%20Beach%20Chennai'
    );
  });
});
