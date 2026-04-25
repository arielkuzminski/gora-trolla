const SCROLL_THRESHOLD = 10;
const MOBILE_BREAKPOINT = 768;

function onScroll() {
  const nav = document.querySelector<HTMLElement>('.nav');
  if (!nav) return;
  nav.classList.toggle('scrolled', window.scrollY > SCROLL_THRESHOLD);
}

window.addEventListener('scroll', onScroll, { passive: true });

function initNav() {
  // Re-check scroll state against potentially new DOM element after View Transition
  onScroll();

  const hamburger = document.querySelector<HTMLButtonElement>('.nav__hamburger');
  const navLinks = document.querySelector<HTMLElement>('.nav__links');

  if (hamburger && navLinks) {
    function setMenuState(isOpen: boolean) {
      hamburger.setAttribute('aria-expanded', String(isOpen));
      navLinks.classList.toggle('is-open', isOpen);
      navLinks.setAttribute('aria-hidden', String(!isOpen));
      document.body.style.overflow = isOpen ? 'hidden' : '';
    }

    setMenuState(false);

    hamburger.addEventListener('click', () => {
      const isOpen = hamburger.getAttribute('aria-expanded') === 'true';
      setMenuState(!isOpen);
    });

    navLinks.querySelectorAll<HTMLAnchorElement>('a').forEach((link) => {
      link.addEventListener('click', () => {
        setMenuState(false);
      });
    });

    navLinks.addEventListener('click', (event) => {
      if (event.target === navLinks) {
        setMenuState(false);
      }
    });
  }

  const currentPath = window.location.pathname.replace(/\/$/, '') || '/';
  document.querySelectorAll<HTMLAnchorElement>('.nav__link').forEach((link) => {
    const href = link.getAttribute('href');
    if (!href) return;
    const linkPath = href.replace(/\/$/, '') || '/';
    if (currentPath === linkPath || currentPath.endsWith(linkPath)) {
      link.setAttribute('aria-current', 'page');
    }
  });
}

// Escape key closes menu — on document, persists across transitions
document.addEventListener('keydown', (event) => {
  const hamburger = document.querySelector<HTMLButtonElement>('.nav__hamburger');
  const navLinks = document.querySelector<HTMLElement>('.nav__links');
  if (event.key === 'Escape' && navLinks?.classList.contains('is-open')) {
    hamburger?.setAttribute('aria-expanded', 'false');
    navLinks.classList.remove('is-open');
    navLinks.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    hamburger?.focus();
  }
});

window.addEventListener('resize', () => {
  const hamburger = document.querySelector<HTMLButtonElement>('.nav__hamburger');
  const navLinks = document.querySelector<HTMLElement>('.nav__links');
  if (window.innerWidth > MOBILE_BREAKPOINT && navLinks?.classList.contains('is-open')) {
    hamburger?.setAttribute('aria-expanded', 'false');
    navLinks.classList.remove('is-open');
    navLinks.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }
});

document.addEventListener('astro:page-load', initNav);
