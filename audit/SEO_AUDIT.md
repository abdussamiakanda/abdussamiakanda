# SEO Audit — abdussamiakanda.com

Audit date: 2026-10-22. Live origin: `https://abdussamiakanda.com` (Netlify; `www` → apex `301`, HSTS on).
IDs refer to [WEBSITE_AUDIT_REPORT.md](WEBSITE_AUDIT_REPORT.md).

## 1. Indexing configuration

| Item | Before | After | Notes |
|---|---|---|---|
| Canonical (all pages) | `https://abdussamiakanda.web.app{path}` — that host returns **404** (SEO-01, Critical) | `https://abdussamiakanda.com{path}`, trailing slash stripped except on `/`; omitted on `noindex` pages | Also a static canonical in `index.html` for non-JS crawlers |
| `robots.txt` | Missing (SPA shell served, `text/html`) | Generated: allows all, disallows `/_meta/` (internal head files), links sitemap | Netlify serves real files before the `/*` rewrite |
| `sitemap.xml` | Missing (SPA shell) | Generated at build: **40 URLs**, `lastmod` from entry dates where known | Source: `scripts/generate-seo-files.mjs`; uses `src/lib/slug.js`, the same slug rules as the app |
| `noindex` | Never set | Set on 404, missing note/post/scribble/course/case study/journal entry, empty curation tag, missing demo, empty chess journal, `/vasp`; `X-Robots-Tag: noindex` for `/admin`, `/vasp` via `netlify.toml` | Soft-404 mitigation (SEO-04) |
| HTTP status of error pages | `200` | **404** for unknown URLs (second pass) | Missing entries on known patterns (e.g. `/notes/x`) also get 404 |
| Trailing slashes | Both forms render the same page | Canonical normalises to no slash | Netlify serves both; no redirect added (untestable locally) |
| Language | `<html lang="en">` | unchanged; `BlogPosting.inLanguage` is `bn` for Bangla entries | Per-page `lang` for Bangla articles would be a further improvement |
| Staging/indexing risks | None found (no `noindex` in production, no env-based robots) | — | Stale `firebase.json` targets a host that now 404s (REL-03) |
| Verification file | `public/google3f132bf5a1c2da4f.html` present | kept | Suggests Search Console is set up — submit the sitemap there |

## 2. Page-by-page titles and descriptions

Title template: `{Page} — Md Abdus Sami Akanda`. Descriptions are clipped to 160 characters by `SEO.jsx`.

| Route | Title (after) | Description source | Issues found → action |
|---|---|---|---|
| `/` | Md Abdus Sami Akanda — Physicist, spintronics research | Purpose-written (157 chars) | Was name-only title and a 430-char bio as description → fixed (SEO-06). Person + WebSite JSON-LD added |
| `/research` | Research — … | "Research in spintronics, magnetization dynamics and spin waves." | OK |
| `/publications` | Publications — … | "Peer-reviewed publications in magnetism and spintronics." | OK. Individual papers link out to publishers (no per-paper pages; ScholarlyArticle schema not added since there are no pages to attach it to) |
| `/speeches` | Talks & Posters — … | "Conference talks, posters and proceedings." | OK. Path `/speeches` vs label "Talks" — kept to avoid breaking links |
| `/notes` | Notes — … | "Academic notes covering topics in physics and related fields." | OK |
| `/notes/:slug` (12) | {note title} — … | `description` field, else body excerpt | Fallback was "Read: {title}" → fixed. BlogPosting JSON-LD |
| `/posts` | Posts — … | "Essays on academia, migration, and everything in between." | OK |
| `/posts/:slug` (3) | {post title} — … | `description` field | BlogPosting JSON-LD; Bangla post marked `inLanguage: bn` |
| `/scribbling` | Scribbling — … | "Poems, stories and creative writing." | OK |
| `/scribbling/:slug` | {title} — … | description or excerpt | Slugs use the English title when present |
| `/projects` | Projects — … | "Research simulations and software projects." | OK |
| `/projects/case/:slug` (2) | {project} — … | project description | OK |
| `/courses` | Courses — … | "Courses I have designed and taught." | OK |
| `/courses/:slug` (6) | {course} — … | course description | OK; `ogImage` = course cover (now absolute) |
| `/curations/movies` | Curated Movies — … | generated | OK; unknown tags now `noindex` |
| `/gallery` | Gallery — … | "Moments, framed." | Thin description (17 chars). Left as owner's voice; consider a fuller sentence |
| `/hobbies` | Hobbies — … | "Chess and other diversions." | Short; acceptable |
| `/hobbies/chess` | Chess — … | `seoConfig.chess` | OK |
| `/hobbies/chess/bot` | Play the chess bot — … | `seoConfig.chessBot` | OK |
| `/hobbies/chess/journal` | Chess journal — … | static | Empty → `noindex`, excluded from sitemap until entries exist |
| `/demo/:name` | Demo — {name} — … | generic | Not in sitemap; `noindex` when missing |
| `*` | Page not found — … | static | `noindex` |
| `/admin`, `/vasp` | removed | — | Now return HTTP 404 (second pass) |

