import { h } from '../../../lib/dom';
import { ICON } from '../../../lib/icons';
import { S, fmt, l } from '../../../i18n';
import { ADVISERS } from '../../../data/president-levels.ts';
import { countrySum } from '../../../lib/president-rules.ts';
import { adviser, chip, mapBox, meterList, primary, redrawMap, reduced, scoreHead, type Ctx } from '../parts';
import { sfx, vibrate } from '../sound';

const lowerFirst = (s: string) => s.charAt(0).toLocaleLowerCase() + s.slice(1);

/** What happened (Stitch « s22-result »): « Jounal Pèp la », the map reacting, the stats moving, and the adviser's reason. */
export function resultScreen(c: Ctx): HTMLElement {
  const s = S().pres;
  const r = c.term?.r;
  const step = r?.steps[r.steps.length - 1];
  if (!r || !step) return h('div');
  const o = step.option;
  const D = step.decision;
  const lastOfYear = step.index % 3 === 2;
  const storm = step.year === 3;

  const box = mapBox(step.before, { storm });
  c.later(() => redrawMap(box, step.after, { storm }), reduced() ? 0 : 700);

  const el = h('div', { class: 'gm-cols gm-result' },
    h('div', { class: 'gm-row gm-top' },
      chip(`${fmt(s.year, { y: step.year + 1 })} · ${fmt(s.step, { i: (step.index % 3) + 1, n: 3 })}`, undefined, 'soft')),
    h('article', { class: 'gm-paper', 'aria-labelledby': 'gm-headline' },
      h('div', { class: 'mast' }, h('b', null, s.paper), h('span', null, s.paperEd)),
      h('h2', { id: 'gm-headline', tabindex: -1, 'data-focus': '' }, l(o.h)),
      h('p', null, fmt(s.chose, { o: lowerFirst(l(o.t)) }))),
    h('div', { class: 'gm-side' }, box),
    h('div', { class: 'gm-card' }, scoreHead(step.after), meterList(c, step.after, step.before), step.credit ? h('p', { class: 'gm-fine' }, s.creditNote) : null),
    adviser(D.adv, `${ADVISERS[D.adv].name} · ${s.why}`, h('p', null, l(o.w))),
    primary(lastOfYear ? fmt(s.seeYear, { y: step.year + 1 }) : s.next, () => { sfx.tap(); c.go(lastOfYear ? 'report' : 'decision', { year: step.year }); }, ICON.arrowRight));

  const net = countrySum(step.after) - countrySum(step.before);
  c.later(() => { if (net >= 0) sfx.up(); else { sfx.down(); vibrate([50, 40, 50]); c.shake(el); } }, 500);
  return el;
}
