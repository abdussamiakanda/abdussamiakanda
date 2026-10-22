import { useState } from 'react';
import { FiSearch } from 'react-icons/fi';
import Page, { PageHeader } from '../components/Page';
import IndexList from '../components/IndexList';
import { EmptyState } from '../components/ui/primitives';
import { Reveal } from '../components/ui/Reveal';
import useAsync from '../lib/useAsync';
import { formatDate } from '../lib/format';
import { journalExcerpt } from '../lib/chess/meta';
import { generateSlug, getChessJournalEntries } from '../services/dataService';
import { PAGE_META } from '../lib/pageMeta';

function ChessJournalPage() {
  const { data: entries, loading } = useAsync(getChessJournalEntries, [], []);
  const [query, setQuery] = useState('');

  const q = query.trim().toLowerCase();
  const shown = q ? entries.filter((e) => `${e.title} ${journalExcerpt(e.content, 100000)}`.toLowerCase().includes(q)) : entries;

  return (
    <Page loading={loading} seo={{ ...PAGE_META['/hobbies/chess/journal'], noindex: !loading && entries.length === 0 }}>
      <PageHeader
        back={{ to: '/hobbies/chess', label: 'Chess' }}
        eyebrow="Chess · Journal"
        title="Chess"
        italic="journal."
        count={entries.length}
        countLabel={entries.length === 1 ? 'entry' : 'entries'}
        lede="Games worth remembering, annotated. Every embedded game can be replayed move by move."
      >
        <Reveal delay={0.3} className="mt-10 flex flex-wrap items-center gap-3">
          {entries.length > 0 && (
            <label className="flex h-11 w-full items-center gap-3 rounded-full border border-line px-4 focus-within:border-ink sm:w-80">
              <FiSearch className="text-ink-3" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                aria-label="Search journal entries"
                placeholder="Search entries"
                className="w-full bg-transparent text-sm text-ink outline-none placeholder:text-ink-3"
              />
            </label>
          )}
        </Reveal>
      </PageHeader>

      <section className="shell">
        {entries.length === 0 ? (
          <EmptyState>No journal entries yet.</EmptyState>
        ) : shown.length === 0 ? (
          <EmptyState>No entries match “{query}”.</EmptyState>
        ) : (
          <IndexList
            items={shown.map((e) => ({
              key: e.id,
              to: `/hobbies/chess/journal/${generateSlug(e.title)}`,
              title: e.title,
              description: journalExcerpt(e.content),
              meta: formatDate(e.date, 'short'),
            }))}
          />
        )}
      </section>
    </Page>
  );
}

export default ChessJournalPage;
