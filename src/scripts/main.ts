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

function initAmbientAudio() {
  const player = document.querySelector<HTMLElement>('[data-ambient-player]');
  const audio = document.querySelector<HTMLAudioElement>('[data-ambient-audio]');
  const button = document.querySelector<HTMLButtonElement>('[data-ambient-toggle]');
  const label = document.querySelector<HTMLElement>('[data-ambient-label]');
  if (!player || !audio || !button || !label) return;

  const storageKey = 'gt-ambient-audio';
  const playLabel = button.getAttribute('data-label-play') || 'Play music';
  const pauseLabel = button.getAttribute('data-label-pause') || 'Pause music';
  audio.volume = 0.35;

  const setState = (playing: boolean) => {
    player.dataset.state = playing ? 'playing' : 'paused';
    button.setAttribute('aria-pressed', playing ? 'true' : 'false');
    label.textContent = playing ? pauseLabel : playLabel;
  };

  const playAudio = async () => {
    try {
      await audio.play();
      setState(true);
      localStorage.setItem(storageKey, 'on');
    } catch {
      setState(false);
      localStorage.setItem(storageKey, 'off');
    }
  };

  const pauseAudio = () => {
    audio.pause();
    setState(false);
    localStorage.setItem(storageKey, 'off');
  };

  button.addEventListener('click', () => {
    if (audio.paused) {
      void playAudio();
    } else {
      pauseAudio();
    }
  });

  audio.addEventListener('play', () => setState(true));
  audio.addEventListener('pause', () => setState(false));

  if (localStorage.getItem(storageKey) === 'on') {
    void playAudio();
  } else {
    setState(false);
  }
}

function initMain() {
  initEntranceAnimations();
  initContactForm();
  initEmailObfuscation();
  initHeroFade();
  initAmbientAudio();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initMain, { once: true });
} else {
  initMain();
}
