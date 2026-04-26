# Audyt SEO — Góra Trolla (gora-trolla.pl)
*Data audytu: 2026-04-25*

---

## Executive Summary

Strona jest solidnie zbudowana technicznie (Astro static, Vercel, hreflang, JSON-LD), ale ma **3 krytyczne błędy** blokujące efektywne indeksowanie oraz kilka problemów Core Web Vitals wpływających na pozycje w Google. Priorytety: najpierw napraw sitemap i domain, potem obrazy.

---

## 🔴 Krytyczne (blokują indeksowanie lub duplikują content)

### 1. robots.txt wskazuje na nieistniejący sitemap
**Problem:** `robots.txt` zawiera `Sitemap: https://goratrolla.pl/sitemap.xml` — ten URL zwraca **404**. Prawdziwy sitemap index jest pod `/sitemap-index.xml`.

**Wpływ:** Google nie odkrywa sitemap automatycznie przez robots.txt. Musi go samemu crawlować lub masz go zgłoszonego ręcznie w Search Console.

**Fix w `public/robots.txt`:**
```
Sitemap: https://goratrolla.pl/sitemap-index.xml
```

---

### 2. Split domeny — ryzyko duplicate content
**Problem:** Strona dostępna jest pod `https://www.gora-trolla.pl/` (z myślnikiem, z www), ale wszystkie `canonical`, OG URL-e i sitemap używają `https://goratrolla.pl/` (bez myślnika, bez www). To **dwie różne domeny**.

```
Live:      https://www.gora-trolla.pl/
Canonical: https://goratrolla.pl/
```

**Wpływ:** Jeśli Vercel nie robi 301 redirect `www.gora-trolla.pl → goratrolla.pl` (lub odwrotnie), Google indeksuje obie wersje jako osobny content. Canonical „sugeruje" docelową domenę, ale nie wymusza — duplikat rankuje słabiej, link equity się dzieli.

**Fix:** Sprawdź w Vercel Dashboard → Domains, że `www.gora-trolla.pl` robi 301 → `goratrolla.pl`. Ewentualnie: ujednolicić kanoniczną domenę i ją zdefiniować w Vercel jako primary.

---

### 3. Sitemap hreflang nie zawiera x-default
**Problem:** W `astro.config.mjs` sitemap generuje hreflang tylko dla `lang="pl"` i `lang="en"` — brak `x-default`. W HTML `<head>` jest prawidłowo (`SEOHead.astro` linia 49), ale sitemap jest niespójny.

**Wpływ:** Niespójność HTML vs sitemap — Google może zignorować cały klaster hreflang dla URL-i, gdzie sygnały są sprzeczne.

**Fix:** W `astro.config.mjs` dodaj `x-default` do każdego wpisu `sitemapEntries.links`:
```js
links: [
  { url: 'https://goratrolla.pl/', lang: 'pl' },
  { url: 'https://goratrolla.pl/en/', lang: 'en' },
  { url: 'https://goratrolla.pl/', lang: 'x-default' },  // dodaj
],
```

---

## 🟡 Wysokie (Core Web Vitals + widoczność)

### 4. Brak preload hero image → słaby LCP
**Problem:** `hero.jpg` ładowany jest przez CSS (`background-image`) lub `<img>` bez `<link rel="preload">`. Przeglądarka odkrywa go dopiero przy parsowaniu CSS — to jeden z głównych czynników słabego LCP.

**Fix w `BaseLayout.astro` (wewnątrz `<head>`):**
```html
<link rel="preload" as="image" href="/media/hero.jpg" fetchpriority="high" />
```

---

### 5. Obrazy w formacie JPG — brak WebP
**Problem:** Wszystkie `~35 plików` w `/public/media/` to `.jpg`/`.JPG`/`.png`. Brak WebP lub AVIF. Zdjęcia muzyków (`jedrzej.JPG`, `rafal.JPG`, `maciek.JPG`) mają uppercase extension.

**Wpływ:** JPG jest 25–35% cięższy niż WebP przy tym samym quality. Strona ma ~12 obrazów na stronie Koncerty i O Nas.

**Fix (opcje):**
- Astro `<Image />` component z `@astrojs/image` — automatycznie serwuje WebP
- Albo konwersja plików i `<picture>` z `<source type="image/webp">`
- Przy okazji: zmień `.JPG` → `.jpg` (case sensitivity na Linux/Vercel)

---

### 6. Google Fonts — render-blocking dla LCP
**Problem:** W `BaseLayout.astro` (linia 70) ładowane są 4 rodziny fontów z Google CDN (Cinzel Decorative, Cinzel, EB Garamond, MedievalSharp). Mimo `preconnect` jest to zewnętrzne żądanie blokujące rendering.

**Wpływ:** TTFB + First Contentful Paint zależy od czasu odpowiedzi Google Fonts.

**Fix (najlepszy):** Self-host fonty — pobierz przez `fontsource` lub `@fontsource/*` npm packages:
```bash
npm install @fontsource/cinzel @fontsource/eb-garamond
```
Wtedy font jest bundlowany lokalnie, Vercel serwuje z CDN edge, brak zewnętrznego żądania.

---

