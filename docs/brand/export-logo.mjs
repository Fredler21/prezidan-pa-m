// Exports the site's logo files from the original image (docs/brand/logo-source.jpeg), with no redrawing:
// the image is only cleaned (JPEG noise in the white background set to pure white), cropped and resized.
// Needs Google Chrome. Usage: node docs/brand/export-logo.mjs [outDir=public]
//   brand/logo.webp            the full logo, for the header and the footer
//   og-image.jpg               link preview, 1200 x 630
//   favicon.png, apple-touch-icon.png, icon-192.png, icon-512.png, icon-maskable-512.png   the bust, on white
import { spawn } from 'node:child_process';
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const OUT = process.argv[2] ?? join(here, '..', '..', 'public');
const CHROME = process.env.CHROME ?? 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const src = `data:image/jpeg;base64,${readFileSync(join(here, 'logo-source.jpeg')).toString('base64')}`;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// Runs in the page: returns { name: dataURL }.
const job = async (src) => {
  const img = new Image(); img.src = src; await img.decode();
  const W = img.naturalWidth, H = img.naturalHeight;
  const c = document.createElement('canvas'); c.width = W; c.height = H;
  const x = c.getContext('2d'); x.drawImage(img, 0, 0);
  const id = x.getImageData(0, 0, W, H), d = id.data;
  // the white background: near white pixels connected to the border, set to pure white
  const white = (k) => d[k * 4] >= 236 && d[k * 4 + 1] >= 236 && d[k * 4 + 2] >= 236;
  const bg = new Uint8Array(W * H), q = [];
  const push = (px, py) => { if (px < 0 || py < 0 || px >= W || py >= H) return; const k = py * W + px; if (bg[k] || !white(k)) return; bg[k] = 1; q.push(k); };
  for (let i = 0; i < W; i++) { push(i, 0); push(i, H - 1); }
  for (let i = 0; i < H; i++) { push(0, i); push(W - 1, i); }
  while (q.length) { const k = q.pop(), px = k % W, py = (k - px) / W; push(px + 1, py); push(px - 1, py); push(px, py + 1); push(px, py - 1); }
  for (let k = 0; k < W * H; k++) if (bg[k]) { d[k * 4] = d[k * 4 + 1] = d[k * 4 + 2] = 255; }
  x.putImageData(id, 0, 0);
  // content box (rows and columns with a few non background pixels, so stray specks do not count)
  const rows = new Uint32Array(H), cols = new Uint32Array(W);
  for (let py = 0; py < H; py++) for (let px = 0; px < W; px++) if (!bg[py * W + px]) { rows[py]++; cols[px]++; }
  const first = (a, n) => { for (let i = 0; i < a.length; i++) if (a[i] > n) return i; return 0; };
  const last = (a, n) => { for (let i = a.length - 1; i >= 0; i--) if (a[i] > n) return i; return a.length - 1; };
  const bx0 = first(cols, 2), bx1 = last(cols, 2), by0 = first(rows, 2), by1 = last(rows, 2);
  const pad = Math.round((bx1 - bx0) * 0.02);
  const box = { x: Math.max(0, bx0 - pad), y: Math.max(0, by0 - pad), w: 0, h: 0 };
  box.w = Math.min(W, bx1 + pad) - box.x; box.h = Math.min(H, by1 + pad) - box.y;

  const canvas = (w, h) => { const k = document.createElement('canvas'); k.width = w; k.height = h; const g = k.getContext('2d'); g.fillStyle = '#FFFFFF'; g.fillRect(0, 0, w, h); g.imageSmoothingQuality = 'high'; return [k, g]; };
  // halve repeatedly before the last step, so small sizes stay sharp
  const scaled = (sx, sy, sw, sh, tw) => {
    let cur = c, cx = sx, cy = sy, cw = sw, ch = sh;
    while (cw / 2 > tw) { const [k, g] = canvas(Math.round(cw / 2), Math.round(ch / 2)); g.drawImage(cur, cx, cy, cw, ch, 0, 0, k.width, k.height); cur = k; cx = 0; cy = 0; cw = k.width; ch = k.height; }
    return [cur, cx, cy, cw, ch];
  };
  const out = { box: JSON.stringify(box) };
  {
    const tw = 520, th = Math.round(box.h * tw / box.w);
    const [k, g] = canvas(tw, th); g.drawImage(...scaled(box.x, box.y, box.w, box.h, tw), 0, 0, tw, th);
    out['brand/logo.webp'] = k.toDataURL('image/webp', 0.9); out.size = `${tw}x${th}`;
  }
  {
    const [k, g] = canvas(1200, 630); const s = Math.min(1040 / box.w, 540 / box.h);
    const w = Math.round(box.w * s), h = Math.round(box.h * s);
    g.drawImage(...scaled(box.x, box.y, box.w, box.h, w), Math.round((1200 - w) / 2), Math.round((630 - h) / 2), w, h);
    out['og-image.jpg'] = k.toDataURL('image/jpeg', 0.9);
  }
  // the bust (hat and head, above the lettering), anchored to the bottom edge like a portrait
  const bust = { x: 650, y: 108, w: 316, h: 262 };
  const icon = (size, fill) => {
    const [k, g] = canvas(size, size); const s = Math.min(size * fill / bust.w, size * fill / bust.h);
    const w = Math.round(bust.w * s), h = Math.round(bust.h * s);
    const bottom = fill < 0.8 ? Math.round((size + h) / 2) : size;
    g.drawImage(...scaled(bust.x, bust.y, bust.w, bust.h, w), Math.round((size - w) / 2), bottom - h, w, h);
    return k.toDataURL('image/png');
  };
  out['favicon.png'] = icon(64, 0.96);
  out['apple-touch-icon.png'] = icon(180, 0.9);
  out['icon-192.png'] = icon(192, 0.9);
  out['icon-512.png'] = icon(512, 0.9);
  out['icon-maskable-512.png'] = icon(512, 0.66);
  return out;
};

const port = 9700 + Math.floor(Math.random() * 40);
const chrome = spawn(CHROME, ['--headless', '--no-first-run', `--remote-debugging-port=${port}`, `--user-data-dir=${process.env.TEMP ?? '/tmp'}/ppm-logo-${Date.now()}`, 'about:blank'], { stdio: 'ignore' });
try {
  let t;
  for (let i = 0; i < 40 && !t; i++) { try { t = (await (await fetch(`http://127.0.0.1:${port}/json`)).json()).find((p) => p.type === 'page'); } catch {} if (!t) await sleep(250); }
  const ws = new WebSocket(t.webSocketDebuggerUrl);
  await new Promise((r) => ws.addEventListener('open', r));
  const res = await new Promise((r) => {
    ws.addEventListener('message', (m) => { const d = JSON.parse(m.data); if (d.id === 1) r(d.result); });
    ws.send(JSON.stringify({ id: 1, method: 'Runtime.evaluate', params: { expression: `(${job})(${JSON.stringify(src)})`, awaitPromise: true, returnByValue: true } }));
  });
  if (res.exceptionDetails) throw new Error(res.exceptionDetails.exception?.description ?? res.exceptionDetails.text);
  const files = res.result.value;
  console.log('crop', files.box, '| logo', files.size);
  for (const [name, url] of Object.entries(files)) {
    if (!url.startsWith('data:')) continue;
    const file = join(OUT, name); mkdirSync(dirname(file), { recursive: true });
    const buf = Buffer.from(url.slice(url.indexOf(',') + 1), 'base64'); writeFileSync(file, buf);
    console.log(name, Math.round(buf.length / 1024), 'KB');
  }
  ws.close();
} finally { chrome.kill(); }
