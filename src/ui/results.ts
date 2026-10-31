import type { Results } from '../types';
import { h, svg, clear } from '../lib/dom';
import { ICON } from '../lib/icons';
import { S, fmt, fmtNumber, fmtTime, timeAgo, l } from '../i18n';
import { DEPARTMENTS } from '../data/departments';
import { CANDIDATES } from '../data/candidates';
import { pct, siteUrl, copyText, whatsappUrl } from '../lib/util';
import { state } from '../state';
import { getStorage } from '../storage';
import { CANDIDATES_SHUFFLED, avatar, note, footer } from './common';
import { toast } from './toast';

const TOP = 6;

/** Live results. Returns a cleanup that unsubscribes. */
export function renderResults(main: HTMLElement): () => void {
  clear(main);
  const s = S().results;
  const page = h('div', { class: 'wrap page' });
  main.append(page);

  const total = h('span', { class: 'bignum' }, '-');
  const updated = h('p', { class: 'muted small', style: 'margin-top:6px' }, S().loading);
  page.append(h('div', { class: 'card' }, h('div', null, total, h('span', null, s.participants)), updated, h('div', { style: 'margin-top:12px;border-top:1px solid var(--hair);padding-top:12px' }, note(s.peoplesVote, ICON.info, true))));

  let showAll = false;
  const list = h('div', { class: 'stack' });
  const toggle = h('button', { class: 'btn-text', type: 'button', onclick: () => { showAll = !showAll; if (last) draw(last); } });
  page.append(h('section', { class: 'section' }, h('h2', null, s.byVotes), h('div', { style: 'margin-top:10px' }, list), h('div', { style: 'text-align:center;margin-top:6px' }, toggle)));

  const reasons = h('div', { class: 'stack' });
  page.append(h('section', { class: 'section' }, h('h2', null, s.latestReasons), h('div', { style: 'margin-top:10px' }, reasons)));

  const url = siteUrl();
  page.append(h('div', { class: 'row-actions' },
    h('a', { class: 'btn btn-primary', href: whatsappUrl(fmt(s.shareText, { url })), target: '_blank', rel: 'noopener noreferrer' }, svg(ICON.whatsapp), s.shareWhatsApp),
    h('button', { class: 'btn btn-outline', type: 'button', onclick: async () => { toast((await copyText(url)) ? s.copied : url); } }, svg(ICON.link), s.copyLink),
  ), footer());

  let last: Results | null = null;
  const draw = (r: Results) => {
    last = r;
    total.textContent = fmtNumber(r.total);
    updated.textContent = fmt(s.lastUpdated, { t: fmtTime(r.updatedAt) });
    clear(list);
    const sorted = CANDIDATES_SHUFFLED.map((c) => ({ c, n: r.counts[c.id] ?? 0 })).sort((a, b) => b.n - a.n);
    const mine = state.myVote?.candidate ?? null;
    const rows = showAll ? sorted : sorted.slice(0, TOP);
    if (r.total === 0) list.append(note(s.noVotes, ICON.info, true));
    for (const { c, n } of rows) {
      const p = pct(n, r.total);
      const isMine = c.id === mine;
      list.append(h('div', { class: isMine ? 'cand selected' : 'cand' },
        h('div', { class: 'res' }, avatar(c),
          h('div', { class: 'cand-name' }, h('strong', null, c.name, isMine ? h('span', { class: 'pill-you' }, svg(ICON.check), s.yourChoice) : null), h('span', null, c.party)),
          h('span', { class: 'pct' }, `${p} %`)),
        h('div', { class: 'bar', role: 'img', 'aria-label': `${c.name}: ${p} %` }, h('i', { style: `width:${p}%` })),
      ));
    }
    toggle.textContent = showAll ? s.seeLess : fmt(s.seeAll, { n: CANDIDATES.length });
    toggle.style.display = sorted.length > TOP ? '' : 'none';
    clear(reasons);
    if (!r.reasons.length) reasons.append(h('p', { class: 'muted small' }, s.noReasons));
    for (const q of r.reasons) {
      const dep = DEPARTMENTS.find((d) => d.id === q.department);
      const depLabel = dep && dep.id !== 'na' ? ` · ${l(dep.label)}` : '';
      reasons.append(h('blockquote', { class: 'card quote', style: 'margin:0' }, `« ${q.text} »`, h('footer', null, `${s.anonymous}${depLabel} · ${timeAgo(q.at)}`)));
    }
  };

  let off: (() => void) | null = null;
  let dead = false;
  // If nothing arrives (offline, backend not ready), say so instead of spinning forever.
  const timer = window.setTimeout(() => { if (!last) { updated.textContent = S().offline; list.append(note(s.noVotes, ICON.info, true)); } }, 12_000);
  void getStorage().then((st) => { if (dead) return; off = st.subscribeVotes((r) => { clearTimeout(timer); draw(r); }); })
    .catch((e) => { console.error(e); updated.textContent = S().offline; });
  return () => { dead = true; clearTimeout(timer); if (off) off(); };
}
