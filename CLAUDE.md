# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Static website for **Góra Trolla** — a Polish Early Music Ensemble. Pure HTML/CSS/JS, no build system, no framework, no CMS. Deploy directly to Netlify or Cloudflare Pages.

- Polish pages at root (`/index.html`, `/o-nas.html`, `/koncerty.html`, `/kontakt.html`)
- English pages under `/en/` (`/en/index.html`, `/en/about.html`, `/en/concerts.html`, `/en/contact.html`)

## Development

No build step. Open files directly in a browser or serve with any static server:

```bash
# Python (simplest)
python -m http.server 8080 --directory R:/repo/gt

# Node (if available)
npx serve R:/repo/gt
```

There are no tests, no linter, no package.json.

## Asset Paths

**Critical:** All resource paths must be **relative**, not absolute, so files work when opened via `file://` locally.

- Root pages use: `assets/css/main.css`, `assets/js/nav.js`, etc.
- `/en/` pages use: `../assets/css/main.css`, `../assets/js/nav.js`, etc.

Never use `/assets/...` absolute paths — they break on local file:// access.

## CSS Architecture

`assets/css/main.css` is the single entry point — it `@import`s in order:

| File | Role |
|------|------|
| `reset.css` | Andy Bell's modern reset |
| `tokens.css` | **Single source of truth** for all design values (colors, spacing, typography scale, shadows, animation vars) |
| `typography.css` | Font stacks, fluid type scale via `clamp()` |
| `layout.css` | Grid primitives: `.grid-2`, `.grid-3`, `.grid-4`, `.container`, `.container--narrow` |
| `animations.css` | `@keyframes`, entrance system (`[data-animate]` + `.is-visible`), `prefers-reduced-motion` overrides |
| `components.css` | Nav, footer, buttons, cards, forms, lightbox, filter bar |

**Always edit `tokens.css` for visual changes** — never hardcode color/spacing values in HTML or other CSS files.

## JS Architecture

All scripts load with `defer`. No bundler, no modules — plain IIFEs.

| File | Role |
|------|------|
| `nav.js` | Hamburger toggle, `scrolled` class on nav after 80px |
| `particles.js` | Canvas 2D ember particle engine on `#hero-particles`. Disabled when `prefers-reduced-motion` is set. Pauses on tab hidden. |
| `i18n.js` | Reads `localStorage('gt-lang')`, applies `[data-i18n]` / `[data-i18n-aria]` / `[data-i18n-placeholder]` attributes from JSON translation files. Exposes `window.i18n.getLang()`. |
| `concerts.js` | Parses `<script type="application/json" id="concert-data">` embedded in the page, renders `.concert-card` articles, handles filter state (`{time, type, period}`), injects JSON-LD `Event` schemas into `<head>` for upcoming concerts. |
| `lightbox.js` | Zero-dependency lightbox. Auto-inits from `[data-gallery]` groups. Keyboard: Escape / ArrowLeft / ArrowRight. Focus trap. |
| `main.js` | IntersectionObserver entrance animations (`threshold: 0.12`, `rootMargin: -40px`), contact form AJAX via `fetch()`, email rot13 reveal, hero scroll fade. |
| `parallax.js` | Passive scroll parallax on hero background. |

## Concert Data

Concert entries live as embedded JSON in each page that needs them:

```html
<script type="application/json" id="concert-data">
[{ "id": "...", "title": {"pl":"...","en":"..."}, "date": "ISO8601",
   "venue": {"pl":"...","en":"..."}, "city": "...",
   "type": "sacred|secular|chamber", "period": "medieval|renaissance|baroque",
   "free": true, "ticketUrl": null, "description": {"pl":"...","en":"..."} }]
</script>
```

`concerts.js` reads this at runtime — **no HTTP requests for data**. When adding a concert, update the JSON in both the PL page (`koncerty.html` / `index.html`) and the EN counterpart (`en/concerts.html` / `en/index.html`).

## Multi-Language

Two separate HTML files per page (not JS-only switching) so Googlebot indexes both languages. The `[data-i18n]` system handles only dynamic UI strings (filter labels, form messages) — the main content is baked into the HTML.

Translation strings live in `assets/i18n/pl.json` and `assets/i18n/en.json`. Key format: `nav.home`, `concerts.filter.upcoming`, `contact.form_submit`, etc.

Each HTML page sets `localStorage.setItem('gt-lang', 'pl'|'en')` on load so `concerts.js` and `i18n.js` know which language they're in.

## SEO

- `hreflang` alternate links in every `<head>` — keep PL/EN pairs in sync when adding pages
- JSON-LD `MusicGroup` schema in `index.html`; `Person` schemas in `o-nas.html`; `Event` schemas auto-injected by `concerts.js` for upcoming concerts
- When adding a new concert, the Event schema is generated automatically — no manual JSON-LD needed
- `sitemap.xml` lists all 8 URLs with `<xhtml:link>` hreflang annotations — update it when adding pages

## Contact Form

Formspree endpoint: `https://formspree.io/f/xwvaaqyj` (set in `kontakt.html` and `en/contact.html`).  
Spam prevention: honeypot `<input type="text" name="_gotcha">`.  
The form degrades gracefully — works without JS; AJAX enhancement is in `main.js`.

## Email Obfuscation

The contact email is rot13-encoded in a `data-email` attribute. `main.js` decodes it on click and sets `href="mailto:..."`. The displayed text is plain but the harvestabl href only exists after JS runs.

## Musician Photos

Musician portrait images go in `assets/images/musicians/`. The cards currently show SVG placeholder silhouettes. To add a real photo, replace the inner `<div>` of `.musician-card__image-wrap` with an `<img>` tag and add `itemprop="image"` with the full URL for Schema.org.
