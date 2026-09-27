import { useMemo } from 'react';
import { Chessboard } from 'react-chessboard';
import { FaCrown } from 'react-icons/fa';
import { FiX } from 'react-icons/fi';

const BADGE = {
  win: { className: 'bg-up text-on-up', icon: <FaCrown />, label: 'Winner' },
  loss: { className: 'bg-red-500 text-white', icon: <FiX />, label: 'Lost' },
  draw: { className: 'bg-ink-3 text-bg', icon: <span className="font-mono text-[0.6rem] font-bold">½</span>, label: 'Draw' },
};

/**
 * Themed wrapper around react-chessboard.
 * - `marks`: { e1: 'win' | 'loss' | 'draw' } badges drawn on king squares.
 * - `interactive`: enables dragging; pair with onPieceDrop / onSquareClick.
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
  className = '',
}) {
  const options = useMemo(
    () => ({
      id,
      position: fen,
      boardOrientation: orientation,
      allowDragging: interactive,
      allowDrawingArrows: false,
      arrows,
      onPieceDrop,
      onSquareClick,
      canDragPiece,
      squareStyles,
      animationDurationInMs: 180,
      boardStyle: { borderRadius: '14px', overflow: 'hidden' },
      darkSquareStyle: { backgroundColor: 'var(--board-dark)' },
      lightSquareStyle: { backgroundColor: 'var(--board-light)' },
      darkSquareNotationStyle: { color: 'var(--board-light)', fontFamily: 'var(--font-mono)', fontWeight: 600 },
      lightSquareNotationStyle: { color: 'var(--board-dark)', fontFamily: 'var(--font-mono)', fontWeight: 600 },
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

  return (
    <div className={`aspect-square w-full select-none overflow-hidden rounded-[14px] shadow-2xl shadow-black/20 ring-1 ring-line ${className}`}>
      <Chessboard options={options} />
    </div>
  );
}
