import { h, svg, clear } from '../lib/dom';
import { ICON } from '../lib/icons';
import { S, fmt, fmtDate, l } from '../i18n';
import { DATES, DATES_UPDATED, CONTENT_UPDATED, GENERAL_SOURCES } from '../data/dates';
import { CANDIDATES } from '../data/candidates';
import { sourceList, modeBadge } from './common';

export const REPO_URL = 'https://github.com/Fredler21/prezidan-pa-m';

export function renderAbout(main: HTMLElement): void {
  clear(main);
  const s = S().about;
  const page = h('div', { class: 'wrap page' });
  main.append(page);

  page.append(h('h1', null, s.heading), h('p', { class: 'lead' }, s.sub));

  page.append(h('section', { class: 'section card' }, h('h2', null, s.method),
    h('ul', { class: 'steps', style: 'margin-top:8px' },
      h('li', null, svg(ICON.sliders), h('span', null, s.m1)),
      h('li', null, svg(ICON.count), h('span', null, s.m2)),
      h('li', null, svg(ICON.ballot), h('span', null, s.m3)))));

  page.append(h('section', { class: 'section card' }, h('h2', null, s.neutrality),
    h('ul', { class: 'bullets', style: 'margin-top:8px' }, ...[s.n1, s.n2, s.n3, s.n4, s.n5].map((t) => h('li', null, t)))));

  page.append(h('section', { class: 'section card' }, h('h2', null, s.dates), h('p', { class: 'sub', style: 'margin-top:2px' }, fmt(s.datesSub, { d: fmtDate(DATES_UPDATED) })),
    h('ul', { class: 'timeline' }, ...DATES.map((d) => h('li', null, h('b', null, fmtDate(d.date)), h('span', null, l(d.label))))),
    h('p', { class: 'hint', style: 'margin-top:10px' }, s.datesNote)));

  page.append(h('section', { class: 'section card' }, h('h2', null, s.sources), sourceList(GENERAL_SOURCES)));

  const credited = CANDIDATES.filter((c) => c.photo && c.photoCredit);
  page.append(h('section', { class: 'section card' }, h('h2', null, s.photos), h('p', { class: 'sub', style: 'margin-top:4px' }, s.photosNote),
    h('ul', { class: 'bullets small' }, ...credited.map((c) => h('li', null, `${c.name}: ${c.photoCredit}`)))));

  page.append(h('section', { class: 'section card', style: 'text-align:center' },
    h('p', null, h('b', null, fmt(s.lastUpdated, { d: fmtDate(CONTENT_UPDATED) }))),
    h('p', { class: 'muted small', style: 'margin-top:6px' }, modeBadge()),
    h('p', { class: 'muted small', style: 'margin-top:10px' }, s.language),
    h('p', { class: 'small', style: 'margin-top:10px' }, h('a', { href: REPO_URL, target: '_blank', rel: 'noopener noreferrer' }, s.code))));
}
