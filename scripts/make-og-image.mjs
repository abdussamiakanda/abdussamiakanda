// Builds the default social-sharing card (Open Graph / Twitter).
//
//   node scripts/make-og-image.mjs
//
// media/portrait/sami.JPG -> public/images/og-default.jpg (1200 x 630).
// Run it again after changing the portrait or the wording below.
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SRC = path.join(ROOT, 'media', 'portrait', 'sami.JPG');
const OUT = path.join(ROOT, 'public', 'images', 'og-default.jpg');

const W = 1200;
const H = 630;
const PORTRAIT_W = 440;

const text = `
<svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg">
  <rect x="${PORTRAIT_W}" y="0" width="${W - PORTRAIT_W}" height="${H}" fill="#070a0b"/>
  <rect x="${PORTRAIT_W + 64}" y="200" width="48" height="2" fill="#34e3a0"/>
  <text x="${PORTRAIT_W + 64}" y="176" font-family="Consolas, 'Courier New', monospace" font-size="20" letter-spacing="3" fill="#95a7a4">PHYSICIST · FULL-STACK DEVELOPER</text>
  <text x="${PORTRAIT_W + 60}" y="300" font-family="Georgia, 'Times New Roman', serif" font-size="78" fill="#e4eeec">Md Abdus Sami</text>
  <text x="${PORTRAIT_W + 60}" y="388" font-family="Georgia, 'Times New Roman', serif" font-size="78" font-style="italic" fill="#e4eeec">Akanda<tspan fill="#34e3a0" font-style="normal">.</tspan></text>
  <text x="${PORTRAIT_W + 64}" y="460" font-family="Arial, Helvetica, sans-serif" font-size="24" fill="#95a7a4">Spintronics research · Web platforms &amp; tools</text>
  <text x="${PORTRAIT_W + 64}" y="560" font-family="Consolas, 'Courier New', monospace" font-size="20" letter-spacing="2" fill="#34e3a0">abdussamiakanda.com</text>
</svg>`;

const portrait = await sharp(SRC).rotate().resize(PORTRAIT_W, H, { fit: 'cover', position: 'attention' }).toBuffer();

await sharp({ create: { width: W, height: H, channels: 3, background: '#070a0b' } })
  .composite([
    { input: portrait, left: 0, top: 0 },
    { input: Buffer.from(text), left: 0, top: 0 },
  ])
  .jpeg({ quality: 84, mozjpeg: true })
  .toFile(OUT);

console.log(`Wrote ${path.relative(ROOT, OUT)}`);
