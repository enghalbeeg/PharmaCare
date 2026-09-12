/* Generates PWA PNG icons from an inline SVG using sharp.
   Run once:  npm i sharp  &&  node tools/generate-icons.mjs
   (sharp is only needed to (re)generate icons; the app itself needs no build.) */
import sharp from 'sharp';
import { mkdirSync } from 'fs';

mkdirSync('assets/icons', { recursive: true });

// logoScale: fraction of canvas the logo occupies (smaller = more padding for maskable safe-zone)
function svg(size, logoScale, rounded) {
  const s = size, r = rounded ? size * 0.22 : 0;
  const g = logoScale * size;            // logo box size
  const o = (size - g) / 2;              // logo offset (centred)
  const k = g / 24;                      // scale factor from 24-unit glyph
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${s}" height="${s}" viewBox="0 0 ${s} ${s}">
    <defs><linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#14b8a6"/><stop offset="0.55" stop-color="#0d9488"/><stop offset="1" stop-color="#0f766e"/>
    </linearGradient></defs>
    <rect width="${s}" height="${s}" rx="${r}" ry="${r}" fill="url(#bg)"/>
    <g transform="translate(${o} ${o}) scale(${k})" fill="none" stroke="#ffffff"
       stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="m19 8-7 7-7-7"/><path d="M12 2v13"/><circle cx="12" cy="20" r="2" fill="#ffffff" stroke="none"/>
    </g></svg>`;
}

const jobs = [
  ['assets/icons/icon-192.png', svg(192, 0.56, true)],
  ['assets/icons/icon-512.png', svg(512, 0.56, true)],
  ['assets/icons/icon-maskable-512.png', svg(512, 0.46, false)],
];

for (const [out, markup] of jobs) {
  await sharp(Buffer.from(markup)).png().toFile(out);
  console.log('wrote', out);
}
console.log('Done.');
