import type { Results } from '../types';
import { h, svg, clear } from '../lib/dom';
import { ICON } from '../lib/icons';
import { S, fmt, fmtNumber, fmtTime, timeAgo, l } from '../i18n';
import { pct, siteUrl, copyText, whatsappUrl } from '../lib/util';
import { state } from '../state';
import { getStorage } from '../storage';
import { content, candidatesShuffled } from '../content';
import { note, footer, rail, resultCard } from './common';
import { toast } from './toast';

const TOP = 6;
// Narrow no-break spaces inside « » so a closing guillemet never orphans on its own line.
const quoteText = (t: string) => `« ${t} »`;

/** Live results. Returns a cleanup that unsubscribes. */
export function renderResults(main: HTMLElement): () => void {
  clear(main);
  const s = S().results;
  const page = h('div', { class: 'wrap' }, rail('results'));
  main.append(page);

  const total = h('b', null, '·');
  const updated = h('p', { class: 'stamp' }, S().loading);
  page.append(h('div', { class: 'card roomy', style: 'margin-top:8px' },
    h('div', { class: 'stat' }, total, h('span', null, s.participants)),
    updated,
    h('hr', { class: 'hr' }),
    note(s.peoplesVote, ICON.info, false)));

  let showAll = false;
  const list = h('div', { class: 'stack grow' });
  const toggle = h('button', { class: 'link-btn', type: 'button', onclick: () => { showAll = !showAll; if (last) draw(last); } });
  page.append(h('section', { class: 'section' }, h('h2', null, s.byVotes), list, h('div', { style: 'text-align:center;margin-top:4px' }, toggle)));

  const reasons = h('div', { class: 'stack' });
  page.append(h('section', { class: 'section' }, h('h2', null, s.latestReasons), reasons));

  const url = siteUrl();
  page.append(h('div', { class: 'share' },
    h('a', { class: 'btn btn-primary', href: whatsappUrl(fmt(s.shareText, { url })), target: '_blank', rel: 'noopener noreferrer' }, svg(ICON.whatsapp), s.shareWhatsApp),
    h('button', { class: 'btn btn-outline', type: 'button', onclick: async () => { toast((await copyText(url)) ? s.copied : url); } }, svg(ICON.link), s.copyLink),
  ), footer());

  let last: Results | null = null;
  let drawn = 0;
  const draw = (r: Results) => {
    last = r;
    total.textContent = fmtNumber(r.total);
    updated.textContent = fmt(s.lastUpdated, { t: fmtTime(r.updatedAt) });
    // Bars grow only on the first draw; later refreshes update in place without replaying motion.
    if (drawn++ > 0) list.classList.remove('grow');
    clear(list);
    const sorted = candidatesShuffled().map((c) => ({ c, n: r.counts[c.id] ?? 0 })).sort((a, b) => b.n - a.n);
    const mine = state.myVote?.candidate ?? null;
    const rows = showAll ? sorted : sorted.slice(0, TOP);
    if (r.total === 0) list.append(note(s.noVotes));
    for (const { c, n } of rows) list.append(resultCard(c, pct(n, r.total), c.id === mine));
    toggle.textContent = showAll ? s.seeLess : fmt(s.seeAll, { n: sorted.length });
    toggle.style.display = sorted.length > TOP ? '' : 'none';
    clear(reasons);
    if (!r.reasons.length) reasons.append(h('p', { class: 'caption', style: 'margin-top:0' }, s.noReasons));
    for (const q of r.reasons) {
      const dep = content().departments.find((d) => d.id === q.department);
      const depLabel = dep && dep.id !== 'na' ? ` · ${l(dep.label)}` : '';
      reasons.append(h('blockquote', { class: 'card quote' }, quoteText(q.text), h('footer', null, `${s.anonymous}${depLabel} · ${timeAgo(q.at)}`)));
    }
  };

  let off: (() => void) | null = null;
  let dead = false;
  // If nothing arrives (offline, backend not ready), say so instead of spinning forever.
  const timer = window.setTimeout(() => { if (!last) { updated.textContent = S().offline; list.append(note(s.noVotes)); } }, 12_000);
  void getStorage().then((st) => { if (dead) return; off = st.subscribeVotes((r) => { clearTimeout(timer); draw(r); }); })
    .catch((e) => { console.error(e); updated.textContent = S().offline; });
  return () => { dead = true; clearTimeout(timer); if (off) off(); };
}
