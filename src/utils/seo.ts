import { places, type Category, type Place } from '../data/places';
import { tips } from '../data/tips';

// The one knob: where the app officially lives. Canonical links, the
// sitemap, robots.txt and share previews all derive from this.
export const SITE = {
  url: 'https://chennai-compass.vercel.app',
  name: 'Chennai Compass',
  description:
    'A local college student’s curated guide to Chennai — the best beaches, cafés, street food, heritage spots and hangouts, with prices, best times to visit and nearest metro/bus.',
} as const;

// schema.org type per category — what search/answer engines understand best.
const SCHEMA_TYPE: Record<Category, string> = {
  'Cafés': 'CafeOrCoffeeShop',
  Food: 'Restaurant',
  Shopping: 'ShoppingCenter',
  Beaches: 'TouristAttraction',
  Heritage: 'TouristAttraction',
  Hangouts: 'TouristAttraction',
  'Day Trips': 'TouristAttraction',
};

function escapeHtml(text: string): string {
  return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function placeNode(place: Place) {
  return {
    '@type': SCHEMA_TYPE[place.category],
    name: place.name,
    description: place.description,
    keywords: place.tags.join(', '),
    isAccessibleForFree: place.price === 'Free',
    ...(place.topPick ? { award: "Local's top pick" } : {}),
    address: {
      '@type': 'PostalAddress',
      streetAddress: place.area,
      addressLocality: 'Chennai',
      addressRegion: 'Tamil Nadu',
      addressCountry: 'IN',
    },
  };
}

/** schema.org JSON-LD graph: the site + every place (curated + community). */
export function buildJsonLd(allPlaces: Place[] = places): string {
  const graph = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebApplication',
        name: SITE.name,
        url: SITE.url,
        description: SITE.description,
        applicationCategory: 'TravelApplication',
        operatingSystem: 'Any',
        inLanguage: 'en',
        offers: { '@type': 'Offer', price: '0', priceCurrency: 'INR' },
        about: { '@type': 'City', name: 'Chennai', alternateName: 'Madras' },
      },
      {
        '@type': 'ItemList',
        name: 'Curated places to visit in Chennai',
        numberOfItems: allPlaces.length,
        itemListElement: allPlaces.map((place, i) => ({
          '@type': 'ListItem',
          position: i + 1,
          item: placeNode(place),
        })),
      },
    ],
  };
  // <-escape so the payload can never close its own <script> tag.
  return JSON.stringify(graph).replace(/</g, '\\u003c');
}

/**
 * Real content for agents that don't run JavaScript (most AI crawlers,
 * text browsers). Rendered inside <noscript>, so JS users never see it.
 */
export function buildNoscriptHtml(allPlaces: Place[] = places): string {
  const items = allPlaces
    .map(
      (p) =>
        `<li><strong>${escapeHtml(p.name)}</strong> (${escapeHtml(p.category)} · ${escapeHtml(
          p.area
        )}, Chennai${p.price === 'Free' ? ' · free' : ''}) — ${escapeHtml(p.description)}</li>`
    )
    .join('\n');
  return [
    `<h1>${escapeHtml(SITE.name)} — places to visit in Chennai, from a local's lens</h1>`,
    `<p>${escapeHtml(SITE.description)}</p>`,
    `<ul>\n${items}\n</ul>`,
  ].join('\n');
}

export function buildSitemap(): string {
  const lastmod = new Date().toISOString().slice(0, 10);
  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    `  <url><loc>${SITE.url}/</loc><lastmod>${lastmod}</lastmod><changefreq>weekly</changefreq></url>`,
    '</urlset>',
    '',
  ].join('\n');
}

/** llms.txt — a plain-markdown site summary for AI crawlers. */
export function buildLlmsTxt(allPlaces: Place[] = places): string {
  const byCategory = new Map<Category, Place[]>();
  for (const place of allPlaces) {
    byCategory.set(place.category, [...(byCategory.get(place.category) ?? []), place]);
  }
  const sections = [...byCategory.entries()].map(([category, group]) => {
    const lines = group.map((p) => {
      const price = p.price === 'Free' ? 'free' : p.price ? `price level ${p.price}` : '';
      const meta = [p.area + ', Chennai', price, `best ${p.bestTime.join('/').toLowerCase()}`]
        .filter(Boolean)
        .join('; ');
      return `- ${p.topPick ? '★ Top pick — ' : ''}${p.name} (${meta}): ${p.description}`;
    });
    return `## ${category}\n\n${lines.join('\n')}`;
  });
  const tipLines = tips.map((t) => `- ${t.text}`);
  return [
    `# ${SITE.name}`,
    '',
    `> ${SITE.description}`,
    '',
    `${SITE.name} (${SITE.url}) is a free curated travel guide to Chennai, India, written by a local college student. Every place includes a personal description, price level, best time of day, vibe, and the nearest metro station, suburban railway station and bus stop.`,
    '',
    ...sections,
    '',
    '## Tips for visiting Chennai',
    '',
    ...tipLines,
    '',
  ].join('\n');
}
