# CLAUDE.md

This file provides guidance to Claude Code when working with this repository.

## Project Overview

Static site for **Góra Trolla** built with Astro and deployed on Vercel.

- Polish routes at `/`, `/o-nas/`, `/koncerty/`, `/kontakt/`
- English routes at `/en/`, `/en/about/`, `/en/concerts/`, `/en/contact/`
- Static output generated to `dist/`

## Development

```bash
npm run dev
npm run build
npm run preview
```

## Architecture

- Layout: `src/layouts/BaseLayout.astro`
- Shared SEO head: `src/components/SEOHead.astro`
- Content data: `src/content/concerts/concerts.json`
- Translations: `src/i18n/pl.json`, `src/i18n/en.json`
- Browser scripts: `src/scripts/*.ts`
- Static assets: `public/assets/`, `public/media/`

## Notes

- Concert filtering reads build-time embedded JSON from `#concert-data`
- JSON-LD is rendered build-time in Astro pages
- Sitemap is generated during `npm run build`
- Redirects for legacy `.html` URLs are defined in `vercel.json`
- Formspree endpoint: `https://formspree.io/f/xwvaaqyj`
