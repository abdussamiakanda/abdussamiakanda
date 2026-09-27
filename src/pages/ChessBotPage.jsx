import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { AnimatePresence, motion } from 'motion/react';
import { Chess } from 'chess.js';
import { defaultPieces } from 'react-chessboard';
import { FiArrowLeft, FiCpu, FiFlag, FiRefreshCw, FiRotateCcw, FiServer, FiX } from 'react-icons/fi';
import Page from '../components/Page';
import Board from '../components/chess/Board';
import { SQUARE } from '../lib/chess/squares';
import MoveList from '../components/chess/MoveList';
import FilterTabs from '../components/ui/FilterTabs';
import { LineReveal, Reveal } from '../components/ui/Reveal';
import { EASE } from '../lib/motion';
import { kingSquares } from '../lib/chess/pgn';
import { engineSource, getBotMove, onEngineSource } from '../lib/chess/service';
import { seoConfig } from '../utils/seoConfig';

const START_SECONDS = 600;
const VALUE = { p: 1, n: 3, b: 3, r: 5, q: 9 };
const ORDER = ['p', 'n', 'b', 'r', 'q'];

const clock = (s) => `${String(Math.floor(Math.max(0, s) / 60)).padStart(2, '0')}:${String(Math.max(0, s) % 60).padStart(2, '0')}`;

// Replays UCI moves into a Chess instance.
const replay = (ucis, upto = ucis.length) => {
  const game = new Chess();
  for (let i = 0; i < upto; i++) {
    const u = ucis[i];
    game.move({ from: u.slice(0, 2), to: u.slice(2, 4), promotion: u[4] || undefined });
  }
  return game;
};

function hasMatingMaterial(game, color) {
  return game
    .board()
    .flat()
    .some((p) => p && p.color === color && p.type !== 'k');
}

function Captured({ pieces, capturedColor, lead }) {
  // `pieces` are types taken from the opponent; draw them in the opponent's colour.
  const sorted = [...pieces].sort((a, b) => ORDER.indexOf(a) - ORDER.indexOf(b));
  return (
    <span className="flex min-h-5 items-center">
      {sorted.map((type, i) => {
        const Piece = defaultPieces[`${capturedColor}${type.toUpperCase()}`];
        const gap = i > 0 && sorted[i - 1] !== type;
        return (
          <span key={i} className={`-mr-2 h-5 w-5 ${gap ? 'ml-2.5' : ''}`}>
            <Piece svgStyle={{ width: '100%', height: '100%' }} />
          </span>
        );
      })}
      {lead > 0 && <span className="ml-3 font-mono text-xs text-ink-2">+{lead}</span>}
    </span>
  );
}

function PlayerStrip({ label, sub, color, seconds, active, low, captured, lead, thinking }) {
  return (
    <div className={`flex items-center gap-3 rounded-2xl border px-4 py-3 transition-colors ${active ? 'border-up bg-up-soft' : 'border-line'}`}>
      <span className={`h-4 w-4 shrink-0 rounded-full ring-1 ring-line-strong ${color === 'w' ? 'bg-[#eef3ef]' : 'bg-[#1b2420]'}`} />
      <div className="min-w-0 flex-1">
        <p className="flex items-center gap-2 text-sm text-ink">
          {label}
          {thinking && (
            <span className="flex gap-0.5" aria-label="Thinking">
              {[0, 1, 2].map((i) => (
                <motion.span
                  key={i}
                  className="h-1 w-1 rounded-full bg-up"
                  animate={{ opacity: [0.2, 1, 0.2] }}
                  transition={{ duration: 1, repeat: Infinity, delay: i * 0.18 }}
                />
              ))}
            </span>
          )}
        </p>
        <div className="mt-0.5 flex items-center gap-2 text-xs text-ink-3">
          {sub}
          <Captured pieces={captured} capturedColor={color === 'w' ? 'b' : 'w'} lead={lead} />
        </div>
      </div>
      <span
        className={`rounded-xl px-3 py-1.5 font-mono text-lg tabular-nums ${
          low ? 'bg-red-500/15 text-red-500' : active ? 'bg-up text-on-up' : 'bg-surface-2 text-ink-2'
        }`}
      >
        {clock(seconds)}
      </span>
    </div>
  );
}

