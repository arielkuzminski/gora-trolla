/* ==========================================================================
   GÓRA TROLLA — Navigation
   ========================================================================== */

(function () {
  'use strict';

  const nav = document.querySelector('.nav');
  const hamburger = document.querySelector('.nav__hamburger');
  const navLinks = document.querySelector('.nav__links');
  const SCROLL_THRESHOLD = 80;
  const MOBILE_BREAKPOINT = 768;

  // --- Scroll class ---
  function onScroll() {
    if (window.scrollY > SCROLL_THRESHOLD) {
      nav.classList.add('scrolled');
    } else {
      nav.classList.remove('scrolled');
    }
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // --- Hamburger ---
  if (hamburger && navLinks) {
    function setMenuState(isOpen) {
      hamburger.setAttribute('aria-expanded', String(isOpen));
      navLinks.classList.toggle('is-open', isOpen);
      navLinks.setAttribute('aria-hidden', String(!isOpen));
      document.body.style.overflow = isOpen ? 'hidden' : '';
    }

    setMenuState(false);

    hamburger.addEventListener('click', function () {
      const isOpen = hamburger.getAttribute('aria-expanded') === 'true';
      setMenuState(!isOpen);
    });

    // Close on Escape
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && navLinks.classList.contains('is-open')) {
        setMenuState(false);
        hamburger.focus();
      }
    });

    // Close on any menu link click, including language switcher.
    navLinks.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', function () {
        setMenuState(false);
      });
    });

    // Tapping the dark overlay closes the menu on mobile.
    navLinks.addEventListener('click', function (e) {
      if (e.target === navLinks) {
        setMenuState(false);
      }
    });

    // Reset mobile-only state when returning to a wider viewport.
    window.addEventListener('resize', function () {
      if (window.innerWidth > MOBILE_BREAKPOINT && navLinks.classList.contains('is-open')) {
        setMenuState(false);
      }
    });
  }

  // --- Active link highlight ---
  const currentPath = window.location.pathname.replace(/\/$/, '') || '/';
  document.querySelectorAll('.nav__link').forEach(function (link) {
    const href = link.getAttribute('href');
    if (!href) return;
    const linkPath = href.replace(/\/$/, '') || '/';
    if (currentPath === linkPath || currentPath.endsWith(linkPath)) {
      link.setAttribute('aria-current', 'page');
    }
  });

  // --- View Transitions support ---
  if (document.startViewTransition) {
    document.querySelectorAll('a[href]').forEach(function (link) {
      // Only same-origin non-hash links
      if (
        link.hostname === location.hostname &&
        !link.getAttribute('href').startsWith('#') &&
        link.target !== '_blank'
      ) {
        link.addEventListener('click', function (e) {
          const href = link.href;
          if (href === location.href) return;
          e.preventDefault();
          document.startViewTransition(function () {
            location.href = href;
          });
        });
      }
    });
  }
})();
