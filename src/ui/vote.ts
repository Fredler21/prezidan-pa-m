import type { DepartmentId, Vote } from '../types';
import { h, svg, clear } from '../lib/dom';
import { ICON } from '../lib/icons';
import { S, fmt, l, getLang } from '../i18n';
import { cleanReason, REASON_MAX } from '../lib/util';
import { state, setMyVote } from '../state';
import { getStorage } from '../storage';
import { content, candidateById, candidatesShuffled } from '../content';
import { go } from '../router';
import { avatar, note, footer, rail } from './common';
import { toast } from './toast';

const INITIAL_ROWS = 7;

export function renderVote(main: HTMLElement, preset: string | null): void {
  clear(main);
  const s = S().vote;
  const page = h('div', { class: 'wrap' }, rail('vote'));
  main.append(page);

  let selected: string | null = preset && candidateById(preset) ? preset : state.myVote?.candidate ?? null;
  let expanded = Boolean(preset);
  let filter = '';

  page.append(h('h1', { class: 'page-title', style: 'margin-top:8px' }, s.heading), h('p', { class: 'lead' }, s.sub));
  const already = h('div');
  page.append(already);

  const search = h('input', { class: 'input', type: 'search', placeholder: s.search, 'aria-label': s.search, oninput: (e: Event) => { filter = (e.target as HTMLInputElement).value.trim().toLowerCase(); expanded = true; renderList(); } });
  const list = h('div', { class: 'card pick-list', role: 'radiogroup', 'aria-label': s.heading });
  const col = h('div', { class: 'main-col' }, h('div', { class: 'search' }, svg(ICON.search), search), list);

  const renderList = () => {
    clear(list);
    const matches = candidatesShuffled().filter((c) => !filter || `${c.name} ${c.party} ${c.partyFull}`.toLowerCase().includes(filter));
    // The current choice always stays visible, so collapsing never hides it.
    let shown = expanded ? matches : matches.slice(0, INITIAL_ROWS);
    if (!expanded && selected && !shown.some((c) => c.id === selected)) {
      const sel = matches.find((c) => c.id === selected);
      if (sel) shown = [sel, ...shown.slice(0, INITIAL_ROWS - 1)];
    }
    for (const c of shown) {
      const input = h('input', { class: 'sr', type: 'radio', name: 'kandida', value: c.id });
      input.checked = selected === c.id;
      input.addEventListener('change', () => { selected = c.id; });
      list.append(h('label', { class: 'pick' }, avatar(c),
        h('span', { class: 'cand-name' }, h('strong', null, c.name), h('span', { class: 'party' }, c.party)),
        input, h('span', { class: 'radio', 'aria-hidden': 'true' })));
    }
    if (!expanded && matches.length > shown.length) {
      list.append(h('button', { class: 'more', type: 'button', onclick: () => { expanded = true; renderList(); } }, fmt(s.more, { n: matches.length - shown.length }), svg(ICON.expand)));
    }
  };

  const counter = h('span', { class: 'cnt' }, `0 / ${REASON_MAX}`);
  const reason = h('textarea', { class: 'textarea', maxlength: REASON_MAX, placeholder: s.reasonPlaceholder, id: 'reason', oninput: () => { counter.textContent = `${reason.value.length} / ${REASON_MAX}`; } });
  const dept = h('select', { class: 'select', id: 'dept' }, ...content().departments.map((d) => h('option', { value: d.id }, l(d.label))));
  dept.value = state.myVote?.department ?? 'na';
  if (state.myVote) { reason.value = state.myVote.reason; counter.textContent = `${reason.value.length} / ${REASON_MAX}`; }

  // Two submit buttons share one handler: the phone's bottom bar and the desktop sidebar.
  const submits: HTMLButtonElement[] = [];
  const submitButton = () => {
    const b = h('button', { class: 'btn btn-vote btn-block', type: 'button' }, svg(ICON.ballot), state.myVote ? s.update : s.submit);
    b.addEventListener('click', () => void onSubmit());
    submits.push(b);
    return b;
  };

  const aside = h('aside', { class: 'side-col' },
    h('div', { class: 'card', style: 'margin-top:24px' }, h('label', { class: 'field-label', for: 'reason' }, s.why, h('span', { class: 'optional' }, s.optional), counter), reason),
    h('div', { class: 'card', style: 'margin-top:12px' }, h('label', { class: 'field-label', for: 'dept' }, s.department, h('span', { class: 'optional' }, s.optional)), dept, h('p', { class: 'hint' }, s.departmentHint)),
    h('div', { style: 'margin-top:12px' }, note(s.privacy, ICON.lock)),
    h('div', { class: 'desk-only', style: 'margin-top:16px' }, submitButton()));

  page.append(h('div', { class: 'layout-2 wide-side' }, col, aside), h('div', { id: 'recaptcha' }), footer());

  const bottom = document.getElementById('bottom');
  if (bottom) { clear(bottom); bottom.append(h('div', { class: 'bar-row' }, submitButton())); }

  const syncAlready = () => {
    clear(already);
    const v = state.myVote;
    const c = v ? candidateById(v.candidate) : undefined;
    if (c) already.append(h('div', { style: 'margin-top:16px' }, note(fmt(s.already, { name: c.name }), ICON.check)));
  };
  syncAlready();
  renderList();

  async function onSubmit(): Promise<void> {
    if (!selected) { toast(s.selectFirst); return; }
    const candidate = candidateById(selected);
    if (!candidate) { toast(s.selectFirst); return; }
    const vote: Vote = { candidate: candidate.id, reason: cleanReason(reason.value), department: dept.value as DepartmentId, priorities: state.picks.slice(0, 3), lang: getLang() };
    submits.forEach((b) => { b.disabled = true; });
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
    } finally { submits.forEach((b) => { b.disabled = false; }); }
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
      h('button', { class: 'sheet-close', type: 'button', 'aria-label': S().close, onclick: () => dlg.close() }, svg(ICON.close)),
      h('div', { class: 'sheet-body' }, h('div', { class: 'handle' }), h('h3', null, s.title), h('p', { class: 'lead' }, s.sub), h('div', { style: 'margin-top:16px' }, phone, code, err, btn)));
    dlg.addEventListener('close', () => { dlg.remove(); resolve(done); });
    document.body.append(dlg);
    dlg.showModal();
  });
}