### 7. Brak `width`/`height` na obrazach — ryzyko CLS
**Problem:** Zdjęcia muzyków (`MusicianCard`), obrazy galerii i obrazy w sekcji filozofii nie mają atrybutów `width`/`height`. Przeglądarka nie rezerwuje miejsca przed załadowaniem obrazu → layout shift.

**Wpływ:** CLS (Cumulative Layout Shift) > 0.1 = "needs improvement" w Core Web Vitals.

**Fix:** Dodaj `width` i `height` atrybuty do wszystkich `<img>` lub użyj Astro `<Image />` (automatycznie).

---

## 🟠 Średnie (on-page i content)

### 8. H1 na podstronach zbyt generyczne
| Strona | H1 | Problem |
|---|---|---|
| `/o-nas/` | „O Nas" | 2 słowa, zero słów kluczowych |
| `/koncerty/` | „Koncerty" | 1 słowo |
| `/kontakt/` | „Kontakt" | 1 słowo |

**Fix:** Rozszerz H1 o keyword:
- `O Nas — Góra Trolla, Zespół Muzyki Dawnej`
- `Koncerty — Muzyka Dawna na Żywo`

(Tytuł strony `<title>` jest OK — zmiana tylko H1 w komponentach `*PageContent.astro`)

---

### 9. sameAs YouTube = konkretne wideo, nie kanał
**Problem:** W JSON-LD (m.in. `index.astro` linia 53) `sameAs` zawiera `https://www.youtube.com/watch?v=OgWUrgaBPnU` — to link do pojedynczego wideo, nie kanału.

**Fix:** Zmień na URL kanału YouTube: `https://www.youtube.com/@NazwaKanalu`

---

### 10. Brak image sitemap
**Problem:** Przy tak bogatym serwisie foto/koncerty, Google Images jest potencjalnym kanałem ruchu. Brak `<image:image>` w sitemapie.

**Fix:** Rozszerz `buildSitemapXml` w `astro.config.mjs` o `image:image` dla kluczowych stron.

---

### 11. Manifest PWA tylko po polsku
**Problem:** `manifest.webmanifest` ma `"lang": "pl"` i `"name"` po polsku. Strona angielska korzysta z tego samego manifestu.

**Wpływ:** Mniejszy problem, ale Google Search/Chrome używa manifest name w rich snippets aplikacji.

---

### 12. Meta description `/kontakt/` krótka
Aktualna: *"Skontaktuj się z Górą Trolla - zapytania o koncerty, współpracę, prasę i media."* (79 znaków)

**Fix:** Rozszerz do 140–160 znaków, dodaj keyword "muzyka dawna, Trójmiasto":
> *"Skontaktuj się z zespołem Góra Trolla w sprawie koncertów, festiwali i współpracy. Muzyka dawna z Trójmiasta — zapytania o rezerwacje, prasę i media."*

---

## 🟢 Dobre — co działa prawidłowo

| Element | Status |
|---|---|
| Hreflang (HTML `<head>`) | ✅ Self-referencing + x-default + reciprocal |
| JSON-LD schema | ✅ MusicGroup, Event, Person, ContactPage |
| Canonical URLs | ✅ Wszystkie strony mają unikalne canonical |
| `<html lang>` | ✅ Dynamicznie ustawiane (pl/en) |
| Viewport meta | ✅ Obecny |
| HTTPS | ✅ Cały serwis |
| Title tags | ✅ Unikalne, zawierają brand + keyword |
| Meta descriptions | ✅ Obecne na wszystkich stronach |
| robots.txt Allow | ✅ Strona dostępna dla crawlerów |
| 301 redirecty legacy `.html` | ✅ Skonfigurowane w `vercel.json` |
| Sitemap struktura | ✅ sitemap-index → sitemap-0.xml z hreflang |
| `<link rel="preconnect">` | ✅ Google Fonts preconnect jest |
| Manifest PWA | ✅ Obecny |
| Skip link dostępności | ✅ Prawidłowy |
| JSON-LD rendered server-side | ✅ Astro `set:html` — nie wymaga JS |
| `display=swap` Google Fonts | ✅ Brak FOIT |

---

## Priorytetyzowany plan działania

| # | Akcja | Plik | Priorytet |
|---|---|---|---|
| 1 | Napraw URL sitemap w robots.txt | `public/robots.txt` | 🔴 Krytyczny |
| 2 | Zweryfikuj redirect `www.gora-trolla.pl → goratrolla.pl` | Vercel Dashboard | 🔴 Krytyczny |
| 3 | Dodaj x-default do sitemap hreflang | `astro.config.mjs` | 🔴 Krytyczny |
| 4 | Preload hero image | `BaseLayout.astro` | 🟡 Wysoki |
| 5 | Self-host Google Fonts | `BaseLayout.astro` + npm | 🟡 Wysoki |
| 6 | Konwertuj obrazy do WebP + Astro Image | komponenty galerii | 🟡 Wysoki |
| 7 | Dodaj width/height do `<img>` | wszystkie komponenty | 🟡 Wysoki |
| 8 | Rozszerz H1 na podstronach | `*PageContent.astro` | 🟠 Średni |
| 9 | Napraw sameAs YouTube → URL kanału | `index.astro`, `o-nas.astro` | 🟠 Średni |
| 10 | Rozszerz meta description kontaktu | `kontakt.astro` | 🟠 Średni |
