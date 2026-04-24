function initEntranceAnimations() {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const elements = document.querySelectorAll<HTMLElement>('[data-animate]:not(.is-visible)');
  if (!elements.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.12,
    rootMargin: '0px 0px -40px 0px',
  });

  elements.forEach((element) => {
    observer.observe(element);
  });
}

window.initEntranceAnimations = initEntranceAnimations;

function initContactForm() {
  const form = document.querySelector<HTMLFormElement>('.contact-form');
  if (!form) return;

  const successEl = document.querySelector<HTMLElement>('.form-success');
  const submitBtn = form.querySelector<HTMLButtonElement>('[type="submit"], button[type="submit"], input[type="submit"]');
  if (!submitBtn) return;

  form.addEventListener('submit', async (event) => {
    if (!form.action || form.action.includes('formspree')) {
      event.preventDefault();

      submitBtn.disabled = true;
      submitBtn.textContent = submitBtn.getAttribute('data-loading') || 'Wysyłanie...';

      try {
        const data = new FormData(form);
        const response = await fetch(form.action, {
          method: 'POST',
          body: data,
          headers: { Accept: 'application/json' },
        });

        if (response.ok) {
          form.style.display = 'none';
          successEl?.classList.add('is-visible');
        } else {
          submitBtn.disabled = false;
          submitBtn.textContent = submitBtn.getAttribute('data-submit') || 'Wyślij';
          alert('Wystąpił błąd. Spróbuj ponownie lub wyślij e-mail bezpośrednio.');
        }
      } catch {
        submitBtn.disabled = false;
        submitBtn.textContent = submitBtn.getAttribute('data-submit') || 'Wyślij';
      }
    }
  });
}

function rot13(value: string) {
  return value.replace(/[a-zA-Z]/g, (char) =>
    String.fromCharCode(char.charCodeAt(0) + (char.toLowerCase() < 'n' ? 13 : -13))
  );
}

function initEmailObfuscation() {
  document.querySelectorAll<HTMLAnchorElement>('[data-email]').forEach((element) => {
    const encoded = element.getAttribute('data-email');
    if (!encoded) return;
    const decoded = rot13(encoded);
    element.href = `mailto:${decoded}`;
    element.textContent = decoded;
  });
}

function initHeroFade() {
  const hero = document.querySelector<HTMLElement>('.hero');
  if (!hero) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const content = hero.querySelector<HTMLElement>('.hero__content');
  if (!content) return;

  window.addEventListener('scroll', () => {
    const scrolled = window.scrollY;
    const heroHeight = hero.offsetHeight;
    const progress = Math.min(scrolled / (heroHeight * 0.5), 1);
    content.style.opacity = String(1 - progress);
    content.style.transform = `translateY(${scrolled * 0.15}px)`;
  }, { passive: true });
}

function initPastConcertsToggle() {
  const btn = document.getElementById('toggle-past');
  const section = document.getElementById('past-concerts');
  if (!btn || !section) return;

  btn.addEventListener('click', () => {
    const isOpen = section.classList.contains('is-open');
    section.classList.toggle('is-open', !isOpen);
    btn.textContent = isOpen
      ? (btn.getAttribute('data-show') || 'Pokaż minione koncerty')
      : (btn.getAttribute('data-hide') || 'Ukryj minione koncerty');
  });
}

function initMain() {
  initEntranceAnimations();
  initContactForm();
  initEmailObfuscation();
  initHeroFade();
  initPastConcertsToggle();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initMain, { once: true });
} else {
  initMain();
}
