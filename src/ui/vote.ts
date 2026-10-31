import type { Candidate, DepartmentId, Vote } from '../types';
import { h, svg, clear } from '../lib/dom';
import { ICON } from '../lib/icons';
import { S, fmt, l, getLang } from '../i18n';
import { DEPARTMENTS } from '../data/departments';
import { CANDIDATE_BY_ID } from '../data/candidates';
import { cleanReason, REASON_MAX } from '../lib/util';
import { state, setMyVote } from '../state';
import { getStorage } from '../storage';
import { go } from '../router';
import { CANDIDATES_SHUFFLED, candidateCard, note, footer } from './common';
import { toast } from './toast';

const INITIAL_ROWS = 7;

export function renderVote(main: HTMLElement, preset: string | null): void {
  clear(main);
  const s = S().vote;
  const page = h('div', { class: 'wrap page' });
  main.append(page);

  let selected: string | null = preset && CANDIDATE_BY_ID.has(preset) ? preset : state.myVote?.candidate ?? null;
  let expanded = Boolean(preset);
  let filter = '';

  page.append(h('h1', null, s.heading), h('p', { class: 'lead' }, s.sub));
  const already = h('div', { style: 'margin-top:12px' });
  page.append(already);

  const search = h('input', { class: 'input', type: 'search', placeholder: s.search, 'aria-label': s.search, oninput: (e: Event) => { filter = (e.target as HTMLInputElement).value.trim().toLowerCase(); expanded = true; renderList(); } });
  page.append(h('div', { class: 'search' }, svg(ICON.search), search));

  const list = h('div', { class: 'stack', role: 'radiogroup', 'aria-label': s.heading });
  page.append(list);

  const renderList = () => {
    clear(list);
    const matches = CANDIDATES_SHUFFLED.filter((c) => !filter || `${c.name} ${c.party} ${c.partyFull}`.toLowerCase().includes(filter));
    const shown = expanded ? matches : matches.slice(0, INITIAL_ROWS);
    for (const c of shown) list.append(candidateCard(c, { radio: true, selected: selected === c.id, onClick: () => { selected = c.id; renderList(); } }));
    if (!expanded && matches.length > shown.length) {
      list.append(h('button', { class: 'more', type: 'button', onclick: () => { expanded = true; renderList(); } }, fmt(s.more, { n: matches.length - shown.length })));
    }
  };

  const counter = h('span', { class: 'cnt' }, `0 / ${REASON_MAX}`);
  const reason = h('textarea', { class: 'textarea', maxlength: REASON_MAX, placeholder: s.reasonPlaceholder, id: 'reason', oninput: () => { counter.textContent = `${reason.value.length} / ${REASON_MAX}`; } });
  const dept = h('select', { class: 'select', id: 'dept' }, ...DEPARTMENTS.map((d) => h('option', { value: d.id }, l(d.label))));
  dept.value = state.myVote?.department ?? 'na';
  if (state.myVote) { reason.value = state.myVote.reason; counter.textContent = `${reason.value.length} / ${REASON_MAX}`; }

  const submit = h('button', { class: 'btn btn-vote btn-block', type: 'button' }, state.myVote ? s.update : s.submit);
  submit.addEventListener('click', () => void onSubmit());

  page.append(
    h('div', { class: 'card field', style: 'margin-top:18px' }, h('label', { for: 'reason' }, s.why, h('span', { class: 'optional' }, s.optional), counter), reason),
    h('div', { class: 'card field' }, h('label', { for: 'dept' }, s.department, h('span', { class: 'optional' }, s.optional)), dept, h('p', { class: 'hint' }, s.departmentHint)),
    h('div', { style: 'margin-top:14px' }, note(s.privacy, ICON.lock)),
    h('div', { style: 'margin-top:18px' }, submit),
    h('div', { id: 'recaptcha' }),
    footer(),
  );

  const syncAlready = () => {
    clear(already);
    const v = state.myVote;
    if (v) { const c = CANDIDATE_BY_ID.get(v.candidate); if (c) already.append(note(fmt(s.already, { name: c.name }), ICON.check)); }
  };
  syncAlready();
  renderList();

  async function onSubmit(): Promise<void> {
    if (!selected) { toast(s.selectFirst); return; }
    const candidate = CANDIDATE_BY_ID.get(selected) as Candidate;
    const vote: Vote = { candidate: candidate.id, reason: cleanReason(reason.value), department: dept.value as DepartmentId, priorities: state.picks.slice(0, 3), lang: getLang() };
    submit.disabled = true;
    try {
      const storage = await getStorage();
      try { await storage.ready(); }
      catch (e) {
        if ((e as Error).message === 'needs-phone') { const ok = await phoneDialog(); if (!ok) return; await storage.ready(); }
        else throw e;
      }
      const wasVote = Boolean(state.myVote);
      await storage.saveVote(vote);
      setMyVote(vote);
      toast(wasVote ? s.changed : s.saved);
      go('results');
    } catch (e) {
      console.error(e);
      const code = String((e as { code?: string }).code ?? '');
      toast(code.includes('auth') || code.includes('operation-not-allowed') || code.includes('permission') ? s.errorAuth : s.errorSave, 5000);
    } finally { submit.disabled = false; }
  }
}

/** Phone OTP sheet (VITE_AUTH=phone). Resolves true when the code is confirmed. */
async function phoneDialog(): Promise<boolean> {
  const { startPhoneVerification, confirmPhoneCode } = await import('../storage/auth');
  const s = S().phone;
  return new Promise((resolve) => {
    let done = false;
    const phone = h('input', { class: 'input', type: 'tel', placeholder: s.placeholder, autocomplete: 'tel', inputmode: 'tel' });
    const code = h('input', { class: 'input', type: 'text', placeholder: s.code, inputmode: 'numeric', autocomplete: 'one-time-code', maxlength: 6, style: 'display:none;margin-top:10px' });
    const btn = h('button', { class: 'btn btn-primary btn-block', type: 'button', style: 'margin-top:14px' }, s.send);
    const err = h('p', { class: 'hint', style: 'color:var(--red)' });
    let step: 'phone' | 'code' = 'phone';
    btn.addEventListener('click', async () => {
      btn.disabled = true; err.textContent = '';
      try {
        if (step === 'phone') { await startPhoneVerification(phone.value.trim(), 'recaptcha'); step = 'code'; code.style.display = ''; btn.textContent = s.verify; code.focus(); }
        else { await confirmPhoneCode(code.value.trim()); done = true; dlg.close(); }
      } catch (e) { console.error(e); err.textContent = s.error; }
      finally { btn.disabled = false; }
    });
    const dlg = h('dialog', { class: 'sheet', 'aria-label': s.title },
      h('button', { class: 'iconbtn close', type: 'button', 'aria-label': S().close, html: ICON.close, onclick: () => dlg.close() }),
      h('div', { class: 'sheet-body' }, h('div', { class: 'handle' }), h('h3', null, s.title), h('p', { class: 'muted' }, s.sub), h('div', { class: 'field' }, phone, code, err, btn)));
    dlg.addEventListener('close', () => { dlg.remove(); resolve(done); });
    document.body.append(dlg);
    dlg.showModal();
  });
}
