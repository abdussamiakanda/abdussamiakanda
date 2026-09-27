import { useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import Page, { PageHeader } from '../components/Page';
import IndexList from '../components/IndexList';
import FilterTabs from '../components/ui/FilterTabs';
import { EmptyState } from '../components/ui/primitives';
import useAsync from '../lib/useAsync';
import { yearOf } from '../lib/format';
import { getScribblingEntries, generateSlug, getSlugTitle } from '../services/dataService';

function ScribblingPage() {
  const { data: entries, loading } = useAsync(() => getScribblingEntries(), [], []);
  const [tag, setTag] = useState('All');

  const tags = useMemo(() => {
    const counts = entries.reduce((acc, e) => ({ ...acc, [e.tag || 'Other']: (acc[e.tag || 'Other'] ?? 0) + 1 }), {});
    return [{ value: 'All', label: 'All', count: entries.length }, ...Object.entries(counts).map(([value, count]) => ({ value, label: value.endsWith('y') ? `${value.slice(0, -1)}ies` : `${value}s`, count }))];
  }, [entries]);

  const shown = tag === 'All' ? entries : entries.filter((e) => (e.tag || 'Other') === tag);

  return (
    <Page loading={loading} seo={{ title: 'Scribbling', description: 'Poems, stories and creative writing.', url: '/scribbling' }}>
      <PageHeader
        eyebrow="Scribbling · Verse & prose"
        title="Scribbling"
        italic="in the margins."
        count={entries.length}
        countLabel="pieces"
        lede="Poems and short stories, mostly in Bangla — written between problem sets."
      >
        {tags.length > 2 && <FilterTabs id="scrib" options={tags} value={tag} onChange={setTag} className="mt-12" />}
      </PageHeader>
      <section className="shell">
        {shown.length === 0 ? (
          <EmptyState>Nothing written here yet.</EmptyState>
        ) : (
          <AnimatePresence mode="wait">
            <motion.div key={tag} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }}>
              <IndexList
                items={shown.map((e) => ({
                  key: e.id,
                  to: `/scribbling/${generateSlug(getSlugTitle(e))}`,
                  title: e.title,
                  subtitle: e.englishTitle && e.englishTitle !== e.title ? e.englishTitle : null,
                  description: e.description,
                  tag: tag === 'All' ? e.tag : null,
                  meta: yearOf(e.date) ?? '',
                  image: e.imageUrl,
                }))}
              />
            </motion.div>
          </AnimatePresence>
        )}
      </section>
    </Page>
  );
}

export default ScribblingPage;
