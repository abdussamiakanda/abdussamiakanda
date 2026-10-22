// Titles and descriptions for the fixed pages. Read by the pages' <SEO> and by
// scripts/generate-seo-files.mjs, which writes them into each route's static
// HTML for crawlers and link previews that do not run JavaScript.
// Keep this file free of bundler-only imports so Node can load it.
import { SITE_NAME } from './siteMap.js';

export const DEFAULT_DESCRIPTION =
  'Md Abdus Sami Akanda — physicist (MS, University of Nebraska–Lincoln) working on spintronics and magnetization dynamics, and full-stack developer.';
export const DEFAULT_IMAGE = '/images/og-default.jpg'; // 1200x630, scripts/make-og-image.mjs

// "Page — Md Abdus Sami Akanda", unless the title already leads with the name.
export const fullTitle = (title = SITE_NAME) => (title.startsWith(SITE_NAME) ? title : `${title} — ${SITE_NAME}`);

// Search results cut descriptions at roughly 155–160 characters.
export const clipDescription = (text, max = 160) => {
  const clean = String(text || DEFAULT_DESCRIPTION).replace(/\s+/g, ' ').trim();
  if (clean.length <= max) return clean;
  return `${clean.slice(0, max - 1).replace(/\s+\S*$/, '')}…`;
};

export const PAGE_META = {
  '/': {
    title: 'Md Abdus Sami Akanda — Physicist & full-stack developer',
    description:
      'Md Abdus Sami Akanda: physicist (MS, University of Nebraska–Lincoln) researching spintronics and magnetization dynamics, and full-stack developer building web platforms.',
  },
  '/research': { title: 'Research', description: 'Research in spintronics, magnetization dynamics and spin waves.' },
  '/publications': { title: 'Publications', description: 'Peer-reviewed publications in magnetism and spintronics.' },
  '/speeches': { title: 'Talks & Posters', description: 'Conference talks, posters and proceedings.' },
  '/notes': { title: 'Notes', description: 'Academic notes covering topics in physics and related fields.' },
  '/posts': { title: 'Posts', description: 'Essays on academia, migration, and everything in between.' },
  '/scribbling': { title: 'Scribbling', description: 'Poems, stories and creative writing.' },
  '/projects': { title: 'Projects', description: 'Research simulations and computational physics projects.' },
  '/developer': {
    title: 'Developer',
    description: 'Full-stack web apps, platforms and packages by Md Abdus Sami Akanda: ChessBD, the ITCPR platform, GitLaTeX, FloorLab and more.',
  },
  '/courses': { title: 'Courses', description: 'Courses I have designed and taught.' },
  '/gallery': { title: 'Gallery', description: 'Moments, framed.' },
  '/hobbies': { title: 'Hobbies', description: 'Chess and other diversions.' },
  '/hobbies/chess': { title: 'Chess', description: 'Chess games and analysis by Md Abdus Sami Akanda. Play against a custom chess bot.' },
  '/hobbies/chess/bot': { title: 'Play the chess bot', description: 'Play chess against a custom AI bot. Test your skills in this interactive chess game.' },
  '/hobbies/chess/journal': { title: 'Chess journal', description: 'Annotated chess games and notes, with replayable positions.' },
};

export const curationMeta = (tag) => ({
  title: `Curated ${tag.charAt(0).toUpperCase()}${tag.slice(1)}`,
  description: `A curated selection of my favourite ${tag}.`,
});

// Strips Markdown and math so the first sentences can stand as a summary.
export const plainExcerpt = (markdown = '', max = 160) => {
  const text = String(markdown)
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/\$\$[\s\S]*?\$\$/g, ' ')
    .replace(/\$[^$\n]*\$/g, ' ')
    .replace(/!\[[^\]]*\]\([^)]*\)/g, ' ')
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/<[^>]+>/g, ' ')
    .replace(/[#>*_`~|]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  if (text.length <= max) return text;
  return `${text.slice(0, max - 1).replace(/\s+\S*$/, '')}…`;
};

// Detail pages. Each returns the props for <SEO> minus page-only flags.
export const articleMeta = (entry) => ({
  title: entry.title,
  description: entry.description || plainExcerpt(entry.content) || entry.title,
  ogType: 'article',
  ogImage: entry.imageUrl || undefined,
});

export const courseMeta = (course) => ({
  title: course.title,
  description: course.description,
  ogImage: course.imageUrl || undefined,
});

export const developerProjectMeta = (project) => ({
  title: project.title,
  description: project.description || project.tagline,
  ogType: 'article',
});

export const caseStudyMeta = (project) => ({
  title: project.title,
  description: project.description || plainExcerpt(project.overview) || `Case study: ${project.title}`,
  ogType: 'article',
});

export const journalMeta = (entry) => ({
  title: entry.title,
  description: plainExcerpt(String(entry.content ?? '').replace(/\\Chess\{[\s\S]*?\}/g, ' ')) || `Chess journal: ${entry.title}`,
  ogType: 'article',
});