function ChessBotPage() {
  const [playerColor, setPlayerColor] = useState('w');
  const [started, setStarted] = useState(false);
  const [ucis, setUcis] = useState([]);
  const [times, setTimes] = useState([]); // seconds spent per move
  const [clocks, setClocks] = useState({ w: START_SECONDS, b: START_SECONDS });
  const [resigned, setResigned] = useState(false);
  const [viewPly, setViewPly] = useState(null); // null = live position
  const [selected, setSelected] = useState(null);
  const [thinking, setThinking] = useState(false);
  const [botError, setBotError] = useState(null);
  const [overlay, setOverlay] = useState(true);
  const [source, setSource] = useState(engineSource());
  const turnStart = useRef(Date.now());
  // Bumped on every new game so a late bot reply can't land in the next one.
  const gameId = useRef(0);

  useEffect(() => onEngineSource(setSource), []);

  const game = useMemo(() => replay(ucis), [ucis]);
  const fen = game.fen();
  const turn = game.turn();
  const botColor = playerColor === 'w' ? 'b' : 'w';
  const history = useMemo(() => game.history({ verbose: true }), [game]);

  // ---- Result ---------------------------------------------------------------
  const result = useMemo(() => {
    if (resigned) return { winner: botColor, text: 'You resigned' };
    if (game.isCheckmate()) return { winner: turn === 'w' ? 'b' : 'w', text: 'Checkmate' };
    if (game.isStalemate()) return { winner: null, text: 'Draw by stalemate' };
    if (game.isInsufficientMaterial()) return { winner: null, text: 'Draw, insufficient material' };
    if (game.isThreefoldRepetition()) return { winner: null, text: 'Draw by repetition' };
    if (game.isDraw()) return { winner: null, text: 'Draw by the 50-move rule' };
    for (const c of ['w', 'b']) {
      if (clocks[c] <= 0) {
        const other = c === 'w' ? 'b' : 'w';
        return hasMatingMaterial(game, other) ? { winner: other, text: 'Won on time' } : { winner: null, text: 'Draw, timeout vs insufficient material' };
      }
    }
    return null;
  }, [game, turn, clocks, resigned, botColor]);
  const over = Boolean(result);
  const live = viewPly === null;

  useEffect(() => {
    if (over) setOverlay(true);
  }, [over]);

  // ---- Clock: runs for the side to move after the first move ----------------
  useEffect(() => {
    if (!started || over || ucis.length === 0) return undefined;
    const id = setInterval(() => setClocks((c) => ({ ...c, [turn]: c[turn] - 1 })), 1000);
    return () => clearInterval(id);
  }, [started, over, ucis.length, turn]);

  // ---- Applying moves -------------------------------------------------------
  const apply = useCallback(
    (uci) => {
      const spent = Math.round((Date.now() - turnStart.current) / 1000);
      turnStart.current = Date.now();
      setUcis((u) => [...u, uci]);
      setTimes((t) => [...t, spent]);
      setSelected(null);
    },
    [],
  );

  const tryMove = useCallback(
    (from, to) => {
      if (!live || over || thinking || turn !== playerColor) return false;
      const probe = new Chess(fen);
      let move;
      try {
        move = probe.move({ from, to, promotion: 'q' });
      } catch {
        return false;
      }
      if (!move) return false;
      if (!started) {
        // The opening move is untimed, like on Chess.com.
        turnStart.current = Date.now();
        setStarted(true);
      }
      apply(`${move.from}${move.to}${move.promotion ?? ''}`);
      return true;
    },
    [live, over, thinking, turn, playerColor, fen, started, apply],
  );

  // ---- Bot ------------------------------------------------------------------
  const askBot = useCallback(async () => {
    const myGame = gameId.current;
    setThinking(true);
    setBotError(null);
    const began = Date.now();
    try {
      const uci = await getBotMove({ fen, uciMoves: ucis });
      // A short pause so instant replies still feel like a move being played.
      const wait = Math.max(0, 700 - (Date.now() - began));
      await new Promise((r) => setTimeout(r, wait));
      if (myGame !== gameId.current) return;
      if (!uci) throw new Error('The bot returned no move.');
      apply(uci);
    } catch (e) {
      if (myGame === gameId.current) setBotError(e.message || 'The bot could not move.');
    } finally {
      if (myGame === gameId.current) setThinking(false);
    }
  }, [fen, ucis, apply]);

  useEffect(() => {
    if (started && live && !over && !thinking && !botError && turn === botColor) askBot();
  }, [started, live, over, thinking, botError, turn, botColor, askBot]);

  // ---- Controls -------------------------------------------------------------
  const newGame = () => {
    gameId.current += 1;
    setThinking(false);
    setUcis([]);
    setTimes([]);
    setClocks({ w: START_SECONDS, b: START_SECONDS });
    setResigned(false);
    setViewPly(null);
    setSelected(null);
    setBotError(null);
    setStarted(false);
    turnStart.current = Date.now();
  };

  const start = () => {
    turnStart.current = Date.now();
    setStarted(true);
  };

  const onPly = useCallback((p) => setViewPly(p >= ucis.length ? null : p), [ucis.length]);

  useEffect(() => {
    const onKey = (e) => {
      if (/input|textarea|select/i.test(e.target.tagName) || !ucis.length) return;
      const current = viewPly ?? ucis.length;
      const next = { ArrowLeft: current - 1, ArrowRight: current + 1, Home: 0, End: ucis.length }[e.key];
      if (next === undefined) return;
      e.preventDefault();
      onPly(Math.max(0, Math.min(ucis.length, next)));
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [viewPly, ucis.length, onPly]);

  // ---- Board state for the displayed ply --------------------------------------
  const shownGame = useMemo(() => (live ? game : replay(ucis, viewPly)), [live, game, ucis, viewPly]);
  const shownFen = shownGame.fen();
  const shownLast = live ? history.at(-1) : viewPly > 0 ? history[viewPly - 1] : null;

  const squareStyles = useMemo(() => {
    const styles = {};
    if (shownLast) {
      styles[shownLast.from] = SQUARE.lastMove;
      styles[shownLast.to] = SQUARE.lastMove;
    }
    if (shownGame.inCheck()) styles[kingSquares(shownFen)[shownGame.turn()]] = SQUARE.check;
    if (live && selected) {
      styles[selected] = SQUARE.selected;
      for (const m of game.moves({ square: selected, verbose: true })) styles[m.to] = m.captured ? SQUARE.capture : SQUARE.target;
    }
    return styles;
  }, [shownLast, shownGame, shownFen, live, selected, game]);

  const marks = useMemo(() => {
    if (!over || !live) return {};
    const k = kingSquares(fen);
    if (!result.winner) return { [k.w]: 'draw', [k.b]: 'draw' };
    return { [k[result.winner]]: 'win', [k[result.winner === 'w' ? 'b' : 'w']]: 'loss' };
  }, [over, live, fen, result]);

  const myTurn = live && !over && !thinking && turn === playerColor;
  const onSquareClick = useCallback(
    ({ square, piece }) => {
      if (!myTurn) return;
      if (piece && piece.pieceType[0] === playerColor) {
        setSelected((s) => (s === square ? null : square));
        return;
      }
      if (selected && !tryMove(selected, square)) setSelected(null);
    },
    [myTurn, playerColor, selected, tryMove],
  );
  const onPieceDrop = useCallback(({ sourceSquare, targetSquare }) => (targetSquare ? tryMove(sourceSquare, targetSquare) : false), [tryMove]);
  const canDragPiece = useCallback(({ piece }) => myTurn && piece.pieceType[0] === playerColor, [myTurn, playerColor]);

  // Captures and material balance.
  const taken = { w: [], b: [] };
  for (const m of history) if (m.captured) taken[m.color].push(m.captured);
  const material = (c) => taken[c].reduce((s, t) => s + VALUE[t], 0);
  const lead = { w: material('w') - material('b'), b: material('b') - material('w') };

  const strip = (color) => ({
    color,
    seconds: clocks[color],
    active: started && !over && turn === color,
    low: clocks[color] < 60,
    captured: taken[color],
    lead: lead[color],
  });
  const topColor = botColor;
  const bottomColor = playerColor;
  const youWon = result?.winner === playerColor;

  return (
    <Page seo={{ title: 'Play the chess bot', description: seoConfig.chessBot.description, keywords: seoConfig.chessBot.keywords }}>
      <header className="shell pb-10 pt-32 md:pt-40">
        <Reveal className="mb-8">
          <Link to="/hobbies/chess" className="group inline-flex items-center gap-2 font-mono text-xs uppercase tracking-[0.12em] text-ink-2 hover:text-ink">
            <FiArrowLeft className="transition-transform group-hover:-translate-x-1" /> Chess
          </Link>
        </Reveal>
        <LineReveal
          as="h1"
          animateOnMount
          lines={['Your move.']}
          className="font-display text-[clamp(3rem,9vw,7rem)] leading-[0.9] tracking-[-0.03em] text-ink"
        />
        <Reveal delay={0.2} className="mt-5 max-w-xl text-lg text-ink-2">
          A bot built to play in my style, on ten-minute clocks. Drag a piece or click to move; pawns promote to queens.
        </Reveal>
      </header>

      <section className="shell grid gap-8 lg:grid-cols-[minmax(0,1fr)_22rem]">
        {/* Board column */}
        <div className="mx-auto w-full max-w-[40rem] space-y-3">
          <PlayerStrip {...strip(topColor)} label="Bot" sub={topColor === 'w' ? 'White' : 'Black'} thinking={thinking} />
          <div className="relative">
            <Board
              id="bot-board"
              fen={shownFen}
              orientation={playerColor === 'w' ? 'white' : 'black'}
              squareStyles={squareStyles}
              marks={marks}
              interactive={myTurn}
              onPieceDrop={onPieceDrop}
              onSquareClick={onSquareClick}
              canDragPiece={canDragPiece}
            />
            {!live && (
              <button
                type="button"
                onClick={() => setViewPly(null)}
                className="absolute left-1/2 top-3 -translate-x-1/2 rounded-full bg-ink px-4 py-1.5 font-mono text-[0.68rem] uppercase tracking-[0.1em] text-bg shadow-lg"
              >
                Viewing move {viewPly} · back to live
              </button>
            )}
            <AnimatePresence>
              {over && overlay && live && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 grid place-items-center rounded-[14px] bg-bg/55 p-6 backdrop-blur-[2px]"
                >
                  <motion.div
                    initial={{ scale: 0.9, y: 20 }}
                    animate={{ scale: 1, y: 0 }}
                    transition={{ duration: 0.5, ease: EASE }}
                    className="relative w-full max-w-xs rounded-3xl border border-line bg-surface p-7 text-center shadow-2xl"
                  >
                    <button
                      type="button"
                      onClick={() => setOverlay(false)}
                      className="absolute right-3 top-3 grid h-8 w-8 place-items-center rounded-full text-ink-3 hover:bg-surface-2 hover:text-ink"
                      aria-label="Hide result"
                    >
                      <FiX />
                    </button>
                    <p className="eyebrow">{result.text}</p>
                    <p className="mt-3 font-display text-5xl text-ink">
                      {!result.winner ? 'Draw.' : youWon ? 'You win.' : 'Bot wins.'}
                    </p>
                    <button
                      type="button"
                      onClick={newGame}
                      className="mt-6 inline-flex h-11 items-center gap-2 rounded-full bg-ink px-6 font-mono text-xs uppercase tracking-[0.1em] text-bg transition-colors hover:bg-up hover:text-on-up"
                    >
                      <FiRotateCcw /> Play again
                    </button>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          <PlayerStrip {...strip(bottomColor)} label="You" sub={bottomColor === 'w' ? 'White' : 'Black'} />
        </div>

        {/* Side panel */}
        <aside className="flex min-h-0 flex-col gap-4 lg:max-h-[46rem]">
          <div className="rounded-3xl border border-line p-5">
            <p className="eyebrow mb-3">Status</p>
            <p className="font-display text-3xl leading-tight text-ink">
              {over
                ? result.text
                : !started
                  ? 'Ready when you are'
                  : thinking
                    ? 'Bot is thinking…'
                    : turn === playerColor
                      ? 'Your move'
                      : 'Bot to move'}
            </p>
            <p className="mt-3 flex items-center gap-2 text-xs text-ink-3">
              {source === 'down' ? <FiCpu /> : <FiServer />}
              {source === 'down'
                ? 'Playing the built-in engine (the bot server is offline).'
                : source === 'up'
                  ? 'Playing the style model on the bot server.'
                  : 'Connects to the bot server on the first move, with a built-in engine as backup.'}
            </p>
            {botError && (
              <div className="mt-4 flex items-center justify-between gap-3 rounded-2xl bg-red-500/10 px-4 py-3 text-sm text-red-500">
                <span>{botError}</span>
                <button type="button" onClick={() => setBotError(null)} className="inline-flex items-center gap-1 font-medium underline">
                  <FiRefreshCw /> Retry
                </button>
              </div>
            )}
          </div>

          <div className="rounded-3xl border border-line p-5">
            {!started ? (
              <>
                <p className="eyebrow mb-3">Play as</p>
                <FilterTabs
                  id="bot-color"
                  value={playerColor}
                  onChange={setPlayerColor}
                  options={[
                    { value: 'w', label: 'White' },
                    { value: 'b', label: 'Black' },
                  ]}
                />
                <button
                  type="button"
                  onClick={start}
                  className="mt-4 flex h-12 w-full items-center justify-center rounded-full bg-ink font-mono text-xs uppercase tracking-[0.12em] text-bg transition-colors hover:bg-up hover:text-on-up"
                >
                  Start game
                </button>
                {playerColor === 'w' && <p className="mt-3 text-center text-xs text-ink-3">…or just make your first move.</p>}
              </>
            ) : (
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={newGame}
                  className="flex h-11 flex-1 items-center justify-center gap-2 rounded-full border border-line-strong text-sm text-ink transition-colors hover:border-ink"
                >
                  <FiRotateCcw /> New game
                </button>
                {!over && (
                  <button
                    type="button"
                    onClick={() => setResigned(true)}
                    className="flex h-11 flex-1 items-center justify-center gap-2 rounded-full border border-line-strong text-sm text-ink-2 transition-colors hover:border-red-500 hover:text-red-500"
                  >
                    <FiFlag /> Resign
                  </button>
                )}
              </div>
            )}
          </div>

          <MoveList
            sans={history.map((m) => m.san)}
            ply={viewPly ?? ucis.length}
            onPly={onPly}
            times={times}
            latestLabel="Live position"
            className="min-h-[14rem] flex-1"
          />
        </aside>
      </section>
    </Page>
  );
}

export default ChessBotPage;
