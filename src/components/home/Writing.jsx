import { useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import IndexList from '../IndexList';
import FilterTabs from '../ui/FilterTabs';
import { ArrowLink, SectionHeading } from '../ui/primitives';
import { formatDate, yearOf } from '../../lib/format';
import { generateSlug, getSlugTitle } from '../../services/dataService';

export default function Writing({ notes, posts, scribbles }) {
  const tabs = [
    {
      value: 'notes',
      label: 'Notes',
      count: notes.length,
      to: '/notes',
      items: notes.slice(0, 4).map((n) => ({
        key: n.id,
        to: `/notes/${generateSlug(n.title)}`,
        title: n.title,
        description: n.description,
        meta: formatDate(n.date, 'short'),
        image: n.imageUrl,
      })),
    },
    {
      value: 'posts',
      label: 'Posts',
      count: posts.length,
      to: '/posts',
      items: posts.slice(0, 4).map((p) => ({
        key: p.id,
        to: `/posts/${generateSlug(getSlugTitle(p))}`,
        title: p.title,
        subtitle: p.englishTitle && p.englishTitle !== p.title ? p.englishTitle : null,
        meta: formatDate(p.date, 'short'),
        image: p.imageUrl,
      })),
    },
    {
      value: 'scribbling',
      label: 'Scribbling',
      count: scribbles.length,
      to: '/scribbling',
      items: scribbles.slice(0, 4).map((s) => ({
        key: s.id,
        to: `/scribbling/${generateSlug(getSlugTitle(s))}`,
        title: s.title,
        subtitle: s.englishTitle && s.englishTitle !== s.title ? s.englishTitle : null,
        tag: s.tag,
        meta: yearOf(s.date) ?? '',
      })),
    },
  ].filter((t) => t.count > 0);

  const [active, setActive] = useState(tabs[0]?.value);
  const current = tabs.find((t) => t.value === active) ?? tabs[0];
  if (!current) return null;

  return (
    <section id="writing" className="relative py-28 md:py-40">
      <div className="shell">
        <SectionHeading
          index="08"
          label="Writing"
          lines={['Notes, essays', <span key="i" className="italic text-ink-2">& verse.</span>]}
          aside="Physics explained for students, essays on the road from Khulna to Lincoln, and poems in Bangla."
        />
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <FilterTabs id="writing" options={tabs} value={current.value} onChange={setActive} />
          <ArrowLink to={current.to}>All {current.label.toLowerCase()}</ArrowLink>
        </div>
        <AnimatePresence mode="wait">
          <motion.div key={current.value} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} transition={{ duration: 0.3 }}>
            <IndexList items={current.items} />
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
}
