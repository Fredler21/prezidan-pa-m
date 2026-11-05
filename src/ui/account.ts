import { h, svg } from '../lib/dom';
import { ICON } from '../lib/icons';
import { S, fmt } from '../i18n';
import { STORAGE_MODE } from '../storage';
import { getAccount, onAccountChange, connect, disconnect, type Account, prepareConnect, isConnectReady } from '../account';
import { note } from './common';
import { toast } from './toast';
import { copyText } from '../lib/util';

let open: HTMLDialogElement | null = null;

/** Header button: a person icon, or the signed-in visitor's initial. */
export function accountButton(): HTMLElement {
  const btn = h('button', { class: 'acct-btn', type: 'button', 'aria-label': S().account.open, onclick: () => openAccountSheet() });
  const draw = (a: Account | null) => {
    btn.textContent = '';
    if (a) { btn.append(a.name ? a.name.slice(0, 1).toUpperCase() : svg(ICON.person)); btn.classList.add('on'); }
    else { btn.append(svg(ICON.person)); btn.classList.remove('on'); }
  };
  draw(getAccount());
  onAccountChange(draw);
  return btn;
}

function errorMessage(e: unknown): string {
  const s = S().account;
  const code = String((e as { code?: string }).code ?? '');
  if (code.includes('invalid-credential') || code.includes('wrong-password') || code.includes('user-not-found') || code.includes('invalid-email')) return s.errInvalid;
  if (code.includes('email-already-in-use') || code.includes('credential-already-in-use')) return s.errInUse;
  if (code.includes('weak-password')) return s.errWeak;
  if (code.includes('unauthorized-domain')) return s.errDomain;
  if (code.includes('operation-not-allowed')) return s.errNotEnabled;
  if (code.includes('popup-blocked')) return s.errPopup;
  if (code.includes('network-request-failed')) return S().offline;
  if (code.includes('popup-closed') || code.includes('cancelled')) return s.errCancelled;
  return s.errGeneric;
}

export function closeAccountSheet(): void {
  if (!open) return;
  const d = open; open = null;
  if (d.open) d.close(); else d.remove();
}

