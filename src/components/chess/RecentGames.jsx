import { useCallback, useEffect, useMemo, useState } from 'react';
import { motion } from 'motion/react';
import { FiArrowUpRight, FiRefreshCw } from 'react-icons/fi';
import GameReplay from './GameReplay';
import FilterTabs from '../ui/FilterTabs';
import { Chip, Loader } from '../ui/primitives';
import { getRecentGames } from '../../services/chessComService';
import { kingSquares, loadGame, outcomeFor, outcomeLabel } from '../../lib/chess/pgn';

const TONE = { win: 'up', loss: 'default', draw: 'down' };
const LETTER = { win: 'W', loss: 'L', draw: 'D' };
const DOT = { win: 'bg-up', loss: 'bg-red-500', draw: 'bg-ink-3' };

const when = (ts) =>
  new Date(ts * 1000).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });

function PlayerStrip({ player, color, isMe, result }) {
  return (
    <div className="flex items-center gap-3 py-2">
      <span className={`h-3.5 w-3.5 shrink-0 rounded-full ring-1 ring-line-strong ${color === 'white' ? 'bg-[#eef3ef]' : 'bg-[#1b2420]'}`} />
      <span className={`truncate font-medium ${isMe ? 'text-up' : 'text-ink'}`}>{player.username}</span>
      <span className="font-mono text-xs text-ink-3">{player.rating}</span>
      {result && (
        <span className={`ml-auto font-mono text-[0.68rem] uppercase tracking-[0.1em] ${result === 'win' ? 'text-up' : 'text-ink-3'}`}>
          {result === 'win' ? '1' : result === 'draw' ? '½' : '0'}
        </span>
      )}
    </div>
  );
}

