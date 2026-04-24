# Migracja Góra Trolla: Static HTML -> Astro

## Dlaczego migrujemy?

Strona goratrolla.pl to statyczny HTML/CSS/JS (8 stron, ~5300 linii kodu). Problemy utrzymaniowe:
- **Nawigacja** (~30 linii) zduplikowana 8x (każda strona PL i EN)
- **Footer** (~50 linii) zduplikowany 8x
- **Head/meta** (~35 linii) zduplikowane 8x
- **Dane koncertów** (JSON) zduplikowane w 2-3 plikach HTML
- **Struktura PL/EN** ~70-78% identyczna między wersjami językowymi
- Każda zmiana w nav/footer wymaga edycji 8 plików

**Cel:** Lepszy Developer Experience bez regresu w szybkości i SEO.

## Dlaczego Astro?

| Kryterium | Astro | React/Next | Nuxt/Vue | Vite+vanilla |
|-----------|-------|-----------|----------|-------------|
| JS w przeglądarce | 0 KB domyślnie | ~40KB React runtime | ~30KB Vue runtime | Bez zmian |
| Krzywa nauki | Niska (HTML + frontmatter) | Wysoka (JSX, hooks) | Średnia | Minimalna |
| i18n routing | Wbudowane | Wymaga konfiguracji | `@nuxtjs/i18n` | Ręczne |
| Dane koncertów | Content Collections + Zod | Ręczne | Ręczne | Ręczne |
| CSS migracja | Kopiuj bez zmian | `className` zamiast `class` | Bez zmian | Bez zmian |
| Overkill? | Nie | Tak | Tak | Nie, ale nie rozwiązuje i18n |

**Astro** nie wysyła frameworkowego JS do przeglądarki, ma wbudowany i18n routing, Content Collections z walidacją Zod, i składnię `.astro` bliską czystemu HTML.

---

## Struktura docelowa

```
gt/
├── astro.config.mjs
├── package.json
├── tsconfig.json
├── public/
│   ├── media/                   # Zdjęcia (istniejący folder)
│   ├── assets/images/           # Hero, ikony, galeria
│   ├── robots.txt
│   └── manifest.webmanifest
├── src/
│   ├── layouts/
│   │   └── BaseLayout.astro     # <head>, nav, footer, globalne skrypty
│   ├── components/
│   │   ├── Nav.astro
│   │   ├── Footer.astro
│   │   ├── SEOHead.astro
│   │   ├── HeroSection.astro
│   │   ├── ConcertCard.astro
│   │   ├── GalleryItem.astro
│   │   ├── MusicianCard.astro
│   │   └── FilterBar.astro
│   ├── scripts/
│   │   ├── nav.ts
│   │   ├── main.ts
│   │   ├── concerts.ts
│   │   ├── lightbox.ts
│   │   ├── particles.ts
│   │   └── parallax.ts
│   ├── i18n/
│   │   ├── pl.json
│   │   ├── en.json
│   │   └── utils.ts
│   ├── content/
│   │   ├── config.ts
│   │   └── concerts/
│   │       └── concerts.json
│   ├── data/
│   │   └── musicians.ts
│   ├── styles/                  # Istniejące CSS (kopiowane 1:1)
│   │   ├── main.css
│   │   ├── reset.css
│   │   ├── tokens.css
│   │   ├── typography.css
│   │   ├── layout.css
│   │   ├── components.css
│   │   └── animations.css
│   └── pages/
│       ├── index.astro
│       ├── o-nas.astro
│       ├── koncerty.astro
│       ├── kontakt.astro
│       └── en/
│           ├── index.astro
│           ├── about.astro
│           ├── concerts.astro
│           └── contact.astro
```

---

## Zadania

### Zadanie 1: Scaffold projektu Astro + migracja CSS i assetów

