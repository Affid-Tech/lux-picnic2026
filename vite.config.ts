/// <reference types="vitest/config" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Static SPA build.
//
// `base` is '/' so the site works from a domain root (Netlify / Vercel /
// Cloudflare Pages). For GitHub Pages served from a repo sub-path, change it
// to '/<repo-name>/' — routing is hash-based (`/#/event/:id`) so deep links
// keep working under any base.
export default defineConfig({
  base: '/',
  plugins: [react()],
  build: {
    outDir: 'dist',
    target: 'es2020',
  },
  test: {
    // Pure logic units (time/date/filter/gantt/router/…) plus static-render
    // component smoke tests run in a node env.
    environment: 'node',
    include: ['src/**/*.test.{ts,tsx}'],
    coverage: {
      // Measure the app only — exclude the vendored design system (root *.js,
      // components/core/*.jsx) and non-logic entry/types files.
      include: ['src/**/*.{ts,tsx}'],
      exclude: ['src/**/*.test.{ts,tsx}', 'src/main.tsx', 'src/vite-env.d.ts', 'src/types.ts'],
    },
  },
})
