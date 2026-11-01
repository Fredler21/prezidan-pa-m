import { h, clear } from '../lib/dom';
import { S, fmt } from '../i18n';
import { state } from '../state';
import { matchCandidates } from '../lib/util';
import { candidatesShuffled } from '../content';
import { candidateCard, note, priorityLabel, footer, rail } from './common';
import { openProfile } from './profile';

/** #match (ranked by the visitor's priorities) and #candidates (everyone, random order). */
export function renderMatch(main: HTMLElement, all: boolean): void {
  clear(main);
  const s = S().match;
  const picks = state.picks;
  const page = h('div', { class: 'wrap' }, rail('candidates'));
  main.append(page);

  if (!all && picks.length === 0) {
    page.append(note(s.pickFirst), h('div', { class: 'gap-24' }, h('a', { class: 'btn btn-primary btn-block', href: '#start' }, S().hero.cta)));
    return;
  }

  if (all) {
    page.append(h('h1', { class: 'page-title', style: 'margin-top:8px' }, s.allTitle), h('p', { class: 'lead' }, s.allSub));
    const list = h('div', { class: 'stack section' });
    for (const c of candidatesShuffled()) list.append(candidateCard(c, { onClick: () => openProfile(c) }));
    page.append(list, footer());
    return;
  }

  page.append(
    h('div', { class: 'card', style: 'margin-top:8px' },
      h('div', { class: 'sec-row', style: 'margin-bottom:12px' },
        h('span', { class: 'muted', style: 'font-size:15px;color:var(--muted)' }, s.yourPriorities),
        h('a', { class: 'link-btn', href: '#start', style: 'min-height:auto' }, s.change)),
      h('div', { class: 'chips' }, ...picks.map((id, i) => h('span', { class: 'chip' }, h('span', { class: 'n' }, String(i + 1)), priorityLabel(id))))),
    h('div', { style: 'margin-top:12px' }, note(s.notRecommendation)),
  );

  const { ranked, unpublished } = matchCandidates(candidatesShuffled(), picks);
  const list1 = h('div', { class: 'stack' });
  for (const m of ranked) list1.append(candidateCard(m.candidate, { onClick: () => openProfile(m.candidate), picks, matched: m.matched }));
  page.append(h('section', { class: 'section grow' },
    h('div', { class: 'sec-row' }, h('h2', null, s.section), h('span', { class: 'sec-meta num' }, fmt(s.countCandidates, { n: ranked.length }))),
    list1));

  if (unpublished.length) {
    const list2 = h('div', { class: 'stack' });
    for (const c of unpublished) list2.append(candidateCard(c, { onClick: () => openProfile(c) }));
    page.append(h('section', { class: 'section' }, h('h2', null, s.unpublished), h('p', { class: 'sec-sub' }, s.unpublishedNote), list2));
  }
  page.append(footer());
}
