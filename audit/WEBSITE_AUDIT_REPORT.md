# Website Audit Report — abdussamiakanda.com

**Date:** 2026-10-22
**Scope:** the full repository at commit `366121d` (branch `master`, clean working tree at start) and the live site at `https://abdussamiakanda.com` (read-only HEAD/GET requests only).
**Companion reports:** [PRIORITY_FIXES.md](PRIORITY_FIXES.md) · [SEO_AUDIT.md](SEO_AUDIT.md) · [UI_UX_AUDIT.md](UI_UX_AUDIT.md)

---

## 1. Project summary

| Aspect | Finding |
|---|---|
| Framework | React 19 SPA, Vite 7, React Router 7 (`BrowserRouter`), client-side rendering only |
| Styling | Tailwind CSS 4 (design tokens in `src/index.css`), MUI 9 for Drawer/Dialog/Tooltip/Snackbar, Emotion in its own CSS layer |
| Motion | Three animation libraries: GSAP (+ScrollTrigger), Motion (framer-motion), anime.js |
| Content | Static JSON in `src/data/*.json`, bundled into the app. `src/services/dataService.js` reads `localStorage` first (admin edits), then falls back to the JSON |
| Backend | None for public pages. Firebase Auth (Google) + Realtime Database for `/admin` (writes only to `localStorage`), `/vasp` (private notes tool in RTDB) and journal editing |
| Hosting | **Netlify** (live: `Server: Netlify`, `www` → apex 301). A stale Firebase Hosting config (`firebase.json`, `.firebaserc`) also exists |
| Legacy static pages | `public/log`, `public/fax`, `public/quran`, `public/course/*.html`, `public/demo/*.html` with vendored JS in `public/assets/js` |
| Tests | None before this audit |

### Routes (from `src/App.jsx`)

Public: `/`, `/research`, `/publications`, `/speeches`, `/notes`, `/notes/:slug`, `/posts`, `/posts/:slug`, `/scribbling`, `/scribbling/:slug`, `/projects`, `/projects/case/:slug`, `/courses`, `/courses/:slug`, `/curations/:tag`, `/gallery`, `/hobbies`, `/hobbies/chess`, `/hobbies/chess/bot`, `/hobbies/chess/journal`, `/hobbies/chess/journal/:slug`, `/demo/:name`, `*` (404).
Private: `/admin` (Google sign-in), `/vasp` (redirects home when signed out).

## 2. Baseline (before any change)

| Check | Result |
|---|---|
| `npm run build` | ✅ passes; entry chunk **1,070.63 kB (344.41 kB gzip)** |
| `npm run lint` | ❌ **193 problems (191 errors, 2 warnings)** — 139 in vendored/minified `public/assets/js`, 52 in `src` |
| `npm audit` | ❌ **29 vulnerabilities (2 critical, 13 high, 9 moderate, 5 low)** |
| Tests | none present |
| Live `/robots.txt`, `/sitemap.xml` | return the SPA's `index.html` (`200 text/html`) |
| Live canonical target `https://abdussamiakanda.web.app/` | **404 Not Found** |
| Home page (local production preview, Chrome, 1920px, warm cache) | FCP 260 ms, **CLS 0.168** |
| 320 px viewport | horizontal overflow on `/research` (+43 px) and `/hobbies/chess` (+70 px) |

Measurement conditions: `vite preview` of the production build on localhost, desktop Chrome via the Claude-in-Chrome extension, no CPU/network throttling. These are **not** field data or Lighthouse scores; they are local lab measurements via the `PerformanceObserver` API. A first cold load measured FCP 3.45 s but that tab was backgrounded during load, so the figure was discarded.

## 3. Findings register

Severity: Critical / High / Medium / Low / Info. Status: ✅ Fixed · 🟡 Partially fixed · ⏳ Open (needs owner action or out of scope).
Evidence line numbers refer to the original file at `HEAD` unless stated.

### Security & privacy