**Pliki do utworzenia:** `astro.config.mjs`, `package.json`, `tsconfig.json`
**Pliki do skopiowania:** `assets/css/*` -> `src/styles/`, `media/` -> `public/media/`, `assets/images/` -> `public/assets/images/`, `robots.txt` -> `public/`, `manifest.webmanifest` -> `public/`

Kroki:
1. Zainicjalizować projekt Astro (`npm create astro@latest`) z pustym szablonem
2. Skonfigurować `astro.config.mjs`:
   - `output: 'static'`
   - `site: 'https://goratrolla.pl'`
   - i18n: `defaultLocale: 'pl'`, `locales: ['pl', 'en']`
   - Integracja `@astrojs/sitemap`
3. Skopiować 7 plików CSS do `src/styles/` (bez żadnych zmian)
4. Przenieść assety statyczne do `public/`
5. Przenieść `robots.txt` i `manifest.webmanifest` do `public/`

**Weryfikacja:** `npm run dev` startuje bez błędów, CSS ładuje się poprawnie.

---

### Zadanie 2: BaseLayout + SEOHead

**Pliki do utworzenia:** `src/layouts/BaseLayout.astro`, `src/components/SEOHead.astro`
**Pliki referencyjne:** `index.html` (linie 1-50, head), `en/index.html` (linie 1-38)

**BaseLayout.astro:**
- Importuje `src/styles/main.css` jako globalny styl
- Ładuje Google Fonts (Cinzel Decorative, Cinzel, EB Garamond, MedievalSharp)
- Critical CSS inline (`:root` z kolorami, `.nav`, `.hero`)
- Slot na treść strony
- Props: `title`, `description`, `lang`, `currentPage`, SEO-related props

**SEOHead.astro:**
- Canonical URL, hreflang (PL/EN/x-default)
- Open Graph: type, title, description, image (1200x630), locale, site_name
- Twitter Card: summary_large_image
- Favicon SVG + manifest
- Opcjonalny JSON-LD via prop lub slot
- Props: `title`, `description`, `canonicalUrl`, `ogLocale`, `ogTitle?`, `ogDescription?`, `jsonLd?`

**Weryfikacja:** Stworzyć testową stronę `src/pages/test.astro` używającą `BaseLayout` i sprawdzić HTML output.

---

### Zadanie 3: Komponent Nav.astro

**Plik do utworzenia:** `src/components/Nav.astro`
**Pliki referencyjne:** `index.html` (nawigacja ~linie 84-111), `en/index.html` (nawigacja ~linie 58-82)

- Logo z linkiem do strony głównej (SVG)
- 4 linki nawigacyjne z poprawnym i18n routing:
  - PL: `/`, `/o-nas/`, `/koncerty/`, `/kontakt/`
  - EN: `/en/`, `/en/about/`, `/en/concerts/`, `/en/contact/`
- Hamburger button (mobile) z `aria-expanded`, `aria-controls`
- Language switcher (PL | EN) z `hreflang` atrybutami
- `aria-current="page"` na aktywnym linku
- Props: `lang: 'pl' | 'en'`, `currentPage: string`

**Weryfikacja:** Nawigacja renderuje się poprawnie na testowej stronie z BaseLayout.

---

### Zadanie 4: Komponent Footer.astro

**Plik do utworzenia:** `src/components/Footer.astro`
**Pliki referencyjne:** `index.html` (footer), `kontakt.html` (footer)

- Brand text "Góra Trolla" z linkiem
- Tagline z tłumaczeniem (i18n)
- Social links: Facebook, Instagram, YouTube (SVG ikony)
- Candle SVG z animacją płomienia
- 4 linki nawigacyjne (poprawne hrefs na podstawie lang)
- Copyright z dynamicznym rokiem
- Props: `lang: 'pl' | 'en'`

**Weryfikacja:** Footer renderuje się na testowej stronie, social linki działają.

---

### Zadanie 5: System i18n

