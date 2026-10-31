import { h, svg, clear } from '../lib/dom';
import { ICON } from '../lib/icons';
import { S, fmt } from '../i18n';
import { state } from '../state';
import { matchCandidates } from '../lib/util';
import { go } from '../router';
import { CANDIDATES_SHUFFLED, candidateCard, note, priorityLabel, footer } from './common';
import { openProfile } from './profile';

/** #match (ranked by the visitor's priorities) and #candidates (everyone, random order). */
export function renderMatch(main: HTMLElement, all: boolean): void {
  clear(main);
  const s = S().match;
  const picks = state.picks;
  const page = h('div', { class: 'wrap page' });
  main.append(page);

  if (!all && picks.length === 0) {
    page.append(note(s.pickFirst), h('div', { style: 'margin-top:16px' }, h('a', { class: 'btn btn-primary btn-block', href: '#start' }, S().hero.title)));
    return;
  }

  if (all) {
    page.append(h('h1', null, s.allTitle), h('p', { class: 'lead' }, s.allSub));
    const list = h('div', { class: 'stack section' });
    for (const c of CANDIDATES_SHUFFLED) list.append(candidateCard(c, { onClick: () => openProfile(c) }));
    page.append(list);
  } else {
    page.append(
      h('div', { class: 'card' },
        h('div', { class: 'section-head', style: 'margin-bottom:8px' }, h('span', { class: 'muted small', style: 'font-weight:600' }, s.yourPriorities), h('a', { class: 'btn-text', href: '#start', style: 'min-height:auto;padding:0' }, s.change)),
        h('div', { class: 'chips' }, ...picks.map((id, i) => h('span', { class: 'chip outline' }, h('span', { class: 'n' }, String(i + 1)), priorityLabel(id)))),
      ),
      h('div', { style: 'margin-top:12px' }, note(s.notRecommendation)),
    );
    const { ranked, unpublished } = matchCandidates(CANDIDATES_SHUFFLED, picks);
    const sec1 = h('section', { class: 'section' },
      h('div', { class: 'section-head' }, h('h2', null, s.section), h('span', { class: 'muted small' }, fmt(s.countCandidates, { n: ranked.length }))));
    const list1 = h('div', { class: 'stack' });
    for (const m of ranked) list1.append(candidateCard(m.candidate, { onClick: () => openProfile(m.candidate), picks, matched: m.matched }));
    sec1.append(list1);
    page.append(sec1);
    if (unpublished.length) {
      const sec2 = h('section', { class: 'section' }, h('h2', null, s.unpublished), h('p', { class: 'sub', style: 'margin-top:4px' }, s.unpublishedNote));
      const list2 = h('div', { class: 'stack' });
      for (const c of unpublished) list2.append(candidateCard(c, { onClick: () => openProfile(c) }));
      sec2.append(list2);
      page.append(sec2);
    }
  }

  page.append(
    h('div', { style: 'margin-top:24px' }, h('button', { class: 'btn btn-vote btn-block', type: 'button', onclick: () => go('vote') }, svg(ICON.ballot), s.voteNow)),
    footer(),
  );
}
