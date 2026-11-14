/// <reference types="node" />
import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  TOTAL, applyChoice, applyEffects, badgesOf, decisionById, decisionsOf, drawRun, gradeOf, income,
  nextStreak, payable, profileOf, replay, scoreOf, startYear, starsFor, topPriorities,
} from './president-rules.ts';
import { ADVISERS, BADGES, EVENTS, LEVELS, PROFILES, START, STATS, type GameDecision, type GameOption, type Stats } from '../data/president-levels.ts';
import { DECISIONS } from '../data/president-decisions.ts';

/** A deterministic random source, so draws are repeatable. */
function seeded(seed: number): () => number {
  let s = seed >>> 0;
  return () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 2 ** 32; };
}
const opt = (cost: number, e: GameOption['e'] = {}, flag?: string): GameOption => ({
  t: { ht: 'x', fr: 'x', en: 'x' }, d: { ht: 'x', fr: 'x', en: 'x' }, h: { ht: 'x', fr: 'x', en: 'x' }, w: { ht: 'x', fr: 'x', en: 'x' },
  cost, e, ...(flag ? { flag } : {}),
});
const S = (o: Partial<Stats> = {}): Stats => ({ ...START, ...o });

test('applying a choice takes its cost from the treasury and applies its effects', () => {
  const after = applyChoice(S(), opt(15, { security: 10, economy: 2, trust: -3 }), false);
  assert.deepEqual(after, { security: 35, economy: 32, social: 30, trust: 32, treasury: 25 });
});

test('stats stay between 0 and 100', () => {
  assert.deepEqual(applyEffects(S({ security: 98, trust: 2 }), { security: 10, trust: -10 }), S({ security: 100, trust: 0 }));
  assert.equal(applyChoice(S({ treasury: 5 }), opt(9), true).treasury, 0);
});

test('a choice can also bring money in', () => {
  assert.equal(applyChoice(S(), opt(0, { treasury: 8, trust: -8 }), false).treasury, 48);
});

test('options the treasury cannot pay for are disabled', () => {
  const p = payable(S({ treasury: 10 }), [opt(15), opt(5), opt(0)]);
  assert.deepEqual(p.ok, [false, true, true]);
  assert.deepEqual(p.credit, [false, false, false]);
});

test('credit rule: when nothing is affordable, the cheapest option is allowed on credit with trust −3', () => {
  const s = S({ treasury: 3 });
  const options = [opt(12), opt(6), opt(9)];
  const p = payable(s, options);
  assert.deepEqual(p.ok, [false, true, false]);
  assert.deepEqual(p.credit, [false, true, false]);
  const after = applyChoice(s, options[1] as GameOption, true);
  assert.equal(after.trust, START.trust - 3);
  assert.equal(after.treasury, 0);
});

test('yearly income is 12 + round(economy / 4)', () => {
  assert.equal(income(S({ economy: 30 })), 20);
  assert.equal(income(S({ economy: 0 })), 12);
  assert.equal(income(S({ economy: 61 })), 27);
});

test('year 1 brings no income; later years do', () => {
  assert.equal(startYear(S(), 0, new Set()).income, 0);
  const y2 = startYear(S({ economy: 40 }), 1, new Set());
  assert.equal(y2.income, 22);
  assert.equal(y2.after.treasury, START.treasury + 22);
});

test('stars: 6 or more is 3, 2 or more is 2, otherwise 1', () => {
  assert.equal(starsFor(6), 3);
  assert.equal(starsFor(12.5), 3);
  assert.equal(starsFor(5.75), 2);
  assert.equal(starsFor(2), 2);
  assert.equal(starsFor(1.99), 1);
  assert.equal(starsFor(-4), 1);
});

