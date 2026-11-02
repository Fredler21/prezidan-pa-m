import { h, clear } from '../lib/dom';
import { ICON } from '../lib/icons';
import { S, fmt, fmtDate, l } from '../i18n';
import { content } from '../content';
import { demoBadge, note, well } from './common';


export function renderAbout(main: HTMLElement): void {
  clear(main);
  const s = S().about;
  const im = S().images;
  const c = content();
  const page = h('div', { class: 'wrap page' });
  main.append(page);

  page.append(h('h1', { class: 'page-title' }, s.heading), h('p', { class: 'lead' }, s.sub));

  const left = h('div', { class: 'col' },
    h('section', { class: 'card roomy' }, h('h2', null, s.method),
      h('ul', { class: 'steps' },
        h('li', null, well(ICON.sliders), h('span', null, s.m1)),
        h('li', null, well(ICON.count), h('span', null, s.m2)),
        h('li', null, well(ICON.ballot), h('span', null, s.m3)))),
    h('section', { class: 'card roomy' }, h('h2', null, s.neutrality),
      h('ul', { class: 'dots' }, ...[s.n1, s.n2, s.n3, s.n4, s.n5].map((t) => h('li', null, t)))),
  );

  const credited = c.candidates.filter((x) => x.photo && x.photoCredit);
  const right = h('div', { class: 'col' },
    h('section', { class: 'card roomy' }, h('h2', null, s.dates),
      h('p', { class: 'caption', style: 'margin:-6px 0 16px' }, fmt(s.datesSub, { d: fmtDate(c.datesUpdated) })),
      h('ul', { class: 'timeline' }, ...c.dates.map((d) => h('li', null, h('b', null, fmtDate(d.date)), h('span', null, l(d.label))))),
      h('hr', { class: 'hr' }),
      note(s.datesNote, ICON.info, false)),
    h('section', { class: 'card roomy' }, h('h2', null, s.photos), h('p', { class: 'caption', style: 'margin:-4px 0 12px' }, s.photosNote),
      h('ul', { class: 'dots' }, ...credited.map((x) => h('li', { style: 'font-size:14px' }, `${x.name}: ${x.photoCredit}`))),
      h('h3', { style: 'font-size:15px;font-weight:600;margin-top:16px' }, s.haitiPhotos),
      h('ul', { class: 'dots' }, h('li', { style: 'font-size:14px' }, im.flagCredit), h('li', { style: 'font-size:14px' }, `${im.citadelle}: ${im.citadelleCredit}`), h('li', { style: 'font-size:14px' }, `${im.bassin}: ${im.bassinCredit}`))),
  );

  page.append(
    h('div', { class: 'cols-2 gap-24' }, left, right),
    h('section', { class: 'card roomy', style: 'margin-top:24px;text-align:center' },
      h('p', { style: 'font-weight:600' }, fmt(s.lastUpdated, { d: fmtDate(c.contentUpdated) })),
      demoBadge(),
      h('p', { class: 'caption' }, s.language)));
}
