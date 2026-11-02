import type { PriorityId } from '../types';
import { h, svg } from '../lib/dom';
import { ICON } from '../lib/icons';
import { S, fmt, fmtDate } from '../i18n';
import { state, onState } from '../state';
import { getAccount } from '../account';
import { IMG } from '../data/images';
import { SITE_URL } from '../data/site';
import { whatsappUrl } from '../lib/util';
import { priorityIcon, priorityLabel } from './common';
import { toast } from './toast';

/*
 * « Kat sitwayen »: a personal civic card on the home page. It shows the visitor's priorities,
 * whether they have voted (never for whom) and the first-round date, with a name they may type.
 * The face is HTML over an SVG guilloche (banknote-style security print) with a holographic
 * foil and a glare that follow the pointer. Share and download use a PNG drawn on a canvas
 * from the same geometry. The name stays in localStorage only.
 */

const NAME_KEY = 'ppm.card.name';
const NAME_MAX = 28;
const VB_W = 1000;
const VB_H = 630;
const FONT = '"Bricolage Grotesque", system-ui, -apple-system, "Segoe UI", Roboto, sans-serif';

// ---- guilloche geometry, in card units (1000 x 630) ----
function polar(cx: number, cy: number, R: number, A: number, n: number, rot: number, steps: number): string {
  let d = '';
  for (let i = 0; i <= steps; i++) {
    const t = (i / steps) * Math.PI * 2;
    const r = R + A * Math.cos(n * t);
    d += `${i ? 'L' : 'M'}${(cx + r * Math.cos(t + rot)).toFixed(1)} ${(cy + r * Math.sin(t + rot)).toFixed(1)}`;
  }
  return `${d}Z`;
}
/** Interlaced rosette: one n-petal curve, repeated with a fraction of a petal of rotation each time. */
const rosette = (cx: number, cy: number, R: number, A: number, n: number, curves: number, steps = 180) =>
  Array.from({ length: curves }, (_, k) => polar(cx, cy, R, A, n, (k / curves) * ((2 * Math.PI) / n), steps));
function waves(y0: number, gap: number, lines: number, amp: number, freq: number): string[] {
  return Array.from({ length: lines }, (_, i) => {
    let d = '';
    for (let x = 0; x <= VB_W; x += 8) d += `${x ? 'L' : 'M'}${x} ${(y0 + i * gap + amp * Math.sin(x * freq + i * 0.35)).toFixed(1)}`;
    return d;
  });
}
const SEAL = { cx: 872, cy: 512, r: 60 };
const ART = {
  outer: rosette(770, 250, 170, 46, 10, 16),
  inner: rosette(770, 250, 92, 24, 10, 10),
  waves: waves(560, 6, 9, 9, 0.018),
  seal: rosette(SEAL.cx, SEAL.cy, 36, 7, 14, 6, 120),
};

function artSvg(ringText: string): string {
  const paths = (ds: string[], o: number) => ds.map((d) => `<path d="${d}" stroke-opacity="${o}"/>`).join('');
  const { cx, cy, r } = SEAL;
  return `<svg class="cc-art" viewBox="0 0 ${VB_W} ${VB_H}" aria-hidden="true" xmlns="http://www.w3.org/2000/svg">
<g fill="none" stroke="#fff" stroke-width="0.9">${paths(ART.outer, 0.1)}${paths(ART.inner, 0.13)}${paths(ART.waves, 0.09)}</g>
<g class="cc-seal-art">
<circle cx="${cx}" cy="${cy}" r="${r}" fill="url(#ccFoil)" fill-opacity="0.22" stroke="#fff" stroke-opacity="0.45" stroke-width="1.2"/>
<circle cx="${cx}" cy="${cy}" r="${r - 6}" fill="none" stroke="#fff" stroke-opacity="0.3"/>
<g fill="none" stroke="#fff" stroke-width="0.8">${paths(ART.seal, 0.35)}</g>
<path id="ccRing" d="M ${cx - 46} ${cy} a 46 46 0 1 1 92 0 a 46 46 0 1 1 -92 0" fill="none"/>
<text font-size="10.5" font-weight="700" letter-spacing="2.6" fill="#fff" fill-opacity="0.75"><textPath href="#ccRing">${ringText}</textPath></text>
<text x="${cx}" y="${cy + 7}" text-anchor="middle" font-size="20" font-weight="800" fill="#fff">2027</text>
</g>
<defs><linearGradient id="ccFoil" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#7FD3FF"/><stop offset=".5" stop-color="#B99BFF"/><stop offset="1" stop-color="#FFE3A3"/></linearGradient></defs>
</svg>`;
}

