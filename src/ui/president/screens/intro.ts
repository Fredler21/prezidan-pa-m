import { h, svg } from '../../../lib/dom';
import { ICON } from '../../../lib/icons';
import { S, fmt, l } from '../../../i18n';
import { CITIES, LEVELS } from '../../../data/president-levels.ts';
import { GI, sceneSVG } from '../art';
import { adviser, adviserName, meterList, primary, type Ctx } from '../parts';
import { sfx, vibrate } from '../sound';

/** Year intro (Stitch « s20-year-intro »): the scene, the adviser's line, the delayed consequences and the year's taxes. */
export function introScreen(c: Ctx): HTMLElement {
  const s = S().pres;
  const r = c.term?.r;
  const y = r?.year ?? 0;
  const lv = LEVELS[y];
  const ys = r?.years[y]?.start;
  if (!r || !lv || !ys) return h('div');

  const events = ys.events.map((e) => h('div', { class: 'gm-event', role: 'status' },
    h('p', { class: 'gm-event-t' }, svg(GI.history), fmt(s.later, { t: l(e.title) })),
    h('p', null, l(e.text))));

  const el = h('div', { class: 'gm-cols gm-intro' },
    h('div', { class: 'gm-head' },
      h('p', { class: 'gm-kicker' }, fmt(s.yearOf, { y: y + 1, c: l(CITIES[lv.city].name) })),
      h('h1', { tabindex: -1, 'data-focus': '' }, l(lv.name)),
      h('p', { class: 'gm-lead' }, l(lv.theme))),
    h('div', { class: 'gm-side' }, h('div', { class: 'gm-scene', html: sceneSVG(lv.scene, l(lv.name)) })),
    adviser(lv.adv, adviserName(lv.adv), h('p', null, l(lv.line))),
    ...events,
    y > 0 ? h('div', { class: 'gm-card' }, h('p', { class: 'gm-kicker muted' }, s.yearStart), meterList(c, ys.after, ys.before), h('p', { class: 'gm-fine' }, s.taxes)) : null,
    primary(fmt(s.startYear, { y: y + 1 }), () => { sfx.tap(); c.go('decision'); }, ICON.arrowRight));

  if (ys.events.length) {
    const bad = ys.events.some((e) => Object.values(e.e).some((v) => (v ?? 0) < 0));
    c.later(() => { if (bad) { sfx.down(); vibrate([60, 40, 60]); c.shake(el); } else sfx.up(); }, 350);
  }
  return el;
}
