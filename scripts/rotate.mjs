// Picks random images per theme from assets/images.json and renders README.md
// from README.template.md. Crop sizes are fixed so the grid never breaks.
import fs from 'fs';

const cfg = JSON.parse(fs.readFileSync('assets/images.json', 'utf8'));
const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
const url = (base, w, h) =>
  `${base}${base.includes('?') ? '&' : '?'}w=${w}&h=${h}&fit=crop&auto=format&mask=corners&corner-radius=24`;

const tpl = fs.readFileSync('README.template.md', 'utf8');
const out = tpl
  .replaceAll('{{IMG_WIDE_LIGHT}}', url(pick(cfg.wide.light), 1024, 521))
  .replaceAll('{{IMG_WIDE_DARK}}', url(pick(cfg.wide.dark), 1024, 521))
  .replaceAll('{{IMG_TALL_LIGHT}}', url(pick(cfg.tall.light), 640, 422))
  .replaceAll('{{IMG_TALL_DARK}}', url(pick(cfg.tall.dark), 640, 422));

fs.writeFileSync('README.md', out);
console.log('README.md rendered with rotated images');