| ID | Sev | Finding | Evidence | Impact | Status / fix | Verification |
|---|---|---|---|---|---|---|
| SEC-01 | High | Vulnerable dependencies: 29 advisories incl. critical `websocket-driver`, `protobufjs`; high in `vite` (dev-server path traversal / file read), `react-router`, `rollup`, `picomatch` | `npm audit` | Dev-server file disclosure on the owner's machine; known issues in shipped router code | 🟡 `npm audit fix` (semver-compatible only, lockfile + patch/minor bumps). **29 → 10** remaining | `npm audit` after; build + checks pass |
| SEC-02 | Medium | Remaining 10 advisories need breaking upgrades: `@grpc/grpc-js` via `firebase/firestore` (Firestore is never imported; server-side gRPC code, not reachable in the browser), `postcss-selector-parser` via `@tailwindcss/typography` (build-time only), `katex` low (prototype-pollution bypass of `trust`) | `npm audit` | Low practical exposure | ⏳ Documented; revisit when Firebase/typography/KaTeX publish compatible fixes | — |
| SEC-03 | Medium | No security headers on the live site (`X-Content-Type-Options`, frame protection, `Referrer-Policy`, `Permissions-Policy`) | `curl -I https://abdussamiakanda.com/` shows only HSTS | Clickjacking/MIME-sniffing exposure; full referrer leak to third parties | ✅ Added `[[headers]]` in `netlify.toml`. CSP intentionally **not** added (needs report-only trial: Google Fonts, Firebase, Font Awesome kit) | Takes effect on next Netlify deploy — **not verifiable locally** |
| SEC-04 | Medium | RTDB rules: `/website` is `.write: "auth != null"` — **any** Google account can write once signed in (the site's `/admin` lets any Google user sign in). `/vasp` and `/public` have no rules in the repo file (default deny), so the deployed rules must differ or the VASP tool would not work | `database.rules.json:4-5`; `src/pages/Admin.jsx` | Any authenticated stranger could write to the database; if `/vasp` is similarly open, see SEC-05 | ⏳ Needs owner UID + rules deploy (manual step). Recommended rule in PRIORITY_FIXES | Not tested (no intrusive testing) |
| SEC-05 | Medium | `/vasp` renders database content as HTML without sanitising (`dangerouslySetInnerHTML` for titles, `marked()` output, then `innerHTML` rewrites) | `src/pages/VaspPage.jsx:483,635,675,300-353` | Stored XSS on the owner's session if anyone else can write `/vasp` | ⏳ Low risk while only the owner can write; fix SEC-04 first, then consider DOMPurify | Code review |
| SEC-06 | Low | KaTeX `trust: true` in the Markdown renderer allows `\href{javascript:…}` and `\html*` commands | `src/components/ui/Markdown.jsx:16` | Script URLs in rendered math if content is ever untrusted (e.g. edited via localStorage) | ✅ `trust` now allows only `\href`/`\url` with `http`, `https`, `mailto` | Lint/build; content has no such commands |
| SEC-07 | Low | `/demo/:name` iframe uses `sandbox="allow-scripts allow-same-origin"` on a same-origin blob URL, which gives no isolation | `src/pages/DemoPage.jsx:56` | A demo could script the parent page | ⏳ Demos are owner-authored; dropping `allow-same-origin` may break them — needs a manual test | — |
| SEC-08 | Info | `.env` (Firebase web config) is git-ignored and not committed; Firebase web API keys are public identifiers by design. No secrets found in tracked files | `git check-ignore -v .env` | — | No action | — |
| SEC-09 | Info | `/admin` dashboard is reachable by any Google account but only writes to that visitor's own `localStorage` | `src/services/dataService.js` | None for other visitors | No action | Code review |

### Functionality & reliability

| ID | Sev | Finding | Evidence | Impact | Status / fix | Verification |
|---|---|---|---|---|---|---|
| FUNC-01 | Medium | `/vasp` maths never renders: `index.html` loaded KaTeX's **auto-render** CDN script, but never the `katex` global it depends on (the app bundles KaTeX as a module) | `index.html:41` (HEAD); `VaspPage.jsx:367` checks `window.renderMathInElement` | Equations in VASP notes show as raw `$…$` | ✅ `renderMathInElement` is now imported from `katex/contrib/auto-render` inside the VASP page | Build passes. **Not browser-verified** (page needs the owner's Google sign-in) |
| FUNC-02 | Medium | `/demo/<unknown>` loads the whole website inside the demo frame: the host's SPA fallback answers `200` with `index.html`, which passed the `res.ok` check | `src/pages/DemoPage.jsx:16-19` | Broken, confusing page for mistyped/removed demos | ✅ Detects the SPA shell and shows "Demo not found" (+`noindex`) | Browser: `/demo/nope` now shows the error state and `noindex` |
| REL-01 | Medium | Every data read called `localStorage.getItem` unguarded; it throws `SecurityError` when a visitor blocks site data, rejecting every loader | `dataService.js:302,322` | Pages render empty for privacy-hardened browsers | ✅ Reads wrapped (`readStorage`), falling back to bundled JSON | Code review + build; blocked-storage mode not reproduced in the test browser |
| REL-02 | Info | Admin edits are saved only to the editor's own `localStorage`; visitors never see them, and a stale local copy can mask newer JSON in the owner's browser | `dataService.js` header comment | Owner confusion | ⏳ Documented (by design today) | — |
| REL-03 | Info | Stale Firebase Hosting config points at a target whose `web.app` domain now 404s | `firebase.json`, `.firebaserc` | Accidental deploy to the wrong host | ⏳ Remove if Firebase Hosting is retired | `curl` |

