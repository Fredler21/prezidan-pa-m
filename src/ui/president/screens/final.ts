import type { PriorityId } from '../../../types';
import { h, svg } from '../../../lib/dom';
import { ICON, PRIORITY_ICONS } from '../../../lib/icons';
import { S, fmt, l } from '../../../i18n';
import { LEVELS, PROFILES, START } from '../../../data/president-levels.ts';
import { gradeOf, profileOf, scoreOf, topPriorities } from '../../../lib/president-rules.ts';
import { markSeenCandidates } from '../../../lib/progress';
import { matchCandidates } from '../../../lib/util';
import { candidatesShuffled } from '../../../content';
import { state, setPicks } from '../../../state';
import { SITE_URL } from '../../../data/site';
import { avatar, priorityLabel } from '../../common';
import { openProfile } from '../../profile';
import { toast } from '../../toast';
import { tween } from '../../home';
import { GI, STAT_ICON } from '../art';
import { chip, mapBox, meterList, primary, secondary, stars, type Ctx, type ShowOptions } from '../parts';
import { sfx } from '../sound';

/**
 * The 5 year report (Stitch « s24-final »): the score, the president profile (the strongest country stat),
 * before and after, the stars per year, the candidates whose public record covers the same three priorities
 * (same format for everyone, never a recommendation), sharing, replay, and the real vote.
 */
export function finalScreen(c: Ctx, o: ShowOptions): HTMLElement {
  const s = S().pres;
  const r = c.term?.r;
  if (!r) return h('div');
  const score = scoreOf(r.stats);
  const prof = profileOf(r.stats);
  const P = PROFILES[prof];
  const total = r.stars.reduce<number>((a, b) => a + b, 0);
  const scoreEl = h('b', { class: 'num' }, String(o.fresh ? scoreOf(START) : score));
  if (o.fresh) c.track(tween(scoreEl, scoreOf(START), score, 1400, String));

  const hero = h('div', { class: 'gm-card gm-center gm-final' },
    h('p', { class: 'gm-kicker' }, s.finalKicker),
    h('p', { class: 'gm-big', role: 'img', 'aria-label': `${score}/100` }, scoreEl, h('small', null, '/100')),
    h('h2', { tabindex: -1, 'data-focus': '' }, [s.g0, s.g1, s.g2, s.g3][gradeOf(score)] ?? s.g3),
    h('div', { class: 'gm-row center' },
      chip(fmt(s.starsTotal, { n: total }), GI.star, 'gold'),
      c.record && o.fresh ? chip(s.newBest, GI.trophy, 'green') : null));

  const profile = h('div', { class: 'gm-card gm-profile' },
    h('span', { class: 'gm-well lg', 'aria-hidden': 'true', html: STAT_ICON[prof] }),
    h('div', null, h('p', { class: 'gm-kicker muted' }, s.profileKicker), h('h3', null, l(P.title)), h('p', { class: 'gm-muted' }, l(P.line))));

  const years = h('div', { class: 'gm-card' }, h('h3', { class: 'gm-h3' }, s.starsPerYear),
    h('ol', { class: 'gm-years flat' }, ...LEVELS.map((v, i) =>
      h('li', null, h('b', null, fmt(s.year, { y: i + 1 })), h('span', { class: 'gm-muted' }, l(v.name)), stars(r.stars[i] ?? 0, 'sm')))));

  const shareText = fmt(s.shareText, { s: score, t: total, p: l(P.title), url: `${SITE_URL}/#president` });
  const shareP = h('p', { class: 'gm-share-text' }, shareText);
  const copyBtn = secondary(s.copy, () => { void copy(); }, GI.copy);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(shareText);
      copyBtn.replaceChildren(svg(ICON.check), s.copied);
      sfx.tap();
    } catch {
      const range = document.createRange();
      range.selectNodeContents(shareP);
      const sel = window.getSelection();
      sel?.removeAllRanges(); sel?.addRange(range);
      copyBtn.replaceChildren(svg(GI.copy), s.copySelect);
    }
  };

  const el = h('div', { class: 'gm-cols gm-finalscreen' },
    hero, profile,
    h('div', { class: 'gm-side' }, mapBox(r.stats, { labels: true })),
    h('div', { class: 'gm-card' }, h('h3', { class: 'gm-h3' }, s.beforeAfter), meterList(c, r.stats, START, true)),
    years,
    candidates(topPriorities(r.steps)),
    h('div', { class: 'gm-card' }, h('h3', { class: 'gm-h3' }, s.shareTitle), shareP, copyBtn),
    primary(s.again, () => { sfx.tap(); c.newTerm(); }, ICON.refresh),
    h('section', { class: 'gm-vote', 'aria-labelledby': 'gm-vote-t' },
      h('span', { class: 'gm-vote-ico', 'aria-hidden': 'true' }, svg(ICON.ballot)),
      h('h3', { id: 'gm-vote-t' }, s.voteTitle),
      h('p', null, s.voteText),
      h('a', { class: 'btn btn-primary gm-btn', href: '#vote' }, svg(ICON.ballot), s.bridgeVote),
      h('a', { class: 'gm-link', href: state.picks.length ? '#match' : '#candidates' }, s.bridgeCompare, svg(ICON.arrowRight))));

  if (o.fresh) {
    c.later(() => sfx.win(), 200);
    if (score >= 50) c.later(() => c.celebrate(), 900);
  }
  return el;
}

/** Candidates whose public record covers the player's three priorities: identical rows, random order. */
function candidates(prios: PriorityId[]): HTMLElement | null {
  const s = S().pres;
  if (!prios.length) return null;
  const { ranked } = matchCandidates(candidatesShuffled(), prios);
  const rows = ranked.filter((m) => m.matched.length > 0).slice(0, 3);
  const seeMatch = () => h('a', { class: 'btn gm-btn gm-line', href: '#match' }, s.seeMatch, svg(ICON.arrowRight));
  const already = prios.length === state.picks.length && prios.every((p) => state.picks.includes(p));
  const action: HTMLElement = already ? seeMatch() : secondary(s.save, () => { setPicks(prios); toast(s.saved); action.replaceWith(seeMatch()); }, ICON.check);
  return h('div', { class: 'gm-card gm-cands' },
    h('h3', { class: 'gm-h3' }, s.matchTitle),
    h('div', { class: 'gm-row' }, ...prios.map((id) => chip(priorityLabel(id), PRIORITY_ICONS[id], 'tint'))),
    rows.length
      ? h('div', { class: 'gm-cand-list' }, ...rows.map((m) => h('button', { class: 'gm-cand', type: 'button', 'aria-haspopup': 'dialog', onclick: () => { markSeenCandidates(); openProfile(m.candidate); } },
        avatar(m.candidate),
        h('span', { class: 'gm-cand-name' }, h('b', null, m.candidate.name), h('span', { class: 'gm-muted' }, m.candidate.party)),
        h('b', { class: 'num' }, fmt(s.matchOf, { m: m.matched.length, n: prios.length })),
        svg(ICON.chevronRight))))
      : h('p', { class: 'gm-muted' }, s.noMatch),
    h('p', { class: 'gm-fine left' }, svg(ICON.info), s.note),
    action);
}
