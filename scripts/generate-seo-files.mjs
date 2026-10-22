// Runs after `vite build` and writes, into dist/:
//
//   robots.txt, sitemap.xml
//   _meta/<route>.html   a copy of index.html whose <head> already carries the
//                        route's title, description, canonical, social tags
//                        and JSON-LD, for crawlers and link previews that do
//                        not run JavaScript. The app itself is unchanged.
//   _redirects           Netlify rewrites (status 200) from each route to its
//                        _meta file, then a catch-all that serves the app with
//                        HTTP 404 and a noindex head, so unknown URLs are real
//                        404s (the app still renders its not-found page).
//
// Files live under _meta/ rather than at <route>/index.html because Netlify's
// Pretty URLs would then redirect /notes to /notes/, against the canonicals.
//
// The URL list comes from the same data files and slug rules the app uses,
// so new notes, posts, poems, courses and case studies are picked up on the
// next build. Demos are left out.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { generateSlug, getSlugTitle } from '../src/lib/slug.js';
import { PRIMARY_NAV, SITE_NAME, SITE_URL, absoluteUrl } from '../src/lib/siteMap.js';
import {
  DEFAULT_IMAGE,
  PAGE_META,
  articleMeta,
  caseStudyMeta,
  clipDescription,
  developerProjectMeta,
  courseMeta,
  curationMeta,
  fullTitle,
  journalMeta,
} from '../src/lib/pageMeta.js';
import { articleSchema, personSchema, websiteSchema } from '../src/lib/schema.js';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const DIST = path.join(ROOT, 'dist');
const META_DIR = '_meta';
const data = (name) => JSON.parse(fs.readFileSync(path.join(ROOT, 'src', 'data', `${name}.json`), 'utf8'));

// Stored dates are unix seconds (a few legacy ones are ISO strings).
const isoDate = (value) => {
  if (value === null || value === undefined || value === '') return undefined;
  const d = typeof value === 'number' ? new Date(value * 1000) : new Date(value);
  return Number.isNaN(d.getTime()) ? undefined : d.toISOString().slice(0, 10);
};

// Every indexable route with the head tags its page sets at runtime.
export function collectUrls() {
  const urls = [{ path: '/', priority: '1.0', meta: { ...PAGE_META['/'], jsonLd: [personSchema(data('profile'), data('education')), websiteSchema()] } }];
  const add = (p, meta, extra = {}) => urls.push({ path: p, meta, ...extra });

  for (const item of PRIMARY_NAV.flatMap((n) => n.children ?? [n])) add(item.to, PAGE_META[item.to], { priority: '0.8' });

  const articles = [
    ['notes', 'Notes', (n) => generateSlug(n.title)],
    ['posts', 'Posts', (p) => generateSlug(getSlugTitle(p))],
    ['scribbling', 'Scribbling', (s) => generateSlug(getSlugTitle(s))],
  ];
  for (const [name, section, slugOf] of articles) {
    for (const entry of data(name)) {
      const p = `/${name}/${slugOf(entry)}`;
      const meta = articleMeta(entry);
      add(p, { ...meta, jsonLd: articleSchema({ entry, path: p, description: meta.description, section }) }, { lastmod: isoDate(entry.date) });
    }
  }
  for (const c of data('courses')) if (c.slug) add(`/courses/${c.slug}`, courseMeta(c));
  for (const p of data('personalProjects')) if (p.overview) add(`/projects/case/${generateSlug(p.title)}`, caseStudyMeta(p));
  for (const p of data('developer').projects) if (p.overview) add(`/developer/${p.slug}`, developerProjectMeta(p));
  for (const tag of new Set(data('curations').map((c) => c.tag).filter(Boolean))) add(`/curations/${tag}`, curationMeta(tag));

  if (data('hobbies').some((h) => generateSlug(h.title) === 'chess')) {
    add('/hobbies/chess', PAGE_META['/hobbies/chess']);
    add('/hobbies/chess/bot', PAGE_META['/hobbies/chess/bot']);
    const journal = data('chessJournal');
    if (journal.length) {
      add('/hobbies/chess/journal', PAGE_META['/hobbies/chess/journal']);
      for (const e of journal) add(`/hobbies/chess/journal/${generateSlug(e.title)}`, journalMeta(e), { lastmod: isoDate(e.date) });
    }
  }

  // Drop duplicates and empty slugs (an entry with no usable title).
  const seen = new Set();
  return urls.filter((u) => !u.path.endsWith('/') || u.path === '/').filter((u) => !seen.has(u.path) && seen.add(u.path));
}

const xmlEscape = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const attr = (s) => String(s).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

