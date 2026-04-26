# Production Readiness Audit Report

**Project:** gora-trolla  
**URL:** https://www.gora-trolla.pl/  
**Date:** 2026-04-25  
**Audit Mode:** Full  
**Auditor:** Claude Code (production-ready skill v2.0.0)  
**Stack:** Node.js / Astro 5.x (TypeScript, static site) — deployed on Vercel

---

## Executive Summary

| | |
|---|---|
| **Total Checks** | 28 |
| **Passed** | 13 |
| **Failed** | 13 |
| **Warnings** | 2 |
| **Overall Status** | ⚠️ Needs work before full production hardening |

Strona działa poprawnie i jest bezpieczna w zakresie sekretów oraz logiki aplikacji. Główne braki dotyczą: **security headers**, **braku CI/CD**, **braku monitoringu** i **brakującej dokumentacji projektowej**. Jedyna podatność w zależnościach (Astro XSS) wymaga aktualizacji do major version 6.

---

## Tech Stack

| | |
|---|---|
| Primary Language | TypeScript / JavaScript |
| Package Manager | npm |
| Framework | Astro 5.18.1 |
| Deployment | Vercel (static) |
| Form Backend | Formspree |

---

## Tools Used

| Tool | Version | Purpose |
|------|---------|---------|
| gitleaks | 8.30.1 | Secret detection w historii git |
| grype | 0.111.1 | Skanowanie podatności zależności |
| syft | 1.43.0 | Generowanie SBOM |
| retire.js | 5.4.2 | Skanowanie podatnych bibliotek JS |
| npm audit | built-in | Audit zależności npm |
| semgrep | — | Nie uruchomiono (błąd kodowania na Win) |
| trufflehog | — | Nie uruchomiono (pip version niekompatybilna) |

---

## Findings

### 🔴 Krytyczne / Wysokie

#### 1. Brak security headers HTTP
**Severity:** High  
**Evidence:** `vercel.json` nie zawiera sekcji `headers`. Brak CSP, X-Frame-Options, X-Content-Type-Options, Referrer-Policy, Permissions-Policy.  

**Wpływ:** Strona podatna na clickjacking (brak `X-Frame-Options`), MIME sniffing (brak `X-Content-Type-Options`), wyciek referer (brak `Referrer-Policy`).

**Fix w `vercel.json`:**
```json
{
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        { "key": "X-Frame-Options", "value": "SAMEORIGIN" },
        { "key": "X-Content-Type-Options", "value": "nosniff" },
        { "key": "Referrer-Policy", "value": "strict-origin-when-cross-origin" },
        { "key": "Permissions-Policy", "value": "camera=(), microphone=(), geolocation=()" },
        {
          "key": "Content-Security-Policy",
          "value": "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https:; connect-src 'self' https://formspree.io; media-src 'self'; frame-ancestors 'none'"
        }
      ]
    }
  ]
}
```

> **Uwaga CSP:** `'unsafe-inline'` jest potrzebne dla Astro View Transitions i inline styles. Docelowo można zastąpić nonces, ale wymaga to integracji Astro middleware.

---

#### 2. Brak CI/CD pipeline
**Severity:** High  
**Evidence:** Brak katalogu `.github/`, brak żadnego pliku workflow.  

**Wpływ:** Brak automatycznej walidacji kodu przy push/PR — błędy mogą trafić na produkcję bez weryfikacji.

**Fix:** Dodaj `.github/workflows/ci.yml`:
```yaml
name: CI
on: [push, pull_request]
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: '20', cache: 'npm' }
      - run: npm ci
      - run: npm run build
      - name: Security audit
        run: npm audit --audit-level=moderate
```

---

### 🟡 Średnie

#### 3. Podatność Astro XSS (GHSA-j687-52p2-xcff)
**Severity:** Moderate (CVSS 6.1)  
**CVE:** GHSA-j687-52p2-xcff  
**Package:** astro 5.18.1  
**Fixed In:** 6.1.6 (major version bump 5→6)  

