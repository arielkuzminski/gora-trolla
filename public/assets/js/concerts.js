/* ==========================================================================
   GÓRA TROLLA — Concerts
   Render, filter, JSON-LD Event injection
   ========================================================================== */

(function () {
  'use strict';

  const dataEl = document.getElementById('concert-data');
  if (!dataEl) return;

  let concerts = [];
  try {
    concerts = JSON.parse(dataEl.textContent);
  } catch (e) {
    console.error('[concerts] Invalid JSON:', e);
    return;
  }

  const lang = (window.i18n?.getLang?.() || localStorage.getItem('gt-lang') || 'pl');

  // --- Helpers ---

  const MONTHS_PL = ['Sty','Lut','Mar','Kwi','Maj','Cze','Lip','Sie','Wrz','Paź','Lis','Gru'];
  const MONTHS_EN = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

  function getMonth(date) {
    const d = new Date(date);
    return lang === 'pl' ? MONTHS_PL[d.getMonth()] : MONTHS_EN[d.getMonth()];
  }

  function getDay(date)  { return new Date(date).getDate(); }
  function getYear(date) { return new Date(date).getFullYear(); }
  function getTime(date) {
    const d = new Date(date);
    return d.getHours().toString().padStart(2, '0') + ':' + d.getMinutes().toString().padStart(2, '0');
  }

  function isUpcoming(date) {
    return new Date(date) >= new Date();
  }

  function localText(obj) {
    if (typeof obj === 'string') return obj;
    return obj?.[lang] || obj?.pl || '';
  }

  // --- Render ---

  function renderConcert(concert) {
    const upcoming = isUpcoming(concert.date);
    const day   = getDay(concert.date);
    const month = getMonth(concert.date);
    const year  = getYear(concert.date);
    const time  = getTime(concert.date);

    const typeLabelPL = { sacred: 'Sakralne', secular: 'Świeckie', chamber: 'Kameralne' };
    const typeLabelEN = { sacred: 'Sacred',   secular: 'Secular',  chamber: 'Chamber'   };
    const periodLabelPL = { medieval: 'Średniowiecze', renaissance: 'Renesans', baroque: 'Barok' };
    const periodLabelEN = { medieval: 'Medieval',      renaissance: 'Renaissance', baroque: 'Baroque' };

    const typeLabel   = lang === 'pl' ? typeLabelPL[concert.type]   : typeLabelEN[concert.type];
    const periodLabel = lang === 'pl' ? periodLabelPL[concert.period] : periodLabelEN[concert.period];
    const freeLabel   = lang === 'pl' ? 'Wstęp wolny' : 'Free entry';
    const moreLabel   = lang === 'pl' ? 'Szczegóły' : 'Details';
    const ticketLabel = lang === 'pl' ? 'Bilety' : 'Tickets';

    const article = document.createElement('article');
    article.className = 'concert-card' + (upcoming ? '' : ' concert-card--past');
    article.setAttribute('data-concert-type',   concert.type);
    article.setAttribute('data-concert-period', concert.period);
    article.setAttribute('data-concert-date',   concert.date);
    article.setAttribute('data-upcoming',       upcoming ? '1' : '0');
    article.setAttribute('itemscope', '');
    article.setAttribute('itemtype', 'https://schema.org/Event');

    article.innerHTML = `
      <div class="concert-card__date">
        <span class="concert-card__day"   itemprop="startDate" content="${concert.date}">${day}</span>
        <span class="concert-card__month">${month}</span>
        <span class="concert-card__year">${year}</span>
      </div>
      <div class="concert-card__content">
        <h3 class="concert-card__title" itemprop="name">${localText(concert.title)}</h3>
        <p  class="concert-card__venue" itemprop="location">${localText(concert.venue)}, ${concert.city} &bull; ${time}</p>
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

  function typeTag(label) {
    return `<span class="tag tag--type">${label}</span>`;
  }

  function periodTag(label) {
    return `<span class="tag tag--period">${label}</span>`;
  }

  // --- Filter state ---

  let activeFilters = {
    time:   'all',   // all | upcoming | past
    type:   'all',   // all | sacred | secular | chamber
    period: 'all',   // all | medieval | renaissance | baroque
  };

  function filterConcerts() {
    return concerts.filter(function (c) {
      const upcoming = isUpcoming(c.date);
      if (activeFilters.time === 'upcoming' && !upcoming) return false;
      if (activeFilters.time === 'past'     &&  upcoming) return false;
      if (activeFilters.type   !== 'all' && c.type   !== activeFilters.type)   return false;
      if (activeFilters.period !== 'all' && c.period !== activeFilters.period) return false;
      return true;
    });
  }

  // --- Render into containers ---

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

    filtered.forEach(function (c, i) {
      const el = renderConcert(c);
      el.setAttribute('data-animate', 'fade-up');
      el.setAttribute('data-animate-delay', String((i % 6) + 1));
      list.appendChild(el);
    });

    // Re-trigger entrance animations
    if (window.initEntranceAnimations) window.initEntranceAnimations();
  }

  // --- Filter buttons ---

  function initFilters() {
    const bar = document.querySelector('.filter-bar');
    if (!bar) return;

    bar.addEventListener('click', function (e) {
      const btn = e.target.closest('.filter-btn');
      if (!btn) return;

      const filterGroup = btn.getAttribute('data-filter-group');
      const filterValue = btn.getAttribute('data-filter-value');
      if (!filterGroup || !filterValue) return;

      // Update active state within group
      bar.querySelectorAll(`.filter-btn[data-filter-group="${filterGroup}"]`).forEach(function (b) {
        b.setAttribute('aria-pressed', b === btn ? 'true' : 'false');
      });

      activeFilters[filterGroup] = filterValue;
      render();
    });
  }

  // --- JSON-LD injection ---

  function injectEventSchemas() {
    const schemas = concerts
      .filter(function (c) { return isUpcoming(c.date); })
      .map(function (c) {
        return {
          '@context': 'https://schema.org',
          '@type': 'Event',
          'name': localText(c.title),
          'startDate': c.date,
          'eventStatus': 'https://schema.org/EventScheduled',
          'eventAttendanceMode': 'https://schema.org/OfflineEventAttendanceMode',
          'location': {
            '@type': 'Place',
            'name': localText(c.venue),
            'address': {
              '@type': 'PostalAddress',
              'addressLocality': c.city,
              'addressCountry': 'PL',
            },
          },
          'performer': {
            '@type': 'MusicGroup',
            'name': 'Góra Trolla',
            'url': 'https://goratrolla.pl',
          },
          'organizer': {
            '@type': 'MusicGroup',
            'name': 'Góra Trolla',
            'url': 'https://goratrolla.pl',
          },
          'isAccessibleForFree': c.free,
          'offers': c.ticketUrl ? {
            '@type': 'Offer',
            'url': c.ticketUrl,
            'availability': 'https://schema.org/InStock',
          } : undefined,
        };
      })
      .filter(Boolean);

    if (!schemas.length) return;

    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.textContent = JSON.stringify(schemas);
    document.head.appendChild(script);
  }

  // --- Init ---

  document.addEventListener('DOMContentLoaded', function () {
    injectEventSchemas();
    initFilters();
    render();
  });
})();