**Pliki do utworzenia:** `src/i18n/utils.ts`
**Pliki do skopiowania:** `assets/i18n/pl.json` -> `src/i18n/pl.json`, `assets/i18n/en.json` -> `src/i18n/en.json`

`src/i18n/utils.ts`:
```ts
import pl from './pl.json';
import en from './en.json';

const translations = { pl, en } as const;

export function useTranslations(lang: 'pl' | 'en') {
  const dict = translations[lang];
  return function t(key: string): string {
    return key.split('.').reduce((obj: any, k) => obj?.[k], dict) ?? key;
  };
}
```

Dodatkowo: przenieść hardkodowane etykiety z `concerts.js` (type/period labels: sacred, secular, chamber, medieval, renaissance, baroque) do plików JSON tłumaczeń.

**Weryfikacja:** Import `useTranslations` w testowej stronie, `t('nav.home')` zwraca "Strona Główna" dla PL.

---

### Zadanie 6: Content Collection — dane koncertów

**Pliki do utworzenia:** `src/content/config.ts`, `src/content/concerts/concerts.json`
**Pliki referencyjne:** `index.html` (embedded JSON, ~linie 448-536), `koncerty.html` (embedded JSON, ~linie 269-381)

`src/content/config.ts`:
```ts
import { defineCollection, z } from 'astro:content';

const concerts = defineCollection({
  type: 'data',
  schema: z.object({
    id: z.string(),
    title: z.object({ pl: z.string(), en: z.string() }),
    date: z.string(),
    venue: z.object({ pl: z.string(), en: z.string() }),
    city: z.string(),
    type: z.enum(['sacred', 'secular', 'chamber']),
    period: z.enum(['medieval', 'renaissance', 'baroque']),
    free: z.boolean(),
    ticketUrl: z.string().nullable(),
    poster: z.string().optional(),
    description: z.object({ pl: z.string(), en: z.string() }),
  }),
});

export const collections = { concerts };
```

Wyekstrahować 7 wpisów koncertowych z istniejącego HTML do `concerts.json`.

**Weryfikacja:** `npm run dev` nie pokazuje błędów walidacji Zod, query `getCollection('concerts')` zwraca dane.

---

### Zadanie 7: Komponenty UI — HeroSection, ConcertCard, GalleryItem

**Pliki do utworzenia:** `src/components/HeroSection.astro`, `src/components/ConcertCard.astro`, `src/components/GalleryItem.astro`

**HeroSection.astro:**
- Tło `hero-bg.jpg` z parallax
- Ornament SVG (dekoracyjne linie)
- Canvas `#hero-particles` dla particle engine
- Heading (h1) + tagline
- 2x CTA button z `data-animate`
- Scroll indicator
- Props: `heading`, `tagline`, `cta1Label`, `cta1Href`, `cta2Label`, `cta2Href`
- Pliki referencyjne: `index.html` (hero section)

**ConcertCard.astro:**
- Schema.org Event microdata (`itemscope`, `itemtype`, `itemprop`)
- Data/czas, venue, city, type/period badge
- Oznaczenie upcoming vs past (`data-upcoming`)
- Filtrowanie: `data-concert-type`, `data-concert-period`, `data-concert-date`
- `data-animate` dla animacji wejścia
- Link do biletów (opcjonalny)
- Props: concert object + `lang`
- Pliki referencyjne: `assets/js/concerts.js` (funkcja `renderConcert`)

**GalleryItem.astro:**
- Thumbnail z overlay
- `data-gallery` group, `data-full` (full-size URL), `data-caption`
- `role="button"`, `tabindex="0"`, `aria-label`
- Props: `src`, `alt`, `fullSrc`, `caption`, `gallery`
- Pliki referencyjne: `index.html` (sekcja galerii), `koncerty.html` (galeria)

**Weryfikacja:** Komponenty renderują się poprawnie z przykładowymi danymi na testowej stronie.

---