**Opis:** Niepełna sanityzacja znacznika `</script>` w `define:vars` umożliwia XSS.

**Wpływ dla tego projektu:** Minimalizowany — `define:vars` jest używany w `AboutPageContent.astro` (line 312) wyłącznie z kontrolowaną wartością `lang` (tylko `'pl'` lub `'en'`). **Brak realnego ryzyka** przy obecnym użyciu.

**Fix:** Migracja do Astro 6.x — wymaga przeglądu breaking changes:
```bash
npx @astrojs/upgrade
```

---

#### 4. Formspree endpoint hardcoded w komponencie
**Severity:** Low-Medium  
**Evidence:** `src/components/ContactPageContent.astro:112` — `action="https://formspree.io/f/xwvaaqyj"` hardcoded, mimo że `.env` zawiera `FORMSPREE_ENDPOINT`.

**Fix:** Użyj zmiennej środowiskowej:
```astro
---
const formAction = import.meta.env.FORMSPREE_ENDPOINT;
---
<form action={formAction} ...>
```

---

#### 5. Brak monitoringu i analityki
**Severity:** Medium  
**Evidence:** Brak jakiegokolwiek kodu analitycznego lub error trackingu w `src/`.

**Wpływ:** Brak wiedzy o ruchu, błędach JS po stronie użytkownika, czy strona działa prawidłowo.

**Rekomendacje (privacy-friendly):**
- **Plausible Analytics** — self-hostable, GDPR-compliant, lekki (< 1KB)
- **Sentry** (free tier) — error tracking dla błędów JS

---

### 🟠 Dokumentacja (Full mode)

#### 6. Brak README.md
Projekt nie ma pliku README. Utrudnia onboarding nowych deweloperów.

**Minimalna zawartość:** Opis projektu, wymagania (Node version), komendy dev/build, struktura katalogów, link do Vercel.

#### 7. Brak LICENSE
**Severity:** Medium (dla open-source) / Low (dla prywatnego repo)  
Bez licencji kod jest domyślnie "all rights reserved".

#### 8. Brak SECURITY.md
Brak procesu zgłaszania podatności bezpieczeństwa.

**Fix:** Utwórz `SECURITY.md` z adresem email do zgłoszeń: `kontakt@goratrolla.pl`.

#### 9. Brak CHANGELOG.md
Brak historii zmian. Utrudnia śledzenie co zmieniło się między deploymentami.

---

## Co działa dobrze ✅

| Check | Status | Szczegóły |
|---|---|---|
| Sekrety w git historii | ✅ PASS | gitleaks: 0 leaks w 39 commitach |
| .gitignore wyklucza .env | ✅ PASS | Prawidłowo skonfigurowany |
| .env.example istnieje | ✅ PASS | Zawiera placeholdery |
| HTTPS | ✅ PASS | Cały serwis |
| Brak hardcoded secrets | ✅ PASS | Klucze w .env, poza VCS |
| Email obfuskacja | ✅ PASS | ROT13 + DOM injection, nie w HTML |
| XSS w lightbox.ts | ✅ PASS | innerHTML tylko statyczny template; caption przez .textContent |
| XSS w formularz | ✅ PASS | FormData, brak innerHTML z user input |
| Astro set:html | ✅ PASS | Używane tylko dla JSON-LD (kontrolowane dane) |
| Output: static | ✅ PASS | Brak server-side code, minimalna powierzchnia ataku |
| Vercel deployments | ✅ PASS | Rollback przez Vercel Dashboard |
| Preload: none na audio | ✅ PASS | Audio nie pobierane bez akcji użytkownika |
| Separacja konfiguracji | ✅ PASS | .env dla środowisk |
| 301 redirecty legacy URLs | ✅ PASS | vercel.json |

---

## Dependency Vulnerabilities

| Package | Installed | Fixed In | Severity | CVE | Dotyczy projektu |
|---------|-----------|----------|----------|-----|-----------------|
| astro | 5.18.1 | 6.1.6 | Moderate | GHSA-j687-52p2-xcff | Minimalnie (define:vars z kontrolowanymi danymi) |