// ---- model ----
interface Model { name: string; picks: PriorityId[]; voted: boolean; firstRound: string }

function cleanName(v: string): string {
  return v.replace(/[\u0000-\u001f<>]/g, '').replace(/\s+/g, ' ').slice(0, NAME_MAX);
}
function readName(): string {
  try { const v = localStorage.getItem(NAME_KEY); if (v !== null) return cleanName(v); } catch { /* storage off */ }
  return cleanName(getAccount()?.name ?? '');
}
function writeName(v: string): void { try { localStorage.setItem(NAME_KEY, v); } catch { /* storage off */ } }

// ---- PNG export (canvas) ----
function rr(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, hh: number, r: number): void {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + hh, r); ctx.arcTo(x + w, y + hh, x, y + hh, r);
  ctx.arcTo(x, y + hh, x, y, r); ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}
function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => { const img = new Image(); img.onload = () => resolve(img); img.onerror = reject; img.src = src; });
}
const iconImage = (markup: string) => loadImage(`data:image/svg+xml;charset=utf-8,${encodeURIComponent(markup.replace('<svg ', '<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" ').replace('stroke="currentColor"', 'stroke="#ffffff"'))}`);
type Ctx = CanvasRenderingContext2D & { letterSpacing?: string };

async function renderPng(m: Model): Promise<Blob> {
  const s = S().card;
  const scale = 1.2;
  const canvas = document.createElement('canvas');
  canvas.width = VB_W * scale; canvas.height = VB_H * scale;
  const ctx = canvas.getContext('2d') as Ctx | null;
  if (!ctx) throw new Error('no canvas');
  try { await document.fonts.load(`700 48px ${FONT}`); await document.fonts.load(`500 20px ${FONT}`); } catch { /* fallback font */ }
  const [flag, brand, ...icons] = await Promise.all([
    loadImage(IMG.flag.srcset.split(', ')[1]?.split(' ')[0] ?? IMG.flag.src).catch(() => null),
    iconImage(ICON.brand).catch(() => null),
    ...m.picks.map((p) => iconImage(priorityIcon(p)).catch(() => null)),
  ]);
  ctx.scale(scale, scale);
  rr(ctx, 0, 0, VB_W, VB_H, 44); ctx.clip();
  // surface
  const g = ctx.createLinearGradient(0, 0, VB_W, VB_H);
  g.addColorStop(0, '#101E66'); g.addColorStop(0.5, '#1A3BB5'); g.addColorStop(1, '#0B1230');
  ctx.fillStyle = g; ctx.fillRect(0, 0, VB_W, VB_H);
  const glow = ctx.createRadialGradient(780, 160, 0, 780, 160, 520);
  glow.addColorStop(0, 'rgba(90, 130, 255, .35)'); glow.addColorStop(1, 'rgba(90, 130, 255, 0)');
  ctx.fillStyle = glow; ctx.fillRect(0, 0, VB_W, VB_H);
  // guilloche
  ctx.lineWidth = 0.9;
  const strokeAll = (ds: string[], a: number) => { ctx.strokeStyle = `rgba(255,255,255,${a})`; for (const d of ds) ctx.stroke(new Path2D(d)); };
  strokeAll(ART.outer, 0.1); strokeAll(ART.inner, 0.13); strokeAll(ART.waves, 0.09);
  // holographic band
  const holo = ctx.createLinearGradient(150, 0, 850, VB_H);
  holo.addColorStop(0, 'rgba(0,0,0,0)'); holo.addColorStop(0.4, 'rgba(110,200,255,0)'); holo.addColorStop(0.47, 'rgba(110,200,255,.16)');
  holo.addColorStop(0.53, 'rgba(185,145,255,.16)'); holo.addColorStop(0.59, 'rgba(255,222,150,.12)'); holo.addColorStop(0.67, 'rgba(0,0,0,0)');
  ctx.globalCompositeOperation = 'screen'; ctx.fillStyle = holo; ctx.fillRect(0, 0, VB_W, VB_H); ctx.globalCompositeOperation = 'source-over';
  // seal
  const { cx, cy, r } = SEAL;
  const foil = ctx.createLinearGradient(cx - r, cy - r, cx + r, cy + r);
  foil.addColorStop(0, 'rgba(127,211,255,.22)'); foil.addColorStop(0.5, 'rgba(185,155,255,.22)'); foil.addColorStop(1, 'rgba(255,227,163,.22)');
  ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.fillStyle = foil; ctx.fill();
  ctx.strokeStyle = 'rgba(255,255,255,.45)'; ctx.lineWidth = 1.2; ctx.stroke();
  ctx.beginPath(); ctx.arc(cx, cy, r - 6, 0, Math.PI * 2); ctx.strokeStyle = 'rgba(255,255,255,.3)'; ctx.lineWidth = 1; ctx.stroke();
  ctx.lineWidth = 0.8; strokeAll(ART.seal, 0.35);
  ctx.fillStyle = 'rgba(255,255,255,.75)'; ctx.font = `700 10.5px ${FONT}`;
  const ring = s.ring.repeat(2);
  for (let i = 0; i < ring.length; i++) {
    const a = Math.PI + (i / ring.length) * Math.PI * 2;
    ctx.save(); ctx.translate(cx + 46 * Math.cos(a), cy + 46 * Math.sin(a)); ctx.rotate(a + Math.PI / 2);
    ctx.fillText(ring[i] ?? '', -3, 0); ctx.restore();
  }
  ctx.fillStyle = '#fff'; ctx.font = `800 20px ${FONT}`; ctx.textAlign = 'center'; ctx.fillText('2027', cx, cy + 7); ctx.textAlign = 'left';
  // edge highlight
  rr(ctx, 1, 1, VB_W - 2, VB_H - 2, 43); ctx.strokeStyle = 'rgba(255,255,255,.18)'; ctx.lineWidth = 2; ctx.stroke();
  // top row
  if (brand) ctx.drawImage(brand, 56, 54, 32, 32);
  ctx.fillStyle = '#fff'; ctx.font = `700 26px ${FONT}`; ctx.letterSpacing = '4px'; ctx.fillText(S().appName.toUpperCase(), 100, 80);
  ctx.letterSpacing = '0px'; ctx.font = `500 17px ${FONT}`; ctx.fillStyle = 'rgba(214,222,246,.85)'; ctx.fillText(S().tagline, 100, 108);
  if (flag) { ctx.save(); rr(ctx, 874, 54, 70, 42, 6); ctx.clip(); ctx.drawImage(flag, 874, 54, 70, 42); ctx.restore(); rr(ctx, 874, 54, 70, 42, 6); ctx.strokeStyle = 'rgba(255,255,255,.4)'; ctx.lineWidth = 1; ctx.stroke(); }
  // name
  const label = (t: string, x: number, y: number) => { ctx.fillStyle = 'rgba(190,201,236,.9)'; ctx.font = `700 14px ${FONT}`; ctx.letterSpacing = '4px'; ctx.fillText(t.toUpperCase(), x, y); ctx.letterSpacing = '0px'; };
  label(s.onCard, 56, 226);
  const nameText = m.name || s.defaultName;
  const ng = ctx.createLinearGradient(0, 240, 0, 296);
  ng.addColorStop(0, '#FFFFFF'); ng.addColorStop(1, '#C9D3F2');
  ctx.font = `700 50px ${FONT}`; ctx.fillStyle = 'rgba(0,0,0,.35)'; ctx.fillText(nameText, 56, 292);
  ctx.fillStyle = ng; ctx.fillText(nameText, 56, 290);
  // priorities
  label(s.priorities, 56, 350);
  ctx.font = `600 20px ${FONT}`;
  let x = 56;
  const chips = m.picks.length ? m.picks.map((p, i) => ({ text: priorityLabel(p), icon: icons[i] ?? null })) : [{ text: s.pickPrompt, icon: null }];
  for (const c of chips) {
    const w = ctx.measureText(c.text).width + (c.icon ? 74 : 40);
    rr(ctx, x, 368, w, 50, 25); ctx.fillStyle = 'rgba(255,255,255,.1)'; ctx.fill(); ctx.strokeStyle = 'rgba(255,255,255,.22)'; ctx.lineWidth = 1; ctx.stroke();
    if (c.icon) ctx.drawImage(c.icon, x + 16, 381, 24, 24);
    ctx.fillStyle = '#fff'; ctx.fillText(c.text, x + (c.icon ? 50 : 20), 400);
    x += w + 10;
  }
  // bottom row
  label(s.vote, 56, 500); label(s.firstRound, 330, 500);
  ctx.fillStyle = '#fff'; ctx.font = `600 24px ${FONT}`;
  ctx.fillText(m.voted ? `✓ ${s.voted}` : s.notVoted, 56, 536);
  ctx.fillText(m.firstRound, 330, 536);
  // microprint
  ctx.fillStyle = 'rgba(255,255,255,.28)'; ctx.font = `600 11px ${FONT}`; ctx.letterSpacing = '2px';
  ctx.fillText(`${s.micro.repeat(6)}`, 0, 612); ctx.letterSpacing = '0px';
  ctx.fillStyle = 'rgba(255,255,255,.55)'; ctx.font = `600 13px ${FONT}`; ctx.textAlign = 'right'; ctx.fillText(SITE_URL.replace('https://', ''), VB_W - 56, 592); ctx.textAlign = 'left';
  return new Promise((resolve, reject) => canvas.toBlob((b) => (b ? resolve(b) : reject(new Error('toBlob'))), 'image/png'));
}

