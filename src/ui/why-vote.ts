import { h, svg } from '../lib/dom';
import { ICON } from '../lib/icons';
import { S, fmt, fmtDate, fmtNumber } from '../i18n';
import { FIRST_ROUND, REGISTER_CLOSES } from '../data/dates';
import { daysUntil } from '../lib/util';
import { well } from './common';

/**
 * « Poukisa vòt ou enpòtan »: four plain reasons to vote in the real election, the countdown to
 * the first round and a reminder that a vote on this site is a civic poll, not the official vote.
 * Facts only: the 5 year term (Constitution, art. 134-1) and the CEP calendar dates.
 */
export function whyVote(opts: { countdown?: boolean } = {}): HTMLElement {
  const s = S().why;
  const days = daysUntil(FIRST_ROUND);
  const item = (icon: string, title: string, text: string) =>
    h('div', { class: 'why-item' }, well(icon), h('h3', null, title), h('p', null, text));
  return h('section', { class: 'section why-sec', 'aria-labelledby': 'why-title' },
    h('div', { class: 'sec-head' }, h('p', { class: 'kicker' }, s.kicker), h('h2', { id: 'why-title' }, s.title), h('p', { class: 'why-lead' }, s.lead)),
    h('div', { class: 'why-grid' },
      item(ICON.calendar, s.termTitle, s.term),
      item(ICON.ballot, s.voiceTitle, s.voice),
      item(ICON.people, s.manyTitle, s.many),
      item(ICON.idcard, s.readyTitle, fmt(s.ready, { d: fmtDate(REGISTER_CLOSES) }))),
    h('div', { class: 'why-foot' },
      h('a', { class: 'btn btn-primary', href: '#vote' }, svg(ICON.ballot), s.cta),
      days >= 0 && opts.countdown !== false ? h('p', { class: 'why-count num' }, svg(ICON.calendar), fmt(s.countdown, { n: fmtNumber(days), d: fmtDate(FIRST_ROUND) })) : null),
    h('p', { class: 'why-note' }, svg(ICON.info), s.note));
}
