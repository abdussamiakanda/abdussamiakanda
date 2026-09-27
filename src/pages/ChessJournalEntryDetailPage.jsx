import { useCallback, useMemo } from 'react';
import { Link, useParams } from 'react-router-dom';
import { FiArrowLeft, FiArrowRight } from 'react-icons/fi';
import Page from '../components/Page';
import GameReplay from '../components/chess/GameReplay';
import Markdown from '../components/ui/Markdown';
import { Button, Chip } from '../components/ui/primitives';
import { LineReveal, Reveal } from '../components/ui/Reveal';
import useAsync from '../lib/useAsync';
import { formatDate } from '../lib/format';
import { kingSquares, loadGame } from '../lib/chess/pgn';
import { generateSlug, getChessJournalEntries } from '../services/dataService';

// Splits entry content into markdown and \Chess{...PGN...} segments.
function segments(content = '') {
  const parts = [];
  let last = 0;
  for (const m of content.matchAll(/\\Chess\{([\s\S]*?)\}/g)) {
    if (m.index > last) parts.push({ type: 'md', text: content.slice(last, m.index) });
    parts.push({ type: 'game', pgn: m[1].trim() });
    last = m.index + m[0].length;
  }
  if (last < content.length) parts.push({ type: 'md', text: content.slice(last) });
  return parts;
}

// PGN dates look like "2024.03.17"; "??" parts are unknown.
const pgnDate = (d = '') => {
  const [y, m, day] = d.split('.');
  if (!/^\d{4}$/.test(y)) return null;
  if (!/^\d+$/.test(m ?? '')) return y;
  const date = new Date(Date.UTC(+y, +m - 1, /^\d+$/.test(day ?? '') ? +day : 1));
  return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', ...(/^\d+$/.test(day ?? '') ? { day: 'numeric' } : {}), timeZone: 'UTC' });
};

function EmbeddedGame({ pgn, index }) {
  const { moves, headers } = useMemo(() => loadGame(pgn), [pgn]);
  const result = headers.Result;
  const resultMarks = useCallback(
    (fen) => {
      const k = kingSquares(fen);
      if (result === '1-0') return { [k.w]: 'win', [k.b]: 'loss' };
      if (result === '0-1') return { [k.w]: 'loss', [k.b]: 'win' };
      if (result === '1/2-1/2') return { [k.w]: 'draw', [k.b]: 'draw' };
      return {};
    },
    [result],
  );

  if (!moves.length) {
    return <p className="rounded-2xl border border-dashed border-line-strong px-5 py-6 text-sm text-ink-3">This game’s PGN couldn’t be read.</p>;
  }

  const players = headers.White || headers.Black ? `${headers.White ?? '?'} vs ${headers.Black ?? '?'}` : null;
  const date = pgnDate(headers.Date);

  return (
    <figure className="not-prose my-10 rounded-3xl border border-line bg-bg-2 p-4 md:p-6">
      <figcaption className="mb-4 flex flex-wrap items-center gap-2">
        <span className="font-mono text-xs text-ink-3">Game {index}</span>
        {players && <span className="font-display text-2xl text-ink">{players}</span>}
        <span className="ml-auto flex flex-wrap gap-2">
          {headers.Event && headers.Event !== '?' && <Chip>{headers.Event}</Chip>}
          {date && <Chip>{date}</Chip>}
          {result && result !== '*' && <Chip tone="up">{result.replace('1/2', '½').replace('1/2', '½')}</Chip>}
        </span>
      </figcaption>
      <GameReplay id={`journal-game-${index}`} moves={moves} resultMarks={resultMarks} keys="focus" />
      <p className="mt-3 text-xs text-ink-3">Click the board, then use ← → to step through the moves.</p>
    </figure>
  );
}

function ChessJournalEntryDetailPage() {
  const { slug } = useParams();
  const { data: entries, loading } = useAsync(getChessJournalEntries, [], []);

  if (loading) return <Page loading />;

  const i = entries.findIndex((e) => generateSlug(e.title) === slug);
  const entry = entries[i];

  if (!entry) {
    return (
      <Page seo={{ title: 'Entry not found' }}>
        <div className="shell flex min-h-[70vh] flex-col items-start justify-center pt-32">
          <p className="eyebrow mb-4">Chess journal</p>
          <h1 className="font-display text-6xl text-ink md:text-8xl">
            Lost in the <span className="italic text-ink-2">endgame.</span>
          </h1>
          <Button to="/hobbies/chess/journal" variant="ghost" icon="right" className="mt-10">
            Back to the journal
          </Button>
        </div>
      </Page>
    );
  }

  // Entries are newest-first: "next" is the newer neighbour.
  const next = i > 0 ? entries[i - 1] : null;
  const prev = i < entries.length - 1 ? entries[i + 1] : null;
  // Number the embedded games in reading order.
  let n = 0;
  const parts = segments(entry.content).map((p) => (p.type === 'game' ? { ...p, index: ++n } : p));

  return (
    <Page seo={{ title: entry.title, description: `Chess journal: ${entry.title}`, url: `/hobbies/chess/journal/${slug}`, ogType: 'article' }}>
      <article>
        <header className="shell pb-10 pt-36 md:pt-44">
          <Reveal className="mb-10">
            <Link to="/hobbies/chess/journal" className="group inline-flex items-center gap-2 font-mono text-xs uppercase tracking-[0.12em] text-ink-2 hover:text-ink">
              <FiArrowLeft className="transition-transform group-hover:-translate-x-1" /> Chess journal
            </Link>
          </Reveal>
          <p className="eyebrow">
            {entry.author || 'Md Abdus Sami Akanda'}
            {entry.date && ` · ${formatDate(entry.date)}`}
          </p>
          <LineReveal
            as="h1"
            animateOnMount
            lines={[entry.title]}
            className="mt-6 max-w-5xl font-display text-[clamp(2.6rem,7vw,6rem)] leading-[0.95] tracking-[-0.025em] text-ink"
          />
        </header>

        <div className="shell">
          <div className="mx-auto max-w-4xl">
            {parts.map((part, k) =>
              part.type === 'game' ? (
                <EmbeddedGame key={k} pgn={part.pgn} index={part.index} />
              ) : (
                <Markdown key={k} className="reading mx-auto max-w-[68ch]">
                  {part.text}
                </Markdown>
              ),
            )}
          </div>
        </div>

        {(prev || next) && (
          <nav className="shell mt-24 grid gap-px overflow-hidden rounded-3xl border border-line bg-line md:grid-cols-2" aria-label="More entries">
            {[prev, next].map((e, k) =>
              e ? (
                <Link
                  key={e.id}
                  to={`/hobbies/chess/journal/${generateSlug(e.title)}`}
                  className={`group flex flex-col gap-4 bg-bg p-8 transition-colors hover:bg-surface md:p-10 ${k === 1 ? 'md:items-end md:text-right' : ''}`}
                >
                  <span className="eyebrow flex items-center gap-2">
                    {k === 0 && <FiArrowLeft className="transition-transform group-hover:-translate-x-1" />}
                    {k === 0 ? 'Previous' : 'Next'}
                    {k === 1 && <FiArrowRight className="transition-transform group-hover:translate-x-1" />}
                  </span>
                  <span className="font-display text-3xl leading-tight text-ink">{e.title}</span>
                </Link>
              ) : (
                <div key={k} className="hidden bg-bg md:block" />
              ),
            )}
          </nav>
        )}
      </article>
    </Page>
  );
}

export default ChessJournalEntryDetailPage;