test('delayed events land at the start of their year only when their flag was set', () => {
  const s = S();
  const without = startYear(s, 1, new Set());
  assert.equal(without.events.length, 0);
  const withFlag = startYear(s, 1, new Set(['nego']));
  assert.equal(withFlag.events.length, 1);
  assert.equal(withFlag.after.security, s.security - 8);
  assert.equal(withFlag.after.trust, s.trust - 2);
  assert.equal(startYear(s, 2, new Set(['nego'])).events.length, 0, 'not in another year');
});

test('a replayed choice with a flag triggers its event the next year', () => {
  const ids = drawRun(seeded(7));
  const decisions = decisionsOf(ids);
  assert.ok(decisions);
  const nego = decisions[0]?.o.findIndex((o) => o.flag === 'nego') ?? -1;
  assert.ok(nego >= 0, 'the first day offers the deal with the gangs');
  const r = replay(decisions, [nego, 0, 0]);
  assert.equal(r.year, 1);
  assert.equal(r.d, 0);
  assert.deepEqual(r.years[1]?.start.events.map((e) => e.flag), ['nego']);
});

test('a full term replays to 5 years with stars, income every year after the first', () => {
  for (let seed = 1; seed <= 25; seed++) {
    const decisions = decisionsOf(drawRun(seeded(seed)));
    assert.ok(decisions);
    // Always pick the first option the treasury allows (credit included).
    const answers: number[] = [];
    for (let i = 0; i < TOTAL; i++) {
      const now = replay(decisions, answers);
      const d: GameDecision | undefined = decisions[i];
      assert.ok(d);
      answers.push(payable(now.stats, d.o).ok.findIndex(Boolean));
    }
    const r = replay(decisions, answers);
    assert.equal(r.n, TOTAL);
    assert.ok(r.done);
    assert.equal(r.stars.length, 5);
    assert.equal(r.years[0]?.start.income, 0);
    for (let y = 1; y < 5; y++) assert.ok((r.years[y]?.start.income ?? 0) >= 12);
    assert.ok(scoreOf(r.stats) >= 0 && scoreOf(r.stats) <= 100);
  }
});

test('replay stops at the first answer that is out of range or unaffordable', () => {
  const decisions = decisionsOf(drawRun(seeded(3)));
  assert.ok(decisions);
  assert.equal(replay(decisions, [0, 99, 0]).n, 1);
});

test('draws: 15 decisions, valid per level, no repeats inside a level, fixed slots respected', () => {
  for (let seed = 1; seed <= 50; seed++) {
    const ids = drawRun(seeded(seed));
    assert.equal(ids.length, TOTAL);
    assert.ok(decisionsOf(ids));
    for (let y = 0; y < 5; y++) assert.equal(new Set(ids.slice(y * 3, y * 3 + 3)).size, 3);
    assert.equal(ids[0], 'palace');
    assert.equal(ids[10], 'relief', 'year 4, second slot');
    assert.deepEqual(ids.slice(12), ['election', 'minister', 'handover']);
  }
  assert.equal(decisionsOf(['palace']), null);
  assert.equal(decisionsOf(Array.from({ length: TOTAL }, () => 'palace')), null);
});

test('profile, score and grade', () => {
  assert.equal(profileOf(S({ economy: 61, security: 48, social: 52, trust: 60 })), 'economy');
  assert.equal(profileOf(S({ security: 40, economy: 40, social: 40, trust: 40 })), 'security');
  assert.equal(scoreOf(S({ security: 48, economy: 61, social: 52, trust: 71 })), 58);
  assert.deepEqual([gradeOf(60), gradeOf(59), gradeOf(50), gradeOf(40), gradeOf(39)], [0, 1, 1, 2, 3]);
});

test('badges come from the replay and the streak', () => {
  const decisions = decisionsOf(drawRun(seeded(11)));
  assert.ok(decisions);
  assert.deepEqual(badgesOf(replay(decisions, []), 0), []);
  assert.deepEqual(badgesOf(replay(decisions, []), 3), ['streak']);
  assert.ok(badgesOf(replay(decisions, [0]), 0).includes('first'));
});

