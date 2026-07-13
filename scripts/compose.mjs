// Composes each grid row as a single self-contained SVG (typography + embedded
// photo as base64 WebP). One image per row = zero layout shift, one request,
// pixel-perfect alignment. Generates every photo variant so URLs stay stable
// and permanently cacheable. Run after ingest.mjs.
import fs from 'fs';

const ROW_W = 856; // 320 (left col) + 24 (gap) + 512 (right col)
const RADIUS = 12;

const inner = (file) =>
  fs.readFileSync(file, 'utf8').replace(/^[\s\S]*?<svg[^>]*>/, '').replace(/<\/svg>\s*$/, '');

const photo64 = (file) => `data:image/webp;base64,${fs.readFileSync(file).toString('base64')}`;

const image = (href, x, y, w, h, clipId) =>
  `<defs><clipPath id="${clipId}"><rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${RADIUS}" ry="${RADIUS}"/></clipPath></defs>` +
  `<image x="${x}" y="${y}" width="${w}" height="${h}" preserveAspectRatio="xMidYMid slice" clip-path="url(#${clipId})" href="${href}"/>`;

fs.mkdirSync('assets/rows', { recursive: true });

const manifest = JSON.parse(fs.readFileSync('assets/photos/manifest.json', 'utf8'));
const counts = { row1: {}, row2: {} };

for (const t of ['light', 'dark']) {
  const skills = inner(`assets/skills-v3-${t}.svg`);
  const profile = inner(`assets/profile-v3-${t}.svg`);

  // Row 1: skills (left, 320x264) + wide photo (right, 512x264)
  manifest.wide[t].forEach((photo, i) => {
    const H = 264;
    const svg =
      `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="${ROW_W}" height="${H}" viewBox="0 0 ${ROW_W} ${H}">\n` +
      `<g>${skills}</g>\n${image(photo64(photo), 344, 0, 512, H, 'rp1')}\n</svg>`;
    fs.writeFileSync(`assets/rows/row1-${t}-${i}.svg`, svg);
  });
  counts.row1[t] = manifest.wide[t].length;

  // Row 2: tall photo (left, 320x208) + profile (right, 512x208)
  manifest.tall[t].forEach((photo, i) => {
    const H = 208;
    const svg =
      `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="${ROW_W}" height="${H}" viewBox="0 0 ${ROW_W} ${H}">\n` +
      `${image(photo64(photo), 0, 0, 320, H, 'rp2')}\n<g transform="translate(344 0)">${profile}</g>\n</svg>`;
    fs.writeFileSync(`assets/rows/row2-${t}-${i}.svg`, svg);
  });
  counts.row2[t] = manifest.tall[t].length;
}

fs.writeFileSync('assets/rows/manifest.json', JSON.stringify(counts, null, 2));
console.log('rows composed:', JSON.stringify(counts));