### Zadanie 8: Komponenty UI — MusicianCard, FilterBar

**Pliki do utworzenia:** `src/components/MusicianCard.astro`, `src/components/FilterBar.astro`, `src/data/musicians.ts`

**MusicianCard.astro:**
- Schema.org Person (`itemscope`, `itemtype`)
- Zdjęcie lub SVG placeholder
- Imię, instrument(y), bio
- Props: `name`, `instrument`, `bio`, `image?`, `lang`
- Pliki referencyjne: `o-nas.html` (karty muzyków ~linie 272-368)

**FilterBar.astro:**
- 3 grupy filtrów: czas (all/upcoming/past), typ (sacred/secular/chamber), okres (medieval/renaissance/baroque)
- Buttony z `data-filter-group` i `data-filter-value`
- `aria-pressed` dla stanu aktywnego
- Etykiety z i18n (build-time)
- Props: `lang`
- Pliki referencyjne: `koncerty.html` (filter bar)

**musicians.ts:**
- Eksport tablicy 6 muzyków (dane z `o-nas.html` JSON-LD):
  Ariel, Rafał, Krzysztof, Jędrzej, Maciej, Jasio
- Każdy: name, instruments, bio (pl/en), image, sameAs links

**Weryfikacja:** Karty muzyków i pasek filtrów renderują się poprawnie.

---

### Zadanie 9: Migracja skryptów JS -> TypeScript

**Pliki do utworzenia:** `src/scripts/nav.ts`, `src/scripts/main.ts`, `src/scripts/concerts.ts`, `src/scripts/lightbox.ts`, `src/scripts/particles.ts`, `src/scripts/parallax.ts`
**Pliki referencyjne:** `assets/js/*.js` (7 plików, ~905 linii)

Dla każdego skryptu:
1. Skopiować logikę z istniejącego `.js`
2. Usunąć IIFE wrapper (Astro bundluje jako moduły ES)
3. Dodać minimalne typowanie TS (tam gdzie naturalne)
4. Zachować identyczne zachowanie

Szczegóły per skrypt:
- **nav.ts** (104 linii) — hamburger, scroll class, active link, View Transitions. Łatwe.
- **main.ts** (138 linii) — IntersectionObserver animacje, form AJAX (Formspree), email ROT13, hero fade. Łatwe.
- **concerts.ts** (239 linii) — filtrowanie/renderowanie klient-side. Najważniejsze: dane nadal czytane z `<script id="concert-data">`, ale teraz generowane build-time z Content Collection. Średnie.
- **lightbox.ts** (149 linii) — auto-init z `[data-gallery]`, keyboard nav, focus trap. Łatwe.
- **particles.ts** (130 linii) — Canvas 2D, 45 cząstek, requestAnimationFrame. Bez zmian.
- **parallax.ts** (46 linii) — IntersectionObserver + passive scroll. Bez zmian.

Skrypty ładowane w:
- `BaseLayout.astro`: nav.ts, main.ts, parallax.ts (globalne)
- `HeroSection.astro`: particles.ts (tylko na stronach z hero)
- `koncerty.astro` / `en/concerts.astro`: concerts.ts (tylko na stronie koncertów)
- `BaseLayout.astro` lub strony z galerią: lightbox.ts

**Weryfikacja:** Każdy skrypt działa identycznie jak oryginał — przetestować hamburger, animacje, filtrowanie, lightbox, particles.

---

### Zadanie 10: Strona główna (PL + EN)

**Pliki do utworzenia:** `src/pages/index.astro`, `src/pages/en/index.astro`
**Pliki referencyjne:** `index.html` (~610 linii), `en/index.html` (~215 linii)

Obie strony używają `BaseLayout` + wspólnych komponentów, różnią się tylko treścią:

