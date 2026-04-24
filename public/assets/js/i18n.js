/* ==========================================================================
   GÓRA TROLLA — i18n System
   data-i18n attribute + JSON + localStorage
   ========================================================================== */

(function () {
  'use strict';

  const STORAGE_KEY = 'gt-lang';
  const DEFAULT_LANG = 'pl';
  let translations = {};

  function getLang() {
    return localStorage.getItem(STORAGE_KEY) || DEFAULT_LANG;
  }

  function setLang(lang) {
    localStorage.setItem(STORAGE_KEY, lang);
  }

  // Nested key lookup: 'concerts.filter.upcoming'
  function t(key) {
    const parts = key.split('.');
    let val = translations;
    for (const part of parts) {
      if (val == null || typeof val !== 'object') return key;
      val = val[part];
    }
    return (val != null && typeof val === 'string') ? val : key;
  }

  function applyTranslations() {
    // Text content
    document.querySelectorAll('[data-i18n]').forEach(function (el) {
      const key = el.getAttribute('data-i18n');
      const val = t(key);
      if (val !== key) el.textContent = val;
    });

    // aria-label
    document.querySelectorAll('[data-i18n-aria]').forEach(function (el) {
      const key = el.getAttribute('data-i18n-aria');
      const val = t(key);
      if (val !== key) el.setAttribute('aria-label', val);
    });

    // placeholder
    document.querySelectorAll('[data-i18n-placeholder]').forEach(function (el) {
      const key = el.getAttribute('data-i18n-placeholder');
      const val = t(key);
      if (val !== key) el.setAttribute('placeholder', val);
    });

    // html lang attribute
    document.documentElement.lang = getLang();
  }

  // Load translations — try inline script tag first, then fetch
  async function loadTranslations(lang) {
    // Check for inline JSON
    const inlineScript = document.getElementById('i18n-' + lang);
    if (inlineScript) {
      try {
        translations = JSON.parse(inlineScript.textContent);
        applyTranslations();
        return;
      } catch (e) { /* fall through to fetch */ }
    }

    try {
      const base = document.querySelector('meta[name="base-url"]')?.content || '';
      const res = await fetch(base + '/assets/i18n/' + lang + '.json');
      if (!res.ok) throw new Error('HTTP ' + res.status);
      translations = await res.json();
      applyTranslations();
    } catch (err) {
      console.warn('[i18n] Failed to load translations for:', lang, err);
    }
  }

  // Language switcher buttons
  function initSwitcher() {
    const lang = getLang();

    document.querySelectorAll('.lang-btn').forEach(function (btn) {
      const btnLang = btn.getAttribute('hreflang') || btn.getAttribute('data-lang');
      if (btnLang === lang) {
        btn.classList.add('lang-btn--active');
        btn.setAttribute('aria-current', 'true');
      } else {
        btn.classList.remove('lang-btn--active');
        btn.removeAttribute('aria-current');
      }
    });
  }

  // Init
  document.addEventListener('DOMContentLoaded', function () {
    const lang = getLang();
    initSwitcher();
    loadTranslations(lang);
  });

  window.i18n = { t, getLang, setLang, reload: function () { return loadTranslations(getLang()); } };
})();