### SEO (details in [SEO_AUDIT.md](SEO_AUDIT.md))

| ID | Sev | Finding | Evidence | Status |
|---|---|---|---|---|
| SEO-01 | **Critical** | Every page's `<link rel="canonical">` and `og:url` pointed to `https://abdussamiakanda.web.app/…`, which returns **404**. Live site is `abdussamiakanda.com` | `HEAD:src/components/SEO.jsx:12`; `curl -I` | ✅ Canonical/`og:url` now use `SITE_URL = https://abdussamiakanda.com`; trailing slashes normalised. Verified in browser |
| SEO-02 | High | No `robots.txt` or `sitemap.xml`; both URLs return the HTML shell with `200` | `curl -I` on live site | ✅ Generated at build (`scripts/generate-seo-files.mjs`): 40 URLs from the same data/slug rules as the app; `/admin`, `/vasp` disallowed |
| SEO-03 | Medium | `og:image`/`twitter:image` were the relative path `/favicon.png` (300×300); most platforms require absolute URLs, and `summary_large_image` needs a wide image | `HEAD:index.html:33,37` | ✅ New 1200×630 card `public/images/og-default.jpg` (script: `npm run og-image`), absolute URLs everywhere |
| SEO-04 | Medium | Soft 404s: unknown routes and missing notes/posts/courses/case studies/journal entries/curation tags/demos return `200` with an indexable "not found" page | `NotFoundPage.jsx`, `ArticleLayout.jsx:24` etc. | ✅ `noindex, follow` + no canonical on all not-found states. Real 404 status needs prerendering (SEO-07) |
| SEO-05 | Medium | No structured data | — | ✅ `Person` + `WebSite` JSON-LD on home (facts from `profile.json`/`education.json` only); `BlogPosting` on notes, posts, scribbling |
| SEO-06 | Medium | Home meta description was the 430-character bio (truncated in results); article fallback description was "Read: {title}" | `HEAD:src/pages/Home.jsx:104` | ✅ Purpose-written home description; articles fall back to a clean 160-char excerpt of the body; all descriptions clipped at 160 |
| SEO-07 | Medium | Client-side rendering only: crawlers that don't run JS (most social previews, some search engines) see only the default head for every URL; error pages can't return 404 | Architecture | 🟡 Static default head improved (title, description, canonical, OG, `<noscript>`). Prerendering recommended (not implemented: deployment-architecture change) |
| SEO-08 | Low | Empty chess journal (`chessJournal.json` is `[]`) is an indexable thin page | `src/data/chessJournal.json` | ✅ `noindex` while empty; omitted from sitemap |
| SEO-09 | Low | `public/README.md` (GitHub profile readme) is published at `/README.md` | `public/README.md` | ⏳ Delete if not intentional |

### Performance

