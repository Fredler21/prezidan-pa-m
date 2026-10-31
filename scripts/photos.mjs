// Builds identical square candidate portraits (320x320) from the licensed originals.
// Usage: node scripts/photos.mjs <source-dir>
// Manual face-centred boxes for originals where auto-cropping misses the face.
import sharp from 'sharp';
import { readdirSync, mkdirSync } from 'node:fs';
import { join, extname, basename } from 'node:path';

const CROPS = {
  martelly: { left: 950, top: 120, size: 1850 }, // WEF 2012, seated full-length shot
  gue: { left: 1250, top: 200, size: 1100 },      // USAID 2011, lectern shot
};
const src = process.argv[2];
const out = 'public/photos';
mkdirSync(out, { recursive: true });
for (const f of readdirSync(src)) {
  const ext = extname(f).toLowerCase();
  if (!['.jpg', '.jpeg', '.png'].includes(ext)) continue;
  const slug = basename(f, ext);
  let img = sharp(join(src, f));
  const meta = await img.metadata();
  const box = CROPS[slug];
  if (box) img = img.extract({ left: box.left, top: box.top, width: box.size, height: box.size });
  const target = join(out, slug + (ext === '.png' ? '.png' : '.jpg'));
  await img.resize(320, 320, { fit: 'cover', position: box ? 'centre' : 'attention' }).toFormat(ext === '.png' ? 'png' : 'jpeg', { quality: 82 }).toFile(target);
  console.log(slug, `${meta.width}x${meta.height}`, box ? 'manual' : 'auto', '->', target);
}
