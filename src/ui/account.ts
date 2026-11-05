import { h, svg } from '../lib/dom';
import { ICON } from '../lib/icons';
import { S } from '../i18n';
import { STORAGE_MODE } from '../storage';
import { getAccount, onAccountChange, connect, disconnect, type Account, prepareConnect, isConnectReady } from '../account';
import { note } from './common';
import { toast } from './toast';
import { copyText } from '../lib/util';

let open: HTMLDialogElement | null = null;
type Mode = 'in' | 'up';

const initial = (a: Account) => (a.name || a.email || '·').slice(0, 1).toUpperCase();

/**
 * Header account controls (Stitch « s9-account » v2): « Konekte » and « Kreye kont » when signed
 * out, the visitor's initial when signed in. Redraws itself on sign in or out, and stops listening
 * once the header has been replaced.
 */
export function accountControls(onDraw?: () => void): HTMLElement {
  const el = h('div', { class: 'acct-ctl' });
  const draw = (a: Account | null) => {
    if (a) el.replaceChildren(h('button', { class: 'acct-btn on', type: 'button', 'aria-label': S().account.open, onclick: () => openAccountSheet() }, initial(a)));
    else el.replaceChildren(
      h('button', { class: 'btn acct-in', type: 'button', onclick: () => openAccountSheet('in') }, svg(ICON.login), S().account.signIn),
      h('button', { class: 'btn acct-up', type: 'button', onclick: () => openAccountSheet('up') }, S().account.signUp));
  };
  draw(getAccount());
  const off = onAccountChange((a) => { if (!el.isConnected) { off(); return; } draw(a); onDraw?.(); });
  return el;
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
  // Browsers without <dialog> support get the same cleanup through a synthetic close event.
  if (typeof d.close === 'function' && d.open) d.close(); else d.dispatchEvent(new Event('close'));
}

