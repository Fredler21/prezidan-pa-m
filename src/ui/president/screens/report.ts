import { h } from '../../../lib/dom';
import { ICON } from '../../../lib/icons';
import { S, fmt, getLang, l } from '../../../i18n';
import { BADGES, LEVELS } from '../../../data/president-levels.ts';
import { BADGE_ICON } from '../art';
import { mapBox, meterList, primary, stars, type Ctx, type ShowOptions } from '../parts';
import { sfx, vibrate } from '../sound';

const decimal = (n: number) => new Intl.NumberFormat(getLang() === 'en' ? 'en-US' : 'fr-FR', { maximumFractionDigits: 1 }).format(n);

/** The end of a year (Stitch « s23-year-report »): the stars land one by one, new badges, the map and the stats. */
export function reportScreen(c: Ctx, o: ShowOptions): HTMLElement {
  const s = S().pres;
  const r = c.term?.r;
  const y = o.year ?? Math.max(0, (r?.stars.length ?? 1) - 1);
  const log = r?.years[y];
  const lv = LEVELS[y];
  if (!r || !log || !lv) return h('div');
  const n = log.stars ?? 1;
  const end = log.end ?? r.stats;
  const delta = log.delta ?? 0;
  const last = y === LEVELS.length - 1;

  const fresh = c.fresh.splice(0).slice(0, 3);
  const strips = fresh.map((id) => h('div', { class: 'gm-newbadge', role: 'status' },
    h('span', { class: 'gm-bw on', html: BADGE_ICON[id] ?? '' }),
    h('span', null, h('small', null, s.newBadge), h('b', null, l(BADGES.find((b) => b.id === id)?.name)))));

  const el = h('div', { class: 'gm-cols gm-report' },
    h('div', { class: 'gm-card gm-center' },
      h('p', { class: 'gm-kicker muted' }, fmt(s.report, { y: y + 1, n: l(lv.name) })),
      stars(n, 'lg', true),
      h('h2', { tabindex: -1, 'data-focus': '' }, [s.star1, s.star2, s.star3][n - 1] ?? s.star1),
      h('p', { class: 'gm-muted' }, fmt(delta >= 0 ? s.movedUp : s.movedDown, { n: decimal(Math.abs(delta)) }))),
    ...strips,
    h('div', { class: 'gm-side' }, mapBox(end, { labels: true })),
    h('div', { class: 'gm-card' }, meterList(c, end)),
    primary(last ? s.finish : fmt(s.nextYear, { y: y + 2 }), () => { sfx.tap(); c.go(last ? 'final' : 'map', { fresh: true }); }, ICON.arrowRight));

  for (let i = 0; i < n; i++) c.later(() => { sfx.star(i); vibrate(20); }, 300 + i * 350);
  if (n === 3) c.later(() => c.celebrate(), 1200);
  return el;
}