- `BaseLayout` z SEO props (title, description, canonicalUrl, ogLocale)
- `HeroSection` z przetłumaczonymi CTA
- Sekcja "O nas" (krótki opis + CTA do pełnej strony)
- Sekcja teaser koncertów:
  - Query `getCollection('concerts')` w frontmatter
  - Sortuj po dacie, weź 3 najbliższe
  - Renderuj `ConcertCard` x3
  - Embed `<script type="application/json" id="concert-data">` z pełnymi danymi (dla concerts.ts na homepage)
- Sekcja galerii z `GalleryItem` komponentami
- Sekcja cytatu
- JSON-LD MusicGroup w `<head>`

**Weryfikacja:**
- Strona PL pod `/` renderuje się identycznie jak obecna `index.html`
- Strona EN pod `/en/` renderuje się identycznie jak obecna `en/index.html`
- Particles, lightbox, animacje wejścia działają
- Lang switcher przechodzi PL <-> EN
- Sprawdzić JSON-LD MusicGroup w źródle HTML

---

### Zadanie 11: Strona "O nas" (PL + EN)

**Pliki do utworzenia:** `src/pages/o-nas.astro`, `src/pages/en/about.astro`
**Pliki referencyjne:** `o-nas.html` (~441 linii), `en/about.html` (~189 linii)

- `BaseLayout` z SEO props
- Hero section (mniejszy, bez particles)
- Historia zespołu (tekst content, różny PL/EN)
- Timeline milestones (PL ma pełny timeline, EN może być uproszczony)
- Sekcja filozofii (alternatywne bloki tekst/obraz)
- `MusicianCard` x6 z danymi z `musicians.ts`
- Galeria zespołu
- JSON-LD Person schemas (6 muzyków) w `<head>` — generowane build-time

**Weryfikacja:**
- 6 kart muzyków z poprawnymi danymi
- JSON-LD Person w źródle HTML
- Galeria z lightbox działa

---

### Zadanie 12: Strona koncertów (PL + EN)

**Pliki do utworzenia:** `src/pages/koncerty.astro`, `src/pages/en/concerts.astro`
**Pliki referencyjne:** `koncerty.html` (~404 linii), `en/concerts.html` (~130 linii)

- `BaseLayout` z SEO props
- Hero section (mniejszy)
- `FilterBar` z etykietami i18n
- Wszystkie koncerty renderowane build-time jako `ConcertCard`:
  - Query `getCollection('concerts')` w frontmatter
  - Sortuj po dacie (nadchodzące najpierw)
  - Renderuj każdy jako `ConcertCard`
- `<script type="application/json" id="concert-data">` z danymi z Content Collection (dla klient-side filtrowania przez concerts.ts)
- concerts.ts załadowany jako `<script>`
- JSON-LD Event schemas generowane **build-time** (nie klient-side jak teraz!)
  - Tylko dla nadchodzących koncertów
  - Schema.org Event z name, startDate, location, performer, offers
- Sekcja galerii z `GalleryItem`
- Sekcja "minione koncerty" z toggle button

**Weryfikacja:**
- Filtrowanie po typie/okresie/czasie działa
- JSON-LD Event w źródle HTML (nie injektowane JS)
- Galeria z lightbox
- Toggle "pokaż/ukryj minione"

---

### Zadanie 13: Strona kontaktowa (PL + EN)

**Pliki do utworzenia:** `src/pages/kontakt.astro`, `src/pages/en/contact.astro`
**Pliki referencyjne:** `kontakt.html` (~341 linii), `en/contact.html` (~155 linii)

- `BaseLayout` z SEO props
- Hero section (mniejszy)
- Formularz Formspree (`action="https://formspree.io/f/xwvaaqyj"`):
  - Pola: name, email, subject (dropdown), message
  - Honeypot `_gotcha` (spam prevention)
  - Button z tłumaczeniem i18n
  - AJAX submission obsługiwana przez main.ts
- Info kontaktowe:
  - Email z ROT13 obfuscation (`data-email` attribute)
  - Social media links (FB, IG, YT)
  - Adres/lokalizacja
