/// <reference types="vitest/config" />
import { defineConfig, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import { buildJsonLd, buildLlmsTxt, buildNoscriptHtml, buildSitemap } from './src/utils/seo';
import { fetchCommunityPlaces } from './src/utils/communityPlaces';
import { places, type Place } from './src/data/places';

// Injects crawler-facing content (JSON-LD, <noscript>) into index.html and
// emits sitemap.xml + llms.txt — generated from src/data PLUS any approved
// community places from the Google Sheet, fetched once per build. So a
// rebuild (e.g. via a Vercel deploy hook) folds friend recommendations into
// the SEO too. Nothing visible changes for users.
function seoPlugin(): Plugin {
  let allPlacesPromise: Promise<Place[]> | null = null;
  const getAllPlaces = () =>
    (allPlacesPromise ??= fetchCommunityPlaces().then((community) => [...places, ...community]));

  return {
    name: 'chennai-compass-seo',
    async transformIndexHtml() {
      const allPlaces = await getAllPlaces();
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
      const allPlaces = await getAllPlaces();
      this.emitFile({ type: 'asset', fileName: 'sitemap.xml', source: buildSitemap() });
      this.emitFile({ type: 'asset', fileName: 'llms.txt', source: buildLlmsTxt(allPlaces) });
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
