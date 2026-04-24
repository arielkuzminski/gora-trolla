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
      return new Date(date) >= new Date();
    }

    function localText(value: GTConcertText | string | undefined) {
      if (typeof value === 'string') return value;
      return value?.[lang] || value?.pl || '';
    }

    function typeTag(label: string) {
      return `<span class="tag tag--type">${label}</span>`;
    }

    function periodTag(label: string) {
      return `<span class="tag tag--period">${label}</span>`;
    }

    function renderConcert(concert: GTConcert) {
      const upcoming = isUpcoming(concert.date);
      const day = getDay(concert.date);
      const month = getMonth(concert.date);
      const year = getYear(concert.date);
      const time = getTime(concert.date);

      const typeLabelPL = { sacred: 'Sakralne', secular: 'Świeckie', chamber: 'Kameralne' } as const;
      const typeLabelEN = { sacred: 'Sacred', secular: 'Secular', chamber: 'Chamber' } as const;
      const periodLabelPL = { medieval: 'Średniowiecze', renaissance: 'Renesans', baroque: 'Barok' } as const;
      const periodLabelEN = { medieval: 'Medieval', renaissance: 'Renaissance', baroque: 'Baroque' } as const;

      const typeLabel = lang === 'pl' ? typeLabelPL[concert.type] : typeLabelEN[concert.type];
      const periodLabel = lang === 'pl' ? periodLabelPL[concert.period] : periodLabelEN[concert.period];
      const freeLabel = lang === 'pl' ? 'Wstęp wolny' : 'Free entry';
      const moreLabel = lang === 'pl' ? 'Szczegóły' : 'Details';
      const ticketLabel = lang === 'pl' ? 'Bilety' : 'Tickets';

      const article = document.createElement('article');
      article.className = `concert-card${upcoming ? '' : ' concert-card--past'}`;
      article.setAttribute('data-concert-type', concert.type);
      article.setAttribute('data-concert-period', concert.period);
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
          ${concert.description ? `<p class="concert-card__desc" style="font-size:var(--text-sm);color:var(--color-faded);margin-top:var(--space-2)">${localText(concert.description)}</p>` : ''}
          <div class="concert-card__meta">
            ${typeTag(typeLabel)}
            ${periodTag(periodLabel)}
          </div>
          <div class="concert-card__footer">
            <span class="${concert.free ? 'tag tag--free' : 'tag tag--type'}">${concert.free ? freeLabel : (concert.ticketUrl ? ticketLabel : '')}</span>
            ${concert.ticketUrl ? `<a href="${concert.ticketUrl}" class="btn btn--ghost" style="padding:var(--space-1) var(--space-4);font-size:var(--text-xs)" target="_blank" rel="noopener">${ticketLabel} →</a>` : `<span style="font-size:var(--text-xs);color:var(--color-faded)">${moreLabel}</span>`}
          </div>
        </div>
        <meta itemprop="performer" content="Góra Trolla">
      `;

      return article;
    }

    const activeFilters: {
      time: 'all' | 'upcoming' | 'past';
      type: 'all' | 'sacred' | 'secular' | 'chamber';
      period: 'all' | 'medieval' | 'renaissance' | 'baroque';
    } = {
      time: 'all',
      type: 'all',
      period: 'all',
    };

    function filterConcerts() {
      return concerts.filter((concert) => {
        const upcoming = isUpcoming(concert.date);
        if (activeFilters.time === 'upcoming' && !upcoming) return false;
        if (activeFilters.time === 'past' && upcoming) return false;
        if (activeFilters.type !== 'all' && concert.type !== activeFilters.type) return false;
        if (activeFilters.period !== 'all' && concert.period !== activeFilters.period) return false;
        return true;
      });
    }

    function render() {
      const list = document.getElementById('concert-list');
      if (!list) return;

      const filtered = filterConcerts();
      list.innerHTML = '';

      if (filtered.length === 0) {
        const msg = lang === 'pl'
          ? 'Brak koncertów dla wybranych filtrów.'
          : 'No concerts match your filters.';
        list.innerHTML = `<p style="color:var(--color-faded);text-align:center;padding:var(--space-12) 0">${msg}</p>`;
        return;
      }

      filtered.forEach((concert, index) => {
        const element = renderConcert(concert);
        element.setAttribute('data-animate', 'fade-up');
        element.setAttribute('data-animate-delay', String((index % 6) + 1));
        list.appendChild(element);
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

        if (filterGroup === 'time' || filterGroup === 'type' || filterGroup === 'period') {
          activeFilters[filterGroup] = filterValue as never;
          render();
        }
      });
    }

    function injectEventSchemas() {
      const schemas = concerts
        .filter((concert) => isUpcoming(concert.date))
        .map((concert) => ({
          '@context': 'https://schema.org',
          '@type': 'Event',
          name: localText(concert.title),
          startDate: concert.date,
          eventStatus: 'https://schema.org/EventScheduled',
          eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
          location: {
            '@type': 'Place',
            name: localText(concert.venue),
            address: {
              '@type': 'PostalAddress',
              addressLocality: concert.city,
              addressCountry: 'PL',
            },
          },
          performer: {
            '@type': 'MusicGroup',
            name: 'Góra Trolla',
            url: 'https://goratrolla.pl',
          },
          organizer: {
            '@type': 'MusicGroup',
            name: 'Góra Trolla',
            url: 'https://goratrolla.pl',
          },
          isAccessibleForFree: concert.free,
          offers: concert.ticketUrl ? {
            '@type': 'Offer',
            url: concert.ticketUrl,
            availability: 'https://schema.org/InStock',
          } : undefined,
        }));

      if (!schemas.length) return;

      const script = document.createElement('script');
      script.type = 'application/ld+json';
      script.textContent = JSON.stringify(schemas);
      document.head.appendChild(script);
    }

    function initConcerts() {
      injectEventSchemas();
      initFilters();
      render();
    }

    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', initConcerts, { once: true });
    } else {
      initConcerts();
    }
  }
}
