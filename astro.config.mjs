import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import { readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const sitemapEntries = [
  {
    loc: 'https://www.gora-trolla.pl/',
    links: [
      { url: 'https://www.gora-trolla.pl/', lang: 'pl' },
      { url: 'https://www.gora-trolla.pl/en/', lang: 'en' },
      { url: 'https://www.gora-trolla.pl/', lang: 'x-default' },
    ],
  },
  {
    loc: 'https://www.gora-trolla.pl/en/',
    links: [
      { url: 'https://www.gora-trolla.pl/', lang: 'pl' },
      { url: 'https://www.gora-trolla.pl/en/', lang: 'en' },
      { url: 'https://www.gora-trolla.pl/', lang: 'x-default' },
    ],
  },
  {
    loc: 'https://www.gora-trolla.pl/o-nas/',
    links: [
      { url: 'https://www.gora-trolla.pl/o-nas/', lang: 'pl' },
      { url: 'https://www.gora-trolla.pl/en/about/', lang: 'en' },
      { url: 'https://www.gora-trolla.pl/o-nas/', lang: 'x-default' },
    ],
  },
  {
    loc: 'https://www.gora-trolla.pl/en/about/',
    links: [
      { url: 'https://www.gora-trolla.pl/o-nas/', lang: 'pl' },
      { url: 'https://www.gora-trolla.pl/en/about/', lang: 'en' },
      { url: 'https://www.gora-trolla.pl/o-nas/', lang: 'x-default' },
    ],
  },
  {
    loc: 'https://www.gora-trolla.pl/koncerty/',
    links: [
      { url: 'https://www.gora-trolla.pl/koncerty/', lang: 'pl' },
      { url: 'https://www.gora-trolla.pl/en/concerts/', lang: 'en' },
      { url: 'https://www.gora-trolla.pl/koncerty/', lang: 'x-default' },
    ],
  },
  {
    loc: 'https://www.gora-trolla.pl/en/concerts/',
    links: [
      { url: 'https://www.gora-trolla.pl/koncerty/', lang: 'pl' },
      { url: 'https://www.gora-trolla.pl/en/concerts/', lang: 'en' },
      { url: 'https://www.gora-trolla.pl/koncerty/', lang: 'x-default' },
    ],
  },
  {
    loc: 'https://www.gora-trolla.pl/kontakt/',
    links: [
      { url: 'https://www.gora-trolla.pl/kontakt/', lang: 'pl' },
      { url: 'https://www.gora-trolla.pl/en/contact/', lang: 'en' },
      { url: 'https://www.gora-trolla.pl/kontakt/', lang: 'x-default' },
    ],
  },
  {
    loc: 'https://www.gora-trolla.pl/en/contact/',
    links: [
      { url: 'https://www.gora-trolla.pl/kontakt/', lang: 'pl' },
      { url: 'https://www.gora-trolla.pl/en/contact/', lang: 'en' },
      { url: 'https://www.gora-trolla.pl/kontakt/', lang: 'x-default' },
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

      if (!current.includes('https://www.gora-trolla.pl/o-nas/')) {
        return;
      }

      await writeFile(sitemapPath, buildSitemapXml(sitemapEntries), 'utf8');
    },
  },
};

export default defineConfig({
  site: 'https://www.gora-trolla.pl',
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
