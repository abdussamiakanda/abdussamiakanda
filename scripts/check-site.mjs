// Post-build sanity checks for routes, links, assets and SEO wiring.
//
//   npm run build && npm run check
//
// Exits non-zero on any failure. No network access and no extra packages.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { collectUrls, metaFileFor } from './generate-seo-files.mjs';
import { generateSlug, getSlugTitle } from '../src/lib/slug.js';
import { SITE_URL } from '../src/lib/siteMap.js';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const DIST = path.join(ROOT, 'dist');
const read = (...p) => fs.readFileSync(path.join(...p), 'utf8');
const data = (name) => JSON.parse(read(ROOT, 'src', 'data', `${name}.json`));

const failures = [];
let passed = 0;
const check = (name, ok, detail = '') => {
  if (ok) passed += 1;
  else failures.push(`${name}${detail ? `\n    ${detail}` : ''}`);
};

if (!fs.existsSync(path.join(DIST, 'index.html'))) {
  console.error('dist/index.html not found: run `npm run build` first.');
  process.exit(1);
}

// --- Routes declared in App.jsx, as regular expressions --------------------
const routePatterns = [...read(ROOT, 'src', 'App.jsx').matchAll(/<Route path="([^"]+)"/g)]
  .map((m) => m[1])
  .filter((p) => p !== '*')
  .map((p) => new RegExp(`^${p.replace(/:[^/]+/g, '[^/]+')}$`));
const isRoute = (p) => routePatterns.some((re) => re.test(p));
const inDist = (p) => fs.existsSync(path.join(DIST, decodeURIComponent(p)));

