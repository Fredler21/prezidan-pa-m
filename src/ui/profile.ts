import type { Candidate } from '../types';
import { h, svg } from '../lib/dom';
import { ICON } from '../lib/icons';
import { S, fmt, l, getLang } from '../i18n';
import { go, parseHash } from '../router';
import { avatar, note, priorityIcon, priorityLabel, well } from './common';

let open: HTMLDialogElement | null = null;
let opener: HTMLElement | null = null;

/** Candidate profile as a bottom sheet dialog with its own scroll and a sticky vote bar. */
export function openProfile(c: Candidate): void {
  closeProfile();
  opener = document.activeElement instanceof HTMLElement ? document.activeElement : null;
  const s = S().profile;
  const lang = getLang();

  const body = h('div', { class: 'sheet-body' },
    h('div', { class: 'handle', 'aria-hidden': 'true' }),
    h('div', { class: 'identity' }, avatar(c, true),
      h('div', null,
        h('h2', { id: 'sheet-title' }, c.name),
        h('span', { class: 'party' }, c.partyFull && c.partyFull !== c.party ? `${c.party} · ${c.partyFull}` : c.party),
        c.role ? h('p', { class: 'role' }, l(c.role)) : null)),
  );
  if (c.status) body.append(h('div', { class: 'status' }, note(`${s.status}: ${l(c.status)}`)));

  body.append(h('h3', null, s.bio), h('p', { class: 'bio' }, l(c.bio)));

  if (c.term) body.append(h('h3', null, `${s.term} · ${l(c.term.title)}`), h('ul', { class: 'dots' }, ...c.term.items[lang].map((t) => h('li', null, t))));

  const record = c.record[lang];
  body.append(h('h3', null, s.record));
  if (record.length) body.append(h('ul', { class: 'dots' }, ...record.map((t) => h('li', null, t))));
  else body.append(h('p', { class: 'caption', style: 'margin-top:0' }, s.notPublished));

  body.append(h('h3', null, s.spoken));
  if (c.tags.length) {
    for (const t of c.tags) body.append(h('div', { class: 'spoke' }, well(priorityIcon(t.id)), h('div', null, h('strong', null, priorityLabel(t.id)), h('span', null, l(t.note)))));
    body.append(h('p', { class: 'caption' }, s.noOther));
  } else body.append(h('p', { class: 'caption', style: 'margin-top:0' }, s.notPublished));

  if (c.photoCredit) body.append(h('p', { class: 'caption', style: 'margin-top:16px' }, `${s.photo}: ${c.photoCredit}`));

  const dlg = h('dialog', { class: 'sheet', 'aria-labelledby': 'sheet-title' },
    h('button', { class: 'sheet-close', type: 'button', 'aria-label': S().close, onclick: () => closeProfile() }, svg(ICON.close)),
    body,
    h('div', { class: 'sheet-foot' },
      h('button', { class: 'btn btn-vote btn-block', type: 'button', onclick: () => { closeProfile(); go('vote', c.id); } }, svg(ICON.ballot), fmt(s.voteFor, { name: c.name })),
      h('small', null, s.oneVote)),
  );
  dlg.addEventListener('click', (e) => { if (e.target === dlg) closeProfile(); });
  dlg.addEventListener('close', () => {
    dlg.remove();
    if (open === dlg) open = null;
    const loc = parseHash();
    if (loc.route === 'candidates' && loc.param) history.replaceState(null, '', '#candidates');
    opener?.focus();
    opener = null;
  });
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
