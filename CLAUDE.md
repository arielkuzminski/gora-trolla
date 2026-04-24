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
- Page components: `src/components/*PageContent.astro` (per-page content blocks)
- UI components: `src/components/` (Nav, Footer, HeroSection, ConcertCard, FilterBar, etc.)
- Content collection: `src/content/concerts/concerts.json` loaded via Astro `file()` loader (`src/content.config.ts`)
- Data: `src/data/musicians.ts`
- Translations: `src/i18n/pl.json`, `src/i18n/en.json`
- Styles: `src/styles/` (tokens, reset, layout, typography, components, animations)
- Browser scripts: `src/scripts/*.ts` (nav, concerts filtering, lightbox, parallax, particles)
- Static assets: `public/assets/`, `public/media/`

## Notes

- Concerts use Astro Content Collections with schema validation in `content.config.ts`
- Concert filtering reads build-time embedded JSON from `#concert-data`
- JSON-LD is rendered build-time in Astro pages
- Sitemap is generated during `npm run build`
- Redirects for legacy `.html` URLs are defined in `vercel.json`
- Formspree endpoint: `https://formspree.io/f/xwvaaqyj`
