import { useMemo } from 'react';
import { Chessboard, defaultPieces } from 'react-chessboard';
import { FaCrown } from 'react-icons/fa';
import { FiX } from 'react-icons/fi';

const BADGE = {
  win: { className: 'bg-up text-on-up', icon: <FaCrown />, label: 'Winner' },
  loss: { className: 'bg-red-500 text-white', icon: <FiX />, label: 'Lost' },
  draw: { className: 'bg-ink-3 text-bg', icon: <span className="font-mono text-[0.6rem] font-bold">½</span>, label: 'Draw' },
};

const FILES = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
const RANKS = ['8', '7', '6', '5', '4', '3', '2', '1'];

// Squares get a faint diagonal sheen so the board reads as a polished surface
// rather than flat fills.
const LIGHT = { background: 'linear-gradient(135deg, var(--board-light) 0%, var(--board-light-2) 100%)' };
const DARK = { background: 'linear-gradient(135deg, var(--board-dark) 0%, var(--board-dark-2) 100%)' };

// The default set, each piece with a soft contact shadow so it sits on the
// board instead of being printed on it.
const PIECE_SHADOW = 'drop-shadow(0 1.5px 1px rgba(0, 0, 0, 0.32)) drop-shadow(0 4px 6px rgba(0, 0, 0, 0.16))';
const PIECES = Object.fromEntries(
  Object.entries(defaultPieces).map(([key, render]) => [
    key,
    (props) => render({ ...props, svgStyle: { ...props?.svgStyle, filter: PIECE_SHADOW } }),
  ]),
);

/**
 * Framed, themed wrapper around react-chessboard.
 * - `marks`: { e1: 'win' | 'loss' | 'draw' } badges drawn on king squares.
 * - `interactive`: enables dragging; pair with onPieceDrop / onSquareClick.
 * - `aside`: rendered inside the frame, left of the board (the eval bar).
 */
export default function Board({
  id,
  fen,
  orientation = 'white',
  squareStyles = {},
  marks = {},
  arrows = [],
  interactive = false,
  onPieceDrop,
  onSquareClick,
  canDragPiece,
  aside = null,
  className = '',
}) {
  const files = orientation === 'white' ? FILES : [...FILES].reverse();
  const ranks = orientation === 'white' ? RANKS : [...RANKS].reverse();

  const options = useMemo(
    () => ({
      id,
      position: fen,
      pieces: PIECES,
      boardOrientation: orientation,
      allowDragging: interactive,
      allowDrawingArrows: false,
      arrows,
      onPieceDrop,
      onSquareClick,
      canDragPiece,
      squareStyles,
      showNotation: false,
      animationDurationInMs: 220,
      boardStyle: { borderRadius: '6px', overflow: 'hidden' },
      darkSquareStyle: DARK,
      lightSquareStyle: LIGHT,
      dropSquareStyle: { boxShadow: 'inset 0 0 0 3px color-mix(in srgb, var(--up) 85%, transparent)' },
      draggingPieceStyle: { transform: 'scale(1.14)', filter: 'drop-shadow(0 10px 12px rgba(0, 0, 0, 0.35))', cursor: 'grabbing' },
      draggingPieceGhostStyle: { opacity: 0.28 },
      squareRenderer: ({ square, children }) => {
        const mark = marks[square];
        if (!mark) return undefined; // fall back to the library's square
        const badge = BADGE[mark];
        return (
          <div style={{ width: '100%', height: '100%', position: 'relative', ...squareStyles[square] }}>
            {children}
            <span
              title={badge.label}
              className={`absolute right-[6%] top-[6%] z-10 grid h-[34%] w-[34%] place-items-center rounded-full text-[0.7rem] shadow-lg ring-2 ring-[var(--board-light)] ${badge.className}`}
            >
              {badge.icon}
            </span>
          </div>
        );
      },
    }),
    [id, fen, orientation, arrows, interactive, onPieceDrop, onSquareClick, canDragPiece, squareStyles, marks],
  );

  const coord = 'select-none font-mono text-[0.58rem] font-medium tracking-[0.12em] text-[var(--board-coord)] sm:text-[0.64rem]';

  return (
    <div
      className={`relative w-full rounded-[22px] p-2 sm:p-2.5 ${className}`}
      style={{
        background: 'linear-gradient(160deg, var(--board-frame) 0%, var(--board-frame-2) 100%)',
        boxShadow:
          'inset 0 1px 0 rgba(255, 255, 255, 0.07), inset 0 0 0 1px rgba(255, 255, 255, 0.04), 0 1px 2px rgba(0, 0, 0, 0.2), 0 24px 48px -18px rgba(0, 0, 0, 0.55)',
      }}
    >
      <div
        className={`grid grid-rows-[minmax(0,1fr)_auto] gap-x-1.5 sm:gap-x-2 ${
          aside ? 'grid-cols-[auto_auto_minmax(0,1fr)]' : 'grid-cols-[auto_minmax(0,1fr)]'
        }`}
      >
        {/* Eval bar, when given, runs the height of the board. */}
        {aside && <div className="flex">{aside}</div>}

        {/* Rank numbers down the left edge. */}
        <div className="grid grid-rows-8 pr-0.5" aria-hidden="true">
          {ranks.map((r) => (
            <span key={r} className={`${coord} flex items-center justify-center`}>
              {r}
            </span>
          ))}
        </div>

        {/* The board, inset into the frame, with a sheen and edge shading on top. */}
        <div className="relative aspect-square min-w-0 select-none rounded-[6px] shadow-[0_0_0_1px_rgba(0,0,0,0.45),0_2px_6px_rgba(0,0,0,0.35)]">
          <Chessboard options={options} />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 rounded-[6px]"
            style={{
              background: 'linear-gradient(155deg, rgba(255, 255, 255, 0.10) 0%, rgba(255, 255, 255, 0) 38%, rgba(0, 0, 0, 0) 62%, rgba(0, 0, 0, 0.10) 100%)',
              boxShadow: 'inset 0 0 0 1px rgba(255, 255, 255, 0.06), inset 0 0 18px rgba(0, 0, 0, 0.18)',
            }}
          />
        </div>

        {/* File letters along the bottom edge. */}
        <div className={`grid grid-cols-8 pt-1 ${aside ? 'col-start-3' : 'col-start-2'}`} aria-hidden="true">
          {files.map((f) => (
            <span key={f} className={`${coord} text-center`}>
              {f}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
