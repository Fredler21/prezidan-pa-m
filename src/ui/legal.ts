import { h, clear } from '../lib/dom';
import { S, fmt, fmtDate, getLang } from '../i18n';
import { LEGAL, type LegalDoc } from '../data/legal';
import { CONTACT_EMAIL, LEGAL_UPDATED } from '../data/site';
import { footer } from './common';
import { IMG } from '../data/images';

export type LegalPage = 'aboutUs' | 'privacy' | 'terms';

function fill(text: string): string {
  return fmt(text, { email: CONTACT_EMAIL, date: fmtDate(LEGAL_UPDATED) });
}

/** Turns a paragraph into text with the contact address rendered as a mailto link. */
function paragraph(text: string): HTMLElement {
  const p = h('p');
  const parts = fill(text).split(CONTACT_EMAIL);
  parts.forEach((part, i) => {
    if (part) p.append(part);
    if (i < parts.length - 1) p.append(h('a', { href: `mailto:${CONTACT_EMAIL}` }, CONTACT_EMAIL));
  });
  return p;
}

/** About us, Privacy policy and Terms of use: one long-form page each, same layout. */
export function renderLegal(main: HTMLElement, page: LegalPage): void {
  clear(main);
  const doc: LegalDoc = LEGAL[getLang()][page];
  const nav = S().nav;
  const links: { page: LegalPage; route: string; label: string }[] = [
    { page: 'aboutUs', route: 'about-us', label: nav.aboutUs },
    { page: 'privacy', route: 'privacy', label: nav.privacy },
    { page: 'terms', route: 'terms', label: nav.terms },
  ];
  const wrap = h('div', { class: 'wrap page legal' },
    h('h1', { class: 'page-title' }, doc.title),
    h('p', { class: 'lead' }, fill(doc.intro)),
    h('nav', { class: 'legal-tabs', 'aria-label': nav.aboutUs }, ...links.map((x) => h('a', { class: 'chip', href: `#${x.route}`, 'aria-current': x.page === page ? 'page' : undefined }, x.label))),
  );
  if (page === 'aboutUs') {
    const im = S().images;
    wrap.append(h('figure', { class: 'band legal-band' },
      h('img', { src: IMG.bassin.src640, srcset: `${IMG.bassin.src640} 640w, ${IMG.bassin.src1200} 1200w`, sizes: '(min-width: 1024px) 760px, 100vw', width: 1200, height: 800, alt: im.bassin, loading: 'lazy', decoding: 'async' }),
      h('figcaption', null, h('strong', null, im.bassin), h('span', null, im.bassinCredit))));
  }
  const body = h('article', { class: 'card roomy legal-body' });
  for (const s of doc.sections) {
    body.append(h('h2', null, s.h));
    for (const p of s.p ?? []) body.append(paragraph(p));
    if (s.li?.length) body.append(h('ul', { class: 'dots' }, ...s.li.map((t) => { const li = h('li'); li.append(...Array.from(paragraph(t).childNodes)); return li; })));
  }
  wrap.append(body, footer());
  main.append(wrap);
}
