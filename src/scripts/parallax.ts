if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
  const parallaxElements = document.querySelectorAll<HTMLElement>('[data-parallax]');

  if (parallaxElements.length) {
    const visibleElements = new Set<HTMLElement>();

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!(entry.target instanceof HTMLElement)) return;
        if (entry.isIntersecting) {
          visibleElements.add(entry.target);
        } else {
          visibleElements.delete(entry.target);
        }
      });
    }, { threshold: 0 });

    parallaxElements.forEach((element) => {
      observer.observe(element);
    });

    function update() {
      visibleElements.forEach((element) => {
        const speed = parseFloat(element.getAttribute('data-parallax') || '0.3');
        const rect = element.getBoundingClientRect();
        const centerY = rect.top + rect.height / 2 - window.innerHeight / 2;
        const offset = centerY * speed;
        element.style.setProperty('--parallax-y', `${offset}px`);
      });
    }

    window.addEventListener('scroll', update, { passive: true });
    update();
  }
}
