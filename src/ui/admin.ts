import { h, clear } from '../lib/dom';
import { S, fmt, fmtDate } from '../i18n';
import type { Lang, L10n } from '../types';
import { isoWeek } from '../lib/util';
import { STORAGE_MODE } from '../storage';
import { BUNDLED, content, refreshContent, toDocs } from '../content';
import { note } from './common';
import { toast } from './toast';

const ADMIN_EMAILS = ['pierrelouisfredler@gmail.com', 'fredler.pierre-louis@edlight.org'];

/** #admin: publish the candidate content to Firestore, post the weekly poll, see the accounts. Firestore rules enforce the allowlist. */
export function renderAdmin(main: HTMLElement): void {
  clear(main);
  const s = S().admin;
  const page = h('div', { class: 'wrap page' });
  main.append(page);
  page.append(h('h1', { class: 'page-title' }, s.title));
  if (STORAGE_MODE !== 'firebase') { page.append(h('div', { style: 'margin-top:12px' }, note(S().demoMode))); return; }

  const box = h('div', { style: 'margin-top:16px' });
  page.append(box);

  void (async () => {
    const auth = await import('../storage/auth');
    const fs = await import('firebase/firestore');
    const db = fs.getFirestore(auth.app());

    const contentCard = (email: string): HTMLElement => {
      const state = h('p', { class: 'caption num' });
      const showState = () => {
        const c = content();
        state.textContent = fmt(s.contentState, { source: c.source === 'firestore' ? s.sourceFirestore : s.sourceBundled, v: c.version });
      };
      showState();
      const publish = h('button', { class: 'btn btn-primary btn-block', type: 'button', style: 'margin-top:16px' }, s.publishContent);
      const refresh = h('button', { class: 'btn btn-outline btn-block', type: 'button', style: 'margin-top:10px' }, s.refresh);

      publish.addEventListener('click', async () => {
        publish.disabled = true;
        try {
          // One batch (max 500 writes): 19 candidates + 12 priorities + 12 departments + meta.
          const docs = toDocs(BUNDLED);
          const batch = fs.writeBatch(db);
          let n = 0;
          const put = (path: string, data: object, stamp: 'updatedAt' | 'publishedAt') => {
            batch.set(fs.doc(db, path), { ...data, [stamp]: fs.serverTimestamp() });
            n++;
          };
          for (const [id, d] of Object.entries(docs.candidates)) put(`candidates/${id}`, d, 'updatedAt');
          for (const [id, d] of Object.entries(docs.priorities)) put(`priorities/${id}`, d, 'updatedAt');
          for (const [id, d] of Object.entries(docs.departments)) put(`departments/${id}`, d, 'updatedAt');
          batch.set(fs.doc(db, 'meta/content'), { ...docs.meta.content, publishedAt: fs.serverTimestamp(), publishedBy: email });
          n++;
          await batch.commit();
          toast(fmt(s.contentPublished, { n }), 4000);
          await refreshContent();
          showState();
        } catch (e) { console.error(e); toast(s.error, 5000); }
        finally { publish.disabled = false; }
      });
      refresh.addEventListener('click', async () => { refresh.disabled = true; await refreshContent(); showState(); refresh.disabled = false; });

      return h('div', { class: 'card roomy' }, h('h2', null, s.contentTitle), h('p', { class: 'caption', style: 'margin-top:0' }, s.contentSub), state, publish, refresh);
    };

    const pollCard = (email: string): HTMLElement => {
      const field = (label: string, el: HTMLElement) => h('div', { style: 'margin-top:14px' }, h('label', { class: 'field-label' }, label), el);
      const l10nInputs = (): Record<Lang, HTMLInputElement> => ({ ht: h('input', { class: 'input', placeholder: 'Kreyòl' }), fr: h('input', { class: 'input', placeholder: 'Français', style: 'margin-top:6px' }), en: h('input', { class: 'input', placeholder: 'English', style: 'margin-top:6px' }) });
      const read = (r: Record<Lang, HTMLInputElement>): L10n => ({ ht: r.ht.value.trim(), fr: r.fr.value.trim() || r.ht.value.trim(), en: r.en.value.trim() || r.ht.value.trim() });

      const week = h('input', { class: 'input', value: isoWeek(new Date(Date.now() + 7 * 86400000)) });
      const q = l10nInputs();
      const opts: Record<Lang, HTMLInputElement>[] = [];
      const optBox = h('div');
      const addOpt = () => { const r = l10nInputs(); opts.push(r); optBox.append(field(fmt(s.option, { n: opts.length }), h('div', null, r.ht, r.fr, r.en))); };
      addOpt(); addOpt(); addOpt(); addOpt();
      const starts = h('input', { class: 'input', type: 'date' });
      const ends = h('input', { class: 'input', type: 'date' });
      const publish = h('button', { class: 'btn btn-primary btn-block', type: 'button', style: 'margin-top:16px' }, s.publish);
      const closeBtn = h('button', { class: 'btn btn-outline btn-block', type: 'button', style: 'margin-top:10px' }, s.closeActive);

      const closeActive = async () => {
        const snap = await fs.getDocs(fs.query(fs.collection(db, 'polls'), fs.where('active', '==', true)));
        const batch = fs.writeBatch(db);
        snap.docs.forEach((d) => batch.update(d.ref, { active: false }));
        await batch.commit();
      };
      publish.addEventListener('click', async () => {
        const options = opts.map((r, i) => ({ id: `o${i + 1}`, label: read(r) })).filter((o) => o.label.ht);
        if (!q.ht.value.trim() || options.length < 2 || !starts.value || !ends.value) { toast(s.error); return; }
        publish.disabled = true;
        try {
          await closeActive();
          await fs.addDoc(fs.collection(db, 'polls'), { week: week.value.trim(), question: read(q), options, startsAt: fs.Timestamp.fromDate(new Date(starts.value + 'T00:00:00')), endsAt: fs.Timestamp.fromDate(new Date(ends.value + 'T23:59:59')), active: true, createdAt: fs.serverTimestamp(), createdBy: email });
          toast(s.published, 4000);
        } catch (e) { console.error(e); toast(s.error, 5000); }
        finally { publish.disabled = false; }
      });
      closeBtn.addEventListener('click', async () => { try { await closeActive(); toast(s.closed); } catch (e) { console.error(e); toast(s.error); } });

      return h('div', { class: 'card roomy', style: 'margin-top:12px' }, h('h2', null, s.newPoll),
        field(s.week, week), field(s.question, h('div', null, q.ht, q.fr, q.en)), optBox,
        h('button', { class: 'link-btn', type: 'button', onclick: addOpt }, `+ ${s.addOption}`),
        field(s.starts, starts), field(s.ends, ends), publish, closeBtn);
    };

    // ---- accounts: one record per user (email, name, sign-in method, dates); passwords are never stored or shown ----
    const usersCard = (): HTMLElement => {
      type Row = { email: string; name: string; provider: string; created: Date | null; last: Date | null };
      let rows: Row[] = [];
      const count = h('p', { class: 'caption num', style: 'margin-top:0' }, S().loading);
      const list = h('div', { class: 'adm-users' });
      const day = (d: Date | null) => (d ? fmtDate(d.toISOString().slice(0, 10)) : '·');
      const csv = h('button', { class: 'btn btn-outline', type: 'button' }, s.usersCsv);
      const reload = h('button', { class: 'btn btn-outline', type: 'button' }, s.refresh);
      const load = async () => {
        reload.disabled = true;
        try {
          const snap = await fs.getDocs(fs.query(fs.collection(db, 'users'), fs.limit(5000)));
          const at = (v: unknown) => (v instanceof fs.Timestamp ? v.toDate() : null);
          rows = snap.docs.map((d) => d.data()).filter((d) => typeof d.email === 'string' && d.email)
            .map((d) => ({ email: String(d.email), name: String(d.name ?? ''), provider: String(d.provider ?? ''), created: at(d.createdAt), last: at(d.lastLoginAt) }))
            .sort((a, b) => (b.created?.getTime() ?? 0) - (a.created?.getTime() ?? 0));
          count.textContent = fmt(s.usersCount, { n: rows.length });
          list.replaceChildren(...(rows.length ? rows.map((r) => {
            const reset = r.provider === 'password'
              ? h('button', { class: 'link-btn', type: 'button', onclick: async () => {
                try { await auth.resetPassword(r.email); toast(fmt(s.usersResetSent, { e: r.email }), 4000); } catch (e) { console.error(e); toast(s.error); }
              } }, s.usersReset)
              : null;
            return h('div', { class: 'adm-user' },
              h('div', { class: 'adm-user-main' }, h('strong', null, r.email), r.name ? h('span', null, r.name) : null),
              h('div', { class: 'adm-user-meta' },
                h('span', { class: 'party' }, r.provider === 'google.com' ? s.usersGoogle : s.usersEmail),
                h('span', { class: 'num' }, `${s.usersCreated}: ${day(r.created)}`),
                h('span', { class: 'num' }, `${s.usersLast}: ${day(r.last)}`)),
              reset);
          }) : [note(s.usersEmpty)]));
        } catch (e) { console.error(e); count.textContent = s.error; }
        finally { reload.disabled = false; }
      };
      csv.addEventListener('click', () => {
        const cell = (v: string) => `"${v.replace(/"/g, '""')}"`;
        const iso = (d: Date | null) => (d ? d.toISOString() : '');
        const text = ['email,name,sign_in_method,created,last_sign_in', ...rows.map((r) => [cell(r.email), cell(r.name), r.provider === 'google.com' ? 'google' : 'email', iso(r.created), iso(r.last)].join(','))].join('\n');
        const url = URL.createObjectURL(new Blob([text], { type: 'text/csv;charset=utf-8' }));
        const a = h('a', { href: url, download: `prezidan-pa-m-users-${new Date().toISOString().slice(0, 10)}.csv` });
        document.body.append(a); a.click(); a.remove();
        window.setTimeout(() => URL.revokeObjectURL(url), 4000);
      });
      reload.addEventListener('click', () => void load());
      void load();
      return h('div', { class: 'card roomy', style: 'margin-top:12px' }, h('h2', null, s.usersTitle),
        h('p', { class: 'caption', style: 'margin-top:0' }, s.usersSub), count,
        h('div', { class: 'adm-users-actions' }, csv, reload), list);
    };

    const draw = (email: string | null) => {
      clear(box);
      if (!email) { box.append(h('button', { class: 'btn btn-primary', type: 'button', onclick: () => auth.signInAdmin().then((u) => draw(u.email)).catch((e) => { console.error(e); toast(s.error); }) }, s.signIn)); return; }
      if (!ADMIN_EMAILS.includes(email)) { box.append(note(`${s.notAdmin} (${email})`), h('button', { class: 'link-btn', type: 'button', onclick: () => auth.signOut().then(() => draw(null)) }, s.signOut)); return; }
      box.append(h('p', { class: 'caption', style: 'margin:0 0 12px' }, email), usersCard(), contentCard(email), pollCard(email),
        h('button', { class: 'link-btn', type: 'button', style: 'margin-top:12px', onclick: () => auth.signOut().then(() => draw(null)) }, s.signOut));
    };

    auth.onUser((u) => draw(u && !u.isAnonymous ? u.email : null));
  })();
}
