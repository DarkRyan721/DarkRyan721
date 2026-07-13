// Downloads every image in assets/images.json, crops to the exact grid size,
// bakes rounded corners, and saves optimized WebP files into assets/photos/.
// Run via the "Ingest README images" GitHub Action whenever images.json changes.
import fs from 'fs';
import sharp from 'sharp';

const SIZES = { wide: { w: 1024, h: 521 }, tall: { w: 640, h: 422 } };
const RADIUS = 24; // 12px at display size (2x assets)

const cfg = JSON.parse(fs.readFileSync('assets/images.json', 'utf8'));
fs.mkdirSync('assets/photos', { recursive: true });

const manifest = {};
for (const shape of ['wide', 'tall']) {
  manifest[shape] = {};
  const { w, h } = SIZES[shape];
  for (const theme of ['light', 'dark']) {
    manifest[shape][theme] = [];
    const urls = cfg[shape][theme];
    for (let i = 0; i < urls.length; i++) {
      // strip any query params the URL carries; request a clean, right-sized source
      const clean = `${urls[i].split('?')[0]}?q=85&w=${w}&h=${h}&fit=crop`;
      const res = await fetch(clean);
      if (!res.ok) throw new Error(`${res.status} on ${clean}`);
      const buf = Buffer.from(await res.arrayBuffer());
      const mask = Buffer.from(
        `<svg width="${w}" height="${h}"><rect width="${w}" height="${h}" rx="${RADIUS}" ry="${RADIUS}"/></svg>`
      );
      const out = `assets/photos/${shape}-${theme}-${i}.webp`;
      await sharp(buf)
        .resize(w, h, { fit: 'cover' })
        .composite([{ input: mask, blend: 'dest-in' }])
        .webp({ quality: 85 })
        .toFile(out);
      manifest[shape][theme].push(out);
      console.log('✓', out);
    }
  }
}
fs.writeFileSync('assets/photos/manifest.json', JSON.stringify(manifest, null, 2));
console.log('manifest written');
