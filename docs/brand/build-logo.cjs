// Builds the Prezidan Pa M logo set from the traced bust and Cinzel Black outlines (flat colours only).
// node build-logo.cjs <outdir>
const fs = require('fs');
const opentype = require('opentype.js');
const out = process.argv[2] || 'out';
fs.mkdirSync(out, { recursive: true });

const NAVY = '#0B1A4A', RED = '#D21034', GOLD = '#C9A23A', WHITE = '#FFFFFF';
const font = opentype.loadSync('cinzel-900.woff');
const bustSvg = fs.readFileSync('bust.svg', 'utf8');
const BW = Number(/viewBox="0 0 (\d+) (\d+)"/.exec(bustSvg)[1]), BH = Number(/viewBox="0 0 (\d+) (\d+)"/.exec(bustSvg)[2]);
const bustInner = bustSvg.replace(/^<svg[^>]*>/, '').replace(/<\/svg>$/, '').replace(/(\d+\.\d)\d+/g, '$1');
const silhouette = /<path d="([^"]*)" fill="#FFFFFF"/.exec(bustSvg)[1];
const capH = font.tables.os2.sCapHeight || 700;
const r = (n) => Math.round(n * 10) / 10;

/** Outline a string at size s with its left edge at x and baseline at y; returns { d, width }. */
function text(str, x, y, s, letter = 0) {
  let cx = x, d = '';
  const glyphs = font.stringToGlyphs(str);
  glyphs.forEach((g, i) => {
    d += g.getPath(cx, y, s).toPathData(2);
    cx += (g.advanceWidth / font.unitsPerEm) * s + letter;
    const next = glyphs[i + 1];
    if (next) cx += (font.getKerningValue(g, next) / font.unitsPerEm) * s;
  });
  return { d, width: cx - x - letter };
}
const widthOf = (str, s, letter = 0) => text(str, 0, 0, s, letter).width;

// ---------------- full logo ----------------
function fullLogo(dark) {
  const W = 1200;
  const S = 196, LS = 4;                        // wordmark size and letter spacing
  const parts = ['PREZ', 'I', 'DAN'];
  const total = parts.reduce((a, p) => a + widthOf(p, S, LS), 0) + 2 * LS;
  let x = (W - total) / 2;
  const capTop = 300;                           // where the bust ends and the letters start
  const base = capTop + (capH / font.unitsPerEm) * S;
  const ink = dark ? WHITE : NAVY;
  let letters = '';
  let iCenter = 0;
  for (const p of parts) {
    const t = text(p, x, base, S, LS);
    if (p === 'I') iCenter = x + t.width / 2;
    letters += `<path d="${t.d}" fill="${p === 'I' ? RED : ink}"/>`;
    x += t.width + LS;
  }
  // the bust sits on the letters, its shoulder line over the red I
  const bs = 1.0, bw = BW * bs, bh = BH * bs;
  const bx = iCenter - bw * 0.64, by = capTop - bh + 2;
  const bust = `<g transform="translate(${r(bx)} ${r(by)}) scale(${bs})">${dark ? `<path d="${silhouette}" fill="none" stroke="${WHITE}" stroke-width="10" stroke-linejoin="round"/>` : ''}${bustInner}</g>`;

  // ballot box, centred under the word
  const cx = W / 2, top = base + 52;
  const lidW = 330, lidH = 40, bodyTop = top + lidH, bodyH = 158, bodyW1 = 304, bodyW2 = 276;
  const ballot = `<g transform="translate(${cx - 34} ${top - 66}) rotate(-6 34 40)"><rect x="0" y="0" width="68" height="84" rx="4" fill="${WHITE}" stroke="${NAVY}" stroke-width="3"/><path d="M18 40 l12 13 l22 -26" fill="none" stroke="${NAVY}" stroke-width="8" stroke-linecap="round" stroke-linejoin="round"/></g>`;
  const lid = `<rect x="${cx - lidW / 2}" y="${top}" width="${lidW}" height="${lidH}" rx="8" fill="${RED}"/><rect x="${cx - 60}" y="${top + 12}" width="120" height="12" rx="6" fill="${NAVY}"/>`;
  const body = `<path d="M${cx - bodyW1 / 2} ${bodyTop} H${cx + bodyW1 / 2} L${cx + bodyW2 / 2} ${bodyTop + bodyH} H${cx - bodyW2 / 2} Z" fill="${NAVY}"/>`
    + `<rect x="${cx - bodyW1 / 2}" y="${bodyTop}" width="${bodyW1}" height="7" fill="${GOLD}"/>`
    + `<path d="M${cx - bodyW2 / 2 - 1} ${bodyTop + bodyH - 20} H${cx + bodyW2 / 2 + 1} L${cx + bodyW2 / 2} ${bodyTop + bodyH} H${cx - bodyW2 / 2} Z" fill="${RED}"/>`
    + `<rect x="${cx - bodyW2 / 2}" y="${bodyTop + bodyH}" width="${bodyW2}" height="6" fill="${GOLD}"/>`;
  const pamS = 92, pamLS = 6;
  const pamW = widthOf('PA M', pamS, pamLS);
  const pam = `<path d="${text('PA M', cx - pamW / 2, bodyTop + 26 + (capH / font.unitsPerEm) * pamS, pamS, pamLS).d}" fill="${WHITE}"/>`;

  // the sweep: a navy band over a red band on each side, tapering to a point
  const y0 = base + 36, tipY = base + 118, tipL = 40, tipR = W - 40, boxL = cx - lidW / 2 + 6, boxR = cx + lidW / 2 - 6;
  const blue = dark ? '#3D5BD9' : '#1A3BB5';
  const wing = (side) => {
    const s = side === 'L' ? 1 : -1;
    const tip = side === 'L' ? tipL : tipR, edge = side === 'L' ? boxL : boxR;
    const mid = (tip + edge) / 2;
    const navyBand = `M${tip} ${tipY} Q${mid} ${y0 - 6} ${edge} ${y0} L${edge} ${y0 + 22} Q${mid + s * 20} ${y0 + 20} ${tip} ${tipY} Z`;
    const redBand = `M${tip} ${tipY + 2} Q${mid + s * 20} ${y0 + 30} ${edge} ${y0 + 30} L${edge} ${y0 + 52} Q${mid + s * 40} ${y0 + 54} ${tip} ${tipY + 2} Z`;
    return `<path d="${navyBand}" fill="${blue}"/><path d="${redBand}" fill="${RED}"/>`;
  };
  const H = Math.ceil(bodyTop + bodyH + 30);
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" role="img" aria-label="Prezidan Pa M">`
    + `<title>Prezidan Pa M</title>${wing('L')}${wing('R')}${bust}${letters}${body}${lid}${ballot}${pam}</svg>`;
}
fs.writeFileSync(`${out}/logo.svg`, fullLogo(false));
fs.writeFileSync(`${out}/logo-dark.svg`, fullLogo(true));

