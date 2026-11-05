// Traces the bust (tricorn hat figure) from the logo image into flat colour layers.
// node trace-bust.cjs <source.jpeg> <out.svg> [x y w h]
const Jimp = require('jimp');
const { Potrace } = require('potrace');
const fs = require('fs');

const [src, out, ...box] = process.argv.slice(2);
const [X, Y, W, H] = box.length ? box.map(Number) : [650, 108, 316, 262];
const PALETTE = {
  navy: [24, 32, 78],
  gold: [206, 162, 64],
  red: [196, 32, 46],
  gray: [150, 158, 176],
  white: [246, 246, 248],
};
const FILL = { silhouette: '#FFFFFF', gray: '#AEB5C6', red: '#D21034', navy: '#0B1A4A', gold: '#C9A23A' };

const nearest = (r, g, b) => {
  let best = 'white', d0 = Infinity;
  for (const [k, [pr, pg, pb]] of Object.entries(PALETTE)) {
    const d = (r - pr) ** 2 * 0.3 + (g - pg) ** 2 * 0.59 + (b - pb) ** 2 * 0.11;
    if (d < d0) { d0 = d; best = k; }
  }
  return best;
};

function traceMask(mask, w, h) {
  return new Promise(async (resolve, reject) => {
    const img = new Jimp(w, h, 0xffffffff);
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) if (mask[y * w + x]) img.setPixelColor(0x000000ff, x, y);
    const buf = await img.getBufferAsync(Jimp.MIME_PNG);
    const p = new Potrace({ threshold: 128, turdSize: 18, optTolerance: 0.35, alphaMax: 1.0, turnPolicy: Potrace.TURNPOLICY_MINORITY });
    p.loadImage(buf, (err) => {
      if (err) return reject(err);
      const tag = p.getPathTag();
      const d = /d="([^"]*)"/.exec(tag);
      resolve(d ? d[1] : '');
    });
  });
}

(async () => {
  const img = await Jimp.read(src);
  const crop = img.clone().crop(X, Y, W, H).blur(1);
  const w = crop.bitmap.width, h = crop.bitmap.height;
  const cls = new Array(w * h);
  crop.scan(0, 0, w, h, function (x, y, i) {
    const d = this.bitmap.data;
    cls[y * w + x] = nearest(d[i], d[i + 1], d[i + 2]);
  });
  // background: the white (or near white) connected to the crop border
  const bg = new Uint8Array(w * h);
  const queue = [];
  const push = (x, y) => { const k = y * w + x; if (x < 0 || y < 0 || x >= w || y >= h || bg[k] || cls[k] !== 'white') return; bg[k] = 1; queue.push(k); };
  for (let x = 0; x < w; x++) { push(x, 0); push(x, h - 1); }
  for (let y = 0; y < h; y++) { push(0, y); push(w - 1, y); }
  while (queue.length) { const k = queue.pop(); const x = k % w, y = (k - x) / w; push(x + 1, y); push(x - 1, y); push(x, y + 1); push(x, y - 1); }

  // distance (in px, up to 4) from the background: soft edges read as grey, they belong to the navy outline
  const dist = new Uint8Array(w * h).fill(255);
  let front = [];
  for (let k = 0; k < w * h; k++) if (bg[k]) { dist[k] = 0; front.push(k); }
  for (let step = 1; step <= 4; step++) {
    const next = [];
    for (const k of front) { const x = k % w, y = (k - x) / w; for (const [nx, ny] of [[x+1,y],[x-1,y],[x,y+1],[x,y-1]]) { if (nx<0||ny<0||nx>=w||ny>=h) continue; const n = ny*w+nx; if (dist[n] > step) { dist[n] = step; next.push(n); } } }
    front = next;
  }
  for (let k = 0; k < w * h; k++) {
    if (cls[k] === 'gray' && dist[k] <= 4) cls[k] = 'navy';
    if (cls[k] === 'red' && Math.floor(k / w) < h * 0.78) cls[k] = 'navy';
  }
  const layers = { silhouette: (k) => !bg[k], gray: (k) => cls[k] === 'gray', red: (k) => cls[k] === 'red', navy: (k) => cls[k] === 'navy', gold: (k) => cls[k] === 'gold' };
  const paths = [];
  for (const [name, test] of Object.entries(layers)) {
    const mask = new Uint8Array(w * h);
    let n = 0;
    for (let k = 0; k < w * h; k++) if (test(k)) { mask[k] = 1; n++; }
    const d = await traceMask(mask, w, h);
    console.log(name, n, 'px', d.length, 'chars');
    if (d) paths.push(`<path d="${d}" fill="${FILL[name]}" fill-rule="evenodd"/>`);
  }
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}">${paths.join('')}</svg>`;
  fs.writeFileSync(out, svg);
  console.log('wrote', out, (svg.length / 1024).toFixed(1), 'KB');
})().catch((e) => { console.error(e); process.exit(1); });
