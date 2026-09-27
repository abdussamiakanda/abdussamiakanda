import { useMemo, useState } from 'react';
import { FiSearch } from 'react-icons/fi';
import Page, { PageHeader } from '../components/Page';
import PublicationItem from '../components/PublicationItem';
import FilterTabs from '../components/ui/FilterTabs';
import { Button, EmptyState } from '../components/ui/primitives';
import { Reveal } from '../components/ui/Reveal';
import useAsync from '../lib/useAsync';
import { parseJournal } from '../lib/academic';
import { getPublications, getResearchMetadata } from '../services/dataService';

function PublicationsPage() {
  const { data, loading } = useAsync(
    async () => {
      const [pubs, meta] = await Promise.all([getPublications(), getResearchMetadata()]);
      return { pubs: pubs ?? [], links: meta?.profileLinks ?? [] };
    },
    [],
    { pubs: [], links: [] },
  );
  const [year, setYear] = useState('All');
  const [query, setQuery] = useState('');

  const years = useMemo(() => [...new Set(data.pubs.map((p) => p.year).filter(Boolean))].sort((a, b) => b - a), [data.pubs]);
  const q1 = data.pubs.filter((p) => parseJournal(p.journal).quartile === 'Q1').length;
  const inReview = data.pubs.filter((p) => p.status).length;

  const shown = data.pubs.filter((p) => {
    if (year !== 'All' && p.year !== year) return false;
    if (!query) return true;
    return `${p.title} ${p.authors} ${p.journal} ${p.description}`.toLowerCase().includes(query.toLowerCase());
  });

  return (
    <Page loading={loading} seo={{ title: 'Publications', description: 'Peer-reviewed publications in magnetism and spintronics.', url: '/publications' }}>
      <PageHeader
        eyebrow="Publications · Peer reviewed"
        title="Publications"
        count={data.pubs.length}
        countLabel="papers"
        lede={`Journal articles on magnetization dynamics, domain-wall motion and magnetization switching: ${q1} in Q1 venues${inReview ? `, plus ${inReview} under review` : ''}.`}
      >
        <Reveal delay={0.3} className="mt-10 flex flex-wrap gap-3">
          {data.links.map((l) => (
            <Button key={l.url} href={l.url} variant="ghost">
              {l.label}
            </Button>
          ))}
        </Reveal>
      </PageHeader>

      <section className="shell">
        <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <FilterTabs id="pub-year" options={['All', ...years]} value={year} onChange={setYear} />
          <label className="flex h-11 items-center gap-3 rounded-full border border-line px-4 focus-within:border-ink md:w-80">
            <FiSearch className="text-ink-3" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Filter by title, author, journal"
              className="w-full bg-transparent text-sm text-ink outline-none placeholder:text-ink-3"
            />
          </label>
        </div>

        {shown.length === 0 ? (
          <EmptyState>No publications match.</EmptyState>
        ) : (
          <div className="border-t border-line">
            {shown.map((pub) => (
              <PublicationItem key={pub.id} pub={pub} index={data.pubs.length - data.pubs.indexOf(pub)} />
            ))}
          </div>
        )}
      </section>
    </Page>
  );
}

export default PublicationsPage;
