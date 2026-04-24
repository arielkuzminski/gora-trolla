const dataEl = document.getElementById('concert-data');

if (dataEl) {
  let concerts: GTConcert[] = [];

  try {
    concerts = JSON.parse(dataEl.textContent || '[]') as GTConcert[];
  } catch (error) {
    console.error('[concerts] Invalid JSON:', error);
  }

  if (concerts.length) {
    const lang = window.i18n?.getLang?.() || ((localStorage.getItem('gt-lang') as 'pl' | 'en' | null) ?? 'pl');

    const MONTHS_PL = ['Sty', 'Lut', 'Mar', 'Kwi', 'Maj', 'Cze', 'Lip', 'Sie', 'Wrz', 'Paź', 'Lis', 'Gru'];
    const MONTHS_EN = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    const rootList = document.getElementById('concert-list');

    function getMonth(date: string) {
      const d = new Date(date);
      return lang === 'pl' ? MONTHS_PL[d.getMonth()] : MONTHS_EN[d.getMonth()];
    }

    function getDay(date: string) {
      return new Date(date).getDate();
    }

    function getYear(date: string) {
      return new Date(date).getFullYear();
    }

    function getTime(date: string) {
      const d = new Date(date);
      return `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
    }

    function isUpcoming(date: string) {
      const concertDate = new Date(date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return concertDate >= today;
    }

    function localText(value: GTConcertText | string | undefined) {
      if (typeof value === 'string') return value;
      return value?.[lang] || value?.pl || '';
    }

    function renderConcert(concert: GTConcert) {
      const upcoming = isUpcoming(concert.date);
      const day = getDay(concert.date);
      const month = getMonth(concert.date);
      const year = getYear(concert.date);
      const time = getTime(concert.date);

      const moreLabel = lang === 'pl' ? 'Szczegóły' : 'Details';

      const article = document.createElement('article');
      article.className = `concert-card${upcoming ? '' : ' concert-card--past'}`;
      article.setAttribute('data-concert-date', concert.date);
      article.setAttribute('data-upcoming', upcoming ? '1' : '0');
      article.setAttribute('itemscope', '');
      article.setAttribute('itemtype', 'https://schema.org/Event');

      article.innerHTML = `
        <div class="concert-card__date">
          <span class="concert-card__day" itemprop="startDate" content="${concert.date}">${day}</span>
          <span class="concert-card__month">${month}</span>
          <span class="concert-card__year">${year}</span>
        </div>
        <div class="concert-card__content">
          <h3 class="concert-card__title" itemprop="name">${localText(concert.title)}</h3>
          <p class="concert-card__venue" itemprop="location">${localText(concert.venue)}, ${concert.city} &bull; ${time}</p>
          ${concert.description ? `<p class="concert-card__desc">${localText(concert.description)}</p>` : ''}
          ${concert.poster ? `<div class="concert-card__footer"><a href="#" class="btn btn--ghost btn--sm" data-poster="${concert.poster}" data-poster-title="${localText(concert.title)}">${moreLabel} →</a></div>` : ''}
        </div>
        <meta itemprop="performer" content="Góra Trolla">
      `;

      return article;
    }

    const activeFilters: {
      time: 'all' | 'upcoming' | 'past';
    } = {
      time: 'all',
    };

    function sortConcerts(items: GTConcert[]) {
      const upcoming = items
        .filter((concert) => isUpcoming(concert.date))
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

      const past = items
        .filter((concert) => !isUpcoming(concert.date))
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

      return [...upcoming, ...past];
    }

    function filterConcerts() {
      return concerts.filter((concert) => {
        const upcoming = isUpcoming(concert.date);
        if (activeFilters.time === 'upcoming' && !upcoming) return false;
        if (activeFilters.time === 'past' && upcoming) return false;
        return true;
      });
    }

    function render() {
      if (!rootList) return;

      const filtered = filterConcerts();
      const sorted = sortConcerts(filtered);

      rootList.innerHTML = '';

      if (sorted.length === 0) {
        const msg = lang === 'pl'
          ? 'Brak koncertów dla wybranych filtrów.'
          : 'No concerts match your filters.';
        rootList.innerHTML = `<p style="color:var(--color-faded);text-align:center;padding:var(--space-12) 0">${msg}</p>`;
        return;
      }

      sorted.forEach((concert, index) => {
        const element = renderConcert(concert);
        element.setAttribute('data-animate', 'fade-up');
        element.setAttribute('data-animate-delay', String((index % 6) + 1));
        rootList.appendChild(element);
      });

      window.initEntranceAnimations?.();
    }

    function initFilters() {
      const bar = document.querySelector<HTMLElement>('.filter-bar');
      if (!bar) return;

      bar.addEventListener('click', (event) => {
        const target = event.target;
        if (!(target instanceof Element)) return;

        const btn = target.closest<HTMLElement>('.filter-btn');
        if (!btn) return;

        const filterGroup = btn.getAttribute('data-filter-group');
        const filterValue = btn.getAttribute('data-filter-value');
        if (!filterGroup || !filterValue) return;

        bar.querySelectorAll<HTMLElement>(`.filter-btn[data-filter-group="${filterGroup}"]`).forEach((button) => {
          button.setAttribute('aria-pressed', button === btn ? 'true' : 'false');
        });

        if (filterGroup === 'time') {
          activeFilters[filterGroup] = filterValue as never;
          render();
        }
      });
    }

    function initConcerts() {
      initFilters();
      render();
    }

    document.addEventListener('astro:page-load', initConcerts, { once: true });
  }
}
