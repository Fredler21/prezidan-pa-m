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
  const body = h('div');
  page.append(body, footer());
  const subs: (() => void)[] = [];
  let alive = true;
  let storage: StorageAdapter;

  void (async () => {
    storage = await getStorage();
    let poll: Poll | null = null;
    try { poll = await storage.getActivePoll(); }
    catch (e) { console.error(e); if (alive) body.append(h('p', { class: 'lead', style: 'margin-top:0' }, s.sub), h('div', { style: 'margin-top:16px' }, note(S().offline))); return; }
    if (!alive) return;
    if (!poll) { body.append(h('p', { class: 'lead', style: 'margin-top:0' }, s.sub), h('div', { style: 'margin-top:16px' }, note(s.none))); return; }
    const p = poll;
    body.append(h('span', { class: 'week' }, fmt(s.week, { w: p.week })), h('h1', { class: 'page-title desk-only', style: 'margin-top:12px' }, s.title), h('p', { class: 'lead' }, s.sub));

    let mine = await storage.getMyPollAnswer(p.id);
    let selected = mine;
    const options = h('div', { role: 'radiogroup', 'aria-label': l(p.question) });
    const submit = h('button', { class: 'btn btn-primary btn-block', type: 'button', style: 'margin-top:16px' }, svg(ICON.check), mine ? s.update : s.submit);
    const results = h('aside', { class: 'side-col' });

    const drawOptions = () => {
      clear(options);
      for (const o of p.options) options.append(h('button', { class: 'opt', type: 'button', role: 'radio', 'aria-checked': String(selected === o.id), 'aria-pressed': String(selected === o.id), onclick: () => { selected = o.id; drawOptions(); } }, h('span', { class: 'radio', 'aria-hidden': 'true' }), h('span', null, l(o.label))));
    };
    drawOptions();

    submit.addEventListener('click', async () => {
      if (!selected) { toast(s.selectFirst); return; }
      submit.disabled = true;
      try { await storage.ready(); await storage.savePollAnswer(p.id, selected); mine = selected; toast(s.saved); showResults(); }
      catch (e) { console.error(e); toast(S().vote.errorSave, 5000); }
      finally { submit.disabled = false; }
    });

    const question = h('div', { class: 'main-col' }, h('div', { class: 'card roomy', style: 'margin-top:16px' }, h('h2', { class: 'question' }, l(p.question)), options, submit));
    body.append(h('div', { class: 'layout-2 wide-side' }, question, results));

    const showResults = () => {
      if (results.childElementCount) return;
      const total = h('span', { class: 'sec-meta num' });
      const bars = h('div', { class: 'grow' });
      results.append(h('section', { class: 'section' },
        h('div', { class: 'sec-row' }, h('h2', null, s.resultsNow), total),
        h('div', { class: 'card roomy' }, bars, h('hr', { class: 'hr' }), note(s.note, ICON.info, false))));
      let first = true;
      subs.push(storage.subscribePollResults(p.id, (r: PollResults) => {
        total.textContent = fmt(s.answers, { n: fmtNumber(r.total) });
        if (!first) bars.classList.remove('grow');
        first = false;
        clear(bars);
        for (const o of p.options) {
          const v = pct(r.counts[o.id] ?? 0, r.total);
          bars.append(h('div', { class: 'prow' },
            h('div', { class: 'prow-head' }, h('span', null, l(o.label), ' ', mine === o.id ? h('span', { class: 'pill-you' }, svg(ICON.check), S().results.yourChoice) : null), h('b', null, `${v} %`)),
            h('div', { class: 'bar thick' }, h('i', { class: v ? 'on' : '', style: `width:${v}%` }))));
        }
      }));
      const url = siteUrl('poll');
      results.append(h('div', { class: 'share' },
        h('a', { class: 'btn btn-primary', href: whatsappUrl(fmt(s.shareText, { q: l(p.question), url })), target: '_blank', rel: 'noopener noreferrer' }, svg(ICON.whatsapp), s.share),
        h('button', { class: 'btn btn-outline', type: 'button', onclick: async () => { toast((await copyText(url)) ? S().results.copied : url); } }, svg(ICON.link), S().results.copyLink)));
    };
    if (mine) showResults();

    let past: Poll[] = [];
    try { past = await storage.getPastPolls(5); } catch (e) { console.warn(e); }
    if (!alive || !past.length) return;
    const sec = h('section', { class: 'section' }, h('h2', null, s.past));
    const stack = h('div', { class: 'stack cards-2' });
    for (const q of past) stack.append(pastCard(q));
    sec.append(stack);
    body.append(sec);
  })();

  function pastCard(p: Poll): HTMLElement {
    const answer = h('b');
    const count = h('span', { class: 'caption num', style: 'margin-top:0' });
    const card = h('div', { class: 'card' },
      h('p', { class: 'caption num', style: 'margin-top:0' }, fmt(s.week, { w: p.week })),
      h('p', { class: 'past-q' }, l(p.question)),
      h('div', { class: 'past-a' }, answer, count));
    const off = storage.subscribePollResults(p.id, (r) => {
      const best = p.options.map((o) => ({ o, n: r.counts[o.id] ?? 0 })).sort((a, b) => b.n - a.n)[0];
      answer.textContent = best && r.total ? `${l(best.o.label)} · ${pct(best.n, r.total)} %` : '';
      count.textContent = fmt(s.answers, { n: fmtNumber(r.total) });
      off();
    });
    return card;
  }

  return () => { alive = false; subs.forEach((f) => f()); };
}