test('streak counts days in a row', () => {
  assert.deepEqual(nextStreak({ streak: 2, day: '2026-11-12' }, '2026-11-13', '2026-11-12'), { streak: 3, day: '2026-11-13' });
  assert.deepEqual(nextStreak({ streak: 2, day: '2026-11-13' }, '2026-11-13', '2026-11-12'), { streak: 2, day: '2026-11-13' });
  assert.deepEqual(nextStreak({ streak: 5, day: '2026-11-01' }, '2026-11-13', '2026-11-12'), { streak: 1, day: '2026-11-13' });
});

test('top priorities follow the weights of the choices made', () => {
  const decisions = decisionsOf(drawRun(seeded(5)));
  assert.ok(decisions);
  const r = replay(decisions, [0]);
  assert.deepEqual(topPriorities(r.steps), ['security']);
});

// ---- the data itself ----
const texts: { where: string; v: Record<string, string> }[] = [];
for (const d of DECISIONS) {
  texts.push({ where: `${d.id}.q`, v: d.q }, { where: `${d.id}.hint`, v: d.hint });
  d.o.forEach((o, i) => { for (const k of ['t', 'd', 'h', 'w'] as const) texts.push({ where: `${d.id}.o${i}.${k}`, v: o[k] }); });
}
for (const l of LEVELS) for (const k of ['name', 'theme', 'line'] as const) texts.push({ where: `level ${l.id}.${k}`, v: l[k] });
for (const e of EVENTS) texts.push({ where: `event ${e.flag}.title`, v: e.title }, { where: `event ${e.flag}.text`, v: e.text });
for (const b of BADGES) texts.push({ where: `badge ${b.id}.name`, v: b.name }, { where: `badge ${b.id}.rule`, v: b.rule });
for (const [id, p] of Object.entries(PROFILES)) texts.push({ where: `profile ${id}.title`, v: p.title }, { where: `profile ${id}.line`, v: p.line });
for (const s of STATS) texts.push({ where: `stat ${s.id}`, v: s.label });
for (const [id, a] of Object.entries(ADVISERS)) texts.push({ where: `adviser ${id}`, v: a.role });

test('every text exists in Kreyòl, French and English, with no em or en dash', () => {
  for (const { where, v } of texts) {
    for (const lang of ['ht', 'fr', 'en']) {
      const s = v[lang];
      assert.ok(typeof s === 'string' && s.trim().length > 0, `${where} has no ${lang}`);
      assert.ok(!/[–—]/.test(s), `${where} (${lang}) contains a dash`);
    }
  }
});

test('every slot points to an existing decision, and every decision is reachable', () => {
  const used = new Set(LEVELS.flatMap((l) => l.slots.flat()));
  for (const id of used) assert.ok(decisionById(id), `unknown decision ${id}`);
  for (const d of DECISIONS) assert.ok(used.has(d.id), `${d.id} is in no level`);
  assert.equal(new Set(DECISIONS.map((d) => d.id)).size, DECISIONS.length, 'duplicate ids');
});

test('every delayed event can be triggered by a decision drawn in an earlier year', () => {
  for (const e of EVENTS) {
    const setters = LEVELS.flatMap((l, y) => l.slots.flat().filter((id) => decisionById(id)?.o.some((o) => o.flag === e.flag)).map(() => y));
    assert.ok(setters.length > 0, `no option sets ${e.flag}`);
    assert.ok(setters.every((y) => y < e.year), `${e.flag} lands before it can be set`);
  }
});

test('costs are whole numbers from 0 to 20, and each decision has 3 or 4 options', () => {
  for (const d of DECISIONS) {
    assert.ok(d.o.length === 3 || d.o.length === 4, `${d.id} has ${d.o.length} options`);
    for (const o of d.o) assert.ok(Number.isInteger(o.cost) && o.cost >= 0 && o.cost <= 20, `${d.id}: cost ${o.cost}`);
  }
});
