import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { FiArrowUpRight } from 'react-icons/fi';
import Page, { PageHeader } from '../components/Page';
import TiltCard from '../components/TiltCard';
import { EmptyState } from '../components/ui/primitives';
import { Stagger } from '../components/ui/Reveal';
import { staggerItem } from '../lib/motion';
import useAsync from '../lib/useAsync';
import { getHobbies, generateSlug } from '../services/dataService';
import { hobbyRoute } from '../lib/siteMap';
import ChessCardArt from '../components/chess/ChessCardArt';

function HobbiesPage() {
  const { data: hobbies, loading } = useAsync(getHobbies, [], []);
  const list = hobbies.filter((h) => h?.title);

  return (
    <Page loading={loading} seo={{ title: 'Hobbies', description: 'Chess and other diversions.', url: '/hobbies' }}>
      <PageHeader eyebrow="Hobbies · Off the clock" title="Off the" italic="clock." count={list.length} countLabel="pursuits" lede="What fills the hours between simulations." />
      <section className="shell">
        {list.length === 0 ? (
          <EmptyState>No hobbies listed yet.</EmptyState>
        ) : (
          <Stagger className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {list.map((hobby, i) => (
              <motion.div key={hobby.id} variants={staggerItem}>
                <TiltCard className="h-full">
                  <Link to={hobbyRoute(hobby, generateSlug)} className="group flex aspect-[4/5] flex-col justify-between overflow-hidden rounded-3xl border border-line bg-surface p-8">
                    <div className="flex items-start justify-between">
                      <span className="font-mono text-xs text-ink-3">H/{String(i + 1).padStart(2, '0')}</span>
                      <span className="grid h-11 w-11 place-items-center rounded-full border border-line text-ink-2 transition-all duration-500 group-hover:rotate-45 group-hover:border-up group-hover:bg-up group-hover:text-on-up">
                        <FiArrowUpRight />
                      </span>
                    </div>
                    {generateSlug(hobby.title) === 'chess' ? (
                      <ChessCardArt className="w-3/5 self-center transition-transform duration-700 ease-out-expo group-hover:scale-105" />
                    ) : (
                      <span className="text-[7rem] leading-none transition-transform duration-700 ease-out-expo group-hover:scale-110" aria-hidden="true">
                        {hobby.emoji || '◎'}
                      </span>
                    )}
                    <h2 className="font-display text-5xl text-ink">{hobby.title}</h2>
                  </Link>
                </TiltCard>
              </motion.div>
            ))}
          </Stagger>
        )}
      </section>
    </Page>
  );
}

export default HobbiesPage;