No duplicate titles were found among indexable routes (each dynamic title comes from a unique entry title; uniqueness of slugs is enforced by `npm run check`).

`keywords` meta is still set on chess pages; it is ignored by Google and harmless.

## 3. Social sharing (Open Graph / Twitter)

| Before | After |
|---|---|
| `og:image` = `/favicon.png` (relative, 300×300) with `twitter:card=summary_large_image` | `https://abdussamiakanda.com/images/og-default.jpg` (1200×630), or the entry's own cover image made absolute |
| `og:url` on the dead `web.app` host | production URL |
| `og:title`/`description` only after JS | Static defaults in `index.html`, then per-page values |

**Update (second pass):** every route now ships its own static head (`dist/_meta/<route>.html`, mapped by `dist/_redirects`), so Facebook, LinkedIn, Slack and X — which do not run JavaScript — see each page's own title, description and image. Unknown URLs now return HTTP 404 with `noindex`. Verified with the Netlify CLI locally; confirm on the live site after deploy.

## 4. Structured data

| Page | Type | Fields (all from existing site content) |
|---|---|---|
| Home | `Person` (`@id …/#person`) | name, url, image (portrait), short description, email, `sameAs` (9 profile links from `profile.json`), `alumniOf` (University of Nebraska-Lincoln, Khulna University), `knowsAbout` (research topics listed on the site) |
| Home | `WebSite` | name, url, language, publisher → Person |
| Notes, posts, scribbling | `BlogPosting` | headline, alternativeHeadline (English title of Bangla entries), description, url, datePublished, image, section, language, author, publisher |

Not added deliberately: ratings/reviews, `Organization`, breadcrumbs (no visible breadcrumb UI), `ScholarlyArticle` (papers have no pages here). Validate after deploy with Google's Rich Results Test / Schema Markup Validator — not done here because the changes are not live.

## 5. Internal linking and crawlability

- All primary/secondary routes are linked from the header, footer and home sections; detail pages link back to their index and to previous/next entries.
- `npm run check` verifies that every sitemap URL matches a declared route, that internal Markdown links in content resolve, and that referenced images/files exist (all pass).
- Content is rendered client-side. Google renders JavaScript, but rendering is deferred and other engines may not render at all.
- `/README.md` (GitHub profile readme from `public/`) is publicly served — remove unless intended (SEO-09).

## 6. Recommendations not implemented

1. ~~Per-route static heads and real 404s~~ — done in the second pass. Full body prerendering (page text in the HTML) is still optional; Google renders the JavaScript content.
2. Submit `sitemap.xml` in Search Console and monitor "Duplicate, Google chose different canonical" for the period while the old `web.app` canonicals are replaced.
3. ~~`lang="bn"` on Bangla articles~~ — done.
4. Expand the Gallery and Hobbies descriptions in the owner's own words.
