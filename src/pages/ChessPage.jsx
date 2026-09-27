import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { FiArrowUpRight, FiBookOpen, FiCpu, FiExternalLink } from 'react-icons/fi';
import Page, { PageHeader } from '../components/Page';
import IndexList from '../components/IndexList';
import RecentGames from '../components/chess/RecentGames';
import ChessCardArt from '../components/chess/ChessCardArt';
import Markdown from '../components/ui/Markdown';
import { ArrowLink } from '../components/ui/primitives';
import { Reveal, Stagger } from '../components/ui/Reveal';
import { staggerItem } from '../lib/motion';
import useAsync from '../lib/useAsync';
import { formatDate } from '../lib/format';
import { getChessJournalEntries, getHobbies, generateSlug } from '../services/dataService';
import { seoConfig } from '../utils/seoConfig';
import { CHESS_COM_USERNAME, journalExcerpt } from '../lib/chess/meta';

function Section({ index, title, aside, children, action }) {
  return (
    <section className="shell py-14 md:py-20">
      <Reveal className="mb-8 flex flex-wrap items-end justify-between gap-4 border-t border-line pt-6">
        <div>
          <p className="eyebrow mb-3">
            <span className="text-up">{index}</span> — {title}
          </p>
          {aside && <p className="max-w-xl text-ink-2">{aside}</p>}
        </div>
        {action}
      </Reveal>
      {children}
    </section>
  );
}

function ChessPage() {
  const { data, loading } = useAsync(
    async () => {
      const [hobbies, journal] = await Promise.all([getHobbies(), getChessJournalEntries()]);
      const hobby = hobbies.find((h) => generateSlug(h.title) === 'chess') ?? null;
      return { hobby, journal: journal ?? [] };
    },
    [],
    { hobby: null, journal: [] },
  );

  const { hobby, journal } = data;
  const actions = [
    {
      to: '/hobbies/chess/bot',
      icon: FiCpu,
      title: 'Play the bot',
      body: 'A bot built to play in my style, on ten-minute clocks. Drag or click to move.',
      cta: 'Start a game',
    },
    {
      to: '/hobbies/chess/journal',
      icon: FiBookOpen,
      title: 'Chess journal',
      body: journal.length ? `${journal.length} annotated ${journal.length === 1 ? 'entry' : 'entries'} with replayable games.` : 'Annotated games and notes, with every position replayable.',
      cta: 'Read the journal',
    },
    {
      href: `https://www.chess.com/member/${CHESS_COM_USERNAME}`,
      icon: FiExternalLink,
      title: 'Chess.com',
      body: `My games and ratings, under the name ${CHESS_COM_USERNAME}.`,
      cta: 'View profile',
    },
  ];

  return (
    <Page
      loading={loading}
      seo={{ title: hobby?.title || 'Chess', description: seoConfig.chess.description, keywords: seoConfig.chess.keywords }}
    >
      <PageHeader
        eyebrow="Hobbies · Chess"
        title="Sixty-four"
        italic="squares."
        lede={hobby?.description || 'Replay my recent Chess.com games, read the journal, or try to beat a bot built to play like me.'}
      >
        <Reveal delay={0.3} className="mt-10 hidden w-40 md:block">
          <ChessCardArt className="w-full" />
        </Reveal>
      </PageHeader>

      <section className="shell">
        <Stagger className="grid gap-4 md:grid-cols-3">
          {actions.map(({ to, href, icon, title, body, cta }) => {
            const Icon = icon;
            const inner = (
              <>
                <span className="grid h-12 w-12 place-items-center rounded-2xl bg-up-soft text-xl text-up transition-transform duration-500 group-hover:-rotate-6">
                  <Icon />
                </span>
                <h2 className="mt-6 font-display text-3xl text-ink">{title}</h2>
                <p className="mt-2 text-sm text-ink-2">{body}</p>
                <span className="mt-6 inline-flex items-center gap-2 font-mono text-xs uppercase tracking-[0.12em] text-ink-2 group-hover:text-up">
                  {cta} <FiArrowUpRight className="transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                </span>
              </>
            );
            const cls = 'group flex h-full flex-col rounded-3xl border border-line bg-surface p-7 transition-colors hover:border-line-strong';
            return (
              <motion.div key={title} variants={staggerItem}>
                {to ? (
                  <Link to={to} className={cls}>
                    {inner}
                  </Link>
                ) : (
                  <a href={href} target="_blank" rel="noopener noreferrer" className={cls}>
                    {inner}
                  </a>
                )}
              </motion.div>
            );
          })}
        </Stagger>
      </section>

      {hobby?.content && (
        <Section index="01" title="About">
          <Markdown className="reading max-w-[68ch]">{hobby.content}</Markdown>
        </Section>
      )}

      <Section
        index={hobby?.content ? '02' : '01'}
        title="Recent games"
        aside="Pulled live from Chess.com. Pick a game, then step through it with the arrow keys."
      >
        <RecentGames username={CHESS_COM_USERNAME} />
      </Section>

      {journal.length > 0 && (
        <Section
          index={hobby?.content ? '03' : '02'}
          title="From the journal"
          action={<ArrowLink to="/hobbies/chess/journal">All entries</ArrowLink>}
        >
          <IndexList
            items={journal.slice(0, 3).map((e) => ({
              key: e.id,
              to: `/hobbies/chess/journal/${generateSlug(e.title)}`,
              title: e.title,
              description: journalExcerpt(e.content),
              meta: formatDate(e.date, 'short'),
            }))}
          />
        </Section>
      )}
    </Page>
  );
}

export default ChessPage;
