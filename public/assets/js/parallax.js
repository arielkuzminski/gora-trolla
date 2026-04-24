/* ==========================================================================
   GÓRA TROLLA — Parallax
   IntersectionObserver + passive scroll listener
   ========================================================================== */

(function () {
  'use strict';

  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const parallaxEls = document.querySelectorAll('[data-parallax]');
  if (!parallaxEls.length) return;

  let scrollY = 0;
  const visibleEls = new Set();

  // Only update elements currently in viewport
  const observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        visibleEls.add(entry.target);
      } else {
        visibleEls.delete(entry.target);
      }
    });
  }, { threshold: 0 });

  parallaxEls.forEach(function (el) {
    observer.observe(el);
  });

  function update() {
    scrollY = window.scrollY;
    visibleEls.forEach(function (el) {
      const speed = parseFloat(el.getAttribute('data-parallax') || '0.3');
      const rect = el.getBoundingClientRect();
      const centerY = rect.top + rect.height / 2 - window.innerHeight / 2;
      const offset = centerY * speed;
      el.style.setProperty('--parallax-y', offset + 'px');
    });
  }

  window.addEventListener('scroll', update, { passive: true });
  update();
})();