| ID | Sev | Finding | Evidence | Status / verification |
|---|---|---|---|---|
| PERF-01 | High | Render-blocking third-party work on **every** page for one private tool: a synchronous Font Awesome kit script (`/assets/js/a1b0511c5a.js`, 20 kB) that then fetches 4 CSS files from `ka-f.fontawesome.com`, plus KaTeX auto-render from jsDelivr | `HEAD:index.html:40-41`; network log | ✅ Kit is injected only by `/vasp`; auto-render bundled there. Browser: public pages now contact only Google Fonts |
| PERF-02 | High | Home **CLS 0.168** (> 0.1 "good" threshold). Sources found with `layout-shift` attribution: footer rendered under the loader then pushed down; header shifting 16 px when the scrollbar appears; font swap | PerformanceObserver | ✅ Footer waits for content, `scrollbar-gutter: stable`. **CLS 0.168 → 0.000** (same conditions) |
| PERF-03 | Medium | Google Fonts loaded via `@import` inside the bundled CSS (HTML → CSS → fonts CSS → font files chain) | `HEAD:src/index.css:1` | ✅ Moved to a `<link>` in `index.html` after the existing preconnects. FCP 260 → 212 ms locally (small sample, indicative only) |
| PERF-04 | Medium | Entry chunk ~1.07 MB (345 kB gzip). Breakdown (pre-minification): react-dom 548 kB, GSAP 366 kB, motion 430 kB, content JSON 193 kB, MUI 183 kB + system 83 kB, anime.js 148 kB | Rollup module sizes | ⏳ Not changed: consolidating three animation libraries is a rewrite. See recommendations |
| PERF-05 | Low | Hashed Vite output and un-hashed legacy files share `/assets/`, so neither can be cached `immutable`; images are `max-age=0` | `curl -I`; `public/assets` | 🟡 `/images/*` now cached 1 day via `netlify.toml`. Moving legacy files out of `/assets` would allow `immutable` |
| PERF-06 | Info | Firebase chunk 341 kB → 236 kB after the audit-fix dependency updates (loaded only by `/admin`, `/vasp`, journal) | build output | — |

### Accessibility (details in [UI_UX_AUDIT.md](UI_UX_AUDIT.md))

| ID | Sev | Finding | Status |
|---|---|---|---|
| A11Y-01 | High | Contrast below WCAG AA 4.5:1 for small text: `--ink-3` 3.5–3.9:1 (dark) and 2.8–3.0:1 (light), used by `.eyebrow` labels and 68 `text-ink-3` usages; light `--up` accent 3.7–4.0:1; white on light accent 4.37:1 | ✅ Tokens adjusted (dark `--ink-3 #7a8c89` ≥4.7:1, light `--ink-3 #5c6b68` ≥4.8:1, light `--up #06784f` ≥4.7:1, white on it 5.5:1); MUI palette synced |
| A11Y-02 | Medium | No skip link; `<main>` not focusable target | ✅ "Skip to content" link (visible on focus) → `#main` on every page. Browser-verified |
| A11Y-03 | Medium | Home `<h1>` is split into one `<span>` per letter for animation; some screen readers announce letters individually | ✅ Visually hidden full name + `aria-hidden` animated copy |
| A11Y-04 | Medium | Desktop nav dropdowns could not be dismissed with Escape | ✅ Escape closes and returns focus. Browser-verified |
| A11Y-05 | Low | Active nav item not exposed (`aria-current`) | ✅ Added on desktop links and dropdown items. Browser-verified |
| A11Y-06 | Low | Search inputs (command palette, publications filter, journal search) relied on placeholder text for their name | ✅ `aria-label`s added |
| A11Y-07 | Low | Home keyword marquee moves indefinitely without a pause control (WCAG 2.2.2); it does stop under `prefers-reduced-motion` | ⏳ Open |

### Responsive / UI

| ID | Sev | Finding | Status |
|---|---|---|---|
| RESP-01 | Medium | 320 px overflow: `/research` (LLG equation card forced its grid track wider) and `/hobbies/chess` (recent-games grid) | ✅ `min-w-0`/`grid-cols-1` on the grids. Browser: 0 px overflow at 320 px on both |
| UX-01 | Low | Mobile menu stayed open when tapping a sub-item for the current page | ✅ Sub-item links close the drawer |
| UX-02 | Low | Blank page with JavaScript disabled | ✅ `<noscript>` message with email and CV link |

### Code quality

