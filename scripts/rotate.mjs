// Picks random images per theme and renders README.md from README.template.md.
// Prefers optimized local photos (assets/photos/manifest.json, created by ingest.mjs);
// falls back to remote Unsplash URLs from assets/images.json.
import fs from 'fs';

const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
const remoteUrl = (base, w, h) =>
  `${base.split('?')[0]}?q=80&w=${w}&h=${h}&fit=crop&auto=format&mask=corners&corner-radius=24`;

let src;
if (fs.existsSync('assets/photos/manifest.json')) {
  const m = JSON.parse(fs.readFileSync('assets/photos/manifest.json', 'utf8'));
  src = {
    wideLight: pick(m.wide.light),
    wideDark: pick(m.wide.dark),
    tallLight: pick(m.tall.light),
    tallDark: pick(m.tall.dark),
  };
} else {
  const cfg = JSON.parse(fs.readFileSync('assets/images.json', 'utf8'));
  src = {
    wideLight: remoteUrl(pick(cfg.wide.light), 1024, 521),
    wideDark: remoteUrl(pick(cfg.wide.dark), 1024, 521),
    tallLight: remoteUrl(pick(cfg.tall.light), 640, 422),
    tallDark: remoteUrl(pick(cfg.tall.dark), 640, 422),
  };
}

const tpl = fs.readFileSync('README.template.md', 'utf8');
const out = tpl
  .replaceAll('{{IMG_WIDE_LIGHT}}', src.wideLight)
  .replaceAll('{{IMG_WIDE_DARK}}', src.wideDark)
  .replaceAll('{{IMG_TALL_LIGHT}}', src.tallLight)
  .replaceAll('{{IMG_TALL_DARK}}', src.tallDark);

fs.writeFileSync('README.md', out);
console.log('README.md rendered');
