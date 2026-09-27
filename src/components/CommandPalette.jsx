import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Dialog from '@mui/material/Dialog';
import { FiSearch, FiCornerDownLeft, FiFileText, FiBookOpen, FiMic, FiFeather, FiCompass, FiBox, FiEdit3, FiLayers } from 'react-icons/fi';
import {
  getPublications, getNotes, getPosts, getScribblingEntries, getSpeeches, getPersonalProjects, getCourses,
  generateSlug, getSlugTitle,
} from '../services/dataService';
import { CV_URL, flatNav } from '../lib/siteMap';

const GROUP_ICONS = {
  Pages: FiCompass,
  Publications: FiFileText,
  Talks: FiMic,
  Notes: FiBookOpen,
  Posts: FiEdit3,
  Scribbling: FiFeather,
  Projects: FiBox,
  Courses: FiLayers,
};

// Builds the searchable index once per palette mount.
async function buildIndex() {
  const [pubs, talks, notes, posts, scribbles, projects, courses] = await Promise.all([
    getPublications(), getSpeeches(), getNotes(), getPosts(), getScribblingEntries(), getPersonalProjects(), getCourses(),
  ]);
  return [
    ...flatNav().map((n) => ({ group: 'Pages', title: n.label, sub: n.hint || n.to, to: n.to })),
    { group: 'Pages', title: 'Download CV', sub: 'PDF', href: CV_URL },
    ...pubs.map((p) => ({ group: 'Publications', title: p.title, sub: `${p.journal ?? ''} ${p.year ?? ''}`.trim(), href: p.url || undefined, to: p.url ? undefined : '/publications' })),
    ...talks.map((t) => ({ group: 'Talks', title: t.title, sub: t.location, to: '/speeches' })),
    ...notes.map((n) => ({ group: 'Notes', title: n.title, sub: n.description, to: `/notes/${generateSlug(n.title)}` })),
    ...posts.map((p) => ({ group: 'Posts', title: p.title, sub: p.englishTitle !== p.title ? p.englishTitle : p.description, to: `/posts/${generateSlug(getSlugTitle(p))}` })),
    ...scribbles.map((s) => ({ group: 'Scribbling', title: s.title, sub: s.englishTitle || s.tag, to: `/scribbling/${generateSlug(getSlugTitle(s))}` })),
    ...courses.map((c) => ({ group: 'Courses', title: c.title, sub: c.language, to: `/courses/${c.slug}` })),
    ...projects.map((p) => ({ group: 'Projects', title: p.title, sub: p.technologies?.join(' · '), to: p.overview ? `/projects/case/${generateSlug(p.title)}` : '/projects' })),
  ];
}

const score = (item, q) => {
  const hay = `${item.title} ${item.sub ?? ''}`.toLowerCase();
  if (!q) return 1;
  const terms = q.toLowerCase().split(/\s+/).filter(Boolean);
  if (!terms.every((t) => hay.includes(t))) return 0;
  return item.title.toLowerCase().startsWith(terms[0]) ? 3 : 2;
};

export default function CommandPalette({ open, onClose }) {
  const navigate = useNavigate();
  const [index, setIndex] = useState([]);
  const [query, setQuery] = useState('');
  const [active, setActive] = useState(0);
  const listRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (open && index.length === 0) buildIndex().then(setIndex).catch(console.error);
    if (open) {
      setQuery('');
      setActive(0);
    }
  }, [open, index.length]);

  const results = useMemo(() => {
    const scored = index.map((item) => ({ item, s: score(item, query) })).filter((r) => r.s > 0);
    if (query) scored.sort((a, b) => b.s - a.s);
    return scored.slice(0, query ? 40 : 12).map((r) => r.item);
  }, [index, query]);

  useEffect(() => setActive(0), [query]);

  useEffect(() => {
    listRef.current?.querySelector(`[data-idx="${active}"]`)?.scrollIntoView({ block: 'nearest' });
  }, [active]);

  const go = (item) => {
    if (!item) return;
    onClose();
    if (item.href) window.open(item.href, '_blank', 'noopener');
    else navigate(item.to);
  };

  const onKeyDown = (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActive((a) => Math.min(results.length - 1, a + 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActive((a) => Math.max(0, a - 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      go(results[active]);
    }
  };

  let lastGroup = null;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="sm"
      slotProps={{
        // Centred on screen; the results area has a fixed height (below) so the
        // panel keeps its size and the input stays put while you type.
        paper: { sx: { borderRadius: '22px', overflow: 'hidden' } },
        // The dialog focuses its own container after opening, which beats
        // autoFocus; move focus to the search field once it has settled.
        transition: { onEntered: () => inputRef.current?.focus() },
      }}
    >
      <div className="flex items-center gap-3 border-b border-line px-5 py-4">
        <FiSearch className="shrink-0 text-ink-3" />
        <input
          ref={inputRef}
          autoFocus
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={onKeyDown}
          placeholder="Search papers, notes, poems, pages…"
          className="w-full bg-transparent text-base text-ink outline-none placeholder:text-ink-3"
          aria-label="Search the site"
        />
        <kbd className="hidden rounded-md border border-line px-1.5 py-0.5 font-mono text-[0.65rem] text-ink-3 sm:block">ESC</kbd>
      </div>
      <div ref={listRef} className="h-[min(26rem,55vh)] overflow-y-auto p-2" role="listbox">
        {results.length === 0 && <p className="px-4 py-10 text-center text-sm text-ink-3">No matches for “{query}”.</p>}
        {results.map((item, i) => {
          const showGroup = item.group !== lastGroup;
          lastGroup = item.group;
          const Icon = GROUP_ICONS[item.group] ?? FiCompass;
          return (
            <div key={`${item.group}-${item.title}-${i}`}>
              {showGroup && <div className="eyebrow px-3 pb-1 pt-3 text-[0.62rem]">{item.group}</div>}
              <button
                type="button"
                data-idx={i}
                role="option"
                aria-selected={i === active}
                onMouseMove={() => setActive(i)}
                onClick={() => go(item)}
                className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors ${i === active ? 'bg-surface-2' : ''}`}
              >
                <Icon className={`shrink-0 ${i === active ? 'text-up' : 'text-ink-3'}`} />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm text-ink">{item.title}</span>
                  {item.sub && <span className="block truncate text-xs text-ink-3">{item.sub}</span>}
                </span>
                {i === active && <FiCornerDownLeft className="shrink-0 text-ink-3" />}
              </button>
            </div>
          );
        })}
      </div>
      <div className="flex items-center justify-between border-t border-line px-5 py-2.5 font-mono text-[0.65rem] uppercase tracking-wider text-ink-3">
        <span>↑↓ navigate · ↵ open</span>
        <span>{results.length} results</span>
      </div>
    </Dialog>
  );
}
