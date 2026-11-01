import { h, svg, clear } from '../lib/dom';
import { ICON } from '../lib/icons';
import { S, fmt } from '../i18n';
import { state } from '../state';
import { matchCandidates } from '../lib/util';
import { candidatesShuffled } from '../content';
import { go } from '../router';
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
    const list = h('div', { class: 'stack cards-2 section' });
    for (const c of candidatesShuffled()) list.append(candidateCard(c, { onClick: () => openProfile(c) }));
    page.append(list, footer());
    return;
  }

  // Phone: summary, note, then the lists. Desktop: the lists at left, summary + note + vote card as a sticky sidebar.
  const aside = h('aside', { class: 'side-col' },
    h('div', { class: 'card' },
      h('div', { class: 'sec-row', style: 'margin-bottom:12px' },
        h('span', { style: 'font-size:15px;color:var(--muted)' }, s.yourPriorities),
        h('a', { class: 'link-btn', href: '#start', style: 'min-height:auto' }, s.change)),
      h('div', { class: 'chips' }, ...picks.map((id, i) => h('span', { class: 'chip' }, h('span', { class: 'n' }, String(i + 1)), priorityLabel(id))))),
    note(s.notRecommendation),
    h('div', { class: 'card desk-only', style: 'text-align:center' },
      h('p', { class: 'caption', style: 'margin:0 0 12px' }, `${s.readyTitle} · ${s.readySub}`),
      h('button', { class: 'btn btn-vote btn-block', type: 'button', onclick: () => go('vote') }, svg(ICON.ballot), s.voteNow)),
  );

  const { ranked, unpublished } = matchCandidates(candidatesShuffled(), picks);
  const list1 = h('div', { class: 'stack cards-2' });
  for (const m of ranked) list1.append(candidateCard(m.candidate, { onClick: () => openProfile(m.candidate), picks, matched: m.matched }));
  const col = h('div', { class: 'main-col' },
    h('section', { class: 'section grow', style: 'margin-top:0' },
      h('div', { class: 'sec-row' }, h('h2', null, s.section), h('span', { class: 'sec-meta num' }, fmt(s.countCandidates, { n: ranked.length }))),
      list1));
  if (unpublished.length) {
    const list2 = h('div', { class: 'stack cards-2' });
    for (const c of unpublished) list2.append(candidateCard(c, { onClick: () => openProfile(c) }));
    col.append(h('section', { class: 'section' }, h('h2', null, s.unpublished), h('p', { class: 'sec-sub' }, s.unpublishedNote), list2));
  }

  page.append(h('div', { class: 'layout-2 aside-first', style: 'margin-top:8px' }, aside, col), footer());
}
