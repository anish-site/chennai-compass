/// <reference types="vitest/config" />
import { defineConfig, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import { buildJsonLd, buildLlmsTxt, buildNoscriptHtml, buildSitemap } from './src/utils/seo';
import { fetchCommunityPlaces } from './src/utils/communityPlaces';
import { geocodeCommunityPlaces } from './src/utils/geocode';
import { places, type Place } from './src/data/places';

// Injects crawler-facing content (JSON-LD, <noscript>) into index.html and
// emits sitemap.xml + llms.txt — generated from src/data PLUS any approved
// community places from the Google Sheet, fetched once per build and
// auto-geocoded via OpenStreetMap so they join near-me sorting. A rebuild
// (e.g. via a Vercel deploy hook) refreshes places, coords and SEO together.
// The geocoded snapshot is also emitted as community.json for the runtime.
function seoPlugin(): Plugin {
  let communityPromise: Promise<Place[]> | null = null;
  const getCommunity = () =>
    (communityPromise ??= fetchCommunityPlaces()
      .then(geocodeCommunityPlaces)
      .catch(() => [] as Place[]));

  return {
    name: 'chennai-compass-seo',
    async transformIndexHtml() {
      const allPlaces = [...places, ...(await getCommunity())];
      return [
        {
          tag: 'script',
          attrs: { type: 'application/ld+json' },
          children: buildJsonLd(allPlaces),
          injectTo: 'head' as const,
        },
        {
          tag: 'noscript',
          children: buildNoscriptHtml(allPlaces),
          injectTo: 'body' as const,
        },
      ];
    },
    async generateBundle() {
      const community = await getCommunity();
      const allPlaces = [...places, ...community];
      this.emitFile({ type: 'asset', fileName: 'sitemap.xml', source: buildSitemap() });
      this.emitFile({ type: 'asset', fileName: 'llms.txt', source: buildLlmsTxt(allPlaces) });
      this.emitFile({
        type: 'asset',
        fileName: 'community.json',
        source: JSON.stringify(community),
      });
    },
  };
}

export default defineConfig({
  plugins: [react(), seoPlugin()],
  // Root-relative by default (Vercel/Netlify/etc.); the GitHub Pages
  // workflow overrides this with --base=/chennai-compass/.
  base: '/',
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './src/setupTests.ts',
  },
});
