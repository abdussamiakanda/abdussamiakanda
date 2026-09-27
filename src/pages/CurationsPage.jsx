import { useParams } from 'react-router-dom';
import { motion } from 'motion/react';
import Page, { PageHeader } from '../components/Page';
import TiltCard from '../components/TiltCard';
import { EmptyState } from '../components/ui/primitives';
import { Reveal, Stagger } from '../components/ui/Reveal';
import { staggerItem } from '../lib/motion';
import useAsync from '../lib/useAsync';
import { titleCase } from '../lib/format';
import { getCurationsEntries } from '../services/dataService';

function Poster({ item }) {
  const body = (
    <TiltCard className="h-full">
      <div className="overflow-hidden rounded-2xl border border-line bg-surface">
        <div className="aspect-[2/3] overflow-hidden bg-surface-2">
          {item.imageUrl ? (
            <img src={item.imageUrl} alt={item.title} loading="lazy" className="h-full w-full object-cover" />
          ) : (
            <div className="grid h-full place-items-center p-4 text-center font-display text-2xl text-ink-2">{item.title}</div>
          )}
        </div>
      </div>
      <div className="px-1 pt-4">
        <h3 className="font-display text-xl leading-tight text-ink">{item.title}</h3>
        <p className="mt-1 font-mono text-[0.65rem] uppercase tracking-[0.1em] text-ink-3">
          {item.genres?.length ? item.genres.join(' · ') : item.description}
        </p>
      </div>
    </TiltCard>
  );

  return (
    <motion.li variants={staggerItem}>
      {item.url ? (
        <a href={item.url} target="_blank" rel="noopener noreferrer" className="block h-full">
          {body}
        </a>
      ) : (
        body
      )}
    </motion.li>
  );
}

function CurationsPage() {
  const { tag } = useParams();
  const { data: entries, loading } = useAsync(() => getCurationsEntries(tag), [tag], []);

  // Entries carry an optional `group` heading; keep data order so the
  // original grouping is preserved.
  const groups = [];
  for (const entry of entries) {
    const name = entry.group || '';
    const last = groups[groups.length - 1];
    if (last && last.name === name) last.items.push(entry);
    else groups.push({ name, items: [entry] });
  }

  return (
    <Page loading={loading} seo={{ title: `Curated ${titleCase(tag)}`, description: `A curated selection of my favourite ${tag}.`, url: `/curations/${tag}` }}>
      <PageHeader
        eyebrow={`Curations · ${titleCase(tag)}`}
        title="Curated"
        italic={`${tag}.`}
        count={entries.length}
        countLabel="picks"
        lede={`A short, opinionated list of ${tag} I keep returning to.`}
      />
      <section className="shell space-y-24">
        {entries.length === 0 ? (
          <EmptyState>Nothing curated here yet.</EmptyState>
        ) : (
          groups.map((group, gi) => (
            <div key={group.name || gi}>
              {group.name && (
                <Reveal className="mb-10 flex items-baseline gap-4 border-b border-line pb-4">
                  <span className="font-mono text-xs text-up">{String(gi + 1).padStart(2, '0')}</span>
                  <h2 className="font-display text-4xl text-ink md:text-5xl">{group.name}</h2>
                  <span className="eyebrow ml-auto">{group.items.length}</span>
                </Reveal>
              )}
              <Stagger as="ul" className="grid grid-cols-2 gap-x-5 gap-y-10 sm:grid-cols-3 lg:grid-cols-5">
                {group.items.map((item) => (
                  <Poster key={item.id} item={item} />
                ))}
              </Stagger>
            </div>
          ))
        )}
      </section>
    </Page>
  );
}

export default CurationsPage;
