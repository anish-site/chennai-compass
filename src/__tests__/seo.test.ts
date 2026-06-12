import { describe, expect, it } from 'vitest';
import { buildJsonLd, buildLlmsTxt, buildNoscriptHtml, buildSitemap, SITE } from '../utils/seo';
import { places } from '../data/places';
import { tips } from '../data/tips';

describe('JSON-LD structured data', () => {
  const parsed = JSON.parse(buildJsonLd());
  const [app, list] = parsed['@graph'];

  it('is valid JSON with the site node', () => {
    expect(parsed['@context']).toBe('https://schema.org');
    expect(app['@type']).toBe('WebApplication');
    expect(app.url).toBe(SITE.url);
    expect(app.about.name).toBe('Chennai');
  });

  it('lists every curated place', () => {
    expect(list.numberOfItems).toBe(places.length);
    expect(list.itemListElement).toHaveLength(places.length);
    const names = list.itemListElement.map((e: { item: { name: string } }) => e.item.name);
    for (const place of places) expect(names).toContain(place.name);
  });

  it('maps categories to the right schema.org types', () => {
    const typeOf = (name: string) =>
      list.itemListElement.find((e: { item: { name: string } }) => e.item.name === name)?.item['@type'];
    expect(typeOf('Amethyst Café')).toBe('CafeOrCoffeeShop');
    expect(typeOf('Buhari Hotel')).toBe('Restaurant');
    expect(typeOf('Phoenix MarketCity')).toBe('ShoppingCenter');
    expect(typeOf('Marina Beach')).toBe('TouristAttraction');
  });

  it('marks every address as Chennai, Tamil Nadu, IN', () => {
    for (const entry of list.itemListElement) {
      expect(entry.item.address.addressLocality).toBe('Chennai');
      expect(entry.item.address.addressCountry).toBe('IN');
    }
  });

  it('cannot break out of its <script> tag', () => {
    expect(buildJsonLd()).not.toContain('<');
  });
});

describe('noscript fallback content', () => {
  const html = buildNoscriptHtml();

  it('contains the site pitch and every place with its area', () => {
    expect(html).toContain('places to visit in Chennai');
    for (const place of places) {
      expect(html).toContain(place.area === '' ? place.name : place.name.replace(/&/g, '&amp;'));
    }
  });

  it('contains no script tags', () => {
    expect(html.toLowerCase()).not.toContain('<script');
  });
});

describe('sitemap & llms.txt', () => {
  it('sitemap points at the canonical URL', () => {
    const xml = buildSitemap();
    expect(xml).toContain(`<loc>${SITE.url}/</loc>`);
    expect(xml).toContain('<?xml version="1.0"');
  });

  it('llms.txt describes the site and lists every place and tip', () => {
    const txt = buildLlmsTxt();
    expect(txt).toContain(`# ${SITE.name}`);
    expect(txt).toContain(SITE.url);
    for (const place of places) expect(txt).toContain(place.name);
    for (const tip of tips) expect(txt).toContain(tip.text);
  });
});
