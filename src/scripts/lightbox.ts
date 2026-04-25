let images: GTLightboxItem[] = [];
let currentIndex = 0;
let previouslyFocused: Element | null = null;

const lightbox = document.createElement('div');
lightbox.className = 'lightbox';
lightbox.setAttribute('role', 'dialog');
lightbox.setAttribute('aria-modal', 'true');
lightbox.setAttribute('aria-label', 'Przeglądarka obrazów');
lightbox.innerHTML = `
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

document.body.appendChild(lightbox);

const lbImage = lightbox.querySelector<HTMLImageElement>('.lightbox__image');
const lbClose = lightbox.querySelector<HTMLButtonElement>('.lightbox__close');
const lbPrev = lightbox.querySelector<HTMLButtonElement>('.lightbox__prev');
const lbNext = lightbox.querySelector<HTMLButtonElement>('.lightbox__next');
const lbCaption = lightbox.querySelector<HTMLElement>('.lightbox__caption');

function show(index: number) {
  const item = images[index];
  if (!item || !lbImage || !lbCaption || !lbPrev || !lbNext) return;

  lbImage.src = item.src;
  lbImage.alt = item.alt || '';
  lbCaption.textContent = item.caption || '';
  lbPrev.style.display = images.length <= 1 ? 'none' : '';
  lbNext.style.display = images.length <= 1 ? 'none' : '';
}

function open(items: GTLightboxItem[], index: number) {
  if (!lbClose) return;
  images = items;
  currentIndex = index;
  previouslyFocused = document.activeElement;
  show(currentIndex);
  lightbox.classList.add('is-open');
  document.body.style.overflow = 'hidden';
  lbClose.focus();
}

function close() {
  if (!lbImage) return;
  lightbox.classList.remove('is-open');
  document.body.style.overflow = '';
  lbImage.src = '';
  if (previouslyFocused instanceof HTMLElement) {
    previouslyFocused.focus();
  }
}

function prev() {
  currentIndex = (currentIndex - 1 + images.length) % images.length;
  show(currentIndex);
}

function next() {
  currentIndex = (currentIndex + 1) % images.length;
  show(currentIndex);
}

lbClose?.addEventListener('click', close);
lbPrev?.addEventListener('click', prev);
lbNext?.addEventListener('click', next);

lightbox.addEventListener('click', (event) => {
  if (event.target === lightbox) {
    close();
  }
});

document.addEventListener('keydown', (event) => {
  if (!lightbox.classList.contains('is-open')) return;
  if (event.key === 'Escape') {
    event.preventDefault();
    close();
  }
  if (event.key === 'ArrowLeft') {
    event.preventDefault();
    prev();
  }
  if (event.key === 'ArrowRight') {
    event.preventDefault();
    next();
  }
});

lightbox.addEventListener('keydown', (event) => {
  if (event.key !== 'Tab') return;
  const focusable = lightbox.querySelectorAll<HTMLButtonElement>('button:not([disabled])');
  const first = focusable[0];
  const last = focusable[focusable.length - 1];
  if (!first || !last) return;

  if (event.shiftKey) {
    if (document.activeElement === first) {
      event.preventDefault();
      last.focus();
    }
  } else if (document.activeElement === last) {
    event.preventDefault();
    first.focus();
  }
});

function initLightbox() {
  const galleryGroups = document.querySelectorAll<HTMLElement>('[data-gallery]');

  galleryGroups.forEach((group) => {
    const items = group.querySelectorAll<HTMLElement>('.gallery-item');
    const imageList: GTLightboxItem[] = Array.from(items).map((item) => {
      const image = item.querySelector<HTMLImageElement>('img');
      return {
        src: item.getAttribute('data-full') || image?.src || '',
        alt: image?.alt || '',
        caption: item.getAttribute('data-caption') || '',
      };
    });

    items.forEach((item, index) => {
      item.setAttribute('tabindex', '0');
      item.setAttribute('role', 'button');
      item.setAttribute('aria-label', `Otwórz zdjęcie ${index + 1}`);

      item.addEventListener('click', () => {
        open(imageList, index);
      });

      item.addEventListener('keydown', (event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          open(imageList, index);
        }
      });
    });
  });
}

window.GoraTrollaLightbox = { open, close };

function ensureInDocument() {
  if (!document.body.contains(lightbox)) {
    document.body.appendChild(lightbox);
  }
}

document.addEventListener('astro:after-swap', ensureInDocument);
document.addEventListener('astro:page-load', initLightbox);
