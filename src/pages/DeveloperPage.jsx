import { useMemo, useState } from 'react';
import { AnimatePresence } from 'motion/react';
import { Link } from 'react-router-dom';
import { FiArrowUpRight } from 'react-icons/fi';
import Page, { PageHeader } from '../components/Page';
import DevProjectCard from '../components/developer/DevProjectCard';
import FilterTabs from '../components/ui/FilterTabs';
import { Chip } from '../components/ui/primitives';
import { Reveal } from '../components/ui/Reveal';
import { formatRange } from '../lib/format';
import useAsync from '../lib/useAsync';
import { shippedCount } from '../lib/developer';
import Toolkit from '../components/developer/Toolkit';
import ProfileLinks from '../components/ui/ProfileLinks';
import { getDeveloper, getSkills } from '../services/dataService';
import { PAGE_META } from '../lib/pageMeta';

function Section({ index, title, aside, children }) {
  return (
    <section className="shell py-14 md:py-20">
      <Reveal className="mb-8 flex flex-wrap items-end justify-between gap-4 border-t border-line pt-6">
        <div>
          <p className="eyebrow mb-3">
            <span className="text-up">{index}</span> — {title}
          </p>
          {aside && <p className="max-w-xl text-ink-2">{aside}</p>}
        </div>
      </Reveal>
      {children}
    </section>
  );
}

// Links to the projects shipped within a position, e.g. "Built there: FloorLab, ClientKhata".
function BuiltThere({ slugs = [], projects }) {
  const built = slugs.map((slug) => projects.find((p) => p.slug === slug)).filter(Boolean);
  if (!built.length) return null;
  return (
    <p className="mt-4 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-ink-2">
      <span className="eyebrow mr-1">Built there</span>
      {built.map((p, i) => (
        <span key={p.slug}>
          {p.overview ? (
            <Link to={`/developer/${p.slug}`} className="link-underline text-ink">
              {p.title}
            </Link>
          ) : (
            <span className="text-ink">{p.title}</span>
          )}
          {i < built.length - 1 && <span className="text-ink-3">,</span>}
        </span>
      ))}
    </p>
  );
}

function DeveloperPage() {
  const { data, loading } = useAsync(async () => {
    const [developer, skills] = await Promise.all([getDeveloper(), getSkills()]);
    return { ...developer, skills };
  }, [], null);
  const [filter, setFilter] = useState('all');

  const projects = useMemo(() => data?.projects ?? [], [data]);
  const categoryLabel = useMemo(() => Object.fromEntries((data?.categories ?? []).map((c) => [c.id, c.label])), [data]);
  const featured = projects.filter((p) => p.featured);
  const rest = projects.filter((p) => !p.featured);
  const shown = filter === 'all' ? rest : rest.filter((p) => p.category === filter);
  const tabs = [
    { value: 'all', label: 'All', count: rest.length },
    ...(data?.categories ?? [])
      .map((c) => ({ value: c.id, label: c.label, count: rest.filter((p) => p.category === c.id).length }))
      .filter((t) => t.count > 0),
  ];

  return (
    <Page loading={loading} seo={PAGE_META['/developer']}>
      <PageHeader
        eyebrow="Developer · Full stack"
        title="Built,"
        italic="shipped, in use."
        count={shippedCount(projects)}
        countLabel="shipped"
        lede={data?.intro}
      >
        {data?.profileLinks?.length > 0 && (
          <Reveal delay={0.3} className="mt-10 flex flex-wrap items-center gap-3">
            <ProfileLinks links={data.profileLinks} />
          </Reveal>
        )}
      </PageHeader>

      {data?.positions?.length > 0 && (
        <Section index="01" title="Positions">
          <ul className="border-t border-line">
            {data.positions.map((p) => (
              <Reveal as="li" key={p.id} className="grid gap-3 border-b border-line py-8 md:grid-cols-12 md:gap-8">
                <div className="flex items-start gap-3 md:col-span-3 md:flex-col">
                  <p className="eyebrow">{formatRange(p.startDate, p.endDate, { style: 'short' })}</p>
                  {!p.endDate && <Chip tone="up">Current</Chip>}
                </div>
                <div className="md:col-span-9">
                  <h3 className="font-display text-3xl text-ink md:text-4xl">
                    {p.url ? (
                      <a href={p.url} target="_blank" rel="noopener noreferrer" className="group inline-flex items-baseline gap-2">
                        <span className="link-underline">{p.organization}</span>
                        <FiArrowUpRight className="shrink-0 text-xl text-ink-3 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-up" />
                      </a>
                    ) : (
                      p.organization
                    )}
                  </h3>
                  <p className="mt-1 text-ink-2">{p.role}</p>
                  {p.description && <p className="mt-3 max-w-2xl text-ink-3">{p.description}</p>}
                  <BuiltThere slugs={p.products} projects={projects} />
                </div>
              </Reveal>
            ))}
          </ul>
        </Section>
      )}

      {featured.length > 0 && (
        <section className="shell">
          <div className="grid gap-4 lg:grid-cols-2">
            {featured.map((p, i) => (
              <DevProjectCard key={p.slug} project={p} category={categoryLabel[p.category]} index={i} variant="feature" />
            ))}
          </div>
        </section>
      )}

      <Section index="02" title="Everything else" aside="Tools, packages, community sites and games.">
        <FilterTabs id="developer-filter" value={filter} onChange={setFilter} options={tabs} className="mb-8" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <AnimatePresence mode="popLayout">
            {shown.map((p) => (
              <DevProjectCard key={p.slug} project={p} />
            ))}
          </AnimatePresence>
        </div>
      </Section>

      {data?.skills?.length > 0 && (
        <Section index="03" title="Toolkit" aside="What I reach for, grouped by area.">
          <Toolkit skills={data.skills} label={null} />
        </Section>
      )}
    </Page>
  );
}

export default DeveloperPage;
