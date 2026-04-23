/* ==========================================================================
   GÓRA TROLLA — Main Bootstrap
   Entrance animations, form AJAX, misc
   ========================================================================== */

(function () {
  'use strict';

  // --- Entrance animations via IntersectionObserver ---

  function initEntranceAnimations() {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const els = document.querySelectorAll('[data-animate]:not(.is-visible)');
    if (!els.length) return;

    const observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.12,
      rootMargin: '0px 0px -40px 0px',
    });

    els.forEach(function (el) {
      observer.observe(el);
    });
  }

  // Export for concerts.js to call after filter re-render
  window.initEntranceAnimations = initEntranceAnimations;

  // --- Contact form AJAX enhancement ---

  function initContactForm() {
    const form = document.querySelector('.contact-form');
    if (!form) return;

    const successEl = document.querySelector('.form-success');
    const submitBtn = form.querySelector('[type="submit"]');

    form.addEventListener('submit', async function (e) {
      if (!form.action || form.action.includes('formspree')) {
        e.preventDefault();

        submitBtn.disabled = true;
        submitBtn.textContent = submitBtn.getAttribute('data-loading') || 'Wysyłanie…';

        try {
          const data = new FormData(form);
          const res = await fetch(form.action, {
            method: 'POST',
            body: data,
            headers: { 'Accept': 'application/json' },
          });

          if (res.ok) {
            form.style.display = 'none';
            if (successEl) successEl.classList.add('is-visible');
          } else {
            submitBtn.disabled = false;
            submitBtn.textContent = submitBtn.getAttribute('data-submit') || 'Wyślij';
            alert('Wystąpił błąd. Spróbuj ponownie lub wyślij e-mail bezpośrednio.');
          }
        } catch (err) {
          submitBtn.disabled = false;
          submitBtn.textContent = submitBtn.getAttribute('data-submit') || 'Wyślij';
        }
      }
    });
  }

  // --- Email obfuscation reveal ---

  function initEmailObfuscation() {
    document.querySelectorAll('[data-email]').forEach(function (el) {
      const encoded = el.getAttribute('data-email');
      // Simple rot13
      const decoded = encoded.replace(/[a-zA-Z]/g, function (c) {
        return String.fromCharCode(
          c.charCodeAt(0) + (c.toLowerCase() < 'n' ? 13 : -13)
        );
      });
      el.href = 'mailto:' + decoded;
      el.textContent = decoded;
    });
  }

  // --- Hero hero scroll fade ---

  function initHeroFade() {
    const hero = document.querySelector('.hero');
    if (!hero) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const content = hero.querySelector('.hero__content');
    if (!content) return;

    window.addEventListener('scroll', function () {
      const scrolled = window.scrollY;
      const heroH = hero.offsetHeight;
      const progress = Math.min(scrolled / (heroH * 0.5), 1);
      content.style.opacity = 1 - progress;
      content.style.transform = `translateY(${scrolled * 0.15}px)`;
    }, { passive: true });
  }

  // --- Collapsed past concerts toggle ---

  function initPastConcertsToggle() {
    const btn = document.getElementById('toggle-past');
    const section = document.getElementById('past-concerts');
    if (!btn || !section) return;

    btn.addEventListener('click', function () {
      const isOpen = section.classList.contains('is-open');
      section.classList.toggle('is-open', !isOpen);
      btn.textContent = isOpen
        ? (btn.getAttribute('data-show') || 'Pokaż minione koncerty')
        : (btn.getAttribute('data-hide') || 'Ukryj minione koncerty');
    });
  }

  // --- DOMContentLoaded ---

  document.addEventListener('DOMContentLoaded', function () {
    initEntranceAnimations();
    initContactForm();
    initEmailObfuscation();
    initHeroFade();
    initPastConcertsToggle();
  });
})();