- JSON-LD ContactPage + MusicGroup w `<head>`

**Weryfikacja:**
- Formularz wysyła poprawnie (test z Formspree)
- Email decode działa po kliknięciu
- Social links poprawne

---

### Zadanie 14: SEO, sitemap, deployment

**Pliki do utworzenia/zmodyfikowania:** `vercel.json`, weryfikacja `sitemap.xml`

1. **Sitemap**: Automatycznie generowany przez `@astrojs/sitemap`
   - Weryfikacja: 8 URLi z hreflang annotations
   - PL: `/`, `/o-nas/`, `/koncerty/`, `/kontakt/`
   - EN: `/en/`, `/en/about/`, `/en/concerts/`, `/en/contact/`

2. **Redirecty** (zmiana `.html` -> trailing slash):
   - `/index.html` -> `/`
   - `/o-nas.html` -> `/o-nas/`
   - `/koncerty.html` -> `/koncerty/`
   - `/kontakt.html` -> `/kontakt/`
   - `/en/index.html` -> `/en/`
   - `/en/about.html` -> `/en/about/`
   - `/en/concerts.html` -> `/en/concerts/`
   - `/en/contact.html` -> `/en/contact/`

3. **Deployment config** (`vercel.json`):
   - redirecty `.html` -> trailing slash
   - build: `npm run build`
   - output: `dist`

4. **Weryfikacja końcowa SEO:**
   - `npm run build` generuje dist/
   - Porównać meta tagi w output HTML vs obecne strony
   - Porównać JSON-LD schemas
   - Porównać hreflang links
   - Sprawdzić robots.txt w dist/
   - Sprawdzić sitemap.xml w dist/

---

### Zadanie 15: Sprzątanie i dokumentacja

1. Zaktualizować `CLAUDE.md` — nowa architektura, komendy dev/build
2. Usunąć stare pliki HTML z roota (po potwierdzeniu że Astro build jest kompletny):
   - `index.html`, `o-nas.html`, `koncerty.html`, `kontakt.html`
   - `en/index.html`, `en/about.html`, `en/concerts.html`, `en/contact.html`
3. Usunąć stare `assets/js/` i `assets/css/` (teraz w `src/`)
4. Usunąć stare `assets/i18n/` (teraz w `src/i18n/`)
5. Dodać `.gitignore` entries: `node_modules/`, `dist/`, `.astro/`

**Weryfikacja:** `npm run build` przechodzi, deploy na Vercel działa identycznie jak obecna strona.

---

## Co się zmienia vs co zostaje

| Element | Status |
|---------|--------|
| Cały CSS | Bez zmian (kopiowany 1:1) |
| Design tokens | Bez zmian (`tokens.css` = single source of truth) |
| Particle engine | Bez zmian (Canvas JS) |
| Lightbox | Bez zmian (auto-init z `[data-gallery]`) |
| Filtrowanie koncertów | Minimalne zmiany (dane z Content Collection) |
| Formularz Formspree | Bez zmian (ten sam endpoint) |
| Email ROT13 | Bez zmian |
| Animacje wejścia | Bez zmian (IntersectionObserver) |
| Accessibility | Bez zmian (ARIA, focus trap, reduced-motion) |
| Hosting | Bez zmian (statyczny output) |
| URL struktura | `.html` -> trailing slash (z redirectami) |

## Co eliminujemy

| Duplikacja | Przed | Po |
|-----------|-------|-----|
| Nawigacja | 8 kopii (~240 linii) | 1 komponent |
| Footer | 8 kopii (~400 linii) | 1 komponent |
| Head/meta | 8 kopii (~280 linii) | 1 komponent |
| Dane koncertów | 2-3 kopie JSON | 1 plik |
| Struktura stron PL/EN | ~2485 linii HTML | ~600-800 linii Astro |
