import type { Poll, PollResults, StorageAdapter } from '../types';
import { h, svg, clear } from '../lib/dom';
import { ICON } from '../lib/icons';
import { S, fmt, fmtNumber, l } from '../i18n';
import { pct, siteUrl, copyText, whatsappUrl } from '../lib/util';
import { getStorage } from '../storage';
import { note, footer } from './common';
import { toast } from './toast';

/** Weekly poll. Results are shown only after the visitor has answered (no nudging). */
export function renderPoll(main: HTMLElement): () => void {
  clear(main);
  const s = S().poll;
  const page = h('div', { class: 'wrap page' });
  main.append(page);
  page.append(h('p', { class: 'lead', style: 'margin-top:0' }, s.sub));
  const body = h('div');
  page.append(body, footer());
  const subs: (() => void)[] = [];
  let alive = true;
  let storage: StorageAdapter;

  void (async () => {
    storage = await getStorage();
    let poll: Poll | null = null;
    try { poll = await storage.getActivePoll(); }
    catch (e) { console.error(e); if (alive) body.append(h('div', { style: 'margin-top:12px' }, note(S().offline))); return; }
    if (!alive) return;
    if (!poll) { body.append(h('div', { style: 'margin-top:12px' }, note(s.none))); return; }
    body.append(h('span', { class: 'chip outline', style: 'margin:4px 0 10px' }, fmt(s.week, { w: poll.week })));

    let mine = await storage.getMyPollAnswer(poll.id);
    let selected = mine;
    const options = h('div', { class: 'stack', role: 'radiogroup', 'aria-label': l(poll.question) });
    const submit = h('button', { class: 'btn btn-vote btn-block', type: 'button', style: 'margin-top:14px' }, mine ? s.update : s.submit);
    const results = h('div', { class: 'section' });

    const drawOptions = () => {
      clear(options);
      for (const o of poll.options) options.append(h('button', { class: 'opt', type: 'button', 'aria-pressed': String(selected === o.id), onclick: () => { selected = o.id; drawOptions(); } }, h('span', { class: 'radio', 'aria-hidden': 'true' }), h('span', null, l(o.label))));
    };
    drawOptions();

    submit.addEventListener('click', async () => {
      if (!selected) { toast(s.selectFirst); return; }
      submit.disabled = true;
      try { await storage.ready(); await storage.savePollAnswer(poll.id, selected); mine = selected; submit.textContent = s.update; toast(s.saved); showResults(); }
      catch (e) { console.error(e); toast(S().vote.errorSave, 5000); }
      finally { submit.disabled = false; }
    });

    body.append(h('div', { class: 'card', style: 'margin-top:4px' }, h('h2', { style: 'font-size:21px;line-height:1.25;margin-bottom:14px' }, l(poll.question)), options, submit), results);

    const showResults = () => {
      if (results.childElementCount) return;
      const total = h('span', { class: 'muted small' });
      const bars = h('div', { class: 'stack', style: 'margin-top:10px' });
      results.append(h('div', { class: 'section-head' }, h('h2', null, s.resultsNow), total), h('div', { class: 'card' }, bars, h('p', { class: 'hint', style: 'margin-top:12px' }, s.note)));
      subs.push(storage.subscribePollResults(poll.id, (r: PollResults) => {
        total.textContent = fmt(s.answers, { n: fmtNumber(r.total) });
        clear(bars);
        for (const o of poll.options) {
          const p = pct(r.counts[o.id] ?? 0, r.total);
          bars.append(h('div', null, h('div', { class: 'match-line' }, h('span', null, l(o.label), mine === o.id ? h('span', { class: 'pill-you' }, svg(ICON.check), S().results.yourChoice) : null), h('b', null, `${p} %`)), h('div', { class: 'bar' }, h('i', { style: `width:${p}%` }))));
        }
      }));
      const url = siteUrl('poll');
      results.append(h('div', { class: 'row-actions' },
        h('a', { class: 'btn btn-primary', href: whatsappUrl(fmt(s.shareText, { q: l(poll.question), url })), target: '_blank', rel: 'noopener noreferrer' }, svg(ICON.whatsapp), s.share),
        h('button', { class: 'btn btn-outline', type: 'button', onclick: async () => { toast((await copyText(url)) ? S().results.copied : url); } }, svg(ICON.link), S().results.copyLink)));
    };
    if (mine) showResults();

    let past: Poll[] = [];
    try { past = await storage.getPastPolls(5); } catch (e) { console.warn(e); }
    if (!alive || !past.length) return;
    const sec = h('section', { class: 'section' }, h('h2', null, s.past));
    for (const p of past) sec.append(pastCard(p));
    body.append(sec);
  })();

  function pastCard(p: Poll): HTMLElement {
    const top = h('p', { class: 'small', style: 'margin-top:6px;color:var(--ultra-text);font-weight:600' });
    const card = h('div', { class: 'card', style: 'margin-top:10px' }, h('p', { class: 'muted small' }, fmt(s.week, { w: p.week })), h('p', { style: 'font-weight:600;margin-top:4px' }, l(p.question)), top);
    const off = storage.subscribePollResults(p.id, (r) => {
      const best = p.options.map((o) => ({ o, n: r.counts[o.id] ?? 0 })).sort((a, b) => b.n - a.n)[0];
      top.textContent = best && r.total ? `${l(best.o.label)} · ${pct(best.n, r.total)} %  (${fmt(s.answers, { n: fmtNumber(r.total) })})` : fmt(s.answers, { n: 0 });
      off();
    });
    return card;
  }

  return () => { alive = false; subs.forEach((f) => f()); };
}