| ID | Sev | Finding | Status |
|---|---|---|---|
| CODE-01 | Medium | Lint failing with 191 errors (139 from vendored/minified files in `public/`, which are copied as-is) | ✅ `public/` excluded from ESLint; Node globals for `scripts/`; all `src` errors fixed. **0 errors**, 2 pre-existing `exhaustive-deps` warnings in admin editors left as-is |
| CODE-02 | Low | Dead code: unused `handleLogin`/`handleLogout` in VASP, unused `checkImageExists` in Skills editor, useless try/catch in `Admin.jsx`, ~30 unused catch bindings | ✅ Removed |
| CODE-03 | Low | Slug rules lived inside `dataService.js` (which imports JSON through Vite), so no script could reuse them | ✅ Extracted to `src/lib/slug.js`, shared by app, sitemap and checks |
| CODE-04 | Medium | No automated tests | ✅ `npm run check` (26 post-build checks) and `npm test` (lint + build + checks) |
| CODE-05 | Info | `src/utils/seoConfig.js` is mostly unused (only chess pages read it); `src/assets/react.svg` unused | ⏳ Left in place |

### Content

| ID | Sev | Finding | Status |
|---|---|---|---|
| CONT-01 | Info | No spelling or placeholder problems found in the pages reviewed. `DESIGN.md` describes the owner as a "PhD Candidate" while the site says MS — the doc is internal and not published | No change (owner's facts not altered) |

## 4. Totals

| Severity | Found | Fixed | Partially fixed | Open |
|---|---|---|---|---|
| Critical | 1 | 1 | 0 | 0 |
| High | 5 | 4 | 1 (SEC-01) | 0 |
| Medium | 20 | 15 | 1 (SEO-07) | 4 (SEC-02, SEC-04, SEC-05, PERF-04) |
| Low | 12 | 8 | 1 (PERF-05) | 3 (SEC-07, SEO-09, A11Y-07) |
| Info | 7 | — | — | 7 (documented, no code action needed) |
| **Total** | **45** | **28** | **3** | **7 + 7 info** |

SEC-03 (security headers) is fixed in `netlify.toml` but can only be verified after the next Netlify deploy.

## 5. Final verification

| Check | Before | After |
|---|---|---|
| `npm run lint` | 191 errors, 2 warnings | **0 errors**, 2 warnings (pre-existing) |
| `npm run build` | pass | pass (+ `sitemap.xml` 40 URLs, `robots.txt`) |
| `npm run check` | n/a | **26/26 pass** |
| `npm audit` | 29 (2 critical, 13 high) | 10 (0 critical, 4 high — all in unused Firestore/gRPC), 2 moderate, 4 low |
| Home CLS (local) | 0.168 | 0.000 |
| Third-party hosts on public pages | Google Fonts, Font Awesome, jsDelivr | Google Fonts |
| 320 px overflow | `/research` +43 px, `/hobbies/chess` +70 px | none on 16 routes checked |
| Canonical on home | `https://abdussamiakanda.web.app/` (404) | `https://abdussamiakanda.com/` |

Browser checks performed (local production preview, Chrome): home, research, publications, speeches, notes, posts, scribbling, projects, courses, gallery, hobbies, chess, chess journal, a curation tag, an existing post, a missing note, a missing curation tag, a missing demo and the 404 route at 320 px; desktop 1920 px home and publications (dark and light); keyboard skip link, dropdown Escape and `aria-current`.

## 6. Update — second pass (same day)

Changes made after the first report, at the owner's request:

| Change | Detail | Verification |
|---|---|---|
| **Removed `/admin` and `/vasp`** | Deleted the admin dashboard and its 19 editors, the VASP notes tool, `src/firebase/`, `firestoreHelpers.js`, legacy CSS (`.btn*`, `.loader`, variable bridge), and the npm packages only they used (`firebase`, `moment`, `marked`). Both URLs now return the 404 page | Browser + Netlify CLI: `/admin`, `/vasp` → 404 |
| Read-only data layer | `dataService.js` reads `src/data/*.json` directly; the `localStorage` override (written only by the admin panel) is gone, so no visitor or owner can see a stale local copy. Sort order is unchanged | Build + checks |
| Chess journal | Editing UI (shown only to signed-in admins) removed; page is read-only | Lint/build |
| Kept on purpose | `public/assets/js/a1b0511c5a.js` (Font Awesome kit), `database.rules.json`, `firebase.json`, `.firebaserc`: the legacy static pages `/log`, `/quran` and `/course/*.html` still use the kit and the same Realtime Database via their own scripts | — |
| **Per-route static heads (SEO-07)** | The build writes `dist/_meta/<route>.html` (39 routes) with that route's title, description, canonical, OG/Twitter tags and JSON-LD, and `dist/_redirects` maps each route to its file. Files sit under `_meta/` because `<route>/index.html` would make Netlify's Pretty URLs redirect `/notes` → `/notes/` | Netlify CLI 17.38 (`netlify dev --offline`): each route returns 200 with its own title/canonical, `/research/` is served without redirect |
| **Real 404 status** | Final `_redirects` rule `/*  /_meta/404.html  404` serves the app with HTTP 404 and `noindex` for unknown URLs. Files (assets, CV, robots, sitemap, legacy pages) still win | Netlify CLI: `/does-not-exist`, `/notes/does-not-exist` → 404; `/log/`, PDF, images, JS → 200 |
| Shared page metadata | `src/lib/pageMeta.js` holds every fixed page's title/description plus helpers for articles, courses, case studies, curations and journal entries; used by both the React pages and the build script (removed `src/utils/seoConfig.js`) | `npm run check` asserts unique titles and correct canonicals per route |
| Header progress bar | Article pages no longer draw a separate bar at the top of the window; the header's hairline shows reading progress through the article body. The hairline is now a separate fixed element: under the header while it shows, pinned to the top edge when the header hides on scroll, and layered beneath open dropdowns (it used to paint over them) | Browser: element at the bar's line under an open dropdown is the dropdown; bar visible at top with header hidden |
| Precession figure (Fig. 1/2, Gilbert damping) | The curve was revealed by path length while the ball moved by the spiral parameter, so they drifted apart; and two competing opacity tweens left the curve hidden after the first loop. Now one clock drives tip, drawn length (from exact cumulative arc length) and fade | Browser, 3 loops: curve end within 0.06 px of the ball; curve redraws every loop |
| Marquee pause (A11Y-07) | Pauses on hover | Code |
| Bangla articles | `lang="bn"` on the article element | Code |
| Demo sandbox (SEC-07) | `allow-same-origin` removed (the dino demo uses no storage or parent access) | Code review |

Resolved by removal: SEC-04 (admin sign-in for any Google account), SEC-05 (unsanitised VASP HTML), SEC-09, FUNC-01, REL-02. SEC-02 dropped from 10 to **6 advisories (4 low, 2 moderate, 0 high)** after `firebase` was uninstalled.

Results after this pass: `npm run lint` **0 problems**; build passes; `npm run check` **31/31**; `npm audit` 6 (low/moderate). Entry chunk 1,058.70 kB (343.00 kB gzip).

Note on `/demo/:name`: on Netlify, `/demo/dino` is served straight from `public/demo/dino.html` (the file takes precedence), so the React demo frame never appears for existing demos. That was already the live behaviour and is unchanged.

### Later additions

- **Developer identity and `/developer`.** The site now presents the owner as physicist and full-stack developer: hero, footer, bio, page title, description, `Person.jobTitle` and the social card. A top-level **Developer** nav item leads to `/developer` (17 curated projects from `src/data/developer.json`, 4 featured, category filters) and detail pages for ChessBD, ITCPR, GitLaTeX and FloorLab. The home "Lab" section became "03 — Developer"; later sections were renumbered. `programming.json` and `webDev.json` were retired; GitLaTeX moved from `/projects` (old URL 301-redirects to `/developer/gitlatex`). Descriptions were drafted from each repo's README or live site and should be reviewed by the owner. Verified in the browser at desktop width and at 320px (no overflow), and with `npm test` (44 sitemap URLs, 31/31 checks).
- **Chess board** restyled (framed board, outside coordinates, polished squares, piece shadows, warm last-move highlight, eval bar inside the frame).

## 7. Limitations

- **Not tested:** `/admin` and `/vasp` behind Google sign-in (no credentials used), the chess bot and Chess.com integration beyond page load, and Netlify-specific behaviour (headers, redirects) which only applies after deploy.
- No Lighthouse run, no Search Console or analytics access; indexing status was not verified.
- Screen-reader output was inferred from the DOM and accessibility tree, not tested with NVDA/VoiceOver.
- Database rules actually deployed in Firebase were not inspected; only the repo copy.