/** The account sheet: sign in or create an account, or sign out when already connected. */
export function openAccountSheet(): void {
  closeAccountSheet();
  const s = S().account;
  const body = h('div', { class: 'sheet-body auth' }, h('div', { class: 'handle', 'aria-hidden': 'true' }));
  const dlg = h('dialog', { class: 'sheet narrow', 'aria-label': s.title },
    h('button', { class: 'sheet-close', type: 'button', 'aria-label': S().close, onclick: () => closeAccountSheet() }, svg(ICON.close)), body);

  const render = () => {
    while (body.childElementCount > 1) body.lastElementChild?.remove();
    const a = getAccount();
    body.append(h('div', { class: 'well auth-well', 'aria-hidden': 'true' }, svg(ICON.person)), h('h3', { class: 'auth-title' }, s.title));
    if (STORAGE_MODE !== 'firebase') { body.append(h('p', { class: 'lead auth-lead' }, s.lead), h('div', { style: 'margin-top:16px' }, note(S().demoMode))); return; }
    if (a) {
      body.append(h('p', { class: 'lead auth-lead' }, fmt(s.signedInAs, { name: a.name || a.email })));
      if (a.email) body.append(h('p', { class: 'caption', style: 'text-align:center;margin-top:4px' }, a.email));
      body.append(
        h('div', { style: 'margin-top:16px' }, note(s.progressSaved, ICON.check)),
        h('button', { class: 'btn btn-outline btn-block', type: 'button', style: 'margin-top:16px', onclick: async () => { await disconnect(); toast(s.disconnected); render(); } }, s.signOut));
      return;
    }
    let mode: 'in' | 'up' = 'in';
    const tabIn = h('button', { type: 'button', 'aria-pressed': 'true' }, s.signIn);
    const tabUp = h('button', { type: 'button', 'aria-pressed': 'false' }, s.signUp);
    const submit = h('button', { class: 'btn btn-primary btn-block', type: 'submit' }, svg(ICON.login), s.signIn);
    const setMode = (m: 'in' | 'up') => { mode = m; tabIn.setAttribute('aria-pressed', String(m === 'in')); tabUp.setAttribute('aria-pressed', String(m === 'up')); submit.lastChild!.textContent = m === 'in' ? s.signIn : s.signUp; };
    tabIn.addEventListener('click', () => setMode('in'));
    tabUp.addEventListener('click', () => setMode('up'));

    const email = h('input', { class: 'input', type: 'email', autocomplete: 'email', placeholder: s.emailPlaceholder, required: true, id: 'acct-email' });
    const password = h('input', { class: 'input', type: 'password', autocomplete: 'current-password', minlength: 6, required: true, id: 'acct-password' });
    const eye = h('button', { class: 'eye', type: 'button', 'aria-label': s.showPassword, onclick: () => { const show = password.type === 'password'; password.type = show ? 'text' : 'password'; eye.textContent = ''; eye.append(svg(show ? ICON.eyeOff : ICON.eye)); } }, svg(ICON.eye));
    const busy = (on: boolean) => { submit.disabled = on; google.disabled = on; };

    const google = h('button', { class: 'btn btn-google btn-block', type: 'button' }, svg(ICON.google), s.google);
    // Until Firebase Auth has loaded, a tap could not open the Google window in time: wait for it.
    if (!isConnectReady()) {
      google.disabled = true; google.classList.add('is-loading'); google.setAttribute('aria-busy', 'true');
      void prepareConnect().catch((e) => console.warn('auth preload failed', e)).finally(() => { google.disabled = false; google.classList.remove('is-loading'); google.removeAttribute('aria-busy'); });
    }
    google.addEventListener('click', async () => {
      busy(true);
      try { await connect({ kind: 'google' }); toast(s.connected); render(); }
      catch (e) { console.error(e); toast(errorMessage(e), 5000); }
      finally { busy(false); }
    });

    const form = h('form', { class: 'auth-form', novalidate: true });
    form.addEventListener('submit', async (ev) => {
      ev.preventDefault();
      if (!email.value.trim() || password.value.length < 6) { toast(mode === 'up' ? s.errWeak : s.errInvalid); return; }
      busy(true);
      try { await connect({ kind: 'email', mode, email: email.value.trim(), password: password.value }); toast(s.connected); render(); }
      catch (e) { console.error(e); toast(errorMessage(e), 5000); }
      finally { busy(false); }
    });
    const forgot = h('button', { class: 'link-btn', type: 'button', style: 'min-height:auto;font-size:14px', onclick: async () => {
      if (!email.value.trim()) { toast(s.errInvalid); return; }
      try { const auth = await import('../storage/auth'); await auth.resetPassword(email.value.trim()); toast(s.resetSent, 5000); }
      catch (e) { console.error(e); toast(errorMessage(e), 5000); }
    } }, s.forgot);

    form.append(
      h('div', { class: 'seg', role: 'tablist' }, tabIn, tabUp),
      h('div', { class: 'field', style: 'margin-top:16px' }, h('label', { class: 'field-label', for: 'acct-email' }, s.email), email),
      h('div', { class: 'field', style: 'margin-top:12px' }, h('label', { class: 'field-label', for: 'acct-password' }, s.password), h('div', { class: 'pw-wrap' }, password, eye)),
      h('div', { style: 'text-align:right;margin-top:6px' }, forgot),
      h('div', { style: 'margin-top:16px' }, submit));

    // Google refuses sign-in inside app browsers (WhatsApp, Facebook, Instagram, TikTok...): say so and offer the way out.
    const inApp = /FBAN|FBAV|FB_IAB|Instagram|Line\/|WhatsApp|Snapchat|TikTok|musical_ly|; wv\)/i.test(navigator.userAgent);
    const inAppNote = inApp ? h('div', { class: 'inapp-note' }, note(s.inApp, ICON.info, false),
      h('button', { class: 'link-btn', type: 'button', onclick: async () => { toast((await copyText(location.origin + '/')) ? s.linkCopied : location.origin, 4000); } }, svg(ICON.link), s.copySiteLink)) : null;
    body.append(h('p', { class: 'lead auth-lead' }, s.lead), h('div', { style: 'margin-top:20px' }, google, inAppNote), h('div', { class: 'divider' }, s.or), form,
      h('p', { class: 'caption', style: 'text-align:center;margin-top:16px' }, s.caption));
  };
  render();

  dlg.addEventListener('click', (e) => { if (e.target === dlg) closeAccountSheet(); });
  dlg.addEventListener('close', () => { dlg.remove(); if (open === dlg) open = null; });
  document.body.append(dlg);
  open = dlg;
  if (typeof dlg.showModal === 'function') dlg.showModal(); else dlg.setAttribute('open', '');
}
