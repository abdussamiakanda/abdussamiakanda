# Design Specification for Md Abdus Sami Akanda's Portfolio Redesign

This document outlines the UI/UX redesign specifications for Google Stitch. The main objective is to pivot the personal portfolio from a dual-role (Developer + Academic) site into a **highly prestigious, research-first Academic Portfolio**, with secondary development and creative writing elements nested logically below the scholarship.

---

## 1. Design Brand & Identity: "Dark Academia & Modern Physics"

The design system should bridge classical academia with the technical precision of condensed matter physics and micromagnetic simulations.

*   **Aesthetic Style**: Productive Minimalist / Editorial with Neo-Brutalist structural accents. Clean, sharp lines, generous margins, and a heavy focus on vertical reading comfort.
*   **Aesthetic Direction**: A scholarly look using high-contrast serif fonts for titles, balanced with monospace indicators for computational physics elements.
*   **Design Shift**:
    *   *Old Design*: Split 50/50 between "Software Developer" and "Graduate Student".
    *   *New Design*: **85% Academic Scholar** (Physics, Spintronics, Research, Teaching) and **15% Creative & Tech Explorer** (Web Dev, Chess, Poetry).

---

## 2. Color Palette (Dark Academia Focus)

To convey authority and scientific precision:

```yaml
colors:
  background: '#0B0F13'               # Deep void slate (near black)
  surface: '#12171E'                  # Elevation layer 1 (cards, sidebar)
  surface-bright: '#1B232E'           # Active hover, highlights
  on-surface: '#E2E8F0'               # Pristine off-white body text
  on-surface-variant: '#94A3B8'       # Cool slate subtext / metadata
  
  # Accents
  primary: '#10B981'                  # Emerald Mint (representing magnetic spin / laser pointer precision)
  primary-container: '#042F2C'        # Deep forest accent backdrop
  secondary: '#38BDF8'                # Celestial blue (representing computational nodes)
  
  # Semantic States
  border: '#1E293B'                   # Crisp, low-contrast container line
  outline: '#334155'                  # High-contrast border (focused fields)
```

---

## 3. Typography Hierarchy

The typography structure uses classic scholar serifs for display elements and high-legibility monospace fonts for computational accents.

```yaml
typography:
  display-hero:
    fontFamily: 'Lora' or 'Playfair Display'
    fontSize: '64px'
    fontWeight: '700'
    lineHeight: '1.2'
    letterSpacing: '-0.02em'
  
  headline-lg:
    fontFamily: 'Lora' or 'Playfair Display'
    fontSize: '36px'
    fontWeight: '600'
    lineHeight: '1.3'
  
  body-md:
    fontFamily: 'Inter' or 'Plus Jakarta Sans'
    fontSize: '16px'
    fontWeight: '400'
    lineHeight: '1.7'
  
  code-sm:
    fontFamily: 'JetBrains Mono'
    fontSize: '14px'
    fontWeight: '500'
    lineHeight: '1.5'
    letterSpacing: '0.05em'
```

---

## 4. Site Architecture & Page Layouts

The website should restrict itself to the following pages, prioritizing academic visibility:

### Page 1: Home (The Scholar's Desk)
*   **Purpose**: The central landing page summarizing Md Abdus Sami Akanda's academic identity, research interests, and active affiliations.
*   **UI Components**:
    *   *Hero Section*: Large serif text ("Md Abdus Sami Akanda") with subtitle: "PhD Candidate in Solid State Physics, Graduate Teaching Assistant at the University of Nebraska-Lincoln".
    *   *Quick Links*: High-contrast buttons for "Google Scholar", "CV (PDF)", "ResearchGate", and "Email".
    *   *Affiliation Banner*: Clean logo grid or text block for Khulna University & University of Nebraska-Lincoln.
    *   *Research Interests Grid*: 3-column clean Bento layout (1. Spintronics & Micromagnetic Simulations, 2. Condensed Matter Physics, 3. Computational Methods).
    *   *Recent Highlights*: A chronological list of the most recent publications or speeches (max 3).

### Page 2: Research & Publications (`/publications`)
*   **Purpose**: Highlighting scholarly work, preprints, journal articles, and software tools developed for research.
*   **UI Components**:
    *   *Filters*: Filter by category (Journals, Conference Proceedings, Preprints).
    *   *Publication Cards*: Dense, clean layout with the paper title, author list (with "Md Abdus Sami Akanda" in bold), journal name, year, and a row of quick links (e.g., "[DOI]", "[PDF]", "[Publisher link]").
    *   *Software Section*: Highlight computational physics packages (e.g., PyPI library `grefornoobs` or micromagnetic simulation helpers).

### Page 3: Talks & Presentations (`/speeches`)
*   **Purpose**: Cataloging conference talks, poster presentations, and public academic speeches.
*   **UI Components**:
    *   *Timeline Layout*: A clean vertical line showing the speech date, conference name (e.g., American Physical Society Meeting), location, and title of the presentation.
    *   *Slides & Media Links*: Attachment icons to download slides or view presentation videos.

### Page 4: Teaching & Mentorship (`/teaching`)
*   **Purpose**: Detailing educational contributions, TA roles, and general subject expertise.
*   **UI Components**:
    *   *UNL Teaching Experience*: Detailed role as Graduate Teaching Assistant (August 15, 2023 - Present) detailing lab courses instructed.
    *   *Mentorship Timeline*: Previous roles (Mathematics Advisor at Udvash, Physics Tutor at Fermion Physics Club).
    *   *Course Directory*: List of subjects taught (Mechanics, Electromagnetism, Quantum Physics, Calculus, Linear Algebra).

### Page 5: Notes & Blog (`/notes` & `/posts`)
*   **Purpose**: Educational resources (physics/math notes) and narrative essays.
*   **UI Components**:
    *   *Notes Section*: Minimalist clean list of academic explanations (e.g., "The Landau-Lifshitz-Gilbert equation", "Why an electron cannot exist inside the nucleus"). Supports LaTeX rendering (KaTeX) for math equations.
    *   *Blog Posts Section*: Standard article view for longer pieces (e.g., "Crossing Continents for Education").

### Page 6: Creative Corner & Chess (`/scribbling` & `/chess` - Secondary)
*   **Purpose**: Personal interests kept isolated from the primary academic sections.
*   **UI Components**:
    *   *Scribbles*: Poems and short stories (e.g., "প্রথম ফাল্গুণ", "monoharini") displayed in a soft, lower-contrast, elegant typography.
    *   *Chess Journal / Bot*: Log of chess matchups and links to play against the chess bot, labeled as a casual hobby.

---

## 5. Visual Hierarchy & Interactive Guidelines

1.  **Academic Primacy**: Place Publications and Speeches directly in the primary top navigation bar. Developer projects and Chess are demoted to a nested dropdown under "More" or a footer section.
2.  **LaTeX Integration**: Math formulas (rendered using rehype-katex) must look native. Use pristine spacing, slight horizontal padding, and a dedicated background shading for block equations.
3.  **Glassmorphism for Nav**: A simple, high-blur navigation bar containing simple page anchors.
4.  **Borders & Separation**: Maintain separation of scholarly items using 1px slate-800 lines rather than card shadows. The look should feel like a premium scientific report.
