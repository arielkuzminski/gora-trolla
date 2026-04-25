function initConcerts() {
  const rootList = document.getElementById('concert-list');
  const bar = document.querySelector<HTMLElement>('.filter-bar');
  if (!rootList || !bar) return;

  bar.addEventListener('click', (event) => {
    const btn = (event.target as Element)?.closest<HTMLElement>('.filter-btn');
    if (!btn) return;

    const filterGroup = btn.getAttribute('data-filter-group');
    const filterValue = btn.getAttribute('data-filter-value');
    if (filterGroup !== 'time' || !filterValue) return;

    bar.querySelectorAll<HTMLElement>(`.filter-btn[data-filter-group="${filterGroup}"]`)
      .forEach((b) => b.setAttribute('aria-pressed', b === btn ? 'true' : 'false'));

    if (filterValue === 'all') {
      rootList.removeAttribute('data-filter');
    } else {
      rootList.setAttribute('data-filter', filterValue);
    }

    window.initEntranceAnimations?.();
  });
}

document.addEventListener('astro:page-load', initConcerts, { once: true });
