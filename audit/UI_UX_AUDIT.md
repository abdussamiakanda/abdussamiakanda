# UI/UX, Responsive & Accessibility Audit — abdussamiakanda.com

Audit date: 2026-10-22. IDs refer to [WEBSITE_AUDIT_REPORT.md](WEBSITE_AUDIT_REPORT.md).

**Method:** source review of all shared components and pages; production build served locally (`vite preview`) and inspected in Chrome — screenshots at 1568 px (dark and light themes), scripted iframe sweeps of 16 routes at 320 px measuring `scrollWidth`, layout-shift attribution via `PerformanceObserver`, keyboard checks, and WCAG contrast ratios computed from the design tokens. No screen reader was run.

## 1. Overall assessment

The site has a strong, intentional visual identity ("spin up / spin down" palette, Instrument Serif display type, mono eyebrows, hairline rules) that is applied consistently across pages through shared primitives (`Page`, `PageHeader`, `SectionHeading`, `Button`, `Chip`). Motion is rich but mostly respects `prefers-reduced-motion` (GSAP hero, marquee, Reveal/LineReveal, canvas field, CSS). The design was **not** reworked; fixes were targeted at defects.

## 2. Visual and usability findings

| ID | Finding | Evidence | Status |
|---|---|---|---|
| PERF-02 | Home page jumps after load (CLS 0.168): footer briefly sits in the first viewport under the loader, then is pushed down; the header slides 16 px sideways when the scrollbar appears; web-font swap | Layout-shift sources: `FOOTER`, nav `UL` (x 679 → 663), text nodes | ✅ Footer renders with content; `scrollbar-gutter: stable`; fonts discovered earlier. CLS 0.000 |
| FUNC-02 | `/demo/<missing>` rendered the entire site inside the demo window | `DemoPage.jsx` | ✅ Clear "Demo not found" state |
| UX-01 | Mobile menu stayed open when tapping a sub-item of the current section | `Header.jsx` drawer | ✅ Links close the drawer |
| UX-02 | Blank white page without JavaScript | `index.html` | ✅ `<noscript>` with email + CV link |
| — | Loading states: `Loader` waits 300 ms before showing (no spinner flash) and `RouteProgress` bar for code-split pages | `primitives.jsx` | Good — no change |
| — | Empty states exist for lists, filters and journals (`EmptyState`) | various | Good — no change |
| — | Footer email CTA: copy button with clipboard fallback to `mailto:` and a toast | `Footer.jsx` | Good — no change |

## 3. Responsive behaviour

Checked at 320 px (all 16 public routes listed in the main report), 768 px (spot checks), 1568–1920 px desktop.

| Route | Before (320 px) | Cause | After |
|---|---|---|---|
| `/research` | +43 px horizontal overflow (content clipped, since `body` has `overflow-x: hidden`) | The LLG-equation card's KaTeX display set the min-content width of an implicit `auto` grid track | `min-w-0` on cards, `grid-cols-1` base → 0 px |
| `/hobbies/chess` | +70 px | Recent-games grid had no explicit mobile column | `grid-cols-1` → 0 px |
| All other routes | 0 px | — | 0 px |

Notes: type scales with `clamp()` throughout; the header collapses to a drawer below `lg`; touch targets in header/footer are 36–56 px. The `.shell` container uses `clamp(1rem, 4vw, 3rem)` gutters. No fixed-width layouts found in public pages.

## 4. Accessibility (WCAG 2.2 AA)

### Contrast (A11Y-01) — fixed

Ratios computed with the WCAG relative-luminance formula:

| Token / pair | Before | After |
|---|---|---|
| Dark `--ink-3` on `--bg` / `--surface` | 3.85 / 3.51 ❌ | `#7a8c89`: 5.62 / 5.12 ✅ |
| Light `--ink-3` on `--bg` / `--bg-2` | 3.04 / 2.84 ❌ | `#5c6b68`: 5.09 / 4.76 ✅ |
| Light `--up` (links, active nav, chips) on `--bg` / `--bg-2` | 3.99 / 3.72 ❌ | `#06784f`: 5.03 / 4.69 ✅ |
| White text on light `--up` (hover-filled buttons) | 4.37 ❌ | 5.52 ✅ |
| Dark `--ink-2`, `--up`, `--down` on `--bg` | 7.89 / 11.96 / 7.16 | unchanged ✅ |

`--ink-3` drives the `.eyebrow` labels (0.72 rem) and 68 `text-ink-3` usages, so this was the widest-reaching fix. The MUI palette in `ThemeContext.jsx` was updated to match. Hierarchy between `--ink-2` and `--ink-3` is narrower in light mode but still visible.

### Other accessibility fixes

| ID | Issue | Fix | Verified |
|---|---|---|---|
| A11Y-02 | No way to skip the header | "Skip to content" link, visible on focus, targets focusable `<main id="main">` in every page via `Page.jsx` | Browser: first Tab shows it |
| A11Y-03 | Home `<h1>` split into ~20 per-letter spans for animation | Visually hidden full name; animated spans `aria-hidden` | DOM |
| A11Y-04 | Desktop dropdowns ("Writing", "More") not dismissible with Escape | Escape closes and returns focus to the trigger | Browser |
| A11Y-05 | Current page not announced | `aria-current="page"` on active links | Browser |
| A11Y-06 | Placeholder-only search fields | `aria-label` on command palette, publications filter, journal search | DOM |

### Already good (no change)

- Visible `:focus-visible` outline (2 px accent) site-wide.
- MUI Drawer/Dialog provide focus trapping and Escape for the mobile menu and command palette.
- Icon-only buttons have `aria-label`s (theme, search, menu, copy email, social links).
- Images have `alt` (decorative covers use `alt=""`); no `<img>` without `alt` on the home page.
- Marquee's duplicated track is `aria-hidden`.
- `prefers-reduced-motion` honoured by CSS, GSAP, Motion components and the canvas.

### Second pass

- **A11Y-07** — marquee now pauses on hover (it already stopped under reduced motion).
- Bangla articles carry `lang="bn"`.
- Admin and VASP tools were removed.
- **Header progress bar:** articles no longer draw a second bar at the very top; the header hairline shows reading progress, stays pinned to the top edge when the header hides on scroll, and no longer paints over open dropdowns.
- **Precession figure:** the curve's drawn end now tracks the moving tip (≤0.06 px apart, measured) and the curve redraws on every loop instead of only the first.

## 5. Recommendations (not implemented)

1. Consolidate on one animation library (Motion is already used in most components) — would cut roughly a third of the entry bundle and simplify motion behaviour.
2. Add a pause affordance to the marquee.
3. Consider fuller Gallery/Hobbies introductions (owner's copy).