export default function RecentGames({ username }) {
  const [games, setGames] = useState([]);
  const [status, setStatus] = useState('loading'); // loading | ready | error
  const [filter, setFilter] = useState('all');
  const [selected, setSelected] = useState(null);

  const fetchGames = useCallback(async () => {
    setStatus('loading');
    try {
      const recent = (await getRecentGames(username, 2)).slice(0, 50);
      setGames(recent);
      setSelected(recent[0]?.url ?? null);
      setStatus('ready');
    } catch {
      setStatus('error');
    }
  }, [username]);

  useEffect(() => {
    fetchGames();
  }, [fetchGames]);

  const withOutcome = useMemo(() => games.map((g) => ({ ...g, outcome: outcomeFor(g, username) })), [games, username]);
  const counts = useMemo(
    () => withOutcome.reduce((acc, g) => ({ ...acc, [g.outcome]: acc[g.outcome] + 1 }), { win: 0, draw: 0, loss: 0 }),
    [withOutcome],
  );
  const shown = filter === 'all' ? withOutcome : withOutcome.filter((g) => g.outcome === filter);
  const game = withOutcome.find((g) => g.url === selected) ?? shown[0];

  const parsed = useMemo(() => (game ? loadGame(game.pgn) : null), [game]);
  const myColor = game && game.white.username.toLowerCase() === username.toLowerCase() ? 'white' : 'black';

  const resultMarks = useCallback(
    (fen) => {
      if (!game) return {};
      const kings = kingSquares(fen);
      const mine = myColor === 'white' ? 'w' : 'b';
      const theirs = mine === 'w' ? 'b' : 'w';
      if (game.outcome === 'draw') return { [kings.w]: 'draw', [kings.b]: 'draw' };
      return game.outcome === 'win' ? { [kings[mine]]: 'win', [kings[theirs]]: 'loss' } : { [kings[mine]]: 'loss', [kings[theirs]]: 'win' };
    },
    [game, myColor],
  );

  if (status === 'loading') return <Loader label="Fetching games from Chess.com" delay={0} />;

  if (status === 'error') {
    return (
      <div className="rounded-3xl border border-dashed border-line-strong px-6 py-16 text-center">
        <p className="font-display text-3xl text-ink">Couldn’t reach Chess.com.</p>
        <p className="mt-2 text-ink-2">Their API may be busy. Try again in a moment.</p>
        <button
          type="button"
          onClick={fetchGames}
          className="mt-6 inline-flex h-11 items-center gap-2 rounded-full border border-line-strong px-5 text-sm text-ink transition-colors hover:border-ink"
        >
          <FiRefreshCw /> Try again
        </button>
      </div>
    );
  }

  if (!games.length) {
    return <p className="rounded-3xl border border-dashed border-line-strong px-6 py-16 text-center text-ink-2">No games in the last two months.</p>;
  }

  const total = games.length;
  const opponent = game && (myColor === 'white' ? game.black : game.white);
  const me = game && game[myColor];

  return (
    <div className="grid gap-6 xl:grid-cols-[19rem_minmax(0,1fr)]">
      {/* Game list */}
      <aside className="flex min-h-0 flex-col gap-4">
        <div className="rounded-2xl border border-line p-4">
          <div className="flex items-baseline justify-between">
            <p className="eyebrow">Last {total} games</p>
            <p className="font-mono text-xs text-ink-3">
              <span className="text-up">{counts.win}W</span> · {counts.draw}D · {counts.loss}L
            </p>
          </div>
          <div className="mt-3 flex h-2 overflow-hidden rounded-full bg-line">
            <motion.span className="bg-up" initial={{ width: 0 }} animate={{ width: `${(counts.win / total) * 100}%` }} transition={{ duration: 1 }} />
            <motion.span className="bg-ink-3" initial={{ width: 0 }} animate={{ width: `${(counts.draw / total) * 100}%` }} transition={{ duration: 1, delay: 0.1 }} />
            <motion.span className="bg-red-500/80" initial={{ width: 0 }} animate={{ width: `${(counts.loss / total) * 100}%` }} transition={{ duration: 1, delay: 0.2 }} />
          </div>
        </div>
        <FilterTabs
          id="games-filter"
          value={filter}
          onChange={setFilter}
          options={[
            { value: 'all', label: 'All', count: total },
            { value: 'win', label: 'Wins', count: counts.win },
            { value: 'draw', label: 'Draws', count: counts.draw },
            { value: 'loss', label: 'Losses', count: counts.loss },
          ]}
        />
        <ul className="max-h-[22rem] min-h-0 space-y-1 overflow-y-auto pr-1 xl:max-h-[34rem]">
          {shown.map((g) => {
            const opp = g.white.username.toLowerCase() === username.toLowerCase() ? g.black : g.white;
            const active = g.url === game?.url;
            return (
              <li key={g.url}>
                <button
                  type="button"
                  onClick={() => setSelected(g.url)}
                  className={`flex w-full items-center gap-3 rounded-xl border px-3 py-2.5 text-left transition-colors ${
                    active ? 'border-up bg-up-soft' : 'border-transparent hover:bg-surface'
                  }`}
                >
                  <span className={`grid h-7 w-7 shrink-0 place-items-center rounded-full font-mono text-[0.7rem] font-bold ${
                    g.outcome === 'win' ? 'bg-up text-on-up' : g.outcome === 'loss' ? 'bg-red-500/85 text-white' : 'bg-ink-3 text-bg'
                  }`}>
                    {LETTER[g.outcome]}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm text-ink">
                      vs {opp.username} <span className="font-mono text-xs text-ink-3">{opp.rating}</span>
                    </span>
                    <span className="block text-xs text-ink-3">
                      {g.time_class} · {when(g.end_time)}
                    </span>
                  </span>
                  <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${DOT[g.outcome]}`} />
                </button>
              </li>
            );
          })}
        </ul>
      </aside>

      {/* Replay */}
      {game && parsed && (
        <section className="min-w-0 rounded-3xl border border-line p-4 md:p-6" aria-label="Game replay">
          <div className="mb-4 flex flex-wrap items-center gap-2">
            <Chip tone={TONE[game.outcome]}>{outcomeLabel(game, username)}</Chip>
            <Chip>{game.time_class}</Chip>
            {game.rated && <Chip>Rated</Chip>}
            <span className="eyebrow ml-auto">{when(game.end_time)}</span>
          </div>
          <GameReplay
            key={game.url}
            id={`replay-${game.uuid ?? game.end_time}`}
            moves={parsed.moves}
            orientation={myColor}
            resultMarks={resultMarks}
            keys="window"
            top={<PlayerStrip player={opponent} color={myColor === 'white' ? 'black' : 'white'} result={game.outcome === 'win' ? 'loss' : game.outcome === 'loss' ? 'win' : 'draw'} />}
            bottom={<PlayerStrip player={me} color={myColor} isMe result={game.outcome} />}
          />
          <a
            href={game.url}
            target="_blank"
            rel="noopener noreferrer"
            className="group mt-5 inline-flex items-center gap-2 font-mono text-xs uppercase tracking-[0.12em] text-ink-2 hover:text-up"
          >
            <span className="link-underline">Open on Chess.com</span>
            <FiArrowUpRight className="transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
          </a>
        </section>
      )}
    </div>
  );
}
