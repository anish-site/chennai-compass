/// <reference types="vitest/config" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  // Root-relative by default (Vercel/Netlify/etc.); the GitHub Pages
  // workflow overrides this with --base=/chennai-compass/.
  base: '/',
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './src/setupTests.ts',
  },
});
