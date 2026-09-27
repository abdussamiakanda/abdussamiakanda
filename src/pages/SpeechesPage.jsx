import { useMemo, useRef, useState } from 'react';
import { motion, useScroll, useSpring } from 'motion/react';
import { FiArrowUpRight, FiMapPin } from 'react-icons/fi';
import Page, { PageHeader } from '../components/Page';
import { Authors } from '../components/PublicationItem';
import FilterTabs from '../components/ui/FilterTabs';
import { Chip, EmptyState } from '../components/ui/primitives';
import { EASE } from '../lib/motion';
import useAsync from '../lib/useAsync';
import { formatDate, yearOf } from '../lib/format';
import { parseTalk } from '../lib/academic';
import { getSpeeches } from '../services/dataService';

const KIND_TONE = { Talk: 'up', Poster: 'down', Proceeding: 'default', Presentation: 'default' };

function SpeechesPage() {
  const { data: raw, loading } = useAsync(getSpeeches, [], []);
  const [kind, setKind] = useState('All');
  const listRef = useRef(null);
  const { scrollYProgress } = useScroll({ target: listRef, offset: ['start 70%', 'end 70%'] });
  const spine = useSpring(scrollYProgress, { stiffness: 120, damping: 30 });

  const talks = useMemo(() => raw.map(parseTalk).sort((a, b) => (b.date ?? 0) - (a.date ?? 0)), [raw]);
  const kinds = useMemo(() => {
    const counts = talks.reduce((acc, t) => ({ ...acc, [t.kind]: (acc[t.kind] ?? 0) + 1 }), {});
    return [{ value: 'All', label: 'All', count: talks.length }, ...Object.entries(counts).map(([value, count]) => ({ value, label: `${value}s`, count }))];
  }, [talks]);
  const shown = kind === 'All' ? talks : talks.filter((t) => t.kind === kind);

  // Group consecutive entries under their year.
  const groups = shown.reduce((acc, t) => {
    const y = yearOf(t.date) ?? '—';
    const last = acc[acc.length - 1];
    if (last?.year === y) last.items.push(t);
    else acc.push({ year: y, items: [t] });
    return acc;
  }, []);

  return (
    <Page loading={loading} seo={{ title: 'Talks & Posters', description: 'Conference talks, posters and proceedings.', url: '/speeches' }}>
      <PageHeader
        eyebrow="Talks · Posters · Proceedings"
        title="On the"
        italic="podium."
        count={talks.length}
        countLabel="presentations"
        lede="Conference talks, poster sessions and proceedings — from the ESpinRed School on Spintronics to international physics meetings."
      >
        <FilterTabs id="talk-kind" options={kinds} value={kind} onChange={setKind} className="mt-12" />
      </PageHeader>

      <section className="shell">
        {shown.length === 0 ? (
          <EmptyState>No presentations yet.</EmptyState>
        ) : (
          <div ref={listRef} className="relative">
            <div className="absolute bottom-0 left-[7px] top-0 w-px bg-line md:left-[calc(25%+7px)]" />
            <motion.div className="absolute left-[7px] top-0 h-full w-px origin-top bg-up md:left-[calc(25%+7px)]" style={{ scaleY: spine }} />

            {groups.map((group) => (
              <div key={`${group.year}-${group.items[0].id}`} className="relative grid md:grid-cols-4">
                <div className="hidden md:block">
                  <div className="sticky top-32 pr-10 text-right">
                    <span className="font-display text-7xl leading-none text-ink">{group.year}</span>
                  </div>
                </div>
                <ol className="md:col-span-3">
                  <li className="mb-2 pl-10 font-display text-4xl text-ink md:hidden">{group.year}</li>
                  {group.items.map((t) => (
                    <motion.li
                      key={t.id}
                      initial={{ opacity: 0, x: 30 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true, amount: 0.3 }}
                      transition={{ duration: 0.8, ease: EASE }}
                      className="relative pb-14 pl-10 md:pl-14"
                    >
                      <span className="absolute left-0 top-2 grid h-[15px] w-[15px] place-items-center rounded-full border border-line-strong bg-bg">
                        <span className={`h-[7px] w-[7px] rounded-full ${t.kind === 'Talk' ? 'bg-up' : t.kind === 'Poster' ? 'bg-down' : 'bg-ink-3'}`} />
                      </span>
                      <div className="flex flex-wrap items-center gap-3">
                        <Chip tone={KIND_TONE[t.kind]}>{t.kind}</Chip>
                        <span className="eyebrow">{formatDate(t.date)}</span>
                      </div>
                      <h3 className="mt-4 max-w-3xl font-display text-[1.7rem] leading-[1.12] text-ink md:text-[2.2rem]">{t.title}</h3>
                      <p className="mt-3 flex items-start gap-2 text-sm text-ink-2">
                        <FiMapPin className="mt-1 shrink-0 text-ink-3" />
                        {t.location}
                      </p>
                      {t.authors && <Authors className="mt-2">{t.authors}</Authors>}
                      {t.url && (
                        <a
                          href={t.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="group mt-5 inline-flex items-center gap-2 font-mono text-xs uppercase tracking-[0.12em] text-ink-2 hover:text-up"
                        >
                          <span className="link-underline">{/youtube/.test(t.url) ? 'Watch recording' : 'Event page'}</span>
                          <FiArrowUpRight className="transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                        </a>
                      )}
                    </motion.li>
                  ))}
                </ol>
              </div>
            ))}
          </div>
        )}
      </section>
    </Page>
  );
}

export default SpeechesPage;
