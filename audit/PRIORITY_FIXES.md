# Priority Fixes — abdussamiakanda.com

Audit date: 2026-10-22. Full register: [WEBSITE_AUDIT_REPORT.md](WEBSITE_AUDIT_REPORT.md).

## Fixed in this pass (most important first)

| # | Issue | Impact | What changed |
|---|---|---|---|
| 1 | **Canonical URLs pointed to a 404 domain** (`abdussamiakanda.web.app`) on every page | Search engines were told the "real" copy of each page is a dead URL | `SITE_URL` constant (`src/lib/siteMap.js`) drives canonical, `og:url`, sitemap; `index.html` has a static canonical |
| 2 | **No robots.txt / sitemap.xml** (both served the HTML app) | Crawlers had no URL list; robots file invalid | `scripts/generate-seo-files.mjs` runs after `vite build`; 40 URLs |
| 3 | **Render-blocking Font Awesome kit + jsDelivr script on every page**, used only by `/vasp` | Slower first render everywhere; third-party dependency for all visitors | Both now load only inside `/vasp`; that also fixes VASP maths, which never rendered |
| 4 | **Home CLS 0.168** | Fails Core Web Vitals "good" threshold | Footer waits for content; `scrollbar-gutter: stable` → CLS 0.000 locally |
| 5 | **Text contrast below WCAG AA** for labels/meta text (both themes) and the light-theme accent | Hard to read; accessibility failure | Three colour tokens adjusted, keeping the palette |
| 6 | **29 dependency vulnerabilities** (2 critical) | Dev-server file read, known router issues | Non-breaking `npm audit fix`: 29 → 10 |
| 7 | Broken social previews (relative 300×300 favicon) | Shared links show no or a tiny image | 1200×630 card, absolute URLs |
| 8 | Soft 404s indexable; no structured data; weak descriptions | Thin/error pages in results; no rich understanding of the person | `noindex` on all not-found states; Person/WebSite/BlogPosting JSON-LD; better descriptions |
| 9 | `/demo/<unknown>` rendered the whole site inside the frame | Broken page | Shows "Demo not found" |
| 10 | Overflow at 320 px on Research and Chess | Clipped content on small phones | Grid min-width fixes |
| 11 | Skip link, hero heading name, dropdown Escape, `aria-current`, input labels | Keyboard and screen-reader usability | Implemented in shared components |
| 12 | Unguarded `localStorage` reads | Blank pages when site storage is blocked | Guarded with fallback to bundled data |
| 13 | Lint failing (191 errors), no tests | No safety net for changes | Lint clean (0 errors); `npm run check` / `npm test` added |
| 14 | No security headers | Clickjacking / MIME sniffing exposure | `netlify.toml` headers (live after deploy) |

## Second pass (same day)

| # | Change |
|---|---|
| 15 | `/admin` and `/vasp` removed with all their code, Firebase app code, and the `firebase`, `moment`, `marked` packages (audit: 10 → 6 advisories, 0 high) |
| 16 | Every route now ships its own static `<head>` (title, description, canonical, social tags, JSON-LD) via `dist/_meta/` + `_redirects`; unknown URLs return a real HTTP 404 |
| 17 | Header progress bar: one bar under the header (reading progress on articles), pinned to the top edge when the header hides, beneath dropdowns |
| 18 | Gilbert-damping figure: curve and ball stay connected; curve redraws every loop |
| 19 | Marquee pauses on hover; Bangla articles marked `lang="bn"`; demo iframe sandbox tightened |

## Still needs attention

| Priority | Item | Why | Suggested action |
|---|---|---|---|
| Medium | Realtime Database rules for the legacy pages | `/log`, `/quran` still use the database; `database.rules.json` only covers `/website` (writable by any signed-in user) and has no rules for `/life`, `/posts`, `/public` | Check the deployed rules in the Firebase console and limit writes to your UID. If `/website` is no longer used by anything, remove it |
| Medium | Entry bundle 343 kB gzip (PERF-04) | Three animation libraries + all content JSON in the first download | Standardise on one animation library (Motion is used most); lazy-load note/post bodies |
| Low | Remaining audit advisories (SEC-02) | 6 low/moderate, need breaking upgrades | Track `@tailwindcss/typography`, `katex`/`rehype-katex` releases |
| Low | Content-Security-Policy | Defence in depth | Start with `Content-Security-Policy-Report-Only` in `netlify.toml` |
| Low | `/README.md` published (SEO-09) | Housekeeping | Delete `public/README.md` if not intended |
| Low | `.env` | Holds Firebase config for the removed React tools (not committed) | Delete locally and remove the `VITE_FIREBASE_*` variables from Netlify if set |

## Manual steps for the owner

1. **Deploy** (push to the branch Netlify builds). Then confirm: `/robots.txt` and `/sitemap.xml` return text/XML; a page source (`view-source:https://abdussamiakanda.com/research`) shows its own `<title>` and canonical; `curl -I https://abdussamiakanda.com/does-not-exist` returns `404`; `curl -I` shows the security headers.
2. **Submit the sitemap** in Google Search Console (`https://abdussamiakanda.com/sitemap.xml`) and request reindexing of the home page so the corrected canonical is picked up.
3. Review the Realtime Database rules as above.
4. Optional: paste a post URL into LinkedIn's Post Inspector or a similar card validator to confirm per-page previews.
