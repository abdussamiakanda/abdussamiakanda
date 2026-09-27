// Optimises every site image into WebP.
//
//   npm run images
//
// Originals live in media/<set>/ (never shipped); generated files go to
// public/images/<set>/. Run it again after adding or replacing a photo: only
// changed sources are re-encoded, and data files are updated to match.
//
//   media/gallery/*   -> public/images/gallery/{thumb,full}/<name>.webp
//                        and src/data/gallery.json is regenerated
//   media/<other>/*   -> public/images/<other>/<name>.webp
//                        and references in src/ are rewritten to .webp
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const MEDIA = path.join(ROOT, 'media');
const OUT = path.join(ROOT, 'public', 'images');
const SRC = path.join(ROOT, 'src');
const IMAGE_EXT = /\.(jpe?g|png|webp|avif|tiff?)$/i;

// Gallery: a grid thumbnail and a full-screen version.
const GALLERY_SIZES = { thumb: { edge: 900, quality: 76 }, full: { edge: 2400, quality: 82 } };
// Everything else: covers and figures, one size.
const SINGLE = { edge: 1600, quality: 84 };

const slug = (file) =>
  path
    .parse(file)
    .name.toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');

const kb = (bytes) => `${Math.round(bytes / 1024)} KB`;
const isStale = (src, dest) => !fs.existsSync(dest) || fs.statSync(dest).mtimeMs < fs.statSync(src).mtimeMs;

async function encode(src, dest, { edge, quality }) {
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  const isPng = /\.png$/i.test(src);
  const info = await sharp(src)
    .rotate() // apply EXIF orientation, then strip it
    .resize({ width: edge, height: edge, fit: 'inside', withoutEnlargement: true })
    // PNGs are diagrams and title cards: near-lossless keeps text and lines crisp.
    .webp(isPng ? { quality: 90, nearLossless: true, effort: 5 } : { quality, effort: 5, smartSubsample: true })
    .toFile(dest);
  return info;
}

const listImages = (dir) => (fs.existsSync(dir) ? fs.readdirSync(dir).filter((f) => IMAGE_EXT.test(f)).sort() : []);

async function gallery() {
  const dir = path.join(MEDIA, 'gallery');
  const files = listImages(dir);
  if (!files.length) return;

  const dataFile = path.join(SRC, 'data', 'gallery.json');
  const previous = fs.existsSync(dataFile) ? JSON.parse(fs.readFileSync(dataFile, 'utf8')) : [];
  const byId = new Map(previous.map((g) => [g.id, g]));

  let before = 0;
  let after = 0;
  const items = [];
  for (const [i, file] of files.entries()) {
    const src = path.join(dir, file);
    const name = slug(file);
    const outputs = {};
    for (const [size, opts] of Object.entries(GALLERY_SIZES)) {
      const dest = path.join(OUT, 'gallery', size, `${name}.webp`);
      if (isStale(src, dest)) await encode(src, dest, opts);
      outputs[size] = dest;
    }
    const meta = await sharp(outputs.full).metadata();
    before += fs.statSync(src).size;
    after += fs.statSync(outputs.full).size;

    const id = `gal_${name}`;
    const old = byId.get(id) ?? {};
    items.push({
      id,
      imageUrl: `/images/gallery/full/${name}.webp`,
      thumbUrl: `/images/gallery/thumb/${name}.webp`,
      width: meta.width,
      height: meta.height,
      title: old.title ?? '',
      order: old.order ?? i,
    });
  }
  items.sort((a, b) => a.order - b.order);
  fs.writeFileSync(dataFile, JSON.stringify(items, null, 2) + '\n');
  console.log(`gallery: ${items.length} photos, ${kb(before)} -> ${kb(after)} (full size)`);
}

// Rewrites "/images/<set>/<file>.<ext>" references in src/ to the .webp output.
function rewriteReferences(map) {
  const walk = (d) => fs.readdirSync(d, { withFileTypes: true }).flatMap((e) => (e.isDirectory() ? walk(path.join(d, e.name)) : [path.join(d, e.name)]));
  for (const file of walk(SRC).filter((f) => /\.(json|jsx?|css)$/.test(f))) {
    const text = fs.readFileSync(file, 'utf8');
    let next = text;
    for (const [from, to] of map) next = next.split(from).join(to);
    if (next !== text) {
      fs.writeFileSync(file, next);
      console.log(`  updated ${path.relative(ROOT, file)}`);
    }
  }
}

async function singles() {
  const sets = fs.existsSync(MEDIA) ? fs.readdirSync(MEDIA).filter((d) => d !== 'gallery' && fs.statSync(path.join(MEDIA, d)).isDirectory()) : [];
  const refs = [];
  for (const set of sets) {
    let before = 0;
    let after = 0;
    const files = listImages(path.join(MEDIA, set));
    for (const file of files) {
      const src = path.join(MEDIA, set, file);
      const name = slug(file);
      const dest = path.join(OUT, set, `${name}.webp`);
      if (isStale(src, dest)) await encode(src, dest, SINGLE);
      before += fs.statSync(src).size;
      after += fs.statSync(dest).size;
      refs.push([`/images/${set}/${file}`, `/images/${set}/${name}.webp`]);
    }
    if (files.length) console.log(`${set}: ${files.length} images, ${kb(before)} -> ${kb(after)}`);
  }
  rewriteReferences(refs);
}

await gallery();
await singles();
