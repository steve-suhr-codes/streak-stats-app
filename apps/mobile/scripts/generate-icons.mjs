// Generates the app icons in ../assets from the three-flame design below.
// Run from apps/mobile:  npm run icons
// Then rebuild the native app (icons are baked in at build time; on iOS use `expo prebuild --clean`).
import { Resvg } from '@resvg/resvg-js';
import { writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { crc32, deflateSync } from 'node:zlib';

const ASSETS = join(dirname(fileURLToPath(import.meta.url)), '..', 'assets');

// ---- Design (1024×1024 canvas) --------------------------------------------------------------

const COLORS = {
  bgTop: '#FB923C',
  bgBottom: '#EA580C',
  backFlame: '#FED7AA',
  frontFlame: '#FFFFFF',
  frontCore: '#F97316',
};

// One flame in unit space: base centre at (0,0), tip at (0.05,-1).
const FLAME =
  'M 0.05,-1 C 0.30,-0.74 0.46,-0.52 0.42,-0.30 C 0.39,-0.09 0.22,0.02 0,0.02 ' +
  'C -0.22,0.02 -0.42,-0.09 -0.42,-0.31 C -0.42,-0.47 -0.33,-0.56 -0.25,-0.66 ' +
  'C -0.22,-0.56 -0.17,-0.50 -0.10,-0.47 C -0.13,-0.66 -0.04,-0.84 0.05,-1 Z';

const place = ({ x, y, size, flip = false, rotate = 0 }) =>
  `translate(${x} ${y}) rotate(${rotate}) scale(${flip ? -size : size} ${size})`;

const LEFT = place({ x: 360, y: 815, size: 470, flip: true, rotate: -16 });
const RIGHT = place({ x: 664, y: 815, size: 470, rotate: 16 });
const FRONT = place({ x: 512, y: 830, size: 610 });
// The front flame's core is the same flame shape at half size.
const CORE = 'translate(0.03 0) scale(0.5)';

const background = `
  <defs><linearGradient id="bg" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0" stop-color="${COLORS.bgTop}"/><stop offset="1" stop-color="${COLORS.bgBottom}"/>
  </linearGradient></defs>
  <rect width="1024" height="1024" fill="url(#bg)"/>`;

const flames = `
  <g transform="${LEFT}"><path d="${FLAME}" fill="${COLORS.backFlame}"/></g>
  <g transform="${RIGHT}"><path d="${FLAME}" fill="${COLORS.backFlame}"/></g>
  <g transform="${FRONT}">
    <path d="${FLAME}" fill="${COLORS.frontFlame}"/>
    <g transform="${CORE}"><path d="${FLAME}" fill="${COLORS.frontCore}"/></g>
  </g>`;

// Android's themed (monochrome) icon only uses alpha: back flames semi-opaque, core cut out.
const monochromeFlames = `
  <defs><mask id="core-cutout" maskUnits="userSpaceOnUse" x="0" y="0" width="1024" height="1024">
    <rect width="1024" height="1024" fill="#fff"/>
    <g transform="${FRONT}"><g transform="${CORE}"><path d="${FLAME}" fill="#000"/></g></g>
  </mask></defs>
  <g transform="${LEFT}"><path d="${FLAME}" fill="#fff" fill-opacity="0.55"/></g>
  <g transform="${RIGHT}"><path d="${FLAME}" fill="#fff" fill-opacity="0.55"/></g>
  <g mask="url(#core-cutout)"><g transform="${FRONT}"><path d="${FLAME}" fill="#fff"/></g></g>`;

// Android crops adaptive icons to a circle/squircle inside the middle ~61% of the canvas,
// so the foreground artwork is shrunk around the centre to stay inside that safe zone.
const ANDROID_SAFE_SCALE = 0.62;
const shrink = (content) =>
  `<g transform="translate(512 512) scale(${ANDROID_SAFE_SCALE}) translate(-512 -512)">${content}</g>`;

const svg = (content) =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024" width="1024" height="1024">${content}</svg>`;

// ---- Output ---------------------------------------------------------------------------------

const renderRgba = (svgText, size) => {
  const img = new Resvg(svgText, { fitTo: { mode: 'width', value: size } }).render();
  return { png: img.asPng(), pixels: img.pixels, width: img.width, height: img.height };
};

// App Store icons must not have an alpha channel, so the iOS icon is re-encoded as plain RGB.
const encodeRgbPng = ({ pixels, width, height }) => {
  const raw = Buffer.alloc((width * 3 + 1) * height);
  for (let y = 0; y < height; y++) {
    const row = y * (width * 3 + 1); // first byte of each row: filter type 0
    for (let x = 0; x < width; x++) {
      const src = (y * width + x) * 4;
      raw.set(pixels.subarray(src, src + 3), row + 1 + x * 3);
    }
  }
  const chunk = (type, data) => {
    const len = Buffer.alloc(4);
    len.writeUInt32BE(data.length);
    const body = Buffer.concat([Buffer.from(type), data]);
    const crc = Buffer.alloc(4);
    crc.writeUInt32BE(crc32(body));
    return Buffer.concat([len, body, crc]);
  };
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr.set([8, 2, 0, 0, 0], 8); // 8-bit, colour type 2 (RGB)
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk('IHDR', ihdr),
    chunk('IDAT', deflateSync(raw)),
    chunk('IEND', Buffer.alloc(0)),
  ]);
};

const outputs = [
  ['icon.svg', () => svg(background + flames)],
  ['icon.png', () => encodeRgbPng(renderRgba(svg(background + flames), 1024))],
  ['android-icon-background.png', () => renderRgba(svg(background), 512).png],
  ['android-icon-foreground.png', () => renderRgba(svg(shrink(flames)), 512).png],
  ['android-icon-monochrome.png', () => renderRgba(svg(shrink(monochromeFlames)), 432).png],
  ['favicon.png', () => renderRgba(svg(background + flames), 48).png],
];

for (const [name, make] of outputs) {
  writeFileSync(join(ASSETS, name), make());
  console.log(`wrote assets/${name}`);
}
