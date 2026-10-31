import { h, clear } from '../lib/dom';
import { S } from '../i18n';
import { LANGS, type Lang, type L10n } from '../types';
import { isoWeek } from '../lib/util';
import { STORAGE_MODE } from '../storage';
import { note } from './common';
import { toast } from './toast';

const ADMIN_EMAILS = ['pierrelouisfredler@gmail.com', 'fredler.pierre-louis@edlight.org'];

/** #admin — post the weekly poll. Google sign-in; Firestore rules enforce the admin allowlist. */
export function renderAdmin(main: HTMLElement): void {
  clear(main);
  const s = S().admin;
  const page = h('div', { class: 'wrap page' });
  main.append(page);
  page.append(h('h1', null, s.title));
  if (STORAGE_MODE !== 'firebase') { page.append(h('div', { style: 'margin-top:12px' }, note(S().demoMode))); return; }

  const box = h('div', { style: 'margin-top:14px' });
  page.append(box);

  void (async () => {
    const auth = await import('../storage/auth');
    const fs = await import('firebase/firestore');
    const db = fs.getFirestore(auth.app());

    const draw = (email: string | null) => {
      clear(box);
      if (!email) { box.append(h('button', { class: 'btn btn-primary', type: 'button', onclick: () => auth.signInAdmin().then((u) => draw(u.email)).catch((e) => { console.error(e); toast(s.error); }) }, s.signIn)); return; }
      if (!ADMIN_EMAILS.includes(email)) { box.append(note(`${s.notAdmin} (${email})`), h('button', { class: 'btn-text', type: 'button', onclick: () => auth.signOut().then(() => draw(null)) }, s.signOut)); return; }

      const field = (label: string, el: HTMLElement) => h('div', { class: 'field' }, h('label', null, label), el);
      const l10nInputs = (): Record<Lang, HTMLInputElement> => ({ ht: h('input', { class: 'input', placeholder: 'Kreyòl' }), fr: h('input', { class: 'input', placeholder: 'Français', style: 'margin-top:6px' }), en: h('input', { class: 'input', placeholder: 'English', style: 'margin-top:6px' }) });
      const read = (r: Record<Lang, HTMLInputElement>): L10n => ({ ht: r.ht.value.trim(), fr: r.fr.value.trim() || r.ht.value.trim(), en: r.en.value.trim() || r.ht.value.trim() });

      const week = h('input', { class: 'input', value: isoWeek(new Date(Date.now() + 7 * 86400000)) });
      const q = l10nInputs();
      const opts: Record<Lang, HTMLInputElement>[] = [];
      const optBox = h('div');
      const addOpt = () => { const r = l10nInputs(); opts.push(r); optBox.append(field(`${s.option.replace('{n}', String(opts.length))}`, h('div', null, r.ht, r.fr, r.en))); };
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

      box.append(h('p', { class: 'muted small' }, email), h('div', { class: 'card', style: 'margin-top:10px' }, h('h2', null, s.newPoll),
        field(s.week, week), field(s.question, h('div', null, q.ht, q.fr, q.en)), optBox,
        h('button', { class: 'btn-text', type: 'button', onclick: addOpt }, `+ ${s.addOption}`),
        field(s.starts, starts), field(s.ends, ends), publish, closeBtn),
        h('button', { class: 'btn-text', type: 'button', style: 'margin-top:10px', onclick: () => auth.signOut().then(() => draw(null)) }, s.signOut));
    };

    auth.onUser((u) => draw(u && !u.isAnonymous ? u.email : null));
  })();
}

void LANGS;
