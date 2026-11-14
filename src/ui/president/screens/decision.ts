import { h, svg } from '../../../lib/dom';
import { S, fmt, l } from '../../../i18n';
import { LEVELS } from '../../../data/president-levels.ts';
import { payable } from '../../../lib/president-rules.ts';
import { toast } from '../../toast';
import { GI, sceneSVG } from '../art';
import { adviser, adviserName, chip, ghost, hud, reduced, type Ctx } from '../parts';
import { sfx, vibrate } from '../sound';

/**
 * A decision on the presidential desk (Stitch « s21-decision »): the stats, the scene, the adviser's question
 * with a hint, the dossiers (a swipeable scroll-snap row on phones, a grid on desktop), and « Siyen dekrè a »,
 * which slams the red stamp on the chosen dossier. Decisions are final.
 */
export function decisionScreen(c: Ctx): HTMLElement {
  const s = S().pres;
  const t = c.term;
  const r = t?.r;
  const D = t && r ? t.decisions[r.n] : undefined;
  const lv = r ? LEVELS[r.year] : undefined;
  if (!t || !r || !D || !lv) return h('div');
  const pay = payable(r.stats, D.o);

  const hint = h('p', { class: 'gm-hint', id: 'gm-hint', hidden: true, tabindex: -1 }, `« ${l(D.hint)} »`);
  const hintBtn = h('button', { class: 'gm-hintb', type: 'button', 'aria-expanded': 'false', 'aria-controls': 'gm-hint' }, svg(GI.idea), s.hintBtn);
  hintBtn.addEventListener('click', () => {
    hint.hidden = false; hintBtn.setAttribute('aria-expanded', 'true'); hintBtn.hidden = true;
    hint.focus({ preventScroll: true }); sfx.tap();
  });

  let sel = -1;
  let busy = false;
  const sign = h('button', { class: 'btn btn-primary gm-btn gm-sign', type: 'button', disabled: true }, svg(GI.pen), s.pick);
  const box = h('div', { class: 'gm-opts', role: 'radiogroup', 'aria-labelledby': 'gm-q' });
  const dots = h('div', { class: 'gm-dots', 'aria-hidden': 'true' }, ...D.o.map((_, k) => h('i', { class: k === 0 ? 'on' : '' })));

  const center = (card: HTMLElement) => {
    if (box.scrollWidth <= box.clientWidth + 2) return; // grid layout: nothing to scroll
    box.scrollTo({ left: card.offsetLeft - box.offsetLeft - (box.clientWidth - card.offsetWidth) / 2, behavior: reduced() ? 'auto' : 'smooth' });
  };
  const pick = (k: number) => {
    if (busy) return;
    if (!pay.ok[k]) { toast(s.brokeToast); vibrate(40); return; }
    sel = k;
    cards.forEach((x, j) => { x.setAttribute('aria-checked', String(j === k)); x.classList.toggle('sel', j === k); x.tabIndex = j === k ? 0 : -1; });
    sign.disabled = false;
    sign.replaceChildren(svg(GI.pen), s.sign);
    sfx.tap(); vibrate(10);
    const card = cards[k];
    if (card) center(card);
  };

  const cards = D.o.map((o, k) => {
    const ok = pay.ok[k] ?? false;
    const credit = pay.credit[k] ?? false;
    const cost = `${o.cost ? fmt(s.cost, { n: o.cost }) : s.free}${ok ? (credit ? ` · ${s.credit}` : '') : ` · ${s.broke}`}`;
    const b = h('button', { class: `gm-opt${ok ? '' : ' no'}`, type: 'button', role: 'radio', 'aria-checked': 'false', 'aria-disabled': ok ? undefined : 'true', tabindex: k === 0 ? 0 : -1, 'aria-describedby': `gm-oc-${k}` },
      h('span', { class: `gm-cost${o.cost ? '' : ' free'}${ok ? '' : ' broke'}`, id: `gm-oc-${k}` }, cost),
      h('b', null, l(o.t)),
      h('span', { class: 'gm-optd' }, l(o.d)),
      h('span', { class: 'gm-stamp', 'aria-hidden': 'true' }, s.stamp));
    b.addEventListener('click', () => pick(k));
    return b;
  });
  box.append(...cards);
  // A radio group: arrow keys move between dossiers (and select the ones the treasury allows).
  box.addEventListener('keydown', (e) => {
    const keys: Record<string, number> = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 };
    const step = keys[e.key];
    if (!step) return;
    e.preventDefault();
    const now = cards.findIndex((x) => x === document.activeElement);
    const next = cards[(Math.max(0, now) + step + cards.length) % cards.length];
    if (!next) return;
    cards.forEach((x) => { x.tabIndex = x === next ? 0 : -1; });
    next.focus();
    const k = cards.indexOf(next);
    if (pay.ok[k]) pick(k);
  });
  box.addEventListener('scroll', () => {
    const mid = box.scrollLeft + box.clientWidth / 2;
    let best = 0; let dist = Infinity;
    cards.forEach((x, k) => { const d = Math.abs(x.offsetLeft - box.offsetLeft + x.offsetWidth / 2 - mid); if (d < dist) { dist = d; best = k; } });
    dots.querySelectorAll('i').forEach((x, k) => x.classList.toggle('on', k === best));
  }, { passive: true });

  const el = h('div', { class: 'gm-cols gm-decision' },
    h('div', { class: 'gm-row gm-top' },
      ghost(s.map, () => c.go('map')),
      chip(`${fmt(s.year, { y: r.year + 1 })} · ${l(lv.name)}`, undefined, 'soft'),
      h('span', { class: 'grow' }),
      h('span', { class: 'gm-pips', role: 'img', 'aria-label': fmt(s.step, { i: r.d + 1, n: 3 }) }, ...[0, 1, 2].map((k) => h('i', { class: k <= r.d ? 'on' : '' })))),
    hud(r.stats),
    h('div', { class: 'gm-side' }, h('div', { class: 'gm-scene', html: sceneSVG(lv.scene, l(lv.name)) })),
    adviser(D.adv, adviserName(D.adv), h('h2', { class: 'gm-q', id: 'gm-q', tabindex: -1, 'data-focus': '' }, l(D.q)), hintBtn, hint),
    h('div', { class: 'gm-desk' }, box, dots),
    sign,
    h('p', { class: 'gm-fine' }, s.swipe));

  sign.addEventListener('click', () => {
    const card = cards[sel];
    if (sel < 0 || busy || !card) return;
    busy = true;
    sign.disabled = true;
    card.classList.add('stamped');
    const chosen = sel;
    c.later(() => { sfx.stamp(); vibrate(80); c.shake(el); }, reduced() ? 0 : 260);
    c.later(() => c.answer(chosen), reduced() ? 250 : 950);
  });
  c.later(() => c.maybeTutorial(), 450);
  return el;
}
