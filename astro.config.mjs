import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import { readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const sitemapEntries = [
  {
    loc: 'https://goratrolla.pl/',
    links: [
      { url: 'https://goratrolla.pl/', lang: 'pl' },
      { url: 'https://goratrolla.pl/en/', lang: 'en' },
    ],
  },
  {
    loc: 'https://goratrolla.pl/en/',
    links: [
      { url: 'https://goratrolla.pl/', lang: 'pl' },
      { url: 'https://goratrolla.pl/en/', lang: 'en' },
    ],
  },
  {
    loc: 'https://goratrolla.pl/o-nas/',
    links: [
      { url: 'https://goratrolla.pl/o-nas/', lang: 'pl' },
      { url: 'https://goratrolla.pl/en/about/', lang: 'en' },
    ],
  },
  {
    loc: 'https://goratrolla.pl/en/about/',
    links: [
      { url: 'https://goratrolla.pl/o-nas/', lang: 'pl' },
      { url: 'https://goratrolla.pl/en/about/', lang: 'en' },
    ],
  },
  {
    loc: 'https://goratrolla.pl/koncerty/',
    links: [
      { url: 'https://goratrolla.pl/koncerty/', lang: 'pl' },
      { url: 'https://goratrolla.pl/en/concerts/', lang: 'en' },
    ],
  },
  {
    loc: 'https://goratrolla.pl/en/concerts/',
    links: [
      { url: 'https://goratrolla.pl/koncerty/', lang: 'pl' },
      { url: 'https://goratrolla.pl/en/concerts/', lang: 'en' },
    ],
  },
  {
    loc: 'https://goratrolla.pl/kontakt/',
    links: [
      { url: 'https://goratrolla.pl/kontakt/', lang: 'pl' },
      { url: 'https://goratrolla.pl/en/contact/', lang: 'en' },
    ],
  },
  {
    loc: 'https://goratrolla.pl/en/contact/',
    links: [
      { url: 'https://goratrolla.pl/kontakt/', lang: 'pl' },
      { url: 'https://goratrolla.pl/en/contact/', lang: 'en' },
    ],
  },
];

const sitemapAlternates = Object.fromEntries(
  sitemapEntries.map((entry) => [entry.loc, entry.links]),
);

function escapeXml(value) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&apos;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;');
}

function buildSitemapXml(entries) {
  const urls = entries
    .map(
      (entry) =>
        `<url><loc>${escapeXml(entry.loc)}</loc>${entry.links
          .map(
            (link) =>
              `<xhtml:link rel="alternate" hreflang="${escapeXml(link.lang)}" href="${escapeXml(link.url)}"/>`,
          )
          .join('')}</url>`,
    )
    .join('');

  return `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:news="http://www.google.com/schemas/sitemap-news/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1" xmlns:video="http://www.google.com/schemas/sitemap-video/1.1">${urls}</urlset>`;
}

const patchSitemapIntegration = {
  name: 'patch-sitemap-alternates',
  hooks: {
    'astro:build:done': async ({ dir }) => {
      const sitemapPath = path.join(fileURLToPath(dir), 'sitemap-0.xml');
      const current = await readFile(sitemapPath, 'utf8');

      if (!current.includes('https://goratrolla.pl/o-nas/')) {
        return;
      }

      await writeFile(sitemapPath, buildSitemapXml(sitemapEntries), 'utf8');
    },
  },
};

export default defineConfig({
  site: 'https://goratrolla.pl',
  output: 'static',
  integrations: [
    sitemap({
      filter: (page) => !page.endsWith('/test/'),
      serialize: (item) => ({
        ...item,
        links: sitemapAlternates[item.url] ?? item.links,
      }),
      i18n: {
        defaultLocale: 'pl',
        locales: {
          pl: 'pl',
          en: 'en',
        },
      },
    }),
    patchSitemapIntegration,
  ],
  i18n: {
    defaultLocale: 'pl',
    locales: ['pl', 'en'],
    routing: {
      prefixDefaultLocale: false,
    },
  },
});
