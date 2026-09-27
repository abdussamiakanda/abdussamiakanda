import { useCallback, useEffect, useMemo, useState } from 'react';
import { Chess } from 'chess.js';
import Board from './Board';
import EvalBar from './EvalBar';
import MoveList from './MoveList';
import { SQUARE } from '../../lib/chess/squares';
import useMoveKeys from '../../lib/chess/useMoveKeys';

/**
 * Step-through viewer for a finished game.
 * - `moves`: verbose chess.js moves.
 * - `resultMarks(fen)`: badges for the final position, e.g. from the result.
 * - `keys`: 'window' listens globally (one replay per page); 'focus' only
 *   while the viewer has focus (several games in one article).
 */
export default function GameReplay({ id, moves, orientation = 'white', resultMarks, keys = 'focus', startAtEnd = true, top, bottom }) {
  const [ply, setPly] = useState(startAtEnd ? moves.length : 0);
  useEffect(() => setPly(startAtEnd ? moves.length : 0), [moves, startAtEnd]);

  // Precompute every position once; stepping is then just an index.
  const fens = useMemo(() => {
    const game = new Chess();
    const out = [game.fen()];
    for (const m of moves) {
      game.move(m.san);
      out.push(game.fen());
    }
    return out;
  }, [moves]);

  const fen = fens[Math.min(ply, fens.length - 1)];
  const last = ply > 0 ? moves[ply - 1] : null;
  const sans = useMemo(() => moves.map((m) => m.san), [moves]);

  const squareStyles = useMemo(() => {
    const styles = {};
    if (last) {
      styles[last.from] = SQUARE.lastMove;
      styles[last.to] = SQUARE.lastMove;
    }
    return styles;
  }, [last]);

  const marks = useMemo(() => (ply === moves.length && resultMarks ? resultMarks(fen) : {}), [ply, moves.length, resultMarks, fen]);

  const onPly = useCallback((p) => setPly(p), []);
  useMoveKeys(ply, moves.length, onPly, keys === 'window');

  const onKeyDown = (e) => {
    if (keys !== 'focus') return;
    const next = { ArrowLeft: ply - 1, ArrowRight: ply + 1, Home: 0, End: moves.length }[e.key];
    if (next === undefined) return;
    e.preventDefault();
    setPly(Math.max(0, Math.min(moves.length, next)));
  };

  return (
    <div
      tabIndex={keys === 'focus' ? 0 : undefined}
      onKeyDown={onKeyDown}
      className="grid gap-5 rounded-3xl outline-none focus-visible:ring-2 focus-visible:ring-up lg:grid-cols-[minmax(0,1fr)_17rem]"
      aria-label={keys === 'focus' ? 'Game viewer. Use the arrow keys to step through moves.' : undefined}
    >
      <div className="min-w-0">
        {top}
        <div className="flex gap-3">
          <EvalBar fen={fen} flipped={orientation === 'black'} />
          <div className="min-w-0 flex-1">
            <Board id={id} fen={fen} orientation={orientation} squareStyles={squareStyles} marks={marks} />
          </div>
        </div>
        {bottom}
      </div>
      {/* On wide screens the list fills the board's height and scrolls inside it. */}
      <div className="relative">
        <MoveList sans={sans} ply={ply} onPly={onPly} className="max-h-[26rem] lg:absolute lg:inset-0 lg:max-h-none" />
      </div>
    </div>
  );
}