// --- index.html head -------------------------------------------------------
const html = read(DIST, 'index.html');
check('index.html: canonical uses the production origin', html.includes(`<link rel="canonical" href="${SITE_URL}/"`));
check('index.html: og:image is an absolute URL', /property="og:image" content="https:\/\//.test(html));
check('index.html: og:image file exists', inDist('/images/og-default.jpg'));
check('index.html: no render-blocking Font Awesome kit', !html.includes('a1b0511c5a.js'));
check('index.html: no global KaTeX auto-render script', !html.includes('auto-render.min.js'));
check('App.jsx: admin and VASP routes are gone', !/path="\/(admin|vasp)"/.test(read(ROOT, 'src', 'App.jsx')));
check('index.html: has <html lang>', /<html lang="[a-z-]+"/i.test(html));
check('index.html: fonts linked from the document', html.includes('fonts.googleapis.com/css2'));
const css = fs.readdirSync(path.join(DIST, 'assets')).filter((f) => f.endsWith('.css')).map((f) => read(DIST, 'assets', f)).join('\n');
check('bundled CSS: no @import of remote fonts', !/@import\s+url\(["']?https:\/\/fonts/.test(css));

// --- robots.txt and sitemap.xml -------------------------------------------
check('robots.txt exists', inDist('/robots.txt'));
check('sitemap.xml exists', inDist('/sitemap.xml'));
if (inDist('/robots.txt')) check('robots.txt points at the sitemap', read(DIST, 'robots.txt').includes(`Sitemap: ${SITE_URL}/sitemap.xml`));
if (inDist('/sitemap.xml')) {
  const xml = read(DIST, 'sitemap.xml');
  const locs = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
  check('sitemap.xml: has URLs', locs.length > 5, `${locs.length} URLs`);
  const off = locs.filter((u) => !u.startsWith(`${SITE_URL}/`));
  check('sitemap.xml: every URL on the production origin', off.length === 0, off.join(', '));
  const unrouted = locs.map((u) => u.slice(SITE_URL.length)).filter((p) => !isRoute(p));
  check('sitemap.xml: every URL matches an app route', unrouted.length === 0, unrouted.join(', '));
}

// --- Per-route static heads and their rewrites -----------------------------
{
  const urls = collectUrls();
  const redirects = inDist('/_redirects') ? read(DIST, '_redirects') : '';
  const missing = [];
  const wrongCanonical = [];
  const unrouted = [];
  const titles = new Map();
  for (const { path: p } of urls) {
    const file = metaFileFor(p);
    if (!inDist(`/${file}`)) {
      missing.push(file);
      continue;
    }
    const page = read(DIST, file);
    const canonical = page.match(/<link rel="canonical" href="([^"]+)"/)?.[1];
    if (canonical !== `${SITE_URL}${p}`) wrongCanonical.push(`${p} → ${canonical}`);
    const title = page.match(/<title>([^<]*)<\/title>/)?.[1];
    titles.set(title, [...(titles.get(title) ?? []), p]);
    if (!page.includes('<div id="root"></div>') || !/<script type="module"[^>]+src="\/assets\/index-/.test(page)) missing.push(`${file} (app shell)`);
    if (p !== '/' && !redirects.includes(`${p}  /${file}  200`)) unrouted.push(p);
  }
  const dupes = [...titles].filter(([, ps]) => ps.length > 1).map(([t, ps]) => `${t}: ${ps.join(', ')}`);
  check('route heads: a file for every sitemap URL, with the app shell', missing.length === 0, missing.join(', '));
  check('route heads: canonical matches the route', wrongCanonical.length === 0, wrongCanonical.join('\n    '));
  check('route heads: titles are unique', dupes.length === 0, dupes.join('\n    '));
  check('_redirects: rewrites every route to its head file', unrouted.length === 0, unrouted.join(', '));
  check('robots.txt: keeps /_meta/ out of the index', !inDist('/robots.txt') || read(DIST, 'robots.txt').includes('Disallow: /_meta/'));
}

// --- Slugs: non-empty and unique per section -------------------------------
const sections = {
  notes: data('notes').map((n) => generateSlug(n.title)),
  posts: data('posts').map((p) => generateSlug(getSlugTitle(p))),
  scribbling: data('scribbling').map((s) => generateSlug(getSlugTitle(s))),
  courses: data('courses').map((c) => c.slug),
};
for (const [name, slugs] of Object.entries(sections)) {
  const empty = slugs.filter((s) => !s).length;
  const dupes = slugs.filter((s, i) => s && slugs.indexOf(s) !== i);
  check(`${name}: every entry has a slug`, empty === 0, `${empty} without one`);
  check(`${name}: slugs are unique`, dupes.length === 0, dupes.join(', '));
}

// --- Internal links and assets referenced from content ---------------------
const brokenAssets = [];
const brokenLinks = [];
for (const file of fs.readdirSync(path.join(ROOT, 'src', 'data'))) {
  const text = read(ROOT, 'src', 'data', file);
  for (const [, ref] of text.matchAll(/"(\/[^"\s#?]+\.(?:webp|png|jpe?g|gif|svg|pdf|html))"/gi)) {
    if (!inDist(ref)) brokenAssets.push(`${file}: ${ref}`);
  }
  for (const [, ref] of text.matchAll(/\]\((\/[^)\s]*)\)/g)) {
    const p = ref.split(/[?#]/)[0];
    if (!p) continue;
    if (/\.\w+$/.test(p) ? !inDist(p) : !isRoute(p.replace(/\/$/, '') || '/')) brokenLinks.push(`${file}: ${ref}`);
  }
}
check('content: referenced images/files exist', brokenAssets.length === 0, brokenAssets.join('\n    '));
check('content: internal Markdown links resolve', brokenLinks.length === 0, brokenLinks.join('\n    '));

// Navigation targets all resolve.
const navTargets = collectUrls().map((u) => u.path);
const deadNav = navTargets.filter((p) => !isRoute(p));
check('navigation: every nav target is a route', deadNav.length === 0, deadNav.join(', '));

// --- Report ----------------------------------------------------------------
if (failures.length) {
  console.error(`✗ ${failures.length} check(s) failed, ${passed} passed:\n  - ${failures.join('\n  - ')}`);
  process.exit(1);
}
console.log(`✓ All ${passed} site checks passed.`);