// ---------------- the medallion (header, favicon, app icons) ----------------
function mark(opts = {}) {
  const R = 256, ring = 18;
  const s = 1.32, bw = BW * s, bh = BH * s;
  const bx = R - bw * 0.52, by = R * 2 - ring - bh + 14;
  const bg = opts.square ? `<rect width="${R * 2}" height="${R * 2}" rx="${opts.radius ?? 0}" fill="${NAVY}"/>` : '';
  const scaleAll = opts.inset ? ` transform="translate(${R} ${R}) scale(${opts.inset}) translate(${-R} ${-R})"` : '';
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${R * 2} ${R * 2}" width="${R * 2}" height="${R * 2}" role="img" aria-label="Prezidan Pa M">${bg}`
    + `<g${scaleAll}><circle cx="${R}" cy="${R}" r="${R}" fill="${NAVY}"/><circle cx="${R}" cy="${R}" r="${R - ring}" fill="${WHITE}"/>`
    + `<clipPath id="mk"><circle cx="${R}" cy="${R}" r="${R - ring}"/></clipPath>`
    + `<g clip-path="url(#mk)"><g transform="translate(${r(bx)} ${r(by)}) scale(${s})">${bustInner}</g><rect x="0" y="${R * 2 - ring - 34}" width="${R * 2}" height="34" fill="${RED}"/></g>`
    + `<circle cx="${R}" cy="${R}" r="${R - ring / 2}" fill="none" stroke="${GOLD}" stroke-width="5"/></g></svg>`;
}
fs.writeFileSync(`${out}/mark.svg`, mark());
fs.writeFileSync(`${out}/icon-square.svg`, mark({ square: true, inset: 0.86 }));
fs.writeFileSync(`${out}/icon-maskable.svg`, mark({ square: true, inset: 0.7 }));

// ---------------- two-line wordmark for the header (currentColor, red I and underline) ----------------
{
  const S = 100, LS = 3;
  const parts = ['PREZ', 'I', 'DAN'];
  let x = 0, d1 = '', dI = '';
  const base1 = (capH / font.unitsPerEm) * S;
  for (const p of parts) {
    const t = text(p, x, base1, S, LS);
    if (p === 'I') dI += t.d; else d1 += t.d;
    x += t.width + LS;
  }
  const w1 = x - LS;
  const S2 = 100, LS2 = 10;
  const w2 = widthOf('PA M', S2, LS2);
  const base2 = base1 + 26 + (capH / font.unitsPerEm) * S2;
  const d2 = text('PA M', 0, base2, S2, LS2).d;
  const H = base2 + 22;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${r(w1)} ${r(H)}" aria-hidden="true"><path d="${d1}${d2}" fill="currentColor"/><path d="${dI}" fill="${RED}"/><rect x="0" y="${r(base2 + 12)}" width="${r(w2)}" height="9" fill="${RED}"/></svg>`;
  fs.writeFileSync(`${out}/wordmark.svg`, svg);
  console.log('wordmark', r(w1), 'x', r(H), (svg.length / 1024).toFixed(1), 'KB');
}
for (const f of fs.readdirSync(out)) console.log(f, (fs.statSync(`${out}/${f}`).size / 1024).toFixed(1), 'KB');
