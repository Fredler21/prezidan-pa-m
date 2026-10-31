import type { Candidate } from '../types';
import { h, svg } from '../lib/dom';
import { ICON, PRIORITY_ICONS } from '../lib/icons';
import { S, fmt, l, getLang } from '../i18n';
import { go, parseHash } from '../router';
import { avatar, note, priorityLabel, sourceList } from './common';

let open: HTMLDialogElement | null = null;

/** Candidate profile as a bottom sheet dialog. */
export function openProfile(c: Candidate): void {
  closeProfile();
  const s = S().profile;
  const lang = getLang();

  const body = h('div', { class: 'sheet-body' });
  body.append(
    h('div', { class: 'handle', 'aria-hidden': 'true' }),
    h('div', { class: 'identity' }, avatar(c, true),
      h('div', null, h('h2', null, c.name), h('div', { class: 'party' }, c.partyFull !== c.party ? `${c.party} · ${c.partyFull}` : c.party), c.role ? h('div', { class: 'role' }, l(c.role)) : null)),
  );
  if (c.status) body.append(h('div', { style: 'margin-top:12px' }, note(`${s.status}: ${l(c.status)}`)));

  body.append(h('h3', null, s.bio), h('p', null, l(c.bio)));

  if (c.term) {
    body.append(h('h3', null, `${s.term} · ${l(c.term.title)}`), h('ul', { class: 'bullets' }, ...c.term.items[lang].map((t) => h('li', null, t))));
  }

  const record = c.record[lang];
  body.append(h('h3', null, s.record));
  if (record.length) body.append(h('ul', { class: 'bullets' }, ...record.map((t) => h('li', null, t))));
  else body.append(note(s.notPublished, ICON.info, true));

  body.append(h('h3', null, s.spoken));
  if (c.tags.length) {
    for (const t of c.tags) body.append(h('div', { class: 'spoke' }, svg(PRIORITY_ICONS[t.id]), h('div', null, h('strong', null, priorityLabel(t.id)), h('span', null, l(t.note)))));
    body.append(h('p', { class: 'muted small', style: 'margin-top:10px;font-style:italic' }, s.noOther));
  } else body.append(h('p', { class: 'muted small', style: 'font-style:italic' }, s.notPublished));

  body.append(h('h3', null, s.sources), sourceList(c.sources));
  if (c.photoCredit) body.append(h('p', { class: 'muted small', style: 'margin-top:12px' }, `${s.photo}: ${c.photoCredit}`));

  const dlg = h('dialog', { class: 'sheet', 'aria-label': c.name },
    h('button', { class: 'iconbtn close', type: 'button', 'aria-label': S().close, html: ICON.close, onclick: () => closeProfile() }),
    body,
    h('div', { class: 'sheet-foot' },
      h('button', { class: 'btn btn-vote btn-block', type: 'button', onclick: () => { closeProfile(); go('vote', c.id); } }, svg(ICON.ballot), fmt(s.voteFor, { name: c.name })),
      h('small', null, s.oneVote)),
  );
  dlg.addEventListener('click', (e) => { if (e.target === dlg) closeProfile(); });
  dlg.addEventListener('close', () => { dlg.remove(); if (open === dlg) open = null; const loc = parseHash(); if (loc.route === 'candidates' && loc.param) history.replaceState(null, '', '#candidates'); });
  document.body.append(dlg);
  open = dlg;
  if (typeof dlg.showModal === 'function') dlg.showModal(); else dlg.setAttribute('open', '');
}

export function closeProfile(): void {
  if (!open) return;
  const d = open;
  open = null;
  if (d.open && typeof d.close === 'function') d.close(); else d.remove();
}