/** The account dialog: sign in or create an account (opened on either tab), or the signed-in view. */
export function openAccountSheet(start: Mode = 'in'): void {
  closeAccountSheet();
  const s = S().account;
  const body = h('div', { class: 'sheet-body auth' }, h('div', { class: 'handle', 'aria-hidden': 'true' }));
  const dlg = h('dialog', { class: 'sheet narrow', 'aria-label': s.title },
    h('button', { class: 'sheet-close', type: 'button', 'aria-label': S().close, onclick: () => closeAccountSheet() }, svg(ICON.close)), body);

  const render = () => {
    while (body.childElementCount > 1) body.lastElementChild?.remove();
    const a = getAccount();
    if (STORAGE_MODE !== 'firebase') {
      body.append(h('div', { class: 'auth-brand', 'aria-hidden': 'true' }, svg(ICON.brand)), h('h3', { class: 'auth-title' }, s.title), h('p', { class: 'auth-lead' }, s.lead), h('div', { style: 'margin-top:16px' }, note(S().demoMode)));
      return;
    }
    if (a) {
      body.append(
        h('div', { class: 'auth-avatar', 'aria-hidden': 'true' }, initial(a)),
        h('h3', { class: 'auth-title' }, a.name || a.email),
        ...(a.email && a.name ? [h('p', { class: 'auth-lead' }, a.email)] : []),
        h('div', { style: 'margin-top:16px' }, note(s.progressSaved, ICON.check)),
        h('a', { class: 'btn btn-primary btn-block auth-main', href: '#home', onclick: () => closeAccountSheet() }, s.myDashboard, svg(ICON.arrowRight)),
        h('button', { class: 'btn btn-outline btn-block auth-out', type: 'button', onclick: async () => { await disconnect(); toast(s.disconnected); render(); } }, s.signOut));
      return;
    }

    let mode: Mode = start;
    const title = h('h3', { class: 'auth-title' });
    const tabIn = h('button', { type: 'button', role: 'tab' }, s.signIn);
    const tabUp = h('button', { type: 'button', role: 'tab' }, s.signUp);
    const submitLabel = h('span');
    const submit = h('button', { class: 'btn btn-primary btn-block auth-main', type: 'submit' }, submitLabel, svg(ICON.arrowRight));
    const email = h('input', { class: 'input', type: 'email', autocomplete: 'email', placeholder: s.emailPlaceholder, required: true, id: 'acct-email' });
    const password = h('input', { class: 'input', type: 'password', autocomplete: 'current-password', minlength: 6, required: true, id: 'acct-password' });
    const forgotRow = h('div', { class: 'auth-forgot' });
    const setMode = (m: Mode) => {
      mode = m;
      tabIn.setAttribute('aria-selected', String(m === 'in')); tabIn.setAttribute('aria-pressed', String(m === 'in'));
      tabUp.setAttribute('aria-selected', String(m === 'up')); tabUp.setAttribute('aria-pressed', String(m === 'up'));
      title.textContent = m === 'in' ? s.welcome : s.welcomeUp;
      submitLabel.textContent = m === 'in' ? s.signIn : s.signUp;
      password.autocomplete = m === 'in' ? 'current-password' : 'new-password';
      forgotRow.hidden = m === 'up';
    };
    tabIn.addEventListener('click', () => setMode('in'));
    tabUp.addEventListener('click', () => setMode('up'));

    const eye = h('button', { class: 'eye', type: 'button', 'aria-label': s.showPassword, onclick: () => { const show = password.type === 'password'; password.type = show ? 'text' : 'password'; eye.replaceChildren(svg(show ? ICON.eyeOff : ICON.eye)); } }, svg(ICON.eye));
    const google = h('button', { class: 'btn btn-google btn-block', type: 'button' }, svg(ICON.google), s.google);
    const busy = (on: boolean) => { submit.disabled = on; google.disabled = on; };
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
    forgotRow.append(h('button', { class: 'link-btn', type: 'button', onclick: async () => {
      if (!email.value.trim()) { toast(s.errInvalid); return; }
      try { const auth = await import('../storage/auth'); await auth.resetPassword(email.value.trim()); toast(s.resetSent, 5000); }
      catch (e) { console.error(e); toast(errorMessage(e), 5000); }
    } }, s.forgot));
    form.append(
      h('div', { class: 'field' }, h('label', { class: 'field-label', for: 'acct-email' }, s.email), h('div', { class: 'input-icon' }, svg(ICON.mail), email)),
      h('div', { class: 'field', style: 'margin-top:14px' }, h('label', { class: 'field-label', for: 'acct-password' }, s.password), h('div', { class: 'pw-wrap input-icon' }, svg(ICON.lock), password, eye)),
      forgotRow,
      submit);

    // Google refuses sign-in inside app browsers (WhatsApp, Facebook, Instagram, TikTok...): say so and offer the way out.
    const inApp = /FBAN|FBAV|FB_IAB|Instagram|Line\/|WhatsApp|Snapchat|TikTok|musical_ly|; wv\)/i.test(navigator.userAgent);
    const inAppNote = inApp ? h('div', { class: 'inapp-note' }, note(s.inApp, ICON.info, false),
      h('button', { class: 'link-btn', type: 'button', onclick: async () => { toast((await copyText(location.origin + '/')) ? s.linkCopied : location.origin, 4000); } }, svg(ICON.link), s.copySiteLink)) : null;
    const legalLink = (href: string, label: string) => h('a', { href, onclick: () => closeAccountSheet() }, label);
    body.append(
      h('div', { class: 'auth-brand', 'aria-hidden': 'true' }, svg(ICON.brand)), title,
      h('p', { class: 'auth-lead' }, s.welcomeLead),
      h('div', { class: 'seg', role: 'tablist' }, tabIn, tabUp),
      google, ...(inAppNote ? [inAppNote] : []),
      h('div', { class: 'divider' }, s.or),
      form,
      h('ul', { class: 'auth-perks' }, ...[s.perk1, s.perk2, s.perk3].map((p) => h('li', null, svg(ICON.check), p))),
      h('p', { class: 'auth-legal' }, `${s.legalPre} `, legalLink('#terms', S().nav.terms), ` ${s.legalAnd} `, legalLink('#privacy', S().nav.privacy), '.'));
    setMode(start);
  };
  render();

  // Phones: the dialog fills the part of the screen above the keyboard, and the field being typed in stays in view.
  const vv = window.visualViewport;
  const fitViewport = () => {
    if (!vv) return;
    dlg.style.setProperty('--vvh', `${Math.round(vv.height)}px`); dlg.style.setProperty('--vvt', `${Math.round(vv.offsetTop)}px`);
    const f = document.activeElement;
    if (f instanceof HTMLInputElement && dlg.contains(f)) f.scrollIntoView({ block: 'center' });
  };
  vv?.addEventListener('resize', fitViewport);
  vv?.addEventListener('scroll', fitViewport);
  fitViewport();
  body.addEventListener('focusin', (e) => {
    const t = e.target;
    // once now, and again after the keyboard has finished opening
    if (t instanceof HTMLInputElement) for (const ms of [50, 400]) window.setTimeout(() => { if (document.activeElement === t) t.scrollIntoView({ block: 'center' }); }, ms);
  });

  dlg.addEventListener('click', (e) => { if (e.target === dlg) closeAccountSheet(); });
  dlg.addEventListener('close', () => { vv?.removeEventListener('resize', fitViewport); vv?.removeEventListener('scroll', fitViewport); dlg.remove(); if (open === dlg) open = null; });
  document.body.append(dlg);
  open = dlg;
  if (typeof dlg.showModal === 'function') dlg.showModal(); else dlg.setAttribute('open', '');
}

