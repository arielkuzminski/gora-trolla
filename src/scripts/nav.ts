const nav = document.querySelector<HTMLElement>('.nav');
const hamburger = document.querySelector<HTMLButtonElement>('.nav__hamburger');
const navLinks = document.querySelector<HTMLElement>('.nav__links');
const SCROLL_THRESHOLD = 80;
const MOBILE_BREAKPOINT = 768;

function onScroll() {
  if (!nav) return;
  nav.classList.toggle('scrolled', window.scrollY > SCROLL_THRESHOLD);
}

window.addEventListener('scroll', onScroll, { passive: true });
onScroll();

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

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && navLinks.classList.contains('is-open')) {
      setMenuState(false);
      hamburger.focus();
    }
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

  window.addEventListener('resize', () => {
    if (window.innerWidth > MOBILE_BREAKPOINT && navLinks.classList.contains('is-open')) {
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

if (document.startViewTransition) {
  document.querySelectorAll<HTMLAnchorElement>('a[href]').forEach((link) => {
    const hrefAttr = link.getAttribute('href');
    if (!hrefAttr) return;

    if (
      link.hostname === location.hostname &&
      !hrefAttr.startsWith('#') &&
      link.target !== '_blank'
    ) {
      link.addEventListener('click', (event) => {
        const href = link.href;
        if (href === location.href) return;
        event.preventDefault();
        document.startViewTransition?.(() => {
          location.href = href;
        });
      });
    }
  });
}
