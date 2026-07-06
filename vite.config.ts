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
})
