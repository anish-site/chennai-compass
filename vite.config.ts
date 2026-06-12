/// <reference types="vitest/config" />
import { defineConfig, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import { buildJsonLd, buildLlmsTxt, buildNoscriptHtml, buildSitemap } from './src/utils/seo';

// Injects crawler-facing content (JSON-LD, <noscript>) into index.html and
// emits sitemap.xml + llms.txt — all generated from src/data, so SEO stays
// in sync with the places automatically. Nothing visible changes for users.
function seoPlugin(): Plugin {
  return {
    name: 'chennai-compass-seo',
    transformIndexHtml() {
      return [
        {
          tag: 'script',
          attrs: { type: 'application/ld+json' },
          children: buildJsonLd(),
          injectTo: 'head' as const,
        },
        {
          tag: 'noscript',
          children: buildNoscriptHtml(),
          injectTo: 'body' as const,
        },
      ];
    },
    generateBundle() {
      this.emitFile({ type: 'asset', fileName: 'sitemap.xml', source: buildSitemap() });
      this.emitFile({ type: 'asset', fileName: 'llms.txt', source: buildLlmsTxt() });
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