function sitemap(urls) {
  const rows = urls.map(({ path: p, lastmod, priority }) =>
    [
      '  <url>',
      `    <loc>${xmlEscape(SITE_URL + p)}</loc>`,
      lastmod && `    <lastmod>${lastmod}</lastmod>`,
      priority && `    <priority>${priority}</priority>`,
      '  </url>',
    ]
      .filter(Boolean)
      .join('\n'),
  );
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${rows.join('\n')}\n</urlset>\n`;
}

const robots = () => `User-agent: *
Allow: /
Disallow: /${META_DIR}/

Sitemap: ${SITE_URL}/sitemap.xml
`;

// Everything between these markers in index.html is the per-page head.
const HEAD_START = '<!-- page-meta:start -->';
const HEAD_END = '<!-- page-meta:end -->';

export function headTags({ path: p, meta }) {
  const title = fullTitle(meta.title ?? SITE_NAME);
  const description = clipDescription(meta.description);
  const url = absoluteUrl(p);
  const image = absoluteUrl(meta.ogImage || DEFAULT_IMAGE);
  const tags = [
    `<title>${attr(title)}</title>`,
    `<meta name="description" content="${attr(description)}" />`,
    `<meta name="author" content="${attr(SITE_NAME)}" />`,
    meta.noindex ? '<meta name="robots" content="noindex, follow" />' : `<link rel="canonical" href="${attr(url)}" />`,
    `<meta property="og:type" content="${meta.ogType || 'website'}" />`,
    `<meta property="og:site_name" content="${attr(SITE_NAME)}" />`,
    `<meta property="og:title" content="${attr(title)}" />`,
    `<meta property="og:description" content="${attr(description)}" />`,
    `<meta property="og:url" content="${attr(url)}" />`,
    `<meta property="og:image" content="${attr(image)}" />`,
    ...(meta.ogImage ? [] : ['<meta property="og:image:width" content="1200" />', '<meta property="og:image:height" content="630" />']),
    '<meta name="twitter:card" content="summary_large_image" />',
    `<meta name="twitter:title" content="${attr(title)}" />`,
    `<meta name="twitter:description" content="${attr(description)}" />`,
    `<meta name="twitter:image" content="${attr(image)}" />`,
  ];
  if (meta.jsonLd) {
    // data-seo-jsonld lets the app's SEO component take this tag over.
    const json = JSON.stringify(meta.jsonLd).replace(/</g, '\\u003c');
    tags.push(`<script type="application/ld+json" data-seo-jsonld>${json}</script>`);
  }
  return tags.map((t) => `    ${t}`).join('\n');
}

const withHead = (template, url) => {
  const a = template.indexOf(HEAD_START);
  const b = template.indexOf(HEAD_END);
  if (a < 0 || b < 0) throw new Error(`index.html is missing the ${HEAD_START} / ${HEAD_END} markers`);
  return `${template.slice(0, a + HEAD_START.length)}\n${headTags(url)}\n    ${template.slice(b)}`;
};

export const metaFileFor = (p) => (p === '/' ? 'index.html' : `${META_DIR}${p}.html`);

// Run directly (not when imported by the checks script).
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  if (!fs.existsSync(DIST)) {
    console.error('dist/ not found: run `vite build` first.');
    process.exit(1);
  }
  const urls = collectUrls();
  const template = fs.readFileSync(path.join(DIST, 'index.html'), 'utf8');

  fs.rmSync(path.join(DIST, META_DIR), { recursive: true, force: true });
  // Moved pages first, so they win over the rewrites below.
  const rewrites = ['/projects/case/gitlatex  /developer/gitlatex  301'];
  for (const url of urls) {
    const file = metaFileFor(url.path);
    const out = path.join(DIST, file);
    fs.mkdirSync(path.dirname(out), { recursive: true });
    // The home page's own file is index.html, which also stays the SPA
    // fallback, so it only gets the home tags plus the Person schema.
    fs.writeFileSync(out, withHead(template, url));
    if (url.path !== '/') rewrites.push(`${url.path}  /${file}  200`);
  }

  // Demos are app routes too, just not indexed.
  const demoDir = path.join(ROOT, 'public', 'demo');
  for (const f of fs.existsSync(demoDir) ? fs.readdirSync(demoDir) : []) {
    if (f.endsWith('.html')) rewrites.push(`/demo/${f.slice(0, -5)}  /index.html  200`);
  }

  // Everything else: the app with a 404 status. Real files (assets, robots,
  // the legacy pages in public/) are served first, since this is not forced.
  const notFound = { path: '/404', meta: { title: 'Page not found', description: 'This page does not exist.', noindex: true } };
  fs.writeFileSync(path.join(DIST, META_DIR, '404.html'), withHead(template, notFound));
  rewrites.push(`/*  /${META_DIR}/404.html  404`);

  fs.writeFileSync(path.join(DIST, '_redirects'), `# Generated by scripts/generate-seo-files.mjs\n${rewrites.join('\n')}\n`);
  fs.writeFileSync(path.join(DIST, 'sitemap.xml'), sitemap(urls));
  fs.writeFileSync(path.join(DIST, 'robots.txt'), robots());
  console.log(`SEO files: sitemap.xml (${urls.length} URLs), robots.txt, ${urls.length - 1} route heads, ${rewrites.length} rewrites`);
}
