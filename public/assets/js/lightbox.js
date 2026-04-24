/* ==========================================================================
   GÓRA TROLLA — Lightbox
   Zero-dependency, keyboard accessible, focus-trapped
   ========================================================================== */

(function () {
  'use strict';

  let images = [];
  let currentIndex = 0;
  let previouslyFocused = null;

  // Build lightbox DOM
  const lb = document.createElement('div');
  lb.className = 'lightbox';
  lb.setAttribute('role', 'dialog');
  lb.setAttribute('aria-modal', 'true');
  lb.setAttribute('aria-label', 'Przeglądarka obrazów');
  lb.innerHTML = `
    <div class="lightbox__inner">
      <img class="lightbox__image" src="" alt="" />
    </div>
    <button class="lightbox__close" aria-label="Zamknij">
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
        <path d="M2 2l12 12M14 2L2 14" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
      </svg>
    </button>
    <button class="lightbox__prev" aria-label="Poprzednie zdjęcie">
      <svg width="10" height="16" viewBox="0 0 10 16" fill="none" aria-hidden="true">
        <path d="M8 2L2 8l6 6" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
    </button>
    <button class="lightbox__next" aria-label="Następne zdjęcie">
      <svg width="10" height="16" viewBox="0 0 10 16" fill="none" aria-hidden="true">
        <path d="M2 2l6 6-6 6" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
    </button>
    <div class="lightbox__caption" aria-live="polite"></div>
  `;

  document.body.appendChild(lb);

  const lbImage   = lb.querySelector('.lightbox__image');
  const lbClose   = lb.querySelector('.lightbox__close');
  const lbPrev    = lb.querySelector('.lightbox__prev');
  const lbNext    = lb.querySelector('.lightbox__next');
  const lbCaption = lb.querySelector('.lightbox__caption');

  function open(items, index) {
    images = items;
    currentIndex = index;
    previouslyFocused = document.activeElement;
    show(currentIndex);
    lb.classList.add('is-open');
    document.body.style.overflow = 'hidden';
    lbClose.focus();
  }

  function close() {
    lb.classList.remove('is-open');
    document.body.style.overflow = '';
    lbImage.src = '';
    if (previouslyFocused) previouslyFocused.focus();
  }

  function show(index) {
    const item = images[index];
    lbImage.src = item.src;
    lbImage.alt = item.alt || '';
    lbCaption.textContent = item.caption || '';
    lbPrev.style.display = images.length <= 1 ? 'none' : '';
    lbNext.style.display = images.length <= 1 ? 'none' : '';
  }

  function prev() {
    currentIndex = (currentIndex - 1 + images.length) % images.length;
    show(currentIndex);
  }

  function next() {
    currentIndex = (currentIndex + 1) % images.length;
    show(currentIndex);
  }

  // Events
  lbClose.addEventListener('click', close);
  lbPrev.addEventListener('click', prev);
  lbNext.addEventListener('click', next);

  // Backdrop click
  lb.addEventListener('click', function (e) {
    if (e.target === lb) close();
  });

  // Keyboard
  document.addEventListener('keydown', function (e) {
    if (!lb.classList.contains('is-open')) return;
    if (e.key === 'Escape')      { e.preventDefault(); close(); }
    if (e.key === 'ArrowLeft')   { e.preventDefault(); prev(); }
    if (e.key === 'ArrowRight')  { e.preventDefault(); next(); }
  });

  // Focus trap
  lb.addEventListener('keydown', function (e) {
    if (e.key !== 'Tab') return;
    const focusable = lb.querySelectorAll('button:not([disabled])');
    const first = focusable[0];
    const last  = focusable[focusable.length - 1];
    if (e.shiftKey) {
      if (document.activeElement === first) { e.preventDefault(); last.focus(); }
    } else {
      if (document.activeElement === last)  { e.preventDefault(); first.focus(); }
    }
  });

  // Auto-init all gallery items on the page
  window.addEventListener('DOMContentLoaded', function () {
    const galleryGroups = document.querySelectorAll('[data-gallery]');

    galleryGroups.forEach(function (group) {
      const items = group.querySelectorAll('.gallery-item');
      const imageList = Array.from(items).map(function (item) {
        return {
          src:     item.getAttribute('data-full') || item.querySelector('img')?.src,
          alt:     item.querySelector('img')?.alt || '',
          caption: item.getAttribute('data-caption') || '',
        };
      });

      items.forEach(function (item, idx) {
        item.setAttribute('tabindex', '0');
        item.setAttribute('role', 'button');
        item.setAttribute('aria-label', 'Otwórz zdjęcie ' + (idx + 1));

        item.addEventListener('click', function () { open(imageList, idx); });
        item.addEventListener('keydown', function (e) {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            open(imageList, idx);
          }
        });
      });
    });
  });

  // Export for manual use
  window.GoraTrollaLightbox = { open, close };
})();
