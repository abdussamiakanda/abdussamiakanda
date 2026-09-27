import { motion, useReducedMotion } from 'motion/react';

// A 4×4 board corner with a knight touring in legal L-shaped hops. Pure SVG
// (no chess library) so it can sit on the home page cheaply.
const N = 4;
const CELL = 25;
// Each step is a knight move: (1,-2), (2,-1), (-1,2), (-2,1) — back to start.
const TOUR = [
  [0, 3],
  [1, 1],
  [3, 0],
  [2, 2],
  [0, 3],
];

// Stylised knight silhouette in a 45×45 box.
const KNIGHT =
  'M14 38h19l-1-4c-1-5-2-9-1-14 1-6-3-11-9-12l-1-3-3 3-2-2-1 4c-3 2-6 7-7 11-1 3 1 5 3 4l2-2c2 1 4 0 6-2-2 5-6 8-6 13z';

export default function ChessCardArt({ className = '' }) {
  const reduced = useReducedMotion();
  const xs = TOUR.map(([c]) => c * CELL);
  const ys = TOUR.map(([, r]) => r * CELL);

  return (
    <svg viewBox={`0 0 ${N * CELL} ${N * CELL}`} className={className} role="img" aria-label="A knight hopping across a chessboard">
      <defs>
        <clipPath id="card-board-clip">
          <rect width={N * CELL} height={N * CELL} rx="8" />
        </clipPath>
      </defs>
      <g clipPath="url(#card-board-clip)">
        {Array.from({ length: N * N }, (_, i) => {
          const c = i % N;
          const r = Math.floor(i / N);
          return <rect key={i} x={c * CELL} y={r * CELL} width={CELL} height={CELL} fill={(c + r) % 2 ? 'var(--board-dark)' : 'var(--board-light)'} />;
        })}
        {/* Squares the knight visits. */}
        {TOUR.slice(0, -1).map(([c, r], i) => (
          <circle key={i} cx={c * CELL + CELL / 2} cy={r * CELL + CELL / 2} r="2.4" fill="var(--up)" opacity="0.55" />
        ))}
      </g>
      <motion.g
        initial={false}
        animate={reduced ? { x: xs[0], y: ys[0] } : { x: xs, y: ys }}
        transition={reduced ? { duration: 0 } : { duration: 6, times: [0, 0.25, 0.5, 0.75, 1], ease: 'easeInOut', repeat: Infinity, repeatDelay: 0.6 }}
      >
        <motion.g
          animate={reduced ? {} : { y: [0, -6, 0, -6, 0, -6, 0, -6, 0] }}
          transition={{ duration: 6, times: [0, 0.125, 0.25, 0.375, 0.5, 0.625, 0.75, 0.875, 1], repeat: Infinity, repeatDelay: 0.6 }}
        >
          {/* The path spans x 7–33, y 5–38; scale it to ~22 units and centre it in the square. */}
          <g transform="translate(-0.7 -1.7) scale(0.66)">
            <path d={KNIGHT} fill="#141d19" stroke="#eef3ef" strokeWidth="1.6" strokeLinejoin="round" />
            <circle cx="16" cy="15" r="1.4" fill="#eef3ef" />
          </g>
        </motion.g>
      </motion.g>
    </svg>
  );
}