> **Uwaga:** grype wykrył ~30 CVE dla `stdlib go1.23.12` — dotyczą one narzędzi skanujących (grype/syft/gitleaks), **nie projektu**. Nie są relevantne dla gora-trolla.

---

## SBOM Summary

| | |
|---|---|
| **Plik** | `docs/reports/sbom-2026-04-25.json` |
| **Format** | CycloneDX JSON |
| **Total komponentów** | 396 |
| **Biblioteki NPM** | 385 |
| **Aplikacje** | 4 |
| **Główne zależności** | astro 5.18.1, @astrojs/sitemap 3.2.1 |

---

## Full Mode Checklist — Status

### Bezpieczeństwo
- [x] Secret scanning (gitleaks) — 0 leaks
- [x] Podatności krytyczne — 0 (1 moderate, minimalny wpływ)
- [x] Hardcoded secrets w kodzie — brak
- [x] .env.example z placeholderami
- [ ] Security headers (CSP, X-Frame, X-Content-Type) — **brak**
- [ ] npm audit moderate threshold — astro XSS wymaga uwagi
- [x] SBOM wygenerowany: `docs/reports/sbom-2026-04-25.json`

### Dokumentacja
- [ ] README.md — **brak**
- [ ] LICENSE — **brak**
- [ ] CHANGELOG.md — **brak**
- [ ] SECURITY.md — **brak**
- [ ] CONTRIBUTING.md — **brak** (mniej istotne dla prywatnego repo)
- [x] CLAUDE.md — developer guidance dla AI

### CI/CD
- [ ] CI pipeline — **brak**
- [ ] Automated build na PR — **brak**
- [ ] Security scanning w pipeline — **brak**

### Monitoring i Observability
- [ ] Analityka (Plausible/GA) — **brak**
- [ ] Error tracking (Sentry) — **brak**
- [x] Health check — N/A (static site; Vercel handles uptime)
- [x] Structured logging — N/A (static site)

### Operacyjne
- [x] Separacja konfiguracji środowisk (.env)
- [x] Rollback — Vercel Deployments Dashboard
- [ ] Backup/restore procedures — **nie udokumentowane** (Vercel + git = implicit backup)
- [ ] Runbook dla incydentów — **brak**

---

## Priorytetyzowany plan działania

| # | Akcja | Plik | Priorytet | Szacowany czas |
|---|---|---|---|---|
| 1 | Dodaj security headers | `vercel.json` | 🔴 High | 30 min |
| 2 | Utwórz `.github/workflows/ci.yml` | nowy plik | 🔴 High | 1h |
| 3 | Migruj Formspree endpoint do env | `ContactPageContent.astro` | 🟡 Medium | 15 min |
| 4 | Utwórz README.md | nowy plik | 🟡 Medium | 1h |
| 5 | Utwórz SECURITY.md | nowy plik | 🟡 Medium | 15 min |
| 6 | Dodaj Plausible Analytics | `BaseLayout.astro` | 🟡 Medium | 1h |
| 7 | Migruj do Astro 6.x | `package.json` + review | 🟠 Low-Medium | 2-4h |
| 8 | Utwórz CHANGELOG.md | nowy plik | 🟠 Low | 30 min |

---

## Exit Criteria — Status

| Kryterium | Status |
|---|---|
| Zero high/critical vulns z dostępnym fixem | ✅ (moderate tylko, niski realny wpływ) |
| Zero hardcoded secrets | ✅ |
| Dokumentacja projektowa | ❌ Brak README, LICENSE, SECURITY |
| CI/CD pipeline | ❌ Brak |
| SBOM wygenerowany | ✅ `docs/reports/sbom-2026-04-25.json` |
| Security headers | ❌ Brak w vercel.json |
| Monitoring | ❌ Brak analityki i error trackingu |

---

*Generated by production-ready skill v2.0.0 | Claude Code 2026-04-25*