// ---- the section ----
export function civicCard(firstRoundIso: string): { el: HTMLElement; destroy: () => void } {
  const s = S().card;
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const hover = window.matchMedia('(hover: hover)').matches;
  let name = readName();
  let blob: Blob | null = null;
  let blobFor = '';
  let alive = true;
  const model = (): Model => ({ name, picks: state.picks.slice(), voted: !!state.myVote, firstRound: fmtDate(firstRoundIso) });
  const key = (m: Model) => JSON.stringify(m);

  // card face
  const nameEl = h('strong', { class: 'cc-name' });
  const chipsEl = h('div', { class: 'cc-chips' });
  const voteEl = h('b');
  const face = h('div', { class: 'cc-face' },
    h('div', { class: 'cc-top' },
      h('span', { class: 'cc-brand' }, svg(ICON.brand), h('span', null, h('b', null, S().appName), h('small', null, S().tagline))),
      h('img', { class: 'cc-flag', src: IMG.flag.src, srcset: IMG.flag.srcset, sizes: '72px', width: 70, height: 42, alt: '', decoding: 'async' })),
    h('div', { class: 'cc-mid' },
      h('span', { class: 'cc-label' }, s.onCard), nameEl,
      h('span', { class: 'cc-label' }, s.priorities), chipsEl),
    h('div', { class: 'cc-bottom' },
      h('div', null, h('span', { class: 'cc-label' }, s.vote), voteEl),
      h('div', null, h('span', { class: 'cc-label' }, s.firstRound), h('b', { class: 'num' }, fmtDate(firstRoundIso)))),
    h('div', { class: 'cc-micro', 'aria-hidden': 'true' }, s.micro.repeat(8)));
  const card = h('div', { class: 'ccard', role: 'img', 'aria-label': s.alt, html: artSvg(s.ring.repeat(2)) });
  card.append(h('div', { class: 'cc-holo', 'aria-hidden': 'true' }), h('div', { class: 'cc-glare', 'aria-hidden': 'true' }), face);
  const stage = h('div', { class: 'cc-stage' }, card);

  const paint = () => {
    const m = model();
    nameEl.textContent = m.name || s.defaultName;
    nameEl.classList.toggle('placeholder', !m.name);
    chipsEl.replaceChildren(...(m.picks.length
      ? m.picks.map((p) => h('span', { class: 'cc-chip' }, svg(priorityIcon(p)), priorityLabel(p)))
      : [h('a', { class: 'cc-chip ghost', href: '#start' }, svg(ICON.sliders), s.pickPrompt)]));
    voteEl.replaceChildren(...(m.voted ? [svg(ICON.check), s.voted] : [s.notVoted]));
    voteEl.className = m.voted ? 'ok' : '';
    choose.hidden = m.picks.length > 0;
    schedule();
  };

  // controls
  const input = h('input', { class: 'cc-input', type: 'text', id: 'cc-name', maxlength: NAME_MAX, autocomplete: 'name', placeholder: s.namePlaceholder, value: name });
  let saveTimer = 0;
  input.addEventListener('input', () => {
    name = cleanName(input.value);
    paint();
    clearTimeout(saveTimer);
    saveTimer = window.setTimeout(() => writeName(name), 400);
  });
  const shareText = () => {
    const p = state.picks.map((x) => priorityLabel(x)).join(', ');
    return p ? fmt(s.shareText, { p, url: SITE_URL }) : fmt(s.shareTextNone, { url: SITE_URL });
  };
  const fileName = 'kat-sitwayen-prezidan-pa-m.png';
  const share = async () => {
    const text = shareText();
    try {
      const b = blob && blobFor === key(model()) ? blob : await renderPng(model());
      const file = new File([b], fileName, { type: 'image/png' });
      if (navigator.canShare?.({ files: [file] })) { await navigator.share({ files: [file], text, title: S().appName }); return; }
      if (typeof navigator.share === 'function') { await navigator.share({ text, title: S().appName }); return; }
    } catch (e) {
      if (e instanceof DOMException && e.name === 'AbortError') return;
      console.warn('share failed', e);
    }
    window.open(whatsappUrl(text), '_blank', 'noopener');
  };
  const download = async () => {
    try {
      const b = await renderPng(model());
      const url = URL.createObjectURL(b);
      const a = h('a', { href: url, download: fileName });
      document.body.append(a); a.click(); a.remove();
      window.setTimeout(() => URL.revokeObjectURL(url), 4000);
      toast(s.saved);
    } catch (e) { console.warn('download failed', e); toast(S().offline); }
  };
  const choose = h('a', { class: 'cc-choose', href: '#start' }, s.choose, svg(ICON.arrowRight));
  const controls = h('div', { class: 'cc-controls' },
    h('label', { class: 'cc-field', for: 'cc-name' }, h('span', null, s.nameLabel), input),
    h('div', { class: 'cc-actions' },
      h('button', { class: 'btn btn-primary', type: 'button', onclick: () => void share() }, svg(ICON.share), s.share),
      h('button', { class: 'btn cc-btn-ghost', type: 'button', onclick: () => void download() }, svg(ICON.download), s.download)),
    choose,
    h('p', { class: 'cc-note' }, svg(ICON.lock), s.privacy));
  const text = h('div', { class: 'cc-text' },
    h('p', { class: 'board-kicker' }, s.kicker),
    h('h2', null, s.title),
    h('p', { class: 'cc-lead' }, s.lead));

  const el = h('section', { class: 'cc-sec', 'aria-labelledby': 'cc-title' },
    h('div', { class: 'wrap cc-grid' }, text, stage, controls));
  text.querySelector('h2')?.setAttribute('id', 'cc-title');

  // Pre-render the PNG while idle so a share tap can hand a file over without losing the user gesture.
  let renderTimer = 0;
  function schedule() {
    clearTimeout(renderTimer);
    renderTimer = window.setTimeout(() => {
      if (!alive || !visible) return;
      const m = model(), k = key(m);
      if (k === blobFor) return;
      void renderPng(m).then((b) => { if (alive) { blob = b; blobFor = k; } }).catch(() => {});
    }, 700);
  }

  // pointer: tilt, foil and glare follow the finger or the mouse
  const move = (e: PointerEvent) => {
    const r = card.getBoundingClientRect();
    const px = Math.min(1, Math.max(0, (e.clientX - r.left) / r.width));
    const py = Math.min(1, Math.max(0, (e.clientY - r.top) / r.height));
    card.style.setProperty('--rx', `${((0.5 - py) * 16).toFixed(2)}deg`);
    card.style.setProperty('--ry', `${((px - 0.5) * 22).toFixed(2)}deg`);
    card.style.setProperty('--gx', `${(px * 100).toFixed(1)}%`);
    card.style.setProperty('--gy', `${(py * 100).toFixed(1)}%`);
    card.style.setProperty('--hx', `${(100 - px * 100).toFixed(1)}%`);
  };
  const enter = () => stage.classList.add('hovering');
  const leave = () => { stage.classList.remove('hovering'); for (const p of ['--rx', '--ry', '--gx', '--gy', '--hx']) card.style.removeProperty(p); };
  if (!reduced) {
    stage.addEventListener('pointerenter', enter);
    stage.addEventListener('pointermove', move);
    stage.addEventListener('pointerleave', leave);
    if (!hover) stage.addEventListener('pointerup', leave);
  }

  // entrance once visible; pre-render only once the visitor can see the card
  let visible = false;
  const io = 'IntersectionObserver' in window ? new IntersectionObserver((es) => {
    if (!es.some((x) => x.isIntersecting)) return;
    visible = true; io?.disconnect();
    if (!reduced) stage.classList.add('enter');
    schedule();
  }, { rootMargin: '0px 0px -10% 0px' }) : null;
  if (io) io.observe(stage); else visible = true;

  const offState = onState(paint);
  paint();
  return {
    el,
    destroy: () => {
      alive = false; offState(); io?.disconnect(); clearTimeout(renderTimer); clearTimeout(saveTimer);
      stage.removeEventListener('pointerenter', enter); stage.removeEventListener('pointermove', move); stage.removeEventListener('pointerleave', leave); stage.removeEventListener('pointerup', leave);
    },
  };
}
